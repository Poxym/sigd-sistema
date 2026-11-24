/* Solicitudes de cambio · CONTROLADOR (ADR-006, MVC).
   Recibe las acciones (elegir, abrir un diálogo, registrar, gestionar), le pide al modelo que revise y guarde, y le
   dice a la vista qué pintar. Sin reglas de negocio ni acceso a datos.
   El orden de avisos, guardados, cierre del diálogo y repintado es el mismo de antes (solicitudes/guardar.js):
   revisar → anotar el tamaño de la bitácora → guardar (paso 9: aviso, guardar, cerrar, repintar) → paso 10. */
export function crearControladorSolicitudes({ modelo, vista, dialogos, abrir, notify, renderTodo, getModal, setModal }) {
  let selId = null;

  // ───── Lista y detalle ─────
  function render() {
    const { q, f } = vista.leerFiltros();
    const list = modelo.filtrar(q, f);
    // Si la elegida ya no está en la lista (otro filtro o búsqueda), se elige la primera.
    if (!list.some(r => r.id === selId)) selId = list[0]?.id ?? null;
    vista.pintarLista(list, selId, elegir);
    vista.pintarDetalle(modelo.buscar(selId), abrir);
  }

  function elegir(id) { selId = id; render(); vista.anunciarSeleccion(modelo.buscar(id)); vista.enfocarDetalle(); }

  // ───── Diálogos ─────
  function abrirNueva() { setModal('request', null); dialogos.abrirRegistro(); }

  function abrirDetalle(id) {
    const r = modelo.buscar(id); if (!r) return;
    setModal('requestAction', id);
    dialogos.abrirSeguimiento(r);
  }

  // ───── Guardado (lo llama formulario/index.js según la acción del diálogo) ─────
  function registrar(f) {
    let aviso = modelo.revisarNueva(f);
    if (aviso) { notify(aviso); return }
    // Paso 9 · Guardar la solicitud. (El antiguo paso 10 volvía a guardar la base si la bitácora creció; ya se
    // había guardado aquí, así que no hacía nada nuevo.)
    aviso = modelo.registrarNueva(f);
    if (aviso) notify(aviso);
    else { notify('Solicitud registrada, pendiente de autorización'); modelo.guardar(); dialogos.cerrarDialogo(); renderTodo(); }
  }

  function gestionar(f) {
    const modalItem = getModal().item;
    let aviso = modelo.revisarGestion(f, modalItem);
    if (aviso) { notify(aviso); return }
    // Paso 9 · Guardar la transición. (Los antiguos pasos 5 y 10 anotaban el tamaño de la bitácora y volvían a
    // guardar la base si creció; ya se había guardado aquí, así que no hacían nada nuevo.)
    aviso = modelo.ejecutarGestion(f, modalItem);
    if (aviso) notify(aviso);
    else { notify('Estado de la solicitud actualizado'); modelo.guardar(); dialogos.cerrarDialogo(); renderTodo(); }
  }

  return { render, abrirNueva, abrirDetalle, registrar, gestionar };
}
