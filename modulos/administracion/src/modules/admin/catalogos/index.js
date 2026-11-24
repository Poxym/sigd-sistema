/* Pantalla «Catálogos académicos» (lista–detalle, Material Design 3) en MVC (ADR-006, Fase 2).
   Esta fábrica solo conecta las piezas:
   - modelo.js: registros, padre, búsqueda, grupos y estado; datos para el diálogo y todas las reglas del guardado
     (todo por el repositorio)
   - vista.js: navegación por tipos, cabecera, chips y lista · vista-dialogos.js: diálogo «Nuevo / Editar registro»
     y sus historiales
   - controlador.js: lo elegido en la lista, el orden de pintado, la apertura del diálogo y el guardado
   HTML de la pantalla en catalogos/vista.html; el del diálogo, en vista-dialogos.js.
   Interfaz pública: { render, abrir, guardar }. formulario/index.js llama a guardar con la acción 'catalog'.
   Importante: aquí no se usa `document` global; todo pasa por env ($ y document del Shadow DOM del módulo). */
import { crearModeloCatalogos } from './modelo.js';
import { crearVistaCatalogos } from './vista.js';
import { crearVistaDialogosCatalogos } from './vista-dialogos.js';
import { crearControladorCatalogos } from './controlador.js';

export function nxCatalogos(env) {
  const { $, esc, includes, types, repo, stateTag, getType, setType, edit, getModal, setModal, notify, render, document,
    input, select, openDialog, hoyLocal, fechaLegible, v41SeedOptions, v41FormatPlan, v41FormatReport } = env;
  const modelo = crearModeloCatalogos(repo, { includes, types, hoyLocal, v41SeedOptions });
  const vista = crearVistaCatalogos({ $, esc, stateTag, types });
  const datos = { relacionesDisponibles: modelo.relacionesDisponibles, gruposDelDialogo: modelo.gruposDelDialogo };
  const dialogos = crearVistaDialogosCatalogos({ $, esc, input, select, openDialog, types, document, hoyLocal, fechaLegible, v41FormatPlan, v41FormatReport, datos });
  const controlador = crearControladorCatalogos({ modelo, vista, dialogos, getType, setType, edit, getModal, setModal, notify, renderTodo: render });

  return { render: controlador.render, abrir: controlador.abrir, guardar: controlador.guardar };
}
