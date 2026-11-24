/* Periodos de captura: ventanas de Plan de Trabajo e Informe de Actividades, semestre y periodo académico.
   Primera pantalla en MVC (ADR-006, Fase 2). Esta fábrica solo conecta las tres piezas:
   - modelo.js: reglas y datos (por el repositorio)   - vista.js: pinta y avisa   - controlador.js: orden de los pasos
   La interfaz pública no cambia ({ init, llenar, guardar, renderHistorial, renderResumen }), así que app.js la usa
   igual que antes. env = { $, esc, stateTag, notify, repo, render }. */
import { crearModeloPeriodos } from './modelo.js';
import { crearVistaPeriodos } from './vista.js';
import { crearControladorPeriodos } from './controlador.js';

export function nxPeriodos(env) {
  const { $, esc, stateTag, notify, repo, render } = env;
  const modelo = crearModeloPeriodos(repo);
  const vista = crearVistaPeriodos({ $, esc, stateTag });
  const controlador = crearControladorPeriodos({ modelo, vista, notify, render });

  return {
    init: controlador.init,
    llenar: controlador.llenar,
    guardar: controlador.guardar,
    renderHistorial: controlador.pintarHistorial,
    renderResumen: controlador.pintarResumen,
  };
}
