# Design

## Context

Ver [proposal.md](./proposal.md) para la motivación y [specs/wallet-onboarding/spec.md](./specs/wallet-onboarding/spec.md) para el comportamiento verificable. La UI y el cliente tipado del nuevo onboarding están implementados en el frontend, pero no hay integración end-to-end porque `backend/src/main/` y `backend/src/test/` solo contienen marcadores y el backend carece de aplicación, build y pruebas ejecutables.

La arquitectura es React + TypeScript + Vite y Java + Quarkus. El frontend y el servicio backend ejecutable con H2 en memoria y fixtures sintéticos están implementados; las pruebas automatizadas frontend y REST cubren los flujos locales. Mailpit está configurado como SMTP, pero la integración real con el buzón, el entorno Podman reproducible y el recorrido end-to-end no están verificados. No existen capacidades en `openspec/specs/`; el cambio anterior `sprint-1-wallet-frontend` se conserva sin modificar.

## Goals / Non-Goals

**Goals:**

- Definir un límite claro entre la UI y la API y mantener al backend como autoridad de estados, identidad sintética y saldo.
- Implementar el recorrido con los estados `OTP_PENDING` → `OTP_VERIFIED` → `ACTIVE`, sin decisión humana.
- Garantizar que alta, wallet y crédito inicial se confirmen juntos o no se confirmen, y que la restricción de unicidad impida duplicar el crédito en reintentos.
- Usar H2 en memoria y Mailpit como infraestructura local de demo, manteniendo persistencia y correo detrás de interfaces sustituibles.
- Alinear requests, responses y errores implementados con `docs/ENDPOINTS.md`, actualizando el contrato si el equipo acuerda cambios.

**Non-Goals:**

- Reabrir la decisión de persistencia local, buzón o intervalo de consulta de estado.
- Añadir una etapa de revisión humana, integrar registros oficiales, enviar correo externo o procesar pagos.
- Tratar la app actual simulada como evidencia de consumo de backend o alterar los artefactos del cambio anterior.

## Decisions

### Separación de cliente y autoridad de backend

El cliente React debe usar un servicio tipado de onboarding que encapsule las llamadas HTTP; no accede directamente a datos ni determina estados autoritativos. El backend implementa el contrato propuesto en `docs/ENDPOINTS.md`: iniciar solicitud, consultar estado, verificar OTP y completar registro. No se expone endpoint de reenvío OTP.

El token de seguimiento se recibe al iniciar, se envía en la cabecera definida por el contrato y se conserva solo en memoria de sesión del frontend, nunca en URL ni `localStorage`. No se registran el token ni cuerpos HTTP. El frontend consulta el estado cada tres segundos y detiene el polling al verificar el OTP o al fallar la solicitud.

**Alternativa considerada:** mantener el adaptador local de activación/pago o consultar una base desde el frontend. Se descarta para el nuevo flujo porque no satisface la integración requerida ni conserva al backend como autoridad.

### Estados explícitos y sin revisión humana

La solicitud progresa directamente de `OTP_PENDING` a `OTP_VERIFIED` y luego `ACTIVE`. El OTP se emite al iniciar; solo una verificación válida y no consumida habilita completar el PIN. Se conservan los tres intentos acordados y el mensaje de agotamiento. No se introduce estado de revisión, espera de aprobación ni decisión de revisor.

**Alternativa considerada:** insertar revisión entre datos y OTP conforme a la descripción inicial del pedido. Se excluye tras la aclaración del usuario que prioriza las decisiones documentadas, las cuales retiran HITL.

### Datos y efectos de activación transaccionales

El modelo conceptual separa persona sintética, solicitud, cliente de aplicación, wallet, desafío OTP y movimiento de saldo. La búsqueda se realiza por tipo y número de documento. El repositorio debe permitir unicidad de cliente/wallet y un identificador único para el crédito inicial. Completar el onboarding realiza la transición a `ACTIVE`, la creación de cuenta y wallet y el movimiento de `10000` céntimos PEN en una misma transacción. Las repeticiones devuelven un resultado coherente sin crear un segundo movimiento.

El acceso a persistencia se encapsula detrás de repositorios Quarkus y usa H2 en memoria con fixtures sintéticos; reiniciar el backend limpia el estado de demo. La plataforma local usa Podman.

**Alternativa considerada:** sumar el crédito al saldo en cada solicitud de finalización. Se descarta porque viola idempotencia.

### Correo y credenciales de demo

La emisión se integra mediante un puerto de entrega de correo simulado con Mailpit local en Podman; no se incorpora envío externo. El OTP vence cinco minutos después de su emisión, permite tres intentos y no se reenvía. OTP y PIN se conservan solo como HMAC-SHA-256 con sal aleatoria por credencial y una clave secreta externa a la aplicación; la comparación se realiza en tiempo constante. Ninguna credencial en claro se registra.

**Alternativa considerada:** enviar correo externo o dejar OTP/PIN en claro en almacenamiento/logs. Se descarta porque la demo no usa correo real y las credenciales se conservan solo como HMAC.

### Privacidad y correlación

Las operaciones usan IDs aleatorios opacos, nunca identificadores derivados de DNI o correo ni hashes simples de esos datos. Los datos personales operativos necesarios para el flujo permanecen separados de auditoría y analítica y con acceso restringido. No se capturan cuerpos HTTP ni respuestas completas en trazas. Los eventos analíticos permitidos son inicio, paso completado y cierre, con paso e instante, sin payload ni PII.

**Alternativa considerada:** incluir datos de formulario en eventos para facilitar depuración. Se descarta por el requisito de privacidad.

## Risks / Trade-offs

- [OTP y PIN tienen solo cuatro dígitos] → HMAC con clave externa reduce exposición ante filtración del repositorio de datos, pero no constituye seguridad productiva; mantener la demo local y no registrar valores en claro.
- [El error genérico al completar solicitudes sin coincidencia aún puede permitir inferir el resultado del lookup] → El equipo acepta y documenta este riesgo residual para la demo.
- [El estado H2 en memoria se reinicia con el backend] → Usar fixtures sintéticos y documentar que el reinicio limpia los datos de demo.
- [La UI anterior puede confundirse con el nuevo flujo o con integración real] → Reemplazarla en el alcance de frontend, distinguir estados de API y demo, y no declarar integrada una ejecución local.
- [Los errores y estados de red pueden exponer información o permitir transiciones inconsistentes] → Alinear errores a los códigos seguros del contrato, verificar autorización por token y validar cada transición en backend.

## Migration Plan

1. Aplicar las decisiones aprobadas de H2, Mailpit y polling cada tres segundos en la implementación local.
2. Crear el servicio Quarkus, el contrato OpenAPI y los adaptadores/repositorios de demo; desplegar localmente con Podman, sin incluir correo externo.
3. Implementar y probar primero transiciones, privacidad y activación transaccional; después conectar las pantallas React al contrato.
4. Ejecutar pruebas unitarias, integración, privacidad y recorrido; documentar evidencia distinguiendo ejecución frontend local de backend integrado.

No se requiere migración de datos existentes: el frontend actual mantiene estado en memoria y el backend no tiene datos ni servicio ejecutable. Para revertir, restaurar la experiencia anterior de frontend desde su propio historial de cambios y retirar la aplicación backend nueva; no modificar ni archivar `sprint-1-wallet-frontend`.

## Open Questions

No quedan preguntas abiertas sobre las decisiones de infraestructura local ni el intervalo de polling.
