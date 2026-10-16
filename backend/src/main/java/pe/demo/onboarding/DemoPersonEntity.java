package pe.demo.onboarding;

import static pe.demo.onboarding.OnboardingDtos.DocumentType;

import io.quarkus.hibernate.orm.panache.PanacheEntityBase;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import java.util.UUID;

@Entity
@Table(name = "demo_person", uniqueConstraints = @UniqueConstraint(
        name = "uk_demo_person_document", columnNames = { "document_type", "document_number" }))
public class DemoPersonEntity extends PanacheEntityBase {
    @Id
    public UUID id;

    @Enumerated(EnumType.STRING)
    @Column(name = "document_type", nullable = false, length = 16)
    public DocumentType documentType;

    @Column(name = "document_number", nullable = false, length = 20)
    public String documentNumber;

    @Column(name = "first_name", nullable = false, length = 80)
    public String firstName;

    @Column(name = "last_name", nullable = false, length = 80)
    public String lastName;
}
