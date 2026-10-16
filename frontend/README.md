# Billetera Demo

Aplicación frontend para reproducir el recorrido de una wallet de demostración. La entrega actual cubre la experiencia local del Sprint 1; no es una integración financiera ni una cuenta real.

## Ejecutar la demo

Requisitos: Node.js y npm.

```bash
npm install
npm run dev
```

Abre la URL local que muestra Vite y completa el recorrido:

1. En **Activa tu wallet**, ingresa un alias ficticio de 3 a 20 caracteres ASCII: letras sin acento, números o guion bajo. Por ejemplo, `demo_user`. No se aceptan espacios, guiones ni acentos. Es una regla exclusiva de la demo, no un requisito KYC.
2. Continúa a **Revisar y activar** y confirma la activación.
3. En la wallet activa, elige **Hacer una transferencia**. Revisa los valores fijos antes de confirmar: destinataria **María Demo**, importe **S/ 5.00** (500 céntimos, PEN).
4. La respuesta exitosa simulada muestra una referencia única con prefijo `DEMO` (por ejemplo, `DEMO-000001`). Abre **Ver historial** para ver ese pago y su referencia.

La demo no ofrece un control para generar timeout o error; el servicio local implementa la ruta feliz. La interfaz contempla los estados de resultado sin confirmar y error técnico para distinguirlos de un pago exitoso o un historial vacío cuando se integre un servicio que pueda devolverlos.

## Tecnología

- React + TypeScript + Vite.

El frontend consume la API del backend Quarkus; no se conecta directamente a la base de datos.
Mostrar solo los datos requeridos en cada pantalla; no escribir DNI, nombre, apellido, correo, OTP o PIN en consola, telemetría, URLs ni mensajes de error. En capturas y vistas de revisión, ofuscar datos personales cuando no se requiera verlos completos. Mantener el token de seguimiento solo en memoria de sesión y no guardar datos personales en `localStorage`.

Los comandos de ejecución se documentarán cuando se configure el proyecto. Consultar el [contrato API](../docs/ENDPOINTS.md) y las [pruebas](../docs/TESTING.md).
