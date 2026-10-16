# Guion de demostración

Usar exclusivamente personas, documentos, correos y códigos sintéticos del entorno de demo.

## Camino aprobado

1. En la pantalla inicial del onboarding, ingresar tipo de documento, DNI y correo de una persona ficticia existente; seleccionar **Continuar**.
2. Mostrar que la solicitud queda pendiente de revisión y que aún no se envía OTP.
3. Como persona revisora autorizada, abrir la solicitud pendiente y aprobarla.
4. Volver al flujo de usuario; confirmar que aparece la pantalla OTP después de la aprobación.
5. Consultar el correo en el buzón simulado, ingresar el OTP de cuatro dígitos y continuar.
6. Ingresar un PIN numérico de cuatro dígitos y continuar para completar el registro en la aplicación.
7. En la pantalla inicial, mostrar nombre y apellido asociados al DNI y saldo ficticio de **S/ 100.00 PEN** consultado al backend.
8. Mostrar el punto de entrada a pagos de bajo monto sin ejecutar un pago real.
9. Repetir una solicitud/activación según permita el flujo y comprobar que no se crea un crédito inicial duplicado.

## Camino rechazado

1. Ingresar datos sintéticos en la pantalla 1 y enviar la solicitud.
2. Como persona revisora autorizada, rechazar la solicitud pendiente.
3. Confirmar que el usuario permanece en la pantalla 1 y ve exactamente: **“Su registro está en evaluación. Nos estaremos comunicando contigo en las siguientes horas”.**
4. Confirmar que no se envía OTP ni se crea una cuenta activa, wallet o crédito.

## Evidencias y notas

- Mostrar la decisión humana solo a través del acceso de revisor autorizado.
- No capturar ni compartir OTP, PIN o DNI completo.
- Al mostrar evidencia de datos, usar fixtures sintéticos y ocultar/ofuscar DNI, nombre, apellido y correo; no mostrar cuerpos de API ni trazas que los contengan.
- Los identificadores de correlación de la demo deben ser aleatorios; no crear IDs a partir de DNI/correo ni hashes simples de esos valores.
- Mostrar eventos analíticos solo con ID opaco, tipo de evento, paso y timestamp, sin PII.
- Si la actualización de la decisión no es automática en la demo, consultar el estado mediante la acción acordada en la interfaz; no simular una aprobación sin registrar la decisión en backend.
- Indicar que el saldo es ficticio y que el flujo no valida identidad productiva ni mueve dinero real.
