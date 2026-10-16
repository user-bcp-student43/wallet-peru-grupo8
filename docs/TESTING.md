# Pruebas y evidencia

## Estado

- **Frontend:** nuevo flujo y cliente API implementados; 8 pruebas automatizadas pasan, además de lint y build.
- **Backend:** servicio Quarkus ejecutable; 14 pruebas REST pasan con H2 en memoria y mailer simulado.
- **Integración local:** recorridos manuales completos con DNI y pasaporte contra Quarkus, H2 y Mailpit en Podman; ambos mostraron los datos del backend y S/ 100.00. El backend devolvió health `UP`; un reinicio eliminó la solicitud H2 y dejó el servicio saludable.
- **Aceptación:** se documenta abajo qué casos pasan y la limitación de privacidad pendiente. El flujo no incluye revisión humana; se aceptan DNI y pasaporte y el OTP permite tres intentos.

El alcance nuevo excluye procesar pagos e incluye activar la wallet y acreditar el saldo inicial ficticio de S/ 100.00 PEN una sola vez (idempotentemente). No usar la transferencia local de la versión anterior como evidencia de una integración ni como aceptación del nuevo alcance. Ver [decisiones](./decisions-assumptions-limitations.md).

## Matriz de validación prevista para el nuevo onboarding

| ID | Escenario | Resultado esperado una vez implementado |
|---|---|---|
| TC-01 | Enviar campos vacíos o con formato inválido | Se bloquea el avance con una corrección accionable; no se crea solicitud. |
| TC-02 | Enviar datos sintéticos con DNI o pasaporte | Se crea la solicitud y se emite OTP al buzón simulado; no se crea wallet. |
| TC-03 | Consultar solicitud antes de verificar OTP | Se muestra el paso OTP, sin revelar datos de coincidencia de identidad. |
| TC-04 | Caso sin coincidencia | Inicio y verificación no revelan el lookup; al completar se devuelve un error genérico sin crear cliente ni wallet. Se registra como riesgo que el resultado permita inferir indirectamente la coincidencia. |
| TC-05 | Enviar OTP correcto | El estado permite continuar al paso PIN. |
| TC-06 | Enviar OTP incorrecto tres veces | Se bloquea la verificación de ese código y se muestra un mensaje de intentos agotados. |
| TC-07 | Enviar OTP vencido o reutilizar un OTP ya validado | El OTP vence a los cinco minutos; vencido o consumido no permite avanzar ni completar el flujo. |
| TC-08 | PIN vacío, no numérico o longitud distinta de 4 | No se completa el registro ni se activa la wallet. |
| TC-09 | Completar onboarding y reintentar finalización | La cuenta, wallet y crédito inicial se crean una sola vez; saldo final `10000` céntimos PEN, no `20000`. |
| TC-10 | Cargar bienvenida | Nombre, apellido y saldo se muestran desde la respuesta del backend. |
| TC-11 | Revisar logs, auditoría, métricas, trazas y almacenamiento de credenciales | No hay DNI, nombre, apellido, correo, OTP o PIN en claro; OTP/PIN solo se conservan como HMAC-SHA-256 con sal aleatoria y clave externa; la solicitud se rastrea por ID opaco y estado. |
| TC-12 | Revisar eventos del onboarding | Se registran inicio, finalización de paso y cierre con ID opaco y marcas de tiempo, sin PII. |

## Validaciones del frontend existente

Desde `frontend/`, los comandos disponibles en `package.json` son:

```bash
npm install
npm run dev
npm run lint
npm run build
```

`npm run dev` inicia la app local de la versión anterior; `npm run lint` y `npm run build` verifican lint y build. No existe un script `npm test` ni una suite de pruebas frontend configurada en el repositorio. Estos comandos no validan el nuevo onboarding ni un backend.

## Ejecuciones y resultados reales (2026-10-16)

| ID | Resultado | Evidencia |
|---|---|---|
| TC-01 | Pasó | Pruebas frontend (`npm test`) cubren campos requeridos/formato; prueba REST de validación no devuelve los valores enviados. |
| TC-02 | Pasó | Prueba REST de fixtures DNI/pasaporte y recorridos manuales con ambos documentos; Mailpit local recibió los OTP sintéticos. |
| TC-03 | Pasó | Prueba REST de estado pendiente y consulta protegida; ambas sesiones integradas avanzaron al paso OTP. |
| TC-04 | Pasó | Prueba REST confirma inicio/verificación indistinguibles, error genérico al completar y ausencia de cliente/wallet. |
| TC-05 | Pasó | Verificación REST OTP y ambos recorridos integrados avanzaron a creación del PIN. |
| TC-06 | Pasó | Prueba REST comprueba dos errores, bloqueo en el tercer intento y bloqueo posterior. |
| TC-07 | Pasó | Pruebas REST de OTP expirado y OTP ya consumido; ambos rechazos son `INVALID_OTP`. |
| TC-08 | Pasó | Prueba REST rechaza PIN vacío, no numérico, corto y largo; no crea cliente ni wallet. |
| TC-09 | Pasó | Prueba REST confirma un crédito de `10000` céntimos en el reintento y rollback de cliente/wallet ante fallo de persistencia. |
| TC-10 | Pasó | Pruebas backend y recorridos browser muestran nombres sintéticos y saldo API `S/ 100.00 PEN`. |
| TC-11 | Parcial | Backend verifica hash/sal de OTP, eventos sin marcadores y acceso HTTP sin access log; no aparecieron marcadores PII/OTP/PIN/token en la salida de Maven. La aceptación de privacidad de Mailpit necesita aclaración: el buzón debe contener destinatario sintético y OTP en claro para que la demo pueda verificarse. |
| TC-12 | Pasó | Prueba REST confirma los cuatro eventos requeridos con ID opaco y timestamp, sin valores sintéticos personales o credenciales. |

Comandos automatizados ejecutados desde cada carpeta:

```powershell
# backend/
.\mvnw.cmd test

# frontend/
npm test
npm run lint
npm run build
```

Resultados: backend **14/14** pruebas; frontend **8/8** pruebas; lint y build sin errores. Prueba manual integrada: iniciar Mailpit con el comando de [backend/README.md](../backend/README.md), iniciar Quarkus en `8188` con `FRONTEND_ORIGIN=http://127.0.0.1:5174`, y Vite con `VITE_API_BASE_URL=http://127.0.0.1:8188/api/v1`; los dos recorridos terminaron en bienvenida. Verificaciones adicionales: CORS preflight `200`, health `UP`, estado de una solicitud previa al reinicio `404` después del reinicio H2. No se envió correo externo ni se usaron datos reales.

**Bloqueo de aceptación:** `tasks.md` 5.2 pide ausencia de OTP/PII en el buzón, mientras los requisitos de entrega OTP requieren que Mailpit guarde el correo sintético y el OTP legible para completar el flujo. No se declara TC-11/5.2 completo hasta aclarar si la comprobación se refiere a logs/trazas y no al contenido de entrega necesario del buzón.

## Pendientes de verificación

- Aclarar el alcance de privacidad del OTP esperado dentro del buzón Mailpit; mantenerlo solo con datos sintéticos y no exportar mensajes/capturas sin redactar.
- Completar la matriz de privacidad extremo a extremo una vez resuelta esa interpretación.
- Ejecutar el [guion de demo](./demo-script.md) desde un entorno limpio y registrar sus pasos de reintento.

## Evidencias para presentar

- Salida de comandos y pruebas realmente ejecutados con fecha/commit.
- Resultados separados entre pruebas automatizadas, integración local y límites aún no verificados.
- Cuando se implemente: capturas con fixtures ficticios, OTP/PIN/documento ocultos, evento de auditoría redactado y revisión de logs sin PII.
- Lista de criterios cubiertos/no cubiertos y decisiones pendientes. No presentar casos previstos como pruebas pasadas. La protección acordada es para demo local y no constituye una revisión de seguridad productiva.

## Indicadores de lanzamiento

La historia oficial menciona bajar la mediana de onboarding de 8 a 3 minutos dentro del trimestre y reportar activaciones/atribución para MAU de 1,000–2,000 y CAC PEN 10 durante meses 1–3. Esos objetivos requieren una cohorte y gasto de adquisición reales; no se declaran validados con una demo sintética. La instrumentación sin PII puede verificarse localmente, pero no demuestra dichos indicadores.
