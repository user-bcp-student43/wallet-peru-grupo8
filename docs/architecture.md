# Arquitectura

> **Estado:** el flujo frontend y el servicio Quarkus con H2, fixtures sintéticos y envío SMTP están implementados y cuentan con pruebas automatizadas. La integración del frontend con Mailpit real, el entorno Podman reproducible y la aceptación end-to-end siguen pendientes. El polling cada tres segundos está implementado en frontend. Las decisiones pendientes están centralizadas en [decisions-assumptions-limitations.md](./decisions-assumptions-limitations.md).

## Stack acordado

- **Frontend:** React + TypeScript + Vite.
- **Backend:** Java + Quarkus.
- **Infraestructura local:** Podman.
- **Datos:** H2 en memoria con fixtures sintéticos; reiniciar el backend limpia el estado de demo. Encapsular el acceso mediante repositorios Quarkus.

## Componentes y responsabilidades

- **Frontend de usuario:** tres pantallas de onboarding y pantalla inicial; envía solicitudes a la API y captura OTP/PIN.
- **API Quarkus:** valida datos, busca persona por tipo/número de documento (DNI o pasaporte), crea solicitud, emite y valida OTP, registra cuenta de aplicación, crea wallet y devuelve los datos necesarios para la pantalla inicial.
- **Capa de datos Quarkus:** repositorios/DAO y entidades. Separar como mínimo persona sintética, solicitud de onboarding, registro/cuenta de aplicación, wallet y movimiento de saldo.
- **Trazabilidad/auditoría:** conserva ID aleatorio/opaco de solicitud, tipo de evento, estado, actor seudónimo y fecha/hora de decisión. No conserva datos personales en logs ni eventos. DNI, nombre, apellido y correo se omiten por defecto; si un diagnóstico requiere mostrarlos, se ofuscan antes de escribir cualquier traza. No usar hashes simples de datos personales como correladores.
- **Analítica de onboarding:** registra inicio, paso completado y cierre usando ID opaco y timestamps, sin DNI, nombre, apellido, correo, OTP, PIN ni payloads.
- **Correo de demo:** Mailpit local en Podman como buzón SMTP simulado. No se envían correos reales.

## Flujo de onboarding

1. **Pantalla 1 — datos:** el flujo envía tipo de documento (DNI o pasaporte), número de documento y correo a Quarkus, que consulta las personas sintéticas. El inicio y la verificación OTP no revelan el resultado del lookup; para documentos sin coincidencia, la finalización bloquea la activación con error genérico, aceptando la inferencia indirecta como riesgo residual.
2. **Pantalla 2 — OTP:** al iniciar la solicitud, Quarkus genera OTP de cuatro dígitos y lo entrega al buzón simulado. El usuario introduce el OTP dentro de cinco minutos; se permiten tres intentos y, al agotarlos, se muestra un mensaje de intentos permitidos agotados y se bloquea la verificación de ese código. No hay reenvío. El frontend consulta el estado cada tres segundos mientras espera y detiene el polling al verificar OTP o al fallar.
3. **Pantalla 3 — PIN:** solo si el OTP es válido, React habilita PIN numérico de cuatro dígitos. Al continuar, Quarkus registra la cuenta de aplicación, activa la wallet y acredita S/ 100.00 PEN de demo.
4. **Inicio:** frontend muestra nombre y apellido recuperados por tipo/número de documento y el saldo devuelto por Quarkus.

## Modelo de datos conceptual

- `demo_person`: identificador, tipo y número de documento sintéticos (DNI o pasaporte), nombre, apellido y correo sintético asociado. Índice único por tipo y número de documento.
- `onboarding_request`: identificador aleatorio, referencia a persona asociada cuando haya coincidencia, estado, correo ingresado y fecha de creación. Los datos personales operativos se mantienen con acceso restringido y separados de trazas; no duplicarlos innecesariamente.
- `audit_event`: identificador aleatorio de solicitud, evento, estado anterior/nuevo, actor técnico seudónimo cuando aplique y marca temporal; sin DNI, nombre, apellido, correo, OTP o PIN. No registrar payloads HTTP.
- `onboarding_analytics_event`: ID aleatorio de solicitud, nombre de evento permitido (`ONBOARDING_STARTED`, `STEP_COMPLETED`, `ONBOARDING_CLOSED`), paso y timestamp. No guardar datos de formulario ni identificadores derivados de datos personales.
- `otp_challenge`: referencia a solicitud, HMAC-SHA-256, sal aleatoria, fecha de emisión/vencimiento, intentos y fecha de consumo. Se permiten tres intentos y no hay reenvío; el HMAC usa una clave secreta externa a la aplicación. El PIN usa la misma estrategia de almacenamiento con una sal aleatoria por credencial.
- `app_customer`: registro de cliente dentro de esta aplicación, ligado a persona; único por persona.
- `wallet` y `wallet_movement`: moneda PEN, saldo en céntimos enteros y movimiento inicial identificable/único. La cuenta, wallet y movimiento inicial se crean de forma transaccional al completar el PIN.

El repositorio Quarkus deberá aislar la aplicación del motor concreto. Los datos de persona serán fixtures sintéticos; no se consulta un padrón externo. La activación y el crédito inicial de `10000` céntimos deben ser atómicos e idempotentes: el crédito se asigna una sola vez y no se sobrescribe ni duplica en reintentos. El nuevo alcance no procesa pagos.

## Límites

- El saldo es ficticio, no retirable y solo para demo.
- Ningún componente accede a datos reales ni realiza correo o transacciones reales.
- Los registros operativos que requieran datos personales para el flujo se mantienen separados de auditoría y analítica, con acceso restringido. Las trazas usan IDs aleatorios/opacos de solicitud; se omiten los datos personales siempre que sea posible.
- Podman, H2 en memoria y Mailpit local están acordados para infraestructura de demo.
- El OTP vence a los cinco minutos, permite tres intentos y no se reenvía.
- OTP y PIN se conservan como HMAC-SHA-256 con sal aleatoria por credencial y clave externa; se comparan en tiempo constante y no se registran en claro. Esta decisión es para demo local y no constituye aprobación para producción.
