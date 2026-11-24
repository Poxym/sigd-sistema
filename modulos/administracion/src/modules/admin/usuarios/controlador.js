/* Usuarios y permisos · CONTROLADOR (ADR-006, MVC).
   - Lista: lee los filtros de la vista, le pide al modelo las cuentas y los conteos, y le dice a la vista qué pintar,
     en el mismo orden de antes: tarjetas, filas y botones. init() conecta la importación, los filtros y las opciones
     del filtro de rol, en ese orden.
   - Permisos por rol: recuerda el rol elegido mientras la página esté abierta (antes window._selectedPermissionRole)
     y, al marcar una casilla, le pide el cambio al modelo y avisa.
   - Importación: lee el archivo elegido y le pide al modelo que agregue las cuentas; luego guarda, repinta y avisa.
   - Diálogo y guardado: abre el diálogo (setModal antes de abrirlo) y guarda con el mismo orden de antes
     (usuarios/guardar.js): avisos, guardado, cierre del diálogo, repintado e historiales (pasos 10 y 11).
   Sin reglas de negocio ni acceso a datos. */
export function crearControladorUsuarios({ modelo, vista, dialogos, vistaPermisos, labelRoles, getModal, setModal, notify, renderTodo }) {
  let rolElegido;

  // ───── Lista ─────
  function render() {
    vista.pintarTarjetas(modelo.activosPorGrupo());
    const { q, r, s } = vista.leerFiltros();
    vista.pintarLista(modelo.filtrar(q, r, s), abrir);
  }

  function init() {
    vista.alImportar(importar);
    vista.alFiltrar(render);
    vista.agregarRoles(labelRoles);
  }

  // ───── Permisos por rol ─────
  function renderPermisos() {
    if (!vistaPermisos.pintarPanel(rolElegido, (rol) => { rolElegido = rol; dibujarPermisos(); })) return;
    dibujarPermisos();
  }
  function dibujarPermisos() {
    const role = vistaPermisos.rolActual(); if (!role) return;
    vistaPermisos.pintarCasillas(modelo.permisosDe(role), (cap, marcado) => { modelo.cambiarPermiso(role, cap, marcado); notify('Permisos del rol actualizados'); });
  }

  // ───── Importación desde CSV ─────
  async function importar(file) {
    try {
      const { added, skipped } = modelo.importarCSV(await file.text());
      if (added) { modelo.guardar(); renderTodo(); }
      notify(added + ' usuario(s) importados · ' + skipped + ' omitidos');
    } catch (err) { notify('No se pudo importar: ' + err.message) }
  }

  // ───── Diálogo ─────
  function abrir(id) {
    const u = modelo.cuenta(id);
    setModal('user', u?.id || null);
    dialogos.abrirUsuario(u);
  }

  // ───── Guardado (lo llama formulario/index.js con la acción 'user') ─────
  function guardar(f) {
    const modalItem = getModal().item;
    // Paso 1 · Categoría y carrera de docentes; motivo del cambio de carrera.
    let aviso = modelo.revisarDocente(f, modalItem); if (aviso) { notify(aviso); return }
    // Paso 4 · Fecha y motivo de los movimientos.
    aviso = modelo.revisarMovimiento(f, modalItem); if (aviso) { notify(aviso); return }
    // Paso 5 · Anotar el estado anterior para los historiales de los pasos 10 y 11.
    const antes = modelo.anotar(modalItem);
    // Pasos 6 y 7 · Administración general, número, correo, adscripción, vigencia y motivo.
    aviso = modelo.revisar(f, modalItem); if (aviso) { notify(aviso); return }
    // Paso 9 · Guardar la cuenta (ya no tiene avisos: los da el paso 6).
    modelo.guardarCuenta(f, modalItem);
    notify('Usuario guardado correctamente'); dialogos.cerrarDialogo(); renderTodo();
    // Pasos 10 y 11 · Historiales de adscripción y de carrera, y la base se guarda una vez.
    // Antes corrían «si la bitácora creció» y guardaban la base hasta tres veces; el paso 9 siempre la hace crecer.
    modelo.historialAdscripcion(f, antes);
    modelo.historialCarrera(f, modalItem, antes);
    modelo.guardar();
  }

  return { render, init, abrir, guardar, renderPermisos };
}
