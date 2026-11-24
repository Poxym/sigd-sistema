/* Pantalla «Solicitudes de cambio» (lista–detalle, Material Design 3) en MVC (ADR-006, Fase 2).
   Esta fábrica solo conecta las piezas:
   - modelo.js: reglas de registrar y gestionar, lista filtrada y datos para los diálogos (todo por el repositorio)
   - vista.js: lista, detalle y avance · vista-dialogos.js: diálogos «Registrar solicitud» y «Seguimiento de cambio»
   - controlador.js: solicitud elegida, apertura de diálogos y guardado (mismo orden de avisos que antes)
   HTML de la pantalla en solicitudes/vista.html; el de los diálogos, en vista-dialogos.js.
   Interfaz pública: { render, abrirNueva, abrirDetalle, registrar, gestionar }. formulario/index.js llama a
   registrar/gestionar según la acción del diálogo abierto.
   Importante: aquí no se usa `document` global; todo pasa por env ($ y document del Shadow DOM del módulo). */
import { crearModeloSolicitudes } from './modelo.js';
import { crearVistaSolicitudes } from './vista.js';
import { crearVistaDialogosSolicitudes } from './vista-dialogos.js';
import { crearControladorSolicitudes } from './controlador.js';

export function nxSolicitudes(env) {
  const { $, esc, includes, repo, open, displayDate, stateTag, types, v39TypeCatalog, select, openDialog, setModal, getModal,
    notify, render, document, hoyLocal, esFechaValida, fechaLegible } = env;
  const modelo = crearModeloSolicitudes(repo, { includes, types, hoyLocal, esFechaValida, fechaLegible });
  const vista = crearVistaSolicitudes({ $, esc, stateTag, displayDate });
  const datos = { tiposDisponibles: modelo.tiposDisponibles, registrosDe: modelo.registrosDe, registro: modelo.registro };
  const dialogos = crearVistaDialogosSolicitudes({ $, esc, stateTag, select, openDialog, v39TypeCatalog, document, hoyLocal, fechaLegible, datos });
  const controlador = crearControladorSolicitudes({ modelo, vista, dialogos, abrir: open, notify, renderTodo: render, getModal, setModal });

  return { render: controlador.render, abrirNueva: controlador.abrirNueva, abrirDetalle: controlador.abrirDetalle,
    registrar: controlador.registrar, gestionar: controlador.gestionar };
}
