package pe.demo.onboarding;

import io.quarkus.hibernate.orm.panache.PanacheRepositoryBase;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.persistence.LockModeType;
import java.util.UUID;

@ApplicationScoped
public class OnboardingRequestRepository implements PanacheRepositoryBase<OnboardingRequestEntity, UUID> {
    public OnboardingRequestEntity findForUpdate(UUID requestId) {
        return findById(requestId, LockModeType.PESSIMISTIC_WRITE);
    }
}
