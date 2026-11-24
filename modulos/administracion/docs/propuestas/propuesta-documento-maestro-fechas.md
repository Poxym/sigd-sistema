# Propuesta de cambio al Documento maestro · error de fechas corregido

**Módulo:** Administración del sistema (Nexora Technologies)
**Fecha:** 16 de noviembre de 2026
**Estado:** **aprobada** por el usuario el 16 de noviembre de 2026 y **aplicada** a la copia `docs/Documento_Maestro_Proyecto_Plan_Informe.md`.

---

## Cambio 1 · Sección 10, fila #4 (actualizar el estado)

**Error:** «hoy» se calculaba en hora universal (UTC) en algunas validaciones. Después de las 18:00 h (hora del centro de México), la fecha del día siguiente se aceptaba como si no fuera futura.

**Columna «Estado», texto actual:**
> **Abierto.** Se propone corregirlo en una rama `fix/` aparte, con su prueba

**Texto propuesto:**
> **Corregido** (PR #21 prueba, PR #22 corrección). Los valores por defecto y las validaciones usan la hora local

**Motivo:** el error se corrigió.
- **PR #21:** prueba `tests/fechas-hora-local.spec.mjs`, con el reloj a las 20:00. Registró el error: los campos de fecha abrían con la fecha de mañana, y la fecha de mañana se aceptaba.
- **PR #22:** las 12 fechas de calendario pasaron a hora local. En la prueba, los 4 campos ahora abren con la fecha de hoy, los 4 casos con fecha de mañana se rechazan con su aviso y los 4 casos de control no cambiaron. La prueba `reglas-formulario` quedó idéntica.

---

| Cambio | Sección | Tipo | Decisión |
|---|---|---|---|
| 1 | 10 · fila #4 | Actualizar | ☑ Aprobado (16-nov-2026) |
