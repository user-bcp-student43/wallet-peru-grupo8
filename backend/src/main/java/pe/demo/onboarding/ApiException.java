package pe.demo.onboarding;

public class ApiException extends RuntimeException {
    private final int status;
    private final String code;

    public ApiException(int status, String code, String message) {
        super(message);
        this.status = status;
        this.code = code;
    }

    public int status() {
        return status;
    }

    public String code() {
        return code;
    }

    public static ApiException invalidInput() {
        return new ApiException(400, "INVALID_INPUT", "Revisa los datos ingresados.");
    }

    public static ApiException unauthorized() {
        return new ApiException(401, "UNAUTHORIZED", "La solicitud no está autorizada.");
    }

    public static ApiException requestNotFound() {
        return new ApiException(404, "REQUEST_NOT_FOUND", "No se encontró la solicitud.");
    }

    public static ApiException invalidState() {
        return new ApiException(409, "INVALID_STATE", "La solicitud no permite esta acción.");
    }

    public static ApiException onboardingNotCompletable() {
        return new ApiException(422, "ONBOARDING_NOT_COMPLETABLE", "No se pudo completar el registro.");
    }

    public static ApiException invalidOtp() {
        return new ApiException(422, "INVALID_OTP", "El código no es válido o venció.");
    }

    public static ApiException attemptsExhausted() {
        return new ApiException(429, "ATTEMPTS_EXHAUSTED", "Agotaste tus intentos permitidos.");
    }

    public static ApiException internalError() {
        return new ApiException(500, "INTERNAL_ERROR", "No se pudo completar la solicitud.");
    }
}
