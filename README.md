# Wallet Peru - Grupo 8

Repositorio del proyecto Wallet Peru del Grupo 8.

Demo de **registro y activación de una wallet ficticia** sin revisión humana: datos → OTP → PIN → pantalla de bienvenida con S/ 100.00 PEN de demo. Todos los datos son sintéticos.

## Estado actual

- **Backend (`backend/`):** servicio Java 25 + Quarkus 3.40 implementado. Expone la API REST en `/api/v1`, usa H2 en memoria con fixtures DNI/pasaporte sintéticos, envía el OTP por SMTP a Mailpit, registra el PIN y activa la wallet de forma atómica e idempotente. Incluye pruebas REST automatizadas.
- **Frontend (`frontend/`):** React + TypeScript + Vite conectado a la API. Incluye el flujo de tres pantallas (datos, OTP y PIN) y la pantalla inicial con nombre, apellido y saldo devueltos por el backend. Consulta el estado cada tres segundos mientras espera el OTP.
- **Pendiente:** verificar de forma reproducible el recorrido integrado con Mailpit real desde un entorno limpio, validar automáticamente los DTOs contra el contrato y completar la aceptación end-to-end. Ver [docs/TESTING.md](docs/TESTING.md).

### Reglas de la demo

- Solo datos sintéticos. No se envían correos reales, no se consulta KYC ni padrones externos y no se mueve dinero real.
- Procesar pagos, transferencias y retiros está fuera de alcance. El saldo es ficticio y no es retirable.
- El OTP de cuatro dígitos vence en cinco minutos, admite tres intentos y no se puede reenviar.
- OTP y PIN se guardan solo como HMAC-SHA-256 con sal aleatoria por credencial y clave secreta externa.
- Reiniciar el backend limpia H2 y elimina las solicitudes de demo.

Las decisiones y supuestos vigentes están en [docs/decisions-assumptions-limitations.md](docs/decisions-assumptions-limitations.md).

## Estructura

- `backend/`: API Quarkus de onboarding (ver [backend/README.md](backend/README.md)).
- `frontend/`: interfaz React del onboarding (ver [frontend/README.md](frontend/README.md)).
- `docs/`: alcance, historias, arquitectura, decisiones, contrato de endpoints, pruebas y guion de demo.
- `openspec/`: cambios y especificaciones gestionados con OpenSpec.
- `mock-payment-provider/`: espacio reservado para una historia posterior; no forma parte del onboarding.
- `tests/`: criterios y datos sintéticos de prueba.

## Requisitos

- JDK 25 (el wrapper Maven `mvnw.cmd` / `./mvnw` está incluido).
- Node.js y npm.
- Podman, para ejecutar Mailpit como buzón SMTP local.

## Ejecución local

1. **Mailpit** (desde cualquier carpeta, terminal dedicada):

   ```powershell
   podman run --rm --name wallet-demo-mailpit `
     -p 127.0.0.1:8025:8025 `
     -p 127.0.0.1:1025:1025 `
     docker.io/axllent/mailpit:v1.31.6
   ```

   Buzón en `http://127.0.0.1:8025`; SMTP en `127.0.0.1:1025`.

2. **Backend** (desde `backend/`, otra terminal). Requiere una clave HMAC aleatoria de al menos 32 bytes; el snippet de generación está en [backend/README.md](backend/README.md#ejecución-local):

   ```powershell
   .\mvnw.cmd quarkus:dev
   ```

   API en `http://localhost:8080/api/v1`, health en `/api/v1/q/health` y OpenAPI en `/api/v1/q/openapi`.

3. **Frontend** (desde `frontend/`, otra terminal):

   ```bash
   npm ci
   npm run dev
   ```

   Vite sirve la app en `http://localhost:5173`, origen CORS por defecto del backend. Para apuntar a otra API, define `VITE_API_BASE_URL` antes de iniciar Vite.

## Configuración

Variables de entorno del backend (plantilla en [backend/.env.example](backend/.env.example)):

| Variable | Uso | Valor por defecto |
|---|---|---|
| `ONBOARDING_HMAC_KEY` | Clave secreta para HMAC de OTP y PIN. Obligatoria; mínimo 32 bytes UTF-8. | — |
| `SMTP_HOST` / `SMTP_PORT` | Destino SMTP (Mailpit). | `127.0.0.1` / `1025` |
| `FRONTEND_ORIGIN` | Origen CORS permitido. | `http://localhost:5173` |

Variable del frontend: `VITE_API_BASE_URL`, por defecto `http://localhost:8080/api/v1`.

## Pruebas

Backend (desde `backend/`), con H2 en memoria y mailer simulado, sin necesidad de Mailpit:

```powershell
.\mvnw.cmd test
```

Frontend (desde `frontend/`):

```bash
npm test
npm run lint
npm run build
```

La matriz de casos, los resultados y las limitaciones están en [docs/TESTING.md](docs/TESTING.md). Las pruebas frontend no sustituyen la integración con el backend.

## Documentación vigente

- [Alcance](docs/scope.md), [historias y criterios](docs/user-stories-and-acceptance.md) y [onboarding](docs/onboarding.md).
- [Decisiones, supuestos y limitaciones](docs/decisions-assumptions-limitations.md).
- [Arquitectura](docs/architecture.md), [contrato de endpoints](docs/ENDPOINTS.md) y [plan de implementación](docs/implementation-plan.md).
- [Pruebas](docs/TESTING.md) y [guion de demo planificado](docs/demo-script.md).
- [Plan de sprints de la versión anterior](docs/wallet-demo-sprints.md), conservado como referencia histórica.

Usar exclusivamente datos sintéticos. La trazabilidad debe excluir DNI, nombre, apellido, correo, OTP y PIN en claro; correlacionar eventos con un ID aleatorio/opaco y no con hashes simples de datos personales.
