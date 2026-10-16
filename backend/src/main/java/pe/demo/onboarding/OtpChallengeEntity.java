package pe.demo.onboarding;

import io.quarkus.hibernate.orm.panache.PanacheEntityBase;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "otp_challenge")
public class OtpChallengeEntity extends PanacheEntityBase {
    @Id
    public UUID id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "request_id", nullable = false, unique = true)
    public OnboardingRequestEntity request;

    @Column(name = "credential_hash", nullable = false, length = 32)
    public byte[] credentialHash;

    @Column(name = "credential_salt", nullable = false, length = 16)
    public byte[] credentialSalt;

    @Column(name = "issued_at", nullable = false)
    public Instant issuedAt;

    @Column(name = "expires_at", nullable = false)
    public Instant expiresAt;

    @Column(nullable = false)
    public int attempts;

    @Column(name = "consumed_at")
    public Instant consumedAt;
}
