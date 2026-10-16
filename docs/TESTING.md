# Pruebas y evidencia de demo

## Objetivo

Verificar el alcance seleccionado de la hackatón: onboarding guiado con HITL, OTP simulado, PIN, activación de wallet y privacidad de datos. Todos los datos deben ser ficticios.

## Matriz funcional

| ID | Escenario | Resultado esperado |
|---|---|---|
| TC-01 | Enviar campos vacíos o con formato inválido | Se bloquea el avance y se muestra corrección accionable; no se crea solicitud. |
| TC-02 | Enviar fixture sintético válido | Se crea solicitud `PENDING_REVIEW`; no se envía OTP ni se crea wallet. |
| TC-03 | Consultar solicitud antes de decisión | El usuario ve el estado de espera, sin datos de coincidencia de identidad. |
| TC-04 | Revisor no autorizado intenta listar/decidir | Respuesta 401/403; estado sin cambios. |
| TC-05 | Revisor autorizado aprueba | Una sola decisión auditada; OTP emitido por el buzón simulado y estado `OTP_PENDING`. |
| TC-06 | Revisor rechaza | Sin OTP ni wallet; pantalla 1 muestra exactamente el mensaje de rechazo acordado. |
| TC-07 | Decidir otra vez solicitud ya resuelta | Respuesta 409; no se altera decisión ni se duplica evento de resultado. |
| TC-08 | OTP correcto, incorrecto, vencido o reutilizado | Solo el válido no vencido habilita el paso PIN; uso único y límites aplicados. |
| TC-09 | PIN vacío, no numérico o longitud distinta de 4 | No se completa el registro y el backend no activa la wallet. |
| TC-10 | Completar onboarding y reintentar finalización | Cuenta/wallet se activan una vez; saldo final es 10000 céntimos PEN, no 20000. |
| TC-11 | Cargar bienvenida | Nombre, apellido y S/ 100.00 se muestran desde la respuesta del backend. |
| TC-12 | Revisar logs, auditoría, métricas y trazas | No hay DNI, nombre, apellido, correo, OTP o PIN en claro; la decisión puede rastrearse por ID aleatorio/opaco, actor seudónimo, estado y fecha/hora. |
| TC-13 | Revisar eventos del onboarding | Se registran inicio, finalización de paso y cierre con ID opaco y marcas de tiempo, sin PII. |

## Pruebas automatizadas requeridas

- **Backend unitarias:** validación de entrada, lookup sintético y comparación de correo, máquina de estados, permisos de revisor, OTP, límites, protección/hash de credenciales, idempotencia y saldo.
- **Backend integración:** endpoints de `ENDPOINTS.md`, persistencia H2, transacciones y adaptador de correo simulado.
- **Frontend:** validación de campos, progreso/paso actual, mensajes para pendiente/rechazo, OTP y PIN numéricos de máximo 4 caracteres y pantalla de bienvenida.
- **E2E/manual reproducible:** camino aprobado y rechazado siguiendo [demo-script.md](./demo-script.md).
- **Privacidad:** enviar entradas ficticias distintivas y comprobar que no aparecen en logs, auditoría, errores, métricas, trazas HTTP ni capturas de evidencia. Revisar access logs y errores de excepción. Verificar que los IDs de correlación sean aleatorios, no hashes simples de DNI/correo, y que cualquier salida diagnóstica que necesite datos personales los ofusque antes de registrarlos.

## Comandos

Los proyectos aún no están scaffolded, así que no se inventan comandos ejecutables. Al crearlos, completar aquí los comandos reales verificados, como mínimo:

```text
Backend:   <comando Maven/Quarkus de pruebas>
Frontend:  <comando npm de pruebas y build>
E2E/demo:  <comando o pasos reproducibles acordados>
```

La entrega no se considera lista para demo hasta que estos marcadores sean reemplazados por comandos ejecutables y sus resultados.

## Evidencias para presentar

- Salida de pruebas automatizadas con fecha/commit.
- Capturas del flujo aprobado y rechazado con fixtures ficticios; ocultar OTP, PIN y documento.
- Ejemplo de evento de auditoría redactado/ofuscado y revisión de logs sin PII.
- Pasos de arranque de frontend, backend, base de datos y buzón simulado.
- Lista de criterios cubiertos/no cubiertos y decisiones o limitaciones pendientes.

## Indicadores de lanzamiento de la historia oficial

La historia oficial menciona bajar la mediana de onboarding de 8 a 3 minutos dentro del trimestre y reportar activaciones/atribución para MAU de 1,000–2,000 y CAC PEN 10 durante meses 1–3. Esos objetivos requieren una cohorte y gasto de adquisición reales; no se declaran validados con la demo sintética. La demo puede verificar instrumentación de pasos y timestamps sin PII, pero no afirmar que alcanzó los indicadores de lanzamiento.
