/* Pantalla «Usuarios y permisos» en MVC (ADR-006, Fase 2): tarjetas por rol, lista con búsqueda y filtros, diálogo
   de la cuenta, panel de permisos por rol e importación desde CSV. HTML en usuarios/vista.html.
   Esta fábrica solo conecta las piezas:
   - modelo.js: cuentas filtradas y activas por grupo; datos para el diálogo y todas las reglas del guardado
     (todo por el repositorio)
   - vista.js: tarjetas, filas, eventos de los filtros y opciones del filtro de rol · vista-dialogos.js: diálogo
     «Nuevo / Editar usuario» con sus campos docentes e historiales
   - controlador.js: el orden de pintado, init(), la apertura del diálogo y el guardado
   - vista-permisos.js: panel «Permisos por rol» (la importación la conecta vista.js y la resuelve el modelo)
   Interfaz pública: { render, init, abrir, renderPermisos, guardar }. formulario/index.js llama a guardar con la
   acción 'user'.
   No usa el document global: `document` llega por env y es el del Shadow DOM del módulo. */
import { crearModeloUsuarios } from './modelo.js';
import { crearVistaUsuarios } from './vista.js';
import { crearVistaDialogosUsuarios } from './vista-dialogos.js';
import { crearVistaPermisos } from './vista-permisos.js';
import { crearControladorUsuarios } from './controlador.js';

export function nxUsuarios(env) {
  const { $, esc, includes, stateTag, empty, repo, labelRoles, document, input, select, openDialog, getModal, setModal,
    notify, render, hoyLocal, capabilities } = env;
  const modelo = crearModeloUsuarios(repo, { includes, hoyLocal, labelRoles, capabilities });
  const vista = crearVistaUsuarios({ $, esc, stateTag, empty, document });
  const datos = { adscripcionesDisponibles: modelo.adscripcionesDisponibles, categoriasDisponibles: modelo.categoriasDisponibles,
    carrerasDisponibles: modelo.carrerasDisponibles, esAcademico: modelo.esAcademico };
  const dialogos = crearVistaDialogosUsuarios({ $, esc, input, select, openDialog, labelRoles, document, hoyLocal, datos });
  const vistaPermisos = crearVistaPermisos({ $, esc, labelRoles, capabilities });
  const controlador = crearControladorUsuarios({ modelo, vista, dialogos, vistaPermisos, labelRoles, getModal, setModal, notify, renderTodo: render });

  return { render: controlador.render, init: controlador.init, abrir: controlador.abrir, renderPermisos: controlador.renderPermisos,
    guardar: controlador.guardar };
}
