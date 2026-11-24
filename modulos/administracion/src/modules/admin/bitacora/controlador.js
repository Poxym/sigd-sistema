/* Bitácora de auditoría · CONTROLADOR (ADR-006, MVC).
   Recibe las acciones (buscar, filtrar, exportar), le pide los datos al modelo y le dice a la vista qué hacer.
   Sin reglas de negocio ni acceso a datos. */
export function crearControladorBitacora({ modelo, vista, notify }) {
  function render() {
    const { q, f } = vista.leerFiltros();
    vista.pintarFilas(modelo.filtrar(q, f));
  }

  function exportar() {
    vista.descargar(modelo.textoCSV(), modelo.nombreCSV);
    notify('Exportación CSV generada');
  }

  /* Conecta los controles de la pantalla (se llama una vez al iniciar el módulo). */
  function init() {
    vista.alExportar(exportar);
    vista.alFiltrar(render);
  }

  return { render, init, exportar };
}
