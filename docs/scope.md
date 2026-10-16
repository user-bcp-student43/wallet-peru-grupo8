# Alcance

## Estado y versión

Este es el alcance vigente del nuevo onboarding. El frontend y backend base están implementados con pruebas automatizadas; la integración con Mailpit real y la aceptación end-to-end aún están pendientes. La versión anterior descrita en [wallet-demo-sprints.md](./wallet-demo-sprints.md) se conserva como referencia histórica. Las decisiones abiertas se centralizan en [decisions-assumptions-limitations.md](./decisions-assumptions-limitations.md).

## Objetivo

Demostrar el registro y activación de una wallet ficticia, verificación de correo por OTP y creación de PIN, sin revisión humana.

## Incluido

- Formulario de tipo de documento (DNI o pasaporte), número de documento y correo personal.
- Búsqueda por tipo y número de documento en datos sintéticos del backend para recuperar nombre y apellido.
- Envío de OTP al iniciar la solicitud, sin etapa ni interfaz de revisión humana.
- Flujo de usuario de tres pantallas: datos, OTP y PIN.
- Registro del cliente en la aplicación y wallet con S/ 100.00 PEN ficticios, acreditados una sola vez.
- Activación de la wallet y crédito inicial implementados de forma atómica e idempotente: los reintentos no duplican la wallet ni el crédito.
- Pantalla inicial con nombre, apellido y saldo obtenido del backend.
- Indicador de progreso con el paso actual visible durante el onboarding.
- Eventos mínimos de inicio, avance de paso y cierre para analítica, sin PII.

## Fuera de alcance

- Consulta a registros oficiales, KYC y registro ante entidades externas.
- Envío de correo real, fondos reales, transferencias, retiros o procesamiento de pagos.
- Uso de documentos, correos, OTP o PIN reales.
- Producción, recuperación de cuenta y autenticación de producción.
- Reporte de cohortes de lanzamiento y validación real de objetivos MAU/CAC o reducción de tiempo; la demo solo verifica instrumentación sin PII.

Ver [onboarding.md](./onboarding.md) para el flujo detallado, criterios y riesgos. Podman, H2 en memoria y Mailpit local están acordados para infraestructura; consultar [decisiones](./decisions-assumptions-limitations.md).
