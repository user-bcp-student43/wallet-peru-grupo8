# Contrato de endpoints — onboarding demo

Contrato implementado por el servicio Quarkus y publicado como OpenAPI; las pruebas REST cubren rutas, estados, validación y autorización. La integración end-to-end con Mailpit real y la verificación automatizada completa contra los DTOs frontend siguen pendientes. Se admiten DNI y pasaporte, no hay etapa de revisión humana y el OTP de cuatro dígitos vence a los cinco minutos, permite tres intentos y no se puede reenviar. OTP y PIN se guardan como HMAC-SHA-256 con sal aleatoria por credencial y una clave secreta externa; las comparaciones son en tiempo constante y no se registran credenciales en claro. El frontend consulta el estado cada tres segundos mientras espera y detiene el polling al verificar OTP o al fallar. Ver [decisiones](./decisions-assumptions-limitations.md) y [onboarding](./onboarding.md). Este contrato no incluye procesamiento de pagos; sí contempla activación y crédito inicial idempotentes. Base URL: `/api/v1`.

## Reglas generales

- JSON UTF-8 para solicitudes y respuestas.
- El backend es autoridad para estado de solicitud, OTP, registro y saldo.
- El frontend nunca consulta directamente la base de datos.
- DNI, nombre, apellido, correo, OTP y PIN son datos sensibles: no registrarlos en logs, auditoría, métricas, trazas HTTP ni mensajes de error. No activar logging de cuerpos HTTP.
- Los endpoints de una solicitud requieren un token de seguimiento aleatorio en la cabecera de autorización; no registrar el token, guardarlo en URLs ni persistirlo en `localStorage`. El frontend lo mantiene en memoria de sesión.
- El formato del encabezado protegido es `Authorization: Bearer <TOKEN_ALEATORIO>`.
- En los endpoints posteriores al inicio, enviar el token como `Authorization: Bearer <TOKEN_ALEATORIO>`.
- IDs de solicitud son aleatorios/opacos, no derivados de DNI, correo u otro dato personal. No usar hashes simples de estos datos como IDs: son susceptibles a enumeración.
- Política CORS local: permitir solo el origin del frontend configurado para desarrollo.

## Estados

`OTP_PENDING` → `OTP_VERIFIED` → `ACTIVE`

No hay estados ni decisiones de revisión humana. Un OTP inválido no permite avanzar; después de tres intentos fallidos se bloquea la verificación de ese código. Los estados terminales no se pueden reabrir en esta demo.

## 1. Iniciar solicitud de onboarding

`POST /api/v1/onboarding-requests`

```json
{
  "documentType": "DNI",
  "documentNumber": "<DOCUMENTO_SINTETICO>",
  "email": "<CORREO_SINTETICO>"
}
```

Respuesta `202 Accepted`:

```json
{
  "requestId": "<UUID_OPACO>",
  "trackingToken": "<TOKEN_ALEATORIO>",
  "status": "OTP_PENDING",
  "message": "Ingresa el código enviado a tu correo."
}
```

El backend busca por tipo y número de documento en los datos sintéticos y emite el OTP al buzón simulado al iniciar la solicitud. Los tipos admitidos son `DNI` y `PASSPORT`. La respuesta de inicio es la misma con o sin coincidencia y no comunica el resultado del lookup. Para documentos sin coincidencia, el flujo permite verificar el OTP, pero la finalización no crea cliente ni wallet y devuelve el error genérico `ONBOARDING_NOT_COMPLETABLE`. Se acepta que comparar este resultado con una activación exitosa permite inferir indirectamente la coincidencia; es un riesgo residual aprobado para la demo.

## 2. Consultar estado de la solicitud

`GET /api/v1/onboarding-requests/{requestId}/status`

Requiere token de seguimiento. Respuesta `200 OK`:

```json
{
  "requestId": "<UUID_OPACO>",
  "status": "OTP_PENDING",
  "nextStep": "ENTER_OTP",
  "message": null
}
```

Al validar correctamente el OTP, `status` cambia a `OTP_VERIFIED` y `nextStep` pasa a `CREATE_PIN`.

El frontend consulta el estado cada tres segundos mientras la solicitud espera y detiene el polling al verificar OTP o al fallar; no hay paso de revisión. No registrar token ni respuesta completa. El correlador aleatorio puede vincularse internamente a una solicitud operativa, cuyo acceso está restringido.

## 3. Verificar OTP

`POST /api/v1/onboarding-requests/{requestId}/otp/verify`

```json
{ "code": "<OTP_DE_4_DIGITOS>" }
```

Respuesta `200 OK`:

```json
{ "requestId": "<UUID_OPACO>", "status": "OTP_VERIFIED" }
```

La verificación ocurre en el backend. El OTP vence cinco minutos después de su emisión. El backend conserva solo HMAC-SHA-256 calculado con una sal aleatoria por credencial y una clave secreta externa a la aplicación; compara en tiempo constante. El código en claro solo está disponible transitoriamente para su entrega al buzón simulado. No se devuelve ni registra el OTP.

Se permiten tres intentos de verificación por código. Al agotarlos, la verificación se bloquea y responde `ATTEMPTS_EXHAUSTED`. Los códigos incorrectos o vencidos responden con `INVALID_OTP`, sin distinguir el motivo. No se permite reenviar el OTP.

## 4. Reenvío OTP

No se publica ni implementa un endpoint de reenvío OTP en esta demo.

## 5. Completar registro y activar wallet

`POST /api/v1/onboarding-requests/{requestId}/complete`

```json
{ "pin": "<PIN_NUMERICO_DE_4_DIGITOS>" }
```

Solo se acepta en estado `OTP_VERIFIED`. El PIN se conserva únicamente como HMAC-SHA-256 con sal aleatoria por credencial y clave secreta externa a la aplicación; la comparación es en tiempo constante. No registrar el PIN en claro. Respuesta `201 Created`:

```json
{
  "requestId": "<UUID_OPACO>",
  "status": "ACTIVE",
  "customer": {
    "firstName": "<NOMBRE_SINTETICO>",
    "lastName": "<APELLIDO_SINTETICO>"
  },
  "wallet": {
    "currency": "PEN",
    "balanceMinorUnits": 10000
  }
}
```

La respuesta contiene datos para la vista de bienvenida, pero nunca se registra en logs/trazas. La creación de cliente, wallet y crédito inicial debe ser atómica e idempotente. El frontend no persiste estos datos en almacenamiento local duradero.

## Errores comunes

Formato: `{ "code": "<CODIGO>", "message": "<MENSAJE_SEGURO>" }`. Los mensajes no deben incluir datos ingresados.

| HTTP | Código | Uso |
|---|---|---|
| 400 | `INVALID_INPUT` | Campos/formato no válidos. |
| 401 | `UNAUTHORIZED` | Token de seguimiento ausente o inválido. |
| 404 | `REQUEST_NOT_FOUND` | Solicitud no accesible; no revelar si una persona existe. |
| 409 | `INVALID_STATE` | Acción incompatible con el estado actual. |
| 422 | `ONBOARDING_NOT_COMPLETABLE` | No se puede completar el registro; no explica el motivo ni incluye datos ingresados. |
| 422 | `INVALID_OTP` | OTP incorrecto o vencido antes de agotar los tres intentos; mensaje sin distinguir el motivo ni reflejar valor recibido. |
| 429 | `ATTEMPTS_EXHAUSTED` | Se agotaron los tres intentos de OTP; informar al usuario con un mensaje como “Agotaste tus intentos permitidos”. |
| 500 | `INTERNAL_ERROR` | Error genérico; detalle solo en canal técnico sin PII. |

## Verificación pendiente

- Probar el recorrido integrado desde el frontend hasta Quarkus y el buzón Mailpit real.
- Validar automáticamente que todos los request/response DTOs y códigos de estado coinciden con esta especificación.
- Mantener ejemplos solo con marcadores o fixtures sintéticos y no copiar valores sensibles a tickets, capturas ni trazas.
