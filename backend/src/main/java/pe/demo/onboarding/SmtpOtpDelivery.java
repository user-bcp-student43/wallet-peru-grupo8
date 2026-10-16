package pe.demo.onboarding;

import io.quarkus.mailer.Mail;
import io.quarkus.mailer.Mailer;
import jakarta.enterprise.context.ApplicationScoped;

@ApplicationScoped
public class SmtpOtpDelivery implements OtpDelivery {
    private final Mailer mailer;

    public SmtpOtpDelivery(Mailer mailer) {
        this.mailer = mailer;
    }

    @Override
    public void send(String recipient, String code) {
        mailer.send(Mail.withText(
                recipient,
                "Código de verificación de Billetera Demo",
                "Tu código de verificación es " + code + ". Vence en cinco minutos."));
    }
}
