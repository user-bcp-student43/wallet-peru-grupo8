# Registro y activación de wallet de demo

## 1. Summary
- **Historia:** Como usuario que realiza transferencias de bajo monto, quiero completar un onboarding guiado y conocer el siguiente paso, para activar mi wallet de demo.
- **Resultado:** el usuario ingresa sus datos, una persona revisora decide si acepta el registro, el usuario aprobado verifica su correo y crea un PIN; al finalizar queda registrado en la aplicación con una wallet demo de S/ 100.00 y ve su nombre y saldo.
- **Naturaleza:** prototipo con datos sintéticos. No es KYC, validación de identidad productiva ni registro oficial ante una entidad externa.

## 2. Scope
- **Dentro del alcance**
  - Consultar por DNI en la capa de datos del backend y recuperar el nombre y apellido asociados.
  - Someter cada solicitud a una decisión humana antes de enviar el OTP.
  - Implementar el flujo de usuario de tres pantallas: datos y revisión; OTP; PIN y confirmación de registro.
  - Enviar y validar un OTP de cuatro dígitos usando el mecanismo de correo simulado.
  - Crear el registro de la aplicación y una wallet con saldo ficticio inicial de S/ 100.00 PEN, sin duplicar el crédito en reintentos.
  - Mostrar nombre, apellido y saldo devueltos por el backend en la pantalla inicial.
- **Fuera del alcance**
  - Consultas a registros oficiales, KYC o registro en sistemas reales.
  - Envío de correos reales, fondos reales, retiros o pagos reales.
  - Usar datos reales de documentos, correos, OTP o PIN.

## 3. Supuestos
- **Stack acordado:** React + TypeScript + Vite; Java + Quarkus.
- El frontend llama exclusivamente a la API Quarkus. La búsqueda de DNI y la persistencia están en el backend.
- La capa de datos será relacional, detrás de repositorios del backend. Para iniciar se recomienda H2 en memoria, con fixtures sintéticos cargados al iniciar; el estado se reinicia al reiniciar la aplicación. Separar personas sintéticas, solicitudes, cuentas, wallets y movimientos.
- Las personas de prueba se cargan como fixtures sintéticos. El DNI permite encontrar nombre y apellido; el correo ingresado se valida contra el correo sintético asociado.
- Toda solicitud pasa a revisión humana. Mientras está pendiente, no se envía OTP ni se crea/activa cuenta o wallet. El revisor ve la coincidencia o ausencia de registro y decide aprobar o rechazar.
- Si el revisor aprueba, el usuario continúa al OTP. Si rechaza, el frontend muestra exactamente: **“Su registro está en evaluación. Nos estaremos comunicando contigo en las siguientes horas”.** El texto es deliberadamente genérico y no revela el motivo de la decisión.
- El usuario permanece en la pantalla 1 mientras espera la decisión; al resolverse, aprobado continúa al paso OTP y rechazado ve el mensaje indicado. Se recomienda consultar el estado cada 3 segundos, detener el polling al llegar a un estado terminal y mantener el token de seguimiento solo en memoria de sesión.
- La trazabilidad funcional/auditoría registra ID aleatorio de solicitud, evento, estado anterior/nuevo, actor mediante ID interno opaco y fecha/hora. DNI, nombres, apellidos y correo se omiten de logs y metadatos; si algún diagnóstico requiere mostrarlos, se ofuscan antes de registrar. No copiar PII desde los datos operativos ni registrar cuerpos HTTP. Los datos operativos necesarios para el flujo permanecen separados y con acceso restringido.
- Para el revisor se recomienda una vista local protegida por credencial configurada fuera de Git. La credencial no es autenticación de producción.
- Se recomienda Mailpit local para capturar el SMTP de demo; requiere Docker y no envía correos externos.
- El OTP consta de cuatro dígitos y se entrega por un buzón de correo simulado. Para validarlo se conserva en servidor un verificador protegido con secreto del servidor (por ejemplo, HMAC), asociado a la solicitud y expiración; no se guarda en claro, no se devuelve ni se registra en logs.
- Parámetros de demo propuestos: vigencia OTP de 5 minutos, máximo 5 intentos, espera de 60 segundos para reenvío y máximo 3 envíos por solicitud.
- El PIN es una credencial solo de demo y no se almacena en texto plano.
- La wallet se crea con saldo ficticio inicial de `10000` céntimos PEN; no es dinero real ni retirable. Backend es fuente autoritativa.

## 4. Decisiones técnicas por tomar
- Confirmar H2 en memoria y Mailpit, incluyendo disponibilidad de Docker para la demo.
- Aprobar la vista local de revisor y su credencial fuera de Git; no exponer una acción de aprobación sin control de acceso.
- Implementar los estados y endpoints según el contrato [ENDPOINTS.md](./ENDPOINTS.md), incluyendo polling cada 3 segundos.
- Confirmar los límites OTP propuestos y mantener DNI como único tipo inicial.
- Definir el mecanismo disponible en Quarkus para proteger el PIN y generar/verificar el OTP con una clave secreta del servidor.

## 5. Riesgos y mitigaciones
- **Aprobación humana no autorizada:** restringir la operación de revisión a una persona revisora autorizada; registrar quién decidió y cuándo; no permitir aprobar desde la interfaz del usuario.
- **Exposición o enumeración de datos:** fixtures sintéticos; mensajes genéricos al usuario; devolver solo datos necesarios; no incluir DNI completo, OTP ni PIN en logs o errores.
- **Exposición de PII en trazas de auditoría:** no incluir DNI, nombres, apellidos o correo en auditoría, logs o analítica; correlacionar por ID aleatorio de solicitud. Si una salida diagnóstica requiere PII, enmascararla antes de emitirla y evitar capturar payloads HTTP completos.
- **OTP/PIN de cuatro dígitos débiles:** limitar vigencia e intentos, invalidar OTP usado, guardar solo verificador y hash del PIN; limitar el prototipo a demo local.
- **Activación o saldo duplicado:** completar registro, wallet y crédito inicial de manera atómica, con restricción que garantice un único crédito inicial por wallet.
- **Confundir demo con servicio real:** indicar que el saldo es ficticio y que no se realizan verificaciones ni transacciones reales.

## 6. Criterios de aceptación (medibles)
1. La pantalla 1 solicita tipo de documento, DNI y correo; campos vacíos o correo inválido impiden enviar la solicitud.
2. Al continuar, el backend busca el DNI en datos sintéticos y deja la solicitud en revisión humana; mientras esté pendiente no genera ni envía OTP ni crea cuenta/wallet activa.
3. Una persona revisora autorizada puede aprobar o rechazar una solicitud pendiente y queda registrado el resultado de la decisión. Una solicitud ya resuelta no puede aprobarse/rechazarse de nuevo.
4. Tras aprobación, el usuario continúa a la pantalla 2 y recibe en el correo simulado un OTP de exactamente cuatro dígitos. Un rechazo muestra en pantalla 1 el texto exacto definido arriba y no envía OTP.
5. OTP incorrecto, vencido, reutilizado o tras alcanzar 5 intentos fallidos no permite continuar; el código nunca se expone en la respuesta de API ni en logs. La vigencia es 5 minutos; reenvío tras 60 segundos, máximo 3 envíos por solicitud.
6. La pantalla 2 muestra el campo OTP con máximo cuatro caracteres numéricos y el botón Continuar. Solo un OTP válido y no usado habilita el campo PIN de la pantalla 3.
7. La pantalla 3 permite ingresar exclusivamente cuatro dígitos numéricos como PIN. Al continuar, el backend completa el registro en la aplicación y activa la wallet; no se presenta como registro oficial ante sistemas externos.
8. Una solicitud aprobada y completada crea una sola wallet con exactamente `10000` céntimos PEN. Reintentos no duplican la cuenta ni el saldo inicial.
9. La pantalla inicial muestra nombre y apellido encontrados por DNI y el saldo consultado al backend, formateado como S/ 100.00. Solicitudes rechazadas o incompletas no tienen cuenta activa, wallet activa ni crédito.
10. Los logs, eventos de auditoría, analítica y trazas no contienen DNI, nombre, apellido o correo en claro ni OTP/PIN; una decisión HITL puede rastrearse con ID aleatorio de solicitud, actor opaco, decisión y fecha/hora.
11. El indicador de progreso muestra el paso actual y los pasos restantes. Inicio, cada paso completado y cierre emiten un evento sin PII.
12. La pantalla inicial ofrece un punto de entrada visual a pagos de bajo monto, sin ejecutar pagos reales en la demo.

## 7. Plan de validación
- **Pruebas unitarias:** búsqueda por DNI, verificación de correo, transiciones de estado HITL, decisión única, OTP y límites, validación/hash del PIN, creación atómica de wallet y crédito único, emisión de eventos sin PII.
- **Pruebas funcionales:** solicitud pendiente sin OTP; aprobación y recorrido completo de tres pantallas; rechazo con mensaje exacto; DNI no encontrado; OTP incorrecto/expirado/reutilizado; PIN no numérico o longitud inválida; reintentos sin saldo duplicado; visualización de nombre y saldo.
- **Seguridad (comprobaciones mínimas):** autorización de revisor; no exponer operación de decisión al usuario; datos ficticios únicamente; respuesta genérica; no guardar OTP/PIN en claro; comprobar que logs, auditoría, analítica y trazas excluyan PII y ofusquen cualquier PII diagnóstica; comprobar que el frontend no consulta la base directamente.
- **Evidencia requerida:** resultados de pruebas, fixture sintético, contrato API, capturas del flujo aprobado y rechazado sin secretos visibles, y pasos de ejecución de backend, frontend y buzón simulado.

## 8. Tareas sugeridas por rol
- **Chapter/PO**
  - Confirmar texto de rechazo, quién revisa y criterios para aprobar/rechazar.
  - Validar campos, datos de demo, límites OTP y presentación de saldo ficticio.
- **Tech Lead**
  - Definir contrato y estados de solicitud, revisión, OTP, PIN y activación.
  - Definir permisos/auditoría del revisor y mecanismo de actualización de estado en frontend.
  - Acordar persistencia relacional, transacción de activación y estructura del saldo.
  - Definir formato mínimo de trazabilidad sin PII, eventos analíticos permitidos y política uniforme de ofuscación para salidas diagnósticas.
- **Backend**
  - Crear repositorios/entidades para persona sintética, solicitud, cuenta, wallet y movimiento.
  - Implementar lookup por DNI, envío de solicitud pendiente y operaciones autorizadas de aprobar/rechazar.
  - Implementar OTP verificado en servidor, creación de cuenta/wallet al completar PIN y crédito idempotente.
  - Emitir eventos de inicio, paso completado y cierre sin PII; excluir cuerpos HTTP de logs.
  - Evitar PII en logs/eventos/auditoría; si un diagnóstico requiere un dato, ofuscarlo antes de registrarlo y excluir payloads sensibles.
- **Frontend**
  - Crear pantalla 1 con formulario y estado de revisión humana; mostrar el mensaje exacto cuando se rechaza.
  - Crear pantalla 2 con OTP de máximo cuatro dígitos y pantalla 3 con PIN numérico de cuatro dígitos.
  - Mostrar en inicio nombre, apellido y saldo obtenidos desde API; presentar errores sin datos sensibles.
- **QA**
  - Probar transiciones pendiente/aprobada/rechazada y acceso a revisión.
  - Probar OTP, PIN, validaciones, errores y reintentos.
  - Verificar progreso visual, eventos analíticos sin PII y que el saldo solo se acredita una vez; adjuntar evidencia reproducible.
- **Cyber**
  - Revisar autorización y trazabilidad de la decisión humana.
  - Comprobar no exposición de DNI, nombre, apellido, correo, OTP y PIN en logs, auditoría, errores, analítica y trazas; validar protección del OTP con secreto de servidor, manejo del PIN y límites.

## 9. Preguntas abiertas
- ¿Quién cumple el rol de persona revisora durante la demo y cómo se autenticará?
- ¿Se usará una pantalla sencilla de revisión dentro de la demo o una operación/API operada por una persona autorizada?
- ¿Se aprueban H2 en memoria, Mailpit y disponibilidad de Docker?
- ¿Cómo se autenticará al revisor y quién custodiará la credencial local?
- ¿Se confirman vigencia de OTP de 5 minutos, máximo 5 intentos, reenvío cada 60 segundos y máximo 3 envíos?
- ¿Qué tipos de documento, además de DNI, se mostrarán en el selector?
