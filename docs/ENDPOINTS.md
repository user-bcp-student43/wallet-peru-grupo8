# Contrato de endpoints — onboarding demo

Versión inicial para coordinar React y Quarkus. El contrato describe la demo seleccionada; no representa una API productiva. Base URL local: `/api/v1`.

## Reglas generales

- JSON UTF-8 para solicitudes y respuestas.
- El backend es autoridad para estado HITL, OTP, registro y saldo.
- El frontend nunca consulta directamente la base de datos.
- DNI, nombre, apellido, correo, OTP y PIN son datos sensibles: no registrarlos en logs, auditoría, métricas, trazas HTTP ni mensajes de error. No activar logging de cuerpos HTTP.
- Los endpoints de una solicitud requieren un token de seguimiento aleatorio en la cabecera de autorización; no registrar el token, guardarlo en URLs ni persistirlo en `localStorage`. El frontend lo mantiene en memoria de sesión.
- Las operaciones `/reviewer/*` requieren credencial de rol revisor configurada fuera del repositorio. No aceptar decisiones de revisión de la sesión del usuario.
- IDs de solicitud son aleatorios/opacos, no derivados de DNI, correo u otro dato personal. No usar hashes simples de estos datos como IDs: son susceptibles a enumeración.
- Política CORS local: permitir solo el origin del frontend configurado para desarrollo.

## Estados

`PENDING_REVIEW` → `OTP_PENDING` → `OTP_VERIFIED` → `ACTIVE`

La decisión negativa resulta en `REJECTED`. Un OTP inválido no cambia el estado; al alcanzar el límite, la solicitud queda bloqueada para verificación. Los estados terminales no se pueden reabrir en esta demo.

## 1. Iniciar solicitud de onboarding

`POST /api/v1/onboarding-requests`

```json
{
  "documentType": "DNI",
  "documentNumber": "<DNI_SINTETICO>",
  "email": "<CORREO_SINTETICO>"
}
```

Respuesta `202 Accepted`:

```json
{
  "requestId": "<UUID_OPACO>",
  "trackingToken": "<TOKEN_ALEATORIO>",
  "status": "PENDING_REVIEW",
  "message": "Tu solicitud está en revisión."
}
```

El servidor busca la persona por tipo y número de documento, compara el correo asociado y coloca la solicitud en la cola HITL. No envía OTP ni crea una cuenta o wallet en esta etapa. El resultado de la coincidencia no se devuelve al solicitante.

## 2. Consultar estado de la solicitud

`GET /api/v1/onboarding-requests/{requestId}/status`

Requiere token de seguimiento. Respuesta `200 OK`:

```json
{
  "requestId": "<UUID_OPACO>",
  "status": "PENDING_REVIEW",
  "nextStep": "WAIT_FOR_REVIEW",
  "message": null
}
```

Al aprobar, `status` cambia a `OTP_PENDING` y `nextStep` a `ENTER_OTP`. Al rechazar, `status` es `REJECTED`, `nextStep` es `NONE` y `message` contiene exactamente: `Su registro está en evaluación. Nos estaremos comunicando contigo en las siguientes horas`.

El frontend consulta este estado cada 3 segundos mientras esté pendiente y detiene las consultas al llegar a un estado terminal; no registrar token ni respuesta completa. El correlador aleatorio puede vincularse internamente a una solicitud operativa, cuyo acceso está restringido.

## 3. Listar solicitudes pendientes para revisión

`GET /api/v1/reviewer/onboarding-requests?status=PENDING_REVIEW`

Requiere rol revisor. Devuelve solo las solicitudes pendientes y la información mínima ofuscada necesaria para la decisión; nunca incluir DNI, correo o nombre completos:

```json
{
  "items": [
    {
      "requestId": "<UUID_OPACO>",
      "documentNumberMasked": "******<ULTIMOS_2>",
      "nameMasked": "<INICIALES>",
      "emailMasked": "<CORREO_OFUSCADO>",
      "syntheticRecordMatch": true,
      "createdAt": "<FECHA_ISO_8601>"
    }
  ]
}
```

Los marcadores son ilustrativos; se usarán únicamente fixtures ficticios. Como regla visual, el documento muestra solo los últimos dos dígitos, los nombres solo iniciales y el correo queda enmascarado sin mostrar el dominio completo. La decisión humana se registra con actor seudónimo, decisión y fecha/hora, sin datos personales ni texto libre que pueda contenerlos.

## 4. Registrar decisión HITL

`POST /api/v1/reviewer/onboarding-requests/{requestId}/decision`

Requiere rol revisor.

```json
{ "decision": "APPROVE" }
```

o

```json
{ "decision": "REJECT" }
```

Respuesta `200 OK`:

```json
{
  "requestId": "<UUID_OPACO>",
  "status": "OTP_PENDING"
}
```

Con `APPROVE`, el servidor emite el OTP al buzón simulado y cambia el estado. Con `REJECT`, cambia a `REJECTED` y no envía OTP. Si la decisión ya fue registrada, responder `409 Conflict` sin cambiar datos.

## 5. Verificar OTP

`POST /api/v1/onboarding-requests/{requestId}/otp/verify`

```json
{ "code": "<OTP_DE_4_DIGITOS>" }
```

Respuesta `200 OK`:

```json
{ "requestId": "<UUID_OPACO>", "status": "OTP_VERIFIED" }
```

Solo el verificador asociado a la solicitud puede validar el código. No se devuelve el OTP ni información que permita reconstruirlo.

## 6. Reenviar OTP

`POST /api/v1/onboarding-requests/{requestId}/otp/resend`

Respuesta `202 Accepted`:

```json
{ "requestId": "<UUID_OPACO>", "status": "OTP_PENDING" }
```

Aplican los límites definidos en `onboarding.md`. Responder `429 Too Many Requests` si se exceden.

## 7. Completar registro y activar wallet

`POST /api/v1/onboarding-requests/{requestId}/complete`

```json
{ "pin": "<PIN_NUMERICO_DE_4_DIGITOS>" }
```

Solo se acepta en estado `OTP_VERIFIED`. Respuesta `201 Created`:

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
| 401/403 | `UNAUTHORIZED` / `FORBIDDEN` | Token de usuario ausente/inválido o rol insuficiente. |
| 404 | `REQUEST_NOT_FOUND` | Solicitud no accesible; no revelar si una persona existe. |
| 409 | `INVALID_STATE` | Acción incompatible con estado actual o decisión ya resuelta. |
| 422 | `INVALID_OTP` | OTP inválido; mensaje sin reflejar valor recibido. |
| 429 | `RATE_LIMITED` | Límite de intentos o reenvíos alcanzado. |
| 500 | `INTERNAL_ERROR` | Error genérico; detalle solo en canal técnico sin PII. |

## Pendiente de implementación

- Publicar el contrato como OpenAPI al crear el servicio Quarkus y validar que request/response y códigos coincidan con esta especificación.
- Acordar el mecanismo de actualización del estado pendiente (consulta periódica es suficiente para la demo).
- Mantener ejemplos solo con marcadores o fixtures sintéticos y no copiar valores sensibles a tickets, capturas ni trazas.
