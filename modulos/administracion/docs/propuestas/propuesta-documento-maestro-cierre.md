# Propuesta de cambios al Documento maestro · cierre de la modularización

**Módulo:** Administración del sistema (Nexora Technologies)
**Fecha:** 17 de noviembre de 2026
**Estado:** **aprobada** por el usuario el 17 de noviembre de 2026 (los 5 cambios) y **aplicada** a la copia `docs/Documento_Maestro_Proyecto_Plan_Informe.md`.

Fuentes: el repositorio `sigd-administracion` (PR #32 a #35) y el propio Documento maestro.

---

## Cambio 1 · Sección 9, lista de submódulos (actualizar)

**Texto actual:**
> Ya separados y con prueba: **Bitácora**, **Periodos**, **Inicio**, **Formulario** (despacha el guardado según la pantalla y contiene las reglas de usuarios), **Solicitudes** y **Catálogos** (cada uno con su pantalla, diálogos, reglas y guardado). Pendiente: Usuarios.

**Texto propuesto:**
> Ya separados y con prueba **las seis pantallas**: **Inicio**, **Solicitudes**, **Catálogos**, **Usuarios**, **Periodos** y **Bitácora**, cada una con su pantalla y, cuando los tiene, sus diálogos, reglas y guardado. **Formulario** queda solo como despachador del guardado compartido. En el núcleo del módulo (`app.js`) quedan la navegación, el marco del diálogo, el menú del perfil, los íconos y las migraciones de datos al arrancar.

**Motivo:** Usuarios se separó (PR #33 y #34). Su guardado se mudó a `usuarios/`, así que en `formulario/` solo queda el despachador.

---

## Cambio 2 · Sección 9, reorganización interna (agregar)

**Texto propuesto (después de Catálogos):**
> - Usuarios: la pantalla, su diálogo, los campos docentes, el panel de permisos por rol, la importación desde CSV y su guardado quedaron en su propio submódulo; el diálogo pasó de 2 capas a una sola función. Con esto terminó la separación por pantallas; sigue la limpieza.

---

## Cambio 3 · Sección 9, pruebas automáticas (actualizar)

**Texto actual:**
> 12 pruebas que se corren antes de cada cambio. Comparan capturas de pantalla de las 6 vistas, un flujo de escritura completo, Bitácora, Periodos, Inicio, Solicitudes, Catálogos, unos 60 casos de reglas del formulario (cada aviso y cada efecto en la base) y las fechas de calendario de noche.

**Texto propuesto:**
> 13 pruebas que se corren antes de cada cambio. Comparan capturas de pantalla de las 6 vistas, un flujo de escritura completo, cada una de las seis pantallas por separado (incluida la importación de usuarios desde CSV), unos 60 casos de reglas del formulario (cada aviso y cada efecto en la base) y las fechas de calendario de noche.

**Motivo:** se agregó la prueba `usuarios` (PR #32).

---

## Cambio 4 · Sección 10, fila #5 (agregar)

> | 5 | Al importar usuarios desde CSV, el selector de archivo no se vaciaba y aparecía un error en la consola. Volver a elegir el mismo archivo (por ejemplo, después de corregirlo) no importaba nada. Causa: el selector vive dentro del *Shadow DOM*; al terminar el aviso del evento, el navegador borra la referencia al elemento, y la importación la usaba después de esperar a leer el archivo | Usuarios · importación CSV | **Corregido** (PR #32 prueba, PR #35 corrección) |

**Motivo:** el error se encontró al escribir la prueba de Usuarios (PR #32), que lo registró tal como funcionaba, y se corrigió en una rama `fix/` aparte (PR #35).

---

## Cambio 5 · Sección 8, pendiente 15 (agregar)

> 15. **Reglas distintas para la adscripción al importar.** La importación desde CSV acepta como adscripción cualquier nombre del catálogo de institución, aunque no esté vigente. El formulario solo acepta los vigentes. Decidir si la importación debe aplicar la misma regla.

**Motivo:** es una diferencia de reglas entre dos formas de dar de alta usuarios. La prueba la registra tal como funciona hoy; no se cambia sin una decisión del equipo.

---

| Cambio | Sección | Tipo | Decisión |
|---|---|---|---|
| 1 | 9 · submódulos | Actualizar | ☑ Aprobado (17-nov-2026) |
| 2 | 9 · reorganización interna | Agregar | ☑ Aprobado (17-nov-2026) |
| 3 | 9 · pruebas automáticas | Actualizar | ☑ Aprobado (17-nov-2026) |
| 4 | 10 · fila #5 | Agregar | ☑ Aprobado (17-nov-2026) |
| 5 | 8 · pendiente 15 | Agregar | ☑ Aprobado (17-nov-2026) |
