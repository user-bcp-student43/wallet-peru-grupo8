# Historia 1: Registro y activación

## 1. Summary

Como usuario que realiza transferencias de bajo monto, quiero completar un
onboarding guiado y saber cuál es el siguiente paso, para activar mi wallet de
demo y empezar a pagar.

**Resultado esperado:** onboarding reproducible que active una wallet de demo.
Fuente: [Hallazgos.md](./Hallazgos.md), Sprint 1, Historia 1.

## 2. Scope

- **Dentro:** mostrar pasos y paso actual; validar campos obligatorios; aceptar
  el registro de demo, persistir el estado y activar la wallet al completarlo.
- **Fuera:** KYC productivo y cualquier flujo no descrito para la demo.

## 3. Supuestos

- Se usan datos ficticios y el proveedor de pagos es simulado, según el alcance
  de la demo.
- Los campos del registro aún deben acordarse; no se presuponen campos concretos.

## 4. Decisiones técnicas por tomar

- Acordar los campos ficticios del registro.
- Documentar los campos y que no representan un flujo KYC productivo.
- Definir las validaciones específicas de cada campo obligatorio.

## 5. Riesgos y mitigaciones

- **Riesgo:** datos incompletos o inválidos permiten avanzar o activar la wallet.
  **Mitigación:** bloquear el avance y explicar cómo corregir el campo.
- **Riesgo:** confundir el onboarding de demo con KYC productivo.
  **Mitigación:** documentar explícitamente el límite y el carácter ficticio
  de los campos.

## 6. Criterios de aceptación

- Se muestran los pasos del onboarding y se identifica el paso actual.
- Un campo obligatorio ausente o inválido bloquea el avance y muestra cómo
  corregirlo.
- Un registro válido persiste su estado y activa la wallet de demo al completarse.
- La documentación enumera los campos acordados y declara que no constituyen
  KYC productivo.
- El flujo utiliza datos ficticios y no expone información sensible.

## 7. Plan de validación

- **Pruebas unitarias:** validación de campos obligatorios y transición de
  registro completado a wallet activa.
- **Pruebas funcionales:** completar un registro válido y otro incompleto o
  inválido; verificar el paso indicado y el mensaje de corrección.
- **Seguridad:** comprobar que el flujo y su documentación no se presentan como
  KYC productivo; verificar el uso de datos ficticios y que no se exponga
  información sensible.
- **Evidencia requerida:** salida de pruebas y documentación de campos y
  supuestos actualizada.

## 8. Tareas sugeridas por rol

- **Chapter/PO:** acordar los campos ficticios; confirmar el alcance de demo;
  revisar el resultado frente a los criterios.
- **Tech Lead:** documentar el límite no-KYC; definir el estado de registro
  necesario para activar la wallet; registrar decisiones pendientes.
- **Backend:** aceptar el registro de demo; persistir su estado; activar la wallet
  al completarlo correctamente.
- **Frontend:** mostrar pasos y paso actual; impedir avance con campos ausentes
  o inválidos; indicar cómo corregirlos.
- **QA:** probar registro válido; probar datos incompletos; probar datos inválidos
  y confirmar que no se activa la wallet.
- **Cyber:** revisar el uso de datos ficticios; verificar que el flujo no se
  describe como KYC productivo y que no exponga información sensible.

## 9. Preguntas abiertas

- ¿Qué campos ficticios se solicitarán y cuáles serán obligatorios?
- ¿Qué reglas determinan si cada campo es válido?
