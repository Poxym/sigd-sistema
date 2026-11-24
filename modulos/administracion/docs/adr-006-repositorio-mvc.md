# ADR-006 · Repositorio como patrón global y MVC dentro de cada módulo

**Estado:** aceptada (decisión del usuario; registrada el 17 de noviembre de 2026)
**Ámbito:** sistema SIGD completo (patrón global) y módulo de Administración de Nexora Technologies (aplicación en este repositorio)

> Un **ADR** (*Architecture Decision Record*, registro de decisión de arquitectura) es un documento corto que deja por escrito una decisión importante: por qué se tomó, qué alternativas había y qué consecuencias tiene. Sirve para que, meses después, nadie tenga que adivinar por qué el código está organizado así.
>
> Las ADR 001 a 005 no están en este repositorio. Si existen, conviene enlazarlas aquí.

## Contexto

- El SIGD lo construyen cuatro equipos, uno por módulo (Plan de Trabajo, Informe de Actividades, Reportes y Administración), sobre **una sola base de datos compartida** (Documento maestro, sección 3).
- Los módulos **no deben llamarse entre sí** ni bloquearse; se acuerdan formatos de entrada y salida de datos (Documento maestro, sección 3; pendiente 7 de la sección 8).
- Hoy el prototipo **no tiene servidor**: los datos de demostración se guardan en el navegador (`localStorage`). La base de datos futura será **relacional**.
- En el módulo de Administración, después de la modularización (PR #1 a #39), los datos del negocio ya pasan por un solo punto (`src/core/almacen.js`), pero los submódulos reciben la base completa (`db`) y la modifican directamente. Las reglas de negocio están mezcladas con la interfaz: los `guardar.js` validan, modifican `db`, muestran avisos y cierran diálogos en la misma función.

## Decisión

1. **Patrón global: Repositorio.** Los datos viven en una base central y se accede a ellos mediante **una interfaz de repositorio por agregado** (usuarios, permisos, catálogos, solicitudes, periodos, bitácora). Cada repositorio usa un **adaptador** de almacenamiento: hoy `localStorage`; en el futuro, la base relacional. Los módulos no se llaman entre sí: se comunican a través de los datos.
2. **Patrón dentro de cada módulo: MVC.**
   - **Modelo:** entidades y reglas de negocio (vigencias, «no eliminar lo usado», validaciones, historial). Accede a los datos **solo** mediante un repositorio.
   - **Vista:** solo pinta y avisa de eventos; sin reglas ni acceso a datos.
   - **Controlador:** recibe la acción, llama al modelo y elige la vista; sin reglas de negocio.
   - **Núcleo:** arranque, navegación y avisos.
3. **Vista y Controlador nunca tocan el almacenamiento.** Solo los archivos del repositorio usan `localStorage`.
4. **Se aplica sobre la estructura actual** (`src/`, módulos ES y Vite), no con `<script>` globales.

## Alternativas consideradas

- **Volver a `js/` con `<script>` en orden y un espacio de nombres global (`NX.modelo`, `NX.repo`…), sin módulos ES, para abrir con doble clic.** Se **descartó** (opción 2 de la sesión del 17-nov-2026): deshacía la Etapa A (paso a módulos ES con Vite) y obligaba a reescribir los `import` de unos 30 archivos y a rehacer las 13 pruebas, sin cambio visible para el usuario. Con módulos ES, el prototipo se abre con `npm run dev` (o `iniciar.bat`) y se publica con `npm run build`.
- **Que cada pantalla siga usando la base completa (`db`) directamente.** Es lo que hay hoy. Se descarta porque ata cada pantalla al formato interno de los datos: al pasar a una base relacional habría que cambiarlas todas.

## Consecuencias

- **A favor:** cambiar de `localStorage` a la base relacional afectará solo al adaptador; las reglas de negocio se pueden probar sin la interfaz; cada pantalla queda separada en piezas con una responsabilidad clara.
- **En contra:** durante la transición conviven dos caminos (pantallas que ya usan el repositorio y otras que todavía usan `db`). Para que no se contradigan, los repositorios trabajan sobre **el mismo objeto `db`** en memoria que usan las pantallas aún no migradas.
- **Límite:** `src/shell/sigd.js` (marco común de los cuatro módulos) usa `localStorage` para recordar si su menú está plegado. Queda como **excepción documentada**: no es código de este módulo (decisión del usuario, 17-nov-2026).
- **Compatibilidad:** la clave (`nexora-admin-v51-computacion`) y el formato de lo guardado **no cambian**, para no perder los datos que ya están en los navegadores.

## Plan de aplicación (módulo de Administración)

- **Fase 0:** esta ADR, `ARQUITECTURA.md` y la línea base de verificación (pruebas de Playwright, más una prueba de compatibilidad con datos ya guardados).
- **Fase 1:** capa `src/modules/admin/repositorio/` (adaptador `localStorage`, preferencias de interfaz y un repositorio por agregado). Ningún archivo del módulo fuera de `repositorio/` usa `localStorage`. Sin cambios visibles ni de comportamiento.
- **Fase 2:** migrar a MVC una pantalla a la vez, empezando por **Periodos de captura**. ✅ Terminada: las seis pantallas (integradas junto con las Fases 0 y 1 en los PR #40 a #57).
- **Fase 3:** que el repositorio también **modifique** registros (métodos `actualizar` y de historial por agregado) y que nadie fuera de él reciba la base completa. ✅ Terminada (PR #87 a #90). Con esto la transición acabó: ya no conviven dos caminos a los datos.

## Estado

Decisión **cerrada** por el usuario (21 de noviembre de 2026): todo cambio al módulo respeta Repositorio + MVC. El estado detallado y los riesgos que siguen vigentes (guardar después de cada cambio; base de datos asíncrona en la Etapa 2) están en `ARQUITECTURA.md`.
