package pe.demo.onboarding;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import java.time.Instant;
import java.util.UUID;

public final class OnboardingDtos {
    private OnboardingDtos() {
    }

    public enum DocumentType {
        DNI,
        PASSPORT
    }

    public enum RequestStatus {
        OTP_PENDING,
        OTP_VERIFIED,
        ACTIVE
    }

    public record StartRequest(
            @NotNull DocumentType documentType,
            @NotBlank @Size(min = 4, max = 20)
            @Pattern(regexp = "[A-Za-z0-9-]+") String documentNumber,
            @NotBlank @Email @Size(max = 254) String email) {
    }

    public record OtpRequest(
            @NotBlank @Pattern(regexp = "[0-9]{4}") String code) {
    }

    public record CompleteRequest(
            @NotBlank @Pattern(regexp = "[0-9]{4}") String pin) {
    }

    public record StartResponse(
            UUID requestId,
            String trackingToken,
            RequestStatus status,
            String message) {
    }

    public record StatusResponse(
            UUID requestId,
            RequestStatus status,
            String nextStep,
            String message) {
    }

    public record CompleteResponse(
            UUID requestId,
            RequestStatus status,
            CustomerResponse customer,
            WalletResponse wallet) {
    }

    public record CustomerResponse(String firstName, String lastName) {
    }

    public record WalletResponse(String currency, long balanceMinorUnits) {
    }

    public record ErrorResponse(String code, String message) {
    }

    public record AnalyticsEvent(UUID id, UUID requestId, String eventType, String step, Instant occurredAt) {
    }
}
