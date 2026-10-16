# Historia 3: Idempotencia en pagos

## 1. Summary

Como analista de operaciones y confiabilidad, quiero que los intentos duplicados
se manejen de forma idempotente, para evitar duplicidad financiera ante
reintentos.

**Resultado esperado:** escenario repetible en el que el mismo intento devuelve
el resultado original y existe una única transacción. Fuente:
[Hallazgos.md](../Hallazgos.md), Sprint 2, Historia 3.

## 2. Scope

- **Dentro:** asociar una clave al intento, reutilizarla al reintentar la misma
  operación y devolver el resultado original sin crear otro pago.
- **Fuera:** definir una ventana de retención sin acuerdo; la duración es una
  decisión de demo pendiente.

## 3. Supuestos

- Un reintento del mismo intento se identifica con la misma clave.
- La duración durante la que se conserva la clave no está definida.

## 4. Decisiones técnicas por tomar

- Acordar cómo se reconoce un reintento del mismo intento.
- Decidir y documentar la ventana de retención de la clave, o mantenerla como
  pregunta pendiente explícita.

## 5. Riesgos y mitigaciones

- **Riesgo:** un reintento crea un segundo pago. **Mitigación:** asociar una clave
  al intento y devolver el resultado original para solicitudes repetidas con la
  misma clave.
- **Riesgo:** la garantía del reintento queda ambigua fuera de una ventana de
  retención no definida. **Mitigación:** acordar y documentar la ventana antes
  de declarar el comportamiento completo.

## 6. Criterios de aceptación

- El primer intento queda asociado a una clave de idempotencia.
- Repetir la solicitud con la misma clave devuelve el resultado original.
- Tras dos solicitudes iguales, existe un único pago y ambas respuestas
  representan el mismo resultado.
- El frontend reutiliza la clave al reintentar la misma operación.

## 7. Plan de validación

- **Pruebas unitarias:** asociación de clave e identificación de solicitud
  repetida.
- **Pruebas funcionales:** enviar dos veces la misma solicitud; comprobar una
  sola transacción y el mismo resultado devuelto.
- **Seguridad:** verificar que la idempotencia no cambia los controles de acceso
  existentes en el flujo de pago.
- **Evidencia requerida:** salida de pruebas y registro que distingue el intento
  original del duplicado, con evidencia de una sola transacción.

## 8. Tareas sugeridas por rol

- **Chapter/PO:** acordar qué constituye el mismo intento; resolver o documentar
  la ventana de retención; validar la evidencia esperada.
- **Tech Lead:** documentar la semántica de la clave; registrar la decisión de
  retención; definir cómo observar original y duplicado en la evidencia.
- **Backend:** asociar una clave al intento; detectar solicitudes repetidas con
  la misma clave; devolver el resultado original sin crear otro pago.
- **Frontend:** crear o conservar la clave para un intento; reutilizarla al
  reintentar esa misma operación; no tratar una operación nueva como reintento.
- **QA:** enviar la misma solicitud dos veces; comprobar una sola transacción;
  comprobar que se devuelve el resultado original.
- **Cyber:** comprobar que el control de idempotencia no sustituye los controles
  de acceso existentes.

## 9. Preguntas abiertas

- ¿Cómo se reconoce que dos solicitudes pertenecen al mismo intento?
- ¿Cuál es la ventana de retención de la clave?
