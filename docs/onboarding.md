# Registro y activación de wallet de demo

> **Estado:** la interfaz, el cliente API y el backend Quarkus están implementados, con pruebas frontend y REST. La integración end-to-end con Mailpit real y la matriz completa de aceptación siguen pendientes. Podman, H2 en memoria y Mailpit local están acordados. El OTP vence en cinco minutos, admite tres intentos y no se reenvía; OTP/PIN usan HMAC-SHA-256 con sal aleatoria y clave externa. Consulta el estado central en [decisions-assumptions-limitations.md](./decisions-assumptions-limitations.md).

## 1. Summary
- **Historia:** Como usuario que realiza transferencias de bajo monto, quiero completar un onboarding guiado y conocer el siguiente paso, para activar mi wallet de demo.
- **Resultado:** el usuario ingresa sus datos, verifica su correo y crea un PIN; al finalizar queda registrado en la aplicación con una wallet demo de S/ 100.00 y ve su nombre y saldo.
- **Naturaleza:** prototipo con datos sintéticos. No es KYC, validación de identidad productiva ni registro oficial ante una entidad externa.

## 2. Scope
- **Dentro del alcance**
  - Consultar por tipo y número de documento (DNI o pasaporte) en la capa de datos del backend y recuperar el nombre y apellido asociados.
  - Enviar el OTP al iniciar la solicitud; no hay etapa de decisión humana.
  - Implementar el flujo de usuario de tres pantallas: datos; OTP; PIN y confirmación de registro.
  - Enviar y validar un OTP de cuatro dígitos usando el mecanismo de correo simulado; vence a los cinco minutos, permite tres intentos y no se reenvía.
  - Crear el registro de la aplicación y una wallet con saldo ficticio inicial de S/ 100.00 PEN, sin duplicar el crédito en reintentos.
  - Activar la wallet y acreditar ese saldo de forma atómica e idempotente.
  - Mostrar nombre, apellido y saldo devueltos por el backend en la pantalla inicial.
- **Fuera del alcance**
  - Consultas a registros oficiales, KYC o registro en sistemas reales.
  - Envío de correos reales, fondos reales, retiros o procesamiento de pagos.
  - Usar datos reales de documentos, correos, OTP o PIN.

## 3. Supuestos
- **Stack acordado:** React + TypeScript + Vite; Java + Quarkus.
- El frontend llama exclusivamente a la API Quarkus. La búsqueda por tipo y número de documento y la persistencia están en el backend.
- La capa de datos relacional usa H2 en memoria con fixtures sintéticos, detrás de repositorios del backend; reiniciar el backend limpia el estado de demo. Podman está acordado; Mailpit captura el SMTP local sin enviar correo externo. Separar personas sintéticas, solicitudes, cuentas, wallets y movimientos.
- Las personas de prueba se plantean como fixtures sintéticos para DNI y pasaporte. El inicio y la verificación OTP no revelan el resultado del lookup; para un documento sin coincidencia, la finalización devuelve un error genérico y no crea cliente ni wallet. Se acepta la inferencia indirecta al comparar con una activación exitosa como riesgo residual.
- La solicitud pasa directamente a verificación OTP; no hay revisor, estado de revisión ni mensaje de rechazo HITL.
- La trazabilidad funcional/auditoría registra ID aleatorio de solicitud, evento, estado anterior/nuevo, actor mediante ID interno opaco y fecha/hora. DNI, nombres, apellidos y correo se omiten de logs y metadatos; si algún diagnóstico requiere mostrarlos, se ofuscan antes de registrar. No copiar PII desde los datos operativos ni registrar cuerpos HTTP. Los datos operativos necesarios para el flujo permanecen separados y con acceso restringido.
- Mailpit local en Podman captura el SMTP. No se envían correos externos.
- El OTP consta de cuatro dígitos y se entrega por un buzón de correo simulado. Vence a los cinco minutos; no se reenvía.
- El OTP permite tres intentos; agotados, la interfaz muestra **“Agotaste tus intentos permitidos”** y no permite más verificaciones para ese código.
- OTP y PIN se conservan únicamente como HMAC-SHA-256 con sal aleatoria por credencial y clave secreta externa a la aplicación. Las comparaciones son en tiempo constante; no registrar credenciales en claro.
- La wallet se crea con saldo ficticio inicial de `10000` céntimos PEN; no es dinero real ni retirable. Backend es fuente autoritativa.

## 4. Decisiones técnicas aprobadas
- Usar H2 en memoria con fixtures sintéticos; reiniciar el backend limpia el estado de demo.
- Usar Mailpit local en Podman para capturar SMTP, sin enviar correo externo.
- Consultar el estado cada tres segundos y detener el polling al verificar el OTP o al fallar la solicitud.
- Implementar los estados y endpoints según el contrato [ENDPOINTS.md](./ENDPOINTS.md), sin revisión humana.
- Aplicar la vigencia de cinco minutos, tres intentos y ausencia de reenvío al implementar la API.
- Configurar la clave secreta de HMAC fuera del repositorio y del código fuente.

## 5. Riesgos y mitigaciones
- **Exposición o enumeración de datos:** fixtures sintéticos; mensajes genéricos al usuario; devolver solo datos necesarios; no incluir DNI completo, OTP ni PIN en logs o errores.
- **Exposición de PII en trazas de auditoría:** no incluir DNI, nombres, apellidos o correo en auditoría, logs o analítica; correlacionar por ID aleatorio de solicitud. Si una salida diagnóstica requiere PII, enmascararla antes de emitirla y evitar capturar payloads HTTP completos.
- **OTP/PIN de cuatro dígitos débiles:** el OTP vence a los cinco minutos y permite tres intentos; OTP/PIN se protegen con HMAC-SHA-256 y clave externa. Aun así, este diseño no es seguridad productiva; limitar el prototipo a demo local.
- **Activación o saldo duplicado:** completar registro, wallet y crédito inicial de manera atómica, con restricción que garantice un único crédito inicial por wallet.
- **Confundir demo con servicio real:** indicar que el saldo es ficticio y que no se realizan verificaciones ni transacciones reales.

## 6. Criterios de aceptación (medibles)
1. La pantalla 1 solicita tipo de documento (DNI o pasaporte), número de documento y correo; campos vacíos o correo inválido impiden enviar la solicitud.
2. Al enviar los datos, el backend busca por tipo y número de documento en datos sintéticos y emite un OTP de exactamente cuatro dígitos al correo simulado; no hay etapa de revisión humana.
3. El inicio y la verificación OTP no revelan el resultado del lookup. Para un documento sin coincidencia, la finalización no crea cliente ni wallet y devuelve un error genérico; se acepta la inferencia indirecta frente a una activación exitosa como riesgo residual.
4. OTP incorrecto, vencido o reutilizado no permite continuar; el código vence a los cinco minutos y nunca se expone en la respuesta de API ni en logs. Tras tres intentos fallidos se bloquea la verificación y se muestra **“Agotaste tus intentos permitidos”**. No hay reenvío.
5. La pantalla 2 muestra el campo OTP con máximo cuatro caracteres numéricos y el botón Continuar. Solo un OTP válido y no usado habilita el campo PIN de la pantalla 3.
6. La pantalla 3 permite ingresar exclusivamente cuatro dígitos numéricos como PIN. Al continuar, el backend completa el registro en la aplicación y activa la wallet; no se presenta como registro oficial ante sistemas externos.
7. Una solicitud completada crea una sola wallet con exactamente `10000` céntimos PEN. Reintentos no duplican la cuenta ni el saldo inicial.
8. Para una solicitud completada, la pantalla inicial muestra nombre y apellido asociados al documento y el saldo consultado al backend, formateado como S/ 100.00.
9. Los logs, eventos de auditoría, analítica y trazas no contienen DNI, nombre, apellido, correo, OTP o PIN en claro; OTP/PIN se conservan como HMAC-SHA-256 con sal aleatoria y clave externa, y la solicitud se rastrea con ID aleatorio.
10. El indicador de progreso muestra el paso actual y los pasos restantes. Inicio, cada paso completado y cierre emiten un evento sin PII.
11. La pantalla inicial ofrece un punto de entrada visual a pagos de bajo monto, sin ejecutar pagos reales en la demo.

## 7. Plan de validación
- **Pruebas unitarias:** búsqueda por tipo y número de documento, emisión OTP, bloqueo después de tres intentos, creación atómica de wallet y crédito único, emisión de eventos sin PII.
- **Pruebas funcionales:** solicitud con OTP inmediato; recorrido de tres pantallas; casos sin coincidencia sin camino alternativo de error; OTP incorrecto/expirado/reutilizado y agotamiento de intentos; PIN no numérico o longitud inválida; reintentos sin saldo duplicado; visualización de nombre y saldo.
- **Privacidad:** datos ficticios únicamente; no registrar OTP/PIN; comprobar que logs, auditoría, analítica y trazas excluyan PII y que el frontend no consulta la base directamente.
- **Evidencia requerida:** resultados de pruebas, fixtures sintéticos, contrato API, capturas del flujo sin secretos visibles y pasos de ejecución de backend, frontend y buzón simulado.

## 8. Tareas sugeridas por rol
- **Chapter/PO**
  - Validar campos, datos de demo y presentación de saldo ficticio.
- **Tech Lead**
  - Definir contrato y estados de solicitud, OTP, PIN y activación.
  - Implementar polling de estado cada tres segundos y detenerlo al verificar OTP o al fallar.
  - Acordar persistencia relacional, transacción de activación y estructura del saldo.
  - Definir formato mínimo de trazabilidad sin PII, eventos analíticos permitidos y política uniforme de ofuscación para salidas diagnósticas.
- **Backend**
  - Crear repositorios/entidades para persona sintética, solicitud, cuenta, wallet y movimiento.
  - Implementar lookup por DNI/pasaporte y emisión OTP al iniciar la solicitud.
  - Implementar OTP verificado en servidor, creación de cuenta/wallet al completar PIN y crédito idempotente.
  - Emitir eventos de inicio, paso completado y cierre sin PII; excluir cuerpos HTTP de logs.
  - Evitar PII en logs/eventos/auditoría; si un diagnóstico requiere un dato, ofuscarlo antes de registrarlo y excluir payloads sensibles.
- **Frontend**
  - Crear pantalla 1 con formulario de datos y selección de tipo de documento.
  - Crear pantalla 2 con OTP de máximo cuatro dígitos y pantalla 3 con PIN numérico de cuatro dígitos.
  - Mostrar en inicio nombre, apellido y saldo obtenidos desde API; presentar errores sin datos sensibles.
- **QA**
  - Probar el flujo OTP/PIN, validaciones, mensaje al agotar intentos y reintentos.
  - Verificar progreso visual, eventos analíticos sin PII y que el saldo solo se acredita una vez; adjuntar evidencia reproducible.
- **Cyber**
  - Comprobar no exposición de DNI, nombre, apellido, correo, OTP y PIN en logs, auditoría, errores, analítica y trazas; verificar además que solo se persisten HMACs con sal aleatoria y clave externa.

## 9. Preguntas abiertas
- No quedan decisiones de infraestructura local ni de intervalo de consulta pendientes.

Las decisiones acordadas y pendientes se centralizan en [decisions-assumptions-limitations.md](./decisions-assumptions-limitations.md).
