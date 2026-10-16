# Tareas

## 1. Contrato local y adaptador en memoria

- [x] 1.1 Definir en `frontend/src/types/walletDemo.ts` la propuesta de tipos TypeScript internos para activación, pago, historial y errores técnicos, incluyendo estados `pending`, `confirmed`, `unconfirmed` y `technical-error` donde correspondan; verificar el tipado desde la raíz con `npm --prefix frontend run build` y confirmar en el código/documentación que no se presenta como contrato backend aprobado.
- [x] 1.2 Implementar en `frontend/src/services/walletDemoService.ts` el adaptador de demo en memoria con activación, pago e historial; verificar que cada recarga inicia un recorrido nuevo y elimina el historial de la sesión, sin almacenamiento persistente del navegador.

## 2. Onboarding y activación

- [x] 2.1 Implementar los pasos ingresar alias, revisar y activar, con alias obligatorio de 3–20 caracteres ASCII de letras, números o guion bajo; verificar aceptación de longitudes 3 y 20 y rechazo de vacío, longitudes 2 y 21, espacios, guiones, acentos y otros caracteres.
- [x] 2.2 Conectar la activación al adaptador y proteger la wallet hasta su respuesta exitosa; verificar activación confirmada, que no se activa antes de confirmación explícita y que un error técnico no habilita la wallet.
- [x] 2.3 Presentar pasos, controles y errores accesibles en español; verificar recorrido completo con teclado y que los mensajes de error estén asociados a sus controles y sean perceptibles sin depender del color.

## 3. Pago e historial

- [x] 3.1 Implementar la revisión fija de María Demo y S/ 5.00 con representación de servicio de 500 céntimos PEN; verificar que ambos valores son visibles antes del envío, no son editables y no se inicia el pago antes de confirmar.
- [x] 3.2 Implementar resultados de pago: éxito solo ante respuesta exitosa con referencia única prefijada `DEMO`; timeout como sin confirmar, sin declarar fallo y sin iniciar otro pago automáticamente; verificar por separado éxito, timeout y error técnico sin éxito.
- [x] 3.3 Implementar estados de carga, vacío, historial con pago exitoso y error técnico; verificar que el historial muestra la referencia recibida, distingue error de vacío y queda vacío tras recargar.

## 4. Adaptación y verificación de la entrega frontend

- [x] 4.1 Adaptar el recorrido a smartphones; verificar manualmente que los pasos y acciones son legibles y utilizables sin desplazamiento horizontal y que no se pierde contenido.
- [x] 4.2 Actualizar `frontend/README.md` con instrucciones reproducibles del recorrido frontend, alias ficticio, valores fijos, referencia `DEMO`, reinicio al recargar y límites del adaptador; indicar cómo ejecutar los comandos desde `frontend/` o desde la raíz usando `npm --prefix frontend`; verificar siguiendo esas instrucciones que la demo no se confunde con persistencia o evidencia backend.
- [x] 4.3 Verificar de extremo a extremo onboarding → activación → revisión → pago simulado exitoso → historial, y ejecutar desde la raíz `npm --prefix frontend run build` y `npm --prefix frontend run lint`; registrar la evidencia solo como validación frontend/local, no como cierre integrado de Sprint 1.

## Pendientes fuera del alcance de la aceptación frontend

- El directorio `backend/` existe en este repositorio, pero aún debe acordarse formalmente el contrato de integración e implementarse activación, pago e historial persistentes. Los tipos TypeScript locales de este cambio son solo una propuesta hasta ese acuerdo.
- Backend y QA deben aportar evidencia de la integración real y del recorrido contra backend para declarar completo Sprint 1. Una ejecución del adaptador en memoria no satisface ese requisito.
- El documento existente `docs/wallet-demo-sprints.md` mantiene un criterio de demo completa que incluye reintento duplicado y fallo acordado. Su alineación con la aceptación separada del frontend y las dependencias de Sprint 1/Sprint 2 queda fuera de estos cuatro artefactos y requiere una actualización documental aparte.
