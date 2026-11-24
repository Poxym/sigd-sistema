
'use strict';
const $=id=>document.getElementById(id),esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const labelRoles=['Docente','Jefe de carrera','Rectoría','Vicerrectoría','Secretaría de Rectoría','Secretaría de Vicerrectoría','Representante de distinciones','Administrador general'];
const types={institucion:'Institución y áreas',parametros:'Parámetros y pesos',campus:'Campus',carreras:'Carreras',planes:'Planes de estudio',materias:'Materias',rubros:'Rubros y actividades',categorias:'Categorías docentes',comisiones:'Comisiones',distinciones:'Distinciones'};
const template={"users":[],"catalogs":{"institucion":[["UNI","Universidad del Istmo","Institución","Vigente"],["REC","Rectoría","Área institucional","Vigente"],["VIC","Vicerrectoría Académica","Área institucional","Vigente"]],"parametros":[],"campus":[["TEH","Tehuantepec","Campus UNISTMO","Vigente"],["JUC","Juchitán","Campus UNISTMO","Vigente"],["IXT","Ixtepec","Campus UNISTMO","Vigente"]],"carreras":[],"planes":[],"materias":[],"rubros":[["DOC","Docencia","Plan e Informe de Actividades","Vigente"],["INV","Investigación","Plan e Informe de Actividades","Vigente"],["FRH","Formación de recursos humanos","Plan de Trabajo / Dirección de tesis en Informe","Vigente"],["TUT","Tutorías","Plan e Informe de Actividades","Vigente"],["VIN","Vinculación","Plan e Informe de Actividades","Vigente"],["CUL","Difusión de la cultura","Plan e Informe de Actividades","Vigente"],["GAC","Gestión","Plan e Informe de Actividades","Vigente"],["DIST","Distinciones","Plan e Informe de Actividades","Vigente"],["PROM","Promoción del desarrollo","Plan e Informe de Actividades","Vigente"],["SUPAC","Superación académica","Plan de Trabajo","Vigente"]],"categorias":[],"comisiones":[],"distinciones":[]},"requests":[],"period":{"cycle":"","planStart":"","planEnd":"","planState":"Cerrado","reportStart":"","reportEnd":"","reportState":"Cerrado"},"audit":[]};

// V24: datos EXCLUSIVAMENTE ficticios para revisión visual y funcional.
function enrichDemoSeed(c){
 // Docentes: nombres publicados por UNISTMO; numeros, correos, roles y registros operativos son ficticios.
 // Planes 2016 y 2024: publicados en la carrera de Ingeniería en Computación.
 // Materias: obtenidas de temarios 2016 y horario institucional 2023-2024 A; no se atribuyen al plan 2024.
 const sample={"users":[{"id":1,"num":"900001","name":"Juan Pérez Martínez","mail":"administracion@unistmo.example","role":"Administrador general","area":"Institucional","status":"Activo","history":["Alta inicial"]},{"id":2,"num":"900002","name":"Francisco Aguilar Acevedo","mail":"personal02@unistmo.example","role":"Docente","area":"Tehuantepec","status":"Activo","categoryCode":"CAT-P","careerCode":"REF-TEH-04","history":["Alta inicial"],"assignmentHistory":[],"careerHistory":[]},{"id":3,"num":"900003","name":"Daniel Pacheco Bautista","mail":"personal03@unistmo.example","role":"Jefe de carrera","area":"Tehuantepec","status":"Activo","categoryCode":"CAT-PI","careerCode":"REF-TEH-04","history":["Alta inicial"],"assignmentHistory":[],"careerHistory":[]},{"id":4,"num":"900004","name":"Ricardo Carreño Aguilera","mail":"personal04@unistmo.example","role":"Docente","area":"Tehuantepec","status":"Activo","categoryCode":"CAT-P","careerCode":"REF-TEH-04","history":["Alta inicial"],"assignmentHistory":[],"careerHistory":[]},{"id":5,"num":"900005","name":"J. Jesús Arellano Pimentel","mail":"personal05@unistmo.example","role":"Docente","area":"Tehuantepec","status":"Activo","categoryCode":"CAT-PI","careerCode":"REF-TEH-04","history":["Alta inicial"],"assignmentHistory":[],"careerHistory":[]},{"id":6,"num":"900006","name":"Sergio Juárez Vázquez","mail":"personal06@unistmo.example","role":"Docente","area":"Tehuantepec","status":"Activo","categoryCode":"CAT-P","careerCode":"REF-TEH-04","history":["Alta inicial"],"assignmentHistory":[],"careerHistory":[]},{"id":7,"num":"900007","name":"Omar Santiago Nieva García","mail":"personal07@unistmo.example","role":"Docente","area":"Tehuantepec","status":"Activo","categoryCode":"CAT-PI","careerCode":"REF-TEH-04","history":["Alta inicial"],"assignmentHistory":[],"careerHistory":[]},{"id":8,"num":"900008","name":"Ernesto Cortés Pérez","mail":"personal08@unistmo.example","role":"Docente","area":"Tehuantepec","status":"Activo","categoryCode":"CAT-P","careerCode":"REF-TEH-04","history":["Alta inicial"],"assignmentHistory":[],"careerHistory":[]},{"id":9,"num":"900009","name":"Silvia Reyes Jiménez","mail":"personal09@unistmo.example","role":"Docente","area":"Tehuantepec","status":"Activo","categoryCode":"CAT-PI","careerCode":"REF-TEH-04","history":["Alta inicial"],"assignmentHistory":[],"careerHistory":[]},{"id":10,"num":"900010","name":"Guadalupe Toledo Toledo","mail":"personal10@unistmo.example","role":"Docente","area":"Tehuantepec","status":"Activo","categoryCode":"CAT-P","careerCode":"REF-TEH-04","history":["Alta inicial"],"assignmentHistory":[],"careerHistory":[]},{"id":11,"num":"900011","name":"Martha Patricia Luna González","mail":"personal11@unistmo.example","role":"Docente","area":"Tehuantepec","status":"Activo","categoryCode":"CAT-PI","careerCode":"REF-TEH-04","history":["Alta inicial"],"assignmentHistory":[],"careerHistory":[]}],"planes":[{"id":1,"code":"IC-2016","name":"Plan de estudios 2016 · Ingeniería en Computación","detail":"Plan publicado en el portal de Ingeniería en Computación (referencia académica)","parentCode":"REF-TEH-04","status":"Histórico"},{"id":2,"code":"IC-2024","name":"Plan de estudios 2024 · Ingeniería en Computación","detail":"Plan publicado en el portal de Ingeniería en Computación (referencia académica)","parentCode":"REF-TEH-04","status":"Vigente"}],"materias":[{"id":1,"code":"IC-M01","name":"Programación Estructurada","detail":"Asignatura identificada en temarios u horarios institucionales; código referencial","parentCode":"IC-2016","status":"Histórico"},{"id":2,"code":"IC-M02","name":"Estructuras de Datos","detail":"Asignatura identificada en temarios u horarios institucionales; código referencial","parentCode":"IC-2016","status":"Histórico"},{"id":3,"code":"IC-M03","name":"Programación Orientada a Objetos I","detail":"Asignatura identificada en temarios u horarios institucionales; código referencial","parentCode":"IC-2016","status":"Histórico"},{"id":4,"code":"IC-M04","name":"Diseño Digital","detail":"Asignatura identificada en temarios u horarios institucionales; código referencial","parentCode":"IC-2016","status":"Histórico"},{"id":5,"code":"IC-M05","name":"Matemáticas Discretas","detail":"Asignatura identificada en temarios u horarios institucionales; código referencial","parentCode":"IC-2016","status":"Histórico"},{"id":6,"code":"IC-M06","name":"Teoría de la Computación","detail":"Asignatura identificada en temarios u horarios institucionales; código referencial","parentCode":"IC-2016","status":"Histórico"},{"id":7,"code":"IC-M07","name":"Cálculo Integral para Ingeniería","detail":"Asignatura identificada en temarios u horarios institucionales; código referencial","parentCode":"IC-2016","status":"Histórico"}],"requests":[{"id":1,"title":"Revisión de descripción de Ingeniería en Computación","type":"Campus / carrera","authority":"Vicerrectoría","schedule":"Inmediata","status":"pendiente","detail":"Revisar la descripción de la carrera con base en su perfil vigente.","targetCatalog":"carreras","targetId":4,"targetField":"detail","targetValue":"Programa de ingeniería orientado al desarrollo de software y sistemas de cómputo · referencia para revisión","evidence":"SIM-CAMBIO-001"},{"id":2,"title":"Actualización de categoría docente","type":"Categoría docente","authority":"Rectoría","schedule":"Inmediata","status":"autorizada","detail":"Actualizar denominación de una categoría académica para el ejercicio de revisión del proceso.","targetCatalog":"categorias","targetId":1,"targetField":"detail","targetValue":"Clasificación docente utilizada en Plan de Trabajo e Informe de Actividades","evidence":"SIM-AUT-002","authorizationBy":"Rectoría","authorizationDate":"2026-10-02"},{"id":3,"title":"Ajuste de rubro de tutorías","type":"Rubro o sección","authority":"Vicerrectoría","schedule":"Inmediata","status":"pendiente","detail":"Validar el texto de apoyo del rubro de tutorías.","targetCatalog":"rubros","targetId":4,"targetField":"detail","targetValue":"Atención tutorial reportada en Plan e Informe de Actividades","evidence":"SIM-CAMBIO-003"},{"id":4,"title":"Revisión de parámetro de reprobación","type":"Parámetro / peso","authority":"Vicerrectoría","schedule":"Siguiente ciclo","effectiveDate":"2027-02-01","status":"pendiente","detail":"Validar el valor de referencia conforme a los acuerdos institucionales.","targetCatalog":"parametros","targetId":1,"targetField":"detail","targetValue":"Referencia para revisión institucional; vigencia por confirmar","evidence":"SIM-CAMBIO-004"}],"audit":[{"id":1,"date":"2026-10-14T11:30:00","user":"Administrador general","kind":"Catálogo","detail":"Alta de plan de estudios 2024","oldVal":"","newVal":"IC-2024"},{"id":2,"date":"2026-10-13T12:30:00","user":"Administrador general","kind":"Usuario","detail":"Registro de cuenta de docente","oldVal":"","newVal":"Tehuantepec"},{"id":3,"date":"2026-10-12T13:30:00","user":"Administrador general","kind":"Solicitud","detail":"Registro de revisión de carrera","oldVal":"","newVal":"Pendiente"},{"id":4,"date":"2026-10-11T14:30:00","user":"Administrador general","kind":"Periodo","detail":"Configuración de ventanas de captura","oldVal":"Sin fechas","newVal":"Ciclo 2026-2027 A"},{"id":5,"date":"2026-10-10T15:30:00","user":"Administrador general","kind":"Catálogo","detail":"Vinculación de asignaturas con plan 2016","oldVal":"","newVal":"IC-2016"},{"id":6,"date":"2026-10-09T16:30:00","user":"Administrador general","kind":"Solicitud","detail":"Referencia de autorización","oldVal":"Pendiente","newVal":"Autorizada"}],"period":{"cycle":"2026-2027","planStart":"2026-08-10","planEnd":"2026-11-30","planState":"Abierto","reportStart":"2026-10-01","reportEnd":"2026-12-15","reportState":"Abierto","semester":"A","activityStart":"2026-08-10","activityEnd":"2026-12-15"},"periodHistory":[{"date":"2026-10-15T10:10:00","cycle":"2026-2027","summary":"Ajuste de cierre del Informe de Actividades"},{"date":"2026-10-09T08:20:00","cycle":"2026-2027","summary":"Configuración inicial de ventanas de captura"}],"categorias":[{"id":1,"code":"CAT-PI","name":"Profesor investigador","detail":"Categoría de referencia para captura académica; denominación por validar","status":"Vigente"},{"id":2,"code":"CAT-P","name":"Profesor","detail":"Categoría de referencia para captura académica; denominación por validar","status":"Vigente"}],"parametros":[{"id":1,"code":"REB-UMBRAL","name":"Umbral de reprobación para justificar","detail":"Referencia del 35 % identificada en las reuniones, su aplicación requiere confirmación.","paramValue":"35","paramUnit":"Porcentaje","status":"Vigente"}]};
 c.users=sample.users;
 c.catalogs.planes=sample.planes;
 c.catalogs.materias=sample.materias;
 c.catalogs.categorias=sample.categorias;
 c.catalogs.parametros=sample.parametros;
 c.requests=sample.requests;
 c.audit=sample.audit;
 c.period=sample.period;
 c.periodHistory=sample.periodHistory;
 c.demoAccessEvents=[];
 return c;
}
function makeSeed(){let c=structuredClone(template);Object.keys(c.catalogs).forEach(k=>c.catalogs[k]=c.catalogs[k].map((r,i)=>({id:i+1,code:r[0],name:r[1],detail:r[2],status:r[3]})));c.catalogs.carreras=JSON.parse("[{\"id\": 1, \"code\": \"REF-TEH-01\", \"name\": \"Ingeniería Química\", \"detail\": \"Oferta educativa publicada por UNISTMO · Clave referencial del sistema (no oficial)\", \"parentCode\": \"TEH\", \"status\": \"Vigente\"}, {\"id\": 2, \"code\": \"REF-TEH-02\", \"name\": \"Ingeniería de Petróleos\", \"detail\": \"Oferta educativa publicada por UNISTMO · Clave referencial del sistema (no oficial)\", \"parentCode\": \"TEH\", \"status\": \"Vigente\"}, {\"id\": 3, \"code\": \"REF-TEH-03\", \"name\": \"Ingeniería en Diseño\", \"detail\": \"Oferta educativa publicada por UNISTMO · Clave referencial del sistema (no oficial)\", \"parentCode\": \"TEH\", \"status\": \"Vigente\"}, {\"id\": 4, \"code\": \"REF-TEH-04\", \"name\": \"Ingeniería en Computación\", \"detail\": \"Oferta educativa publicada por UNISTMO · Clave referencial del sistema (no oficial)\", \"parentCode\": \"TEH\", \"status\": \"Vigente\"}, {\"id\": 5, \"code\": \"REF-TEH-05\", \"name\": \"Ingeniería Industrial\", \"detail\": \"Oferta educativa publicada por UNISTMO · Clave referencial del sistema (no oficial)\", \"parentCode\": \"TEH\", \"status\": \"Vigente\"}, {\"id\": 6, \"code\": \"REF-TEH-06\", \"name\": \"Licenciatura en Matemáticas Aplicadas\", \"detail\": \"Oferta educativa publicada por UNISTMO · Clave referencial del sistema (no oficial)\", \"parentCode\": \"TEH\", \"status\": \"Vigente\"}, {\"id\": 7, \"code\": \"REF-TEH-07\", \"name\": \"Ingeniería en Energías Renovables\", \"detail\": \"Oferta educativa publicada por UNISTMO · Clave referencial del sistema (no oficial)\", \"parentCode\": \"TEH\", \"status\": \"Vigente\"}, {\"id\": 8, \"code\": \"REF-IXT-08\", \"name\": \"Licenciatura en Ciencias Empresariales\", \"detail\": \"Oferta educativa publicada por UNISTMO · Clave referencial del sistema (no oficial)\", \"parentCode\": \"IXT\", \"status\": \"Vigente\"}, {\"id\": 9, \"code\": \"REF-IXT-09\", \"name\": \"Licenciatura en Derecho\", \"detail\": \"Oferta educativa publicada por UNISTMO · Clave referencial del sistema (no oficial)\", \"parentCode\": \"IXT\", \"status\": \"Vigente\"}, {\"id\": 10, \"code\": \"REF-IXT-10\", \"name\": \"Ingeniería en Desarrollo de Software y Sistemas Inteligentes\", \"detail\": \"Oferta educativa publicada por UNISTMO · Clave referencial del sistema (no oficial)\", \"parentCode\": \"IXT\", \"status\": \"Vigente\"}, {\"id\": 11, \"code\": \"REF-IXT-11\", \"name\": \"Licenciatura en Comercio Exterior y Gestión de Aduanas\", \"detail\": \"Oferta educativa publicada por UNISTMO · Clave referencial del sistema (no oficial)\", \"parentCode\": \"IXT\", \"status\": \"Vigente\"}, {\"id\": 12, \"code\": \"REF-JUC-12\", \"name\": \"Licenciatura en Nutrición\", \"detail\": \"Oferta educativa publicada por UNISTMO · Clave referencial del sistema (no oficial)\", \"parentCode\": \"JUC\", \"status\": \"Vigente\"}, {\"id\": 13, \"code\": \"REF-JUC-13\", \"name\": \"Licenciatura en Enfermería\", \"detail\": \"Oferta educativa publicada por UNISTMO · Clave referencial del sistema (no oficial)\", \"parentCode\": \"JUC\", \"status\": \"Vigente\"}]");const campusDetails=JSON.parse("{\"TEH\": \"Ciudad Universitaria S/N, Barrio Santa Cruz Tagolaba, Tehuantepec, Oaxaca\", \"IXT\": \"Carretera Chihuitán–Ixtepec S/N, Ciudad Ixtepec, Oaxaca\", \"JUC\": \"Carretera Transísmica Juchitán–La Ventosa, km 14, Juchitán, Oaxaca\"}");c.catalogs.campus.forEach(x=>{x.detail=campusDetails[x.code]||x.detail});return enrichDemoSeed(c)}
let db;try{db=JSON.parse(localStorage.getItem('sigd-admin-v51-computacion'))||makeSeed();if(!db.users||!db.catalogs||!db.requests||!db.period||!db.audit)db=makeSeed();else{const defaults=makeSeed().catalogs;Object.keys(defaults).forEach(k=>{if(!Array.isArray(db.catalogs[k]))db.catalogs[k]=defaults[k]})}}catch{db=makeSeed()}
(db.users||[]).forEach(u=>{if(u.role==='Profesor')u.role='Docente'});if(db.permissions&&db.permissions.Profesor){db.permissions.Docente=db.permissions.Profesor;delete db.permissions.Profesor}
let view='inicio',catalogType='campus',modalAction=null,modalItem=null;const persist=()=>{try{localStorage.setItem('sigd-admin-v51-computacion',JSON.stringify(db))}catch{}};const idOf=arr=>Math.max(0,...arr.map(x=>Number(x.id)||0))+1;
function audit(kind,detail,oldVal='',newVal=''){db.audit.unshift({id:idOf(db.audit),date:new Date().toISOString(),user:'Administrador general',kind,detail,oldVal,newVal});persist()}
function notify(msg){let n=document.createElement('div');n.className='toast';n.innerHTML='<i class="ti ti-circle-check"></i><span>'+esc(msg)+'</span>'; $('toasts').append(n);setTimeout(()=>n.remove(),4300)}
const stateTag=(s='')=>`<span class="status ${['Vigente','Activo','Abierto','aplicada','autorizada'].includes(s)?'good':['Histórico','Cerrado','rechazada','Inactivo'].includes(s)?'neutral':'warn'}">${esc(s[0]?.toUpperCase()+s.slice(1))}</span>`;
function navigate(next){view=next;document.querySelectorAll('.view').forEach(v=>v.classList.toggle('active',v.id==='view-'+next));document.querySelectorAll('.nav-btn').forEach(b=>{let on=b.dataset.view===next;b.classList.toggle('active',on);if(on)b.setAttribute('aria-current','page');else b.removeAttribute('aria-current')});$('mastTrail').textContent=({inicio:'Inicio',solicitudes:'Solicitudes',catalogos:'Catálogos',usuarios:'Usuarios',periodos:'Periodos',bitacora:'Bitácora'})[next];$('mastTitle').textContent=({inicio:'Resumen general',solicitudes:'Solicitudes de cambio',catalogos:'Catálogos académicos',usuarios:'Usuarios y permisos',periodos:'Periodos de captura',bitacora:'Bitácora de auditoría'})[next];$('shell').classList.remove('mobile-open');window.scrollTo({top:0,behavior:'smooth'});render()}
document.querySelectorAll('[data-go]').forEach(b=>b.onclick=()=>navigate(b.dataset.go));document.querySelectorAll('.nav-btn').forEach(b=>b.onclick=()=>navigate(b.dataset.view));function updateSidebar(){const folded=$('shell').classList.contains('collapsed');const control=$('collapse');control.setAttribute('aria-expanded',String(!folded));control.setAttribute('aria-label',folded?'Expandir menú lateral':'Contraer menú lateral');control.title=folded?'Expandir menú':'Contraer menú';$('sidebarToggle').setAttribute('aria-expanded',String($('shell').classList.contains('mobile-open')));document.querySelectorAll('.nav-btn').forEach(b=>b.setAttribute('aria-label',b.title));}
function toggleSidebar(){if(window.innerWidth<=920){$('shell').classList.toggle('mobile-open')}else{$('shell').classList.toggle('collapsed');try{localStorage.setItem('sigd-admin-sidebar-collapsed',String($('shell').classList.contains('collapsed')))}catch{}}updateSidebar()}
$('sidebarToggle').onclick=toggleSidebar;$('collapse').onclick=toggleSidebar;$('shade').onclick=()=>{$('shell').classList.remove('mobile-open');updateSidebar()};
try{if(localStorage.getItem('sigd-admin-sidebar-collapsed')==='true')$('shell').classList.add('collapsed')}catch{}updateSidebar();window.addEventListener('resize',updateSidebar);
function render(){renderHome();renderRequests();renderCatalogs();renderUsers();renderAudit();if(view==='periodos')fillPeriods()}
function renderHome(){const pending=db.requests.filter(r=>r.status==='pendiente'),auth=db.requests.filter(r=>r.status==='autorizada'),active=db.users.filter(u=>u.status==='Activo');$('metrics').innerHTML=[[active.length,'Usuarios activos','ti-users','Cuentas habilitadas'],[Object.values(db.catalogs).reduce((s,v)=>s+v.filter(x=>x.status==='Vigente').length,0),'Registros vigentes','ti-books','Catálogos institucionales'],[pending.length,'Por autorizar','ti-file-alert','Solicitudes en revisión'],[auth.length,'Por aplicar','ti-clock-check','Cambios autorizados']].map(([n,t,icon,sub])=>`<div class="surface metric"><div class="metric-icon"><i class="ti ${icon}"></i></div><div><small>${t}</small><strong>${n}</strong><div class="subline">${sub}</div></div></div>`).join('');$('pendingList').innerHTML=(pending.concat(auth).slice(0,4).map(r=>`<div class="list-row"><div class="list-icon"><i class="ti ti-adjustments"></i></div><div class="details"><strong>${esc(r.title)}</strong><p>${esc(r.authority)} · ${esc(r.schedule)}</p></div>${stateTag(r.status)}</div>`).join(''))||empty('Sin solicitudes por atender');$('periodSummary').innerHTML=[['Plan de Trabajo',db.period.planState,db.period.planStart,db.period.planEnd],['Informe de Actividades',db.period.reportState,db.period.reportStart,db.period.reportEnd]].map(x=>`<div class="list-row"><div class="list-icon"><i class="ti ti-calendar-stats"></i></div><div class="details"><strong>${x[0]}</strong><p>${esc(x[2])} al ${esc(x[3])}</p></div>${stateTag(x[1])}</div>`).join('');$('recentActivity').innerHTML=db.audit.slice(0,3).map(a=>`<div class="list-row"><div class="list-icon"><i class="ti ti-history"></i></div><div class="details"><strong>${esc(a.kind)} · ${esc(a.detail)}</strong><p>${fmt(a.date)} · ${esc(a.user)}</p></div></div>`).join('')||'<p class="muted">No hay actividad reciente registrada.</p>'}
function empty(s){return `<tr><td colspan="9"><div class="empty"><i class="ti ti-search-off"></i><strong>No se encontraron registros</strong><span>${esc(s)}</span></div></td></tr>`}const includes=(a,b)=>String(a??'').toLowerCase().includes(String(b).trim().toLowerCase());const fmt=v=>new Date(v).toLocaleString('es-MX',{dateStyle:'medium',timeStyle:'short'});
function renderRequests(){let q=$('requestSearch').value,f=$('requestFilter').value;let list=db.requests.filter(r=>(f==='all'||r.status===f)&&[r.title,r.authority,r.type].some(x=>includes(x,q)));$('requestRows').innerHTML=list.map(r=>`<tr><td><span class="cell-strong">${esc(r.title)}</span><span class="cell-sub">${esc(r.type)}</span></td><td>${esc(r.authority)}</td><td>${esc(r.schedule)}${r.effectiveDate?`<span class="cell-sub">Desde ${esc(v40DisplayDate(r.effectiveDate))}</span>`:''}</td><td>${stateTag(r.status)}</td><td><div class="row-buttons"><button class="btn icon-only" data-request="${r.id}" title="Ver detalle" aria-label="Ver detalle de ${esc(r.title)}"><i class="ti ti-arrow-up-right"></i></button></div></td></tr>`).join('')||empty('Intenta otro filtro');document.querySelectorAll('[data-request]').forEach(b=>b.onclick=()=>openRequestDetail(+b.dataset.request))}
function renderCatalogs(){ $('catalogTabs').innerHTML=Object.entries(types).map(([id,name])=>`<button class="tab ${id===catalogType?'active':''}" role="tab" aria-selected="${id===catalogType}" data-cattab="${id}">${name}</button>`).join('');document.querySelectorAll('[data-cattab]').forEach(b=>b.onclick=()=>{catalogType=b.dataset.cattab;$('catalogSearch').value='';renderCatalogs()});$('catalogTitle').textContent=types[catalogType];const context={campus:'Sedes institucionales. Conservar registros históricos al cambiar de estado.',carreras:'Las carreras se relacionan con un campus y pueden conservar antecedentes de traslados o sustitución.',planes:'Cada plan de estudios se relaciona con una carrera; los planes históricos deben seguir disponibles para consulta.',materias:'Las asignaturas deben proceder de planes de estudio oficiales y conservar su vigencia.',rubros:'Estos rubros alimentan los formularios de Plan de Trabajo e Informe de Actividades.',categorias:'Distingue las categorías de Profesor Investigador y Profesor sin esa denominación.',comisiones:'Comisiones y actividades académicas administradas como registros institucionales.',distinciones:'Catálogo de tipos de distinción; la validación individual corresponde al rol institucional autorizado.',institucion:'Identificación y estructura institucional configurable.',areas:'Áreas institucionales y su denominación vigente.',parametros:'Pesos, horas y reglas configurables, sujetos a indicación institucional.'};$('catalogContext').textContent=context[catalogType]||'';let cat=db.catalogs[catalogType],f=$('catalogFilter').value,q=$('catalogSearch').value,rows=cat.filter(r=>(f==='all'||r.status===f)&&[r.code,r.name,r.detail].some(x=>includes(x,q)));$('catalogCount').textContent=cat.length+' registros';$('catalogRows').innerHTML=rows.map(r=>`<tr><td><span class="cell-strong">${esc(r.name)}</span><span class="cell-sub">${esc(r.code)}</span></td><td>${esc(r.detail)}</td><td>${stateTag(r.status)}</td><td><div class="row-buttons"><button class="btn icon-only" data-edit-cat="${r.id}" title="Editar registro" aria-label="Editar ${esc(r.name)}"><i class="ti ti-pencil"></i></button></div></td></tr>`).join('')||empty('No hay registros para este filtro');document.querySelectorAll('[data-edit-cat]').forEach(b=>b.onclick=()=>openCatalog(+b.dataset.editCat))}
function renderUsers(){renderUserRoleStats();if($('userCompactCount'))$('userCompactCount').textContent=db.users.filter(u=>u.status==='Activo').length+' usuarios activos · '+db.users.length+' cuentas registradas';let q=$('userSearch').value,r=$('userRole').value,s=$('userStatus').value;$('userRows').innerHTML=db.users.filter(u=>(r==='all'||u.role===r)&&(s==='all'||u.status===s)&&[u.name,u.num,u.mail,u.area].some(v=>includes(v,q))).map(u=>`<tr><td><span class="cell-strong">${esc(u.name)}</span><span class="cell-sub">${esc(u.mail)}</span></td><td>${esc(u.num)}</td><td>${esc(u.role)}</td><td>${esc(u.area)}</td><td>${stateTag(u.status)}</td><td><div class="row-buttons"><button class="btn icon-only" data-user="${u.id}" title="Editar usuario" aria-label="Editar ${esc(u.name)}"><i class="ti ti-pencil"></i></button></div></td></tr>`).join('')||empty('Prueba otra búsqueda');document.querySelectorAll('[data-user]').forEach(b=>b.onclick=()=>openUser(+b.dataset.user))}
function renderUserRoleStats(){
 const active=db.users.filter(u=>u.status==='Activo');
 const groups=[
  {label:'Docentes',icon:'ti-chalkboard',tone:'blue',value:active.filter(u=>u.role==='Docente').length,note:'Activos'},
  {label:'Jefaturas',icon:'ti-user-star',tone:'green',value:active.filter(u=>u.role==='Jefe de carrera').length,note:'De carrera'},
  {label:'Autoridades',icon:'ti-building-bank',tone:'purple',value:active.filter(u=>['Rectoría','Vicerrectoría','Secretaría de Rectoría','Secretaría de Vicerrectoría'].includes(u.role)).length,note:'Rectoría, Vicerrectoría y secretarías'},
  {label:'Administrador',icon:'ti-user-cog',tone:'orange',value:active.filter(u=>u.role==='Administrador general').length,note:'General'}
 ];
 $('userRoleStats').innerHTML=groups.map(g=>`<div class="user-stat user-stat-${g.tone}"><div class="user-stat-symbol"><i class="ti ${g.icon}" aria-hidden="true"></i></div><div class="user-stat-content"><span class="user-stat-label">${g.label}</span><strong class="user-stat-value">${g.value.toLocaleString('es-MX')}</strong><span class="user-stat-caption">${g.note}</span></div></div>`).join('');
}
function parseUserCSV(text){
 const rows=[];let row=[],cell='',quoted=false;
 text=text.replace(/^\uFEFF/,'');
 for(let i=0;i<text.length;i++){let c=text[i];if(c==='"'){if(quoted&&text[i+1]==='"'){cell+='"';i++}else quoted=!quoted}else if(c===','&&!quoted){row.push(cell.trim());cell=''}else if((c==='\n'||c==='\r')&&!quoted){if(c==='\r'&&text[i+1]==='\n')i++;row.push(cell.trim());if(row.some(x=>x))rows.push(row);row=[];cell=''}else cell+=c}
 if(quoted)throw Error('El CSV tiene comillas sin cerrar');row.push(cell.trim());if(row.some(x=>x))rows.push(row);
 return rows;
}
$('importUsers').onclick=()=>$('importUsersFile').click();
$('importUsersFile').addEventListener('change',async e=>{
 const file=e.target.files?.[0];if(!file)return;
 try{
  const data=parseUserCSV(await file.text());if(data.length<2)throw Error('El archivo debe incluir encabezados y al menos un usuario');
  const headers=data.shift().map(x=>x.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,''));
  const aliases={num:['num','numero de empleado','no empleado','numero_empleado'],name:['name','nombre','nombre completo'],mail:['mail','correo','correo institucional','email'],role:['role','rol'],area:['area','adscripcion','campus'],status:['status','estado']};
  const cols=Object.fromEntries(Object.entries(aliases).map(([k,terms])=>[k,headers.findIndex(h=>terms.includes(h))]));
  if(Object.values(cols).slice(0,4).some(i=>i<0))throw Error('Se requieren columnas: num, name, mail y role');
  const seen=new Set(db.users.map(u=>String(u.num)));let added=0,skipped=0;
  for(const row of data){const f=k=>cols[k]<0?'':String(row[cols[k]]??'').trim();let num=f('num'),name=f('name'),mail=f('mail'),role=f('role');
    if(!num||!name||!mail||!labelRoles.includes(role)||seen.has(num)||!(/^\d+$/.test(num))||db.users.some(u=>u.mail?.toLowerCase()===mail.toLowerCase())||(role==='Administrador general'&&db.users.some(u=>u.role==='Administrador general'&&u.status==='Activo'))){skipped++;continue}
    if(f('area')&&![...(db.catalogs.campus||[]).filter(x=>x.status==='Vigente').map(x=>x.name),'Institucional',...(db.catalogs.institucion||[]).map(x=>x.name)].includes(f('area'))){skipped++;continue}db.users.push({id:idOf(db.users),num,name,mail,role,area:f('area')||'Institucional',status:f('status')==='Inactivo'?'Inactivo':'Activo',history:['Importación CSV · '+new Date().toLocaleDateString('es-MX')]});seen.add(num);added++;
  }
  if(added){audit('Usuario','Importación CSV: '+added+' cuentas agregadas');persist();render();}
  notify(added+' usuario(s) importados · '+skipped+' omitidos');
 }catch(err){notify('No se pudo importar: '+err.message)}finally{e.target.value=''}
});
function renderAudit(){let q=$('auditSearch').value,f=$('auditFilter').value;let arr=db.audit.filter(a=>(f==='all'||a.kind===f)&&[a.detail,a.user,a.kind,a.oldVal,a.newVal].some(x=>includes(x,q)));$('auditRows').innerHTML=arr.map(a=>`<tr><td>${fmt(a.date)}</td><td>${esc(a.user)}</td><td><span class="status neutral">${esc(a.kind)}</span></td><td><span class="cell-strong">${esc(a.detail)}</span>${a.oldVal||a.newVal?`<span class="cell-sub">${esc(a.oldVal)} ${a.oldVal?'→':''} ${esc(a.newVal)}</span>`:''}</td></tr>`).join('')||empty('Todavía no hay movimientos registrados')}
function openDialog(title,eyebrow,html,button='Guardar'){ $('modalTitle').textContent=title;$('modalEyebrow').textContent=eyebrow;$('modalContent').innerHTML=html;$('submitModal').textContent=button;$('submitModal').classList.remove('hidden');$('cancelModal').textContent='Cancelar';$('editor').showModal();setTimeout(()=>$('modalContent').querySelector('input,select,textarea,button')?.focus(),30)}
function input(name,label,val='',required=true){return `<div class="form-field"><label class="${required?'required':''}" for="m_${name}">${label}</label><input class="field" id="m_${name}" name="${name}" value="${esc(val)}" ${required?'required':''}></div>`}
function select(name,label,options,value){return `<div class="form-field"><label for="m_${name}">${label}</label><select id="m_${name}" name="${name}">${options.map(o=>`<option ${o===value?'selected':''}>${esc(o)}</option>`).join('')}</select></div>`}

// Las relaciones heredadas se infieren únicamente cuando la descripción menciona inequívocamente un catálogo vigente.
function normalizeLegacyRelations(){
 const specs=[['carreras','campus'],['planes','carreras'],['materias','planes']];
 for(const [child,parent] of specs){for(const entry of db.catalogs[child]||[]){if(entry.parentCode)continue;
  const desc=String(entry.detail||'').toLocaleLowerCase('es');
  const candidates=(db.catalogs[parent]||[]).filter(x=>desc.includes(x.name.toLocaleLowerCase('es'))||desc.includes(x.code.toLocaleLowerCase('es')));
  if(candidates.length===1)entry.parentCode=candidates[0].code;
 }}
}
normalizeLegacyRelations();
function selectInstitutionalArea(current=''){
 const campuses=(db.catalogs.campus||[]).filter(x=>x.status==='Vigente'||x.name===current||x.code===current);
 const official=(db.catalogs.institucion||[]).filter(x=>x.status==='Vigente'&&x.code!=='UNI'&&/rector|vicerrector/i.test(x.name));
 const options=[...campuses.map(x=>({value:x.name,label:x.name+(x.status==='Histórico'?' (histórico)':'')})),...official.map(x=>({value:x.name,label:x.name})),{value:'Institucional',label:'Institucional (servicios centrales)'}];
 if(current&&!options.some(x=>x.value===current))options.push({value:current,label:current+' (adscripción anterior)',legacy:true});
 const unique=[...new Map(options.map(x=>[x.value,x])).values()];
 return `<div class="form-field"><label class="required" for="m_area">Campus / adscripción</label><select id="m_area" name="area" required><option value="">Selecciona una adscripción</option>${unique.map(x=>`<option value="${esc(x.value)}" ${current===x.value?'selected':''}>${esc(x.label)}</option>`).join('')}</select></div>`;
}

function v36Assignments(user){
 if(!user)return '';
 const records=Array.isArray(user.assignmentHistory)?user.assignmentHistory:[];
 return `<details class="v36-assignment-history"><summary>Historial de adscripciones <span class="status neutral">${records.length} movimientos</span></summary><div class="v36-timeline">${records.length?records.slice().reverse().map(x=>`<div class="v36-event"><strong>${esc(x.from||'Alta inicial')} → ${esc(x.to)}</strong><small>${esc(x.when)} · ${esc(x.reason||'Actualización institucional')}</small></div>`).join(''):'<p class="muted">Los cambios de adscripción aparecerán aquí.</p>'}</div></details>`;
}
function v36CatalogHistory(record){
 if(!record)return '';
 const changes=record.relationHistory||[];
 return `<details class="v36-assignment-history"><summary>Historial de relación académica <span class="status neutral">${changes.length} movimientos</span></summary><div class="v36-timeline">${changes.length?changes.slice().reverse().map(x=>`<div class="v36-event"><strong>${esc(x.from||'Sin relación previa')} → ${esc(x.to)}</strong><small>${esc(x.when)} · ${esc(x.reason||'Actualización institucional')}</small></div>`).join(''):'<p class="muted">No hay movimientos de relación registrados.</p>'}</div></details>`;
}

function openUser(id){let u=db.users.find(x=>x.id===id);modalAction='user';modalItem=u?.id||null;openDialog(u?'Editar usuario':'Nuevo usuario','USUARIOS Y PERMISOS',`<div class="fields">${input('num','Número de empleado',u?.num)}${input('name','Nombre completo',u?.name)}<div class="form-field span-all"><label class="required">Correo institucional</label><input class="field" name="mail" type="email" required value="${esc(u?.mail)}"></div>${select('role','Rol institucional',labelRoles,u?.role||'Docente')}${selectInstitutionalArea(u?.area)}${select('status','Estado',['Activo','Inactivo'],u?.status||'Activo')}</div>${u?`<div class="soft-divider"></div><h3>Historial de roles</h3><div class="list">${(u.history||[]).map(t=>`<div class="list-row"><div class="list-icon"><i class="ti ti-arrow-left-right"></i></div><div class="details"><strong>${esc(t)}</strong></div></div>`).join('')}</div>`:''}${u?`<div class="soft-divider"></div><div class="fields v37-reason-fields"><div class="form-field"><label for="v37_userDate">Fecha efectiva del movimiento</label><input id="v37_userDate" name="movementDate" type="date" class="field" value="${new Date().toISOString().slice(0,10)}"></div><div class="form-field"><label for="v37_userReason">Motivo del cambio</label><input id="v37_userReason" name="movementReason" class="field" maxlength="180" placeholder="Ej. Reasignación institucional"></div></div>`:''}${v36Assignments(u)}`)}
function catalogRelations(type,record){
 const target={carreras:['campus','Campus asociado'],planes:['carreras','Carrera asociada'],materias:['planes','Plan de estudios asociado']}[type];
 if(!target)return '';
 const [key,title]=target,items=db.catalogs[key]||[];
 const current=record?.parentCode||'';
 const available=items.filter(x=>x.status==='Vigente'||x.code===current);
 return `<div class="form-field span-all"><label class="required" for="m_parentCode">${title}</label><select name="parentCode" id="m_parentCode" required><option value="">Selecciona un registro</option>${available.map(x=>`<option value="${esc(x.code)}" ${x.code===current?'selected':''}>${esc(x.name)} · ${esc(x.code)}${x.status!=='Vigente'?' (histórico)':''}</option>`).join('')}</select><small class="field-help">Solo se ofrecen registros vigentes; una relación anterior se conserva al editar.</small></div>`;
}

function openCatalog(id){
 let r=db.catalogs[catalogType].find(x=>x.id===id);modalAction='catalog';modalItem=r?.id||null;
 const isParam=catalogType==='parametros';
 const paramFields=isParam?`<div class="form-field"><label>Valor del parámetro</label><input class="field" name="paramValue" type="number" step="any" value="${esc(r?.paramValue??'') }" placeholder="Ej. 2"></div><div class="form-field"><label>Unidad de medida</label><select name="paramUnit">${['Horas','Porcentaje','Puntos','Cantidad','No aplica'].map(x=>`<option ${x===(r?.paramUnit||'Horas')?'selected':''}>${x}</option>`).join('')}</select></div>`:'';
 openDialog(r?'Editar registro':'Nuevo registro',types[catalogType].toUpperCase(),`<div class="fields">${input('code','Clave oficial',r?.code)}${select('status','Estado',['Vigente','Histórico'],r?.status||'Vigente')}<div class="form-field span-all"><label class="required">Denominación oficial</label><input class="field" name="name" required value="${esc(r?.name)}"></div>${catalogRelations(catalogType,r)}${paramFields}<div class="form-field span-all"><label>Descripción y observaciones</label><textarea name="detail" placeholder="Especificaciones y notas de gestión">${esc(r?.detail)}</textarea></div></div>${r&&['carreras','planes','materias'].includes(catalogType)?`<div class="fields v37-reason-fields"><div class="form-field"><label>Fecha efectiva del traslado</label><input name="movementDate" type="date" class="field" value="${new Date().toISOString().slice(0,10)}"></div><div class="form-field"><label>Motivo del movimiento</label><input name="movementReason" class="field" maxlength="180" placeholder="Ej. Reestructuración académica"></div></div>`:''}${v36CatalogHistory(r)}${v40ApprovedHistory(r)}<div class="v40-approval"><div class="v40-approval-title"><i class="ti ti-file-check"></i><strong>Respaldo de la modificación</strong></div><div class="fields"><div class="form-field"><label class="required">Autoridad que instruyó</label><select name="directAuthority" required><option value="">Seleccionar autoridad</option><option>Rectoría</option><option>Vicerrectoría</option></select></div><div class="form-field"><label class="required">Referencia de autorización</label><input name="directEvidence" class="field" maxlength="160" required placeholder="Oficio, acuerdo o instrucción"></div></div></div><p class="hint" style="margin-top:12px">Se conservan las relaciones y vigencias anteriores para consulta.</p>`);
}


// V39: ejecución vinculada a un registro real del catálogo.
const v39TypeCatalog={
 'Parámetro / peso':'parametros','Rubro o sección':'rubros','Campus / carrera':'carreras',
 'Plan de estudios / materia':'planes','Categoría docente':'categorias'
};
function v39AvailableTypes(){return Object.entries(types).filter(([k])=>k!=='institucion'||(db.catalogs[k]||[]).length).map(([k,v])=>[k,v]);}
function v39TargetFields(r){
 const initial=r?.targetCatalog||v39TypeCatalog[r?.type]||'parametros';
 const options=v39AvailableTypes().map(([key,title])=>`<option value="${esc(key)}" ${initial===key?'selected':''}>${esc(title)}</option>`).join('');
 return `<div class="v39-target" id="v39Target"><div class="v39-target-head"><i class="ti ti-link"></i><strong>Registro que se modificará</strong></div><div class="fields"><div class="form-field"><label class="required">Catálogo</label><select name="targetCatalog" id="v39Catalog" required>${options}</select></div><div class="form-field"><label class="required">Registro oficial</label><select name="targetId" id="v39Record" required></select></div><div class="form-field"><label class="required">Campo que cambiará</label><select name="targetField" id="v39Field"><option value="name">Denominación oficial</option><option value="detail">Descripción</option><option value="status">Estado de vigencia</option><option value="paramValue">Valor del parámetro</option><option value="paramUnit">Unidad del parámetro</option></select></div><div class="form-field"><label class="required">Nuevo valor</label><input class="field" name="targetValue" id="v39Value" required maxlength="240" placeholder="Valor autorizado"></div></div><div id="v39Current" class="v39-current"></div></div>`;
}
function v39UpdateRecord(){const cat=$('v39Catalog')?.value,sel=$('v39Record');if(!cat||!sel)return;const selected=sel.dataset.requested||sel.value;const all=db.catalogs[cat]||[];sel.innerHTML='<option value="">Seleccionar registro</option>'+all.map(x=>`<option value="${x.id}" ${String(x.id)===String(selected)?'selected':''}>${esc(x.name)} · ${esc(x.code)}</option>`).join('');sel.dataset.requested='';v39UpdateField()}
function v39UpdateField(){const cat=$('v39Catalog')?.value,field=$('v39Field'),val=$('v39Value');if(!field||!val)return;[...field.options].forEach(opt=>{opt.disabled=['paramValue','paramUnit'].includes(opt.value)&&cat!=='parametros'});if(field.selectedOptions[0]?.disabled)field.value='name';if(field.value==='status'){val.placeholder='Vigente o Histórico'}else if(field.value==='paramUnit'){val.placeholder='Horas, Porcentaje, Puntos, Cantidad o No aplica'}else if(field.value==='paramValue'){val.placeholder='Ej. 0.5'}else val.placeholder='Valor autorizado';v39ShowCurrent()}
function v39ShowCurrent(){const cat=$('v39Catalog')?.value,id=$('v39Record')?.value,field=$('v39Field')?.value,r=(db.catalogs[cat]||[]).find(x=>String(x.id)===String(id)),box=$('v39Current');if(box)box.textContent=r?'Valor actual: '+String(r[field]??'Sin dato'):'Selecciona el registro institucional para consultar su valor actual.'}
function v39BindTarget(r){const cat=$('v39Catalog');if(!cat)return;if(r?.targetCatalog)cat.value=r.targetCatalog;const record=$('v39Record');record.dataset.requested=String(r?.targetId||'');cat.addEventListener('change',()=>{record.dataset.requested='';v39UpdateRecord()});record.addEventListener('change',v39ShowCurrent);$('v39Field').addEventListener('change',v39UpdateField);v39UpdateRecord();if(r?.targetField)$('v39Field').value=r.targetField;v39UpdateField();if(r?.targetValue!=null)$('v39Value').value=r.targetValue;}
function v39ValidateChange(f){const cat=f.targetCatalog,arr=db.catalogs[cat];if(!arr)return 'Selecciona un catálogo válido';const r=arr.find(x=>String(x.id)===String(f.targetId));if(!r)return 'Selecciona un registro del catálogo';const allowed=['name','detail','status',...(cat==='parametros'?['paramValue','paramUnit']:[])];if(!allowed.includes(f.targetField))return 'Ese campo no se puede modificar desde esta solicitud';const value=String(f.targetValue||'').trim();if(!value)return 'Escribe el valor autorizado';if(f.targetField==='name'&&arr.some(x=>x.id!==r.id&&x.name.toLocaleLowerCase('es')===value.toLocaleLowerCase('es')))return 'Ya existe un registro con ese nombre';if(f.targetField==='status'&&!['Vigente','Histórico'].includes(value))return 'El estado solo puede ser Vigente o Histórico';if(f.targetField==='paramValue'&&(!Number.isFinite(Number(value))||Number(value)<0))return 'El valor debe ser numérico y no negativo';if(f.targetField==='paramUnit'&&!['Horas','Porcentaje','Puntos','Cantidad','No aplica'].includes(value))return 'Selecciona una unidad admitida';if(f.targetField==='status'&&value==='Histórico'&&r.status!=='Histórico'){const dependencies={campus:'carreras',carreras:'planes',planes:'materias'};const child=dependencies[cat];if(child&&(db.catalogs[child]||[]).some(x=>x.parentCode===r.code&&x.status==='Vigente'))return 'No se puede desactivar: existen registros vigentes asociados'}return null}
function v39ApplyRequest(request,f){if(request.status!=='autorizada')return 'La solicitud debe estar autorizada antes de aplicarse';if(!request.authorizationBy||!request.authorizationDate||!request.evidence)return 'Falta la instrucción documentada de Rectoría o Vicerrectoría';if(!f.appliedAt||!f.executionNote?.trim())return 'Documenta fecha y resultado de la ejecución';if(f.appliedAt<request.authorizationDate)return 'La ejecución no puede ser anterior a la autorización';const patch={targetCatalog:request.targetCatalog||f.targetCatalog,targetId:request.targetId||f.targetId,targetField:request.targetField||f.targetField,targetValue:request.targetValue??f.targetValue};const problem=v39ValidateChange(patch);if(problem)return problem;const item=db.catalogs[patch.targetCatalog].find(x=>String(x.id)===String(patch.targetId));const old=String(item[patch.targetField]??'');const next=String(patch.targetValue).trim();if(old===next)return 'El registro ya contiene el valor indicado; no hay modificación que aplicar';const previous=structuredClone(item);item[patch.targetField]=patch.targetField==='paramValue'?Number(next):next;item.updatedAt=f.appliedAt;item.changeHistory??=[];item.changeHistory.unshift({requestId:request.id,date:f.appliedAt,field:patch.targetField,oldValue:old,newValue:next,authority:request.authorizationBy,evidence:request.evidence});Object.assign(request,patch,{appliedAt:f.appliedAt,executionNote:f.executionNote.trim(),status:'aplicada',beforeValue:old,afterValue:next,executedBy:'Administrador general'});audit('Catálogo',`Solicitud #${request.id} aplicada: ${item.name} · ${patch.targetField}`,old,next);audit('Solicitud',`Aplicación documentada #${request.id} por Administrador general`,JSON.stringify(previous),JSON.stringify(item));return null}


// V40 · Fechas programadas, control de cambios concurrentes y consulta histórica.
function v40Today(){const now=new Date();return [now.getFullYear(),String(now.getMonth()+1).padStart(2,'0'),String(now.getDate()).padStart(2,'0')].join('-')}
function v40ValidDate(s){return /^\d{4}-\d{2}-\d{2}$/.test(String(s||''))&&!Number.isNaN(new Date(s+'T12:00:00').getTime())}
function v40DisplayDate(s){if(!v40ValidDate(s))return s||'Sin fecha';return new Date(s+'T12:00:00').toLocaleDateString('es-MX',{day:'2-digit',month:'short',year:'numeric'})}
function v40EffectiveField(value='',conditional=true){return `<div class="form-field v40-effective-field ${conditional?'v40-hide':''}" id="v40Effective"><label class="required" for="v40EffectiveDate">Fecha de entrada en vigor</label><input class="field" name="effectiveDate" id="v40EffectiveDate" type="date" value="${esc(value)}"><small class="field-help">El cambio no podrá aplicarse antes de esta fecha.</small></div>`}
function v40WireEffectiveDate(){const sched=document.querySelector('#editor [name="schedule"]'),wrap=$('v40Effective');if(!sched||!wrap)return;const refresh=()=>{const planned=sched.value==='Siguiente ciclo';wrap.classList.toggle('v40-hide',!planned);wrap.querySelector('input').required=planned};sched.addEventListener('change',refresh);refresh()}
function v40SelectedValue(f){const record=(db.catalogs[f.targetCatalog]||[]).find(x=>String(x.id)===String(f.targetId));return record?String(record[f.targetField]??''):''}
function v40RecordDirectHistory(record,previous,f){const fields=['code','name','detail','status','parentCode','paramValue','paramUnit'];const differences=fields.filter(key=>String(record[key]??'')!==String(previous[key]??''));if(!differences.length)return;record.changeHistory??=[];differences.forEach(key=>record.changeHistory.unshift({requestId:null,date:f.movementDate||v40Today(),field:key,oldValue:String(previous[key]??''),newValue:String(record[key]??''),authority:f.directAuthority,evidence:f.directEvidence,executionNote:f.movementReason||'Modificación institucional'}))}
function v40ApprovedHistory(record){if(!record)return '';const lines=record.changeHistory||[];if(!lines.length)return '';return `<details class="v40-history"><summary><span><i class="ti ti-history"></i> Versiones anteriores y cambios</span><span class="status neutral">${lines.length} ajustes</span></summary><div class="v40-history-items">${lines.map(x=>`<div class="v40-history-item"><strong>${esc(v40FieldName(x.field))} · ${esc(v40DisplayDate(x.date))}</strong><p><span>Antes:</span> ${esc(x.oldValue||'Sin dato')}</p><p><span>Después:</span> ${esc(x.newValue||'Sin dato')}</p><small>${esc(x.authority||'Administración')} · ${esc(x.evidence||'Referencia no registrada')}${x.requestId?' · Solicitud #'+esc(x.requestId):''}</small></div>`).join('')}</div></details>`}
function v40FieldName(field){return ({name:'Denominación',detail:'Descripción',status:'Vigencia',paramValue:'Valor del parámetro',paramUnit:'Unidad del parámetro',code:'Clave oficial',parentCode:'Relación institucional'})[field]||field}
const v39OriginalApplyRequest=v39ApplyRequest;
v39ApplyRequest=function(request,f){
 const due=request.effectiveDate||f.effectiveDate;
 if(request.schedule==='Siguiente ciclo'&&(!v40ValidDate(due)||due>v40Today()||f.appliedAt<due))return 'Este cambio no puede ejecutarse antes de su fecha de vigencia';
 const targetCat=request.targetCatalog||f.targetCatalog,targetId=request.targetId||f.targetId,targetField=request.targetField||f.targetField;
 const item=(db.catalogs[targetCat]||[]).find(x=>String(x.id)===String(targetId));
 if(item&&request.expectedBefore!==undefined&&String(item[targetField]??'')!==String(request.expectedBefore))return 'El valor actual cambió desde que se registró la solicitud. Registra una nueva solicitud con los datos actualizados';
 const issue=v39OriginalApplyRequest(request,f);
 if(!issue&&item){item.changeHistory?.[0]&&(item.changeHistory[0].validFrom=request.effectiveDate||f.appliedAt);}
 return issue;
};

function openRequest(){modalAction='request';modalItem=null;openDialog('Registrar solicitud','CONTROL DE CAMBIOS',`<div class="fields"><div class="form-field span-all"><label class="required">Concepto del cambio</label><input name="title" required class="field" placeholder="Ej. Ajuste de horas en tutorías"></div>${select('type','Elemento afectado',['Parámetro / peso','Rubro o sección','Campus / carrera','Plan de estudios / materia','Categoría docente','Periodo de captura','Otro'],'Parámetro / peso')}${select('authority','Autoridad solicitante',['Vicerrectoría','Rectoría'],'Vicerrectoría')}${select('schedule','Aplicación',['Inmediata','Siguiente ciclo'],'Inmediata')}${v40EffectiveField('',true)}<div class="form-field"><label>Referencia de autorización</label><input class="field" name="evidence" placeholder="Oficio, acuerdo o comunicación"></div><div class="form-field span-all"><label class="required">Justificación y alcance</label><textarea name="detail" required placeholder="¿Qué debe cambiar y por qué?"></textarea></div></div>${v39TargetFields({type:"Parámetro / peso"})}<div class="callout" style="margin-top:15px"><i class="ti ti-alert-triangle"></i><span>El registro de esta solicitud no aplica ninguna modificación. Solo podrá ejecutarse tras consignar la autorización.</span></div>`,'Registrar solicitud');v39BindTarget();v40WireEffectiveDate();}
function openRequestDetail(id){
 const r=db.requests.find(x=>x.id===id);if(!r)return;
 modalAction='requestAction';modalItem=id;
 const finished=['aplicada','rechazada'].includes(r.status);
 const rows=`<div class="fields v38-request-facts"><div><small>Autoridad solicitante</small><strong>${esc(r.authority)}</strong></div><div><small>Estado</small>${stateTag(r.status)}</div><div><small>Vigencia solicitada</small><strong>${esc(r.schedule)}${r.effectiveDate?' · '+esc(v40DisplayDate(r.effectiveDate)):''}</strong></div><div><small>Elemento afectado</small><strong>${esc(r.type)}</strong></div><div class="span-all"><small>Justificación y alcance</small><p>${esc(r.detail)}</p></div>${r.evidence?`<div class="span-all"><small>Referencia documental</small><strong>${esc(r.evidence)}</strong></div>`:''}${r.authorizationBy?`<div><small>Autoridad que emitió instrucción</small><strong>${esc(r.authorizationBy)}</strong></div><div><small>Fecha de instrucción</small><strong>${esc(r.authorizationDate||'')}</strong></div>`:''}${r.appliedAt?`<div><small>Fecha de ejecución</small><strong>${esc(r.appliedAt)}</strong></div><div><small>Registro de ejecución</small><strong>${esc(r.executionNote||'')}</strong></div>`:''}</div>`;
 let actions='';
 if(finished){actions='<div class="v38-final"><i class="ti ti-lock-check"></i> Solicitud finalizada. El historial de esta operación se conserva en la bitácora.</div>'}
 else if(r.status==='pendiente'){
  actions=`${r.schedule==='Siguiente ciclo'?v40EffectiveField(r.effectiveDate||'',false):''}<div class="v38-request-actions"><div class="form-field span-all"><label for="m_transition">Siguiente acción</label><select name="transition" id="m_transition"><option>Mantener pendiente</option><option>Registrar instrucción recibida</option><option>Devolver para aclaración</option></select></div><div class="fields v38-auth-fields" id="v38AuthFields" hidden><div class="form-field"><label class="required">Autoridad que emitió la instrucción</label><select name="authorizationBy"><option value="">Seleccionar</option><option>Rectoría</option><option>Vicerrectoría</option></select></div><div class="form-field"><label class="required">Fecha de autorización</label><input class="field" name="authorizationDate" type="date" value="${new Date().toISOString().slice(0,10)}"></div><div class="form-field span-all"><label class="required">Oficio o referencia documental</label><input class="field" name="authEvidence" maxlength="160" placeholder="Referencia de la instrucción"></div></div></div>`;
 } else {
  actions=`${v39TargetFields(r)}${r.schedule==='Siguiente ciclo'?v40EffectiveField(r.effectiveDate||'',false):''}${r.schedule==='Siguiente ciclo'?`<p class="v40-due-note"><i class="ti ti-calendar-clock"></i>${r.effectiveDate&&r.effectiveDate>v40Today()?'Aplicación disponible a partir del '+v40DisplayDate(r.effectiveDate):r.effectiveDate?'El cambio ya alcanzó la fecha de vigencia.':'Establece la fecha autorizada para continuar.'}</p>`:''}<div class="v38-request-actions"><div class="form-field"><label for="m_transition">Siguiente acción</label><select name="transition" id="m_transition"><option>Mantener autorizada</option>${r.schedule==='Siguiente ciclo'?'<option>Guardar fecha programada</option>':''}<option>Marcar como aplicada</option></select></div><div class="fields v38-exec-fields" id="v38ExecFields" hidden><div class="form-field"><label class="required">Fecha de ejecución</label><input class="field" name="appliedAt" type="date" value="${new Date().toISOString().slice(0,10)}"></div><div class="form-field span-all"><label class="required">Registro de ejecución</label><textarea name="executionNote" maxlength="700" placeholder="Indica qué registro o parámetro fue modificado, su valor anterior y el resultado. Se registrará junto al valor anterior y nuevo."></textarea></div></div></div>`;
 }
 openDialog(r.title,'SEGUIMIENTO DE CAMBIO',`${rows}${actions}`,finished?'Cerrar':'Guardar seguimiento');
 if(finished){$('submitModal').classList.add('hidden');return}
 if(r.status==='autorizada')v39BindTarget(r);
 const selector=$('m_transition');
 const update=()=>{if($('v38AuthFields'))$('v38AuthFields').hidden=selector.value!=='Registrar instrucción recibida';if($('v38ExecFields'))$('v38ExecFields').hidden=selector.value!=='Marcar como aplicada'};
 selector.addEventListener('change',update);update();
}
$('newUser').onclick=()=>openUser();$('newCatalog').onclick=()=>openCatalog();$('newRequest').onclick=openRequest;$('newRequestHome').onclick=openRequest;$('closeModal').onclick=$('cancelModal').onclick=()=>{if($('editor').open)$('editor').close()};
$('editorForm').onsubmit=e=>{e.preventDefault();let f=Object.fromEntries(new FormData(e.target));if(modalAction==='user'){const permitted=[...(db.catalogs.campus||[]).filter(x=>x.status==='Vigente').map(x=>x.name),...(db.catalogs.institucion||[]).filter(x=>x.status==='Vigente'&&x.code!=='UNI'&&/rector|vicerrector/i.test(x.name)).map(x=>x.name),'Institucional'];const previous=db.users.find(x=>x.id===modalItem);if(!permitted.includes(f.area)&&f.area!==previous?.area)return notify('Selecciona una adscripción del catálogo institucional');let dup=db.users.some(u=>u.num===f.num&&u.id!==modalItem);if(dup)return notify('Ese número de empleado ya está registrado');let u=db.users.find(x=>x.id===modalItem);if(u){let old=u.role;Object.assign(u,f);if(old!==f.role){u.history??=[];u.history.unshift(`${old} → ${f.role} · ${new Date().toLocaleDateString('es-MX')}`)}audit('Usuario','Actualización de '+u.name,old,f.role)}else{db.users.push({...f,id:idOf(db.users),history:['Alta de usuario · '+new Date().toLocaleDateString('es-MX')]});audit('Usuario','Alta de cuenta '+f.name)}notify('Usuario guardado correctamente')}
else if(modalAction==='catalog'){let arr=db.catalogs[catalogType],r=arr.find(x=>x.id===modalItem);if(arr.some(x=>x.code.toLowerCase()===f.code.trim().toLowerCase()&&x.id!==modalItem))return notify('La clave ya existe en este catálogo');if(r){let old=r.name+' / '+r.status;const previous=structuredClone(r);Object.assign(r,f);delete r.directAuthority;delete r.directEvidence;delete r.movementReason;delete r.movementDate;v40RecordDirectHistory(r,previous,f);audit('Catálogo','Edición autorizada en '+types[catalogType]+' · '+f.directEvidence,old,f.name+' / '+f.status)}else{const item={...f,id:idOf(arr)};delete item.directAuthority;delete item.directEvidence;arr.push(item);audit('Catálogo','Alta documentada en '+types[catalogType]+' · '+f.directEvidence,'',f.name)}notify('Registro guardado')}
else if(modalAction==='request'){const invalid=v39ValidateChange(f);if(invalid)return notify(invalid);db.requests.unshift({...f,id:idOf(db.requests),status:'pendiente',expectedBefore:v40SelectedValue(f)});audit('Solicitud','Registro de solicitud vinculada: '+f.title);notify('Solicitud registrada, pendiente de autorización')}
else if(modalAction==='requestAction'){let r=db.requests.find(x=>x.id===modalItem),old=r.status;if(f.transition==='Registrar instrucción recibida'){if(!f.authEvidence?.trim()||!f.authorizationBy||!f.authorizationDate)return notify('Completa autoridad, fecha y referencia documental');r.evidence=f.authEvidence.trim();r.authorizationBy=f.authorizationBy;r.authorizationDate=f.authorizationDate;if(r.schedule==='Siguiente ciclo')r.effectiveDate=f.effectiveDate;r.status='autorizada';audit('Autorización','Instrucción documentada de '+r.authorizationBy+': '+r.title,old,r.status)}else if(f.transition==='Guardar fecha programada'){if(r.schedule!=='Siguiente ciclo'||!v40ValidDate(f.effectiveDate)||f.effectiveDate<r.authorizationDate)return notify('La fecha de vigencia no puede ser anterior a la autorización');const oldDate=r.effectiveDate||'';r.effectiveDate=f.effectiveDate;audit('Solicitud','Actualización de vigencia de la solicitud #'+r.id,oldDate,r.effectiveDate)}else if(f.transition==='Devolver para aclaración'){r.status='rechazada';audit('Solicitud','Solicitud devuelta para aclaración: '+r.title,old,r.status)}else if(f.transition==='Marcar como aplicada'){if(!f.executionNote?.trim()||!f.appliedAt)return notify('Documenta la fecha y el resultado de la ejecución');const invalid=v39ApplyRequest(r,f);if(invalid)return notify(invalid)}notify('Estado de la solicitud actualizado')}
persist();$('editor').close();render()};
function fillPeriods(){let p=db.period;['cycle','planStart','planEnd','planState','reportStart','reportEnd','reportState'].forEach(k=>$(k==='cycle'?'cycleName':k).value=p[k]);if($('cycleBadge'))$('cycleBadge').textContent=p.cycle||'Sin configurar';renderPeriodOverview()}
$('savePeriods').onclick=()=>{if(!$('periodForm').reportValidity())return;let p={cycle:$('cycleName').value.trim()};['planStart','planEnd','planState','reportStart','reportEnd','reportState'].forEach(k=>p[k]=$(k).value);if(p.planEnd<p.planStart||p.reportEnd<p.reportStart)return notify('La fecha de cierre no puede ser anterior al inicio');let old=JSON.stringify(db.period);db.period=p;audit('Periodo','Actualización de ventanas de captura',old,JSON.stringify(p));persist();notify('Configuración guardada');render()};
$('exportAudit').onclick=()=>{let lines=[['Fecha','Responsable','Acción','Detalle','Antes','Después'],...db.audit.map(a=>[fmt(a.date),a.user,a.kind,a.detail,a.oldVal,a.newVal])];let csv='\ufeff'+lines.map(r=>r.map(x=>'"'+String(x??'').replace(/"/g,'""')+'"').join(',')).join('\r\n'),url=URL.createObjectURL(new Blob([csv],{type:'text/csv;charset=utf-8'})),a=document.createElement('a');a.href=url;a.download='bitacora-administracion.csv';a.click();setTimeout(()=>URL.revokeObjectURL(url),1200);notify('Exportación CSV generada')};
['requestSearch','requestFilter'].forEach(id=>$(id).addEventListener(id==='requestSearch'?'input':'change',renderRequests));['catalogSearch','catalogFilter'].forEach(id=>$(id).addEventListener(id==='catalogSearch'?'input':'change',renderCatalogs));['userSearch','userStatus','userRole'].forEach(id=>$(id).addEventListener(id==='userSearch'?'input':'change',renderUsers));['auditSearch','auditFilter'].forEach(id=>$(id).addEventListener(id==='auditSearch'?'input':'change',renderAudit));$('userRole').innerHTML+=[...labelRoles].map(x=>`<option>${esc(x)}</option>`).join('');
document.addEventListener('keydown',e=>{if(e.key==='Escape'){$('shell').classList.remove('mobile-open');updateSidebar();}if(e.altKey&&!e.ctrlKey&&!e.metaKey&&/^[1-6]$/.test(e.key)&&!['INPUT','TEXTAREA','SELECT'].includes(document.activeElement?.tagName)){e.preventDefault();navigate(['inicio','solicitudes','catalogos','usuarios','periodos','bitacora'][Number(e.key)-1])}});
// Los registros iniciales son ejemplos de interacción; se mantienen en el navegador de cada dispositivo.

// Búsqueda integral en datos locales; cada resultado lleva a su pantalla.
const finder=$('globalSearch'),finderInput=$('globalQuery'),finderResults=$('globalResults');
function searchItems(query){
  const q=String(query||'').trim().toLocaleLowerCase('es');
  let list=[
   ...Object.entries({inicio:'Inicio',solicitudes:'Solicitudes de cambio',catalogos:'Catálogos académicos',usuarios:'Usuarios y permisos',periodos:'Periodos de captura',bitacora:'Bitácora de auditoría'}).map(([id,name])=>({kind:'Sección',label:name,detail:'Ir a la sección',target:id,icon:'ti-layout-grid'})),
   ...db.users.map(u=>({kind:'Usuario',label:u.name,detail:u.num+' · '+u.role,target:'usuarios',search:u.mail+' '+u.area,icon:'ti-user'})),
   ...Object.entries(db.catalogs).flatMap(([cat,arr])=>arr.map(r=>({kind:types[cat],label:r.name,detail:r.code+' · '+r.status,target:'catalogos',catalog:cat,search:r.detail,icon:'ti-books'}))),
   ...db.requests.map(r=>({kind:'Solicitud',label:r.title,detail:r.authority+' · '+r.status,target:'solicitudes',search:r.type,icon:'ti-file-description'}))
  ];
  if(!q)return list.filter(x=>x.kind==='Sección');
  return list.filter(x=>[x.label,x.detail,x.kind,x.search].some(t=>String(t||'').toLocaleLowerCase('es').includes(q))).slice(0,15);
}
function renderFinder(){
  const items=searchItems(finderInput.value);
  finderResults.innerHTML=items.length?items.map((x,i)=>`<button class="finder-result" type="button" role="option" data-finder="${i}" aria-selected="false"><span class="finder-result-icon"><i class="ti ${x.icon}"></i></span><span class="finder-result-copy"><strong>${esc(x.label)}</strong><small>${esc(x.kind)} · ${esc(x.detail)}</small></span><i class="ti ti-arrow-up-right finder-arrow"></i></button>`).join(''):'<div class="finder-no-results"><i class="ti ti-search-off"></i><strong>Sin coincidencias</strong><span>Prueba con un nombre, clave o tipo de registro.</span></div>';
  finderResults.querySelectorAll('[data-finder]').forEach(b=>b.addEventListener('click',()=>chooseFinder(items[Number(b.dataset.finder)])));
}
function chooseFinder(item){if(!item)return;finder.close();if(item.catalog){catalogType=item.catalog;$('catalogFilter').value='all';$('catalogSearch').value=''}navigate(item.target);if(item.kind==='Usuario'){$('userRole').value='all';$('userStatus').value='all';$('userSearch').value=item.label;renderUsers()}else if(item.catalog){$('catalogSearch').value=item.label;renderCatalogs()}else if(item.kind==='Solicitud'){$('requestSearch').value=item.label;$('requestFilter').value='all';renderRequests()}}
function openFinder(){if($('editor').open)return;finderInput.value='';renderFinder();finder.showModal();requestAnimationFrame(()=>finderInput.focus())}
$('closeFinder').addEventListener('click',()=>finder.close());
finderInput.addEventListener('input',renderFinder);
finderInput.addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();const first=searchItems(finderInput.value)[0];chooseFinder(first)}});
finder.addEventListener('click',e=>{if(e.target===finder)finder.close()});

// Configuración demostrativa, persistida en el navegador del equipo.
const rolePermissions={
 'Docente':['Consultar catálogos','Capturar documentos'],
 'Jefe de carrera':['Consultar catálogos','Capturar documentos','Validar documentos'],
 'Rectoría':['Consultar catálogos','Consultar reportes','Autorizar solicitudes'],
 'Vicerrectoría':['Consultar catálogos','Consultar reportes','Autorizar solicitudes'],
 'Secretaría de Rectoría':['Consultar catálogos','Consultar reportes'],
 'Secretaría de Vicerrectoría':['Consultar catálogos','Consultar reportes'],
 'Representante de distinciones':['Consultar catálogos','Validar distinciones'],
 'Administrador general':['Consultar catálogos','Administrar usuarios','Editar catálogos','Configurar periodos','Aplicar solicitudes','Consultar auditoría']
};
const capabilities=['Consultar catálogos','Capturar documentos','Validar documentos','Consultar reportes','Autorizar solicitudes','Validar distinciones','Administrar usuarios','Editar catálogos','Configurar periodos','Aplicar solicitudes','Consultar auditoría'];
if(!db.permissions)db.permissions=structuredClone(rolePermissions);
if(!db.periodHistory)db.periodHistory=[];
function renderPermissionPanel(){
 const el=$('permissionPanel');if(!el)return;
 el.innerHTML=`<div class="surface-head"><div><h3>Permisos por rol</h3><small>Reglas de acceso para los módulos institucionales</small></div><span class="status neutral">Configuración</span></div><div class="permission-editor"><div class="form-field"><label for="permissionRole">Seleccionar rol</label><select id="permissionRole">${labelRoles.map(r=>`<option>${esc(r)}</option>`).join('')}</select></div><div id="permissionCheckboxes" class="permission-options"></div></div><p class="hint" style="margin-top:12px">Los permisos asignados determinan las funciones disponibles para cada rol.</p>`;
 const dropdown=$('permissionRole');dropdown.value=window._selectedPermissionRole||'Docente';
 dropdown.onchange=()=>{window._selectedPermissionRole=dropdown.value;drawPermissions()};drawPermissions();
}
function drawPermissions(){
 const role=$('permissionRole')?.value;if(!role)return;
 const perms=db.permissions[role]||[];
 $('permissionCheckboxes').innerHTML=capabilities.map((p,i)=>`<label class="permission-check"><input type="checkbox" data-cap="${i}" ${perms.includes(p)?'checked':''}><span>${p}</span></label>`).join('');
 $('permissionCheckboxes').querySelectorAll('input').forEach(c=>c.onchange=()=>{
  const cap=capabilities[Number(c.dataset.cap)];const before=(db.permissions[role]||[]).join(', ');
  const set=new Set(db.permissions[role]||[]);c.checked?set.add(cap):set.delete(cap);db.permissions[role]=[...set];
  audit('Usuario','Permisos configurados para '+role,before,db.permissions[role].join(', '));notify('Permisos del rol actualizados');
 });
}
function renderPeriodHistory(){
 const el=$('periodHistoryPanel');if(!el)return;
 const items=(db.periodHistory||[]).slice(0,8);
 const dateParts=value=>{const d=new Date(value);if(!Number.isFinite(d.getTime()))return {date:'Fecha no disponible',time:''};return {date:d.toLocaleDateString('es-MX',{day:'2-digit',month:'short',year:'numeric'}),time:d.toLocaleTimeString('es-MX',{hour:'2-digit',minute:'2-digit'})}};
 el.innerHTML=`<div class="surface-head period-history-heading"><div><h3>Historial de configuración</h3><small>Últimas modificaciones del ciclo</small></div><span class="status neutral">${db.periodHistory.length} ${db.periodHistory.length===1?'cambio':'cambios'}</span></div>${items.length?`<div class="period-history-list" role="list">${items.map(x=>{const when=dateParts(x.date);return `<article class="period-history-entry" role="listitem"><div class="period-history-entry-top"><span class="period-history-date">${esc(when.date)} <span class="period-history-hour">· ${esc(when.time)}</span></span><span class="period-history-cycle">${esc(x.cycle||'Sin ciclo')}</span></div><p>${esc(x.summary||'Actualización de configuración')}</p></article>`}).join('')}</div>`:'<p class="muted period-history-empty">Sin modificaciones registradas.</p>'}`;
}

function renderPeriodOverview(){
 const list=$('periodOverviewList');
 if(!list) return;
 const p=db.period;
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

const previousRender=render;
render=function(){previousRender();renderPermissionPanel();renderPeriodHistory();renderPeriodOverview()};
const earlierPeriodSave=$('savePeriods').onclick;
$('savePeriods').onclick=()=>{
 if(!$('periodForm').reportValidity())return;
 const prior=JSON.stringify(db.period);
 earlierPeriodSave();
 if(JSON.stringify(db.period)!==prior){db.periodHistory.unshift({date:new Date().toISOString(),cycle:db.period.cycle,summary:'Actualización de fechas o estados de captura'});persist();renderPeriodHistory();renderPeriodOverview()}
};
// Mantener las relaciones al editar y verificar dependencias institucionales.
const originalSubmit=$('editorForm').onsubmit;
$('editorForm').onsubmit=e=>{
 if(modalAction==='catalog'){
  const f=Object.fromEntries(new FormData(e.target));
  if(f.parentCode){
   const key={carreras:'campus',planes:'carreras',materias:'planes'}[catalogType];
   const parent=(db.catalogs[key]||[]).find(x=>x.code===f.parentCode);
   if(!parent||(parent.status!=='Vigente'&&!(modalItem&&db.catalogs[catalogType].find(x=>x.id===modalItem)?.parentCode===f.parentCode))){e.preventDefault();notify('Selecciona un registro relacionado vigente');return}
  }
  if(catalogType==='parametros'&&f.paramValue!==''&&!Number.isFinite(Number(f.paramValue))){e.preventDefault();notify('El valor del parámetro debe ser numérico');return}
 }
 originalSubmit(e);
};


// V20: resumen operacional focalizado, sin duplicar tarjetas explicativas.
function v20Date(value){if(!value)return 'Sin fecha';const [y,m,d]=String(value).split('-');return y&&m&&d?`${d}/${m}/${y}`:String(value)}
function v20TodayKey(){return new Date().toLocaleDateString('en-CA')}
function v20AccessCount(){
 // Solo contar registros de acceso existentes, nunca generarlos automáticamente.
 return (db.demoAccessEvents||[]).filter(x=>x.source!=='demo'&&x.day===v20TodayKey())
   .reduce((n,x)=>n+Math.max(0,Number(x.count)||0),0);
}
renderHome=function(){
 const pending=db.requests.filter(r=>r.status==='pendiente');
 const authorized=db.requests.filter(r=>r.status==='autorizada');
 const active=db.users.filter(u=>u.status==='Activo').length;
 const catalogs=Object.values(db.catalogs).reduce((n,arr)=>n+arr.filter(r=>r.status==='Vigente').length,0);
 const indicators=[
  {n:active,label:'Usuarios activos',sub:'Cuentas habilitadas',icon:'ti-users'},
  {n:catalogs,label:'Catálogos vigentes',sub:'Registros institucionales',icon:'ti-folders'},
  {n:pending.length,label:'Por autorizar',sub:'Solicitudes en revisión',icon:'ti-file-alert'},
  {n:authorized.length,label:'Por aplicar',sub:'Cambios autorizados',icon:'ti-clock-check'},
  {n:v20AccessCount(),label:'Accesos hoy',sub:'Accesos registrados',icon:'ti-login-2'}
 ];
 $('homeSummaryGrid').innerHTML=indicators.map(x=>`<div class="home-indicator"><span class="home-indicator-icon"><i class="ti ${x.icon}" aria-hidden="true"></i></span><div><span class="home-indicator-label">${x.label}</span><strong class="home-indicator-number">${Number(x.n).toLocaleString('es-MX')}</strong><span class="home-indicator-hint">${x.sub}</span></div></div>`).join('');
 $('homeCycleText').textContent='Seguimiento institucional · Ciclo '+db.period.cycle;
 $('homePeriodCycle').textContent='Ciclo escolar '+db.period.cycle;
 const tasks=[...pending,...authorized].slice(0,4);
 $('homeTasks').innerHTML=tasks.length?tasks.map(r=>`<button class="home-task" type="button" data-home-request="${r.id}"><span class="home-task-icon ${r.status==='autorizada'?'approved':''}"><i class="ti ${r.status==='autorizada'?'ti-check':'ti-clock-exclamation'}"></i></span><span class="home-task-main"><strong>${esc(r.title)}</strong><span>${esc(r.authority)} · ${r.status==='autorizada'?'Autorizada, pendiente de aplicación':'Pendiente de autorización'}</span></span><i class="ti ti-chevron-right home-task-arrow"></i></button>`).join(''):`<div class="home-empty"><i class="ti ti-circle-check"></i><strong>Sin pendientes administrativos</strong><span>Las solicitudes nuevas aparecerán aquí.</span></div>`;
 document.querySelectorAll('[data-home-request]').forEach(b=>b.onclick=()=>openRequestDetail(Number(b.dataset.homeRequest)));
 const periods=[['Plan de Trabajo',db.period.planStart,db.period.planEnd,db.period.planState],['Informe de Actividades',db.period.reportStart,db.period.reportEnd,db.period.reportState]];
 $('homePeriodList').innerHTML=periods.map(x=>`<div class="home-period"><span class="home-period-icon"><i class="ti ti-calendar-event"></i></span><div class="home-period-content"><strong>${x[0]}</strong><span>${v20Date(x[1])} – ${v20Date(x[2])}</span></div>${stateTag(x[3])}</div>`).join('');
 ({}).x=db.audit.length?db.audit.slice(0,3).map(a=>`<div class="home-activity-entry"><span class="home-activity-icon"><i class="ti ti-history"></i></span><div class="home-activity-copy"><strong>${esc(a.detail)}</strong><small>${esc(a.user)} · ${esc(fmt(a.date))}</small></div></div>`).join(''):`<div class="home-empty"><i class="ti ti-history"></i><strong>Sin actividad registrada</strong><span>Los movimientos se mostrarán cuando realices cambios.</span></div>`;
};
// El selector navega sin interferir con los demás botones del prototipo.
document.querySelectorAll('#view-inicio [data-go]').forEach(b=>b.onclick=()=>navigate(b.dataset.go));


// Ajuste editorial de formularios: mismos datos y validaciones, mejor organización visual.
const v26OriginalOpenDialog=openDialog;
openDialog=function(title,eyebrow,html,button='Guardar'){
 v26OriginalOpenDialog(title,eyebrow,html,button);
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
};


// V37 · Reglas de vigencia y separación de responsabilidades.
const v37PreviousSubmit=$('editorForm').onsubmit;
$('editorForm').onsubmit=function(event){
 const data=Object.fromEntries(new FormData(event.target));
 if(['catalog','user'].includes(modalAction)&&data.movementDate){
   if(!/^\d{4}-\d{2}-\d{2}$/.test(data.movementDate)){
     event.preventDefault();notify('Indica una fecha de vigencia válida');return;
   }
   if(data.movementDate > new Date().toISOString().slice(0,10)){
     event.preventDefault();notify('Los movimientos futuros deben registrarse mediante una solicitud programada');return;
   }
 }
 // El cambio de rol no crea otra cuenta; la adscripción anterior debe permanecer en el historial.
 if(modalAction==='user'&&modalItem){
   const old=db.users.find(x=>x.id===modalItem);
   if(old&&(old.area!==data.area||old.role!==data.role)&&!String(data.movementReason||'').trim()){
     event.preventDefault();notify('Indica el motivo del movimiento institucional');return;
   }
 }
 if(modalAction==='catalog'&&modalItem){
   const old=(db.catalogs[catalogType]||[]).find(x=>x.id===modalItem);
   if(old&&old.parentCode!==data.parentCode&&['carreras','planes','materias'].includes(catalogType)&&!String(data.movementReason||'').trim()){
     event.preventDefault();notify('Indica el motivo del cambio de relación académica');return;
   }
 }
 v37PreviousSubmit(event);
};
// No efectuar escrituras innecesarias cuando no se modificó la configuración de períodos.
const v37PriorPeriodSave=$('savePeriods').onclick;
$('savePeriods').onclick=function(){
 const keys=['planStart','planEnd','planState','reportStart','reportEnd','reportState'];
 const draft={cycle:$('cycleName').value.trim()};keys.forEach(k=>draft[k]=$(k).value);
 if(JSON.stringify(draft)===JSON.stringify(db.period)){notify('No hay cambios pendientes por guardar');return}
 if(!/^\d{4}-[A-Za-z0-9]+$/.test(draft.cycle)){notify('Introduce un identificador de ciclo válido, por ejemplo 2026-2027');return}
 v37PriorPeriodSave();
};

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
// V35: Integridad referencial y separación entre autorización institucional y aplicación.
const v35PreviousSubmit=$('editorForm').onsubmit;
$('editorForm').onsubmit=function(e){
  const f=Object.fromEntries(new FormData(e.target));
  if(modalAction==='user'){
    const existingAdmins=db.users.filter(u=>u.id!==modalItem&&u.role==='Administrador general'&&u.status==='Activo');
    const previousAdmin=db.users.find(u=>u.id===modalItem);
    if(f.role==='Administrador general'&&f.status==='Activo'&&existingAdmins.length){e.preventDefault();notify('La administración general solo puede asignarse a una cuenta activa');return}
    if(previousAdmin?.role==='Administrador general'&&previousAdmin.status==='Activo'&&(f.role!=='Administrador general'||f.status!=='Activo')&&existingAdmins.length===0){e.preventDefault();notify('Debe mantenerse una cuenta de administración general activa');return}
    const n=String(f.num||'').trim(), mail=String(f.mail||'').trim().toLowerCase();
    if(!/^\d+$/.test(n)){e.preventDefault();notify('El número de empleado debe contener solo dígitos');return}
    if(db.users.some(u=>u.id!==modalItem&&String(u.num).trim()===n)){e.preventDefault();notify('El número de empleado ya está asignado');return}
    if(db.users.some(u=>u.id!==modalItem&&String(u.mail).trim().toLowerCase()===mail)){e.preventDefault();notify('El correo institucional ya está registrado');return}
    const legal=new Set([...(db.catalogs.campus||[]).filter(x=>x.status==='Vigente').map(x=>x.name),...(db.catalogs.institucion||[]).filter(x=>x.status==='Vigente'&&x.code!=='UNI'&&/rector|vicerrector/i.test(x.name)).map(x=>x.name),'Institucional']);
    const original=db.users.find(u=>u.id===modalItem);
    if(!legal.has(f.area)&&(!original||original.area!==f.area)){e.preventDefault();notify('Selecciona una adscripción institucional vigente');return}
  }
  if(modalAction==='catalog'){
    if(!['Rectoría','Vicerrectoría'].includes(f.directAuthority)||!String(f.directEvidence||'').trim()){e.preventDefault();notify('Toda modificación del catálogo requiere respaldo de Rectoría o Vicerrectoría');return}
    const arr=db.catalogs[catalogType]||[], existing=arr.find(x=>x.id===modalItem);
    const code=String(f.code||'').trim();
    if(!code){e.preventDefault();notify('La clave oficial es obligatoria');return}
    if(arr.some(x=>x.id!==modalItem&&String(x.code).toLowerCase()===code.toLowerCase())){e.preventDefault();notify('La clave oficial ya existe');return}
    const relations={carreras:'campus',planes:'carreras',materias:'planes'}, parentType=relations[catalogType];
    if(parentType){
      const parent=(db.catalogs[parentType]||[]).find(x=>x.code===f.parentCode);
      if(!parent || (parent.status!=='Vigente'&&existing?.parentCode!==f.parentCode)){e.preventDefault();notify('Debes seleccionar una relación institucional vigente');return}
    }
    if(existing&&existing.status==='Vigente'&&f.status==='Histórico'){
      const downstream={campus:['carreras'],carreras:['planes'],planes:['materias']}[catalogType]||[];
      const deps=downstream.flatMap(type=>(db.catalogs[type]||[]).filter(x=>x.parentCode===existing.code&&x.status==='Vigente'));
      if(deps.length){e.preventDefault();notify('No se puede cerrar la vigencia: existen '+deps.length+' registros vinculados activos');return}
    }
    if(existing&&existing.code!==code){
      const downstream={campus:'carreras',carreras:'planes',planes:'materias'}[catalogType];
      const deps=downstream?(db.catalogs[downstream]||[]).filter(x=>x.parentCode===existing.code):[];
      if(deps.length){e.preventDefault();notify('Esta clave tiene relaciones vinculadas. Conserva la clave y modifica la denominación');return}
    }
  }
  if(modalAction==='requestAction'){
    const req=db.requests.find(x=>x.id===modalItem);
    if(f.transition==='Registrar instrucción recibida'){
      if(!['Rectoría','Vicerrectoría'].includes(req?.authority)){e.preventDefault();notify('La instrucción debe provenir de Rectoría o Vicerrectoría');return}
      if(!String(f.authEvidence||'').trim()){e.preventDefault();notify('Indica el oficio o referencia de la instrucción');return}
    }
    if(f.transition==='Marcar como aplicada'&&req?.status!=='autorizada'){e.preventDefault();notify('Solo pueden aplicarse cambios autorizados');return}
  }
  v35PreviousSubmit(e);
};

showCurrentUser();

// V36: historial de adscripción y cambios de relaciones (separado del historial de roles).
const v36PreviousSubmit=$('editorForm').onsubmit;
$('editorForm').onsubmit=function(e){
 const f=Object.fromEntries(new FormData(e.target));
 const type=modalAction, itemId=modalItem, catalogKey=catalogType;
 const oldUser=type==='user'?db.users.find(x=>x.id===itemId):null;
 const oldRecord=type==='catalog'?(db.catalogs[catalogKey]||[]).find(x=>x.id===itemId):null;
 const oldArea=oldUser?.area, oldParent=oldRecord?.parentCode;
 const beforeCount=db.audit.length;
 v36PreviousSubmit(e);
 // An invalid submission must not generate historical movements.
 if(db.audit.length===beforeCount)return;
 const date=new Date().toISOString();
 const effectiveDate=f.movementDate||date.slice(0,10), movementReason=String(f.movementReason||'').trim();
 if(type==='user'){
  const user=db.users.find(x=>x.id===itemId)||(db.users.find(x=>x.num===f.num));
  if(user){
   if(!Array.isArray(user.assignmentHistory))user.assignmentHistory=[];
   if(oldUser&&oldArea!==user.area){
    user.assignmentHistory.push({from:oldArea,to:user.area,when:effectiveDate,recordedAt:date,reason:movementReason||'Cambio de adscripción'});
    audit('Usuario','Cambio de adscripción de '+user.name,oldArea,user.area);
   }else if(!oldUser&&user.assignmentHistory.length===0){
    user.assignmentHistory.push({from:'',to:user.area,when:date,reason:'Alta de cuenta'});
   }
  }
 }
 if(type==='catalog'&&['carreras','planes','materias'].includes(catalogKey)){
  const item= (db.catalogs[catalogKey]||[]).find(x=>x.id===itemId)|| (db.catalogs[catalogKey]||[]).find(x=>x.code===f.code);
  if(item){
   if(!Array.isArray(item.relationHistory))item.relationHistory=[];
   if(oldRecord&&oldParent!==item.parentCode){
    item.relationHistory.push({from:oldParent||'',to:item.parentCode,when:effectiveDate,recordedAt:date,reason:movementReason||'Cambio de relación académica'});
    audit('Catálogo','Relación modificada: '+item.name,oldParent||'',item.parentCode);
   }else if(!oldRecord&&item.parentCode&&item.relationHistory.length===0){
    item.relationHistory.push({from:'',to:item.parentCode,when:date,reason:'Alta del registro'});
   }
  }
 }
 persist();
};


// V38: protege el flujo incluso cuando el formulario se presenta con campos ocultos.
const v38PreviousSubmit=$('editorForm').onsubmit;
$('editorForm').onsubmit=function(e){
 const f=Object.fromEntries(new FormData(e.target));
 if(modalAction==='requestAction'){
  const r=db.requests.find(x=>x.id===modalItem);
  if(!r){e.preventDefault();notify('No se encontró la solicitud');return}
  if(f.transition==='Registrar instrucción recibida'){
   if(r.status!=='pendiente'||!['Rectoría','Vicerrectoría'].includes(f.authorizationBy)||f.authorizationBy!==r.authority||!f.authEvidence?.trim()||!f.authorizationDate){e.preventDefault();notify('Registra la instrucción de la autoridad correspondiente con fecha y evidencia');return}
   if(f.authorizationDate>new Date().toISOString().slice(0,10)){e.preventDefault();notify('La fecha de autorización no puede estar en el futuro');return}
  }
  if(f.transition==='Marcar como aplicada'){
   if(r.status!=='autorizada'||!r.evidence||!r.authorizationBy||!r.authorizationDate){e.preventDefault();notify('La solicitud requiere una instrucción autorizada identificable');return}
   if(!f.executionNote?.trim()||!f.appliedAt){e.preventDefault();notify('Indica fecha y resultado de ejecución');return}
   if(f.appliedAt<r.authorizationDate){e.preventDefault();notify('La ejecución no puede preceder a la autorización');return}
   if(f.appliedAt>new Date().toISOString().slice(0,10)){e.preventDefault();notify('Para ejecuciones futuras, conserva la solicitud autorizada');return}
  }
 }
 if(modalAction==='user'&&modalItem){
  const before=db.users.find(x=>x.id===modalItem);
  if(before&&(before.area!==f.area||before.role!==f.role)){
   if(!f.movementReason?.trim()||!f.movementDate){e.preventDefault();notify('Indica la fecha efectiva y el motivo del movimiento');return}
   if(f.movementDate>new Date().toISOString().slice(0,10)){e.preventDefault();notify('Registra los movimientos futuros mediante solicitudes de cambio');return}
  }
 }
 if(modalAction==='catalog'&&modalItem&&['carreras','planes','materias'].includes(catalogType)){
  const before=db.catalogs[catalogType].find(x=>x.id===modalItem);
  if(before&&before.parentCode!==f.parentCode){
   if(!f.movementReason?.trim()||!f.movementDate){e.preventDefault();notify('Indica la fecha efectiva y el motivo del cambio de relación');return}
   if(f.movementDate>new Date().toISOString().slice(0,10)){e.preventDefault();notify('Para cambios futuros registra una solicitud programada');return}
  }
 }
 v38PreviousSubmit(e);
};

// V40 · Operación programada: validaciones previas al almacenamiento de cualquier solicitud.
const v40PreviousSubmit=$('editorForm').onsubmit;
$('editorForm').onsubmit=function(e){
 const f=Object.fromEntries(new FormData(e.target));
 if(modalAction==='request'&&f.schedule==='Siguiente ciclo'&&(!v40ValidDate(f.effectiveDate)||f.effectiveDate<=v40Today())){e.preventDefault();notify('Indica una fecha futura de entrada en vigor');return}
 if(modalAction==='requestAction'){
  const r=db.requests.find(x=>x.id===modalItem);
  if(!r){e.preventDefault();notify('No se encontró la solicitud');return}
  if(f.transition==='Registrar instrucción recibida'&&r.schedule==='Siguiente ciclo'&&(!v40ValidDate(f.effectiveDate)||f.effectiveDate<f.authorizationDate)){e.preventDefault();notify('La vigencia debe ser igual o posterior a la fecha de autorización');return}
  if(f.transition==='Guardar fecha programada'&&(!v40ValidDate(f.effectiveDate)||f.effectiveDate<r.authorizationDate)){e.preventDefault();notify('La vigencia debe ser igual o posterior a la fecha autorizada');return}
  if(f.transition==='Marcar como aplicada'&&r.schedule==='Siguiente ciclo'){
   const due=r.effectiveDate||f.effectiveDate;
   if(!v40ValidDate(due)){e.preventDefault();notify('Define primero la vigencia de esta solicitud');return}
   if(due>v40Today()){e.preventDefault();notify('Aplicación disponible desde '+v40DisplayDate(due));return}
   if(f.appliedAt<due){e.preventDefault();notify('La ejecución no puede preceder a la fecha de vigencia');return}
  }
 }
 v40PreviousSubmit(e);
};


// V41 · Catálogos de captura extraídos de los formatos facilitados por la institución.
// No se fija la estructura en el formulario docente: Administración mantiene estas listas.
types.opciones='Opciones de captura';
const v41SeedOptions=[{"id":1,"code":"OPC-001","name":"Presencial","group":"Modalidad de curso","appliesTo":"Plan de Trabajo","sourceRef":"Hoja Datos · Plan 2025-2026","detail":"","status":"Vigente","selectionMode":"Única"},{"id":2,"code":"OPC-002","name":"Virtual","group":"Modalidad de curso","appliesTo":"Plan de Trabajo","sourceRef":"Hoja Datos · Plan 2025-2026","detail":"","status":"Vigente","selectionMode":"Única"},{"id":3,"code":"OPC-003","name":"Híbrido","group":"Modalidad de curso","appliesTo":"Plan de Trabajo","sourceRef":"Hoja Datos · Plan 2025-2026","detail":"","status":"Vigente","selectionMode":"Única"},{"id":4,"code":"OPC-004","name":"Director","group":"Dirección de tesis","appliesTo":"Plan de Trabajo","sourceRef":"Hoja Datos · Plan 2025-2026","detail":"","status":"Vigente","selectionMode":"Única"},{"id":5,"code":"OPC-005","name":"Co-Director","group":"Dirección de tesis","appliesTo":"Plan de Trabajo","sourceRef":"Hoja Datos · Plan 2025-2026","detail":"","status":"Vigente","selectionMode":"Única"},{"id":6,"code":"OPC-006","name":"Tipo de revisor","group":"Revisión de tesis","appliesTo":"Plan de Trabajo","sourceRef":"Hoja Datos · Plan 2025-2026","detail":"","status":"Vigente","selectionMode":"Única"},{"id":7,"code":"OPC-007","name":"Revisor de Tesis","group":"Revisión de tesis","appliesTo":"Plan de Trabajo","sourceRef":"Hoja Datos · Plan 2025-2026","detail":"","status":"Vigente","selectionMode":"Única"},{"id":8,"code":"OPC-008","name":"Asesoría y capacitación externa","group":"Vinculación","appliesTo":"Plan de Trabajo","sourceRef":"Hoja Datos · Plan 2025-2026","detail":"","status":"Vigente","selectionMode":"Única"},{"id":9,"code":"OPC-009","name":"Otras actividades de vinculación","group":"Vinculación","appliesTo":"Plan de Trabajo","sourceRef":"Hoja Datos · Plan 2025-2026","detail":"","status":"Vigente","selectionMode":"Única"},{"id":10,"code":"OPC-010","name":"Participación en eventos","group":"Difusión de la cultura","appliesTo":"Plan de Trabajo","sourceRef":"Hoja Datos · Plan 2025-2026","detail":"","status":"Vigente","selectionMode":"Única"},{"id":11,"code":"OPC-011","name":"Coordinaciones","group":"Difusión de la cultura","appliesTo":"Plan de Trabajo","sourceRef":"Hoja Datos · Plan 2025-2026","detail":"","status":"Vigente","selectionMode":"Única"},{"id":12,"code":"OPC-012","name":"Compilación de libros y revistas","group":"Difusión de la cultura","appliesTo":"Plan de Trabajo","sourceRef":"Hoja Datos · Plan 2025-2026","detail":"","status":"Vigente","selectionMode":"Única"},{"id":13,"code":"OPC-013","name":"Elaboración de materiales","group":"Difusión de la cultura","appliesTo":"Plan de Trabajo","sourceRef":"Hoja Datos · Plan 2025-2026","detail":"","status":"Vigente","selectionMode":"Única"},{"id":14,"code":"OPC-014","name":"Director de proyecto Conahcyt","group":"Proyecto de investigación","appliesTo":"Plan de Trabajo","sourceRef":"Hoja Datos · Plan 2025-2026","detail":"","status":"Vigente","selectionMode":"Única"},{"id":15,"code":"OPC-015","name":"Colaborador de proyecto Conahcyt","group":"Proyecto de investigación","appliesTo":"Plan de Trabajo","sourceRef":"Hoja Datos · Plan 2025-2026","detail":"","status":"Vigente","selectionMode":"Única"},{"id":16,"code":"OPC-016","name":"Director de proyecto Prodep","group":"Proyecto de investigación","appliesTo":"Plan de Trabajo","sourceRef":"Hoja Datos · Plan 2025-2026","detail":"","status":"Vigente","selectionMode":"Única"},{"id":17,"code":"OPC-017","name":"Colaborador de proyecto Prodep","group":"Proyecto de investigación","appliesTo":"Plan de Trabajo","sourceRef":"Hoja Datos · Plan 2025-2026","detail":"","status":"Vigente","selectionMode":"Única"},{"id":18,"code":"OPC-018","name":"Director de proyecto Interno","group":"Proyecto de investigación","appliesTo":"Plan de Trabajo","sourceRef":"Hoja Datos · Plan 2025-2026","detail":"","status":"Vigente","selectionMode":"Única"},{"id":19,"code":"OPC-019","name":"Colaborador de proyecto Interno","group":"Proyecto de investigación","appliesTo":"Plan de Trabajo","sourceRef":"Hoja Datos · Plan 2025-2026","detail":"","status":"Vigente","selectionMode":"Única"},{"id":20,"code":"OPC-020","name":"Artículo arbitrado e indexado","group":"Publicación prevista","appliesTo":"Plan de Trabajo","sourceRef":"Hoja Datos · Plan 2025-2026","detail":"","status":"Vigente","selectionMode":"Única"},{"id":21,"code":"OPC-021","name":"Artículo de divulgación con arbitraje","group":"Publicación prevista","appliesTo":"Plan de Trabajo","sourceRef":"Hoja Datos · Plan 2025-2026","detail":"","status":"Vigente","selectionMode":"Única"},{"id":22,"code":"OPC-022","name":"Capítulo de libro arbitrado","group":"Publicación prevista","appliesTo":"Plan de Trabajo","sourceRef":"Hoja Datos · Plan 2025-2026","detail":"","status":"Vigente","selectionMode":"Única"},{"id":23,"code":"OPC-023","name":"Libro arbitrado","group":"Publicación prevista","appliesTo":"Plan de Trabajo","sourceRef":"Hoja Datos · Plan 2025-2026","detail":"","status":"Vigente","selectionMode":"Única"},{"id":24,"code":"OPC-024","name":"Memoria de congreso","group":"Publicación prevista","appliesTo":"Plan de Trabajo","sourceRef":"Hoja Datos · Plan 2025-2026","detail":"","status":"Vigente","selectionMode":"Única"},{"id":25,"code":"OPC-025","name":"Patente","group":"Publicación prevista","appliesTo":"Plan de Trabajo","sourceRef":"Hoja Datos · Plan 2025-2026","detail":"","status":"Vigente","selectionMode":"Única"},{"id":26,"code":"OPC-026","name":"Prototipo/Derecho de autor","group":"Publicación prevista","appliesTo":"Plan de Trabajo","sourceRef":"Hoja Datos · Plan 2025-2026","detail":"","status":"Vigente","selectionMode":"Única"},{"id":27,"code":"OPC-027","name":"Conferencia/Ponencia","group":"Participación en foros","appliesTo":"Plan de Trabajo","sourceRef":"Hoja Datos · Plan 2025-2026","detail":"","status":"Vigente","selectionMode":"Única"},{"id":28,"code":"OPC-028","name":"Taller","group":"Participación en foros","appliesTo":"Plan de Trabajo","sourceRef":"Hoja Datos · Plan 2025-2026","detail":"","status":"Vigente","selectionMode":"Única"},{"id":29,"code":"OPC-029","name":"Seminario de investigación Unistmo","group":"Participación en foros","appliesTo":"Plan de Trabajo","sourceRef":"Hoja Datos · Plan 2025-2026","detail":"","status":"Vigente","selectionMode":"Única"},{"id":30,"code":"OPC-030","name":"Charla CORTV","group":"Participación en foros","appliesTo":"Plan de Trabajo","sourceRef":"Hoja Datos · Plan 2025-2026","detail":"","status":"Vigente","selectionMode":"Única"},{"id":31,"code":"OPC-031","name":"Otras","group":"Participación en foros","appliesTo":"Plan de Trabajo","sourceRef":"Hoja Datos · Plan 2025-2026","detail":"","status":"Vigente","selectionMode":"Única"},{"id":32,"code":"OPC-032","name":"SNI","group":"Distinciones","appliesTo":"Plan de Trabajo","sourceRef":"Hoja Datos · Plan 2025-2026","detail":"","status":"Vigente","selectionMode":"Única"},{"id":33,"code":"OPC-033","name":"Perfil Deseable","group":"Distinciones","appliesTo":"Plan de Trabajo","sourceRef":"Hoja Datos · Plan 2025-2026","detail":"","status":"Vigente","selectionMode":"Única"},{"id":34,"code":"OPC-034","name":"Becas","group":"Distinciones","appliesTo":"Plan de Trabajo","sourceRef":"Hoja Datos · Plan 2025-2026","detail":"","status":"Vigente","selectionMode":"Única"},{"id":35,"code":"OPC-035","name":"Pertenece a Cuerpo Académico","group":"Distinciones","appliesTo":"Plan de Trabajo","sourceRef":"Hoja Datos · Plan 2025-2026","detail":"","status":"Vigente","selectionMode":"Única"},{"id":36,"code":"OPC-036","name":"Otras","group":"Distinciones","appliesTo":"Plan de Trabajo","sourceRef":"Hoja Datos · Plan 2025-2026","detail":"","status":"Vigente","selectionMode":"Única"},{"id":37,"code":"OPC-037","name":"Proyecto","group":"Promoción del desarrollo","appliesTo":"Plan de Trabajo","sourceRef":"Hoja Datos · Plan 2025-2026","detail":"","status":"Vigente","selectionMode":"Única"},{"id":38,"code":"OPC-038","name":"Asesorías profesionales","group":"Promoción del desarrollo","appliesTo":"Plan de Trabajo","sourceRef":"Hoja Datos · Plan 2025-2026","detail":"","status":"Vigente","selectionMode":"Única"},{"id":39,"code":"OPC-039","name":"Otro","group":"Promoción del desarrollo","appliesTo":"Plan de Trabajo","sourceRef":"Hoja Datos · Plan 2025-2026","detail":"","status":"Vigente","selectionMode":"Única"},{"id":40,"code":"OPC-040","name":"Curso","group":"Superación académica","appliesTo":"Plan de Trabajo","sourceRef":"Hoja Datos · Plan 2025-2026","detail":"","status":"Vigente","selectionMode":"Única"},{"id":41,"code":"OPC-041","name":"Taller","group":"Superación académica","appliesTo":"Plan de Trabajo","sourceRef":"Hoja Datos · Plan 2025-2026","detail":"","status":"Vigente","selectionMode":"Única"},{"id":42,"code":"OPC-042","name":"Diplomado","group":"Superación académica","appliesTo":"Plan de Trabajo","sourceRef":"Hoja Datos · Plan 2025-2026","detail":"","status":"Vigente","selectionMode":"Única"},{"id":43,"code":"OPC-043","name":"Certificación","group":"Superación académica","appliesTo":"Plan de Trabajo","sourceRef":"Hoja Datos · Plan 2025-2026","detail":"","status":"Vigente","selectionMode":"Única"},{"id":44,"code":"OPC-044","name":"Otra licenciatura","group":"Superación académica","appliesTo":"Plan de Trabajo","sourceRef":"Hoja Datos · Plan 2025-2026","detail":"","status":"Vigente","selectionMode":"Única"},{"id":45,"code":"OPC-045","name":"Especialidad","group":"Superación académica","appliesTo":"Plan de Trabajo","sourceRef":"Hoja Datos · Plan 2025-2026","detail":"","status":"Vigente","selectionMode":"Única"},{"id":46,"code":"OPC-046","name":"Estudios de maestría","group":"Superación académica","appliesTo":"Plan de Trabajo","sourceRef":"Hoja Datos · Plan 2025-2026","detail":"","status":"Vigente","selectionMode":"Única"},{"id":47,"code":"OPC-047","name":"Estudios de doctorado","group":"Superación académica","appliesTo":"Plan de Trabajo","sourceRef":"Hoja Datos · Plan 2025-2026","detail":"","status":"Vigente","selectionMode":"Única"},{"id":48,"code":"OPC-048","name":"Estancia posdoctoral","group":"Superación académica","appliesTo":"Plan de Trabajo","sourceRef":"Hoja Datos · Plan 2025-2026","detail":"","status":"Vigente","selectionMode":"Única"},{"id":49,"code":"OPC-049","name":"Obtención de grado de maestría","group":"Superación académica","appliesTo":"Plan de Trabajo","sourceRef":"Hoja Datos · Plan 2025-2026","detail":"","status":"Vigente","selectionMode":"Única"},{"id":50,"code":"OPC-050","name":"Obtención de grado de doctorado","group":"Superación académica","appliesTo":"Plan de Trabajo","sourceRef":"Hoja Datos · Plan 2025-2026","detail":"","status":"Vigente","selectionMode":"Única"},{"id":51,"code":"OPC-051","name":"Otra actividad","group":"Superación académica","appliesTo":"Plan de Trabajo","sourceRef":"Hoja Datos · Plan 2025-2026","detail":"","status":"Vigente","selectionMode":"Única"},{"id":52,"code":"OPC-052","name":"Obras","group":"Comités","appliesTo":"Plan de Trabajo","sourceRef":"Hoja Datos · Plan 2025-2026","detail":"","status":"Vigente","selectionMode":"Única"},{"id":53,"code":"OPC-053","name":"Adquisiciones, Arrend. y Serv.","group":"Comités","appliesTo":"Plan de Trabajo","sourceRef":"Hoja Datos · Plan 2025-2026","detail":"","status":"Vigente","selectionMode":"Única"},{"id":54,"code":"OPC-054","name":"Ética","group":"Comités","appliesTo":"Plan de Trabajo","sourceRef":"Hoja Datos · Plan 2025-2026","detail":"","status":"Vigente","selectionMode":"Única"},{"id":55,"code":"OPC-055","name":"Estímulo al Personal Acad.","group":"Comités","appliesTo":"Plan de Trabajo","sourceRef":"Hoja Datos · Plan 2025-2026","detail":"","status":"Vigente","selectionMode":"Única"},{"id":56,"code":"OPC-056","name":"Participativo de Salud","group":"Comités","appliesTo":"Plan de Trabajo","sourceRef":"Hoja Datos · Plan 2025-2026","detail":"","status":"Vigente","selectionMode":"Única"},{"id":57,"code":"OPC-057","name":"Estancias Profesionales","group":"Coordinación de programas","appliesTo":"Plan de Trabajo","sourceRef":"Hoja Datos · Plan 2025-2026","detail":"","status":"Vigente","selectionMode":"Única"},{"id":58,"code":"OPC-058","name":"Tutorías","group":"Coordinación de programas","appliesTo":"Plan de Trabajo","sourceRef":"Hoja Datos · Plan 2025-2026","detail":"","status":"Vigente","selectionMode":"Única"},{"id":59,"code":"OPC-059","name":"Seminario institucional","group":"Coordinación de programas","appliesTo":"Plan de Trabajo","sourceRef":"Hoja Datos · Plan 2025-2026","detail":"","status":"Vigente","selectionMode":"Única"},{"id":60,"code":"OPC-060","name":"Programa de lecutras","group":"Coordinación de programas","appliesTo":"Plan de Trabajo","sourceRef":"Hoja Datos · Plan 2025-2026","detail":"","status":"Vigente","selectionMode":"Única"},{"id":61,"code":"OPC-061","name":"Programa de alfabetización","group":"Coordinación de programas","appliesTo":"Plan de Trabajo","sourceRef":"Hoja Datos · Plan 2025-2026","detail":"","status":"Vigente","selectionMode":"Única"},{"id":62,"code":"OPC-062","name":"Programa de la Agenda Ambiental","group":"Coordinación de programas","appliesTo":"Plan de Trabajo","sourceRef":"Hoja Datos · Plan 2025-2026","detail":"","status":"Vigente","selectionMode":"Única"},{"id":63,"code":"OPC-063","name":"Enlace de actividades de integración","group":"Coordinación de programas","appliesTo":"Plan de Trabajo","sourceRef":"Hoja Datos · Plan 2025-2026","detail":"","status":"Vigente","selectionMode":"Única"},{"id":64,"code":"OPC-064","name":"Promoción del Desarrollo","group":"Coordinación de programas","appliesTo":"Plan de Trabajo","sourceRef":"Hoja Datos · Plan 2025-2026","detail":"","status":"Vigente","selectionMode":"Única"},{"id":65,"code":"OPC-065","name":"Difusión de la Cultura","group":"Coordinación de programas","appliesTo":"Plan de Trabajo","sourceRef":"Hoja Datos · Plan 2025-2026","detail":"","status":"Vigente","selectionMode":"Única"},{"id":66,"code":"OPC-066","name":"Interno","group":"Origen de proyecto","appliesTo":"Informe de Actividades","sourceRef":"Informe 2022-2023 B","detail":"","status":"Vigente","selectionMode":"Única"},{"id":67,"code":"OPC-067","name":"Conacyt","group":"Origen de proyecto","appliesTo":"Informe de Actividades","sourceRef":"Informe 2022-2023 B","detail":"","status":"Vigente","selectionMode":"Única"},{"id":68,"code":"OPC-068","name":"Prodep","group":"Origen de proyecto","appliesTo":"Informe de Actividades","sourceRef":"Informe 2022-2023 B","detail":"","status":"Vigente","selectionMode":"Única"},{"id":69,"code":"OPC-069","name":"Otro","group":"Origen de proyecto","appliesTo":"Informe de Actividades","sourceRef":"Informe 2022-2023 B","detail":"","status":"Vigente","selectionMode":"Única"},{"id":70,"code":"OPC-070","name":"Dirección","group":"Participación en proyecto","appliesTo":"Informe de Actividades","sourceRef":"Informe 2022-2023 B","detail":"","status":"Vigente","selectionMode":"Única"},{"id":71,"code":"OPC-071","name":"Colaboración","group":"Participación en proyecto","appliesTo":"Informe de Actividades","sourceRef":"Informe 2022-2023 B","detail":"","status":"Vigente","selectionMode":"Única"},{"id":72,"code":"OPC-072","name":"Indexado","group":"Clasificación de artículo","appliesTo":"Informe de Actividades","sourceRef":"Informe 2022-2023 B","detail":"","status":"Vigente","selectionMode":"Múltiple"},{"id":73,"code":"OPC-073","name":"Arbitrado","group":"Clasificación de artículo","appliesTo":"Informe de Actividades","sourceRef":"Informe 2022-2023 B","detail":"","status":"Vigente","selectionMode":"Múltiple"},{"id":74,"code":"OPC-074","name":"Divulgación","group":"Clasificación de artículo","appliesTo":"Informe de Actividades","sourceRef":"Informe 2022-2023 B","detail":"","status":"Vigente","selectionMode":"Múltiple"},{"id":75,"code":"OPC-075","name":"Aceptado","group":"Estado de artículo","appliesTo":"Informe de Actividades","sourceRef":"Informe 2022-2023 B","detail":"","status":"Vigente","selectionMode":"Única"},{"id":76,"code":"OPC-076","name":"Publicado","group":"Estado de artículo","appliesTo":"Informe de Actividades","sourceRef":"Informe 2022-2023 B","detail":"","status":"Vigente","selectionMode":"Única"},{"id":77,"code":"OPC-077","name":"Nacional","group":"Ámbito de publicación","appliesTo":"Informe de Actividades","sourceRef":"Informe 2022-2023 B","detail":"","status":"Vigente","selectionMode":"Única"},{"id":78,"code":"OPC-078","name":"Extranjero","group":"Ámbito de publicación","appliesTo":"Informe de Actividades","sourceRef":"Informe 2022-2023 B","detail":"","status":"Vigente","selectionMode":"Única"},{"id":79,"code":"OPC-079","name":"JCR","group":"Índice de publicación","appliesTo":"Informe de Actividades","sourceRef":"Informe 2022-2023 B","detail":"","status":"Vigente","selectionMode":"Múltiple"},{"id":80,"code":"OPC-080","name":"SCOPUS / Índice CONACYT","group":"Índice de publicación","appliesTo":"Informe de Actividades","sourceRef":"Informe 2022-2023 B","detail":"","status":"Vigente","selectionMode":"Múltiple"},{"id":81,"code":"OPC-081","name":"Otro","group":"Índice de publicación","appliesTo":"Informe de Actividades","sourceRef":"Informe 2022-2023 B","detail":"","status":"Vigente","selectionMode":"Múltiple"},{"id":82,"code":"OPC-082","name":"Libro","group":"Tipo de obra","appliesTo":"Informe de Actividades","sourceRef":"Informe 2022-2023 B","detail":"","status":"Vigente","selectionMode":"Única"},{"id":83,"code":"OPC-083","name":"Capítulo de libro","group":"Tipo de obra","appliesTo":"Informe de Actividades","sourceRef":"Informe 2022-2023 B","detail":"","status":"Vigente","selectionMode":"Única"},{"id":84,"code":"OPC-084","name":"Autor","group":"Autoría en libro","appliesTo":"Informe de Actividades","sourceRef":"Informe 2022-2023 B","detail":"","status":"Vigente","selectionMode":"Única"},{"id":85,"code":"OPC-085","name":"Coautor","group":"Autoría en libro","appliesTo":"Informe de Actividades","sourceRef":"Informe 2022-2023 B","detail":"","status":"Vigente","selectionMode":"Única"}];
const v41CommissionNames=["Personal Académico", "Planes y programas de estudio", "Finanzas", "Reglamentos", "Cafetería", "Mixta de Seguridad e Higiene", "Fondo de Ahorro", "Evaluación docente", "Comisión de género"];
const v41RubricMapping={
 DOC:['A. Docencia','A. Docencia'],
 FRH:['B. Formación de recursos humanos','C. Dirección de tesis'],
 TUT:['C. Tutorías','D. Tutorías'],
 VIN:['D. Vinculación','E. Vinculación'],
 CUL:['E. Difusión de la cultura','F. Difusión de la cultura'],
 GAC:['F. Gestión','G. Gestión'],
 DIST:['G. Distinciones','H. Distinciones'],
 PROM:['H. Promoción del desarrollo','I. Promoción al desarrollo'],
 SUPAC:['I. Superación académica',''],
 INV:['J. Investigación','B. Investigación']
};
const v41FormatPlan=['','A. Docencia','B. Formación de recursos humanos','C. Tutorías','D. Vinculación','E. Difusión de la cultura','F. Gestión','G. Distinciones','H. Promoción del desarrollo','I. Superación académica','J. Investigación'];
const v41FormatReport=['','A. Docencia','B. Investigación','C. Dirección de tesis','D. Tutorías','E. Vinculación','F. Difusión de la cultura','G. Gestión','H. Distinciones','I. Promoción al desarrollo'];
function v41Initialize(){
 db.catalogs.opciones??=structuredClone(v41SeedOptions);
 const codes=new Set((db.catalogs.comisiones||[]).map(x=>String(x.name||'').toLocaleLowerCase('es')));
 v41CommissionNames.forEach((name,i)=>{
  if(codes.has(name.toLocaleLowerCase('es')))return;
  db.catalogs.comisiones.push({id:idOf(db.catalogs.comisiones),code:'COM-F'+String(i+1).padStart(2,'0'),name,detail:'Comisión indicada en el Plan de Trabajo',status:'Vigente'});
 });
 const rub=db.catalogs.rubros;
 if(!rub.some(x=>x.code==='DIST'))rub.push({id:idOf(rub),code:'DIST',name:'Distinciones',detail:'Plan e Informe de Actividades',status:'Vigente'});
 if(!rub.some(x=>x.code==='PROM'))rub.push({id:idOf(rub),code:'PROM',name:'Promoción del desarrollo',detail:'Plan e Informe de Actividades',status:'Vigente'});
 if(!rub.some(x=>x.code==='SUPAC'))rub.push({id:idOf(rub),code:'SUPAC',name:'Superación académica',detail:'Plan de Trabajo',status:'Vigente'});
 rub.forEach(r=>{const map=v41RubricMapping[r.code];if(map){r.planSection??=map[0];r.reportSection??=map[1]}});
 const params=db.catalogs.parametros;
 if(!params.some(x=>x.code==='REB-UMBRAL'))params.push({id:idOf(params),code:'REB-UMBRAL',name:'Umbral de reprobación para justificar',detail:'Porcentaje superior al cual debe solicitarse justificación en el Informe, conforme a entrevista institucional.',paramValue:'',paramUnit:'Porcentaje',status:'Vigente'});
 db.period.semester??='';db.period.activityStart??='';db.period.activityEnd??='';
 persist();
}
v41Initialize();
const v41BaseRenderCatalogs=renderCatalogs;
let v41SelectedGroup='all';
renderCatalogs=function(){
 const priorQuery=$('catalogSearch').value;
 if(catalogType==='opciones')$('catalogSearch').value='';
 v41BaseRenderCatalogs();
 if(catalogType==='opciones')$('catalogSearch').value=priorQuery;
 const isOptions=catalogType==='opciones',wrap=$('optionGroupFilterWrap'),sel=$('optionGroupFilter');
 wrap.hidden=!isOptions;
 $('catalogSearch').placeholder=isOptions?'Buscar nombre, clave o grupo':'Buscar registro';
 if(isOptions){
  $('catalogContext').textContent='Listas utilizadas por los formularios académicos, organizadas por tipo de dato y documento.';
  const groups=[...new Set(db.catalogs.opciones.map(x=>x.group).filter(Boolean))].sort((a,b)=>a.localeCompare(b,'es'));
  const value=groups.includes(v41SelectedGroup)?v41SelectedGroup:'all';v41SelectedGroup=value;
  sel.innerHTML='<option value="all">Todos los grupos</option>'+groups.map(g=>`<option value="${esc(g)}" ${g===value?'selected':''}>${esc(g)}</option>`).join('');
  let visible=0;
  [...$('catalogRows').querySelectorAll('tr')].forEach(row=>{
   const button=row.querySelector('[data-edit-cat]');if(!button)return;
   const item=db.catalogs.opciones.find(x=>String(x.id)===button.dataset.editCat);if(!item)return;
   const query=$('catalogSearch').value.trim();
   const show=(value==='all'||item.group===value)&&(!query||[item.code,item.name,item.group,item.appliesTo,item.detail].some(x=>includes(x,query)))&&($('catalogFilter').value==='all'||item.status===$('catalogFilter').value);
   row.hidden=!show;if(show)visible++;
   const cell=row.querySelectorAll('td')[1];if(cell)cell.innerHTML=`<strong class="v41-format-line">${esc(item.group)}</strong><span class="v41-row-info">${esc(item.appliesTo||'Plan de Trabajo')} · Selección ${esc((item.selectionMode||'Única').toLowerCase())}</span>`;
  });
  $('catalogCount').textContent=visible+' de '+db.catalogs.opciones.length+' opciones';
  if(!visible)$('catalogRows').innerHTML=empty('No hay opciones en esta selección');
 }else if(catalogType==='rubros'){
  [...$('catalogRows').querySelectorAll('tr')].forEach(row=>{
   const id=row.querySelector('[data-edit-cat]')?.dataset.editCat;
   const item=db.catalogs.rubros.find(r=>String(r.id)===id);if(!item)return;
   const cell=row.querySelectorAll('td')[1];if(!cell)return;
   cell.innerHTML=`<span>${esc(item.detail||'')}</span><span class="v41-row-info">Plan: ${esc(item.planSection||'No asociado')} · Informe: ${esc(item.reportSection||'No asociado')}</span>`;
  });
 }
};
$('optionGroupFilter').addEventListener('change',e=>{v41SelectedGroup=e.target.value;renderCatalogs()});
const v41BaseOpenCatalog=openCatalog;
openCatalog=function(id){
 v41BaseOpenCatalog(id);
 const item=(db.catalogs[catalogType]||[]).find(x=>x.id===id),name=$('modalContent').querySelector('input[name="name"]');
 if(!name)return;
 if(catalogType==='opciones'){
  const groups=[...new Set([...v41SeedOptions.map(x=>x.group),...db.catalogs.opciones.map(x=>x.group)])].sort((a,b)=>a.localeCompare(b,'es'));
  const el=document.createElement('div');el.className='v41-form-specific-fields';
  const opt=(name,arr,current)=>`<div class="form-field"><label class="required">${name==='group'?'Grupo de opciones':'Aplicable en'}</label><select name="${name}" class="v41-reference-select" required><option value="">Seleccionar</option>${arr.map(s=>`<option value="${esc(s)}" ${current===s?'selected':''}>${esc(s)}</option>`).join('')}</select></div>`;
  el.innerHTML=opt('group',groups,item?.group||'')+opt('appliesTo',['Plan de Trabajo','Informe de Actividades','Ambos'],item?.appliesTo||'');
  const selector=el.querySelector('[name=group]');selector.insertAdjacentHTML('beforeend','<option value="__NEW__">Nuevo grupo…</option>');
  const custom=document.createElement('div');custom.className='form-field';custom.hidden=true;
  custom.innerHTML='<label>Nombre del nuevo grupo</label><input class="field" name="groupCustom" maxlength="85" placeholder="Ej. Tipo de evaluación">';
  const flip=()=>{custom.hidden=selector.value!=='__NEW__';custom.querySelector('input').required=!custom.hidden};
  selector.addEventListener('change',flip);
  el.append(custom);flip();
  name.closest('.form-field').after(el);
  const mode=document.createElement('div');mode.className='form-field';
  mode.innerHTML=`<label>Tipo de selección</label><select name="selectionMode" class="v41-reference-select"><option ${(item?.selectionMode||'Única')==='Única'?'selected':''}>Única</option><option ${(item?.selectionMode||'Única')==='Múltiple'?'selected':''}>Múltiple</option></select>`;
  el.after(mode);
 }else if(catalogType==='rubros'){
  const el=document.createElement('div');el.className='v41-form-specific-fields';
  const field=(key,label,arr)=>`<div class="form-field"><label>${label}</label><select name="${key}" class="v41-reference-select">${arr.map(x=>`<option value="${esc(x)}" ${(item?.[key]||'')===x?'selected':''}>${esc(x||'No está en este formato')}</option>`).join('')}</select></div>`;
  el.innerHTML=field('planSection','Sección en el Plan',v41FormatPlan)+field('reportSection','Sección en el Informe',v41FormatReport);
  name.closest('.form-field').after(el);
 }
};
// Integridad de listas maestras: grupo requerido, sin opciones homónimas en un mismo grupo.
const v41BaseSubmit=$('editorForm').onsubmit;
$('editorForm').onsubmit=function(event){
 if(modalAction==='catalog'&&catalogType==='opciones'){
  let f=Object.fromEntries(new FormData(event.target));
  if(f.group==='__NEW__'){
   const custom=String(f.groupCustom||'').trim();
   if(!custom){event.preventDefault();notify('Indica un nombre para el nuevo grupo');return}
   const selector=$('modalContent').querySelector('[name=group]');
   selector.add(new Option(custom,custom,true,true));selector.value=custom;
   $('modalContent').querySelector('[name=groupCustom]').removeAttribute('name');
   f.group=custom;
  }
  if(!f.group||!['Plan de Trabajo','Informe de Actividades','Ambos'].includes(f.appliesTo)){
   event.preventDefault();notify('Selecciona un grupo y el documento al que aplica');return;
  }
  if((db.catalogs.opciones||[]).some(x=>x.id!==modalItem&&x.group===f.group&&String(x.name).trim().toLocaleLowerCase('es')===String(f.name).trim().toLocaleLowerCase('es'))){
   event.preventDefault();notify('Esta opción ya existe en el grupo seleccionado');return;
  }
 }
 v41BaseSubmit(event);
};
// Las fechas académicas describen las actividades reportadas; no reemplazan las ventanas de captura.
const v41PriorFillPeriods=fillPeriods;
fillPeriods=function(){v41PriorFillPeriods();$('v41Semester').value=db.period.semester||'';$('v41AcademicStart').value=db.period.activityStart||'';$('v41AcademicEnd').value=db.period.activityEnd||''};
const v41PriorSavePeriods=$('savePeriods').onclick;
$('savePeriods').onclick=function(){
 const semester=$('v41Semester').value,from=$('v41AcademicStart').value,to=$('v41AcademicEnd').value;
 if(!!from!==!!to){notify('Indica ambas fechas del periodo académico o deja ambas vacías');return}
 if(from&&to&&to<from){notify('El cierre del periodo académico debe ser posterior al inicio');return}
 if(!semester){notify('Selecciona el semestre A o B del ciclo escolar');return}
 if(!$('periodForm').reportValidity())return;
 if(!/^\d{4}-[A-Za-z0-9]+$/.test($('cycleName').value.trim())){notify('Introduce un identificador válido del ciclo escolar');return}
 if($('planEnd').value<$('planStart').value||$('reportEnd').value<$('reportStart').value){notify('El cierre de captura no puede preceder al inicio');return}
 const previous={semester:db.period.semester||'',activityStart:db.period.activityStart||'',activityEnd:db.period.activityEnd||''};
 const changed=previous.semester!==semester||previous.activityStart!==from||previous.activityEnd!==to;
 const before=JSON.stringify({cycle:db.period.cycle,planStart:db.period.planStart,planEnd:db.period.planEnd,planState:db.period.planState,reportStart:db.period.reportStart,reportEnd:db.period.reportEnd,reportState:db.period.reportState});
 const now=JSON.stringify({cycle:$('cycleName').value.trim(),planStart:$('planStart').value,planEnd:$('planEnd').value,planState:$('planState').value,reportStart:$('reportStart').value,reportEnd:$('reportEnd').value,reportState:$('reportState').value});
 if(!changed&&before===now){notify('No hay cambios pendientes por guardar');return}
 if(before!==now){v41PriorSavePeriods();if(!$('periodForm').checkValidity())return}
 if(changed){
  Object.assign(db.period,{semester,activityStart:from,activityEnd:to});
  audit('Periodo','Actualización de semestre y periodo académico reportado',JSON.stringify(previous),JSON.stringify({semester,activityStart:from,activityEnd:to}));
  db.periodHistory??=[];db.periodHistory.unshift({date:new Date().toISOString(),cycle:db.period.cycle,summary:'Actualización del semestre y fechas académicas de referencia'});
  persist();render();notify('Periodo académico actualizado');
 }
};

// Identificación académica de los profesores conforme a ambos formatos fuente.
const v41BaseOpenUser=openUser;
function v41AcademicRole(role){return role==='Docente'||role==='Jefe de carrera'}
function v41TeachingOptions(user){
 const categories=db.catalogs.categorias.filter(x=>x.status==='Vigente'||x.code===user?.categoryCode);
 const options=categories.map(x=>`<option value="${esc(x.code)}" ${x.code===user?.categoryCode?'selected':''}>${esc(x.name)}${x.status==='Histórico'?' (histórica)':''}</option>`).join('');
 return `<div class="v41-form-specific-fields" id="v41TeachingFields"><div class="form-field"><label class="required" for="v41Category">Categoría docente</label><select class="v41-reference-select" name="categoryCode" id="v41Category"><option value="">Seleccionar categoría</option>${options}</select></div><div class="form-field"><label class="required" for="v41Career">Carrera de adscripción</label><select class="v41-reference-select" name="careerCode" id="v41Career"><option value="">Seleccionar carrera</option></select></div></div>`;
}
function v41UpdateTeaching(user,reset=false){
 const role=document.querySelector('#editor [name="role"]')?.value;
 const area=document.querySelector('#editor [name="area"]')?.value;
 const container=$('v41TeachingFields'),career=$('v41Career'),category=$('v41Category');
 if(!container||!career||!category)return;
 const academic=v41AcademicRole(role);container.hidden=!academic;
 category.required=career.required=academic;
 if(!academic){category.value='';career.value='';return}
 const campus=(db.catalogs.campus||[]).find(x=>x.name===area);
 const current=reset?'':career.value||user?.careerCode||'';
 const available=(db.catalogs.carreras||[]).filter(x=>x.code===current||x.status==='Vigente'&&(campus&&x.parentCode===campus.code));
 career.innerHTML='<option value="">Seleccionar carrera</option>'+available.map(x=>`<option value="${esc(x.code)}" ${x.code===current?'selected':''}>${esc(x.name)}${x.status==='Histórico'?' (histórica)':''}</option>`).join('');
}
openUser=function(id){
 v41BaseOpenUser(id);
 const user=db.users.find(u=>u.id===id);
 const role=document.querySelector('#editor [name="role"]'),area=document.querySelector('#editor [name="area"]');
 const target=area?.closest('.form-field');if(!target)return;
 target.insertAdjacentHTML('afterend',v41TeachingOptions(user));
 v41UpdateTeaching(user);
 role.addEventListener('change',()=>v41UpdateTeaching(user));
 area.addEventListener('change',()=>v41UpdateTeaching(user,true));
 if(user){
  const changes=user.careerHistory||[];
  const block=document.createElement('details');block.className='v36-assignment-history';
  block.innerHTML=`<summary>Historial de carreras de adscripción <span class="status neutral">${changes.length} movimientos</span></summary><div class="v36-timeline">${changes.length?changes.slice().reverse().map(x=>`<div class="v36-event"><strong>${esc(x.from||'Sin asignación')} → ${esc(x.to||'Sin asignación')}</strong><small>${esc(x.when)} · ${esc(x.reason||'Cambio institucional')}</small></div>`).join(''):'<p class="muted">No hay movimientos registrados.</p>'}</div>`;
  $('modalContent').append(block);
 }
};
const v41UserPreviousSubmit=$('editorForm').onsubmit;
$('editorForm').onsubmit=function(event){
 if(modalAction!=='user')return v41UserPreviousSubmit(event);
 const f=Object.fromEntries(new FormData(event.target)),academic=v41AcademicRole(f.role);
 const existing=db.users.find(u=>u.id===modalItem);
 if(academic){
  const category=db.catalogs.categorias.find(x=>x.code===f.categoryCode);
  const carrera=db.catalogs.carreras.find(x=>x.code===f.careerCode);
  const campus=db.catalogs.campus.find(x=>x.name===f.area);
  if(!category||(!existing||existing.categoryCode!==f.categoryCode)&&category.status!=='Vigente'){
   event.preventDefault();notify('Selecciona una categoría docente vigente');return;
  }
  if(!carrera||!campus||carrera.parentCode!==campus.code||(!existing||existing.careerCode!==f.careerCode)&&carrera.status!=='Vigente'){
   event.preventDefault();notify('Selecciona una carrera vigente del campus indicado');return;
  }
 }
 if(existing&&existing.careerCode!==f.careerCode&&(!f.movementReason?.trim()||!f.movementDate)){
  event.preventDefault();notify('Indica fecha y motivo del cambio de carrera');return;
 }
 const beforeAudit=db.audit.length;
 const previousCareer=existing?.careerCode||'';
 v41UserPreviousSubmit(event);
 if(db.audit.length===beforeAudit)return;
 const updated=db.users.find(u=>u.id===modalItem)||db.users.find(u=>u.num===f.num);
 if(updated){
  const newer=f.careerCode||'';
  if(existing&&previousCareer!==newer){
   updated.careerHistory??=[];
   const from=db.catalogs.carreras.find(x=>x.code===previousCareer)?.name||previousCareer;
   const to=db.catalogs.carreras.find(x=>x.code===newer)?.name||newer;
   updated.careerHistory.push({from,to,when:f.movementDate||v40Today(),reason:f.movementReason||'Cambio de carrera de adscripción'});
   audit('Usuario','Cambio de carrera de adscripción de '+updated.name,from,to);
  }
  persist();
 }
};

render();

// V43: Tabler original en toda la interfaz, excepto el icono de Periodos de captura.
const v42IconShapes={"search": "<circle cx=\"11\" cy=\"11\" r=\"7\"/><path d=\"m20 20-4-4\"/>", "search-off": "<circle cx=\"11\" cy=\"11\" r=\"7\"/><path d=\"m20 20-4-4M3 3l18 18\"/>", "plus": "<path d=\"M12 5v14M5 12h14\"/>", "x": "<path d=\"M18 6 6 18M6 6l12 12\"/>", "pencil": "<path d=\"m16 4 4 4M4 20l4.5-1 11-11a2.8 2.8 0 0 0-4-4l-11 11L4 20z\"/>", "chevron-down": "<path d=\"m6 9 6 6 6-6\"/>", "chevron-left": "<path d=\"m15 6-6 6 6 6\"/>", "chevron-right": "<path d=\"m9 6 6 6-6 6\"/>", "arrow-right": "<path d=\"M5 12h14m-7-7 7 7-7 7\"/>", "arrow-up-right": "<path d=\"M7 17 17 7M7 7h10v10\"/>", "arrow-left-right": "<path d=\"M3 8h18m-5-5 5 5-5 5M21 16H3m5-5-5 5 5 5\"/>", "logout": "<path d=\"M10 17l5-5-5-5m5 5H3m10-9h5a3 3 0 0 1 3 3v12a3 3 0 0 1-3 3h-5\"/>", "users": "<path d=\"M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2m14-14a4 4 0 0 1 0 8m6 6v-2a4 4 0 0 0-3-3.87\"/><circle cx=\"9\" cy=\"7\" r=\"4\"/>", "user-plus": "<path d=\"M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2m18-13v8m-4-4h8\"/><circle cx=\"9\" cy=\"7\" r=\"4\"/>", "calendar-event": "<rect x=\"3\" y=\"5\" width=\"18\" height=\"16\" rx=\"2\"/><path d=\"M7 3v4m10-4v4M3 10h18m-11 5h4\"/>", "calendar-clock": "<rect x=\"3\" y=\"5\" width=\"18\" height=\"16\" rx=\"2\"/><path d=\"M7 3v4m10-4v4M3 10h18\"/><circle cx=\"14\" cy=\"16\" r=\"3\"/><path d=\"M14 14.5V16l1 1\"/>", "calendar-cog": "<rect x=\"3\" y=\"5\" width=\"18\" height=\"16\" rx=\"2\"/><path d=\"M7 3v4m10-4v4M3 10h18\"/><circle cx=\"15\" cy=\"16\" r=\"2\"/>", "calendar-stats": "<rect x=\"3\" y=\"5\" width=\"18\" height=\"16\" rx=\"2\"/><path d=\"M7 3v4m10-4v4M3 10h18m-12 8v-3m4 3v-5m4 5v-2\"/>", "circle-check": "<circle cx=\"12\" cy=\"12\" r=\"9\"/><path d=\"m8 12 3 3 5-6\"/>", "file-check": "<path d=\"M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8zm0 0v6h6M8 16l2 2 5-5\"/>", "file-pencil": "<path d=\"M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8zm0 0v6h6M8 18l3-.6 6-6a2 2 0 0 0-3-3l-6 6L8 18z\"/>", "file-type-csv": "<path d=\"M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8zm0 0v6h6M8 14h8m-8 4h5\"/>", "device-floppy": "<path d=\"M5 3h12l4 4v14H3V3zm2 0v7h9V3m-9 18v-8h10v8M9 7h4\"/>", "history": "<path d=\"M3 12a9 9 0 1 0 3-6.7L3 8m0-5v5h5M12 7v5l4 2\"/>", "upload": "<path d=\"M12 16V3m-5 5 5-5 5 5M4 16v5h16v-5\"/>", "folders": "<path d=\"M3 7V4h8l2 3h8v12H3V7zm-1 5h20v9H2z\"/>", "folder-plus": "<path d=\"M3 7V4h8l2 3h8v13H3zm9 4v6m-3-3h6\"/>", "layout-dashboard": "<rect x=\"3\" y=\"3\" width=\"8\" height=\"8\" rx=\"1\"/><rect x=\"13\" y=\"3\" width=\"8\" height=\"5\" rx=\"1\"/><rect x=\"13\" y=\"10\" width=\"8\" height=\"11\" rx=\"1\"/><rect x=\"3\" y=\"13\" width=\"8\" height=\"8\" rx=\"1\"/>", "layout-sidebar-left-collapse": "<rect x=\"3\" y=\"3\" width=\"18\" height=\"18\" rx=\"2\"/><path d=\"M9 3v18m7-6-3-3 3-3\"/>", "menu-2": "<path d=\"M4 6h16M4 12h16M4 18h16\"/>", "shield-check": "<path d=\"M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10zM8.5 12l2.5 2.5 4.5-5\"/>", "shield-lock": "<path d=\"M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z\"/><rect x=\"9\" y=\"11\" width=\"6\" height=\"5\" rx=\"1\"/><path d=\"M10.5 11V9a1.5 1.5 0 0 1 3 0v2\"/>", "clipboard-list": "<rect x=\"5\" y=\"5\" width=\"14\" height=\"17\" rx=\"2\"/><path d=\"M9 5V3h6v2M9 11h6m-6 4h6m-6 4h4\"/>", "git-pull-request": "<circle cx=\"6\" cy=\"3\" r=\"2\"/><circle cx=\"6\" cy=\"21\" r=\"2\"/><circle cx=\"18\" cy=\"18\" r=\"2\"/><path d=\"M6 5v14M18 16V9a4 4 0 0 0-4-4H9m3-3-3 3 3 3\"/>", "adjustments": "<path d=\"M4 7h16M4 17h16\"/><circle cx=\"9\" cy=\"7\" r=\"2\" fill=\"white\"/><circle cx=\"16\" cy=\"17\" r=\"2\" fill=\"white\"/>", "link": "<path d=\"M10 13a5 5 0 0 0 7 .4l3-3a5 5 0 0 0-7-7l-2 2M14 11a5 5 0 0 0-7-.4l-3 3a5 5 0 0 0 7 7l2-2\"/>", "alert-triangle": "<path d=\"m12 3 10 18H2L12 3zm0 6v5m0 4h.01\"/>", "lock-check": "<rect x=\"4\" y=\"10\" width=\"16\" height=\"12\" rx=\"2\"/><path d=\"M8 10V6a4 4 0 0 1 8 0v4m-6 6 2 2 3-4\"/>", "chalkboard": "<rect x=\"2\" y=\"4\" width=\"20\" height=\"15\" rx=\"2\"/><path d=\"M7 22h10m-5-3v3m-6-9 3 3 4-6\"/>", "user-star": "<circle cx=\"9\" cy=\"8\" r=\"4\"/><path d=\"M2 21v-2a7 7 0 0 1 10-6m6-2 1.3 2.6 2.7.4-2 2 .5 2.7-2.5-1.3-2.5 1.3.5-2.7-2-2 2.7-.4z\"/>", "building-bank": "<path d=\"M3 10h18M4 21h16M5 18h14M3 10l9-7 9 7M7 10v8m5-8v8m5-8v8\"/>", "user-cog": "<circle cx=\"8\" cy=\"8\" r=\"4\"/><path d=\"M2 21v-2a6 6 0 0 1 10-4m5-1v2m0 4v1m-3-4h-1m8 0h-1m-4-3 1-1 1 1m-2 6 1 1 1-1\"/>", "books": "<path d=\"M4 3v18m5-18v18m6-18v18m5-14 2 13-5 1-2-13z\"/>"};

Object.assign(v42IconShapes,{
 'check':'<path d="m5 12 4 4L19 6"/>',
 'clock-check':'<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2m-4 4 2 2 4-4"/>',
 'clock-exclamation':'<circle cx="12" cy="12" r="9"/><path d="M12 7v6m0 4h.01"/>',
 'file-alert':'<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8zm0 0v6h6M12 11v5m0 3h.01"/>',
 'file-description':'<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8zm0 0v6h6M8 13h8m-8 4h8"/>',
 'layout-grid':'<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>',
 'layout-sidebar-left-expand':'<rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 3v18m4-12 3 3-3 3"/>',
 'login-2':'<path d="M10 17l5-5-5-5m5 5H3m10-9h5a3 3 0 0 1 3 3v12a3 3 0 0 1-3 3h-5"/>',
 'user':'<circle cx="12" cy="8" r="4"/><path d="M4 21v-2a8 8 0 0 1 16 0v2"/>'
});

function v42PaintIcons(node=document){
 const iconNodes=[];
 if(node.nodeType===1&&node.matches?.('i.ti'))iconNodes.push(node);
 node.querySelectorAll?.('i.ti').forEach(el=>iconNodes.push(el));
 for(const el of iconNodes){
  if(el.dataset.v42Icon==='yes')continue;
  const key=[...el.classList].find(x=>x.startsWith('ti-'))?.slice(3);
  continue;
  el.dataset.v42Icon='yes';
  el.innerHTML='<svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">'+shape+'</svg>';
 }
}
v42PaintIcons();
// Sacar el menú del contexto de apilamiento del encabezado evita desbordes en pantallas pequeñas.
document.body.appendChild($('profileMenu'));
const v42IconObserver=new MutationObserver(records=>{for(const record of records){for(const node of record.addedNodes){if(node.nodeType===1)v42PaintIcons(node)}}});
v42IconObserver.observe(document.body,{childList:true,subtree:true});
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


// Prioridad a los glifos originales Tabler solo tras confirmar que el archivo
// de tipografía se cargó; sin acceso a Internet se mantienen los SVG locales.
(function v44EnableOriginalTablerWhenAvailable(){
 const enable=()=>{
  if(!document.fonts)return;
  const found=[...document.fonts].some(face=>face.family.replace(/["']/g,'').toLowerCase()==='tabler-icons'&&face.status==='loaded');
  if(found)document.documentElement.classList.add('v44-tabler-loaded');
 };
 const check=()=>{
  if(!document.fonts)return;
  document.fonts.load('20px tabler-icons').then(enable).catch(()=>{});
 };
 if(document.readyState==='complete')check();
 else window.addEventListener('load',check,{once:true});
})();
