# Historias de usuario y criterios de aceptación

## Historia 1 — Registro y activación con revisión humana

**Como** usuario que realiza transferencias de bajo monto, **quiero** ingresar mis datos, obtener aprobación humana, verificar mi correo y crear un PIN, **para** activar mi wallet de demo.

### Criterios de aceptación

1. El formulario inicial solicita tipo de documento, DNI y correo personal y valida los campos antes de enviar.
2. Al enviar, el backend consulta el DNI en la fuente sintética y crea una solicitud pendiente de decisión humana; no envía OTP ni activa wallet antes de aprobación.
3. Solo una persona revisora autorizada puede aprobar o rechazar. Se registra el resultado, quién decidió y cuándo; una solicitud resuelta no admite otra decisión.
4. Si se rechaza, el usuario permanece en la primera pantalla y ve exactamente: “Su registro está en evaluación. Nos estaremos comunicando contigo en las siguientes horas”. No se revela el motivo ni se envía OTP.
5. Si se aprueba, se envía OTP de cuatro dígitos al buzón simulado. OTP incorrecto, expirado, reutilizado o sobre el límite de intentos no permite avanzar.
6. Un OTP válido habilita el campo PIN numérico de cuatro dígitos. Al continuar, se crea el cliente de la aplicación y una wallet con S/ 100.00 PEN ficticios, una sola vez.
7. La pantalla inicial muestra el nombre y apellido asociados al DNI y el saldo consultado al backend. Los errores o estados previos no crean wallet activa ni crédito inicial.
8. Logs, eventos de auditoría, analítica y trazas no contienen DNI, nombre, apellido o correo en claro; decisión y avance se rastrean por ID aleatorio de solicitud, actor opaco, estado y fecha/hora.
9. La interfaz muestra el paso actual y la secuencia restante en cada pantalla; entrada inválida bloquea el avance y presenta una corrección accionable.
10. Se registran eventos de inicio, finalización de pasos y cierre con ID opaco y timestamps, sin datos del formulario ni credenciales.
11. Al completar el onboarding, la wallet queda activa y la pantalla ofrece un punto de entrada a pagos de bajo monto; el procesamiento de pagos no forma parte de esta demo.

## Historia 2 — Persona revisora de registros

**Como** persona revisora autorizada, **quiero** consultar solicitudes pendientes y aprobarlas o rechazarlas, **para** decidir cuáles pueden continuar el onboarding.

### Criterios de aceptación

1. La persona revisora solo ve solicitudes pendientes y la información mínima necesaria para decidir.
2. Puede registrar una decisión de aprobar o rechazar; se almacena el revisor y la fecha de decisión.
3. Una solicitud decidida sale de la cola pendiente y no puede resolverse por segunda vez.
4. La aprobación permite continuar a OTP; el rechazo no envía OTP y presenta al usuario el mensaje genérico definido en Historia 1.
5. La operación de revisión no está disponible para el usuario que solicita el registro ni para llamadas sin autorización.
6. La trazabilidad de cada decisión contiene solicitud, actor, decisión y fecha/hora, pero no PII en claro.

## Criterios de la historia fuente y tratamiento en demo

- **Progreso y validación:** cubiertos por criterios 1 y 9; el paso actual y los siguientes se muestran y errores bloquean el avance.
- **Wallet activa y entrada a pagos:** cubiertos por criterios 6 y 11; se muestra un punto de entrada visual, sin procesar pagos.
- **Eventos de onboarding:** cubiertos por criterio 10 con timestamps e ID opaco, excluyendo PII.
- **Mediana de 8 a 3 minutos, MAU 1,000–2,000 y CAC PEN 10:** objetivos de lanzamiento en la historia oficial; requieren cohortes y datos reales y no se declaran alcanzados con la demo sintética.

## Alcance demo

Las personas, correos y saldos son sintéticos. No se integra con registros oficiales, correo real ni servicios financieros reales. Los criterios y detalles del flujo están en [onboarding.md](./onboarding.md).

La historia fuente también establece objetivos de lanzamiento de reducir la mediana de onboarding de 8 a 3 minutos en el trimestre y reportar MAU 1,000–2,000/CAC PEN 10 durante meses 1–3. Son métricas posteriores al lanzamiento, no resultados que puedan afirmarse con la demo. Se requiere una cohorte real y datos de adquisición para validarlas.
