/* Catálogos académicos · CONTROLADOR (ADR-006, MVC).
   - Lista: guarda lo que la persona eligió (búsqueda, chip de estado y grupo), le pide al modelo los registros que tocan
     y le dice a la vista qué pintar, en el mismo orden de antes: navegación, cabecera y cuerpo (grupos, chips y lista).
   - Diálogo y guardado: abre el diálogo (setModal antes de abrirlo) y guarda con el mismo orden de antes
     (catalogos/guardar.js): avisos, guardado, cierre del diálogo, repintado e historial de relación (paso 10).
   Sin reglas de negocio ni acceso a datos. El tipo elegido vive en app.js (getType/setType). */
export function crearControladorCatalogos({ modelo, vista, dialogos, getType, setType, edit, getModal, setModal, notify, renderTodo }) {
  let q = '', estado = 'all', grupo = 'all', ligado = false;

  // ───── Lista ─────
  function pintarCuerpo() {
    const t = getType(), todos = modelo.registros(t);
    // grupo de opciones (solo en «Opciones de captura»)
    if (t === 'opciones') {
      const gs = modelo.grupos(t);
      if (!gs.includes(grupo)) grupo = 'all';
      vista.pintarGrupos(todos.length, gs.map(g => [g, modelo.enGrupo(t, g)]), grupo);
    } else grupo = 'all';

    const base = modelo.filtrar(t, q, grupo);
    vista.pintarChips(estado, e => modelo.conEstado(base, e).length);
    const vis = modelo.conEstado(base, estado);
    vista.pintarLista(t, todos.length, vis, t === 'opciones' && grupo === 'all', r => modelo.padre(t, r));
  }

  /* ---------- eventos (se enlazan una sola vez) ---------- */
  function limpia() { q = ''; estado = 'all'; grupo = 'all'; vista.ponerBusqueda(''); }
  function cambia(tipo) { setType(tipo); limpia(); render(); }
  function enlaza() {
    ligado = true;
    vista.alEventos({
      alElegirTipo: cambia,
      alBuscar: v => { q = v; pintarCuerpo(); },
      alElegirEstado: v => { estado = v; pintarCuerpo(); },
      alElegirGrupo: v => { grupo = v; pintarCuerpo(); },
      alNuevo: () => edit(),
      alLimpiar: () => { limpia(); pintarCuerpo(); },
      alEditar: id => edit(id),
    });
  }

  function render() { if (!ligado) enlaza(); vista.pintarNav(getType(), k => modelo.registros(k).length); vista.pintarCabecera(getType()); pintarCuerpo(); }
  /* Mostrar un tipo (opcionalmente ya buscando algo): lo usa el buscador rápido */

  // ───── Diálogo ─────
  function abrir(id) {
    const catalogType = getType(), r = modelo.registro(catalogType, id);
    setModal('catalog', r?.id || null);
    dialogos.abrirCatalogo(catalogType, r);
  }

  // ───── Guardado (lo llama formulario/index.js con la acción 'catalog') ─────
  // f = lo enviado; releer() vuelve a leer el formulario (el paso 2 lo necesita tras agregar un grupo nuevo).
  function guardar(f, releer) {
    const modalItem = getModal().item, catalogType = getType();
    let aviso;
    // Paso 2 · Opciones de captura. Con «Nuevo grupo…» se agrega el grupo al formulario y se quita el campo
    // groupCustom; por eso al final se vuelve a leer f (así lo veían los pasos siguientes).
    if (catalogType === 'opciones') {
      if (f.group === '__NEW__') {
        aviso = modelo.revisarGrupoNuevo(f); if (aviso) { notify(aviso); return }
        const custom = modelo.grupoNuevo(f);
        dialogos.agregarGrupo(custom);
        f.group = custom;
      }
      aviso = modelo.revisarOpcion(f, modalItem); if (aviso) { notify(aviso); return }
      f = releer();
    }
    // Paso 4 · Fecha y motivo del cambio de relación académica.
    aviso = modelo.revisarRelacion(f, modalItem, catalogType); if (aviso) { notify(aviso); return }
    // Paso 5 · Anotar el estado anterior para el historial del paso 10.
    const antes = modelo.anotar(modalItem, catalogType);
    // Pasos 6, 7 y 8 · Respaldo, clave, relación, dependencias, vigencia y parámetro.
    aviso = modelo.revisar(f, modalItem, catalogType); if (aviso) { notify(aviso); return }
    // Paso 9 · Guardar el registro (ya no tiene avisos: los da el paso 6).
    modelo.guardarRegistro(f, modalItem, catalogType);
    notify('Registro guardado'); dialogos.cerrarDialogo(); renderTodo();
    // Paso 10 · Historial de relación académica, y la base se guarda una vez.
    // Antes corría «si la bitácora creció» y guardaba la base dos veces; el paso 9 siempre la hace crecer.
    modelo.historialRelacion(f, antes);
    modelo.guardar();
  }

  return { render, abrir, guardar };
}
