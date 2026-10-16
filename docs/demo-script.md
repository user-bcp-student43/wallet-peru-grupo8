# Guion de demostración

> **Guion objetivo, no ejecutable actualmente:** el nuevo onboarding sigue pendiente de implementación y el backend no existe como servicio ejecutable. El frontend disponible es la versión anterior con un simulador local distinto. No presentar los pasos siguientes como evidencia de una demo ya funcional. Podman, H2 en memoria y Mailpit local están acordados en [decisiones](./decisions-assumptions-limitations.md). El OTP vence en cinco minutos, admite tres intentos y no se reenvía.

Usar exclusivamente personas, documentos, correos y códigos sintéticos del entorno de demo.

## Camino principal

1. En la pantalla inicial del onboarding, ingresar tipo de documento (DNI o pasaporte), número de documento y correo sintéticos; seleccionar **Continuar**.
2. Mostrar la pantalla OTP y consultar el código de cuatro dígitos en el buzón simulado dentro de los cinco minutos de vigencia. No hay reenvío.
3. Ingresar el OTP y continuar. Si se agotan los tres intentos, mostrar un mensaje como “Agotaste tus intentos permitidos”.
4. Ingresar un PIN numérico de cuatro dígitos y continuar para completar el registro en la aplicación.
5. En la pantalla inicial, mostrar nombre y apellido asociados al documento y saldo ficticio de **S/ 100.00 PEN** consultado al backend.
6. Confirmar que el flujo no procesa pagos.
7. Reintentar la finalización/activación y comprobar que no se crea otro crédito inicial.

## Evidencias y notas

- No capturar ni compartir OTP, PIN o DNI completo.
- Al mostrar evidencia de datos, usar fixtures sintéticos y ocultar/ofuscar DNI, nombre, apellido y correo; no mostrar cuerpos de API ni trazas que los contengan.
- Los identificadores de correlación de la demo deben ser aleatorios; no crear IDs a partir de DNI/correo ni hashes simples de esos valores.
- Mostrar eventos analíticos solo con ID opaco, tipo de evento, paso y timestamp, sin PII.
- Confirmar que la interfaz consulta el estado cada tres segundos mientras espera y detiene el polling al verificar OTP o al fallar.
- Indicar que el saldo es ficticio y que el flujo no valida identidad productiva ni mueve dinero real.
