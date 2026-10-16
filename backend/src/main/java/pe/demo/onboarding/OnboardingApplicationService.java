package pe.demo.onboarding;

import static pe.demo.onboarding.OnboardingDtos.CompleteResponse;
import static pe.demo.onboarding.OnboardingDtos.CustomerResponse;
import static pe.demo.onboarding.OnboardingDtos.DocumentType;
import static pe.demo.onboarding.OnboardingDtos.RequestStatus;
import static pe.demo.onboarding.OnboardingDtos.StartRequest;
import static pe.demo.onboarding.OnboardingDtos.StartResponse;
import static pe.demo.onboarding.OnboardingDtos.StatusResponse;
import static pe.demo.onboarding.OnboardingDtos.WalletResponse;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.transaction.Transactional;
import java.security.SecureRandom;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Locale;
import java.util.UUID;
import pe.demo.onboarding.OnboardingDtos.CompleteRequest;
import pe.demo.onboarding.OnboardingDtos.OtpRequest;

@ApplicationScoped
public class OnboardingApplicationService {
    private static final int MAX_OTP_ATTEMPTS = 3;
    private static final long INITIAL_BALANCE_MINOR_UNITS = 10_000;
    private static final SecureRandom RANDOM = new SecureRandom();

    private final DemoPersonRepository people;
    private final OnboardingRequestRepository requests;
    private final OtpChallengeRepository otpChallenges;
    private final CustomerRepository customers;
    private final WalletRepository wallets;
    private final WalletMovementRepository movements;
    private final CredentialHasher hasher;
    private final OtpDelivery otpDelivery;
    private final OnboardingEventService eventService;

    public OnboardingApplicationService(
            DemoPersonRepository people,
            OnboardingRequestRepository requests,
            OtpChallengeRepository otpChallenges,
            CustomerRepository customers,
            WalletRepository wallets,
            WalletMovementRepository movements,
            CredentialHasher hasher,
            OtpDelivery otpDelivery,
            OnboardingEventService eventService) {
        this.people = people;
        this.requests = requests;
        this.otpChallenges = otpChallenges;
        this.customers = customers;
        this.wallets = wallets;
        this.movements = movements;
        this.hasher = hasher;
        this.otpDelivery = otpDelivery;
        this.eventService = eventService;
    }

    @Transactional
    public StartResponse start(StartRequest input) {
        UUID requestId = UUID.randomUUID();
        String trackingToken = hasher.newTrackingToken();
        Instant now = Instant.now();
        String code = String.format(Locale.ROOT, "%04d", RANDOM.nextInt(10_000));

        OnboardingRequestEntity request = new OnboardingRequestEntity();
        request.id = requestId;
        request.trackingTokenHash = hasher.trackingTokenHash(trackingToken);
        request.documentType = input.documentType();
        request.documentNumber = input.documentNumber().trim();
        request.email = input.email().trim();
        request.person = people.findByDocument(input.documentType(), request.documentNumber);
        request.status = RequestStatus.OTP_PENDING;
        request.createdAt = now;
        requests.persist(request);

        OtpChallengeEntity challenge = new OtpChallengeEntity();
        challenge.id = requestId;
        challenge.request = request;
        challenge.credentialSalt = hasher.newSalt();
        challenge.credentialHash = hasher.credentialHash(challenge.credentialSalt, code);
        challenge.issuedAt = now;
        challenge.expiresAt = now.plus(5, ChronoUnit.MINUTES);
        challenge.attempts = 0;
        otpChallenges.persist(challenge);

        otpDelivery.send(request.email, code);
        eventService.record(requestId, "ONBOARDING_STARTED", "DATA");
        return new StartResponse(
                requestId,
                trackingToken,
                RequestStatus.OTP_PENDING,
                "Ingresa el código enviado a tu correo.");
    }

    @Transactional
    public StatusResponse getStatus(String requestId, String authorization) {
        OnboardingRequestEntity request = authorizedRequest(requestId, authorization, false);
        return statusResponse(request);
    }

    @Transactional(dontRollbackOn = ApiException.class)
    public StatusResponse verifyOtp(String requestId, String authorization, OtpRequest input) {
        OnboardingRequestEntity request = authorizedRequest(requestId, authorization, true);
        if (request.status == RequestStatus.OTP_VERIFIED) {
            throw ApiException.invalidOtp();
        }
        if (request.status != RequestStatus.OTP_PENDING) {
            throw ApiException.invalidState();
        }

        OtpChallengeEntity challenge = otpChallenges.findForUpdate(request.id);
        if (challenge == null) {
            throw ApiException.invalidState();
        }
        if (challenge.attempts >= MAX_OTP_ATTEMPTS) {
            throw ApiException.attemptsExhausted();
        }

        Instant now = Instant.now();
        if (challenge.consumedAt != null || !now.isBefore(challenge.expiresAt)) {
            challenge.attempts++;
            throw ApiException.invalidOtp();
        }
        if (!hasher.matches(challenge.credentialHash, challenge.credentialSalt, input.code())) {
            challenge.attempts++;
            if (challenge.attempts >= MAX_OTP_ATTEMPTS) {
                throw ApiException.attemptsExhausted();
            }
            throw ApiException.invalidOtp();
        }

        challenge.consumedAt = now;
        request.status = RequestStatus.OTP_VERIFIED;
        eventService.record(request.id, "STEP_COMPLETED", "OTP");
        return statusResponse(request);
    }

    @Transactional
    public CompleteResponse complete(String requestId, String authorization, CompleteRequest input) {
        OnboardingRequestEntity request = authorizedRequest(requestId, authorization, true);
        if (request.status == RequestStatus.ACTIVE) {
            CustomerEntity existingCustomer = customers.findByRequest(request.id);
            if (existingCustomer == null
                    || !hasher.matches(existingCustomer.pinHash, existingCustomer.pinSalt, input.pin())) {
                throw ApiException.invalidState();
            }
            return completionResponse(request, existingCustomer);
        }
        if (request.status != RequestStatus.OTP_VERIFIED) {
            throw ApiException.invalidState();
        }
        if (request.person == null) {
            throw ApiException.onboardingNotCompletable();
        }
        if (customers.findByPerson(request.person.id) != null) {
            throw ApiException.onboardingNotCompletable();
        }

        Instant now = Instant.now();
        CustomerEntity customer = new CustomerEntity();
        customer.id = UUID.randomUUID();
        customer.person = request.person;
        customer.request = request;
        customer.pinSalt = hasher.newSalt();
        customer.pinHash = hasher.credentialHash(customer.pinSalt, input.pin());
        customer.createdAt = now;
        customers.persist(customer);

        WalletEntity wallet = new WalletEntity();
        wallet.id = UUID.randomUUID();
        wallet.customer = customer;
        wallet.currency = "PEN";
        wallet.balanceMinorUnits = INITIAL_BALANCE_MINOR_UNITS;
        wallet.createdAt = now;
        wallets.persist(wallet);

        WalletMovementEntity movement = new WalletMovementEntity();
        movement.id = UUID.randomUUID();
        movement.wallet = wallet;
        movement.idempotencyKey = "onboarding:" + request.id;
        movement.movementType = "INITIAL_CREDIT";
        movement.amountMinorUnits = INITIAL_BALANCE_MINOR_UNITS;
        movement.createdAt = now;
        movements.persist(movement);

        request.status = RequestStatus.ACTIVE;
        eventService.record(request.id, "STEP_COMPLETED", "PIN");
        eventService.record(request.id, "ONBOARDING_CLOSED", "COMPLETE");
        return completionResponse(request, customer);
    }

    private OnboardingRequestEntity authorizedRequest(
            String requestId, String authorization, boolean lockForUpdate) {
        UUID parsedRequestId;
        try {
            parsedRequestId = UUID.fromString(requestId);
        } catch (IllegalArgumentException exception) {
            throw ApiException.requestNotFound();
        }

        OnboardingRequestEntity request = lockForUpdate
                ? requests.findForUpdate(parsedRequestId)
                : requests.findById(parsedRequestId);
        if (request == null) {
            throw ApiException.requestNotFound();
        }

        String token = authorization != null && authorization.startsWith("Bearer ")
                ? authorization.substring("Bearer ".length()).trim()
                : "";
        if (token.isEmpty() || !hasher.matchesTrackingToken(request.trackingTokenHash, token)) {
            throw ApiException.unauthorized();
        }
        return request;
    }

    private StatusResponse statusResponse(OnboardingRequestEntity request) {
        String nextStep = switch (request.status) {
            case OTP_PENDING -> "ENTER_OTP";
            case OTP_VERIFIED -> "CREATE_PIN";
            case ACTIVE -> null;
        };
        return new StatusResponse(request.id, request.status, nextStep, null);
    }

    private CompleteResponse completionResponse(OnboardingRequestEntity request, CustomerEntity customer) {
        WalletEntity wallet = wallets.findByCustomer(customer.id);
        if (wallet == null) {
            throw ApiException.internalError();
        }
        return new CompleteResponse(
                request.id,
                RequestStatus.ACTIVE,
                new CustomerResponse(customer.person.firstName, customer.person.lastName),
                new WalletResponse(wallet.currency, wallet.balanceMinorUnits));
    }
}
