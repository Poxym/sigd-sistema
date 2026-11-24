# Propuesta de cambio al Documento maestro · arquitectura, limpieza y errores (noviembre 2026)

**Módulo:** Administración del sistema (Nexora Technologies)
**Fecha:** 21 de noviembre de 2026
**Estado:** **aprobada** por el usuario el 21 de noviembre de 2026 (los 7 cambios) y **aplicada** a la copia `docs/Documento_Maestro_Proyecto_Plan_Informe.md`.

**Por qué:** el Documento maestro describe el prototipo como estaba el 19 de noviembre. Desde entonces se integraron a `main` los PR #40 a #72:

- **Arquitectura (ADR-006):** capa de repositorio y las seis pantallas en MVC.
- **Errores corregidos:** uno de Catálogos y cinco de Usuarios.
- **Limpieza de la deuda técnica:** revisiones repetidas, guardados repetidos y nombres con prefijo de versión.
- **Interfaz:** se quitó el buscador global, hay una hoja de íconos compartida y los estilos quedaron separados por pantalla.

Esta propuesta solo pone el documento al día. No agrega requisitos nuevos del cliente.

Cada cambio se aprueba por separado (tabla al final).

---

## Cambio 1 · Sección 8, punto 14 (buscador global: resuelto)

**Texto actual:**
> 14. **Buscador global.** El prototipo tiene el código de un buscador rápido, pero ningún control de la interfaz lo abre. Confirmar si se retira, conforme al acuerdo «sin buscador global».

**Texto propuesto:**
> 14. **Buscador global.** ~~El prototipo tiene el código de un buscador rápido, pero ningún control de la interfaz lo abre.~~ **Resuelto el 21 de noviembre de 2026:** se retiró, conforme al acuerdo «sin buscador global». Nada se ve distinto, porque nunca se abría (PR #69).

**Motivo:** el usuario decidió quitarlo. Se conserva el punto tachado para que se vea qué se decidió.

---

## Cambio 2 · Sección 9, organización del código (repositorio, MVC, íconos y estilos)

**Texto actual** (viñeta `modules/admin/`):
> - `modules/admin/`: un submódulo por pantalla o función. Ya separados y con prueba **las seis pantallas**: **Inicio**, **Solicitudes**, **Catálogos**, **Usuarios**, **Periodos** y **Bitácora**, cada una con su pantalla y, cuando los tiene, sus diálogos, reglas y guardado. **Formulario** queda solo como despachador del guardado compartido. En el núcleo del módulo (`app.js`) quedan la navegación, el marco del diálogo, el menú del perfil, los íconos y las migraciones de datos al arrancar.

**Texto propuesto:**
> - `modules/admin/repositorio/`: **único lugar que lee y guarda los datos** (en el prototipo, `localStorage`). Tiene un repositorio por tipo de dato (usuarios, permisos, catálogos, solicitudes, periodos, accesos y bitácora) y las migraciones que corrigen, al arrancar, datos guardados por versiones anteriores. Cuando exista una base de datos real, solo cambia esta capa (decisión ADR-006, `docs/adr-006-repositorio-mvc.md`).
> - `modules/admin/`: un submódulo por pantalla. **Las seis pantallas** (**Inicio**, **Solicitudes**, **Catálogos**, **Usuarios**, **Periodos** y **Bitácora**) están separadas, con prueba y organizadas en **modelo–vista–controlador**:
>   - el **modelo** tiene las reglas de negocio y pide los datos al repositorio;
>   - la **vista** pinta la pantalla y avisa lo que hace la persona;
>   - el **controlador** recibe cada acción, consulta al modelo y elige qué mostrar.
>
>   Cada pantalla tiene también su HTML (`vista.html`) y sus estilos propios (`estilos.css`). **Formulario** queda solo como despachador del guardado compartido. En el núcleo del módulo (`app.js`) quedan la navegación, el marco del diálogo y el menú del perfil.
> - **Íconos compartidos:** una sola hoja de íconos (Tabler) para los cuatro módulos del SIGD, en `css/iconos.css`, junto a los estilos del marco. Funciona sin internet. Apoya la regla de **interfaz homogénea** (sección 3).

**Motivo:** la sección no menciona la capa de repositorio ni la organización MVC (Fases 0 a 2 del ADR-006). Además, ya no es cierto que `app.js` tenga los íconos y las migraciones: hoy están en `css/iconos.css` y en `repositorio/`.

---

## Cambio 3 · Sección 9, reorganización interna (fases del ADR-006 y limpieza)

**Texto actual** (últimas dos viñetas):
> - Catálogos: la pantalla, su diálogo, su historial de versiones y su guardado quedaron en su propio submódulo; el diálogo pasó de 2 capas a una sola función. Las migraciones de datos al arrancar siguen en el núcleo del módulo.
> - Usuarios: la pantalla, su diálogo, los campos docentes, el panel de permisos por rol, la importación desde CSV y su guardado quedaron en su propio submódulo; el diálogo pasó de 2 capas a una sola función. Con esto terminó la separación por pantallas; sigue la limpieza.

**Texto propuesto:**
> - Catálogos: la pantalla, su diálogo, su historial de versiones y su guardado quedaron en su propio submódulo; el diálogo pasó de 2 capas a una sola función.
> - Usuarios: la pantalla, su diálogo, los campos docentes, el panel de permisos por rol, la importación desde CSV y su guardado quedaron en su propio submódulo; el diálogo pasó de 2 capas a una sola función. Con esto terminó la separación por pantallas.
> - **ADR-006 (repositorio y MVC):** Fase 0, decisión y línea base. Fase 1, capa `repositorio/`, con las migraciones de arranque. Fase 2, las seis pantallas en modelo–vista–controlador. Terminada.
> - **Limpieza** (sin efecto visible, comprobada con las pruebas):
>   - se quitaron las revisiones repetidas que nunca se alcanzaban;
>   - la base se guarda una vez por guardado (antes, hasta tres);
>   - se quitó un segundo pintado al arrancar;
>   - los nombres de las funciones de fecha quedaron en español (`hoyLocal`, `esFechaValida`, `fechaLegible`, `fechaDMA`);
>   - se retiraron el buscador global y dos sistemas de íconos que no hacían nada;
>   - los estilos de cada pantalla quedaron en su submódulo. Para esto último se comprobó que el navegador calcula exactamente los mismos estilos en las seis pantallas, a cuatro anchos de pantalla.

**Motivo:** las migraciones ya no siguen en el núcleo (pasaron a `repositorio/`), y la limpieza que el documento anunciaba ya se hizo.

---

## Cambio 4 · Sección 9, pruebas automáticas (13 → 25)

**Texto actual:**
> - **Pruebas automáticas** (Playwright, `npm test`): 13 pruebas que se corren antes de cada cambio. Comparan capturas de pantalla de las 6 vistas, un flujo de escritura completo, cada una de las seis pantallas por separado (incluida la importación de usuarios desde CSV), unos 60 casos de reglas del formulario (cada aviso y cada efecto en la base) y las fechas de calendario de noche. Método de trabajo:

**Texto propuesto:**
> - **Pruebas automáticas** (Playwright, `npm test`): 25 pruebas que se corren antes de cada cambio. Comparan:
>   - capturas de pantalla de las 6 vistas, en escritorio y en móvil;
>   - un flujo de escritura completo y cada una de las seis pantallas por separado (incluida la importación de usuarios desde CSV);
>   - más de 160 casos de reglas de guardado de Usuarios, Catálogos y Solicitudes (cada aviso y cada efecto en la base), incluidos formularios forzados con valores que la interfaz no ofrece;
>   - la compatibilidad con datos guardados por versiones anteriores, la capa de repositorio, los accesos de Inicio y las fechas de calendario de noche.
>
>   Método de trabajo:

**Motivo:** hoy son 25 pruebas, no 13. Se agregaron, entre otras, `solicitudes-reglas` (38 casos), `catalogos-reglas` (36), `usuarios-reglas` (28), `datos-guardados`, `repositorio`, `migraciones-arranque` y `accesos`.

---

## Cambio 5 · Sección 10, errores corregidos (filas nuevas 7 a 12)

**Texto propuesto** (filas que se agregan a la tabla):

| # | Error | Dónde | Estado |
|---|---|---|---|
| 7 | La clave oficial se revisaba sin espacios, pero se guardaba tal como se escribió («  NUE  »). Por eso se aceptaba otro registro con «NUE», y el primero ya no se podía guardar | Catálogos | **Corregido** (PR #58): la clave se guarda sin espacios alrededor. Un registro guardado así antes de la corrección, que además tenga registros vinculados, no se puede editar sin una migración de los datos |
| 8 | El número de empleado se guardaba con los espacios que se escribieron | Usuarios | **Corregido** (PR #59) |
| 9 | Se aceptaba una cuenta con el correo vacío (el navegador lo pide, pero el guardado no lo revisaba) | Usuarios | **Corregido** (PR #60): aviso «El correo institucional es obligatorio» |
| 10 | Al editar, la cuenta guardaba también la fecha y el motivo del movimiento, que solo sirven para el historial | Usuarios | **Corregido** (PR #61) |
| 11 | Con el formulario forzado se guardaban un estado («Suspendido») y un rol («Invitado») que no existen | Usuarios | **Corregido** (PR #62): avisos «Selecciona un rol institucional válido» y «Selecciona un estado válido». Se acepta el valor que la cuenta ya tenía |
| 12 | En «Permisos por rol», quitar y volver a poner una casilla dejaba ese permiso al final de la lista guardada | Usuarios · permisos | **Corregido** (PR #63): la lista se guarda en el orden de las casillas |

**Motivo:** son errores que encontraron las pruebas de reglas y ya se corrigieron, cada uno en su rama. Los tres textos de aviso nuevos (filas 9 y 11) **no venían en ningún documento**. Se redactaron con el estilo de los avisos que ya existían, como «La clave oficial es obligatoria». Si el equipo o el cliente prefieren otra redacción, se cambia.

---

## Cambio 6 · Sección 10, errores abiertos (filas nuevas 13 a 18)

**Texto propuesto** (filas que se agregan a la tabla):

| # | Error | Dónde | Estado |
|---|---|---|---|
| 13 | Una llave `}` suelta en la hoja de estilos (está así desde la primera versión) hace que el navegador descarte la regla siguiente, que daba separación a los elementos del encabezado de cada pantalla | Estilos (`admin.css`) | Abierto. Corregirlo cambia un poco el espacio del encabezado |
| 14 | Un parámetro con valor vacío y unidad muestra «Valor: — horas» | Catálogos · parámetros | Abierto |
| 15 | Al elegir un tipo de catálogo con la tecla Enter se vuelve a pintar la lista y se pierde el foco del teclado | Catálogos | Abierto |
| 16 | Una opción de captura guarda un campo vacío de más (`groupCustom`) cuando no se eligió «Nuevo grupo…» | Catálogos · opciones | Abierto, sin impacto para el usuario |
| 17 | Con el formulario forzado se guarda un estado que no es Vigente ni Histórico (p. ej. «Cerrado») | Catálogos | Abierto, solo con el formulario forzado |
| 18 | Con el formulario forzado, «Guardar fecha programada» en una solicitud inmediata da un aviso que no explica la causa, y una acción que no existe responde «Estado de la solicitud actualizado» sin cambiar nada | Solicitudes | Abierto, solo con el formulario forzado |

**Motivo:** están registrados en las pruebas y en el `CLAUDE.md` del repositorio, pero no en este documento. Así el equipo ve todo lo pendiente en un solo lugar. Cada uno se corregiría en su propia rama, con aprobación.

---

## Cambio 7 · Sección 10, párrafo de la deuda técnica

**Texto actual:**
> Además hay **deuda técnica** sin efecto visible: revisiones repetidas que nunca se alcanzan, guardados repetidos y helpers con nombres de versión (`v20`, `v40`…). Se registra en el `CLAUDE.md` del repositorio y se limpiará con pruebas.

**Texto propuesto:**
> La **deuda técnica** sin efecto visible que registraba esta sección ya se limpió, con las pruebas en verde (PR #64 a #72): revisiones repetidas que nunca se alcanzaban, guardados repetidos y helpers de fecha con nombres de versión. Algunas funciones internas conservan nombres con prefijo de versión (`v36`, `v39`, `v41`…); no tienen efecto para el usuario.

**Motivo:** la limpieza anunciada se terminó.

---

## Decisiones

| Cambio | Sección | Tipo | Decisión |
|---|---|---|---|
| 1 | 8 · punto 14 | Actualizar (resuelto) | ☑ Aprobado (21-nov-2026) |
| 2 | 9 · organización del código | Actualizar | ☑ Aprobado (21-nov-2026) |
| 3 | 9 · reorganización interna | Actualizar | ☑ Aprobado (21-nov-2026) |
| 4 | 9 · pruebas automáticas | Actualizar | ☑ Aprobado (21-nov-2026) |
| 5 | 10 · filas 7 a 12 (corregidos) | Agregar | ☑ Aprobado (21-nov-2026) |
| 6 | 10 · filas 13 a 18 (abiertos) | Agregar | ☑ Aprobado (21-nov-2026) |
| 7 | 10 · deuda técnica | Actualizar | ☑ Aprobado (21-nov-2026) |
