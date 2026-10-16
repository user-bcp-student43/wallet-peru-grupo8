package pe.demo.onboarding;

import static pe.demo.onboarding.OnboardingDtos.CompleteRequest;
import static pe.demo.onboarding.OnboardingDtos.CompleteResponse;
import static pe.demo.onboarding.OnboardingDtos.OtpRequest;
import static pe.demo.onboarding.OnboardingDtos.StartRequest;
import static pe.demo.onboarding.OnboardingDtos.StartResponse;
import static pe.demo.onboarding.OnboardingDtos.StatusResponse;

import jakarta.validation.Valid;
import jakarta.ws.rs.Consumes;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.HeaderParam;
import jakarta.ws.rs.POST;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.PathParam;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.HttpHeaders;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import org.eclipse.microprofile.openapi.annotations.enums.ParameterIn;
import org.eclipse.microprofile.openapi.annotations.media.Content;
import org.eclipse.microprofile.openapi.annotations.media.Schema;
import org.eclipse.microprofile.openapi.annotations.Operation;
import org.eclipse.microprofile.openapi.annotations.OpenAPIDefinition;
import org.eclipse.microprofile.openapi.annotations.info.Info;
import org.eclipse.microprofile.openapi.annotations.parameters.Parameter;
import org.eclipse.microprofile.openapi.annotations.responses.APIResponse;
import org.eclipse.microprofile.openapi.annotations.responses.APIResponses;
import org.eclipse.microprofile.openapi.annotations.tags.Tag;

@Path("/onboarding-requests")
@Consumes(MediaType.APPLICATION_JSON)
@Produces(MediaType.APPLICATION_JSON)
@OpenAPIDefinition(info = @Info(
        title = "Wallet Onboarding API",
        version = "1.0.0",
        description = "API de onboarding sintético para la wallet demo."))
@Tag(name = "onboarding", description = "Inicio y activación del onboarding de wallet demo")
public class OnboardingResource {
    private final OnboardingApplicationService service;

    public OnboardingResource(OnboardingApplicationService service) {
        this.service = service;
    }

    @POST
    @Operation(summary = "Iniciar solicitud y emitir OTP")
    @APIResponses({
            @APIResponse(responseCode = "202", description = "Solicitud iniciada",
                    content = @Content(schema = @Schema(implementation = StartResponse.class))),
            @APIResponse(responseCode = "400", description = "Datos inválidos",
                    content = @Content(schema = @Schema(implementation = OnboardingDtos.ErrorResponse.class))),
            @APIResponse(responseCode = "500", description = "Error interno",
                    content = @Content(schema = @Schema(implementation = OnboardingDtos.ErrorResponse.class)))
    })
    public Response start(@Valid StartRequest input) {
        StartResponse response = service.start(input);
        return Response.accepted(response).build();
    }

    @GET
    @Path("/{requestId}/status")
    @Operation(summary = "Consultar estado autoritativo de la solicitud")
    @Parameter(name = HttpHeaders.AUTHORIZATION, in = ParameterIn.HEADER, required = true,
            description = "Token de seguimiento recibido al iniciar: Bearer <token>")
    @APIResponses({
            @APIResponse(responseCode = "200", description = "Estado de onboarding",
                    content = @Content(schema = @Schema(implementation = StatusResponse.class))),
            @APIResponse(responseCode = "401", description = "Token inválido",
                    content = @Content(schema = @Schema(implementation = OnboardingDtos.ErrorResponse.class))),
            @APIResponse(responseCode = "404", description = "Solicitud no encontrada",
                    content = @Content(schema = @Schema(implementation = OnboardingDtos.ErrorResponse.class)))
    })
    public StatusResponse status(
            @PathParam("requestId") String requestId,
            @HeaderParam(HttpHeaders.AUTHORIZATION) String authorization) {
        return service.getStatus(requestId, authorization);
    }

    @POST
    @Path("/{requestId}/otp/verify")
    @Operation(summary = "Verificar OTP")
    @Parameter(name = HttpHeaders.AUTHORIZATION, in = ParameterIn.HEADER, required = true,
            description = "Token de seguimiento recibido al iniciar: Bearer <token>")
    @APIResponses({
            @APIResponse(responseCode = "200", description = "OTP verificado",
                    content = @Content(schema = @Schema(implementation = StatusResponse.class))),
            @APIResponse(responseCode = "400", description = "Datos inválidos",
                    content = @Content(schema = @Schema(implementation = OnboardingDtos.ErrorResponse.class))),
            @APIResponse(responseCode = "401", description = "Token inválido",
                    content = @Content(schema = @Schema(implementation = OnboardingDtos.ErrorResponse.class))),
            @APIResponse(responseCode = "422", description = "OTP inválido o vencido",
                    content = @Content(schema = @Schema(implementation = OnboardingDtos.ErrorResponse.class))),
            @APIResponse(responseCode = "429", description = "Intentos agotados",
                    content = @Content(schema = @Schema(implementation = OnboardingDtos.ErrorResponse.class)))
    })
    public StatusResponse verifyOtp(
            @PathParam("requestId") String requestId,
            @HeaderParam(HttpHeaders.AUTHORIZATION) String authorization,
            @Valid OtpRequest input) {
        return service.verifyOtp(requestId, authorization, input);
    }

    @POST
    @Path("/{requestId}/complete")
    @Operation(summary = "Completar onboarding y activar wallet demo")
    @Parameter(name = HttpHeaders.AUTHORIZATION, in = ParameterIn.HEADER, required = true,
            description = "Token de seguimiento recibido al iniciar: Bearer <token>")
    @APIResponses({
            @APIResponse(responseCode = "201", description = "Wallet activada",
                    content = @Content(schema = @Schema(implementation = CompleteResponse.class))),
            @APIResponse(responseCode = "400", description = "Datos inválidos",
                    content = @Content(schema = @Schema(implementation = OnboardingDtos.ErrorResponse.class))),
            @APIResponse(responseCode = "401", description = "Token inválido",
                    content = @Content(schema = @Schema(implementation = OnboardingDtos.ErrorResponse.class))),
            @APIResponse(responseCode = "409", description = "Estado inválido",
                    content = @Content(schema = @Schema(implementation = OnboardingDtos.ErrorResponse.class))),
            @APIResponse(responseCode = "422", description = "Onboarding no completable",
                    content = @Content(schema = @Schema(implementation = OnboardingDtos.ErrorResponse.class)))
    })
    public Response complete(
            @PathParam("requestId") String requestId,
            @HeaderParam(HttpHeaders.AUTHORIZATION) String authorization,
            @Valid CompleteRequest input) {
        CompleteResponse response = service.complete(requestId, authorization, input);
        return Response.status(Response.Status.CREATED).entity(response).build();
    }
}
