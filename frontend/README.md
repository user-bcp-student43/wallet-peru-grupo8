# Billetera Demo — frontend de onboarding

Frontend React + TypeScript + Vite para el onboarding demo: ingreso de datos sintéticos, verificación OTP, creación de PIN y bienvenida con el nombre y saldo devueltos por la API.

La interfaz y el cliente HTTP están implementados y probados. El backend Quarkus ejecutable está en `backend/` y publica el [contrato de endpoints](../docs/ENDPOINTS.md). Las pruebas REST y frontend están automatizadas; aún falta verificar el recorrido integrado con Mailpit real.

## Ejecutar

Requisitos: Node.js y npm. Desde `frontend/`:

```bash
npm ci
npm run dev
```

Vite muestra la URL local. Por defecto, el cliente usa `http://localhost:8080/api/v1`. Para configurar otra base URL antes de iniciar Vite:

```powershell
$env:VITE_API_BASE_URL = 'http://localhost:8080/api/v1'
npm run dev
```

La UI solicita tipo y número de documento y correo, después OTP y PIN. El estado del onboarding lo determina el backend; el frontend consulta cada tres segundos mientras el OTP está pendiente y detiene el polling al verificarlo o cuando falla la solicitud.

## Demo y límites

- Usar únicamente datos sintéticos; no es KYC ni una verificación de identidad productiva.
- El backend debe cargar fixtures sintéticos en H2 en memoria. Reiniciar el backend limpia el estado de demo. El frontend no incluye datos de cliente para el flujo normal.
- Mailpit en Podman captura el SMTP local; no se envía correo externo.
- El OTP vence a los cinco minutos, permite tres intentos y no se reenvía.
- La wallet muestra el saldo ficticio PEN `10000` céntimos recibido del backend. La entrada visual de pagos es solo informativa: esta demo no procesa pagos, transferencias ni retiros.
- El flujo integrado requiere el backend y Mailpit en ejecución; el frontend por sí solo no completa una activación. Consulta [backend/README.md](../backend/README.md) para iniciarlos.

Consulta las [decisiones del proyecto](../docs/decisions-assumptions-limitations.md), la [especificación de onboarding](../docs/onboarding.md) y el [README del backend](../backend/README.md) para el estado de sus componentes.

## Scripts

Desde `frontend/`, definidos en `package.json`:

```bash
npm run dev
npm test
npm run lint
npm run build
npm run preview
```

Las pruebas frontend verifican validación, transiciones de UI y contrato del cliente HTTP; no sustituyen las pruebas de integración con el backend.

## Privacidad

El token de seguimiento, DNI, correo, OTP y PIN se mantienen solo en memoria durante su uso y no se guardan en `localStorage` ni `sessionStorage`. El formulario limpia DNI/correo después del inicio y limpia OTP/PIN después de verificar o completar. El frontend no escribe esos datos en consola y muestra mensajes de error seguros del cliente, no cuerpos de error sin filtrar.
