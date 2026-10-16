package pe.demo.onboarding;

public interface OtpDelivery {
    void send(String recipient, String code);
}
