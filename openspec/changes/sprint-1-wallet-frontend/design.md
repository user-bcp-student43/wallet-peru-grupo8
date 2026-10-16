# Diseño

## Contexto

Ver [proposal.md](./proposal.md) para el propósito y [specs/wallet-demo-journey/spec.md](./specs/wallet-demo-journey/spec.md) para el comportamiento observable. El frontend está en `frontend/`: la UI del recorrido vive en `frontend/src/App.tsx`, el adaptador en `frontend/src/services/walletDemoService.ts` y los tipos en `frontend/src/types/walletDemo.ts`. El alcance de este cambio es una demo frontend con un adaptador en memoria. `backend/` también forma parte del repositorio, pero su integración y la evidencia integrada para el cierre completo del sprint quedan fuera de este cambio.

## Objetivos / No objetivos

**Objetivos:**

- Mantener un único recorrido guiado con onboarding en los pasos ingresar alias, revisar y activar.
- Separar la UI de una interfaz TypeScript local que pueda implementar el adaptador de demo y, en el futuro, ser adaptada a backend.
- Representar explícitamente la diferencia entre pago confirmado y pago sin confirmar por timeout, sin mensajes de fallo de negocio ni repetición automática.
- Hacer visible que la sesión y el historial simulado se pierden al recargar.

**No objetivos:**

- Definir o afirmar un contrato backend aprobado; el modelo TypeScript descrito aquí es una propuesta técnica local.
- Persistir la sesión o pagos entre recargas, integrar backend o afirmar que el mock evidencia persistencia.
- Implementar reintentos/idempotencia, fallos de pago de negocio, expiraciones o soporte del Sprint 2.
- Añadir router o dependencias de UI sin una necesidad demostrada.

## Decisiones

### Flujo explícito y validación exclusiva de demo

El onboarding tiene tres pasos: ingresar alias, revisar y activar. El alias es obligatorio y válido únicamente si contiene entre 3 y 20 caracteres ASCII de `A-Z`, `a-z`, `0-9` o `_`; no se recortan ni aceptan espacios, guiones, acentos u otros caracteres. Estas son restricciones del alias ficticio de demo, no requisitos KYC ni reglas de producción. La UI solo habilita la activación tras una revisión válida y muestra wallet activa después de una respuesta de activación exitosa.

**Alternativa considerada:** aceptar una selección más amplia de caracteres o datos personales; se descarta para evitar inventar campos de identidad y mantener un alias sintético y reproducible.

### Valores de pago fijados y representados sin ambigüedad

El destinatario es `María Demo`. El importe se transporta internamente como `amountMinor: 500` y `currency: 'PEN'`, y se presenta como `S/ 5.00`. No hay edición de destinatario o importe en esta demo.

**Alternativa considerada:** hacer editables estos valores; se descarta porque no forma parte del recorrido acordado.

### Contrato TypeScript propuesto localmente

La UI depende de operaciones tipadas de activación, pago e historial; el adaptador en memoria las implementa. Como propuesta local, el modelo separa estados de operación y resultado:

- Activación: `idle | pending | active | technical-error`.
- Pago: `idle | pending | confirmed | unconfirmed | technical-error`. `confirmed` incluye la referencia única `DEMO...`; `unconfirmed` expresa que no se pudo determinar el resultado, en particular por timeout, y nunca incluye una referencia de éxito.
- Historial: `idle | loading | empty | loaded | technical-error`.
- Error técnico tipado: operación (`activation | payment | history`) y clase (`timeout | unavailable | unexpected`). El modelo no agrega códigos de fallo de negocio.

Esos nombres y formas son una propuesta de tipos internos, no un contrato acordado por backend. El adaptador genera referencias únicas con prefijo `DEMO` para pagos simulados exitosos y mantiene sus datos solo en memoria. Los valores de la transferencia permanecen fijos en el límite del servicio.

**Alternativa considerada:** incrustar los mocks en componentes o conectar directamente la UI a endpoints no definidos; se descarta porque oculta la frontera de integración y aparentaría un contrato backend inexistente.

### Timeout: resultado sin confirmar, nunca fallo ni repetición automática

Un timeout durante el pago mueve la experiencia a `unconfirmed`: se informa que el resultado no se pudo confirmar y se conserva explícitamente la incertidumbre. No se muestra éxito ni pago fallido, no se inventa referencia y no se inicia otra solicitud de pago automáticamente. Los errores técnicos de otras operaciones se presentan como tales y no se transforman en estados exitosos o vacíos.

**Alternativa considerada:** tratar timeout como pago fallido y reintentar; se descarta porque podría duplicar un pago que el sistema externo sí hubiera procesado.

### Ciclo de vida solo en memoria

El adaptador almacena activación y pagos simulados en memoria durante la sesión de la aplicación. Al recargar, comienza un nuevo recorrido y el historial de esa sesión desaparece. La UI y el README identifican el estado como demo local; no se utiliza almacenamiento persistente del navegador.

**Alternativa considerada:** persistir en almacenamiento del navegador; se descarta para cumplir el reinicio acordado y evitar confundir persistencia local con backend.

### Criterio de entrega

La entrega frontend con adaptador simulado puede aceptarse separadamente si se verifica el recorrido local y sus límites. El Sprint 1 completo requiere integración y evidencia de backend; no se equiparan build, lint ni una demo local con esa evidencia.

## Riesgos / Compensaciones

- [Un pago con timeout pudo completarse externamente] → Mostrar resultado sin confirmar, no crear una referencia de éxito y no repetir automáticamente el pago.
- [La demo puede parecer persistente o integrada] → Reiniciar al recargar, etiquetar su naturaleza local y separar la evidencia de frontend de la evidencia backend.
- [El modelo TypeScript puede confundirse con un contrato de servicio aprobado] → Marcarlo como propuesta local hasta que frontend y backend acuerden formalmente la integración.
- [El cierre integral necesita evidencia que esta entrega frontend no produce] → Mantener la integración y la evidencia de backend como pendientes fuera del alcance de este cambio para declarar completo Sprint 1.

## Plan de migración

No hay migración de datos: el estado del adaptador vive en memoria y desaparece al recargar. La entrega frontend puede desplegarse o revertirse por separado; la conexión futura con el backend del repositorio requiere acordar y validar su contrato e integración. La aceptación del frontend no cambia el requisito de integración y evidencia de backend para el cierre completo del Sprint 1.
