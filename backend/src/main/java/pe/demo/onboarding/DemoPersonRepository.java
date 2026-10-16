package pe.demo.onboarding;

import io.quarkus.hibernate.orm.panache.PanacheRepositoryBase;
import jakarta.enterprise.context.ApplicationScoped;
import pe.demo.onboarding.OnboardingDtos.DocumentType;
import java.util.UUID;

@ApplicationScoped
public class DemoPersonRepository implements PanacheRepositoryBase<DemoPersonEntity, UUID> {
    public DemoPersonEntity findByDocument(DocumentType documentType, String documentNumber) {
        return find("documentType = ?1 and documentNumber = ?2", documentType, documentNumber)
                .firstResult();
    }
}
