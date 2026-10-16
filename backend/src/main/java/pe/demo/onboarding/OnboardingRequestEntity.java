package pe.demo.onboarding;

import static pe.demo.onboarding.OnboardingDtos.DocumentType;
import static pe.demo.onboarding.OnboardingDtos.RequestStatus;

import io.quarkus.hibernate.orm.panache.PanacheEntityBase;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "onboarding_request")
public class OnboardingRequestEntity extends PanacheEntityBase {
    @Id
    public UUID id;

    @Column(name = "tracking_token_hash", nullable = false, unique = true, length = 64)
    public String trackingTokenHash;

    @Enumerated(EnumType.STRING)
    @Column(name = "document_type", nullable = false, length = 16)
    public DocumentType documentType;

    @Column(name = "document_number", nullable = false, length = 20)
    public String documentNumber;

    @Column(nullable = false, length = 254)
    public String email;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "person_id")
    public DemoPersonEntity person;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 16)
    public RequestStatus status;

    @Column(name = "created_at", nullable = false)
    public Instant createdAt;
}
