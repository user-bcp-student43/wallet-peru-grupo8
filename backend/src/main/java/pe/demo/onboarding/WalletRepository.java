package pe.demo.onboarding;

import io.quarkus.hibernate.orm.panache.PanacheRepositoryBase;
import jakarta.enterprise.context.ApplicationScoped;
import java.util.UUID;

@ApplicationScoped
public class WalletRepository implements PanacheRepositoryBase<WalletEntity, UUID> {
    public WalletEntity findByCustomer(UUID customerId) {
        return find("customer.id", customerId).firstResult();
    }
}
