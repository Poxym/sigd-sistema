# Propuesta de cambio al Documento maestro · Fase 3 de la arquitectura

**Módulo:** Administración del sistema (Nexora Technologies)
**Fecha:** 21 de noviembre de 2026
**Estado:** **aprobada** por el usuario el 21 de noviembre de 2026 (los 5 cambios) y **aplicada** a la copia `docs/Documento_Maestro_Proyecto_Plan_Informe.md`.

**Por qué:** la Fase 3 de ADR-006 terminó (PR #87 a #90):
- el repositorio ahora también **modifica** los registros, no solo los lee y agrega;
- nadie fuera de él recibe la base completa.

La sección 9 no lo dice. Además tiene dos datos desactualizados:
- dice que `core/` tiene el «almacén (guardar y registrar en bitácora)», que desde la Fase 1 vive en `repositorio/`;
- dice «25 pruebas», y hoy son 31.

Solo cambia la sección 9; nada de la interfaz ni de los requisitos.

Cada cambio se aprueba por separado (tabla al final).

---

## Cambio 1 · Sección 9, viñeta `core/`

**Texto actual:**
> `core/`: utilidades, datos de demostración y almacén (guardar y registrar en bitácora).

**Texto propuesto:**
> `core/`: utilidades y datos de demostración. (Guardar y registrar en bitácora pasó a `modules/admin/repositorio/`.)

---

## Cambio 2 · Sección 9, viñeta `modules/admin/repositorio/`

**Texto actual (inicio):**
> **único lugar que lee y guarda los datos** (en el prototipo, `localStorage`).

**Texto propuesto (inicio):**
> **único lugar que lee, agrega, modifica y guarda los datos** (en el prototipo, `localStorage`). Ninguna pantalla recibe la base completa: cada cambio, incluidos los historiales, se pide al repositorio.

(El resto de la viñeta no cambia.)

---

## Cambio 3 · Sección 9, viñeta «ADR-006 (repositorio y MVC)»

**Texto actual:**
> **ADR-006 (repositorio y MVC):** Fase 0, decisión y línea base. Fase 1, capa `repositorio/`, con las migraciones de arranque. Fase 2, las seis pantallas en modelo–vista–controlador. Terminada.

**Texto propuesto:**
> **ADR-006 (repositorio y MVC):** Fase 0, decisión y línea base. Fase 1, capa `repositorio/`, con las migraciones de arranque. Fase 2, las seis pantallas en modelo–vista–controlador. Fase 3, el repositorio también modifica los registros y nadie más recibe la base completa. Terminada. Es una **decisión cerrada** del equipo: todo cambio al módulo la respeta.

---

## Cambio 4 · Sección 9, «Pruebas automáticas»

**Texto actual (inicio):**
> **Pruebas automáticas** (Playwright, `npm test`): 25 pruebas que se corren antes de cada cambio.

**Texto propuesto (inicio):**
> **Pruebas automáticas** (Playwright, `npm test`): 31 pruebas que se corren antes de cada cambio.

Y en la lista, la última viñeta:

**Texto actual:**
> la compatibilidad con datos guardados por versiones anteriores, la capa de repositorio, los accesos de Inicio y las fechas de calendario de noche.

**Texto propuesto:**
> la compatibilidad con datos guardados por versiones anteriores, la capa de repositorio (incluidos los métodos que modifican registros), los accesos de Inicio, las fechas de calendario de noche, la accesibilidad (nombres de los campos y contraste) y la separación del encabezado.

---

## Cambio 5 · Nota al final de la sección 10

**Se agrega:**
> Cambios aprobados el 21 de noviembre de 2026: Fase 3 de la arquitectura; ver `docs/propuesta-documento-maestro-fase-3.md`.

---

## Decisiones

| Cambio | Sección | Tipo | Decisión |
|---|---|---|---|
| 1 | 9 · `core/` | Corregir dato desactualizado | ☑ Aprobado (21-nov-2026) |
| 2 | 9 · `repositorio/` | Actualizar | ☑ Aprobado (21-nov-2026) |
| 3 | 9 · ADR-006 | Actualizar | ☑ Aprobado (21-nov-2026) |
| 4 | 9 · Pruebas | Actualizar | ☑ Aprobado (21-nov-2026) |
| 5 | 10 · nota final | Agregar | ☑ Aprobado (21-nov-2026) |
