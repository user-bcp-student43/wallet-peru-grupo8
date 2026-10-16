# Datos de prueba

Los fixtures previstos para el nuevo onboarding deben ser completamente sintéticos. El onboarding y la carga de fixtures aún no están implementados. No copiar ni transformar datos de clientes, documentos, nombres, apellidos, correos, OTP o PIN reales.

## Reglas

- Usar únicamente los campos mínimos requeridos por el escenario y valores ficticios reservados para pruebas.
- Incluir casos sintéticos positivos y negativos de documento/correo sin que los valores puedan atribuirse a personas reales. El tratamiento funcional de DNI inexistente y correo no coincidente no está decidido; conservarlos como casos identificados, pero no fijar un resultado esperado hasta resolverlo en [decisiones](../../docs/decisions-assumptions-limitations.md).
- No incluir OTP ni PIN predecibles como datos persistidos; generarlos durante la prueba y mantenerlos fuera de logs.
- No incluir secretos, credenciales ni tokens en fixtures versionados.
- Antes de guardar evidencia, revisar que capturas, salidas de pruebas y archivos generados no expongan datos personales o credenciales.
- La carga reproducible de fixtures en backend queda pendiente de implementación. H2 en memoria es una opción pendiente de decisión, no una configuración aprobada. Ver [decisiones](../../docs/decisions-assumptions-limitations.md).

Si no se puede demostrar que un dato es sintético, no se debe agregar al repositorio.
