# Wallet Peru - Grupo 8

Repositorio del proyecto Wallet Peru del Grupo 8.

## Estructura

- `docs/`: alcance, historias de usuario, arquitectura, decisiones y guion de demostración.
- `backend/`: aplicación y pruebas del backend.
- `frontend/`: aplicación web.
- `mock-payment-provider/`: espacio reservado para una historia futura de pagos; no forma parte de esta demo.
- `tests/`: pruebas de aceptación y datos de prueba.

## Stack

- Frontend: React + TypeScript + Vite.
- Backend: Java + Quarkus.
- Persistencia local recomendada, pendiente de aprobación: H2 en memoria con fixtures sintéticos; se reinicia al iniciar la aplicación.
- Correo de demo recomendado, pendiente de aprobación: Mailpit local para capturar SMTP; requiere Docker y no envía correos externos.

## Funcionalidad inicial

La funcionalidad inicial prevista es onboarding con decisión humana (HITL), verificación de correo mediante OTP simulado, creación de PIN y wallet con saldo ficticio inicial de S/ 100.00 PEN. El detalle está en [`docs/onboarding.md`](docs/onboarding.md).

## Documentación para construir y demostrar

- Alcance, historias y decisiones: [`docs/scope.md`](docs/scope.md), [`docs/user-stories-and-acceptance.md`](docs/user-stories-and-acceptance.md) y [`docs/decisions-assumptions-limitations.md`](docs/decisions-assumptions-limitations.md).
- Arquitectura y contrato del backend: [`docs/architecture.md`](docs/architecture.md) y [`docs/ENDPOINTS.md`](docs/ENDPOINTS.md).
- Pruebas y plan de implementación: [`docs/TESTING.md`](docs/TESTING.md) y [`docs/implementation-plan.md`](docs/implementation-plan.md).
- Guion: [`docs/demo-script.md`](docs/demo-script.md).

La trazabilidad debe excluir DNI, nombre, apellido, correo, OTP y PIN en claro; correlacionar eventos con un ID aleatorio/opaco de solicitud. No usar hashes simples de datos personales como IDs. Usar exclusivamente datos sintéticos.

## Estado y ejecución

Las carpetas de frontend y backend contienen actualmente la estructura inicial. Los proyectos ejecutables, la base de datos, el buzón simulado y los comandos de instalación/ejecución aún deben configurarse. No se deben usar datos reales.
