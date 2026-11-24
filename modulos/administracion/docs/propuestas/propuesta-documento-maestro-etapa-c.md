# Propuesta de cambios al Documento maestro · cierre de la Etapa C

**Módulo:** Administración del sistema (Nexora Technologies)
**Fecha:** 16 de noviembre de 2026
**Estado:** **aprobada** por el usuario el 16 de noviembre de 2026 (los 5 cambios) y **aplicada** a la copia `docs/Documento_Maestro_Proyecto_Plan_Informe.md`. Cada cambio indica la sección y el texto propuesto.

> **Aclaración de nombres.** Las «Etapas A, B y C» de esta propuesta son etapas **internas** de reorganización del código del prototipo de Nexora. No son las «Etapa 1» y «Etapa 2» del proyecto (sección 2 del Documento maestro). Se propone dejarlo así de explícito para que no se confundan.

Fuentes de esta propuesta: el repositorio `sigd-administracion` (código, pruebas e historial de Pull Requests #1–#18) y el propio Documento maestro. Lo que no sale de esas fuentes se marca como **por confirmar**.

---

## Cambio 1 · Sección 2, nota de fechas (actualizar)

**Texto actual:**
> Nota: las fechas anteriores ya pasaron (hoy es 1 de noviembre de 2026). Falta confirmar en qué etapa está el equipo ahora.

**Texto propuesto:**
> Nota: las fechas anteriores ya pasaron (revisado el 16 de noviembre de 2026). Falta confirmar en qué etapa del proyecto (1 o 2) está el equipo. El prototipo del módulo de Administración sigue sin base de datos real y se está reorganizando internamente; ver la sección 9.

**Motivo:** la fecha quedó desactualizada. La etapa del proyecto sigue sin confirmarse; no se inventa.

---

## Cambio 2 · Sección 4, pantallas del prototipo (actualizar)

**Texto actual:**
> Pantallas del prototipo de Nexora: (1) usuarios y roles, (2) catálogo de rubros y secciones, campus y carreras (con categorías docentes), vigencia de cambios, (6) bitácora de auditoría y (7) periodos de captura. Las transcripciones no numeran las pantallas intermedias. **Las pantallas 6 y 7 aún no se han validado con el cliente**; el Sr. C ofreció responder por correo.

**Texto propuesto:**
> Pantallas del prototipo de Nexora (versión actual): **Inicio** (panel con indicadores y pendientes), **Solicitudes de cambio** (registro, instrucción de la autoridad, vigencia y aplicación), **Catálogos académicos** (campus, carreras, planes, materias, categorías, rubros, comisiones, parámetros, opciones de captura), **Usuarios y permisos** (con historial de roles, adscripción y carrera), **Periodos de captura** y **Bitácora de auditoría**. En las transcripciones se numeraban (1) usuarios y roles, (2) catálogos y vigencia de cambios, (6) bitácora y (7) periodos. **La bitácora y los periodos aún no se han validado con el cliente**; el Sr. C ofreció responder por correo.

**Motivo:** el prototipo ya tiene seis vistas, y la vigencia de cambios vive dentro de Solicitudes. Se conserva el pendiente de validación.

---

## Cambio 3 · Nueva sección 9: Estructura técnica del prototipo de Administración (agregar)

**Texto propuesto:**

> ## 9. Estructura técnica del prototipo de Administración
>
> - **Tecnología:** página web con módulos de JavaScript (ES) servida con Vite (`npm run dev`, http://localhost:4201). Ya no se abre con doble clic en el HTML.
> - **Datos:** sigue siendo un prototipo **sin base de datos real**. Los datos de demostración se guardan en el navegador (`localStorage`). Esto es coherente con la Etapa 1 (maqueta sin base de datos).
> - **Convivencia con los otros módulos:** el módulo se monta dentro de un *Shadow DOM*, para que sus estilos no choquen con los de los otros equipos. Apoya la regla de **interfaz homogénea** sin "Frankenstein" (sección 3).
> - **Organización del código** (`src/`):
>   - `config/`: datos de referencia (catálogos semilla, roles, permisos).
>   - `core/`: utilidades, datos de demostración y almacén (guardar y registrar en bitácora).
>   - `shared/`: piezas comunes (filtros, avisos, tablas).
>   - `shell/`: marco del SIGD (acceso, encabezado y menú).
>   - `modules/admin/`: un submódulo por pantalla o función. Ya separados y con prueba: **Bitácora**, **Periodos**, **Inicio** y **Formulario** (reglas de guardado de usuarios, catálogos y solicitudes). Pendientes: Solicitudes, Catálogos y Usuarios.
> - **Reorganización interna:**
>   - Etapa A: proyecto de módulos ES con Vite.
>   - Etapa B: separación de Bitácora, Periodos e Inicio.
>   - Etapa C: el formulario compartido, que guardaba con 9 capas de parches encadenados, quedó como un submódulo con una función por dominio.
> - **Pruebas automáticas** (Playwright, `npm test`): 9 pruebas que se corren antes de cada cambio. Comparan capturas de pantalla de las 6 vistas, un flujo de escritura completo, Bitácora, Periodos, Inicio y unos 60 casos de reglas del formulario (cada aviso y cada efecto en la base). Método de trabajo:
>   1. Se escribe una prueba del comportamiento actual.
>   2. Se comprueba que falla si se rompe una regla a propósito (prueba de sabotaje).
>   3. Solo entonces se cambia el código.

**Motivo:** el Documento maestro no describe cómo está construido el prototipo. Esta sección sirve para la Etapa 2 y para acordar los contratos de datos con los otros equipos (pendiente 7 de la sección 8).

---

## Cambio 4 · Nueva sección 10: Errores encontrados en el prototipo (agregar)

**Texto propuesto:**

> ## 10. Errores encontrados en el prototipo de Administración
>
> | # | Error | Dónde | Estado |
> |---|---|---|---|
> | 1 | Al guardar la ventana de captura se perdían el semestre y las fechas académicas | Periodos | **Corregido** (PR #9) |
> | 2 | Al editar una cuenta sin carrera (p. ej. la administración general) sin motivo, salía el aviso «Indica fecha y motivo del cambio de carrera», que no corresponde. Causa: la cuenta no tiene carrera y el formulario envía un valor vacío; se tomaban como distintos | Usuarios | **Corregido** (PR #14) |
> | 3 | La regla «El valor del parámetro debe ser numérico» nunca se alcanza desde la interfaz, porque el campo ya solo acepta números | Catálogos · parámetros | Abierto, sin impacto para el usuario |
> | 4 | **«Hoy» se calcula en hora universal (UTC) en algunas validaciones.** Después de las 18:00 h (hora del centro de México), la fecha del día siguiente se acepta como si no fuera futura. Afecta la fecha de los movimientos de usuarios y catálogos y las fechas de autorización y de ejecución de solicitudes. Otras validaciones sí usan la hora local, así que el sistema no es consistente | Usuarios, Catálogos, Solicitudes | **Abierto.** Se propone corregirlo en una rama `fix/` aparte, con su prueba |
>
> Además hay **deuda técnica** sin efecto visible: revisiones repetidas que nunca se alcanzan, guardados repetidos y helpers con nombres de versión (`v20`, `v40`…). Se registra en el `CLAUDE.md` del repositorio y se limpiará con pruebas.

**Motivo:** dejar constancia de los errores, su causa y su estado. El #4 se detectó al preparar esta propuesta: las pruebas no lo ven porque trabajan con una hora fija del mediodía.

---

## Cambio 5 · Sección 8: nuevos pendientes por aclarar (agregar)

**Texto propuesto (agregar al final de la lista):**

> 9. **Categorías docentes del prototipo.** La semilla del prototipo usa «Profesor investigador» y «Profesor», marcadas como «denominación por validar». Este documento (secciones 6 y 7) indica Asociado A/B/C y Titular A/B/C, y menciona «profesor asociado/titular» y «profesor visitante». Confirmar la lista oficial y alinear la semilla con la hoja «Datos» del Plan.
> 10. **Umbral de reprobación del 35 %.** El prototipo trae el parámetro «Umbral de reprobación para justificar». Un texto lo atribuye a «las reuniones» y otro a una «entrevista institucional». **Este documento no lo menciona.** Confirmar de qué reunión o entrevista sale, y agregarlo a la sección 6 o quitarlo.
> 11. **Administrador único y suplencia** (complementa el punto 3). El prototipo ya obliga a que exista exactamente **una** cuenta de administración general activa: no deja activar una segunda ni desactivar la única. Si se define una suplencia, hará falta una regla nueva (p. ej. un suplente temporal con fecha de fin).

**Motivo:** son diferencias entre lo que dice el documento y lo que hace el prototipo. Según las reglas del proyecto, se señalan en lugar de resolverlas por cuenta propia.

---

## Resumen de la aprobación

| Cambio | Sección | Tipo | Decisión |
|---|---|---|---|
| 1 | 2 · nota de fechas | Actualizar | ☑ Aprobado (16-nov-2026) |
| 2 | 4 · pantallas del prototipo | Actualizar | ☑ Aprobado (16-nov-2026) |
| 3 | 9 · estructura técnica | Nueva | ☑ Aprobado (16-nov-2026) |
| 4 | 10 · errores encontrados | Nueva | ☑ Aprobado (16-nov-2026) |
| 5 | 8 · pendientes 9–11 | Agregar | ☑ Aprobado (16-nov-2026) |
