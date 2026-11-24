/* Bitácora de auditoría · VISTA (ADR-006, MVC).
   Solo pinta la tabla, entrega un archivo para descargar y avisa de eventos; nunca toca la base ni el repositorio.
   El HTML que genera es el mismo de antes (movido sin cambios desde bitacora/index.js).
   Importante: aquí no se usa `document` global; todo pasa por $ y el document del Shadow DOM del módulo. */
export function crearVistaBitacora({ $, esc, fmt, empty, document }) {
  /* Lo que la persona escribió en la búsqueda y eligió en el filtro. */
  const leerFiltros = () => ({ q: $('auditSearch').value, f: $('auditFilter').value });

  /* Pinta las filas que recibe (o el mensaje de tabla vacía). */
  function pintarFilas(arr) {
    $('auditRows').innerHTML=arr.map(a=>`<tr><td>${fmt(a.date)}</td><td>${esc(a.user)}</td><td><span class="status neutral">${esc(a.kind)}</span></td><td><span class="cell-strong">${esc(a.detail)}</span>${a.oldVal||a.newVal?`<span class="cell-sub">${esc(a.oldVal)} ${a.oldVal?'→':''} ${esc(a.newVal)}</span>`:''}</td></tr>`).join('')||empty('Todavía no hay movimientos registrados')
  }

  /* Entrega «texto» como archivo descargable llamado «nombre». */
  function descargar(texto, nombre) {
    let url=URL.createObjectURL(new Blob([texto],{type:'text/csv;charset=utf-8'})),a=document.createElement('a');a.href=url;a.download=nombre;a.click();setTimeout(()=>URL.revokeObjectURL(url),1200);
  }

  /* Avisa del clic en «Exportar» y de los cambios en la búsqueda o el filtro. */
  function alExportar(fn) { $('exportAudit').onclick = fn; }
  function alFiltrar(fn) { ['auditSearch', 'auditFilter'].forEach((id) => $(id).addEventListener(id === 'auditSearch' ? 'input' : 'change', fn)); }

  return { leerFiltros, pintarFilas, descargar, alExportar, alFiltrar };
}
