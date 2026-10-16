# Historia 2: Confirmación de pago — escenario exitoso

## 1. Summary

Como pagador, quiero completar una transferencia de bajo monto y recibir una
confirmación definitiva, para saber si el pago se realizó.

**Resultado esperado:** recorrido de onboarding, wallet activa, pago simulado
exitoso con referencia visible e historial. Fuente:
[Hallazgos.md](../Hallazgos.md), Sprint 1, Historia 2.

## 2. Scope

- **Dentro:** mostrar destinatario e importe antes de confirmar; simular el
  resultado exitoso; mostrar su referencia y guardar el pago en el historial.
- **Fuera:** pagos reales y metas de negocio trimestrales como resultados
  demostrados por el prototipo.

## 3. Supuestos

- El proveedor de pagos es simulado y el importe/destinatario son ficticios.
- No se han acordado todavía el destinatario, el importe ni el contrato mínimo.

## 4. Decisiones técnicas por tomar

- Acordar el destinatario y el importe ficticios.
- Documentar el contrato mínimo para iniciar el pago.
- Definir los campos y etiquetas que componen el resultado y su referencia.

## 5. Riesgos y mitigaciones

- **Riesgo:** el pagador no puede verificar qué está confirmando.
  **Mitigación:** mostrar destinatario e importe antes de confirmar.
- **Riesgo:** la confirmación y el historial presentan referencias o resultados
  inconsistentes. **Mitigación:** guardar el pago simulado y mostrar su resultado
  y referencia en el recorrido.

## 6. Criterios de aceptación

- Antes de confirmar, se muestran el destinatario y el importe acordados.
- Al completar el escenario exitoso simulado, se presenta un resultado definitivo
  y una referencia visible.
- El pago queda disponible en el historial con el resultado y referencia de la
  operación.
- La ruta de demo se puede recorrer desde onboarding hasta historial.

## 7. Plan de validación

- **Pruebas unitarias:** generación de referencia y persistencia del resultado
  exitoso en el historial.
- **Pruebas funcionales:** recorrer onboarding, wallet activa, confirmación e
  historial con el escenario acordado.
- **Seguridad:** usar destinatario e importe ficticios y verificar que el
  proveedor simulado no se presenta como servicio real.
- **Evidencia requerida:** salida real de pruebas y registro o capturas del
  recorrido y la referencia visible.

## 8. Tareas sugeridas por rol

- **Chapter/PO:** acordar destinatario e importe; revisar el contrato mínimo de
  inicio de pago; validar que la confirmación responde a la historia.
- **Tech Lead:** documentar el contrato acordado; definir cómo se propaga la
  referencia al resultado e historial; mantener explícito el uso del simulador.
- **Backend:** simular la respuesta exitosa; generar una referencia; guardar el
  pago en el historial.
- **Frontend:** mostrar destinatario e importe antes de confirmar; presentar el
  resultado; hacer visible su referencia.
- **QA:** recorrer el flujo completo; comprobar la referencia en confirmación;
  comprobar el pago en historial y registrar el resultado real.
- **Cyber:** comprobar que los datos son ficticios; revisar que la demo identifica
  claramente el proveedor como simulado.

## 9. Preguntas abiertas

- ¿Qué destinatario e importe ficticios se utilizarán?
- ¿Cuál es el contrato mínimo para iniciar el pago?
- ¿Qué formato y etiquetas tendrá la referencia visible?
