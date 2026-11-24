# Propuesta de cambios al Documento maestro · Solicitudes y Catálogos separados

**Módulo:** Administración del sistema (Nexora Technologies)
**Fecha:** 17 de noviembre de 2026
**Estado:** **aprobada** por el usuario el 17 de noviembre de 2026 (los 4 cambios) y **aplicada** a la copia `docs/Documento_Maestro_Proyecto_Plan_Informe.md`.

> El usuario decidió (16-nov-2026) actualizar la sección 9 una sola vez, al terminar Catálogos, en lugar de hacerlo después de Solicitudes.

Fuentes: el repositorio `sigd-administracion` (PR #24 a #30) y el propio Documento maestro.

---

## Cambio 1 · Sección 9, lista de submódulos (actualizar)

**Texto actual:**
> Ya separados y con prueba: **Bitácora**, **Periodos**, **Inicio** y **Formulario** (reglas de guardado de usuarios, catálogos y solicitudes). Pendientes: Solicitudes, Catálogos y Usuarios.

**Texto propuesto:**
> Ya separados y con prueba: **Bitácora**, **Periodos**, **Inicio**, **Formulario** (despacha el guardado según la pantalla y contiene las reglas de usuarios), **Solicitudes** y **Catálogos** (cada uno con su pantalla, diálogos, reglas y guardado). Pendiente: Usuarios.

**Motivo:** Solicitudes (PR #24–#26) y Catálogos (PR #28–#30) ya están separados. Su guardado se mudó de `formulario/` a sus módulos, así que la descripción de Formulario cambia.

---

## Cambio 2 · Sección 9, reorganización interna (agregar)

**Texto propuesto (después de la Etapa C):**
> - Solicitudes: la pantalla, sus diálogos y sus reglas quedaron en su propio submódulo; la aplicación de una solicitud pasó de 2 capas a una sola función.
> - Catálogos: la pantalla, su diálogo, su historial de versiones y su guardado quedaron en su propio submódulo; el diálogo pasó de 2 capas a una sola función. Las migraciones de datos al arrancar siguen en el núcleo del módulo.

**Motivo:** registrar los dos pasos terminados después de la Etapa C.

---

## Cambio 3 · Sección 9, pruebas automáticas (actualizar)

**Texto actual:**
> 9 pruebas que se corren antes de cada cambio. Comparan capturas de pantalla de las 6 vistas, un flujo de escritura completo, Bitácora, Periodos, Inicio y unos 60 casos de reglas del formulario (cada aviso y cada efecto en la base).

**Texto propuesto:**
> 12 pruebas que se corren antes de cada cambio. Comparan capturas de pantalla de las 6 vistas, un flujo de escritura completo, Bitácora, Periodos, Inicio, Solicitudes, Catálogos, unos 60 casos de reglas del formulario (cada aviso y cada efecto en la base) y las fechas de calendario de noche.

**Motivo:** se agregaron las pruebas `fechas-hora-local` (PR #21), `solicitudes` (PR #24) y `catalogos` (PR #28).

---

## Cambio 4 · Sección 8, pendientes 12–14 (agregar)

**Texto propuesto:**
> 12. **Búsqueda en Solicitudes.** Buscar «Rectoría» también encuentra las solicitudes de «Vicerrectoría», porque la búsqueda compara pedazos de texto. Decidir si debe distinguir ambas autoridades.
> 13. **Historial de relación en Catálogos.** El diálogo de campus y de categorías docentes muestra «Historial de relación académica · 0 movimientos», aunque esos tipos no se relacionan con otro catálogo. Decidir si se oculta en esos tipos.
> 14. **Buscador global.** El prototipo tiene el código de un buscador rápido, pero ningún control de la interfaz lo abre. Confirmar si se retira, conforme al acuerdo «sin buscador global».

**Motivo:** son comportamientos que aparecieron al escribir las pruebas de Solicitudes y Catálogos. Quedaron registrados tal como funcionan hoy. No son errores de datos, sino decisiones de interfaz para tomar con el equipo.

---

| Cambio | Sección | Tipo | Decisión |
|---|---|---|---|
| 1 | 9 · submódulos | Actualizar | ☑ Aprobado (17-nov-2026) |
| 2 | 9 · reorganización interna | Agregar | ☑ Aprobado (17-nov-2026) |
| 3 | 9 · pruebas automáticas | Actualizar | ☑ Aprobado (17-nov-2026) |
| 4 | 8 · pendientes 12–14 | Agregar | ☑ Aprobado (17-nov-2026) |
