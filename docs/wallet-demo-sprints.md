HISTORIAS, TAREAS Y ENTREGABLES POR SPRINT
Alcance de la demo: un recorrido del pagador con datos ficticios y proveedor de pagos simulado. Las metas trimestrales de negocio no se considerarán resultados demostrados por el prototipo.

Sprint 1 ---> Registro, activación y pago exitoso

1. Historia 1: Registro y activación
"Como usuario que realiza transferencias de bajo monto, quiero completar un onboarding guiado y saber cuál es el siguiente paso, para activar mi wallet de demo y empezar a pagar."

Tareas
- Producto / Arquitectura: acordar los campos ficticios del registro y documentar que no representan un flujo KYC productivo.
- Frontend: mostrar los pasos y el paso actual; bloquear el avance si falta un campo obligatorio o es inválido, con un mensaje que indique cómo corregirlo.
- Backend: aceptar el registro de demo, persistir el estado y activar la wallet al completar correctamente.
- QA: probar un registro válido y otro con datos incompletos o inválidos.
***Entregable: onboarding reproducible que activa una wallet de demo; documentación de campos y supuestos.

2. Historia 2: Confirmación de pago — escenario exitoso
"Como pagador, quiero completar una transferencia de bajo monto y recibir una confirmación definitiva, para saber si el pago se realizó."

Tareas
- Producto / Arquitectura: acordar el destinatario e importe ficticios y documentar el contrato mínimo para iniciar el pago.
- Frontend: mostrar destinatario e importe antes de confirmar; después, presentar el resultado y su referencia.
- Backend: simular una respuesta exitosa, generar una referencia y guardar el pago en el historial.
- QA: recorrer onboarding → wallet activa → pago exitoso → historial y registrar el resultado real.
***Entregable: demo del recorrido feliz de extremo a extremo con pago simulado, referencia visible e historial.

Sprint 2 ---> Idempotencia y manejo de fallos

3. Historia 3: Idempotencia en pagos
"Como analista de operaciones y confiabilidad, quiero que los intentos duplicados se manejen de forma idempotente, para evitar duplicidad financiera ante reintentos."

Tareas
- Producto / Arquitectura: acordar cómo se reconoce un reintento del mismo intento; documentar la ventana de retención como decisión de demo o pregunta pendiente.
- Backend: asociar una clave al intento; ante una solicitud repetida con la misma clave, devolver el resultado original sin crear otro pago.
- Frontend: reutilizar la clave al reintentar la misma operación.
- QA: enviar dos veces la misma solicitud y comprobar que existe un solo pago y que se devuelve el mismo resultado.
- Entregable: escenario repetible de reintento idempotente con evidencia de una única transacción y registro que distingue el original del duplicado.

Historia 4: Pagos fallidos y reversos
"Como especialista de soporte, quiero que los pagos fallido expirados y disputados tengan rutas de atención claras, para orientar al usuario y resolver incidentes de forma predecible."

Tareas
- Producto / Arquitectura: elegir para la demo un caso fallido o expirado y acordar la acción siguiente; definir qué se deriva a investigación o disputa.
- Backend: simular fallo/expiración con código de motivo y registrar la acción de soporte, referencia del pago y estado de resolución.
- Frontend: mostrar al pagador si debe reintentar o volver; ofrecer una vista mínima de soporte con la ruta sugerida.
- QA / Seguridad: comprobar el caso elegido y que una transferencia ya ejecutada no se presente como fallida ni como reversada automáticamente.
***Entregable: escenario de fallo reproducible, orientación visible y registro de soporte. Los reversos reales quedan fuera de la demo; un pago ejecutado se deriva a investigación o disputa.

Cierre y validación
Criterio de cierre integral de la demo (Sprint 1 integrado + Sprint 2): otra persona puede seguir el README y reproducir el onboarding, el pago exitoso, un reintento duplicado y el fallo acordado. El reintento duplicado y el fallo acordado son escenarios del Sprint 2; no están implementados en la entrega frontend actual del Sprint 1. La demo local de Sprint 1 tampoco demuestra integración ni persistencia backend.
Evidencia: README con instrucciones, casos cubiertos, simulaciones y límites; salida real de las pruebas ejecutadas y pasos o capturas de los escenarios.
Decisiones pendientes: campos ficticios, importe de bajo monto, etiquetas de estados, retención de clave y categorías de disputa. Si no se resuelven, documentarlas como preguntas abiertas; no inventar reglas.