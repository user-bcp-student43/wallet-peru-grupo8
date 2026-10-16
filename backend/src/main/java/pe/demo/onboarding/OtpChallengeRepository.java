package pe.demo.onboarding;

import io.quarkus.hibernate.orm.panache.PanacheRepositoryBase;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.persistence.LockModeType;
import java.util.UUID;

@ApplicationScoped
public class OtpChallengeRepository implements PanacheRepositoryBase<OtpChallengeEntity, UUID> {
    public OtpChallengeEntity findForUpdate(UUID requestId) {
        return find("request.id = ?1", requestId)
                .withLock(LockModeType.PESSIMISTIC_WRITE)
                .firstResult();
    }
}
