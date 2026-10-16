# Tasks

Referencias: `US-CA-01` a `US-CA-10` corresponden a `docs/user-stories-and-acceptance.md`; `ONB-CA-11` corresponde al criterio 11 de `docs/onboarding.md`; `TC-01` a `TC-12` corresponden a `docs/TESTING.md`.

## 1. Gates de decisión antes de implementar comportamientos afectados

- [x] 1.1 Acordar qué ocurre operativamente cuando el lookup no encuentra una persona, sin añadir una respuesta de rechazo que revele la coincidencia; actualizar `docs/decisions-assumptions-limitations.md`, `docs/ENDPOINTS.md` y la spec, y verificar que el flujo permitido queda inequívoco (US-CA-02, US-CA-03; TC-04).
- [x] 1.2 Acordar vigencia y reenvío OTP, además del mecanismo de protección de OTP/PIN; actualizar decisiones y contrato, y verificar que límites, errores y almacenamiento/logging quedan especificados sin exponer credenciales (US-CA-04, US-CA-07; TC-06, TC-07, TC-11).
- [x] 1.3 Confirmar persistencia local (H2 u opción aprobada), buzón (Mailpit u opción aprobada) y mecanismo/intervalo de consulta de estado; actualizar arquitectura, contrato y comandos de ejecución, y verificar que las decisiones se identifican como aprobadas y reproducibles.

## 2. Frontend

- [x] 2.1 Sustituir en `frontend/src/App.tsx` el flujo anterior de alias y pago por las pantallas de datos, OTP y PIN, con pasos actual/pendientes, validación de campos y navegación habilitada solo por el estado autoritativo del servicio; verificar casos válidos e inválidos en pruebas del frontend (US-CA-01, US-CA-02, US-CA-04, US-CA-05, US-CA-08; TC-01, TC-02, TC-05, TC-08).
- [x] 2.2 Implementar un cliente tipado para inicio, consulta, verificación y finalización conforme al contrato API acordado; conservar `requestId` y token solo en memoria y verificar requests, transiciones y errores con pruebas del cliente sin acceso directo a datos (US-CA-02, US-CA-04, US-CA-05, US-CA-08; TC-02, TC-03, TC-05, TC-06).
- [x] 2.3 Implementar bienvenida con nombre, apellido y saldo recibidos del backend, mostrar S/ 100.00 como saldo ficticio y evitar ejecutar pagos; verificar datos de respuesta, estado no activo antes de confirmación y ausencia de controles de pago ejecutables (US-CA-06, US-CA-10; ONB-CA-11; TC-09, TC-10).
- [x] 2.4 Asegurar accesibilidad, correcciones accionables y privacidad visible del cliente; verificar uso por teclado, lectura de progreso/errores, diseño móvil y que token, DNI, correo, OTP y PIN no se guardan en almacenamiento persistente ni se escriben en consola (US-CA-01, US-CA-07, US-CA-08; TC-01, TC-11).
- [x] 2.5 Actualizar `frontend/README.md` con ejecución, fixtures sintéticos, flujo, límites y distinción entre demo local y backend integrado; verificar que los comandos documentados corresponden a scripts existentes y que no se presenta el servicio anterior como nueva integración.

## 3. Backend

- [x] 3.1 Crear el servicio Java + Quarkus y publicar OpenAPI para iniciar solicitud, consultar estado, verificar OTP y completar registro; incorporar validación de requests y errores seguros del contrato y verificar con pruebas REST los códigos, DTOs, autorización y estados (US-CA-02, US-CA-04, US-CA-05; TC-02, TC-03, TC-05, TC-08).
- [x] 3.2 Implementar repositorios y fixtures completamente sintéticos para búsqueda DNI/pasaporte, aplicando la decisión aprobada para casos sin coincidencia; verificar lookup por tipo y documento y que respuestas no revelan coincidencias (US-CA-02, US-CA-03; TC-02, TC-04).
- [x] 3.3 Implementar emisión y validación OTP de cuatro dígitos según las decisiones aprobadas, incluidos tres intentos, vencimiento, reutilización y reenvío solo si se aprobó; verificar casos correctos/incorrectos y agotamiento, sin escribir OTP ni PIN en logs (US-CA-04, US-CA-05, US-CA-07; TC-05, TC-06, TC-07, TC-11).
- [x] 3.4 Implementar la finalización solo desde `OTP_VERIFIED` con alta, wallet activa y movimiento inicial `10000` céntimos PEN dentro de una transacción idempotente; verificar rollback ante fallo y reintentos que dejan exactamente una wallet y un crédito (US-CA-05, US-CA-06, US-CA-10; TC-08, TC-09, TC-10).
- [x] 3.5 Implementar eventos de inicio, pasos completados y cierre y trazabilidad con ID opaco; verificar con pruebas usando datos sintéticos marcadores que logs, errores, auditoría, analítica y trazas excluyen PII, OTP, PIN, tokens y cuerpos HTTP (US-CA-07, US-CA-09; TC-11, TC-12).
- [x] 3.6 Documentar configuración y ejecución del backend y sus pruebas en `backend/README.md`, incluyendo las decisiones aprobadas y límites de demo; verificar una ejecución limpia desde los comandos documentados sin enviar correo externo ni usar datos reales.

## 4. Integración

- [x] 4.1 Conectar el frontend al backend ejecutable y al buzón/persistencia seleccionados, manteniendo el token fuera de URL y almacenamiento duradero; verificar el recorrido iniciado por DNI y por pasaporte a través de API real y confirmar que los datos de bienvenida y saldo provienen del backend (US-CA-01 a US-CA-08; TC-01 a TC-10).
- [x] 4.2 Configurar el entorno local con Podman y los componentes aprobados, preparar carga reproducible de fixtures y health checks; verificar arranque, disponibilidad de servicios y reinicio del entorno de demo según la decisión de persistencia.
- [x] 4.3 Alinear OpenAPI, `docs/ENDPOINTS.md` y DTOs frontend/backend; verificar automáticamente o mediante pruebas de contrato que rutas, esquemas, estados y códigos coinciden y que el endpoint de reenvío solo refleja una política aprobada (US-CA-02, US-CA-04, US-CA-05).

## 5. Pruebas y evidencia de aceptación

- [x] 5.1 Ejecutar y registrar la matriz de `docs/TESTING.md` (TC-01 a TC-12), incluyendo errores de entrada, OTP, PIN, reintentos idempotentes, bienvenida y progresión; adjuntar comandos/resultados reales y marcar explícitamente los escenarios bloqueados por decisiones no aprobadas (US-CA-01 a US-CA-10; ONB-CA-11).
- [ ] 5.2 Verificar privacidad de extremo a extremo con valores sintéticos distintivos en frontend, API, buzón y trazas; comprobar ausencia de PII/OTP/PIN/token/cuerpos HTTP y presencia de IDs opacos y eventos requeridos, conservando evidencia redactada (US-CA-07, US-CA-09; TC-11, TC-12).
- [ ] 5.3 Actualizar `docs/demo-script.md` con el recorrido implementado, pasos de consulta del OTP y reintento de activación; verificar el guion desde un entorno limpio y dejar claro que el saldo es ficticio y no se procesan pagos.
