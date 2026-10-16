# Plan de implementación — demo Día 5

> **Estado:** el frontend nuevo y la API backend Quarkus están implementados en parte y verificados con sus suites automatizadas. La integración real con Mailpit/Podman y el conjunto completo de pruebas de aceptación siguen pendientes. Podman, H2 en memoria y Mailpit local están acordados. El OTP vence a los cinco minutos, admite tres intentos y no se reenvía; OTP/PIN se protegen con HMAC-SHA-256 con sal aleatoria y clave externa. Consultar [decisiones](./decisions-assumptions-limitations.md).

## Objetivo y alcance elegido

Implementar y demostrar **Registro y activación** sin HITL: datos → OTP simulado → PIN → wallet demo S/ 100.00 → pantalla inicial. La guía del Día 5 pide escoger alcance, convertir criterios en pruebas, usar datos ficticios e integraciones simuladas y explicar qué funciona y qué queda pendiente. Esta entrega no pretende implementar las seis historias ni un producto financiero productivo.

El PIN de cuatro dígitos y saldo inicial ficticio son extensiones del alcance de equipo; no se presentan como criterios originales de la historia. El nuevo alcance incluye activar la wallet y acreditar el saldo inicial una sola vez de forma idempotente, pero excluye procesar pagos. Ver [alcance](./scope.md), [historias](./user-stories-and-acceptance.md) y [decisiones](./decisions-assumptions-limitations.md).

## Sprint 1 — base ejecutable y contrato

| Tarea | Responsable | Entregable verificable |
|---|---|---|
| Adaptar el frontend React + TypeScript + Vite existente al nuevo onboarding y definir navegación/estado de pasos | Frontend | Flujo nuevo ejecutable, formularios con validación y progreso visible; sin confundirlo con la demo local anterior. |
| Crear app Java + Quarkus y configuración local con Podman | Backend | Servicio ejecutable con health check y pruebas mínimas. |
| Acordar el contrato entre cliente y servicio | Tech Lead + Backend + Frontend | [ENDPOINTS.md](./ENDPOINTS.md) implementable y contratos DTO alineados. |
| Configurar persistencia local con fixtures sintéticos y repositorios | Backend | Lookup de DNI y pasaporte, nombre/apellido/correo sintéticos; carga reproducible al iniciar. |
| Establecer logging/auditoría sin PII | Backend + Cyber | Evento correlacionado por ID opaco; comprobación que no captura request bodies. |
| Preparar matriz automatizable y criterios de demo | QA | [TESTING.md](./TESTING.md) con casos de onboarding y baseline inicial. |

**Criterio de cierre:** se inicia frontend/backend, se crea solicitud con documento sintético y se emite OTP; no hay PII en trazas.

## Sprint 2 — recorrido y evidencia

| Tarea | Responsable | Entregable verificable |
|---|---|---|
| Implementar formulario para DNI/pasaporte e inicio de solicitud | Frontend | Pantalla 1 y transición verificable al OTP. |
| Implementar OTP y buzón simulado con tres intentos | Backend | OTP se emite al iniciar la solicitud y se bloquea tras tres intentos fallidos. |
| Implementar pantalla OTP y PIN solo numérico de cuatro dígitos | Frontend | Pantallas 2 y 3, bloqueo del avance inválido. |
| Completar cliente/wallet/crédito en una transacción idempotente | Backend | Una wallet por persona y un crédito de 10000 céntimos PEN. |
| Mostrar nombre/apellido sintéticos, saldo y entrada visual a pagos | Frontend | Home con datos devueltos por backend; pago real fuera del alcance. |
| Emitir eventos de inicio, pasos completados y cierre sin PII | Backend | Eventos con ID opaco y timestamps; validación en TC-12. |
| Ejecutar matriz, corregir fallas y registrar cobertura/limitaciones | QA + equipo | Resultados de pruebas, capturas seguras y [guion de demo](./demo-script.md). |
| Documentar instalación, ejecución local y decisiones finales | Equipo | README y READMEs de backend/frontend con comandos reales verificados. |

**Criterio de cierre:** recorrido reproducible; pruebas pasan; no hay PII en trazabilidad; el saldo no se duplica; se explican límites de métricas de lanzamiento.

## Orden sugerido para iniciar hoy

1. Scaffold de Vite y Quarkus en sus carpetas existentes.
2. Alinear el contrato de [ENDPOINTS.md](./ENDPOINTS.md).
3. Implementar primero la máquina de estados del backend con fixtures.
4. Conectar formulario y consulta de estado en React.
5. Añadir buzón simulado/OTP, PIN y activación transaccional.
6. Completar [TESTING.md](./TESTING.md), README y recorrido de demo.

## Fuera de esta demo

Pagos/transferencias reales, registro/KYC con fuentes oficiales, correo real, recuperación de cuenta, seguridad productiva, métricas de cohortes de lanzamiento y reporte real de MAU/CAC. Se puede mostrar el punto de entrada a pago, sin implementar el pago.
