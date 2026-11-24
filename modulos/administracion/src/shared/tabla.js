import { esc } from '../core/utilidades.js';

/* Fila de tabla para «sin resultados». */
export function empty(s){return `<tr><td colspan="9"><div class="empty"><i class="ti ti-search-off"></i><strong>No se encontraron registros</strong><span>${esc(s)}</span></div></td></tr>`}
