# Propuesta

## Por qué

El frontend de la plantilla React/Vite aún no permite recorrer el onboarding, la activación, un pago simulado exitoso y su historial. Se define una demo acotada para hacer reproducible ese recorrido y comunicar con precisión sus límites: un resultado incierto por timeout no equivale a éxito ni a fallo confirmado, y el estado local no demuestra persistencia backend.

## Qué cambia

- Añadir un onboarding de demo en tres pasos: ingresar alias, revisar y activar. El alias ficticio es obligatorio, de 3 a 20 caracteres ASCII, con letras, números y guion bajo solamente; estas reglas son exclusivas de la demo y no son KYC.
- Fijar el destinatario en María Demo y el importe en S/ 5.00, modelado como 500 céntimos en PEN.
- Mostrar el pago exitoso y su referencia única, con prefijo `DEMO`, solamente cuando el adaptador devuelva éxito. Ante timeout, presentar el resultado como sin confirmar, sin declarar pago fallido y sin iniciar otro pago automáticamente.
- Usar un adaptador frontend en memoria: recargar reinicia el recorrido y elimina el historial de la sesión.
- Definir estados internos y errores técnicos TypeScript como propuesta técnica local sustituible; no afirmar que sean un contrato acordado o aprobado por backend.
- Considerar la entrega frontend simulada aceptable por separado. El cierre completo de Sprint 1 requiere integración y evidencia de backend; la simulación local no acredita ese cierre.
- Mantener fuera de alcance los escenarios de idempotencia/reintento duplicado y fallos de negocio del Sprint 2.

## Capacidades

### Capacidades nuevas

- `wallet-demo-journey`: recorrido frontend de demo desde el registro y activación hasta el pago simulado y la consulta del historial, con estados y límites explícitos.

### Capacidades modificadas

Ninguna. Esta propuesta introduce una capacidad nueva.

## Impacto

- Frontend React/TypeScript en `frontend/src/`: pantallas y navegación en `frontend/src/App.tsx`, adaptador simulado en `frontend/src/services/walletDemoService.ts` y tipos locales en `frontend/src/types/walletDemo.ts`.
- Contrato TypeScript interno del frontend: propuesta técnica local que permite sustituir el adaptador; no es un contrato de backend aprobado.
- README del frontend en `frontend/README.md`: instrucciones del recorrido, reinicio del estado al recargar, referencia de demo y distinción entre evidencia local e integración backend.
- Pendientes fuera del alcance de este cambio: `backend/` forma parte del mismo repositorio, pero la integración real, la persistencia y consulta de pagos, y la evidencia de QA/backend necesarias para declarar completo Sprint 1 aún no están cubiertas.
- No se requieren cambios de dependencias previstos.
