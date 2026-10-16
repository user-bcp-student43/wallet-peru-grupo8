# Wallet Peru - Grupo 8

Repositorio del proyecto Wallet Peru del Grupo 8.

## Estado actual

- **Frontend existente:** React + TypeScript + Vite para la versión anterior del Sprint 1. Su servicio es local y simula activación, transferencia fija e historial; no se conecta al backend.
- **Backend:** aún no tiene implementación ejecutable.
- **Nuevo onboarding:** el flujo sin revisión humana, con OTP, PIN y activación de wallet está especificado, pero pendiente de implementar.
- **Pagos:** procesar pagos está excluido del alcance nuevo. La activación y el crédito inicial ficticio de S/ 100.00 PEN sí están incluidos y deberán ser idempotentes.

Podman, H2 en memoria y Mailpit local están acordados; el OTP vence en cinco minutos, admite tres intentos y no se reenvía. El estado central está en [docs/decisions-assumptions-limitations.md](docs/decisions-assumptions-limitations.md).

## Estructura

- `docs/`: alcance, historias, arquitectura, decisiones, contrato y guion.
- `backend/`: estructura reservada para la implementación backend pendiente.
- `frontend/`: frontend local de la versión anterior.
- `mock-payment-provider/`: espacio reservado; no forma parte del nuevo onboarding.
- `tests/`: criterios y datos sintéticos para pruebas.

## Ejecutar el frontend existente

Requisitos: Node.js y npm. Desde `frontend/`:

```bash
npm install
npm run dev
```

Scripts disponibles desde `frontend/`:

```bash
npm run build
npm run lint
```

No hay script `test` configurado. Estos comandos solo ejecutan/verifican el frontend existente; no inician ni prueban el backend o el nuevo onboarding.

## Documentación vigente

- [Alcance](docs/scope.md), [historias y criterios](docs/user-stories-and-acceptance.md) y [onboarding](docs/onboarding.md).
- [Decisiones, supuestos y limitaciones](docs/decisions-assumptions-limitations.md).
- [Arquitectura](docs/architecture.md), [contrato API propuesto](docs/ENDPOINTS.md) y [plan de implementación](docs/implementation-plan.md).
- [Pruebas](docs/TESTING.md) y [guion de demo planificado](docs/demo-script.md).
- [Plan de sprints de la versión anterior](docs/wallet-demo-sprints.md), conservado como referencia histórica.

Usar exclusivamente datos sintéticos. La trazabilidad debe excluir DNI, nombre, apellido, correo, OTP y PIN en claro; correlacionar eventos con un ID aleatorio/opaco y no con hashes simples de datos personales.
