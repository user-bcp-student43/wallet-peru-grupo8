# Datos de prueba

Los fixtures de onboarding deben ser completamente sintéticos. No copiar ni transformar datos de clientes, documentos, nombres, apellidos, correos, OTP o PIN reales.

## Reglas

- Usar únicamente los campos mínimos requeridos por el escenario y valores ficticios reservados para pruebas.
- Incluir casos positivos y negativos (coincidencia y no coincidencia de documento/correo) sin que los valores puedan atribuirse a personas reales.
- No incluir OTP ni PIN predecibles como datos persistidos; generarlos durante la prueba y mantenerlos fuera de logs.
- No incluir secretos, credenciales ni tokens en fixtures versionados.
- Antes de guardar evidencia, revisar que capturas, salidas de pruebas y archivos generados no expongan datos personales o credenciales.
- El backend debe cargar los fixtures de demo de forma reproducible; la configuración local recomendada de H2 en memoria debe iniciar limpia en cada ejecución.

Si no se puede demostrar que un dato es sintético, no se debe agregar al repositorio.
