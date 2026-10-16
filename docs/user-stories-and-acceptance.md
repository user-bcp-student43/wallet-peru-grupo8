# Historias de usuario y criterios de aceptación

El nuevo flujo descrito aquí está pendiente de implementación. Podman, H2 en memoria y Mailpit local están acordados. Se admiten DNI y pasaporte; el OTP de cuatro dígitos vence a los cinco minutos, permite tres intentos y no se reenvía. OTP y PIN se protegen con HMAC-SHA-256, sal aleatoria por credencial y clave secreta externa. El estado se centraliza en [decisions-assumptions-limitations.md](./decisions-assumptions-limitations.md).

## Historia — Registro y activación

**Como** usuario que realiza transferencias de bajo monto, **quiero** ingresar mis datos, verificar mi correo y crear un PIN, **para** activar mi wallet de demo.

### Criterios de aceptación

1. El formulario inicial solicita tipo de documento (DNI o pasaporte), número de documento y correo personal y valida los campos antes de enviar.
2. Al enviar, el backend consulta los datos sintéticos por tipo y número de documento y emite al buzón simulado un OTP de cuatro dígitos, sin etapa de revisión humana.
3. El inicio y la verificación OTP no revelan el resultado del lookup. Para una solicitud sin coincidencia, la finalización bloquea la activación con un error genérico; se acepta que comparar el resultado con una activación exitosa permite inferir indirectamente la coincidencia.
4. OTP incorrecto, vencido o reutilizado no permite avanzar. El código vence a los cinco minutos, no se puede reenviar y después de tres intentos fallidos se bloquea con el mensaje “Agotaste tus intentos permitidos”.
5. Un OTP válido habilita el campo PIN numérico de cuatro dígitos. Al continuar, se crea el cliente de la aplicación y una wallet con S/ 100.00 PEN ficticios, una sola vez.
6. La pantalla inicial muestra el nombre y apellido asociados al documento y el saldo consultado al backend. Los estados previos no crean wallet activa ni crédito inicial.
7. Logs, eventos de auditoría, analítica y trazas no contienen DNI, nombre, apellido o correo en claro; solicitud y avance se rastrean por ID aleatorio.
8. La interfaz muestra el paso actual y la secuencia restante en cada pantalla; entrada inválida bloquea el avance y presenta una corrección accionable.
9. Se registran eventos de inicio, finalización de pasos y cierre con ID opaco y timestamps, sin datos del formulario ni credenciales.
10. Al completar el onboarding, la wallet queda activa y recibe el crédito inicial ficticio de S/ 100.00 PEN exactamente una vez, incluso ante reintentos. El procesamiento de pagos no forma parte del nuevo alcance.

## Criterios de la historia fuente y tratamiento en demo

- **Progreso y validación:** cubiertos por criterios 1 y 9; el paso actual y los siguientes se muestran y errores bloquean el avance.
- **Wallet activa y entrada a pagos:** cubiertos por criterios 5 y 10; se muestra un punto de entrada visual, sin procesar pagos.
- **Eventos de onboarding:** cubiertos por criterio 9 con timestamps e ID opaco, excluyendo PII.
- **Mediana de 8 a 3 minutos, MAU 1,000–2,000 y CAC PEN 10:** objetivos de lanzamiento en la historia oficial; requieren cohortes y datos reales y no se declaran alcanzados con la demo sintética.

## Alcance demo

Las personas, correos y saldos son sintéticos. No se integra con registros oficiales, correo real ni servicios financieros reales. Los criterios y detalles del flujo están en [onboarding.md](./onboarding.md).

La historia fuente también establece objetivos de lanzamiento de reducir la mediana de onboarding de 8 a 3 minutos en el trimestre y reportar MAU 1,000–2,000/CAC PEN 10 durante meses 1–3. Son métricas posteriores al lanzamiento, no resultados que puedan afirmarse con la demo. Se requiere una cohorte real y datos de adquisición para validarlas.
