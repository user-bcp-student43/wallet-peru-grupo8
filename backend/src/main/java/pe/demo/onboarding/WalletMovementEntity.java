package pe.demo.onboarding;

import io.quarkus.hibernate.orm.panache.PanacheEntityBase;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "wallet_movement", uniqueConstraints = @UniqueConstraint(
        name = "uk_wallet_movement_idempotency", columnNames = "idempotency_key"))
public class WalletMovementEntity extends PanacheEntityBase {
    @Id
    public UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "wallet_id", nullable = false)
    public WalletEntity wallet;

    @Column(name = "idempotency_key", nullable = false, unique = true, length = 80)
    public String idempotencyKey;

    @Column(name = "movement_type", nullable = false, length = 32)
    public String movementType;

    @Column(name = "amount_minor_units", nullable = false)
    public long amountMinorUnits;

    @Column(name = "created_at", nullable = false)
    public Instant createdAt;
}
