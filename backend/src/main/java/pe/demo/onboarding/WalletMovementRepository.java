package pe.demo.onboarding;

import io.quarkus.hibernate.orm.panache.PanacheRepositoryBase;
import jakarta.enterprise.context.ApplicationScoped;
import java.util.UUID;

@ApplicationScoped
public class WalletMovementRepository implements PanacheRepositoryBase<WalletMovementEntity, UUID> {
    public WalletMovementEntity findByIdempotencyKey(String idempotencyKey) {
        return find("idempotencyKey", idempotencyKey).firstResult();
    }
}
