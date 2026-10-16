# Spec Delta

## Purpose

Permite a una persona completar un onboarding de wallet de demo con datos sintéticos, verificar su correo mediante OTP y activar una wallet con crédito inicial único, sin revisión humana ni operaciones financieras reales.

## ADDED Requirements

### Requirement: El formulario solicita y valida datos de onboarding
El frontend MUST solicitar tipo de documento (DNI o pasaporte), número de documento y correo personal antes de iniciar la solicitud, y MUST impedir el envío de campos vacíos o un correo con formato inválido.

#### Scenario: Envío de datos completos
- **WHEN** la persona ingresa un tipo admitido, un número de documento y un correo con formato válido
- **THEN** el frontend permite iniciar la solicitud de onboarding

#### Scenario: Datos incompletos o correo inválido
- **WHEN** falta un campo obligatorio o el correo no tiene formato válido
- **THEN** el frontend impide el envío e indica qué dato debe corregirse

### Requirement: El backend inicia el onboarding sin revisión humana
Al recibir una solicitud válida, el backend MUST buscar por tipo y número de documento sintético, crear una solicitud rastreable con un identificador opaco e iniciar la emisión de un OTP de cuatro dígitos al correo simulado, sin estado, aprobación ni intervención de revisión humana.

#### Scenario: Inicio de una solicitud
- **WHEN** el backend recibe datos válidos de DNI o pasaporte
- **THEN** crea una solicitud en estado `OTP_PENDING`, devuelve un ID opaco y el siguiente paso es ingresar OTP
- **AND** emite el OTP al mecanismo de correo simulado

#### Scenario: No se expone el resultado del lookup
- **WHEN** se inicia una solicitud con o sin coincidencia en los datos sintéticos
- **THEN** la respuesta no revela al solicitante si hubo coincidencia ni presenta una ruta de rechazo diferenciada por falta de coincidencia
- **AND** para una solicitud sin coincidencia, una verificación OTP válida permite llegar a completar, pero no se crea cliente ni wallet y la API devuelve `ONBOARDING_NOT_COMPLETABLE` con un mensaje genérico
- **AND** se acepta que comparar el resultado de finalización con una activación exitosa permite inferir indirectamente la coincidencia, como riesgo residual aprobado para la demo

### Requirement: La solicitud se consulta mediante un canal de seguimiento protegido
Las operaciones posteriores al inicio MUST requerir el token de seguimiento aleatorio asociado a la solicitud; el estado autoritativo MUST provenir del backend y no revelar información de coincidencia de identidad.

#### Scenario: Consulta de una solicitud pendiente
- **WHEN** el cliente autorizado consulta una solicitud aún no verificada
- **THEN** el backend devuelve estado `OTP_PENDING` y siguiente paso `ENTER_OTP`

#### Scenario: Consulta después de verificar OTP
- **WHEN** el cliente autorizado consulta una solicitud con OTP validado
- **THEN** el backend devuelve estado `OTP_VERIFIED` y siguiente paso `CREATE_PIN`

#### Scenario: Token ausente o inválido
- **WHEN** una operación de solicitud se invoca sin el token válido de seguimiento
- **THEN** el backend rechaza la operación sin revelar datos personales ni información de coincidencia

### Requirement: La verificación OTP respeta los límites acordados
El backend MUST validar el OTP de cuatro dígitos, cuya vigencia será de cinco minutos desde la emisión. MUST impedir avanzar con un código incorrecto, vencido o reutilizado y bloquear nuevas verificaciones para ese código después de tres intentos fallidos. Esta demo MUST NOT ofrecer reenvío de OTP. El backend MUST conservar solo HMAC-SHA-256 del OTP, calculado con una sal aleatoria por credencial y una clave secreta configurada fuera de la aplicación, y MUST compararlo en tiempo constante.

#### Scenario: OTP correcto y no utilizado
- **WHEN** la persona envía el OTP vigente y correcto antes de agotar los intentos
- **THEN** el backend marca la solicitud `OTP_VERIFIED` y permite avanzar a crear PIN

#### Scenario: OTP incorrecto
- **WHEN** la persona envía un OTP incorrecto antes del tercer intento fallido
- **THEN** el backend no permite avanzar ni expone el código recibido

#### Scenario: Tres intentos fallidos
- **WHEN** la persona ha enviado tres OTP incorrectos para el mismo código
- **THEN** el backend bloquea nuevas verificaciones de ese código y comunica que se agotaron los intentos permitidos

#### Scenario: OTP vencido o reutilizado
- **WHEN** la persona envía un OTP vencido o ya consumido
- **THEN** el backend no permite avanzar ni completar el onboarding con ese código
- **AND** responde con un error seguro que no distingue entre código incorrecto y vencido

#### Scenario: Solicitud de reenvío
- **WHEN** el cliente solicita reenviar un OTP
- **THEN** la API no ofrece un endpoint de reenvío en esta demo

### Requirement: El PIN se protege sin persistir su valor en claro
El backend MUST conservar el PIN únicamente como HMAC-SHA-256 calculado con una sal aleatoria por credencial y una clave secreta configurada fuera de la aplicación, y MUST comparar el HMAC en tiempo constante. El PIN en claro MUST NOT aparecer en logs, errores, analítica ni trazas.

### Requirement: El PIN solo se acepta tras verificar el OTP
El frontend y el backend MUST permitir completar el registro únicamente después de `OTP_VERIFIED`, y MUST aceptar solo un PIN numérico de cuatro dígitos para esta demo.

#### Scenario: PIN válido tras OTP verificado
- **WHEN** la persona con OTP verificado envía un PIN de cuatro dígitos numéricos
- **THEN** el backend puede completar el registro de la aplicación y activar la wallet

#### Scenario: PIN inválido o estado previo a OTP
- **WHEN** el PIN está vacío, no es numérico, no tiene cuatro dígitos o la solicitud no está en `OTP_VERIFIED`
- **THEN** el backend no completa el registro ni activa la wallet

### Requirement: La activación y el crédito inicial son atómicos e idempotentes
Al completar correctamente el onboarding, el backend MUST registrar al cliente de la aplicación, activar una wallet PEN y acreditar `10000` céntimos ficticios de forma atómica, garantizando que reintentos no creen otra wallet ni dupliquen el crédito.

#### Scenario: Primera finalización válida
- **WHEN** se completa una solicitud verificada con un PIN válido
- **THEN** el estado pasa a `ACTIVE` y queda una wallet activa con saldo inicial de `10000` céntimos PEN

#### Scenario: Reintento de finalización
- **WHEN** se reintenta completar una solicitud ya activada
- **THEN** no se crea otra cuenta, wallet ni movimiento de crédito inicial y el saldo no aumenta a `20000` céntimos

#### Scenario: Estado previo a la verificación
- **WHEN** se intenta completar una solicitud que todavía no está `OTP_VERIFIED`
- **THEN** no se crea wallet activa ni se acredita saldo

### Requirement: La bienvenida refleja datos autoritativos del backend
Después de la activación, el frontend MUST mostrar el nombre y apellido sintéticos asociados al documento y el saldo PEN obtenido del backend, con el monto inicial representado como S/ 100.00.

#### Scenario: Bienvenida tras activación
- **WHEN** el backend confirma la activación y devuelve los datos de bienvenida
- **THEN** la pantalla inicial muestra nombre, apellido y saldo provenientes de esa respuesta

### Requirement: El progreso y la analítica cubren el onboarding sin PII
La interfaz MUST indicar el paso actual y los pasos restantes; el sistema MUST registrar inicio, pasos completados y cierre con ID opaco y timestamp, sin datos del formulario ni credenciales.

#### Scenario: Avance por el flujo
- **WHEN** la persona recorre datos, OTP, PIN y bienvenida
- **THEN** la interfaz identifica el paso actual y la secuencia restante, y se emiten los eventos acordados de inicio, avance y cierre

#### Scenario: Evento de analítica
- **WHEN** se registra un evento de onboarding
- **THEN** contiene un ID opaco, el evento/paso permitido y timestamp, sin DNI, nombre, apellido, correo, OTP, PIN ni payload del formulario

### Requirement: Los registros técnicos excluyen datos personales y credenciales
Los logs, errores, auditoría, analítica y trazas MUST excluir DNI, nombre, apellido, correo, OTP, PIN, tokens de seguimiento y cuerpos HTTP; la correlación funcional MUST usar identificadores aleatorios u opacos no derivados de datos personales.

#### Scenario: Revisión de trazabilidad
- **WHEN** se inspeccionan logs, auditoría, analítica y trazas de una solicitud
- **THEN** no contienen los campos sensibles ni valores derivados por hash simple, y permiten correlacionar la operación mediante un ID opaco

### Requirement: El onboarding no ejecuta pagos ni operaciones financieras reales
La experiencia MUST identificar el saldo como ficticio y MUST NOT procesar pagos, transferencias ni retiros como parte del onboarding.

#### Scenario: Uso del saldo de demo
- **WHEN** la persona completa la activación
- **THEN** el sistema muestra el crédito ficticio y no inicia una operación financiera real

#### Scenario: Entrada visual a pagos
- **WHEN** la bienvenida presenta un punto de entrada a pagos
- **THEN** se mantiene como elemento visual sin procesar un pago
