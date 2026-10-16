# Alcance

## Objetivo

Demostrar el registro y activación de una wallet ficticia con revisión humana (HITL), verificación de correo por OTP y creación de PIN.

## Incluido

- Formulario de tipo de documento, DNI y correo personal.
- Búsqueda de DNI en datos sintéticos del backend para recuperar nombre y apellido.
- Revisión humana autorizada antes de enviar OTP.
- Flujo de usuario de tres pantallas: datos/revisión, OTP y PIN.
- Registro del cliente en la aplicación y wallet con S/ 100.00 PEN ficticios, acreditados una sola vez.
- Pantalla inicial con nombre, apellido y saldo obtenido del backend.
- Indicador de progreso con el paso actual visible durante el onboarding.
- Eventos mínimos de inicio, avance de paso y cierre para analítica, sin PII.

## Fuera de alcance

- Consulta a registros oficiales, KYC y registro ante entidades externas.
- Envío de correo real, fondos reales, transferencias, retiros o pagos reales.
- Uso de documentos, correos, OTP o PIN reales.
- Producción, recuperación de cuenta y autenticación de producción.
- Reporte de cohortes de lanzamiento y validación real de objetivos MAU/CAC o reducción de tiempo; la demo solo verifica instrumentación sin PII.

Ver [onboarding.md](./onboarding.md) para el flujo detallado, criterios y riesgos.
