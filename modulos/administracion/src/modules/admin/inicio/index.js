/* Inicio: panel de administración (indicadores, pendientes, periodos vigentes).
   En MVC (ADR-006, Fase 2). Esta fábrica solo conecta las tres piezas:
   - modelo.js: conteos y pendientes (lee por el repositorio)   - vista.js: pinta y avisa de los clics
   - controlador.js: pasa el resumen a la vista; abre una solicitud o navega con funciones del entorno
   La interfaz pública no cambia ({ render, init }).
   env = { $, esc, stateTag, fechaDMA, hoyLocal, repo, abrirSolicitud, navigate, irConFiltro, document }. */
import { crearModeloInicio } from './modelo.js';
import { crearVistaInicio } from './vista.js';
import { crearControladorInicio } from './controlador.js';

export function nxInicio(env) {
  const { $, esc, stateTag, fechaDMA, hoyLocal, repo, abrirSolicitud, navigate, irConFiltro, document } = env;
  const modelo = crearModeloInicio(repo, { hoyLocal });
  const vista = crearVistaInicio({ $, esc, stateTag, fechaDMA, document });
  const controlador = crearControladorInicio({ modelo, vista, abrirSolicitud, navigate, irConFiltro });

  return { render: controlador.render, init: controlador.init };
}
