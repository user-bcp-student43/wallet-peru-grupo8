# Decisiones, supuestos y limitaciones

## Decisiones de la demo

| Tema | Decisión base para iniciar | Estado |
|---|---|---|
| Frontend / backend | React + TypeScript + Vite / Java + Quarkus | Acordado |
| Base local | H2 en memoria con fixtures sintéticos cargados al iniciar; reiniciar limpia el estado de demo | Recomendado para aprobación del equipo |
| Correo de prueba | Mailpit local como buzón de captura SMTP; no envía correo externo | Recomendado; requiere Docker |
| Revisión HITL | Vista de revisor dentro de la app; API protegida por credencial local de entorno y separada de la sesión de usuario | Recomendado para demo, no apto para producción |
| Actualización del usuario | Consultar el estado de solicitud mediante polling de API cada 3 segundos y detener al llegar a estado terminal | Recomendado |
| OTP | 5 minutos de vigencia, 5 intentos, espera de 60 segundos y máximo 3 envíos por solicitud | Parámetros de demo propuestos |
| Documento | DNI como único tipo de documento soportado inicialmente | Propuesto |
| PIN | Cuatro dígitos numéricos; almacenar solo mediante mecanismo seguro disponible en Quarkus, nunca en claro | Requisito |
| Saldo inicial | S/ 100.00 PEN, representado como 10000 céntimos y acreditado una sola vez | Requisito de demo |
| Trazabilidad | Eventos por ID aleatorio/opaco de solicitud, evento/estado, actor seudónimo y fecha/hora; sin datos personales identificables en claro ni cuerpos HTTP. Omitirlos por defecto; si un diagnóstico los necesita, ofuscar antes de emitir. | Requisito |

El equipo puede cambiar los valores propuestos antes de implementar. Una vez aceptados, actualizar esta tabla y los documentos relacionados en el mismo cambio.

## Supuestos de demo

- Personas, documentos, nombres, apellidos y correos son datos ficticios; no se cargan datos de clientes reales.
- H2 en memoria es suficiente para que una demo local sea repetible desde cero; no se necesita conservar datos tras reiniciar.
- Mailpit se limita a capturar correo local; el OTP no se devuelve al navegador ni se escribe en logs.
- La credencial de revisor se configura localmente fuera de Git y no constituye autenticación de producción.
- Los datos personales operativos se mantienen solo donde el flujo los requiere y con acceso restringido; auditoría/analítica usa referencias opacas y nunca almacena DNI, nombre, apellido, correo, OTP o PIN.
- No usar hashes simples de DNI/correo como identificadores de trazabilidad; pueden ser adivinables. Usar IDs aleatorios no derivados de datos personales.
- La demo puede verificar que se emiten eventos de inicio, avance y cierre sin PII; no puede probar por sí misma objetivos de adquisición o cohortes reales.

## Limitaciones de alcance

- No hay consulta a padrón, KYC, correo externo, fondos reales ni registro oficial ante una entidad.
- No se implementan pagos reales; se puede mostrar un punto de entrada visual a pagos de bajo monto.
- La historia oficial fija objetivos posteriores al lanzamiento: bajar la mediana de onboarding de 8 a 3 minutos en el trimestre, seguir MAU de 1,000–2,000 y CAC de PEN 10 durante meses 1–3. No declarar estos resultados logrados con fixtures o pruebas locales; requieren cohortes y gasto reales.
- El mensaje de rechazo es deliberadamente genérico y puede mencionar evaluación aun cuando la decisión interna haya sido rechazo.
- La revisión con credencial local y almacenamiento H2 en memoria solo sirven para una demostración local.

## Preguntas abiertas antes de la demo

- ¿El equipo aprueba H2 en memoria, Mailpit y la vista de revisor con credencial local?
- ¿Está disponible Docker en el entorno de demostración para ejecutar Mailpit?
- ¿Se confirman los límites OTP propuestos?
- ¿Quién opera la revisión HITL durante la presentación y quién guarda la credencial local?
