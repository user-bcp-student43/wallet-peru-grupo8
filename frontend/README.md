# Frontend

Código fuente de la aplicación frontend.

## Estructura

- `src/`: código fuente de la aplicación.
- `.env.example`: plantilla de variables de entorno.

## Tecnología

- React + TypeScript + Vite.

El frontend consume la API del backend Quarkus; no se conecta directamente a la base de datos.
Mostrar solo los datos requeridos en cada pantalla; no escribir DNI, nombre, apellido, correo, OTP o PIN en consola, telemetría, URLs ni mensajes de error. En capturas y vistas de revisión, ofuscar datos personales cuando no se requiera verlos completos. Mantener el token de seguimiento solo en memoria de sesión y no guardar datos personales en `localStorage`.

Los comandos de ejecución se documentarán cuando se configure el proyecto. Consultar el [contrato API](../docs/ENDPOINTS.md) y las [pruebas](../docs/TESTING.md).
