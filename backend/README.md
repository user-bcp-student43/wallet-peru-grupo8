# Backend

Código fuente y pruebas del backend.

## Estructura

- `src/main/`: código de la aplicación.
- `src/test/`: pruebas del backend.
- `.env.example`: plantilla de variables de entorno.

## Tecnología

- Java + Quarkus.
- Para la demo se recomienda H2 en memoria con fixtures sintéticos; los repositorios/DAO de Quarkus aíslan la persistencia. El estado se reinicia con la aplicación.
- Mailpit es el buzón local recomendado para capturar OTP; requiere Docker.

## Privacidad de trazas

No registrar cuerpos HTTP ni DNI, nombres, apellidos, correo, OTP o PIN en claro. La auditoría y analítica usan IDs aleatorios/opacos, eventos permitidos, estado, actor seudónimo y timestamp. No usar hashes simples de datos personales como correladores. Ofuscar datos personales antes de cualquier salida diagnóstica que requiera mostrarlos. Consultar el [contrato API](../docs/ENDPOINTS.md) y las [pruebas](../docs/TESTING.md).

Los comandos de ejecución se documentarán cuando se configure el proyecto.
