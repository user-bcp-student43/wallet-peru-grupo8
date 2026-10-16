# Decisiones, supuestos y limitaciones

Este documento es la fuente central del estado de decisiones de la demo. Una propuesta no se considera aprobada hasta que el equipo la resuelva explícitamente; los documentos relacionados enlazan aquí en vez de presentar propuestas como decisiones tomadas.

## Estado actual de la implementación

| Componente | Estado |
|---|---|
| Frontend | Flujo y cliente API del nuevo onboarding implementados, con pruebas de UI y cliente. No incluye un simulador exitoso del nuevo flujo. |
| Backend | Servicio Quarkus ejecutable con H2 en memoria, fixtures sintéticos, Mailer SMTP, API REST/OpenAPI y pruebas REST. |
| Nuevo onboarding | Frontend y recorrido backend básico implementados; recorrido integrado con Mailpit real pendiente de verificar. |
| Contrato API | Implementado y publicado por Quarkus; queda verificar su alineación automatizada completa con los DTOs frontend/backend. |

El plan [wallet-demo-sprints.md](./wallet-demo-sprints.md) corresponde a la versión anterior y se conserva como referencia histórica.

## Decisiones acordadas y pendientes

| Tema | Propuesta o pregunta | Estado |
|---|---|---|
| Infraestructura de contenedores | Usar Podman para la infraestructura local de la demo. | Acordado. |
| Persistencia local | H2 en memoria con fixtures sintéticos; reiniciar limpia el estado de demo. | Acordado e implementado; reinicio/entorno Podman pendiente de validar. |
| Correo de prueba | Mailpit local en Podman, solo captura SMTP y sin envío externo. | Acordado y configurado; recorrido real contra Mailpit pendiente de validar. |
| Revisión humana | El onboarding no incluirá revisor ni decisión HITL. | Acordado; retirar este paso del flujo. |
| Actualización de estado | Polling cada 3 segundos mientras la solicitud espera; detener al verificar OTP o al fallar. | Acordado e implementado en frontend; verificado en pruebas unitarias, falta integración E2E. |
| Política OTP | OTP de cuatro dígitos con vigencia de **5 minutos**, máximo de **3 intentos** por código y sin reenvío en esta demo. | Acordado. Un código incorrecto o vencido devuelve un error seguro; al agotar intentos se bloquea ese código. |
| Tipo de documento | Admitir DNI y pasaporte. | Acordado. |
| Casos sin coincidencia | Se permite iniciar la solicitud y verificar el OTP igual que para una coincidencia. Al completar, se bloquea la activación con un error genérico que no menciona el lookup ni su resultado. | Acordado. Se acepta que comparar el resultado de finalización con una activación exitosa permite inferir indirectamente la coincidencia; es un riesgo residual de la demo. |
| Protección de credenciales | Guardar únicamente HMAC-SHA-256 de OTP y PIN con sal aleatoria por credencial y una clave secreta externa a la aplicación; comparar en tiempo constante y no registrar los valores en claro. | Acordado para la demo local; no equivale a una revisión de seguridad productiva. |

No se ofrece endpoint de reenvío OTP en esta demo.

## Alcance vigente

- El nuevo alcance incluye el onboarding sintético sin revisión humana, verificación por OTP, creación de PIN, activación de wallet y un crédito inicial ficticio de **S/ 100.00 PEN** (`10000` céntimos).
- La activación y el crédito inicial deben realizarse de forma atómica e idempotente: los reintentos no crean otra wallet ni duplican el crédito.
- El nuevo alcance excluye el procesamiento de pagos, transferencias y retiros. Una referencia visual a pagos no implica ejecutar una operación.
- Una solicitud sin coincidencia puede llegar a OTP verificado, pero no crea cliente ni wallet; la finalización devuelve un error genérico. El resultado de finalización permite inferencia indirecta del lookup y este riesgo se acepta para la demo.
- El frontend que existe hoy corresponde a la versión anterior y sí simula localmente una transferencia fija. No debe confundirse con el alcance ni con el nuevo onboarding.

## Requisitos que se mantienen

- React + TypeScript + Vite para frontend, Java + Quarkus para backend y Podman para la infraestructura local; Podman está disponible, pero el entorno Mailpit reproducible aún no se ha verificado.
- Datos sintéticos únicamente; no se consulta padrón, KYC ni sistemas oficiales.
- OTP y PIN se protegen mediante HMAC-SHA-256 con sal aleatoria por credencial y clave externa; los valores en claro no se registran ni exponen en logs.
- La trazabilidad utiliza IDs aleatorios/opacos, sin DNI, nombre, apellido, correo ni hashes simples derivados de esos datos.
- El saldo inicial es ficticio, no retirable ni dinero real.

## Supuestos y limitaciones

- Las fixtures y los datos usados en la demo deben ser completamente sintéticos.
- No hay correo externo, fondos reales, validación productiva de identidad ni registro ante una entidad.
- Los objetivos de lanzamiento —mediana de onboarding de 8 a 3 minutos, MAU de 1,000–2,000 y CAC de PEN 10 durante meses 1–3— requieren cohortes y gasto reales; no se consideran demostrados por fixtures o pruebas locales.
- La integración de extremo a extremo con Mailpit, el entorno reproducible Podman y la matriz completa de aceptación siguen pendientes.

## Preguntas abiertas adicionales

Actualizar este documento cuando el equipo resuelva una decisión y propagar el resultado a los documentos relacionados. No tratar ninguna fila marcada como pendiente o propuesta como decisión aprobada.
