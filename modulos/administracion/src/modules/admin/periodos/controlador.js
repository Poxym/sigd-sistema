/* Periodos de captura · CONTROLADOR (ADR-006, MVC).
   Recibe la acción («Guardar»), le pide al modelo que valide y guarde, y le dice a la vista qué pintar.
   No tiene reglas de negocio ni toca datos. Conserva el orden exacto de antes, porque los avisos se ven en orden:
   1) semestre y fechas académicas  2) campos obligatorios  3) ciclo y cierre de captura  4) ¿hay cambios?
   5) ventana de captura: guardar, avisar, repintar, historial  6) semestre y periodo académico. */
export function crearControladorPeriodos({ modelo, vista, notify, render }) {
  const pintarHistorial = () => vista.renderHistorial(modelo.historial());
  const pintarResumen = () => vista.renderResumen(modelo.periodo());
  const llenar = () => vista.llenar(modelo.periodo());

  function guardar() {
    const d = vista.leerFormulario();
    let aviso = modelo.validarAcademico(d);
    if (aviso) { notify(aviso); return }
    if (!vista.formularioValido()) return;
    aviso = modelo.validarVentanas(d);
    if (aviso) { notify(aviso); return }
    const c = modelo.cambios(d);
    if (!c.academico && !c.ventana) { notify('No hay cambios pendientes por guardar'); return }
    if (c.ventana) {
      const { prior } = modelo.guardarVentana(d);
      notify('Configuración guardada'); render();
      if (modelo.registrarHistorialVentana(prior)) { pintarHistorial(); pintarResumen(); }
      // Se conserva de antes: tras repintar, el formulario ya trae datos válidos, así que en la práctica no corta.
      if (!vista.formularioSigueValido()) return;
    }
    if (c.academico) {
      modelo.guardarAcademico(d, c.previous);
      render(); notify('Periodo académico actualizado');
    }
  }

  function init() { vista.alGuardar(guardar); }

  return { init, llenar, guardar, pintarHistorial, pintarResumen };
}
