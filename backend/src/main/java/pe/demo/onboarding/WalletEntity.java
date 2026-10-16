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
@Table(name = "wallet")
public class WalletEntity extends PanacheEntityBase {
    @Id
    public UUID id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "customer_id", nullable = false, unique = true)
    public CustomerEntity customer;

    @Column(nullable = false, length = 3)
    public String currency;

    @Column(name = "balance_minor_units", nullable = false)
    public long balanceMinorUnits;

    @Column(name = "created_at", nullable = false)
    public Instant createdAt;
}
