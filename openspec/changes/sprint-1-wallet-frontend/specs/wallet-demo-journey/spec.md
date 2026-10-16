# Spec Delta

## Purpose

Permite recorrer en español una demo frontend de wallet desde el ingreso de un alias ficticio hasta la activación, un pago simulado y la consulta de su historial, haciendo explícitos los límites y resultados inciertos de la simulación local.

## ADDED Requirements

### Requirement: El onboarding exige un alias ficticio con formato de demo
El frontend MUST requerir un alias de 3 a 20 caracteres ASCII, compuesto únicamente por letras, números o guion bajo. Estas reglas son exclusivas de la demo y no representan KYC ni validaciones de producción.

#### Scenario: Alias dentro de límites y con caracteres permitidos
- **WHEN** la persona ingresa un alias de 3 a 20 caracteres que contiene solo `A-Z`, `a-z`, `0-9` o `_`
- **THEN** el frontend lo acepta y permite continuar al paso de revisión

#### Scenario: Alias vacío, fuera de límites o con caracteres no permitidos
- **WHEN** la persona intenta continuar con un alias vacío, menor de 3, mayor de 20, con espacios, guiones, acentos u otros caracteres no permitidos
- **THEN** el frontend impide avanzar e indica que debe corregir el alias según las reglas de demo

### Requirement: El onboarding presenta los pasos acordados en orden
El frontend MUST guiar a la persona por los pasos ingresar alias, revisar y activar, indicando el paso actual y sin activar antes de la confirmación explícita en la revisión.

#### Scenario: Recorrido del onboarding
- **WHEN** la persona completa el registro de demo
- **THEN** puede identificar y recorrer en orden ingresar alias, revisar y activar

#### Scenario: Activación requiere confirmación en la revisión
- **WHEN** la persona aún no confirma la activación desde la revisión
- **THEN** el frontend no activa la wallet

### Requirement: La navegación de wallet requiere activación confirmada
El frontend MUST habilitar el inicio de wallet, el pago y el historial únicamente después de recibir confirmación de activación exitosa.

#### Scenario: Activación exitosa
- **WHEN** el adaptador devuelve activación exitosa
- **THEN** el frontend confirma la activación y habilita el inicio de wallet

#### Scenario: Wallet sin activar
- **WHEN** la persona intenta acceder al pago o historial antes de la activación confirmada
- **THEN** el frontend la mantiene en el onboarding y no presenta esas funciones como disponibles

#### Scenario: Error técnico de activación
- **WHEN** la activación encuentra un error técnico
- **THEN** el frontend informa el problema sin confirmar activación ni habilitar la wallet

### Requirement: La revisión del pago presenta valores fijos
Antes de iniciar el pago, el frontend MUST mostrar el destinatario fijo María Demo y el importe fijo S/ 5.00, representado para el servicio como 500 céntimos en PEN; la persona no puede editar estos valores en la demo.

#### Scenario: Revisión antes de pagar
- **WHEN** la persona llega a la confirmación del pago
- **THEN** ve María Demo y S/ 5.00 antes de que se inicie la solicitud

#### Scenario: Valores de la demo no editables
- **WHEN** la persona revisa el pago
- **THEN** el destinatario y el importe se mantienen fijos en los valores acordados

### Requirement: Un pago simulado exitoso tiene una referencia única de demo
El frontend MUST mostrar confirmación y referencia únicamente cuando el adaptador devuelva un resultado exitoso con una referencia única por pago simulado y prefijo `DEMO`.

#### Scenario: Pago simulado exitoso
- **WHEN** el adaptador devuelve un pago exitoso con referencia única prefijada `DEMO`
- **THEN** el frontend comunica el éxito y muestra la referencia recibida

#### Scenario: No hay respuesta de éxito con referencia
- **WHEN** el adaptador no devuelve un resultado exitoso con referencia
- **THEN** el frontend no comunica pago exitoso ni inventa una referencia de éxito

### Requirement: Un timeout de pago se comunica como resultado sin confirmar
Ante un timeout durante el pago, el frontend MUST conservar la incertidumbre: no debe comunicar éxito ni fallo de pago, y no debe iniciar otro pago automáticamente.

#### Scenario: Timeout mientras se procesa el pago
- **WHEN** vence el tiempo de espera y no se conoce el resultado del pago
- **THEN** el frontend presenta el resultado como sin confirmar, no lo declara fallido y no envía automáticamente otra solicitud de pago

### Requirement: Los errores técnicos se distinguen de éxito y de historial vacío
El frontend MUST presentar errores técnicos de pago e historial como problemas técnicos, sin convertirlos en éxito, fallo de negocio ni historial vacío.

#### Scenario: Error técnico de pago distinto del timeout
- **WHEN** el servicio devuelve un error técnico de pago sin resultado exitoso
- **THEN** el frontend informa el problema y no presenta el pago como exitoso ni inventa una referencia

#### Scenario: Error técnico al consultar historial
- **WHEN** el servicio no puede devolver el historial por un error técnico
- **THEN** el frontend muestra el error y no lo presenta como un historial vacío

### Requirement: El historial de demo refleja solo resultados exitosos de la sesión
El frontend MUST mostrar en el historial los pagos simulados exitosos devueltos por el adaptador, y distinguir carga, lista vacía y error técnico. El historial se mantiene solo en memoria y se pierde al recargar.

#### Scenario: Historial contiene el pago exitoso de la sesión
- **WHEN** el adaptador devuelve el pago exitoso realizado durante la sesión
- **THEN** el historial muestra sus datos y la referencia `DEMO` recibida

#### Scenario: Historial vacío al iniciar o tras recargar
- **WHEN** no hay pagos exitosos en memoria, incluso después de recargar la página
- **THEN** el frontend comienza un nuevo recorrido con historial vacío, no con el historial de la sesión anterior

### Requirement: La experiencia es accesible y adaptable
El recorrido MUST estar en español, permitir uso con teclado, asociar errores a sus controles y conservar legibilidad y acciones en pantallas de smartphone sin desplazamiento horizontal de página.

#### Scenario: Uso con teclado y tecnologías de asistencia
- **WHEN** una persona navega el flujo sin ratón o utiliza tecnologías de asistencia
- **THEN** puede identificar los pasos, operar controles, percibir errores y entender cambios de estado

#### Scenario: Pantalla de smartphone
- **WHEN** se muestra el recorrido en una pantalla de smartphone
- **THEN** el contenido y las acciones permanecen legibles y utilizables sin desplazamiento horizontal de página

## Fuera de alcance

La propuesta de tipos internos TypeScript se documenta en `design.md`; no constituye un contrato backend aprobado. Idempotencia, reintentos duplicados, fallos de pago de negocio, expiraciones y soporte pertenecen al Sprint 2. La integración y evidencia backend necesarias para el cierre completo de Sprint 1 no son comportamiento demostrado por el adaptador de demo.
