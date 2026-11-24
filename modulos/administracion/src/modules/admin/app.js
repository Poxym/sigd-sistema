/* Módulo Administración (NEXORA) dentro del SIGD: pantallas, formularios y reglas de captura.
   El núcleo (utilidades, semilla, almacén, notificación) vive en src/core y src/shared. */
import { NXD } from '../../config/dominio.js';
import { esc, includes, fmt, idOf, stateTag, hoyLocal, esFechaValida, fechaLegible, fechaDMA } from '../../core/utilidades.js';
import { crearAlmacenLocal } from './repositorio/almacen-local.js';
import { crearRepositorio } from './repositorio/index.js';
import { crearPreferencias } from './repositorio/preferencias.js';
import { crearNotify } from '../../shared/notificacion.js';
import { nxChips } from '../../shared/chips.js';
import { nxSolicitudes } from './solicitudes/index.js';
import { nxCatalogos } from './catalogos/index.js';
import { nxBitacora } from './bitacora/index.js';
import { nxPeriodos } from './periodos/index.js';
import { nxInicio } from './inicio/index.js';
import { nxUsuarios } from './usuarios/index.js';
import { nxFormulario } from './formulario/index.js';
import { empty } from '../../shared/tabla.js';

/* Aplicación del módulo. Recibe un `document` propio que apunta a su Shadow DOM, así no choca con el marco. */
export function nxApp(document) {
'use strict';
const { labelRoles, types, v39TypeCatalog, capabilities, v41SeedOptions, v41FormatPlan, v41FormatReport } = NXD;
const $=id=>document.getElementById(id);
const repo = crearRepositorio(crearAlmacenLocal());
const preferencias = crearPreferencias();
const notify = crearNotify($, document);

let view='inicio',catalogType='campus',modalAction=null,modalItem=null;
function navigate(next){view=next;document.querySelectorAll('.view').forEach(v=>v.classList.toggle('active',v.id==='view-'+next));document.querySelectorAll('.nav-btn').forEach(b=>{let on=b.dataset.view===next;b.classList.toggle('active',on);if(on)b.setAttribute('aria-current','page');else b.removeAttribute('aria-current')});$('mastTrail').textContent=({inicio:'Inicio',solicitudes:'Solicitudes',catalogos:'Catálogos',usuarios:'Usuarios',periodos:'Periodos',bitacora:'Bitácora'})[next];$('mastTitle').textContent=({inicio:'Resumen general',solicitudes:'Solicitudes de cambio',catalogos:'Catálogos académicos',usuarios:'Usuarios y permisos',periodos:'Periodos de captura',bitacora:'Bitácora de auditoría'})[next];$('shell').classList.remove('mobile-open');window.scrollTo({top:0,behavior:'smooth'});render()}
document.querySelectorAll('.nav-btn').forEach(b=>b.onclick=()=>navigate(b.dataset.view));function updateSidebar(){const folded=$('shell').classList.contains('collapsed');const control=$('collapse');control.setAttribute('aria-expanded',String(!folded));control.setAttribute('aria-label',folded?'Expandir menú lateral':'Contraer menú lateral');control.title=folded?'Expandir menú':'Contraer menú';$('sidebarToggle').setAttribute('aria-expanded',String($('shell').classList.contains('mobile-open')));document.querySelectorAll('.nav-btn').forEach(b=>b.setAttribute('aria-label',b.title));}
function toggleSidebar(){if(window.innerWidth<=920){$('shell').classList.toggle('mobile-open')}else{$('shell').classList.toggle('collapsed');preferencias.guardarMenuLateralPlegado($('shell').classList.contains('collapsed'))}updateSidebar()}
$('sidebarToggle').onclick=toggleSidebar;$('collapse').onclick=toggleSidebar;$('shade').onclick=()=>{$('shell').classList.remove('mobile-open');updateSidebar()};
if(preferencias.menuLateralPlegado())$('shell').classList.add('collapsed');updateSidebar();window.addEventListener('resize',updateSidebar);
function render(){renderHome();renderRequests();renderCatalogs();renderUsers();renderAudit();if(view==='periodos')fillPeriods();nxChips({$},['requestFilter','userStatus','auditFilter']);renderPermissionPanel();renderPeriodHistory();renderPeriodOverview()}
function renderHome(){inicio().render()}
/* Pantalla de solicitudes: ver nxSolicitudes (rediseño Material Design 3, lista–detalle) */
let solicitudesUI=null;
const solicitudes=()=>solicitudesUI||(solicitudesUI=nxSolicitudes({$,esc,includes,stateTag,repo,notify,render:()=>render(),getModal:()=>({action:modalAction,item:modalItem}),esFechaValida,open:id=>openRequestDetail(id),displayDate:fechaLegible,document,types,v39TypeCatalog,select,openDialog:(...a)=>openDialog(...a),setModal:(accion,id)=>{modalAction=accion;modalItem=id},hoyLocal,fechaLegible}));
function renderRequests(){solicitudes().render()}
/* Pantalla de catálogos: ver catalogos/index.js (lista–detalle, rediseño Material Design 3) */
let catalogosUI=null;
const catalogos=()=>catalogosUI||(catalogosUI=nxCatalogos({$,esc,includes,stateTag,types,repo,notify,render:()=>render(),getModal:()=>({action:modalAction,item:modalItem}),getType:()=>catalogType,setType:t=>{catalogType=t},edit:id=>openCatalog(id),document,input,select,openDialog:(...a)=>openDialog(...a),setModal:(accion,id)=>{modalAction=accion;modalItem=id},hoyLocal,fechaLegible,v41SeedOptions,v41FormatPlan,v41FormatReport}));
function renderCatalogs(){catalogos().render()}

/* Bitácora de auditoría: ver bitacora/index.js */
let bitacoraUI=null;
const bitacora=()=>bitacoraUI||(bitacoraUI=nxBitacora({$,esc,includes,fmt,empty,repo,notify,document}));

/* Periodos de captura: ver periodos/index.js */
let periodosUI=null;
const periodos=()=>periodosUI||(periodosUI=nxPeriodos({$,esc,stateTag,notify,repo,render:()=>render()}));

/* Inicio (panel): ver inicio/index.js */
let inicioUI=null;
const inicio=()=>inicioUI||(inicioUI=nxInicio({$,esc,stateTag,fechaDMA,hoyLocal,repo,abrirSolicitud:id=>openRequestDetail(id),navigate:v=>navigate(v),irConFiltro,document}));
/* Cifras de Inicio: van a su pantalla con el filtro de estado puesto y sin búsqueda ni rol previos, para que la lista
   muestre lo mismo que cuenta la cifra. navigate() repinta, y el repintado acomoda los chips al valor del selector. */
function irConFiltro(v,estado){if(v==='solicitudes'){$('requestSearch').value='';$('requestFilter').value=estado||'all'}else if(v==='usuarios'){$('userSearch').value='';$('userRole').value='all';$('userStatus').value=estado||'all'}navigate(v)}
/* Usuarios y permisos: ver usuarios/index.js */
let usuariosUI=null;
const usuarios=()=>usuariosUI||(usuariosUI=nxUsuarios({$,esc,includes,stateTag,empty,document,repo,getModal:()=>({action:modalAction,item:modalItem}),labelRoles,capabilities,notify,render:()=>render(),input,select,openDialog:(...a)=>openDialog(...a),setModal:(accion,id)=>{modalAction=accion;modalItem=id},hoyLocal}));
function renderUsers(){usuarios().render()}
function renderAudit(){bitacora().render()}
function openDialog(title,eyebrow,html,button='Guardar'){ $('modalTitle').textContent=title;$('modalEyebrow').textContent=eyebrow;$('modalContent').innerHTML=html;$('submitModal').textContent=button;$('submitModal').classList.remove('hidden');$('cancelModal').textContent='Cancelar';$('editor').showModal();setTimeout(()=>$('modalContent').querySelector('input,select,textarea,button')?.focus(),30);
 // Ajuste editorial (antes la envoltura v26): texto de ayuda según el diálogo e historiales largos plegados.
 const body=$('modalContent');
 const hints={user:'Los cambios se registran en el historial de la cuenta.',catalog:'Mantén la denominación y las relaciones oficiales actualizadas.',request:'Describe el alcance y registra el respaldo del cambio.',requestAction:'Consulta los antecedentes antes de confirmar una transición.'};
 if(modalAction&&hints[modalAction]){
  const intro=document.createElement('p');intro.className='modal-intro';intro.textContent=hints[modalAction];body.prepend(intro);
 }
 // Historiales largos bajo demanda; campos imprescindibles siempre visibles.
 if(modalAction==='user'){
  const heads=Array.from(body.querySelectorAll('h3'));
  heads.forEach(h=>{if(h.textContent.includes('Historial')){const list=h.nextElementSibling;if(list&&list.classList.contains('list')){const d=document.createElement('details');d.className='modal-history';const summary=document.createElement('summary');summary.textContent='Ver historial de roles';d.append(summary);list.before(d);d.append(h,list);h.style.display='none';}}});
 }
}
function input(name,label,val='',required=true){return `<div class="form-field"><label class="${required?'required':''}" for="m_${name}">${label}</label><input class="field" id="m_${name}" name="${name}" value="${esc(val)}" ${required?'required':''}></div>`}
function select(name,label,options,value){return `<div class="form-field"><label for="m_${name}">${label}</label><select id="m_${name}" name="${name}">${options.map(o=>`<option ${o===value?'selected':''}>${esc(o)}</option>`).join('')}</select></div>`}

/* Diálogo de Usuarios: ver usuarios/vista-dialogos.js y usuarios/controlador.js */
function openUser(id){usuarios().abrir(id)}

/* Diálogo de Catálogos: ver catalogos/vista-dialogos.js y catalogos/controlador.js */
function openCatalog(id){catalogos().abrir(id)}

/* Diálogos de Solicitudes: ver solicitudes/controlador.js y vista-dialogos.js */
function openRequest(){solicitudes().abrirNueva()}
function openRequestDetail(id){solicitudes().abrirDetalle(id)}
$('newUser').onclick=()=>openUser();$('newCatalog').onclick=()=>openCatalog();$('newRequest').onclick=openRequest;$('newRequestHome').onclick=openRequest;$('closeModal').onclick=$('cancelModal').onclick=()=>{if($('editor').open)$('editor').close()};
/* Formulario compartido (editorForm): ver formulario/index.js */
let formularioUI=null;
const formulario=()=>formularioUI||(formularioUI=nxFormulario({$,notify,idOf,types,render:()=>render(),getModal:()=>({action:modalAction,item:modalItem}),getType:()=>catalogType,hoyLocal,esFechaValida,fechaLegible,esc,solicitudes:{registrar:f=>solicitudes().registrar(f),gestionar:f=>solicitudes().gestionar(f)},catalogos:{guardar:(f,releer)=>catalogos().guardar(f,releer)},usuarios:{guardar:f=>usuarios().guardar(f)}}));
$('editorForm').onsubmit=e=>formulario().guardar(e);
function fillPeriods(){periodos().llenar()}
['requestSearch','requestFilter'].forEach(id=>$(id).addEventListener(id==='requestSearch'?'input':'change',renderRequests));bitacora().init();periodos().init();inicio().init();usuarios().init();
document.addEventListener('keydown',e=>{if(e.key==='Escape'){$('shell').classList.remove('mobile-open');updateSidebar();}if(e.altKey&&!e.ctrlKey&&!e.metaKey&&/^[1-6]$/.test(e.key)&&!['INPUT','TEXTAREA','SELECT'].includes(document.activeElement?.tagName)){e.preventDefault();navigate(['inicio','solicitudes','catalogos','usuarios','periodos','bitacora'][Number(e.key)-1])}});
// Los registros iniciales son ejemplos de interacción; se mantienen en el navegador de cada dispositivo.

/* Panel de permisos por rol: ver usuarios/vista-permisos.js */
function renderPermissionPanel(){usuarios().renderPermisos()}
function renderPeriodHistory(){periodos().renderHistorial()}

function renderPeriodOverview(){periodos().renderResumen()}

render();

// Sesión de administrador: el rol se informa, no se cambia desde el menú.
const currentUser={name:'Administración institucional',role:'Administrador general',mail:'Universidad del Istmo',initials:'AI'};
function showCurrentUser(){
 $('activeAvatar').textContent=currentUser.initials;
 $('activeFullName').textContent=currentUser.name;
 $('activeRole').textContent=currentUser.role;
 $('menuProfileName').textContent=currentUser.name;
 $('menuProfileEmail').textContent=currentUser.mail;
 $('menuActiveRole').textContent=currentUser.role;
}
function closeProfileMenu(){$('profileMenu').hidden=true;$('profileTrigger').setAttribute('aria-expanded','false')}
$('profileTrigger').addEventListener('click',e=>{e.stopPropagation();const open=$('profileMenu').hidden;$('profileMenu').hidden=!open;$('profileTrigger').setAttribute('aria-expanded',String(open))});
document.addEventListener('click',e=>{if(!$('profileControl').contains(e.target))closeProfileMenu()});
document.addEventListener('keydown',e=>{if(e.key==='Escape')closeProfileMenu()});
$('logoutButton').onclick=()=>closeProfileMenu();

showCurrentUser();
// (Aquí había un segundo render() al arrancar; el de arriba ya pinta todo: refactor/render-una-vez.)

// Sacar el menú del contexto de apilamiento del encabezado evita desbordes en pantallas pequeñas.
document.body.appendChild($('profileMenu'));
// Menú del perfil: anclaje calculado sobre el viewport, sin solaparse con tablas ni tarjetas.
function v42PlaceProfileMenu(){
 const menu=$('profileMenu'),trigger=$('profileTrigger');
 if(!menu||menu.hidden||!trigger)return;
 const r=trigger.getBoundingClientRect();
 const width=Math.min(315,innerWidth-20);
 const left=Math.min(Math.max(10,r.right-width),innerWidth-width-10);
 menu.style.setProperty('left',Math.round(left)+'px','important');
 menu.style.setProperty('top',Math.round(r.bottom+8)+'px','important');
 menu.style.setProperty('right','auto','important');
}
$('profileTrigger').addEventListener('click',()=>v42PlaceProfileMenu());
window.addEventListener('resize',v42PlaceProfileMenu);
window.addEventListener('scroll',v42PlaceProfileMenu,{passive:true});

return { navigate, getView: () => view };
}
