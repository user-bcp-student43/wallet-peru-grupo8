# Backend de onboarding

Servicio Java + Quarkus para el onboarding sintético de la wallet demo. Incluye API REST/OpenAPI, persistencia H2 en memoria, fixtures DNI/pasaporte, verificación OTP, activación idempotente y entrega SMTP para Mailpit. El saldo es ficticio; no se valida identidad real ni se procesan pagos.

## Requisitos

- JDK 25.
- Podman y `podman compose` para levantar Mailpit local.
- El wrapper Maven incluido (`mvnw.cmd` en Windows o `./mvnw` en Linux/macOS).

## Pruebas

Desde `backend/`:

```powershell
.\mvnw.cmd test
```

El perfil `test` usa H2 en memoria, una clave HMAC exclusiva de pruebas y el mailer simulado de Quarkus. No necesita Mailpit ni envía correo externo. Los tests REST cubren contrato, validación, autorización, fixtures, error genérico de lookup, OTP incorrecto/vencido/reutilizado, tres intentos, activación idempotente, rollback y eventos sin datos personales.

## Ejecución local

1. Iniciar Mailpit en Podman desde `backend/`:

   ```powershell
   podman run --rm --name wallet-demo-mailpit `
     -p 127.0.0.1:8025:8025 `
     -p 127.0.0.1:1025:1025 `
     docker.io/axllent/mailpit:v1.31.6
   ```

   La interfaz del buzón queda en `http://127.0.0.1:8025` y SMTP en `127.0.0.1:1025`. El comando permanece en primer plano; `Ctrl+C` detiene y elimina el contenedor.

2. En otra terminal, configurar una clave de demo aleatoria de al menos 32 bytes y arrancar Quarkus:

   ```powershell
   $secretBytes = New-Object byte[] 32
   $random = [System.Security.Cryptography.RandomNumberGenerator]::Create()
   $random.GetBytes($secretBytes)
   $env:ONBOARDING_HMAC_KEY = [Convert]::ToBase64String($secretBytes)
   $random.Dispose()
   $env:SMTP_HOST = '127.0.0.1'
   $env:SMTP_PORT = '1025'
   .\mvnw.cmd quarkus:dev
   ```

   La API usa `http://localhost:8080/api/v1`; health check: `http://localhost:8080/api/v1/q/health`; OpenAPI: `http://localhost:8080/api/v1/q/openapi`. El backend carga fixtures completamente sintéticos al iniciar. H2 está en memoria y reiniciar el proceso elimina solicitudes y cuentas de demo.

3. Ejecutar el frontend siguiendo [su README](../frontend/README.md). La interfaz del buzón permite consultar el OTP local de la solicitud.

## Configuración

Las variables requeridas para ejecución normal están listadas en [.env.example](./.env.example):

- `ONBOARDING_HMAC_KEY`: clave secreta externa, mínimo 32 bytes UTF-8. No usar la clave de test ni guardar el secreto en el repositorio.
- `SMTP_HOST` y `SMTP_PORT`: destino SMTP de Mailpit; por defecto `127.0.0.1:1025`.
- `FRONTEND_ORIGIN`: origen CORS permitido; por defecto `http://localhost:5173`.

Cada OTP dura cinco minutos, admite tres intentos y no se reenvía. OTP y PIN se guardan como HMAC-SHA-256 con sal por credencial y comparación en tiempo constante. Reiniciar el backend limpia H2.

## Privacidad y límites

Los eventos conservan únicamente ID opaco de solicitud, evento, paso y timestamp. El acceso HTTP no registra cuerpos ni cabeceras (`quarkus.http.access-log.enabled=false`); los errores al cliente son genéricos. Los datos operativos necesarios para el onboarding permanecen en H2 y no se copian a los eventos. No se utilizan personas ni documentos reales, correo externo, dinero real, ni servicios productivos. Esta configuración es exclusivamente para la demo local y no representa una revisión de seguridad de producción.
