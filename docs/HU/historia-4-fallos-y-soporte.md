# Historia 4: Pagos fallidos y reversos — rutas de soporte

## 1. Summary

Como especialista de soporte, quiero que los pagos fallidos, expirados y
disputados tengan rutas de atención claras, para orientar al usuario y resolver
incidentes de forma predecible.

**Resultado esperado:** escenario de fallo reproducible, orientación visible y
registro de soporte. La demo elige un caso fallido o expirado; los pagos
ejecutados se derivan a investigación o disputa. Fuente:
[Hallazgos.md](./Hallazgos.md), Sprint 2, Historia 4.

## 2. Scope

- **Dentro:** simular el caso de fallo o expiración acordado; mostrar la ruta
  sugerida; registrar motivo, referencia, acción de soporte y estado de resolución.
- **Fuera:** reversos reales. Un pago ejecutado no se presenta como fallido ni se
  reversa automáticamente.

## 3. Supuestos

- Para la demo se seleccionará un caso fallido o expirado.
- La derivación de pagos ejecutados se limita a investigación o disputa; no
  implica un reverso real.

## 4. Decisiones técnicas por tomar

- Elegir el caso fallido o expirado que se simulará y acordar la acción siguiente.
- Definir qué situaciones se derivan a investigación o disputa.
- Acordar las categorías de disputa y las etiquetas de estado necesarias.

## 5. Riesgos y mitigaciones

- **Riesgo:** un pago ya ejecutado se comunica como fallido o se revierte
  automáticamente. **Mitigación:** derivarlo a investigación o disputa y excluir
  reversos reales de la demo.
- **Riesgo:** el usuario no sabe qué hacer ante el resultado simulado.
  **Mitigación:** mostrar si debe reintentar o volver, junto con una ruta de
  soporte sugerida.

## 6. Criterios de aceptación

- El escenario de demo reproduce el caso fallido o expirado que se haya acordado
  y muestra su código de motivo.
- La interfaz indica al pagador si debe reintentar o volver y muestra la ruta de
  soporte sugerida.
- Se registra la acción de soporte, la referencia del pago y el estado de
  resolución.
- Una transferencia ya ejecutada no se presenta como fallida ni como reversada
  automáticamente.
- Los mensajes no exponen datos sensibles y distinguen claramente un fallo de
  una transferencia ya ejecutada.

## 7. Plan de validación

- **Pruebas unitarias:** clasificación del caso simulado y registro de la
  referencia, acción y estado de resolución.
- **Pruebas funcionales:** recorrer el caso elegido; comprobar la orientación
  visible y el registro de soporte.
- **Seguridad:** comprobar que los mensajes no exponen datos sensibles, que se
  distingue un fallo de una transferencia ejecutada y que esta última no se
  muestra como reversada automáticamente.
- **Evidencia requerida:** salida de pruebas y pasos o capturas del escenario,
  incluida la ruta de soporte.

## 8. Tareas sugeridas por rol

- **Chapter/PO:** elegir el caso de demo; acordar la acción siguiente; definir
  qué situaciones se derivan a investigación o disputa.
- **Tech Lead:** documentar el flujo de soporte acordado; precisar los estados y
  motivos que estén definidos; mantener los reversos reales fuera del alcance.
- **Backend:** simular fallo o expiración con código de motivo; registrar la
  acción de soporte; guardar referencia y estado de resolución.
- **Frontend:** mostrar si corresponde reintentar o volver; ofrecer la vista
  mínima de soporte; presentar la ruta sugerida.
- **QA:** comprobar el caso acordado; comprobar orientación y registro; verificar
  que un pago ejecutado no se muestre como fallido o reversado automáticamente.
- **Cyber:** revisar el tratamiento del escenario disputado y los mensajes para
  evitar exposición de datos sensibles; comprobar que un pago ejecutado se
  distingue de un fallo y que la demo no ofrece ni ejecuta reversos reales.

## 9. Preguntas abiertas

- ¿Qué caso fallido o expirado se elegirá para la demo y cuál será la acción
  siguiente?
- ¿Qué situaciones se derivarán a investigación o disputa?
- ¿Qué categorías de disputa y etiquetas de estado se utilizarán?
