package pe.demo.onboarding;

import io.quarkus.hibernate.orm.panache.PanacheEntityBase;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "app_customer", uniqueConstraints = {
        @UniqueConstraint(name = "uk_customer_person", columnNames = "person_id"),
        @UniqueConstraint(name = "uk_customer_request", columnNames = "request_id")
})
public class CustomerEntity extends PanacheEntityBase {
    @Id
    public UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "person_id", nullable = false)
    public DemoPersonEntity person;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "request_id", nullable = false)
    public OnboardingRequestEntity request;

    @Column(name = "pin_hash", nullable = false, length = 32)
    public byte[] pinHash;

    @Column(name = "pin_salt", nullable = false, length = 16)
    public byte[] pinSalt;

    @Column(name = "created_at", nullable = false)
    public Instant createdAt;
}
