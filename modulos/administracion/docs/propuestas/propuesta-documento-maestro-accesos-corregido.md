# Propuesta de cambio al Documento maestro · error #6 corregido («Accesos hoy»)

**Módulo:** Administración del sistema (Nexora Technologies)
**Fecha:** 19 de noviembre de 2026
**Estado:** **aprobada** por el usuario el 19 de noviembre de 2026 y **aplicada** a la copia `docs/Documento_Maestro_Proyecto_Plan_Informe.md`.

---

## Cambio 1 · Sección 10, fila #6 (actualizar el estado)

**Error:** «Accesos hoy» siempre valía 0, porque nada registraba los inicios de sesión.

**Columna «Estado», texto actual:**
> **Abierto.** Se corrige en la rama `fix/accesos-hoy`, con su prueba

**Texto propuesto:**
> **Corregido** (rama `fix/accesos-hoy`): cada inicio de sesión correcto suma 1 en un registro por cuenta y por día, en hora local

**Motivo:** el error se corrigió.
- **Prueba** `tests/accesos.spec.mjs` (commit `94e1529`): registró el error en 9 pasos (el indicador valía 0 en todos y no se guardaba nada).
- **Corrección** (commit `469f8d8`): el marco anuncia el evento `sigd:sesion-iniciada` tras un login correcto, e Inicio registra el acceso por el repositorio. En la prueba, cada login correcto suma 1, el fallido no suma, el correo cuenta como su cuenta, lo de ayer no cuenta hoy y un login a las 20:00 cuenta para el día correcto. Las demás referencias que cambiaron solo muestran el acceso guardado y el número del indicador.

---

| Cambio | Sección | Tipo | Decisión |
|---|---|---|---|
| 1 | 10 · fila #6 | Actualizar | ☑ Aprobado (19-nov-2026) |
