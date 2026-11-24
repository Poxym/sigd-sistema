/* Inicio (panel de administración) · CONTROLADOR (ADR-006, MVC).
   Le pide al modelo el resumen y se lo da a la vista; responde a los clics abriendo una solicitud o navegando.
   Sin reglas de negocio ni acceso a datos. */
export function crearControladorInicio({ modelo, vista, abrirSolicitud, navigate, irConFiltro }) {
  // Una cifra lleva a su pantalla con su filtro de estado (lo pone app.js, que conoce las demás pantallas).
  function render() { vista.pintar(modelo.resumen(), abrirSolicitud, irConFiltro); }

  /* Botones «Ver todas»/«Ver periodos» del panel (se llama una vez al iniciar el módulo). */
  function init() {
    vista.alIr(navigate);
    // Cada inicio de sesión correcto se registra y el panel se vuelve a pintar con el nuevo conteo.
    vista.alIniciarSesion((cuenta) => { modelo.registrarAcceso(cuenta); render(); });
  }

  return { render, init };
}
