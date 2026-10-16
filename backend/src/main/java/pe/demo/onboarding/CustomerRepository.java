package pe.demo.onboarding;

import io.quarkus.hibernate.orm.panache.PanacheRepositoryBase;
import jakarta.enterprise.context.ApplicationScoped;
import java.util.UUID;

@ApplicationScoped
public class CustomerRepository implements PanacheRepositoryBase<CustomerEntity, UUID> {
    public CustomerEntity findByRequest(UUID requestId) {
        return find("request.id", requestId).firstResult();
    }

    public CustomerEntity findByPerson(UUID personId) {
        return find("person.id", personId).firstResult();
    }
}
