/* Periodos de captura · VISTA (ADR-006, MVC).
   Solo pinta y avisa de eventos: recibe los datos ya leídos (periodo, historial) y nunca toca la base ni el
   repositorio. El HTML que genera es el mismo de antes (movido sin cambios desde periodos/index.js).
   Importante: aquí no se usa `document` global; todo pasa por $ (Shadow DOM del módulo). */
export function crearVistaPeriodos({ $, esc, stateTag }) {

  /* Pinta el historial de configuración. */
  function renderHistorial(historial) {
   const el=$('periodHistoryPanel');if(!el)return;
   const items=(historial||[]).slice(0,8);
   const dateParts=value=>{const d=new Date(value);if(!Number.isFinite(d.getTime()))return {date:'Fecha no disponible',time:''};return {date:d.toLocaleDateString('es-MX',{day:'2-digit',month:'short',year:'numeric'}),time:d.toLocaleTimeString('es-MX',{hour:'2-digit',minute:'2-digit'})}};
   el.innerHTML=`<div class="surface-head period-history-heading"><div><h3>Historial de configuración</h3><small>Últimas modificaciones del ciclo</small></div><span class="status neutral">${historial.length} ${historial.length===1?'cambio':'cambios'}</span></div>${items.length?`<div class="period-history-list" role="list">${items.map(x=>{const when=dateParts(x.date);return `<article class="period-history-entry" role="listitem"><div class="period-history-entry-top"><span class="period-history-date">${esc(when.date)} <span class="period-history-hour">· ${esc(when.time)}</span></span><span class="period-history-cycle">${esc(x.cycle||'Sin ciclo')}</span></div><p>${esc(x.summary||'Actualización de configuración')}</p></article>`}).join('')}</div>`:'<p class="muted period-history-empty">Sin modificaciones registradas.</p>'}`;
  }

  /* Pinta el resumen de ventanas y las insignias de estado. */
  function renderResumen(periodo) {
   const list=$('periodOverviewList');
   if(!list) return;
   const p=periodo;
   const items=[
    {title:'Plan de Trabajo',icon:'ti-file-pencil',state:p.planState,start:p.planStart,end:p.planEnd,note:'Ventana activa para la captura de planeación académica.'},
    {title:'Informe de Actividades',icon:'ti-file-check',state:p.reportState,start:p.reportStart,end:p.reportEnd,note:'Ventana activa para el reporte institucional del periodo.'}
   ];
   const formatDate=v=>{if(!v) return 'Sin fecha';const [y,m,d]=String(v).split('-');return y&&m&&d?`${d}/${m}/${y}`:String(v)};
   list.innerHTML=items.map(it=>`<div class="period-overview-item"><div class="period-overview-item-head"><strong>${it.title}</strong>${stateTag(it.state)}</div><div class="period-overview-dates"><i class="ti ti-calendar-event"></i><span>${formatDate(it.start)} – ${formatDate(it.end)}</span></div><div class="period-overview-note">${it.note}</div></div>`).join('');
   const planPreview=$('planStatePreview'), reportPreview=$('reportStatePreview');
   if(planPreview) planPreview.innerHTML=stateTag(p.planState);
   if(reportPreview) reportPreview.innerHTML=stateTag(p.reportState);
  }

  /* Llena el formulario con el periodo que recibe. */
  function llenar(periodo) {
    let p = periodo;
    ['cycle', 'planStart', 'planEnd', 'planState', 'reportStart', 'reportEnd', 'reportState'].forEach((k) => $(k === 'cycle' ? 'cycleName' : k).value = p[k]);
    if ($('cycleBadge')) $('cycleBadge').textContent = p.cycle || 'Sin configurar';
    renderResumen(periodo);
    $('v41Semester').value = periodo.semester || '';
    $('v41AcademicStart').value = periodo.activityStart || '';
    $('v41AcademicEnd').value = periodo.activityEnd || '';
  }

  /* Lee el formulario tal como está (sin recortar ni validar: eso es del modelo). */
  function leerFormulario() {
    return {
      semester: $('v41Semester').value, activityStart: $('v41AcademicStart').value, activityEnd: $('v41AcademicEnd').value,
      cycle: $('cycleName').value,
      planStart: $('planStart').value, planEnd: $('planEnd').value, planState: $('planState').value,
      reportStart: $('reportStart').value, reportEnd: $('reportEnd').value, reportState: $('reportState').value,
    };
  }

  /* Campos obligatorios: reportValidity() muestra las burbujas del navegador; checkValidity() solo revisa. */
  const formularioValido = () => $('periodForm').reportValidity();
  const formularioSigueValido = () => $('periodForm').checkValidity();

  /* Avisa del clic en «Guardar». */
  function alGuardar(fn) { $('savePeriods').onclick = fn; }

  return { renderHistorial, renderResumen, llenar, leerFormulario, formularioValido, formularioSigueValido, alGuardar };
}
