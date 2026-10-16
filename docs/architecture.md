# Arquitectura

## Stack acordado

- **Frontend:** React + TypeScript + Vite.
- **Backend:** Java + Quarkus.
- **Persistencia:** motor de base de datos pendiente de seleccionar.

## Componentes y responsabilidades

- **Frontend React:** presenta el onboarding, captura los datos, muestra el paso actual y los mensajes del backend; al finalizar, muestra el estado de activación y saldo recibido.
- **API Quarkus:** valida las solicitudes, consulta el conjunto ficticio de personas, gestiona el ciclo de vida del OTP, registra la cuenta, activa la wallet y devuelve su saldo.
- **Capa de datos del backend:** repositorios/DAO y entidades del backend Quarkus para persistir personas o referencias de prueba, sesiones de onboarding, cuentas, wallets y movimientos. El frontend no accede directamente a la base de datos.
- **Correo de demo:** mecanismo local simulado para recibir el OTP; no se envían correos reales.

## Flujo de registro

1. React envía tipo de documento, DNI y correo a la API Quarkus.
2. Quarkus comprueba la coincidencia con los datos sintéticos acordados y crea una sesión de onboarding.
3. Quarkus genera y envía el OTP por el mecanismo local de correo simulado; React solicita al usuario que lo ingrese.
4. React envía el OTP a Quarkus para su validación. Solo una validación correcta habilita la creación de la clave.
5. Tras recibir la clave de demo, Quarkus completa el registro, activa la wallet y registra una sola vez el saldo inicial de S/ 100.00 PEN.
6. React navega a la pantalla inicial y muestra el estado y saldo que devuelve la API.

## Persistencia y límites

- La base de datos concreta y su configuración quedan pendientes de decisión del equipo.
- El saldo se representa en el backend como importe monetario exacto (recomendado: `10000` centavos con moneda `PEN`), no como punto flotante.
- La activación y el crédito inicial deben persistirse de forma consistente y evitar que reintentos creen un segundo crédito.
- Fixtures, OTP y saldo son exclusivamente de demo. No integrar registros oficiales, correo externo ni rieles de pago reales.
