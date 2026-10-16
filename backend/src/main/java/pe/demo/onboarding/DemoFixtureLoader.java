package pe.demo.onboarding;

import static pe.demo.onboarding.OnboardingDtos.DocumentType;

import io.quarkus.runtime.StartupEvent;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.enterprise.event.Observes;
import jakarta.transaction.Transactional;
import java.util.UUID;

@ApplicationScoped
public class DemoFixtureLoader {
    private final DemoPersonRepository people;

    public DemoFixtureLoader(DemoPersonRepository people) {
        this.people = people;
    }

    @Transactional
    void loadFixtures(@Observes StartupEvent event) {
        addPerson(DocumentType.DNI, "11111111", "Persona", "Sintética");
        addPerson(DocumentType.PASSPORT, "P0000001", "Pasaporte", "De Prueba");
    }

    private void addPerson(DocumentType type, String documentNumber, String firstName, String lastName) {
        if (people.findByDocument(type, documentNumber) != null) {
            return;
        }
        DemoPersonEntity person = new DemoPersonEntity();
        person.id = UUID.randomUUID();
        person.documentType = type;
        person.documentNumber = documentNumber;
        person.firstName = firstName;
        person.lastName = lastName;
        people.persist(person);
    }
}
