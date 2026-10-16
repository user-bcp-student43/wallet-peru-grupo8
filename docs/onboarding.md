# Registro y activación de wallet de demo

## 1. Summary
- **Historia:** Como usuario que realiza transferencias de bajo monto, quiero completar un onboarding guiado y saber cuál es el siguiente paso, para activar mi wallet de demo y empezar a pagar.
- **Resultado:** una persona incluida en el conjunto ficticio de la demo verifica su correo, crea una clave demo, queda registrada, recibe un saldo inicial de **S/ 100.00** en su wallet y llega a la pantalla inicial.
- **Naturaleza:** especificación de prototipo. No es KYC, autenticación ni validación de identidad productiva.

## 2. Scope
- **Dentro del alcance**
  - Solicitar tipo de documento, DNI y correo personal.
  - Comprobar la coincidencia de tipo de documento y DNI con un conjunto local ficticio y la asociación del correo definida para esa persona.
  - Enviar un OTP aleatorio de cuatro dígitos al correo usando un mecanismo de correo simulado.
  - Validar OTP; solo después permitir crear una clave de cuatro dígitos.
  - Registrar la cuenta, activar la wallet con saldo inicial de S/ 100.00 y dirigir a la pantalla inicial después de completar todos los pasos.
  - Mostrar en la pantalla inicial el saldo disponible devuelto por el backend.
  - Mostrar progreso y mensajes accionables durante el flujo.
- **Fuera del alcance**
  - Consultas a registros oficiales, KYC o envío de correos reales.
  - Datos reales de documentos, correos, OTP o claves.
  - Recuperación de cuenta, autenticación multifactor, flujos productivos de identidad.

## 3. Supuestos
- **Stack acordado:** frontend React + TypeScript + Vite; backend Java + Quarkus.
- El backend Quarkus expone la API de onboarding; React se comunica con ella y no accede directamente a la base de datos.
- La persistencia se implementa detrás de una capa de repositorios/DAO en el backend; el motor de base de datos concreto sigue pendiente de elección.
- **Fuente de existencia:** fixtures sintéticos versionados para desarrollo/demo. La coincidencia se verifica por tipo de documento y DNI; el correo debe coincidir con el correo ficticio asociado. La fuente puede reemplazarse por otra simulación sin cambiar el flujo.
- **Entrega OTP:** buzón capturador local de correo (mail catcher) o equivalente aprobado por el equipo. El OTP no se devuelve en la respuesta de la API ni se muestra en logs de aplicación.
- **Parámetros iniciales de demo propuestos para no bloquear la implementación:** OTP válido por 5 minutos; máximo 5 intentos de verificación; reenvío con espera de 60 segundos y máximo 3 envíos por sesión de onboarding. PO/Tech Lead debe confirmar o ajustar estos valores antes de cerrar la demo.
- La clave de cuatro dígitos es solo una credencial desechable de demo; no se reutiliza en otros sistemas ni se presenta como segura para producción.
- El saldo inicial de S/ 100.00 es dinero ficticio de demostración, no representa fondos reales ni es retirable.
- El backend es la fuente autoritativa del saldo; el frontend solo muestra el valor recibido.
- La asignación del saldo se realiza una sola vez al activar la wallet. Se recomienda persistir el crédito inicial como movimiento identificable (por ejemplo, `DEMO_INITIAL_CREDIT`) junto con la wallet para evitar acreditarlo de nuevo ante reintentos.

## 4. Decisiones técnicas por tomar
- Confirmar los parámetros demo propuestos de vigencia, intentos y reenvíos del OTP.
- Confirmar tipos de documento disponibles en el selector; el identificador definido para la demo es DNI.
- Elegir/configurar el mail catcher y cómo lo abrirá el equipo durante la demostración.
- Elegir el motor de persistencia y configurar repositorios/DAO dentro del backend Quarkus.
- Acordar el diseño de la pantalla inicial y el estado visible de wallet activa.
- Confirmar la representación monetaria (recomendado: importe en centavos, `10000`, con moneda `PEN`) y el registro del crédito inicial para prevenir acreditaciones duplicadas.

## 5. Riesgos y mitigaciones
- **OTP/PIN de cuatro dígitos son débiles:** limitar vigencia e intentos, invalidar OTP usado y restringir el prototipo a datos ficticios y ejecución local; no reutilizar el diseño en producción.
- **Filtración de DNI, correo, OTP o clave:** fixtures sintéticos; no registrar OTP/clave ni DNI completo; no incluirlos en capturas, commits o respuestas de error.
- **Enumeración de personas registradas:** responder con un mensaje genérico ante persona inexistente o correo no coincidente, sin revelar cuál dato produjo el rechazo.
- **Activación prematura o reuso de OTP:** mantener estados de flujo en servidor; crear/activar cuenta solo al completar verificación y clave; OTP de un solo uso y expiración.
- **Clave demo almacenada en claro:** no almacenarla en texto plano; si se persiste, aplicar hash usando mecanismo soportado por el stack del proyecto. Para la demo, evitar imprimirla o recuperarla.
- **Saldo inicial acreditado más de una vez:** crear el crédito inicial junto con la activación en una operación atómica y asegurar que solo exista un crédito inicial por wallet.
- **Saldo ficticio confundido con dinero real:** identificar la wallet y el crédito como datos de demo; impedir retiros o transferencias a sistemas reales.

## 6. Criterios de aceptación (medibles)
1. El formulario solicita tipo de documento, DNI y correo; si falta alguno o el correo no tiene formato válido, no inicia la verificación y muestra cómo corregirlo.
2. Para una persona sintética válida con correo asociado, se envía un OTP de exactamente cuatro dígitos al mail catcher configurado; para una combinación desconocida/no coincidente no se envía OTP y se devuelve un mensaje genérico.
3. El OTP vence a los 5 minutos, permite como máximo 5 intentos y solo puede usarse una vez; un OTP incorrecto, vencido o reutilizado no habilita la creación de clave.
4. El reenvío solo se habilita tras 60 segundos y no supera 3 envíos en una sesión de onboarding.
5. La creación de clave se habilita únicamente después de validar OTP; acepta exactamente cuatro dígitos y rechaza cualquier otro formato con un mensaje accionable.
6. Solo después de establecer la clave, se registra la cuenta, la wallet pasa a activa con saldo inicial de exactamente **S/ 100.00 PEN**, y el usuario navega a la pantalla inicial.
7. La pantalla inicial muestra **S/ 100.00** como saldo disponible, consultado al backend; completar/reintentar el onboarding no acredita un segundo saldo inicial.
8. Ante cualquier salida o error antes del último paso, no existe una cuenta activa, wallet activa ni crédito inicial para esa sesión.
9. DNI completo, OTP y clave no aparecen en logs de aplicación ni mensajes de error; los escenarios pueden repetirse con fixtures ficticios.

## 7. Plan de validación
- **Pruebas unitarias:** validación de campos/correo; coincidencia con fixtures; generación/formato, expiración, límite de intentos, reuso y reenvío OTP; validación de clave; transiciones de estado; asignación exacta de 10000 centavos PEN una sola vez.
- **Pruebas funcionales:** registro válido hasta pantalla inicial con saldo S/ 100.00; comprobar saldo cargado desde backend y ausencia de crédito en flujos incompletos; persona inexistente/correo no coincidente; campos vacíos; OTP incorrecto, expirado y reutilizado; exceso de intentos; clave inválida; reintento de activación.
- **Seguridad (comprobaciones mínimas):** usar exclusivamente fixtures sintéticos; asegurar que API nunca devuelve OTP; verificar mensajes no enumerables, límite de intentos, no exposición de secretos y que el PIN no se almacena en texto plano.
- **Evidencia requerida:** resultados reales de pruebas, capturas con datos sintéticos (sin OTP/DNI/clave visibles), fixture de demo documentado, README con pasos para iniciar backend/frontend y mail catcher, y limitaciones de seguridad señaladas.

## 8. Tareas sugeridas por rol
- **Chapter/PO**
  - Aprobar los parámetros demo de OTP, campos y mensajes; confirmar tipos documentales.
  - Aceptar criterios y validar el recorrido ante persona no encontrada.
- **Tech Lead**
  - Definir estados: `datos ingresados → OTP pendiente → OTP validado → clave creada → wallet activa`.
  - Acordar contrato frontend/backend, configuración del mail catcher y persistencia demo; incluir saldo y moneda en la respuesta de activación/inicio.
  - Revisar que documentación e interfaz etiqueten el flujo como demostración.
- **Backend**
  - Validar datos y coincidencia contra fixtures; emitir OTP por el mail catcher sin devolverlo al cliente.
  - Aplicar expiración, intentos, reenvíos y uso único del OTP.
  - Crear cuenta y activar wallet solo tras validar OTP y clave; persistir un único crédito inicial de 10000 centavos PEN junto con la activación; excluir secretos de logs.
- **Frontend**
  - Implementar pantallas/progreso para datos, OTP y creación de clave.
  - Mostrar mensajes accionables; tras completar el flujo, consultar al backend y mostrar el saldo de S/ 100.00 en la pantalla inicial.
- **QA**
  - Ejecutar camino feliz y casos inválidos/expirados/reutilizados.
  - Verificar que el estado de wallet permanece inactivo ante flujos incompletos.
  - Adjuntar salidas reales y pasos reproducibles a la entrega.
- **Cyber**
  - Confirmar que fixtures y capturas son sintéticos y no se filtran DNI, OTP ni clave.
  - Revisar límite/expiración del OTP, mensajes genéricos y almacenamiento de la clave demo.

## 9. Preguntas abiertas
- ¿El equipo aprueba los parámetros demo propuestos: 5 minutos, 5 intentos, espera de 60 segundos y máximo 3 envíos?
- ¿Qué tipos se mostrarán en el selector, considerando que el flujo usa DNI?
- ¿Qué mail catcher y base local usará la implementación según el stack finalmente acordado?
- ¿Se aprueba S/ 100.00 PEN como saldo inicial ficticio, no retirable y visible como demo?
- ¿El backend existente tendrá una tabla/entidad wallet y un movimiento de crédito inicial, o el equipo elegirá otra persistencia?
- ¿Qué texto y diseño tendrá la pantalla inicial después de activar la wallet?
- ¿Qué mecanismo de hash está disponible en el stack para la clave demo?
