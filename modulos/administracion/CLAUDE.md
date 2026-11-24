# SIGD · Módulo Administración (Nexora Technologies)

Proyecto escolar de Ingeniería en Computación. Módulo de Administración de un sistema web que reemplaza los Excel de Plan de Trabajo e Informe de Actividades de una universidad. El usuario es estudiante: explica los conceptos con claridad, en español de México, y avanza un paso pequeño a la vez.

Repositorio: https://github.com/Gamalielsp/sigd-administracion (privado). Sistema del usuario: Windows + PowerShell.

Lo ya hecho (fases, ramas, PR, errores corregidos y su explicación) está en `docs/historial-cambios.md`: consúltalo cuando necesites el porqué de una decisión pasada.

## Reglas de trabajo (obligatorias)

- Nunca hagas push directo a `main`. Una rama por paso (`test/...`, `refactor/...`, `fix/...`, `docs/...`, `chore/...`). Claude puede subir la rama, abrir el Pull Request y hacer el Merge en GitHub (con `gh`, «merge commit»), siempre con `npm test` en verde; después borra la rama integrada y actualiza `main` local (autorizado por el usuario el 20-nov-2026).
- Antes de cada commit corre `npm test` y confirma que todo pasa. Si algo falla, no hagas commit: explica qué falló.
- Método: prueba primero, luego código. Para tocar una zona: (a) una prueba que registre el comportamiento actual, (b) se integra, (c) recién entonces se cambia el código y la prueba debe seguir idéntica.
- Refactor = mismo comportamiento. Si encuentras un error que ya existía, no lo corrijas dentro del refactor: avísale al usuario y corrígelo en una rama aparte (`fix/...`) con su aprobación.
- Prueba de sabotaje: después de escribir una prueba nueva, rompe a propósito una regla y verifica que la prueba falle; luego restáurala.
- Si algo no está en los documentos o se contradice, dilo; no lo inventes. Los cambios al Documento maestro se proponen aparte para que el usuario los apruebe.
- Mensajes de commit en español, formato `tipo: descripción` (`test:`, `refactor:`, `fix:`, `docs:`, `chore:`).
- Al terminar un paso, anota lo hecho en `docs/historial-cambios.md`; en este archivo solo cambia lo que modifica una regla, la arquitectura o un error abierto.

## Comandos

```powershell
npm run dev              # servidor Vite en http://localhost:4201
npm test                 # todas las pruebas (Playwright)
npm run test:actualizar  # regenera las referencias (solo cuando el cambio de comportamiento es intencional)
npm run build / preview
```

Las pruebas arrancan solas el servidor. Los módulos ES no funcionan abriendo el HTML con `file://`; siempre con Vite.

## Arquitectura (ADR-006, decisión cerrada)

Repositorio como patrón global y MVC dentro de cada pantalla. Reglas completas en `ARQUITECTURA.md`; la decisión, en `docs/adr-006-repositorio-mvc.md`. Es una **decisión cerrada** del usuario: todo cambio la respeta. Fases 0 a 3 terminadas.
- Solo `src/modules/admin/repositorio/` usa `localStorage` (excepción documentada: `src/shell/sigd.js`, marco común). El repositorio también modifica registros: ningún modelo hace `Object.assign` ni `.push` sobre datos guardados, y nadie recibe `db`, `persist` ni `audit`.
- Modelo = reglas de negocio, accede a datos solo por un repositorio. Vista = pinta y avisa de eventos. Controlador = recibe la acción, llama al modelo, elige la vista. Ni Vista ni Controlador tocan datos.
- No cambian la clave ni el formato de lo guardado, ni nombres, textos o estilos de la interfaz.
- La base se guarda **una vez** por guardado, al final (`bitacora.registrar` también guarda).

Mapa:
- `index.html` carga `/src/main.js`. `css/sigd.css`, `css/iconos.css` y `assets/` son del **marco común de los 4 módulos del SIGD**: un cambio ahí requiere aprobación del usuario y hay que avisar a los otros 3 equipos. Cambios aprobados: el evento `sigd:sesion-iniciada` (19-nov-2026) y `--lg-muted` (21-nov-2026).
- Íconos: una sola hoja, `css/iconos.css` (Tabler, licencia en `assets/LICENSE-tabler.txt`). Cada ícono es `<i class="ti ti-nombre">`; la regla `.ti` pinta como máscara el SVG que cada `.ti-nombre` guarda en `--i`. `index.html` la carga con un `<link>` y `host.js` la importa (`?raw`) para el Shadow DOM. Un ícono nuevo se agrega ahí, con el mismo formato.
- `src/config/dominio.js` (NXD) · `src/core/` (utilidades y semilla) · `src/shared/` (chips, notificación, tabla).
- `src/shell/sigd.js`: login, encabezado y menú del marco. Tras un login correcto anuncia `document.dispatchEvent(new CustomEvent('sigd:sesion-iniciada', {detail:{cuenta}}))`; Inicio lo escucha para contar los accesos.
- `src/modules/admin/repositorio/`: adaptador `localStorage` (`almacen-local.js`), preferencias, migraciones de arranque (`migraciones.js`) y un repositorio por agregado (`index.js`).
- `src/modules/admin/host.js`: monta el módulo en un Shadow DOM (open), carga `src/styles/admin.css`, luego el `estilos.css` de cada pantalla y después `alineacion.css`, `catalogos.css` y `m3.css` (el orden importa), y pega el `vista.html` de cada submódulo en sus marcadores `<!--@nombre-->` de `src/vista/admin.html` (que conserva el marco y el diálogo `#editor`). Cada `vista.html` es la sección exacta, sin salto de línea extra.
- `src/modules/admin/app.js`: `nxApp(document)` con el estado compartido, navegación, marco del diálogo (`openDialog`), menú del perfil e íconos. Dentro del módulo `document` es el Shadow DOM: **nunca uses el `document` global**; usa `$` o el `document` del entorno.

Patrón de submódulo (las seis pantallas: Inicio, Solicitudes, Catálogos, Usuarios, Periodos y Bitácora):
- `<nombre>/index.js` exporta `nxNombre(env)` → `{render, init, ...}` y solo conecta las piezas; `env = {$, esc, repo, notify, ...}`. Además: `modelo.js`, `vista.js`, `controlador.js`, `vista.html` (sección `#view-<nombre>`) y `estilos.css` (reglas cuyos selectores llevan **todos** `#view-<nombre>`; lo común sigue en `admin.css`). Diálogos en `vista-dialogos.js` (Solicitudes, Catálogos, Usuarios); el panel de permisos en `usuarios/vista-permisos.js`.
- En `app.js` se crea de forma perezosa: `let xUI=null; const x=()=>xUI||(xUI=nxX({...}))`. Su código de arranque va en `init()`, que `app.js` llama en la misma línea que los demás.
- Estado que cambia (`modalAction`, `modalItem`, `catalogType`) se pasa como función que lo lee al momento (`getModal()`, `getType()`); si el submódulo debe escribirlo, recibe `setModal(accion, id)`. `render` y `openDialog` se pasan envueltas (`render:()=>render()`) para llamar siempre a la versión vigente.
- Las revisiones del modelo **devuelven el aviso**; el controlador decide avisar, guardar, cerrar y repintar, en el orden original.
- Formulario compartido (`formulario/index.js`, sin `vista.html`: su HTML es `#editor`): `nxFormulario(env)` → `{guardar}`, despacha según `getModal().action` (`user`, `catalog`, `request`, `requestAction`) a `env.usuarios.guardar(f)`, `env.catalogos.guardar(f, releer)` o `env.solicitudes.registrar`/`gestionar`. En `app.js`: `$('editorForm').onsubmit=e=>formulario().guardar(e)`.
- Funciones delgadas que quedan en `app.js` (las usan Inicio y los botones): `openRequest()`, `openRequestDetail(id)`, `openCatalog(id)`, `openUser(id)`, `renderUsers()`, `renderPermissionPanel()`.
- Los comentarios «Paso N» del guardado conservan la numeración de la antigua cadena de 11 pasos (detalle en `docs/historial-cambios.md`).

Al programar:
- Para mover código: `git mv` para los archivos que cambian de lugar (conserva el historial) y un script que copie las funciones literales y verifique cada límite antes de cortar. Después, comprobar que cada nombre que usa el archivo nuevo esté declarado (contando también los que van tras `...`).
- Para unir 2 capas (una función envuelta por otra): ver si la capa interna tiene `return` que no sean de error; si no los tiene, la parte posterior de la envoltura va al final de la misma función.
- Manejadores `async` de eventos: guarda el elemento en una variable **antes** del primer `await` (`const input=e.target`). Dentro del Shadow DOM el navegador deja `e.target` en `null` al terminar de repartir el evento.
- Fechas: una **fecha de calendario** («hoy», valores por defecto de `type=date`, comparaciones de fecha futura) sale de `hoyLocal()` de `core/utilidades.js` (hora local). Un **instante** (bitácora, `recordedAt`, historiales) se guarda con `new Date().toISOString()`. Nunca uses `toISOString().slice(0,10)` como «hoy». Para mostrar: `fechaLegible` («02 nov 2026») y `fechaDMA` («02/11/2026»); `esFechaValida` para validar.
- Los nombres con prefijo de versión (`v36*`, `v39*`, `v41*`…) que quedan son funciones locales de un submódulo, `id` del HTML o clases de CSS; se conservan.

Base de datos del prototipo: `localStorage`, clave `nexora-admin-v51-computacion`. Cuentas demo: `001` (Carlos Mendoza, administrador general) o `000`, contraseña `Unistmo#2026`. Cada login correcto suma 1 en `db.demoAccessEvents` (`{source:'login', day, account, count}`, día en hora local).

## Accesibilidad (WCAG 2.1 AA)

- Un campo nuevo: con `<label for>` o, si no hay etiqueta visible, `aria-label`. Un texto nuevo: al menos 4.5:1 sobre su fondo (3:1 si es grande). Los vigila `tests/accesibilidad.spec.mjs`.
- Todo elemento enfocable debe cambiar de aspecto al recibir el foco: contorno `3px solid var(--p)` (como el marco) o, en los campos de los diálogos, el borde oscuro de Material 3. Si el contenedor recorta (`overflow`), el contorno va por dentro (`outline-offset` negativo).
- Los selectores ocultos que reemplazan los chips (`#userStatus`, `#requestFilter`, `#auditFilter`) van con `aria-hidden`.

## Errores conocidos abiertos (corregir solo en rama aparte, con aprobación)

- La regla «El valor del parámetro debe ser numérico» no se alcanza desde la interfaz (el campo es `type=number`).
- Catálogos: un registro antiguo con espacios alrededor de la clave y con registros vinculados no se puede editar («Esta clave tiene relaciones vinculadas…»), porque al guardarla sin espacios cambiaría la clave a la que apuntan.
- Al ir a otra pantalla desde Inicio («Ver todas», «Administrar» o una cifra), el menú lateral del marco (`#ni`) sigue marcando «Inicio»: `navigate()` de `app.js` solo actualiza el menú propio del módulo, que está oculto.
- `docs/Documento_Maestro_Proyecto_Plan_Informe.md` (líneas 230–242) aún apunta a `docs/propuesta-…`; las propuestas ahora están en `docs/propuestas/`. Requiere una propuesta aparte.

## Pruebas

- `tests/` usa Playwright con `playwright.config.mjs` (`snapshotPathTemplate` → `tests/capturas-base/<archivo>/...`, fecha fija 2026-11-02). 38 pruebas en 23 archivos (lista en `README.md`).
- Lo común a todas las pruebas está en `tests/ayudantes.mjs`: `CLAVE_BD`, `FECHA_FIJA`, `CUENTA_DEMO`, `enviarAcceso(page, usuario?, clave?)` (llena el acceso y pulsa «Entrar», sin esperar nada) y `normalizar()`. Una prueba nueva los **importa**, no los copia. Los caracteres especiales en una expresión regular se escriben escapados (`\u00a0`, `\u202f`): al copiar el carácter literal se puede volver un espacio normal.
- `capturas` (imágenes) depende del sistema operativo: las referencias PNG las genera el usuario en su máquina. Las demás comparan texto/JSON y son portables.
- `capturas` **no detecta cambios pequeños de color** (`threshold: 0.2` por píxel); un cambio de tamaño o separación sí lo detecta.
- Un efecto que no se ve en pantalla (p. ej. un campo del historial) solo lo delata la `_huellaFinal`; al sabotearlo, hazlo **solo**, porque otro sabotaje en la bitácora también cambia la huella.
- Cada prueba que inicia sesión deja un acceso guardado: las referencias que miran la base o Inicio incluyen ese registro.
- Los formatos de hora de es-MX varían entre versiones de Chrome («a. m.»): las pruebas usan `normalizar()`.
- Agregar casos a `reglas-formulario`: en un grupo nuevo después del `cierre()` del grupo existente, para no alterar su `_huellaFinal`.

## Interfaz

Modo claro, paleta pastel, buen contraste, coherente con los demás módulos del SIGD (Material 3 / Tabler). Para requisitos de negocio consulta el Documento maestro (`docs/Documento_Maestro_Proyecto_Plan_Informe.md`) y cita de qué reunión o formato sale cada requisito. Los cambios a ese documento se proponen en un archivo aparte (`docs/propuestas/propuesta-*.md`), el usuario los aprueba y solo entonces se aplican a la copia.

## Windows

Los avisos de fin de línea CRLF son normales. Usa PowerShell; `rm` puede no existir, usa `Remove-Item`. `gh` no está en el PATH: `& "C:\Program Files\GitHub CLI\gh.exe"`. Los mensajes de commit de varias líneas, desde Bash con `git commit -F - <<'EOF'` (en PowerShell 5.1 falla).
