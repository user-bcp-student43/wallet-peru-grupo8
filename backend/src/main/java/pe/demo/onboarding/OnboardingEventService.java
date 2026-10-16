package pe.demo.onboarding;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.transaction.Transactional;
import java.time.Instant;
import java.util.UUID;

@ApplicationScoped
public class OnboardingEventService {
    private final OnboardingEventRepository events;

    public OnboardingEventService(OnboardingEventRepository events) {
        this.events = events;
    }

    @Transactional
    public void record(UUID requestId, String eventType, String step) {
        OnboardingEventEntity event = new OnboardingEventEntity();
        event.id = UUID.randomUUID();
        event.requestId = requestId;
        event.eventType = eventType;
        event.step = step;
        event.occurredAt = Instant.now();
        events.persist(event);
    }
}
