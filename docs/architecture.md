# Arquitectura

## Stack acordado

- **Frontend:** React + TypeScript + Vite.
- **Backend:** Java + Quarkus.
- **Datos:** usar H2 en memoria como propuesta para el ciclo local de demo, cargando fixtures sintéticos al iniciar; encapsular el acceso mediante repositorios Quarkus. Se reinicia el estado al reiniciar la app.

## Componentes y responsabilidades

- **Frontend de usuario:** tres pantallas de onboarding y pantalla inicial; envía solicitudes a la API, muestra el estado de revisión y captura OTP/PIN.
- **Interfaz de revisión humana:** presenta solicitudes pendientes y permite a una persona revisora autorizada aprobar o rechazar. Puede ser una vista de demo o una operación equivalente; la forma concreta y autenticación están pendientes.
- **API Quarkus:** valida datos, busca persona por DNI, crea solicitud pendiente, aplica decisiones autorizadas, gestiona OTP, registra cuenta de aplicación, crea wallet y devuelve los datos necesarios para la pantalla inicial.
- **Capa de datos Quarkus:** repositorios/DAO y entidades. Separar como mínimo persona sintética, solicitud de onboarding, registro/cuenta de aplicación, wallet y movimiento de saldo.
- **Trazabilidad/auditoría:** conserva ID aleatorio/opaco de solicitud, tipo de evento, estado, actor seudónimo y fecha/hora de decisión. No conserva datos personales en logs ni eventos. DNI, nombre, apellido y correo se omiten por defecto; si un diagnóstico requiere mostrarlos, se ofuscan antes de escribir cualquier traza. No usar hashes simples de datos personales como correladores.
- **Analítica de onboarding:** registra inicio, paso completado y cierre usando ID opaco y timestamps, sin DNI, nombre, apellido, correo, OTP, PIN ni payloads.
- **Correo de demo:** Mailpit local como buzón SMTP simulado; no se envían correos reales.

## Flujo de onboarding

1. **Pantalla 1 — datos y revisión:** React envía tipo de documento, DNI y correo a Quarkus. El backend busca DNI en las personas sintéticas y compara el correo con el asociado. La solicitud queda pendiente de revisión; no se envía OTP ni se activa nada.
2. **HITL:** la persona revisora autorizada consulta la solicitud y la información mínima para decidir. El backend registra estado, revisor y fecha. Mientras está pendiente, el frontend mantiene el paso de revisión.
3. **Decisión:** aprobación habilita el paso OTP. Rechazo mantiene al usuario en la pantalla 1 y muestra: “Su registro está en evaluación. Nos estaremos comunicando contigo en las siguientes horas”. La respuesta al usuario no revela el motivo.
4. **Pantalla 2 — OTP:** solo después de aprobación, Quarkus genera OTP de cuatro dígitos y lo entrega al buzón simulado. Un verificador protegido con secreto del servidor se guarda asociado a solicitud, expiración e intentos; el usuario introduce el OTP y Quarkus lo valida una sola vez.
5. **Pantalla 3 — PIN:** solo si el OTP es válido, React habilita PIN numérico de cuatro dígitos. Al continuar, Quarkus registra la cuenta de aplicación, activa la wallet y acredita S/ 100.00 PEN de demo.
6. **Inicio:** frontend muestra nombre y apellido recuperados por DNI y el saldo devuelto por Quarkus.

## Modelo de datos conceptual

- `demo_person`: identificador, tipo y número de documento sintéticos, nombre, apellido y correo sintético asociado. Índice único por tipo y número de documento.
- `onboarding_request`: identificador aleatorio, referencia a persona cuando exista, estado, correo ingresado, fecha de creación y decisión HITL (revisor, resultado y fecha). Los datos personales operativos se mantienen con acceso restringido y separados de trazas; no duplicarlos innecesariamente.
- `audit_event`: identificador aleatorio de solicitud, evento, estado anterior/nuevo, actor seudónimo y marca temporal; sin DNI, nombre, apellido, correo, OTP o PIN. No registrar payloads HTTP.
- `onboarding_analytics_event`: ID aleatorio de solicitud, nombre de evento permitido (`ONBOARDING_STARTED`, `STEP_COMPLETED`, `ONBOARDING_CLOSED`), paso y timestamp. No guardar datos de formulario ni identificadores derivados de datos personales.
- `otp_challenge`: referencia a solicitud, verificador del OTP protegido con secreto del servidor, expiración, intentos, envíos y fecha de consumo. Nunca guardar el OTP en claro ni devolverlo al frontend.
- `app_customer`: registro de cliente dentro de esta aplicación, ligado a persona; único por persona.
- `wallet` y `wallet_movement`: moneda PEN, saldo en céntimos enteros y movimiento inicial identificable/único. La cuenta, wallet y movimiento inicial se crean de forma transaccional al completar el PIN.

El repositorio Quarkus aísla la aplicación del motor concreto. Los datos de persona son fixtures sintéticos; no se consulta un padrón externo. El saldo inicial `10000` céntimos se asigna una sola vez y no se sobrescribe ni duplica en reintentos.

## Límites

- El saldo es ficticio, no retirable y solo para demo.
- Ningún componente accede a datos reales ni realiza correo o transacciones reales.
- La operación de decisión HITL debe requerir autorización; el mecanismo de autenticación de revisores queda pendiente.
- Propuesta para demo: vista de revisor protegida por credencial local de entorno, nunca versionada, y polling del estado del onboarding cada 3 segundos hasta aprobación/rechazo.
- Los registros operativos que requieran datos personales para el flujo se mantienen separados de auditoría y analítica, con acceso restringido. Las trazas usan IDs aleatorios/opacos de solicitud; se omiten los datos personales siempre que sea posible.
- H2 en memoria y Mailpit son recomendaciones locales por simplicidad; verificar disponibilidad de Docker para Mailpit y actualizar estas decisiones si el entorno del equipo no lo soporta.
