package pe.demo.onboarding;

import static io.restassured.RestAssured.given;
import static org.hamcrest.CoreMatchers.containsString;
import static org.hamcrest.CoreMatchers.is;
import static org.hamcrest.CoreMatchers.not;
import static org.hamcrest.Matchers.hasKey;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.doThrow;
import static org.mockito.ArgumentMatchers.any;

import io.quarkus.narayana.jta.QuarkusTransaction;
import io.quarkus.test.InjectMock;
import io.quarkus.test.junit.QuarkusTest;
import io.quarkus.test.junit.mockito.InjectSpy;
import java.time.Instant;
import java.util.List;
import java.util.UUID;
import io.restassured.response.Response;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;

@QuarkusTest
class OnboardingResourceTest {
    @InjectMock
    OtpDelivery otpDelivery;

    @jakarta.inject.Inject
    OtpChallengeRepository otpChallenges;

    @jakarta.inject.Inject
    CredentialHasher credentialHasher;

    @jakarta.inject.Inject
    CustomerRepository customers;

    @jakarta.inject.Inject
    WalletRepository wallets;

    @InjectSpy
    WalletMovementRepository movements;

    @jakarta.inject.Inject
    OnboardingEventRepository events;

    @Test
    void startsAndReturnsProtectedPendingStatusWithoutLookupData() {
        String email = "persona@example.test";
        Response started = start("11111111", email);
        String requestId = started.jsonPath().getString("requestId");
        String token = started.jsonPath().getString("trackingToken");

        started.then()
                .statusCode(202)
                .body("status", is("OTP_PENDING"))
                .body("message", is("Ingresa el código enviado a tu correo."))
                .body("$", not(hasKey("customer")))
                .body("trackingToken", not(is("")));

        given()
                .header("Authorization", "Bearer " + token)
                .when().get("/onboarding-requests/{requestId}/status", requestId)
                .then()
                .statusCode(200)
                .body("requestId", is(requestId))
                .body("status", is("OTP_PENDING"))
                .body("nextStep", is("ENTER_OTP"))
                .body("$", not(hasKey("email")))
                .body("$", not(hasKey("documentNumber")));
        verify(otpDelivery).send(eq(email), org.mockito.ArgumentMatchers.anyString());
    }

    @Test
    void usesDniAndPassportFixturesWithoutRevealingMissingLookupResults() {
        Response dni = start("DNI", "11111111", "dni@example.test");
        Response passport = start("PASSPORT", "P0000001", "passport@example.test");
        Response missing = start("DNI", "99999999", "missing@example.test");

        for (Response response : new Response[] { dni, passport, missing }) {
            response.then()
                    .statusCode(202)
                    .body("status", is("OTP_PENDING"))
                    .body("message", is("Ingresa el código enviado a tu correo."))
                    .body("$", not(hasKey("customer")))
                    .body("$", not(hasKey("documentNumber")));
        }

        String missingId = missing.jsonPath().getString("requestId");
        String missingToken = missing.jsonPath().getString("trackingToken");
        ArgumentCaptor<String> otpCaptor = ArgumentCaptor.forClass(String.class);
        verify(otpDelivery, times(3)).send(anyString(), otpCaptor.capture());
        String issuedCode = otpCaptor.getAllValues().get(2);

        given()
                .header("Authorization", "Bearer " + missingToken)
                .contentType("application/json")
                .body("{\"code\":\"" + issuedCode + "\"}")
                .when().post("/onboarding-requests/{requestId}/otp/verify", missingId)
                .then()
                .statusCode(200)
                .body("status", is("OTP_VERIFIED"))
                .body("nextStep", is("CREATE_PIN"));

        Response cannotComplete = given()
                .header("Authorization", "Bearer " + missingToken)
                .contentType("application/json")
                .body("{\"pin\":\"2468\"}")
                .when().post("/onboarding-requests/{requestId}/complete", missingId);
        cannotComplete.then()
                .statusCode(422)
                .body("code", is("ONBOARDING_NOT_COMPLETABLE"))
                .body("message", is("No se pudo completar el registro."));
        Assertions.assertFalse(cannotComplete.asString().contains("99999999"));
        Assertions.assertFalse(cannotComplete.asString().contains("missing@example.test"));
        UUID missingRequestId = UUID.fromString(missingId);
        Assertions.assertNull(customers.findByRequest(missingRequestId));
        Assertions.assertEquals(0, wallets.count("customer.request.id", missingRequestId));
    }

    @Test
    void blocksOtpAfterThreeIncorrectAttempts() {
        Response started = start("11111111", "otp-attempts@example.test");
        String requestId = started.jsonPath().getString("requestId");
        String token = started.jsonPath().getString("trackingToken");
        String issuedCode = issuedCode();
        String incorrectCode = issuedCode.equals("0000") ? "0001" : "0000";

        verifyOtp(requestId, token, incorrectCode)
                .then().statusCode(422).body("code", is("INVALID_OTP"));
        verifyOtp(requestId, token, incorrectCode)
                .then().statusCode(422).body("code", is("INVALID_OTP"));
        verifyOtp(requestId, token, incorrectCode)
                .then()
                .statusCode(429)
                .body("code", is("ATTEMPTS_EXHAUSTED"))
                .body("message", is("Agotaste tus intentos permitidos."));
        verifyOtp(requestId, token, issuedCode)
                .then().statusCode(429).body("code", is("ATTEMPTS_EXHAUSTED"));

        given()
                .header("Authorization", "Bearer " + token)
                .when().get("/onboarding-requests/{requestId}/status", requestId)
                .then().statusCode(200).body("status", is("OTP_PENDING"));
    }

    @Test
    void rejectsExpiredOtpWithoutRevealingTheExpirationReason() {
        Response started = start("11111111", "otp-expired@example.test");
        String requestId = started.jsonPath().getString("requestId");
        String token = started.jsonPath().getString("trackingToken");
        String issuedCode = issuedCode();
        OtpChallengeEntity challenge = otpChallenges.findById(UUID.fromString(requestId));
        Assertions.assertNotNull(challenge);
        Assertions.assertEquals(32, challenge.credentialHash.length);
        Assertions.assertEquals(16, challenge.credentialSalt.length);
        Assertions.assertTrue(credentialHasher.matches(
                challenge.credentialHash, challenge.credentialSalt, issuedCode));

        QuarkusTransaction.requiringNew().run(() -> {
            OtpChallengeEntity expiringChallenge = otpChallenges.findById(UUID.fromString(requestId));
            expiringChallenge.expiresAt = Instant.now().minusSeconds(1);
        });

        verifyOtp(requestId, token, issuedCode)
                .then()
                .statusCode(422)
                .body("code", is("INVALID_OTP"))
                .body("message", is("El código no es válido o venció."));
    }

    @Test
    void rejectsReusingAnOtpAfterItHasBeenVerified() {
        Response started = start("11111111", "otp-reuse@example.test");
        String requestId = started.jsonPath().getString("requestId");
        String token = started.jsonPath().getString("trackingToken");
        String issuedCode = issuedCode();

        verifyOtp(requestId, token, issuedCode)
                .then().statusCode(200).body("status", is("OTP_VERIFIED"));
        verifyOtp(requestId, token, issuedCode)
                .then().statusCode(422).body("code", is("INVALID_OTP"));
        given()
                .header("Authorization", "Bearer " + token)
                .when().get("/onboarding-requests/{requestId}/status", requestId)
                .then().statusCode(200).body("status", is("OTP_VERIFIED"));
    }

    @Test
    void rejectsInvalidPinsWithoutCreatingCustomerOrWallet() {
        Response started = start("11111111", "invalid-pin@example.test");
        String requestId = started.jsonPath().getString("requestId");
        String token = started.jsonPath().getString("trackingToken");
        verifyOtp(requestId, token, issuedCode()).then().statusCode(200);

        for (String pin : List.of("", "12a4", "123", "12345")) {
            complete(requestId, token, pin)
                    .then().statusCode(400).body("code", is("INVALID_INPUT"));
        }

        UUID id = UUID.fromString(requestId);
        Assertions.assertNull(customers.findByRequest(id));
        Assertions.assertEquals(0, wallets.count("customer.request.id", id));
        given()
                .header("Authorization", "Bearer " + token)
                .when().get("/onboarding-requests/{requestId}/status", requestId)
                .then().statusCode(200).body("status", is("OTP_VERIFIED"));
    }

    @Test
    void completingTwiceCreatesOnlyOneCustomerWalletAndInitialCredit() {
        Response started = start("11111111", "idempotent@example.test");
        String requestId = started.jsonPath().getString("requestId");
        String token = started.jsonPath().getString("trackingToken");
        verifyOtp(requestId, token, issuedCode()).then().statusCode(200);

        Response firstCompletion = complete(requestId, token);
        Response retry = complete(requestId, token);
        firstCompletion.then()
                .statusCode(201)
                .body("status", is("ACTIVE"))
                .body("customer.firstName", is("Persona"))
                .body("customer.lastName", is("Sintética"))
                .body("wallet.currency", is("PEN"))
                .body("wallet.balanceMinorUnits", is(10_000));
        retry.then()
                .statusCode(201)
                .body("status", is("ACTIVE"))
                .body("wallet.balanceMinorUnits", is(10_000));

        UUID id = UUID.fromString(requestId);
        CustomerEntity customer = customers.findByRequest(id);
        Assertions.assertNotNull(customer);
        Assertions.assertEquals(1, customers.count("request.id", id));
        Assertions.assertEquals(1, wallets.count("customer.id", customer.id));
        Assertions.assertEquals(1, movements.count("idempotencyKey", "onboarding:" + requestId));
    }

    @Test
    void rollsBackCustomerAndWalletWhenInitialCreditPersistenceFails() {
        Response started = start("11111111", "rollback@example.test");
        String requestId = started.jsonPath().getString("requestId");
        String token = started.jsonPath().getString("trackingToken");
        verifyOtp(requestId, token, issuedCode()).then().statusCode(200);
        doThrow(new IllegalStateException("simulated persistence failure"))
                .when(movements).persist(any(WalletMovementEntity.class));

        complete(requestId, token).then().statusCode(500);

        UUID id = UUID.fromString(requestId);
        Assertions.assertNull(customers.findByRequest(id));
        Assertions.assertEquals(0, wallets.count("customer.request.id", id));
        Assertions.assertEquals(0, movements.count("idempotencyKey", "onboarding:" + requestId));
        given()
                .header("Authorization", "Bearer " + token)
                .when().get("/onboarding-requests/{requestId}/status", requestId)
                .then().statusCode(200).body("status", is("OTP_VERIFIED"));
    }

    @Test
    void recordsOnlyOpaqueOnboardingEventsWithoutSensitiveMarkers() {
        String emailMarker = "event-private-marker@example.test";
        Response started = start("PASSPORT", "P0000001", emailMarker);
        String requestId = started.jsonPath().getString("requestId");
        String token = started.jsonPath().getString("trackingToken");
        String code = issuedCode();
        verifyOtp(requestId, token, code).then().statusCode(200);
        complete(requestId, token).then().statusCode(201);

        List<OnboardingEventEntity> recorded = events.find("requestId", UUID.fromString(requestId)).list();
        Assertions.assertEquals(4, recorded.size());
        List<String> eventDetails = recorded.stream()
                .map(event -> event.requestId + "|" + event.eventType + "|" + event.step + "|" + event.occurredAt)
                .toList();
        Assertions.assertTrue(eventDetails.stream().anyMatch(detail -> detail.contains("ONBOARDING_STARTED|DATA")));
        Assertions.assertTrue(eventDetails.stream().anyMatch(detail -> detail.contains("STEP_COMPLETED|OTP")));
        Assertions.assertTrue(eventDetails.stream().anyMatch(detail -> detail.contains("STEP_COMPLETED|PIN")));
        Assertions.assertTrue(eventDetails.stream().anyMatch(detail -> detail.contains("ONBOARDING_CLOSED|COMPLETE")));
        Assertions.assertTrue(recorded.stream().allMatch(event -> event.id != null && event.occurredAt != null));
        Assertions.assertTrue(eventDetails.stream().noneMatch(detail ->
                detail.contains(emailMarker)
                        || detail.contains("11111111")
                        || detail.contains(code)
                        || detail.contains("2468")
                        || detail.contains(token)
                        || detail.contains("Persona")
                        || detail.contains("Sintética")));
    }

    @Test
    void rejectsMissingOrInvalidTrackingTokensAndUnknownRequestsSafely() {
        Response started = start("11111111", "auth@example.test");
        String requestId = started.jsonPath().getString("requestId");

        given()
                .when().get("/onboarding-requests/{requestId}/status", requestId)
                .then()
                .statusCode(401)
                .body("code", is("UNAUTHORIZED"));

        given()
                .header("Authorization", "Bearer wrong-token")
                .when().get("/onboarding-requests/{requestId}/status", requestId)
                .then()
                .statusCode(401)
                .body("code", is("UNAUTHORIZED"));

        given()
                .header("Authorization", "Bearer wrong-token")
                .when().get("/onboarding-requests/{requestId}/status",
                        "00000000-0000-0000-0000-000000000001")
                .then()
                .statusCode(404)
                .body("code", is("REQUEST_NOT_FOUND"));
    }

    @Test
    void returnsGenericValidationErrorsWithoutEchoingSubmittedValues() {
        given()
                .contentType("application/json")
                .body("""
                        {
                          "documentType": "DNI",
                          "documentNumber": "11111111",
                          "email": "private-marker-not-an-email"
                        }
                        """)
                .when().post("/onboarding-requests")
                .then()
                .statusCode(400)
                .body("code", is("INVALID_INPUT"))
                .body("message", is("Revisa los datos ingresados."))
                .body("message", not(containsString("private-marker")));
    }

    @Test
    void blocksCompletionUntilOtpIsVerified() {
        Response started = start("11111111", "pending@example.test");
        String requestId = started.jsonPath().getString("requestId");
        String token = started.jsonPath().getString("trackingToken");

        given()
                .header("Authorization", "Bearer " + token)
                .contentType("application/json")
                .body("{\"pin\":\"2468\"}")
                .when().post("/onboarding-requests/{requestId}/complete", requestId)
                .then()
                .statusCode(409)
                .body("code", is("INVALID_STATE"));

        given()
                .header("Authorization", "Bearer " + token)
                .when().get("/onboarding-requests/{requestId}/status", requestId)
                .then()
                .statusCode(200)
                .body("status", is("OTP_PENDING"));
    }

    @Test
    void exposesOpenApiForTheOnboardingContract() {
        Response response = given().when().get("/q/openapi");
        response.then().statusCode(200);
        String openApi = response.asString();
        for (String contractElement : List.of(
                "/api/v1/onboarding-requests",
                "/api/v1/onboarding-requests/{requestId}/status",
                "/api/v1/onboarding-requests/{requestId}/otp/verify",
                "/api/v1/onboarding-requests/{requestId}/complete",
                "documentType",
                "documentNumber",
                "trackingToken",
                "nextStep",
                "code",
                "pin",
                "balanceMinorUnits",
                "202",
                "201",
                "401",
                "409",
                "422",
                "429")) {
            Assertions.assertTrue(openApi.contains(contractElement), "OpenAPI is missing " + contractElement);
        }
        Assertions.assertFalse(openApi.contains("/otp/resend"));
    }

    private Response start(String documentNumber, String email) {
        return start("DNI", documentNumber, email);
    }

    private Response start(String documentType, String documentNumber, String email) {
        return given()
                .contentType("application/json")
                .body("""
                        {
                          "documentType": "%s",
                          "documentNumber": "%s",
                          "email": "%s"
                        }
                        """.formatted(documentType, documentNumber, email))
                .when().post("/onboarding-requests");
    }

    private String issuedCode() {
        ArgumentCaptor<String> otpCaptor = ArgumentCaptor.forClass(String.class);
        verify(otpDelivery).send(anyString(), otpCaptor.capture());
        return otpCaptor.getValue();
    }

    private Response verifyOtp(String requestId, String token, String code) {
        return given()
                .header("Authorization", "Bearer " + token)
                .contentType("application/json")
                .body("{\"code\":\"" + code + "\"}")
                .when().post("/onboarding-requests/{requestId}/otp/verify", requestId);
    }

    private Response complete(String requestId, String token) {
        return complete(requestId, token, "2468");
    }

    private Response complete(String requestId, String token, String pin) {
        return given()
                .header("Authorization", "Bearer " + token)
                .contentType("application/json")
                .body("{\"pin\":\"" + pin + "\"}")
                .when().post("/onboarding-requests/{requestId}/complete", requestId);
    }
}
