# SIGD · Módulo Administración (NEXORA)

Prototipo del módulo de Administración del SIGD (Nexora Technologies): usuarios y roles, catálogos académicos, solicitudes de cambio, periodos de captura y bitácora de auditoría. Es una **maqueta sin base de datos real**: los datos de demostración se guardan en el navegador (`localStorage`, clave `nexora-admin-v51-computacion`).

## Abrir
- `npm install` (una vez) y `npm run dev` → http://localhost:4201 (o `iniciar.bat`).
- Cuenta de demostración: `001` · contraseña `Unistmo#2026`.
- No funciona con doble clic en `index.html`: el navegador bloquea los módulos ES en `file://`.
- Versión publicable: `npm run build` (sale en `dist/`).

## Pruebas
`npm test` corre 38 pruebas de Playwright en 23 archivos (arrancan solas el servidor; fecha fija 2026-11-02):

| Prueba | Qué vigila |
|---|---|
| `capturas` | Capturas de pantalla de las 6 vistas y del acceso, en escritorio y móvil. Las referencias PNG dependen del sistema operativo |
| `flujos` | Flujo de escritura completo; compara la base de datos |
| `inicio`, `bitacora`, `periodos` | Una por pantalla, con una segunda parte de casos límite |
| `solicitudes`, `solicitudes-reglas` | Lista, detalle y diálogos; reglas de registrar y gestionar, incluido el formulario forzado |
| `catalogos`, `catalogos-reglas`, `catalogos-padre-historico` | Navegación por tipos, diálogo según el tipo e historiales; reglas del guardado; padre histórico |
| `usuarios`, `usuarios-reglas`, `usuarios-adscripcion-institucion`, `usuarios-rol-estado-anterior` | Lista, filtros, diálogo según rol y campus, permisos e importación CSV; reglas del guardado; adscripciones; rol y estado que ya no están en la lista |
| `reglas-formulario` | 61 casos del formulario compartido: aviso, cierre del diálogo y efectos en la base |
| `accesos` | Inicios de sesión y el indicador «Accesos hoy» |
| `fechas-hora-local` | Fechas de calendario de noche (hora local frente a UTC) |
| `datos-guardados`, `migraciones-arranque` | Compatibilidad con lo ya guardado en el navegador y con bases de versiones anteriores |
| `repositorio` | La capa repositorio (ADR-006) con un almacenamiento falso en memoria |
| `accesibilidad` | Nombre accesible de cada campo, contraste de los textos y contorno de foco (WCAG 2.1 AA) |
| `encabezado` | Separación del encabezado de las seis pantallas en 4 anchos |
| `tipografia` | Diálogos de Solicitudes: mismos roles de texto que el panel de detalle, nada menor a 12 px y cada dato pegado a su etiqueta |

`npm run test:actualizar` regenera las referencias. Úsalo solo cuando el cambio de comportamiento sea intencional.

## Arquitectura
Repositorio como patrón global y MVC dentro de cada pantalla (ADR-006). Reglas completas en `ARQUITECTURA.md`; la decisión, en `docs/adr-006-repositorio-mvc.md`.

```
index.html                     acceso y marco; carga /src/main.js
css/sigd.css · css/iconos.css  marco común de los 4 módulos del SIGD (estilos e íconos Tabler)
assets/                        fuente Inter, escudo y licencias
src/
├─ main.js                     entrada
├─ config/dominio.js           datos de referencia (catálogos semilla, roles, permisos)
├─ core/
│  ├─ utilidades.js            funciones puras (esc, fechas: hoyLocal, fechaLegible, fechaDMA…)
│  └─ semilla.js               datos de demostración iniciales
├─ shared/                     chips de filtro, avisos (toasts) y tablas
├─ shell/sigd.js               marco: acceso, encabezado, menú lateral
├─ styles/                     estilos comunes del módulo: admin.css · alineacion.css · catalogos.css · m3.css
├─ vista/admin.html            marco HTML del módulo y diálogo #editor (las vistas se pegan en sus marcadores)
└─ modules/admin/
   ├─ host.js                  Shadow DOM, ensamble de estilos y vistas, NX.mount / NX.go
   ├─ app.js                   estado compartido, navegación, marco del diálogo, menú del perfil y creación de los submódulos
   ├─ repositorio/             único acceso a localStorage: almacen-local.js, preferencias.js,
   │                           migraciones.js (arranque) e index.js (un repositorio por agregado)
   ├─ formulario/index.js      despacha el diálogo #editor al controlador de Usuarios, Catálogos o Solicitudes
   └─ inicio/ · solicitudes/ · catalogos/ · usuarios/ · periodos/ · bitacora/
         index.js              conecta las piezas: nxNombre(env) → {render, init, …}
         modelo.js             reglas de negocio; datos solo por el repositorio
         vista.js              pinta la pantalla y avisa de los eventos
         controlador.js        recibe la acción, llama al modelo y elige la vista
         vista.html            sección #view-<nombre>
         estilos.css           reglas que solo afectan esa pantalla
         vista-dialogos.js     diálogos (Solicitudes, Catálogos, Usuarios)
         vista-permisos.js     panel «Permisos por rol» (Usuarios)
tests/                         pruebas de Playwright; referencias en tests/capturas-base/
docs/                          Documento maestro (copia), ADR-006, diagrama V4; propuestas/ guarda las propuestas de cambio aprobadas
```

## Estado
- ✅ Modularización terminada: las seis pantallas separadas, en MVC y con prueba; `app.js` pasó de ~700 a ~140 líneas.
- ✅ Fases 0 a 3 de la arquitectura (ADR-006): el repositorio es el único que lee, guarda y modifica registros.
- ✅ Limpieza acordada y revisión de accesibilidad (WCAG 2.1 AA) terminadas.

Más detalle: `CLAUDE.md` (reglas de trabajo), `docs/historial-cambios.md` (fases, ramas y errores corregidos) y `docs/historial-prototipo.md` (versiones v2 y v3, antes de la Etapa A).
