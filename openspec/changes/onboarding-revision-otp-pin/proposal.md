# Proposal

## Why

El frontend disponible implementa la experiencia anterior de activación por alias y pago simulado, mientras el backend no tiene una aplicación ejecutable; por tanto, todavía no existe el onboarding de identidad sintética, correo, OTP, PIN ni activación de wallet descrito por el producto. Este cambio define el comportamiento necesario para construir y verificar ese recorrido sin presentar simulaciones locales como integración funcional.

## What Changes

- Añadir el onboarding con DNI o pasaporte, correo sintético, búsqueda de persona sintética y OTP de cuatro dígitos, sin revisión humana ni decisión HITL.
- Habilitar PIN numérico de cuatro dígitos solo después de verificar el OTP; completar el registro de aplicación, activar la wallet y acreditar `10000` céntimos PEN de forma atómica e idempotente.
- Mostrar en la bienvenida nombre, apellido y saldo obtenidos del backend, junto con el progreso del onboarding.
- Registrar los eventos mínimos acordados con ID opaco y timestamp, sin PII ni OTP/PIN en logs, trazas, auditoría o analítica.
- Definir criterios observables y distinguir la implementación frontend/backend de una integración end-to-end verificada.
- Aplicar las decisiones aprobadas de H2 en memoria y Mailpit local. El OTP vence a los cinco minutos, permite tres intentos y no se reenvía; OTP/PIN se protegen con HMAC-SHA-256, sal aleatoria por credencial y clave secreta externa. Para documentos sin coincidencia, la activación se bloquea al completar con error genérico, aceptando el riesgo de inferencia indirecta.

## Capabilities

### New Capabilities

- `wallet-onboarding`: registro sintético, verificación OTP, creación de PIN, activación de wallet, crédito inicial único y presentación de bienvenida.

### Modified Capabilities

Ninguna. El directorio `openspec/specs/` no contiene capacidades existentes; la especificación previa de `sprint-1-wallet-frontend` pertenece al cambio anterior y se conserva sin modificar.

## Impact

- `frontend/src/App.tsx`, estilos y servicios/tipos del cliente: sustituir el recorrido anterior de alias/pago por el onboarding y consumo de API, preservando la identificación clara de la demo.
- `backend/`: aplicación Java + Quarkus, modelo, repositorios, pruebas REST y OpenAPI; la integración real con Mailpit sigue pendiente de verificación.
- Contratos y documentación de API: alinear OpenAPI y DTOs con `docs/ENDPOINTS.md` y verificarlo automáticamente.
- Persistencia y buzón de correo simulados: decisiones aprobadas para H2 en memoria y Mailpit local; falta validar el recorrido conectado.
- `openspec/changes/sprint-1-wallet-frontend/` y los cambios locales existentes quedan fuera de modificación.
