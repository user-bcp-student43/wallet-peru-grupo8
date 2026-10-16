package pe.demo.onboarding;

import io.quarkus.hibernate.orm.panache.PanacheEntityBase;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "onboarding_event")
public class OnboardingEventEntity extends PanacheEntityBase {
    @Id
    public UUID id;

    @Column(name = "request_id", nullable = false)
    public UUID requestId;

    @Column(name = "event_type", nullable = false, length = 32)
    public String eventType;

    @Column(nullable = false, length = 24)
    public String step;

    @Column(name = "occurred_at", nullable = false)
    public Instant occurredAt;
}
