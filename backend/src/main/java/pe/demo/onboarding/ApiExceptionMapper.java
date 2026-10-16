package pe.demo.onboarding;

import jakarta.ws.rs.core.Response;
import jakarta.ws.rs.ext.ExceptionMapper;
import jakarta.ws.rs.ext.Provider;
import pe.demo.onboarding.OnboardingDtos.ErrorResponse;

@Provider
public class ApiExceptionMapper implements ExceptionMapper<ApiException> {
    @Override
    public Response toResponse(ApiException exception) {
        return Response.status(exception.status())
                .entity(new ErrorResponse(exception.code(), exception.getMessage()))
                .build();
    }
}
