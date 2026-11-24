/* Inicio (panel de administración) · VISTA (ADR-006, MVC).
   Solo pinta lo que recibe y avisa de los clics; nunca toca la base ni el repositorio.
   El HTML que genera es el mismo de antes (movido sin cambios desde inicio/index.js).
   Importante: aquí no se usa `document` global; todo pasa por $ y el document del Shadow DOM del módulo. */
export function crearVistaInicio({ $, esc, stateTag, fechaDMA, document }) {

  /* Pinta el panel. «alAbrirSolicitud(id)» se llama al hacer clic en un pendiente; «alIrCifra(seccion, estado)», al
     hacer clic en una cifra (lleva a su pantalla con ese filtro de estado). */
  function pintar({ conteos, pendientes, periodo }, alAbrirSolicitud, alIrCifra) {
   // Orden de prioridad: primero lo que hay que atender, después el inventario. «ir»/«estado»: a dónde lleva la cifra;
   // «tipo» da el color del ícono (antes dependía de la posición, con :nth-child). «Accesos hoy» no lleva a ninguna pantalla.
   const indicators=[
    {n:conteos.porAutorizar,label:'Por autorizar',sub:'Solicitudes en revisión',icon:'ti-file-alert',tipo:'is-autorizar',ir:'solicitudes',estado:'pendiente'},
    {n:conteos.porAplicar,label:'Por aplicar',sub:'Cambios autorizados',icon:'ti-clock-check',tipo:'is-aplicar',ir:'solicitudes',estado:'autorizada'},
    {n:conteos.activos,label:'Usuarios activos',sub:'Cuentas habilitadas',icon:'ti-users',ir:'usuarios',estado:'Activo'},
    {n:conteos.vigentes,label:'Catálogos vigentes',sub:'Registros institucionales',icon:'ti-folders',ir:'catalogos'},
    {n:conteos.accesosHoy,label:'Accesos hoy',sub:'Accesos registrados',icon:'ti-login-2'}
   ];
   const contenido=x=>`<span class="home-indicator-icon"><i class="ti ${x.icon}" aria-hidden="true"></i></span><div><span class="home-indicator-label">${x.label}</span><strong class="home-indicator-number">${Number(x.n).toLocaleString('es-MX')}</strong><span class="home-indicator-hint">${x.sub}</span></div>`;
   $('homeSummaryGrid').innerHTML=indicators.map(x=>x.ir
    ?`<button class="home-indicator ${x.tipo||''}" type="button" data-home-go="${x.ir}" data-home-estado="${x.estado||''}">${contenido(x)}</button>`
    :`<div class="home-indicator ${x.tipo||''}">${contenido(x)}</div>`).join('');
   document.querySelectorAll('[data-home-go]').forEach(b=>b.onclick=()=>alIrCifra(b.dataset.homeGo,b.dataset.homeEstado));
   $('homeCycleText').textContent='Seguimiento institucional · Ciclo '+periodo.cycle;
   $('homePeriodCycle').textContent='Ciclo escolar '+periodo.cycle;
   const tasks=pendientes;
   $('homeTasks').innerHTML=tasks.length?tasks.map(r=>`<button class="home-task" type="button" data-home-request="${r.id}"><span class="home-task-icon ${r.status==='autorizada'?'approved':''}"><i class="ti ${r.status==='autorizada'?'ti-check':'ti-clock-exclamation'}"></i></span><span class="home-task-main"><strong>${esc(r.title)}</strong><span>${esc(r.authority)} · ${r.status==='autorizada'?'Autorizada, pendiente de aplicación':'Pendiente de autorización'}</span></span><i class="ti ti-chevron-right home-task-arrow"></i></button>`).join(''):`<div class="home-empty"><i class="ti ti-circle-check"></i><strong>Sin pendientes administrativos</strong><span>Las solicitudes nuevas aparecerán aquí.</span></div>`;
   document.querySelectorAll('[data-home-request]').forEach(b=>b.onclick=()=>alAbrirSolicitud(Number(b.dataset.homeRequest)));
   const periods=[['Plan de Trabajo',periodo.planStart,periodo.planEnd,periodo.planState],['Informe de Actividades',periodo.reportStart,periodo.reportEnd,periodo.reportState]];
   $('homePeriodList').innerHTML=periods.map(x=>`<div class="home-period"><span class="home-period-icon"><i class="ti ti-calendar-event"></i></span><div class="home-period-content"><strong>${x[0]}</strong><span>${fechaDMA(x[1])} – ${fechaDMA(x[2])}</span></div>${stateTag(x[3])}</div>`).join('');
  }

  /* Botones «Ver todas»/«Ver periodos»: avisan con la sección a la que llevan. */
  function alIr(fn) {
    document.querySelectorAll('#view-inicio [data-go]').forEach(b=>b.onclick=()=>fn(b.dataset.go));
  }

  /* Avisa cuando el marco anuncia un inicio de sesión correcto (evento «sigd:sesion-iniciada» con la cuenta). */
  function alIniciarSesion(fn) {
    document.addEventListener('sigd:sesion-iniciada', (e) => fn(e.detail?.cuenta));
  }

  return { pintar, alIr, alIniciarSesion };
}
