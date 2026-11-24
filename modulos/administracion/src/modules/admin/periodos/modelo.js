/* Periodos de captura · MODELO (ADR-006, MVC).
   Reglas de negocio del periodo: validaciones, detección de cambios y guardado con bitácora e historial.
   Accede a los datos SOLO por el repositorio (repo.periodos, repo.bitacora, repo.guardarTodo); no conoce la pantalla.
   Las reglas y los textos son los mismos de antes (movidos desde la función guardar de periodos/index.js).
   «d» es lo que la vista leyó del formulario: { semester, activityStart, activityEnd, cycle, planStart, planEnd,
   planState, reportStart, reportEnd, reportState }. */
const CAMPOS_VENTANA = ['planStart', 'planEnd', 'planState', 'reportStart', 'reportEnd', 'reportState'];

export function crearModeloPeriodos(repo) {
  const periodo = () => repo.periodos.actual();
  const historial = () => repo.periodos.historial();

  /* 1) Semestre y fechas académicas. Devuelve el aviso, o null si todo está bien. */
  function validarAcademico(d) {
    const semester = d.semester, from = d.activityStart, to = d.activityEnd;
    if (!!from !== !!to) return 'Indica ambas fechas del periodo académico o deja ambas vacías';
    if (from && to && to < from) return 'El cierre del periodo académico debe ser posterior al inicio';
    if (!semester) return 'Selecciona el semestre A o B del ciclo escolar';
    return null;
  }

  /* 2) Ciclo y cierre de captura (después de los campos obligatorios, que revisa la vista). */
  function validarVentanas(d) {
    if (!/^\d{4}-[A-Za-z0-9]+$/.test(d.cycle.trim())) return 'Introduce un identificador válido del ciclo escolar';
    if (d.planEnd < d.planStart || d.reportEnd < d.reportStart) return 'El cierre de captura no puede preceder al inicio';
    return null;
  }

  /* 3) ¿Qué cambió? ventana: fechas o estados de captura (o el ciclo); academico: semestre o periodo académico. */
  function cambios(d) {
    const p = periodo();
    const previous = { semester: p.semester || '', activityStart: p.activityStart || '', activityEnd: p.activityEnd || '' };
    const academico = previous.semester !== d.semester || previous.activityStart !== d.activityStart || previous.activityEnd !== d.activityEnd;
    const before = JSON.stringify({ cycle: p.cycle, planStart: p.planStart, planEnd: p.planEnd, planState: p.planState, reportStart: p.reportStart, reportEnd: p.reportEnd, reportState: p.reportState });
    const now = JSON.stringify({ cycle: d.cycle.trim(), planStart: d.planStart, planEnd: d.planEnd, planState: d.planState, reportStart: d.reportStart, reportEnd: d.reportEnd, reportState: d.reportState });
    return { ventana: before !== now, academico, previous };
  }

  /* 4a) Guarda la ventana de captura: se MEZCLA con el periodo vigente (se conservan semestre y fechas académicas)
     y se registra en bitácora. Devuelve «prior» para registrarHistorialVentana. */
  function guardarVentana(d) {
    const prior = JSON.stringify(periodo());
    const p = { cycle: d.cycle.trim() };
    CAMPOS_VENTANA.forEach((k) => p[k] = d[k]);
    const old = JSON.stringify(periodo());
    repo.periodos.actualizar(p);
    repo.bitacora.registrar('Periodo', 'Actualización de ventanas de captura', old, JSON.stringify(p));
    repo.guardarTodo();
    return { prior };
  }

  /* 4b) Si el periodo cambió respecto a «prior», lo anota en el historial. Devuelve si lo anotó. */
  function registrarHistorialVentana(prior) {
    if (JSON.stringify(periodo()) === prior) return false;
    repo.periodos.agregarAlHistorial({ date: new Date().toISOString(), cycle: periodo().cycle, summary: 'Actualización de fechas o estados de captura' });
    repo.guardarTodo();
    return true;
  }

  /* 5) Guarda el semestre y el periodo académico, con su bitácora y su historial. */
  function guardarAcademico(d, previous) {
    const nuevo = { semester: d.semester, activityStart: d.activityStart, activityEnd: d.activityEnd };
    repo.periodos.actualizar(nuevo);
    repo.bitacora.registrar('Periodo', 'Actualización de semestre y periodo académico reportado', JSON.stringify(previous), JSON.stringify(nuevo));
    repo.periodos.agregarAlHistorial({ date: new Date().toISOString(), cycle: periodo().cycle, summary: 'Actualización del semestre y fechas académicas de referencia' });
    repo.guardarTodo();
  }

  return { periodo, historial, validarAcademico, validarVentanas, cambios, guardarVentana, registrarHistorialVentana, guardarAcademico };
}
