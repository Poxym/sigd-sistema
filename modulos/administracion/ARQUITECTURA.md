# Arquitectura del módulo de Administración

Reglas para organizar el código según la **ADR-006** (`docs/adr-006-repositorio-mvc.md`): **Repositorio** como patrón global y **MVC** dentro de cada módulo, aplicados sobre la estructura actual (`src/`, módulos ES y Vite).

## Las piezas y su única responsabilidad

| Pieza | Qué hace | Qué NO hace |
|---|---|---|
| **Repositorio** | Lee y guarda los datos de un agregado. Es la única pieza que conoce dónde se guardan (hoy `localStorage`, mañana una base relacional) | No decide reglas de negocio ni toca la interfaz |
| **Modelo** | Entidades y reglas de negocio: vigencias, «no eliminar lo usado», validaciones, historial. Devuelve un resultado (éxito o el aviso que corresponde) | No toca la página ni `localStorage`; los datos los pide a un repositorio |
| **Vista** | Pinta la pantalla o el diálogo y avisa cuando el usuario hace algo (clic, cambio) | No tiene reglas ni acceso a datos |
| **Controlador** | Recibe la acción, llama al modelo y elige qué mostrar (vista, aviso, cerrar el diálogo) | No tiene reglas de negocio |
| **Núcleo** | Arranque, navegación entre pantallas, marco del diálogo y avisos | No tiene reglas de una pantalla en particular |

## Quién puede llamar a quién

```
 Usuario ──▶ Vista ──(evento)──▶ Controlador ──▶ Modelo ──▶ Repositorio ──▶ Adaptador ──▶ localStorage
              ▲                       │                                                   (mañana: base relacional)
              └───────(qué pintar)────┘
```

- Las flechas solo van **hacia la derecha**, salvo la respuesta del controlador a la vista. Un modelo nunca llama a una vista; un repositorio nunca llama a un modelo.
- **Solo `src/modules/admin/repositorio/` usa `localStorage`.** Única excepción: `src/shell/sigd.js` (marco común de los cuatro módulos), que recuerda si su menú está plegado. No es código de este módulo (ADR-006).
- Los submódulos **no se llaman entre sí**: comparten datos a través de los repositorios. Lo que sí está permitido es lo que ya hacen hoy por medio de `app.js`, por ejemplo que Inicio abra una solicitud con `openRequestDetail(id)`.

## Estructura objetivo

```
src/modules/admin/
├─ host.js                 núcleo: Shadow DOM y montaje
├─ app.js                  núcleo: estado compartido, navegación, marco del diálogo, creación de submódulos
├─ repositorio/            (Fase 1)
│  ├─ almacen-local.js     adaptador localStorage: cargar(), guardar(db)
│  ├─ preferencias.js      preferencias de interfaz (menú lateral plegado)
│  ├─ migraciones.js       aplicarMigraciones(db): pone al día una base de una versión anterior
│  └─ index.js             crearRepositorio(adaptador) → un repositorio por agregado
└─ <pantalla>/             (Fase 2 en adelante, una pantalla a la vez)
   ├─ index.js             fábrica nxPantalla(env): conecta modelo, vista y controlador
   ├─ modelo.js            reglas de negocio; usa env.repo
   ├─ vista.js + vista.html  pinta; avisa de eventos
   └─ controlador.js       recibe acciones; llama al modelo; elige la vista
```

**Agregados y sus repositorios** (interfaz de la Fase 1, con los métodos que modifican registros de la Fase 3):

| Repositorio | Datos | Métodos |
|---|---|---|
| `usuarios` | `db.users` | `todos()`, `buscar(id)`, `buscarPorNumero(num)`, `agregar(u)`; Fase 3: `actualizar(id, cambios, quitar)`, `anotarCambioDeRol(id, texto)`, `historialAdscripcion(id)`, `agregarMovimientoAdscripcion(id, mov)`, `agregarMovimientoCarrera(id, mov)` |
| `permisos` | `db.permissions` | `delRol(rol)`, `asignar(rol, lista)` |
| `catalogos` | `db.catalogs` (11 tipos) | `todos()`, `deTipo(tipo)`, `buscar(tipo, id)`, `buscarPorClave(tipo, clave)`, `agregar(tipo, r)`; Fase 3: `actualizar(tipo, id, cambios, quitar)`, `anotarCambio(tipo, id, entrada)`, `historialRelacion(tipo, id)`, `agregarMovimientoRelacion(tipo, id, mov)`, `anotarVigencia(tipo, id, validFrom)` |
| `solicitudes` | `db.requests` | `todas()`, `buscar(id)`, `agregar(s)`; Fase 3: `actualizar(id, cambios, quitar)` |
| `accesos` | `db.demoAccessEvents` | `registrados()` |
| `periodos` | `db.period`, `db.periodHistory` | `actual()`, `historial()`, `agregarAlHistorial(e)`, `actualizar(cambios)` |
| `bitacora` | `db.audit` | `entradas()`, `registrar(tipo, detalle, antes, después)` |
| *(general)* | toda la base | `guardarTodo()` |

## Reglas que no cambian

- La clave de almacenamiento (`nexora-admin-v51-computacion`) y el **formato** de lo guardado no cambian, para no perder los datos que ya están en los navegadores.
- Los nombres de datos, los textos y los estilos de la interfaz no cambian.
- Sin frameworks nuevos. No se instalan dependencias sin aprobación.
- Todo lo de `CLAUDE.md` sigue vigente: una rama por paso, prueba primero, sabotaje, refactor = mismo comportamiento.

## Una sola puerta a los datos (desde la Fase 3)

Ya no hay transición: **todo** lo que lee, agrega o modifica datos pasa por un repositorio. Los repositorios trabajan sobre una sola base en memoria, que solo conocen ellos y su adaptador (`crearRepositorio` ya no la ofrece). Un cambio queda guardado cuando el modelo llama a `guardarTodo()` (o al registrar en la bitácora, que también guarda).

## Estado actual frente al objetivo

| Parte | Hoy | Objetivo |
|---|---|---|
| Acceso a `localStorage` | ✅ Solo `repositorio/` (Fase 1, rama `refactor/repositorio`); excepción: `shell/sigd.js` | Solo `repositorio/` |
| Carga de la base | ✅ El adaptador carga y repara formatos antiguos; `crearRepositorio()` aplica `migraciones.js` (`normalizeLegacyRelations`, `db.permissions`, `db.periodHistory`, `v41Initialize`, en ese orden) y guarda una vez (rama `refactor/migraciones-repositorio`) | Todas en el repositorio |
| Pantallas | ✅ Las seis (Periodos, Bitácora, Inicio, Solicitudes, Catálogos y Usuarios) en MVC y con `repo` por `env` (Fase 2) | Modelo, vista y controlador por pantalla |
| Reglas de negocio | ✅ En el `modelo.js` de cada pantalla (Fase 2) | En el `modelo.js` de cada pantalla |
| Modificar registros | ✅ Solo por métodos del repositorio (`actualizar` y los historiales); ningún modelo hace `Object.assign` ni `.push` sobre un registro (Fase 3, PR #87 a #89) | Solo por el repositorio |
| Base completa (`db`) | ✅ Nadie fuera del repositorio la recibe: ni `app.js`, ni el formulario, ni las pantallas (Fase 3, PR #90) | Solo el repositorio y su adaptador |

## Riesgos que siguen vigentes

- **Hay que guardar.** Un cambio hecho por el repositorio solo queda guardado cuando el modelo llama a `guardarTodo()` (o a `bitacora.registrar`, que también guarda). Un modelo nuevo que lo olvide perdería el cambio al recargar. Lo vigilan las pruebas que recargan la página o leen lo guardado (`datos-guardados`, `reglas-formulario` y las de cada pantalla).
- **Base de datos real (Etapa 2 del proyecto).** El adaptador de hoy (`almacen-local.js`) responde al instante (síncrono); una base real responde después (asíncrona). Al conectarla habrá que cambiar el adaptador y que los repositorios y modelos esperen la respuesta. Las pantallas no deberían cambiar.
- Resueltos: las migraciones de arranque viven en el repositorio (Fase 1, `tests/migraciones-arranque.spec.mjs`); Periodos ya no guarda desde sus manejadores de eventos (Fase 2); ya no conviven pantallas migradas y sin migrar (Fase 2) ni modelos que cambien registros por su cuenta (Fase 3).

## Periodos de captura en MVC (primera pantalla, Fase 2)

```
periodos/
├─ index.js         nxPeriodos(env): crea modelo, vista y controlador; misma interfaz pública que antes
├─ modelo.js        validarAcademico, validarVentanas, cambios, guardarVentana, registrarHistorialVentana, guardarAcademico
├─ vista.js         renderHistorial(historial), renderResumen(periodo), llenar(periodo), leerFormulario(), alGuardar(fn)
├─ controlador.js   guardar(): mismo orden de validaciones, avisos y repintado
└─ vista.html       sin cambios
```

Sirve de modelo para las demás pantallas. Rarezas que se conservaron a propósito (para una rama aparte, con prueba):
la revisión `checkValidity()` tras guardar la ventana nunca corta; la condición del historial de la ventana siempre
es verdadera cuando cambió la ventana; cada guardado escribe hasta 5 veces en `localStorage`; las tarjetas dicen
«Ventana activa» aunque el estado sea Cerrado (confirmar con el Documento maestro).

## Bitácora en MVC (segunda pantalla, Fase 2)

Mismo patrón que Periodos: `bitacora/modelo.js` (`filtrar(q, f)`, `textoCSV()`, `nombreCSV`; solo lee
`repo.bitacora.entradas()`), `vista.js` (`leerFiltros()`, `pintarFilas(entradas)`, `descargar(texto, nombre)`,
`alExportar(fn)`, `alFiltrar(fn)`) y `controlador.js` (`render`, `exportar`, `init`). Comportamiento registrado
por la prueba y conservado: la búsqueda no distingue mayúsculas pero **sí** acentos (con la semilla, «CATÁLOGO» encuentra 2 filas y «catalogo» solo 1).

## Inicio en MVC (tercera pantalla, Fase 2)

`inicio/modelo.js` (`resumen()` → conteos, hasta 4 pendientes y periodo; `accesosHoy()`), `vista.js`
(`pintar(resumen, alAbrirSolicitud)`, `alIr(fn)`) y `controlador.js`. Lee por `usuarios.todos()`,
`solicitudes.todas()`, `catalogos.todos()`, `accesos.registrados()` y `periodos.actual()`. Hallazgo:
nada escribe todavía en `db.demoAccessEvents`, así que «Accesos hoy» siempre vale 0 en el uso real
(se resolverá aparte, con propuesta en `docs/`).

## Solicitudes en MVC (cuarta pantalla, Fase 2)

Tres ramas: primero la prueba `tests/solicitudes-reglas.spec.mjs` (38 casos de registrar y gestionar que `reglas-formulario`
no recorría, incluido el formulario forzado), después la lista y el detalle, y al final los diálogos y el guardado.
`modelo.js` reúne lo que antes estaba en `reglas.js` y `guardar.js`; `dialogo.js` pasó a `vista-dialogos.js` y ya no lee la
base (pide los datos a `datos`, que responde el modelo). El formulario compartido despacha a `controlador.registrar` y
`controlador.gestionar`. Se conservaron a propósito las revisiones repetidas que nunca se alcanzan.

## Catálogos en MVC (quinta pantalla, Fase 2)

Tres ramas, igual que Solicitudes. Primero la prueba `tests/catalogos-reglas.spec.mjs` (36 casos de guardado y formulario
forzado y 12 registros de pantalla). Después la lista: `modelo.js` (registros por `repo.catalogos.deTipo`, padre, búsqueda,
grupos y estado), `vista.js` (todo el HTML y el teclado) y `controlador.js` (lo elegido y el orden de pintado). Al final, el
diálogo y el guardado: `dialogo.js` pasó a `vista-dialogos.js` y ya no lee la base (pide padres y grupos a `datos`), y
`guardar.js` e `historial.js` pasaron a `modelo.js`. El formulario compartido despacha a `controlador.guardar(f, releer)`.
«Nuevo grupo…» mezclaba regla y pantalla; ahora el modelo revisa el nombre, la vista lo agrega al selector y el
controlador vuelve a leer el formulario, en el mismo orden de antes.

## Usuarios en MVC (sexta pantalla, Fase 2)

Primero la prueba `tests/usuarios-reglas.spec.mjs` (28 casos de guardado y formulario forzado, 4 registros de pantalla y el
orden de los permisos). Después la lista y las tarjetas por rol: `modelo.js` (cuentas filtradas por `repo.usuarios.todos` y
conteos de activas), `vista.js` y `controlador.js`. Luego el diálogo y el guardado: `dialogo.js` pasó a
`vista-dialogos.js` junto con los campos docentes de `docentes.js`, y las reglas de `guardar.js` pasaron a `modelo.js`. El
formulario compartido ya despacha a los tres controladores. Al final, permisos e importación: `permisos.js` pasó a
`vista-permisos.js` (solo pinta) y las reglas de permisos y de la importación CSV (`importar.js`) pasaron a `modelo.js`; el
botón y el selector de archivo los conecta `vista.js`. Con esto termina la Fase 2: las seis pantallas están en MVC y ningún
submódulo recibe `getDb`.

## Fase 3 · el repositorio también modifica registros

Hasta la Fase 2, los modelos de Usuarios, Catálogos y Solicitudes **modificaban** los registros en memoria por su cuenta (`Object.assign`, `.push` en los historiales) y luego guardaban la base completa con `guardarTodo()`. Funciona con `localStorage`, pero una base relacional necesita que el repositorio reciba cada cambio («actualiza esta cuenta», «agrega este movimiento»). En la Fase 3 cada modelo pide esos cambios a su repositorio, una pantalla por rama, con el mismo comportamiento y el mismo formato guardado (mismo orden de campos).

- ✅ **Usuarios** (rama `refactor/repo-usuarios-actualizar`): `guardarCuenta`, `historialAdscripcion` e `historialCarrera` usan `repo.usuarios.actualizar`, `anotarCambioDeRol`, `historialAdscripcion`, `agregarMovimientoAdscripcion` y `agregarMovimientoCarrera`. Prueba: segundo test de `tests/repositorio.spec.mjs` (`repositorio-usuarios.json`); sabotaje de cada método detectado también por `usuarios`, `usuarios-reglas` y `reglas-formulario`.
- ✅ **Catálogos** (rama `refactor/repo-catalogos-actualizar`): `guardarRegistro`, `v40RecordDirectHistory` e `historialRelacion` usan `repo.catalogos.actualizar`, `anotarCambio`, `historialRelacion` y `agregarMovimientoRelacion`. Prueba: tercer test de `tests/repositorio.spec.mjs` (`repositorio-catalogos.json`); sabotaje de cada método detectado también por las pruebas de Catálogos y `reglas-formulario`.
- ✅ **Solicitudes** (rama `refactor/repo-solicitudes-actualizar`): `ejecutarGestion` y `v39ApplyRequest` usan `repo.solicitudes.actualizar` y, para el registro de catálogo que cambia una solicitud aplicada, `repo.catalogos.actualizar`, `anotarCambio` y `anotarVigencia`. Prueba: cuarto test de `tests/repositorio.spec.mjs` (`repositorio-solicitudes.json`); sabotaje detectado también por las pruebas de Solicitudes y `reglas-formulario`. **Ningún modelo modifica ya registros por su cuenta.**
- ✅ **Sin acceso a la base completa** (rama `refactor/app-sin-db`): `app.js` ya no saca `db`, `persist` ni `audit` del repositorio; el formulario ya no recibe `persist` (su caso «sin acción», que no ocurre desde la interfaz, solo volvía a guardar lo ya guardado) y el repositorio ya no ofrece `db`. `tests/repositorio.spec.mjs` toma la base del adaptador (recibe el mismo objeto al guardar), con la misma referencia.
- ✅ **Documentación** (rama `docs/arquitectura-fase-3`): este archivo y la ADR. **Fase 3 terminada.**

## Cómo verificar

- `npm test`: todas las pruebas en verde **sin** actualizar referencias (refactor = mismo comportamiento). Incluye capturas pixel por pixel de las 6 vistas, cero errores de consola y la compatibilidad con datos ya guardados.
- Que nadie fuera del repositorio use `localStorage` (solo debe aparecer `src/shell/sigd.js`, la excepción):
  ```powershell
  Get-ChildItem -Recurse src -Include *.js | Select-String -Pattern 'localStorage' | Where-Object { $_.Path -notmatch '\\repositorio\\' } | Select-Object Path, LineNumber
  ```
