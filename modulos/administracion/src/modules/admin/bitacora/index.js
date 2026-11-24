/* Bitácora de auditoría: consulta, búsqueda, filtro por tipo de acción y exportación a CSV.
   En MVC (ADR-006, Fase 2). Esta fábrica solo conecta las tres piezas:
   - modelo.js: qué entradas coinciden y formato del CSV (lee por el repositorio)
   - vista.js: pinta la tabla, entrega el archivo y avisa de eventos   - controlador.js: responde a las acciones
   La interfaz pública no cambia ({ render, init }). env = { $, esc, includes, fmt, empty, repo, notify, document }. */
import { crearModeloBitacora } from './modelo.js';
import { crearVistaBitacora } from './vista.js';
import { crearControladorBitacora } from './controlador.js';

export function nxBitacora(env) {
  const { $, esc, includes, fmt, empty, repo, notify, document } = env;
  const modelo = crearModeloBitacora(repo, { includes, fmt });
  const vista = crearVistaBitacora({ $, esc, fmt, empty, document });
  const controlador = crearControladorBitacora({ modelo, vista, notify });

  return { render: controlador.render, init: controlador.init };
}
