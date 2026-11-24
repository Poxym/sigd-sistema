/* ===== Módulo Vicerrectoría · Auditoría Docente (prototipo v2.1 de Carlos) integrado al SIGD =====
   Contenido, datos y lógica: los del prototipo (app.js / styles.css).
   Se quitaron su menú lateral, su encabezado y el simulador de rol: ahora los da el marco SIGD
   (header.top, aside.nav). El rol se toma del usuario que inició sesión. */
const VR=(()=>{
let root=null,cb=()=>{},sec='resumen',pending=null;
const $=id=>root.getElementById(id),$$=s=>[...root.querySelectorAll(s)];
const ITEMS=[['layout-dashboard','Vista General y KPIs','resumen'],['chart-bar','Estadísticas de Reprobación','reprobacion'],['search','Búsqueda e Informes','busqueda'],['flask','Investigación y SNII','investigacion'],['history','Histórico y Comparativas','historico']];
const RESTRINGIDAS=['investigacion','historico']; /* ocultas para el rol secretaria (restricted-route del prototipo) */
/* Rol del prototipo según la cuenta del SIGD. Roles del prototipo: vicerrectoria | rectoria | secretaria | representante */
const ROL_POR_CUENTA={'100':'vicerrectoria','118':'vicerrectoria','000':'vicerrectoria'};
let rolDebug=null; /* solo lo cambia el botón flotante de depuración; si se quita ese bloque queda en null */
const rol=()=>rolDebug||ROL_POR_CUENTA[U&&U.k]||'vicerrectoria';

// ================= BASE DE DATOS DE SIMULACIÓN =================
const baseDocentes=[
    {
        id: 84920, nombre: "Dr. Juan Pérez Díaz", carrera: "Ing. Sistemas",
        planHoras: 360, realHoras: 414, estado: "cumplido", perfilDeseable: true,
        actividadesDetalle: [
            { nombre: "Impartir 240 hrs frente a grupo", cumplida: true },
            { nombre: "Tutorías (20 alumnos asignados)", cumplida: true },
            { nombre: "Publicación de artículo en revista JCR", cumplida: true },
            { nombre: "Participación en comité de titulación", cumplida: true }
        ],
        actividadesExtra: ["Asesoría externa a proyecto de titulación", "Taller intersemestral impartido"],
        sni: true, sniNivel: "Nivel II", puntosAcreditados: 15
    },
    {
        id: 10482, nombre: "Dr. Luis Ramos Villa", carrera: "Bioingeniería",
        planHoras: 240, realHoras: 180, estado: "critico", perfilDeseable: false,
        actividadesDetalle: [
            { nombre: "Impartir 180 hrs frente a grupo", cumplida: true },
            { nombre: "Tutorías (15 alumnos asignados)", cumplida: false }, 
            { nombre: "Publicación de artículo de divulgación", cumplida: false }
        ],
        sni: false,
        justificacion: "Discrepancia crítica detectada: Declaró 0 horas de tutoría en su informe, pero tiene asignado un padrón real de 15 alumnos en el Sistema de Control Escolar corporativo."
    },
    {
        id: 10293, nombre: "Mtra. Ana Gómez Ruiz", carrera: "Matemáticas",
        planHoras: 200, realHoras: 170, estado: "incompleto", perfilDeseable: false,
        actividadesDetalle: [
            { nombre: "Impartir 150 hrs frente a grupo", cumplida: true },
            { nombre: "Tutorías (10 alumnos asignados)", cumplida: true },
            { nombre: "Diseño de nuevo material didáctico", cumplida: false }
        ],
        sni: false
    },
    {
        id: 44102, nombre: "Dra. María Antonieta Solís", carrera: "Bioingeniería",
        planHoras: 400, realHoras: 120, estado: "extraordinario", perfilDeseable: true,
        actividadesDetalle: [
            { nombre: "Proyecto de investigación Sabático", cumplida: true },
            { nombre: "Dirección de 2 tesis de posgrado a distancia", cumplida: true }
        ],
        sni: true, sniNivel: "Candidata",
        justificacion: "Incapacidad médica legal por periodo prolongado y año sabático internacional autorizado. Estatus congelado por acuerdo de Vicerrectoría."
    }
];
// ================= AMPLIACIÓN MINUTA No. 18 (solo prototipo visual, datos de simulación) =================
// Campus, semestre, fecha de ingreso, trayectoria de investigación y evaluación estudiantil por docente.
const EXTRA_DOC={
 84920:{campus:'Tehuantepec',semestre:'5°',ingreso:2012,evalEst:4.6,
  inv:[{a:2013,t:'Optimización de redes de sensores inalámbricos',tipo:'Proyecto',campus:'Tehuantepec'},
       {a:2016,t:'Sistemas de recomendación para bibliotecas universitarias',tipo:'Artículo',campus:'Tehuantepec'},
       {a:2019,t:'Estancia de investigación en cómputo distribuido',tipo:'Estancia',campus:'Externo'},
       {a:2022,t:'Detección de anomalías en tráfico de red con aprendizaje automático',tipo:'Artículo JCR',campus:'Tehuantepec'},
       {a:2025,t:'Plataforma de monitoreo energético del campus',tipo:'Proyecto',campus:'Tehuantepec'}]},
 10482:{campus:'Tehuantepec',semestre:'3°',ingreso:2018,evalEst:3.4,
  inv:[{a:2019,t:'Biomateriales a partir de residuos agrícolas',tipo:'Proyecto',campus:'Tehuantepec'},
       {a:2023,t:'Divulgación: la bioingeniería en el Istmo',tipo:'Divulgación',campus:'Externo'}]},
 10293:{campus:'Tehuantepec',semestre:'1°',ingreso:2015,evalEst:4.1,
  inv:[{a:2017,t:'Material didáctico para cálculo diferencial',tipo:'Material',campus:'Tehuantepec'},
       {a:2021,t:'Modelos matemáticos de crecimiento poblacional regional',tipo:'Artículo',campus:'Tehuantepec'}]},
 44102:{campus:'Tehuantepec',semestre:'7°',ingreso:2009,evalEst:4.8,
  inv:[{a:2010,t:'Ingeniería de tejidos: andamios biodegradables',tipo:'Proyecto',campus:'Tehuantepec'},
       {a:2014,t:'Patente: dispositivo de cultivo celular de bajo costo',tipo:'Patente',campus:'Tehuantepec'},
       {a:2018,t:'Red temática de biomateriales',tipo:'Red',campus:'Externo'},
       {a:2024,t:'Proyecto sabático: biosensores para diagnóstico rural',tipo:'Proyecto',campus:'Externo'}]}
};
baseDocentes.forEach(d=>Object.assign(d,EXTRA_DOC[d.id]||{}));

// Campus y carreras de la simulación (los nombres de Ixtepec y Juchitán son de ejemplo).
const CAMPUS={'Tehuantepec':['Ing. Sistemas','Bioingeniería','Matemáticas'],'Ixtepec':['Ing. Computación','Administración'],'Juchitán':['Ing. Petrolera','Enfermería']};
const SEMS=['1°','3°','5°','7°','9°'];
const PERIODOS=['2025-2026','2024-2025'];
const NOM_A=['Mtro. Raúl','Dra. Elena','Mtro. Iván','Mtra. Rosa','Dr. Pablo','Mtra. Laura','Dr. Óscar','Mtra. Paula','Mtro. Hugo','Dra. Irma','Mtro. José','Mtra. Karla','Dr. Andrés','Mtra. Sofía'];
const NOM_B=['Cruz','Ortiz','Toledo','Matus','Vera','Pineda','Luna'];
function rng(seed){let s=seed;return()=>{s=(s*9301+49297)%233280;return s/233280}}
function genReprob(periodo){
 const r=rng(periodo==='2025-2026'?7:13),out=[];let n=0;
 Object.entries(CAMPUS).forEach(([c,cars])=>cars.forEach(car=>SEMS.forEach(sem=>{for(let k=0;k<2;k++){
  const ins=18+Math.floor(r()*22),base=c==='Juchitán'?.2:c==='Ixtepec'?.14:.1,delta=periodo==='2024-2025'?.02:0;
  const rep=Math.round(ins*Math.max(0,base+delta+(r()-.5)*.18));
  out.push({campus:c,carrera:car,semestre:sem,profesor:NOM_A[n%NOM_A.length]+' '+NOM_B[Math.floor(n/NOM_A.length)%NOM_B.length],id:null,ins,rep});n++}})));
 baseDocentes.forEach(d=>{const row=out.find(x=>x.campus===d.campus&&x.carrera===d.carrera&&x.semestre===d.semestre);if(row){row.profesor=d.nombre;row.id=d.id}});
 return out}
const REPROB={};PERIODOS.forEach(p=>REPROB[p]=genReprob(p));
const LV=['campus','carrera','semestre','profesor'];
const LV_TXT={global:'Global',campus:'Campus',carrera:'Carrera',semestre:'Semestre',profesor:'Profesor'};
const LV_PL={campus:'campus',carrera:'carreras',semestre:'semestres',profesor:'profesores'};
const EVAL_CARRERA={'Ing. Sistemas':4.4,'Bioingeniería':3.9,'Matemáticas':4.1,'Ing. Computación':4.3,'Administración':4.0,'Ing. Petrolera':3.7,'Enfermería':4.5};

// ----- Estado del prototipo (vive en memoria; sobrevive a los cambios de rol y de pestaña) -----
const F={campus:'',carrera:'',semestre:'',periodo:'2025-2026',semaforo:''};
const CARDS=[['balance','Balance Global: Planeado vs. Realizado'],['kpis','Indicadores clave (KPIs)'],['incidencias','Monitor de Entregas e Incidencias'],
 ['reprob','Promedio de alumnos reprobados'],['incump','Incumplimientos detectados'],['reprob2','Reprobación: segunda vista para comparar'],['eval','Evaluación estudiantil (opcional)']];
const nomCard=id=>(CARDS.find(c=>c[0]===id)||[,(typeof NOMBRES_EXTRA!=='undefined'&&NOMBRES_EXTRA[id])||id])[1];
const clone=o=>JSON.parse(JSON.stringify(o));
const FABRICA={order:['balance','kpis','reprob','incidencias','reprob2','incump','eval'],vis:{balance:1,kpis:1,incidencias:1,reprob:1,incump:1,reprob2:0,eval:0},
 disp:{balance:1,kpis:1,incidencias:1,reprob:1,incump:1,reprob2:1,eval:1},persp:'campus',vista:'barras'};
let DEF=clone(FABRICA),MINE=null,VISTAS=[],vistaAct='def',drawerOpen=false,aviso='';
const cfg=()=>MINE||DEF;
const esConfig=()=>rol()==='configurador';
const RC={reprob:{persp:'campus',path:[],vista:'barras'},reprob2:{persp:'semestre',path:[],vista:'barras'}};
const COLS={emp:1,campus:1,plan:1,estado:1,punt:1};
const COLS_TXT={emp:'N° Emp.',campus:'Campus',plan:'Plan vs. Real',estado:'Estado',punt:'Puntuación'};
let XT='cumplimiento',XINV=false;
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const pct=n=>n.toFixed(1)+'%';
const tono=p=>p<10?'ok':p<18?'warn':'bad';
const editable=()=>{if(!MINE){MINE=clone(DEF);vistaAct='mine'}return MINE};

// ----- Barra de filtros compartida (Vista General y Búsqueda) -----
function renderChips(){
 const el=$('vr-chips');if(!el)return;
 const cars=F.campus?CAMPUS[F.campus]:[].concat(...Object.values(CAMPUS));
 const sel=(k,lbl,ops,todos)=>`<label class="chip${F[k]?' on':''}"><span>${lbl}</span><select data-chip="${k}">${todos?`<option value="">${todos}</option>`:''}${ops.map(o=>{const v=Array.isArray(o)?o[0]:o,t=Array.isArray(o)?o[1]:o;return`<option value="${esc(v)}"${F[k]===v?' selected':''}>${esc(t)}</option>`}).join('')}</select></label>`;
 el.innerHTML=`<span class="chips-lbl"><i class="ti ti-filter"></i> Filtros</span>
  ${sel('campus','Campus',Object.keys(CAMPUS),'Todos')}
  ${sel('carrera','Carrera',cars,'Todas')}
  ${sel('semestre','Semestre',SEMS,'Todos')}
  ${sel('periodo','Periodo',PERIODOS,'')}
  ${sel('semaforo','Semáforo',[['cumplido','🟢 Cumplido'],['incompleto','🟡 Incompleto'],['critico','🔴 Crítico'],['extraordinario','🟣 Extraordinario']],'Todos')}
  ${(F.campus||F.carrera||F.semestre||F.semaforo)?'<button class="chip-clear" data-act="chips-clear"><i class="ti ti-x"></i> Limpiar filtros</button>':''}
  <span class="chips-note">Datos de simulación</span>`;
}
function cambiarChip(k,v){F[k]=v;if(k==='campus'&&F.carrera&&v&&!CAMPUS[v].includes(F.carrera))F.carrera='';refrescar()}
function refrescar(){renderChips();renderNuevas();aplicarFiltros();guardarConfig()}

// ----- Tarjetas nuevas de la Vista General -----
function filasBase(){return REPROB[F.periodo].filter(x=>(!F.campus||x.campus===F.campus)&&(!F.carrera||x.carrera===F.carrera)&&(!F.semestre||x.semestre===F.semestre))}
function agrupar(rows,key){const m=new Map();rows.forEach(x=>{const o=m.get(x[key])||{k:x[key],ins:0,rep:0,id:x.id,campus:x.campus,carrera:x.carrera};o.ins+=x.ins;o.rep+=x.rep;m.set(x[key],o)});
 const a=[...m.values()].map(o=>({...o,p:o.ins?o.rep/o.ins*100:0}));
 return key==='semestre'?a.sort((x,y)=>SEMS.indexOf(x.k)-SEMS.indexOf(y.k)):a.sort((x,y)=>y.p-x.p)}
function renderReprob(cid){
 const el=$('card-'+cid);if(!el)return;const st=RC[cid];
 let rows=filasBase();st.path.forEach(p=>rows=rows.filter(x=>x[p.k]===p.v));
 const tot=rows.reduce((a,x)=>({ins:a.ins+x.ins,rep:a.rep+x.rep}),{ins:0,rep:0}),pg=tot.ins?tot.rep/tot.ins*100:0;
 const key=st.persp==='global'?'campus':st.persp,next=LV[LV.indexOf(key)+1],data=agrupar(rows,key),max=Math.max(25,...data.map(d=>d.p));
 const ruta=['<button class="crumb" data-act="rp-crumb" data-c="'+cid+'" data-i="0">Global</button>'].concat(st.path.map((p,i)=>`<i class="ti ti-chevron-right"></i><button class="crumb" data-act="rp-crumb" data-c="${cid}" data-i="${i+1}">${esc(p.v)}</button>`)).join('');
 const persp=['global','campus','carrera','semestre','profesor'].map(p=>`<button class="seg${st.persp===p?' on':''}" data-act="rp-persp" data-c="${cid}" data-v="${p}">${LV_TXT[p]}</button>`).join('');
 const titulo=st.persp==='global'&&!st.path.length?'Promedio global (todos los campus)':'Promedio en esta selección';
 let cuerpo;
 if(!data.length)cuerpo='<p class="empty">No hay datos con los filtros actuales.</p>';
 else if(st.vista==='tabla')cuerpo=`<table class="rp-tabla"><thead><tr><th>${LV_TXT[key]}</th><th>Inscritos</th><th>Reprobados</th><th>Promedio</th><th></th></tr></thead><tbody>${data.map(d=>`<tr><td class="font-bold">${esc(d.k)}</td><td>${d.ins}</td><td>${d.rep}</td><td><span class="rp-pill ${tono(d.p)}">${pct(d.p)}</span></td><td class="text-right">${accion(cid,key,next,d)}</td></tr>`).join('')}</tbody></table>`;
 else cuerpo=`<div class="rp-bars">${data.map(d=>`<div class="rp-row"><div class="rp-lbl" title="${esc(d.k)}">${esc(d.k)}${key==='profesor'?`<small>${esc(d.carrera)} · ${esc(d.campus)}</small>`:''}</div><div class="rp-track"><div class="rp-bar ${tono(d.p)}" style="width:${Math.max(2,d.p/max*100)}%"></div></div><div class="rp-val">${pct(d.p)}<small>${d.rep}/${d.ins}</small></div><div class="rp-go">${accion(cid,key,next,d)}</div></div>`).join('')}</div>`;
 el.innerHTML=`<div class="flex-row-between rp-top"><div><span class="tag-meta">Rendimiento escolar · ${esc(F.periodo)}</span><h3 class="card-title mt-1">${nomCard(cid)}</h3>
  <p class="card-subtitle">${titulo}: <b class="rp-big ${tono(pg)}">${pct(pg)}</b> · ${tot.rep} de ${tot.ins} alumnos</p></div>
  <div class="rp-tools"><div class="segs" role="group" aria-label="Perspectiva">${persp}</div>
  <div class="segs" role="group" aria-label="Vista"><button class="seg${st.vista==='barras'?' on':''}" data-act="rp-vista" data-c="${cid}" data-v="barras" title="Gráfica"><i class="ti ti-chart-bar"></i></button><button class="seg${st.vista==='tabla'?' on':''}" data-act="rp-vista" data-c="${cid}" data-v="tabla" title="Tabla"><i class="ti ti-list"></i></button></div></div></div>
  <div class="crumbs">${ruta}</div>${cuerpo}
  <div class="rp-legend"><span><i class="dot ok"></i>Menos de 10%</span><span><i class="dot warn"></i>10% a 18%</span><span><i class="dot bad"></i>Más de 18%</span>${next&&data.length?'<span class="rp-hint">Usa «Ver…» en una fila para bajar de nivel</span>':''}${cid==='reprob'?'<button class="link-action rs-link" data-act="go" data-v="reprobacion">Ver estadísticas completas →</button>':''}</div>`;
}
function accion(cid,key,next,d){
 if(key==='profesor')return d.id?`<button class="link-action" data-act="audit" data-v="${d.id}">Ver expediente →</button>`:'<span class="muted-xs">Sin expediente en la demo</span>';
 return `<button class="link-action" data-act="rp-drill" data-c="${cid}" data-k="${key}" data-v="${esc(d.k)}">Ver ${LV_PL[next]} →</button>`}
function rpDrill(cid,k,v){const st=RC[cid];st.path.push({k,v});st.persp=LV[LV.indexOf(k)+1];renderReprob(cid);guardarConfig()}
function rpCrumb(cid,i){const st=RC[cid];st.path=st.path.slice(0,i);st.persp=i===0?(st.persp==='global'?'global':'campus'):LV[LV.indexOf(st.path[i-1].k)+1];renderReprob(cid);guardarConfig()}

function docsFiltrados(){return baseDocentes.filter(d=>(!F.campus||d.campus===F.campus)&&(!F.carrera||d.carrera===F.carrera)&&(!F.semestre||d.semestre===F.semestre)&&(!F.semaforo||d.estado===F.semaforo))}
function renderIncump(){
 const el=$('card-incump');if(!el)return;const lista=[];
 docsFiltrados().forEach(d=>d.actividadesDetalle.filter(a=>!a.cumplida).forEach(a=>lista.push({d,a})));
 el.innerHTML=`<div class="flex-row-between"><div><span class="tag-meta" style="background:var(--red-bg);color:var(--red-text)">Comprometido vs. realizado</span><h3 class="card-title mt-1">Incumplimientos detectados <span class="count-pill">${lista.length}</span></h3>
  <p class="card-subtitle">Actividades que el docente comprometió en su plan de trabajo y no aparecen en su informe final.</p></div></div>
  ${lista.length?`<div class="inc-list">${lista.map(({d,a})=>`<div class="inc-row"><i class="ti ti-x inc-x"></i><div class="inc-main"><b>${esc(a.nombre)}</b><small>${esc(d.nombre)} · ${esc(d.carrera)} · ${esc(d.campus||'')}</small></div><button class="link-action text-red" data-act="audit" data-v="${d.id}" data-tab="cumplimiento">Ver expediente →</button></div>`).join('')}</div>`:'<p class="empty">Sin incumplimientos con los filtros actuales.</p>'}`;
}
function estrellas(v){const n=Math.round(v);return '<span class="stars">'+'★'.repeat(n)+'<span class="off">'+'★'.repeat(5-n)+'</span></span>'}
function renderEval(){
 const el=$('card-eval');if(!el)return;
 const cars=Object.entries(EVAL_CARRERA).filter(([c])=>(!F.carrera||c===F.carrera)&&(!F.campus||CAMPUS[F.campus].includes(c)));
 el.innerHTML=`<span class="tag-meta">Opcional · Minuta No. 18</span><h3 class="card-title mt-1">${nomCard('eval')}</h3><p class="card-subtitle">Promedio de la evaluación que los alumnos hacen a sus profesores, escala de 1 a 5.</p>
  <div class="rp-bars mt-4">${cars.map(([c,v])=>`<div class="rp-row"><div class="rp-lbl">${esc(c)}</div><div class="rp-track"><div class="rp-bar ev" style="width:${v/5*100}%"></div></div><div class="rp-val">${v.toFixed(1)}<small>${estrellas(v)}</small></div><div class="rp-go"></div></div>`).join('')||'<p class="empty">Sin datos.</p>'}</div>`;
}
function renderNuevas(){renderReprob('reprob');renderReprob('reprob2');renderIncump();renderEval();renderEstad()}

// ----- Panel configurable -----
function aplicarPanel(){
 const s=$('section-resumen');if(!s)return;const c=cfg();
 const vis=c.order.filter(id=>c.vis[id]&&(esConfig()||DEF.disp[id]));
 c.order.forEach(id=>{const el=s.querySelector(`[data-card="${id}"]`);if(!el)return;el.hidden=!vis.includes(id);s.appendChild(el)});
 $('vr-empty').hidden=vis.length>0;s.appendChild($('vr-empty'));
 renderVistas();if(drawerOpen)renderDrawer();guardarConfig();
}
function renderVistas(){
 const el=$('vr-views');if(!el)return;
 el.innerHTML=`<span class="chips-lbl"><i class="ti ti-layout-grid"></i> Vistas</span>
  <button class="vchip${vistaAct==='def'?' on':''}" data-act="vista-def">Predeterminada</button>
  ${MINE&&vistaAct==='mine'?'<button class="vchip on">Mi vista (sin guardar)</button>':''}
  ${VISTAS.map((v,i)=>`<span class="vchip${vistaAct===i?' on':''}"><button data-act="vista-ir" data-v="${i}">${esc(v.n)}</button><button class="vx" data-act="vista-del" data-v="${i}" title="Eliminar vista"><i class="ti ti-x"></i></button></span>`).join('')}
  ${aviso?`<span class="vr-aviso"><i class="ti ti-check"></i> ${esc(aviso)}</span>`:''}`;
}
function renderDrawer(){
 const d=$('vr-drawer');if(!d)return;const c=cfg();
 const lista=c.order.filter(id=>esConfig()||DEF.disp[id]);
 d.innerHTML=`<div class="dr-hd"><div><h3>Personalizar panel</h3><p>${esConfig()?'Rol Configurador: tus cambios se pueden aplicar a todos.':'Los cambios solo afectan tu vista.'}</p></div><button class="dr-x" data-act="drawer-close" title="Cerrar"><i class="ti ti-x"></i></button></div>
 <div class="dr-body">
  ${sec!=='resumen'?`<div class="dr-note"><i class="ti ti-info-circle"></i><div>Las tarjetas se muestran en la <b>Vista General</b>. <button class="link-action" data-act="go" data-v="resumen">Ir a la Vista General →</button></div></div>`:''}
  <p class="dr-sec">Tarjetas de la Vista General</p>
  <ul class="dr-list">${lista.map((id,i)=>`<li><label><input type="checkbox" data-vis="${id}"${c.vis[id]?' checked':''}> <span>${nomCard(id)}</span></label>
   <span class="dr-mv"><button data-act="mv" data-v="${id}" data-d="-1" title="Subir"${i===0?' disabled':''}><i class="ti ti-chevron-up"></i></button><button data-act="mv" data-v="${id}" data-d="1" title="Bajar"${i===lista.length-1?' disabled':''}><i class="ti ti-chevron-down"></i></button></span>
   ${esConfig()?`<label class="dr-sw" title="Si se apaga, los demás roles no pueden ver esta tarjeta"><input type="checkbox" data-disp="${id}"${DEF.disp[id]?' checked':''}> Disponible para todos los roles</label>`:''}</li>`).join('')}</ul>
  <details class="dr-adv"><summary>Opciones avanzadas</summary>
   <label class="filter-label mt-4">Perspectiva inicial de reprobación</label><select class="filter-input" data-adv="persp">${['global','campus','carrera','semestre','profesor'].map(p=>`<option value="${p}"${c.persp===p?' selected':''}>${LV_TXT[p]}</option>`).join('')}</select>
   <label class="filter-label mt-4">Mostrar la reprobación como</label><select class="filter-input" data-adv="vista"><option value="barras"${c.vista==='barras'?' selected':''}>Gráfica de barras</option><option value="tabla"${c.vista==='tabla'?' selected':''}>Tabla</option></select>
  </details>
  <p class="dr-sec">Columnas de la tabla de Búsqueda</p>
  <div class="dr-cols">${Object.keys(COLS).map(k=>`<label><input type="checkbox" data-colchk="${k}"${COLS[k]?' checked':''}> ${COLS_TXT[k]}</label>`).join('')}</div>
  <p class="dr-sec">Guardar esta vista</p>
  <div class="dr-save"><input class="filter-input" id="vista-nombre" placeholder="Ej. Por campus" maxlength="30"><button class="btn-secondary" data-act="vista-save"><i class="ti ti-device-floppy"></i> Guardar</button></div>
  ${esConfig()?`<div class="dr-conf"><p class="dr-sec"><i class="ti ti-user-cog"></i> Configurador</p><button class="btn-primary" data-act="def-set"><i class="ti ti-check"></i> Aplicar como predeterminada para todos</button><button class="btn-secondary mt-2" data-act="def-fab"><i class="ti ti-refresh"></i> Volver al diseño original</button></div>`:''}
 </div>
 <p class="dr-ls"><i class="ti ti-device-floppy"></i> La configuración se guarda en este navegador. <button class="link-action" data-act="ls-clear">Borrar lo guardado</button></p>
 <div class="dr-ft"><button class="btn-secondary" data-act="reset"><i class="ti ti-refresh"></i> Restablecer</button><button class="btn-primary" data-act="drawer-close">Listo</button></div>`;
}
function abrirDrawer(o){drawerOpen=o;$('vr-drawer').hidden=!o;$('vr-scrim').hidden=!o;if(o)renderDrawer()}
function avisar(t){aviso=t;renderVistas();setTimeout(()=>{if(aviso===t){aviso='';if(root)renderVistas()}},2600)}
function mover(id,dir){const c=editable(),o=c.order,lista=o.filter(x=>esConfig()||DEF.disp[x]),i=lista.indexOf(id),j=i+dir;if(j<0||j>=lista.length)return;
 const a=o.indexOf(lista[i]),b=o.indexOf(lista[j]);[o[a],o[b]]=[o[b],o[a]];aplicarPanel()}
function aplicarAvanzadas(){const c=cfg();RC.reprob.persp=c.persp;RC.reprob.path=[];RC.reprob.vista=c.vista;renderReprob('reprob')}

// ----- Columnas de la tabla de Búsqueda -----
function aplicarColumnas(){const st=$('vr-cols-css');if(st)st.textContent=Object.keys(COLS).filter(k=>!COLS[k]).map(k=>`.custom-table [data-col="${k}"]{display:none}`).join('');
 const p=$('vr-cols-pop');if(p)p.innerHTML=Object.keys(COLS).map(k=>`<label><input type="checkbox" data-colchk="${k}"${COLS[k]?' checked':''}> ${COLS_TXT[k]}</label>`).join('');guardarConfig()}

// ----- Expediente del docente: informe -----
function informeHTML(doc){
 const ok=doc.actividadesDetalle.filter(a=>a.cumplida).length,tot=doc.actividadesDetalle.length;
 return `<div class="rep"><div class="rep-hd"><div><small>Universidad del Istmo · Vicerrectoría Académica</small><h2>Informe individual del docente</h2><p>Periodo ${esc(F.periodo)} · Generado el ${new Date().toLocaleDateString('es-MX')}</p></div><span class="rep-tag">Prototipo · datos de simulación</span></div>
 <table class="rep-kv"><tr><th>Docente</th><td>${esc(doc.nombre)}</td><th>N° de empleado</th><td>${doc.id}</td></tr><tr><th>Carrera</th><td>${esc(doc.carrera)}</td><th>Campus</th><td>${esc(doc.campus||'')}</td></tr><tr><th>Ingreso</th><td>${doc.ingreso||''}</td><th>SNII</th><td>${doc.sni?esc(doc.sniNivel):'No'}</td></tr></table>
 <h3>Cumplimiento del plan de trabajo</h3><p>Horas planeadas: <b>${doc.planHoras}</b> · Horas reportadas: <b>${doc.realHoras}</b> (${Math.round(doc.realHoras/doc.planHoras*100)}%) · Actividades cumplidas: <b>${ok} de ${tot}</b></p>
 <table class="rep-t"><thead><tr><th>Actividad comprometida</th><th>Estado</th></tr></thead><tbody>${doc.actividadesDetalle.map(a=>`<tr${a.cumplida?'':' class="bad"'}><td>${esc(a.nombre)}</td><td>${a.cumplida?'Cumplida':'Incumplida'}</td></tr>`).join('')}</tbody></table>
 <h3>Trayectoria de investigación</h3><table class="rep-t"><thead><tr><th>Año</th><th>Trabajo</th><th>Tipo</th><th>Lugar</th></tr></thead><tbody>${(doc.inv||[]).map(x=>`<tr><td>${x.a}</td><td>${esc(x.t)}</td><td>${esc(x.tipo)}</td><td>${esc(x.campus)}</td></tr>`).join('')}</tbody></table>
 ${(()=>{const r=repDoc(doc);if(!r)return'';return `<h3>Reprobación de sus grupos</h3><p>${r.dif>0?'<b>'+r.dif.toFixed(1)+' pts arriba</b>':'<b>'+Math.abs(r.dif).toFixed(1)+' pts abajo</b>'} del promedio de su carrera.</p><table class="rep-t"><thead><tr><th>Comparación</th><th>Reprobados</th><th>Promedio</th><th>Periodo anterior</th></tr></thead><tbody>${r.filas.map((f,i)=>`<tr${i===0?' class="me"':''}><td>${esc(f.k)}</td><td>${f.rep} de ${f.ins}</td><td><b>${pct(f.p)}</b></td><td>${pct(f.a)}</td></tr>`).join('')}</tbody></table>`})()}
 ${doc.evalEst?`<h3>Evaluación estudiantil</h3><p>Promedio: <b>${doc.evalEst.toFixed(1)} / 5</b></p>`:''}
 ${doc.justificacion?`<h3>Observaciones</h3><p>${esc(doc.justificacion)}</p>`:''}</div>`}
const REP_CSS=`body{font-family:Inter,system-ui,sans-serif;color:#172b4d;margin:32px}.rep h2{font-size:20px;margin:4px 0}.rep h3{font-size:14px;margin:22px 0 8px;color:#0f766e;text-transform:uppercase;letter-spacing:.05em}.rep p{font-size:12.5px;margin:4px 0}.rep small{color:#60738a;font-size:11px}
.rep-hd{display:flex;justify-content:space-between;align-items:flex-start;border-bottom:2px solid #0f766e;padding-bottom:12px}.rep-tag{font-size:10px;font-weight:700;background:#fef3c7;color:#92400e;border-radius:6px;padding:3px 8px}
.rep-kv,.rep-t{width:100%;border-collapse:collapse;font-size:12px;margin-top:12px}.rep-kv th,.rep-t th{text-align:left;color:#60738a;font-weight:600;padding:6px 8px;background:#f4f7fb}.rep-kv td,.rep-t td{padding:6px 8px;border-bottom:1px solid #d7e1ec}.rep-t tr.bad td{color:#b42318;background:#fff1f0}.rep-t tr.me td{font-weight:700;background:#e4f4f2}`;
function descargarPDF(id){
 const doc=baseDocentes.find(d=>d.id===id);if(!doc)return;
 /* Se imprime desde un iframe oculto: el SIGD define una función global open() que tapa a window.open. */
 const old=document.getElementById('vr-print-frame');if(old)old.remove();
 const f=document.createElement('iframe');f.id='vr-print-frame';f.setAttribute('aria-hidden','true');f.title='Informe';
 f.style.cssText='position:fixed;right:0;bottom:0;width:0;height:0;border:0;visibility:hidden';
 f.srcdoc=`<!DOCTYPE html><html lang="es"><head><meta charset="utf-8"><title>Informe ${esc(doc.nombre)}</title><style>${REP_CSS}@media print{body{margin:12mm}}</style></head><body>${informeHTML(doc)}</body></html>`;
 f.onload=()=>setTimeout(()=>{try{f.contentWindow.focus();f.contentWindow.print()}catch(e){avisar('No se pudo abrir la impresión')}},150);
 document.body.appendChild(f);
}

// ----- Apartado "Estadísticas de Reprobación" -----
const NOMBRES_EXTRA={reprobS:'Explorar: de lo global al profesor'};
RC.reprobS={persp:'global',path:[],vista:'barras'};
const sumP=rows=>{const t=rows.reduce((a,x)=>({ins:a.ins+x.ins,rep:a.rep+x.rep}),{ins:0,rep:0});return{...t,p:t.ins?t.rep/t.ins*100:0}};
function barras(data,opt={}){const max=Math.max(25,...data.map(d=>d.p));
 return data.length?`<div class="rp-bars">${data.map(d=>`<div class="rp-row rs-row${opt.sel&&d.k===opt.sel?' sel':''}"><div class="rp-lbl" title="${esc(d.k)}">${esc(d.k)}${opt.sub?`<small>${esc(opt.sub(d))}</small>`:''}</div><div class="rp-track"><div class="rp-bar ${tono(d.p)}" style="width:${Math.max(2,d.p/max*100)}%"></div></div><div class="rp-val">${pct(d.p)}<small>${d.rep}/${d.ins}</small></div>${opt.go?`<div class="rp-go">${opt.go(d)}</div>`:''}</div>`).join('')}</div>`:'<p class="empty">No hay datos con los filtros actuales.</p>'}
function renderEstad(){
 if(!$('rs-kpis'))return;
 const P=F.periodo,ant=PERIODOS.find(p=>p!==P);
 const sinCampus=rows=>rows.filter(x=>(!F.carrera||x.carrera===F.carrera)&&(!F.semestre||x.semestre===F.semestre));
 const all=sinCampus(REPROB[P]),allAnt=sinCampus(REPROB[ant]),g=sumP(all),gA=sumP(allAnt);
 const tend=(a,b)=>{const d=a-b;return `<span class="rs-tr ${d>0?'up':'down'}"><i class="ti ti-trending-${d>0?'up':'down'}"></i> ${d>0?'+':''}${d.toFixed(1)} pts vs ${ant}</span>`};
 const camp=Object.keys(CAMPUS).map(c=>({c,...sumP(all.filter(x=>x.campus===c)),a:sumP(allAnt.filter(x=>x.campus===c)).p})).filter(x=>x.ins);
 $('rs-kpis').innerHTML=`<div class="card kpi-card rs-kpi rs-global"><p class="kpi-label">Global · todos los campus</p><div class="kpi-value-group"><span class="kpi-value">${pct(g.p)}</span><span class="kpi-unit">reprobados</span></div><small>${g.rep} de ${g.ins} alumnos</small>${tend(g.p,gA.p)}</div>`+
  camp.map(x=>{const d=x.p-g.p;return `<div class="card kpi-card rs-kpi${F.campus===x.c?' sel':''}"><p class="kpi-label">Campus ${esc(x.c)}</p><div class="kpi-value-group"><span class="kpi-value rs-v ${tono(x.p)}">${pct(x.p)}</span></div><small class="${d>0?'text-red':'text-success'} font-bold">${d>0?'+':''}${d.toFixed(1)} pts ${d>0?'arriba':'abajo'} del global</small>${tend(x.p,x.a)}</div>`}).join('');
 // Matriz semestre × campus
 const cols=Object.keys(CAMPUS);
 $('rs-matrix').innerHTML=`<span class="tag-meta">Comparativa entre campus · ${esc(P)}</span><h3 class="card-title mt-1">Promedio de reprobación por semestre en cada campus</h3><p class="card-subtitle">Cada celda es el porcentaje de alumnos reprobados. La última columna es el promedio global de todos los campus.</p>
  <table class="rs-mx"><thead><tr><th>Semestre</th>${cols.map(c=>`<th${F.campus===c?' class="sel"':''}>${esc(c)}</th>`).join('')}<th>Global</th></tr></thead><tbody>${SEMS.filter(s=>!F.semestre||s===F.semestre).map(s=>{const rs=all.filter(x=>x.semestre===s);return `<tr><td class="font-bold">${s}</td>${cols.map(c=>{const v=sumP(rs.filter(x=>x.campus===c));return v.ins?`<td><span class="rp-pill ${tono(v.p)}">${pct(v.p)}</span></td>`:'<td class="muted-xs">—</td>'}).join('')}<td><b>${pct(sumP(rs).p)}</b></td></tr>`}).join('')}</tbody></table>`;
 // Cuatro perspectivas
 const base=filasBase(),cab=(t,s)=>`<h3 class="card-title">${t}</h3><p class="card-subtitle">${s}</p><div class="mt-4"></div>`;
 $('rs-carrera').innerHTML=cab('Por carrera','Ordenado de mayor a menor reprobación.')+barras(agrupar(base,'carrera'),{sub:d=>d.campus});
 $('rs-semestre').innerHTML=cab('Por semestre','Del primero al noveno semestre.')+barras(agrupar(base,'semestre'));
 const prof=agrupar(base,'profesor').slice(0,8);
 $('rs-profesor').innerHTML=cab('Por profesor','Los 8 grupos con mayor reprobación.')+barras(prof,{sub:d=>d.carrera+' · '+d.campus,go:d=>d.id?`<button class="link-action" data-act="audit" data-v="${d.id}">Expediente →</button>`:''});
 $('rs-campus').innerHTML=cab('Por campus','Comparación entre campus con los mismos filtros de carrera y semestre.')+barras(agrupar(all,'campus'),{sel:F.campus});
 renderReprob('reprobS');
}

// ----- Reprobación de los grupos del docente (extra del informe) -----
function repDoc(doc){
 const P=F.periodo,ant=PERIODOS.find(p=>p!==P),R=REPROB[P],RA=REPROB[ant];
 const g=R.filter(x=>x.id===doc.id);if(!g.length)return null;
 const sems=[...new Set(g.map(x=>x.semestre))].join(', ');
 const mk=(k,f)=>{const a=sumP(R.filter(f)),b=sumP(RA.filter(f));return{k,...a,a:b.p}};
 const filas=[mk('Su grupo ('+sems+' semestre)',x=>x.id===doc.id),
  mk('Promedio de la carrera '+doc.carrera,x=>x.campus===doc.campus&&x.carrera===doc.carrera),
  mk('Promedio del campus '+doc.campus,x=>x.campus===doc.campus),
  mk('Global (todos los campus)',()=>true)];
 /* el grupo del docente en el periodo anterior se identifica por campus, carrera y semestre */
 const pa=sumP(RA.filter(x=>x.campus===doc.campus&&x.carrera===doc.carrera&&g.some(y=>y.semestre===x.semestre)));filas[0].a=pa.p;
 return{filas,dif:filas[0].p-filas[1].p}}
function repDocCard(doc){const r=repDoc(doc);if(!r)return'';
 return `<div class="xp-extra"><div class="flex-row-between"><div><span class="tag-meta">Extra · Estadísticas de reprobación</span><h3 class="card-title mt-1">Reprobación de sus grupos · ${esc(F.periodo)}</h3>
  <p class="card-subtitle">Su grupo está <b class="${r.dif>0?'text-red':'text-success'}">${Math.abs(r.dif).toFixed(1)} pts ${r.dif>0?'arriba':'abajo'}</b> del promedio de su carrera. Esta sección también se incluye en el PDF.</p></div>
  <button class="link-action rs-link" data-act="go" data-v="reprobacion">Ver estadísticas completas →</button></div>
  <div class="mt-4">${barras(r.filas,{sel:r.filas[0].k})}</div></div>`}

// ----- Persistencia del prototipo -----
// Configuración (vistas, predeterminada, filtros, columnas): localStorage, se conserva al recargar y al cerrar el navegador.
// Estado de navegación (pestaña, expediente abierto, rol de prueba): sessionStorage, solo dura en esta pestaña.
const VR_LS='sigd-vr-config-v1',VR_SS='sigd-vr-estado-v1';
const okCfg=c=>c&&Array.isArray(c.order)&&c.order.length===FABRICA.order.length&&FABRICA.order.every(x=>c.order.includes(x))&&c.vis;
function guardarConfig(){try{localStorage.setItem(VR_LS,JSON.stringify({DEF,MINE,VISTAS,vistaAct,F,COLS,RC}))}catch(e){}}
function cargarConfig(){try{const o=JSON.parse(localStorage.getItem(VR_LS)||'null');if(!o)return;
 if(okCfg(o.DEF))DEF=Object.assign(clone(FABRICA),o.DEF);
 MINE=okCfg(o.MINE)?Object.assign(clone(FABRICA),o.MINE):null;
 VISTAS=Array.isArray(o.VISTAS)?o.VISTAS.filter(v=>v&&okCfg(v.cfg)):[];
 vistaAct=o.vistaAct;if(!(vistaAct==='def'||(vistaAct==='mine'&&MINE)||(typeof vistaAct==='number'&&vistaAct<VISTAS.length)))vistaAct=MINE?'mine':'def';
 if(o.F)Object.keys(F).forEach(k=>{if(typeof o.F[k]==='string')F[k]=o.F[k]});if(!REPROB[F.periodo])F.periodo=PERIODOS[0];
 if(o.COLS)Object.keys(COLS).forEach(k=>{if(k in o.COLS)COLS[k]=o.COLS[k]?1:0});
 if(o.RC)['reprob','reprob2','reprobS'].forEach(k=>{const r=o.RC[k];if(r&&Array.isArray(r.path))RC[k]={persp:r.persp||'campus',path:r.path,vista:r.vista==='tabla'?'tabla':'barras'}})
}catch(e){}}
function borrarConfig(){try{localStorage.removeItem(VR_LS)}catch(e){}
 DEF=clone(FABRICA);MINE=null;VISTAS=[];vistaAct='def';Object.assign(F,{campus:'',carrera:'',semestre:'',periodo:PERIODOS[0],semaforo:''});
 Object.keys(COLS).forEach(k=>COLS[k]=1);RC.reprob={persp:'campus',path:[],vista:'barras'};RC.reprob2={persp:'semestre',path:[],vista:'barras'};RC.reprobS={persp:'global',path:[],vista:'barras'}}
function guardarEstado(){try{sessionStorage.setItem(VR_SS,JSON.stringify({sec,pending,XT,rolDebug}))}catch(e){}}
cargarConfig();
try{const e=JSON.parse(sessionStorage.getItem(VR_SS)||'null');if(e){sec=e.sec||'resumen';pending=e.pending||null;XT=e.XT||'cumplimiento';rolDebug=e.rolDebug||null}}catch(e){}

const mapaVistas={
 resumen:{t:"Panel de Control General",s:"Monitoreo del cumplimiento del plan de trabajo."},
 busqueda:{t:"Búsqueda Avanzada e Informes",s:"Audite discrepancias y verifique entregas."},
 investigacion:{t:"Inteligencia de Investigación y SNII",s:"Métricas del Sistema Nacional de Investigadoras e Investigadores."},
 historico:{t:"Repositorio Histórico Institucional",s:"Comparativas interanuales de desempeño."},
 reprobacion:{t:"Estadísticas de Reprobación",s:"Promedio de alumnos reprobados por carrera, semestre, profesor y campus, con comparativa entre campus."},
 particular:{t:"Auditoría en Detalle",s:"Extracción y cruce particular del expediente docente."}};
/* BODY y HD: ver reportes.html */

function mount(el,css){
 root=el.attachShadow({mode:'open'});drawerOpen=false;
 root.innerHTML=`<style>${css}</style><style id="vr-cols-css"></style>${HD}<div class="content-body">${BODY}</div><div class="vr-scrim" id="vr-scrim" hidden data-act="drawer-close"></div><aside class="vr-drawer" id="vr-drawer" hidden aria-label="Personalizar panel"></aside><button class="vr-fab" id="vr-fab" type="button" data-act="drawer" title="Personalizar el módulo"><i class="ti ti-adjustments"></i><span>Personalizar</span></button>`;
 root.addEventListener('click',e=>{const t=e.target.closest('[data-act]');if(!t||t.disabled)return;const v=t.dataset.v,a=t.dataset.act,c=t.dataset.c;
  if(a==='audit')irADetalleDocente(parseInt(v),t.dataset.tab);
  else if(a==='perfil')verListaPerfil(v);
  else if(a==='back')cambiarSeccion('busqueda');
  else if(a==='xtab')irADetalleDocente(pending,v);
  else if(a==='go'){cambiarSeccion(v);if(drawerOpen)renderDrawer()}
  else if(a==='pdf')descargarPDF(parseInt(v));
  else if(a==='rp-persp'){RC[c].persp=v;RC[c].path=[];renderReprob(c);guardarConfig()}
  else if(a==='rp-vista'){RC[c].vista=v;renderReprob(c);guardarConfig()}
  else if(a==='ls-clear'){borrarConfig();renderChips();renderNuevas();aplicarColumnas();aplicarFiltros();aplicarPanel();avisar('Se borró la configuración guardada')}
  else if(a==='rp-drill')rpDrill(c,t.dataset.k,v);
  else if(a==='rp-crumb')rpCrumb(c,+t.dataset.i);
  else if(a==='chips-clear'){Object.assign(F,{campus:'',carrera:'',semestre:'',semaforo:''});refrescar()}
  else if(a==='drawer')abrirDrawer(!drawerOpen);
  else if(a==='drawer-close')abrirDrawer(false);
  else if(a==='mv')mover(v,+t.dataset.d);
  else if(a==='reset'){MINE=null;vistaAct='def';aplicarAvanzadas();aplicarPanel();avisar('Se restableció la vista predeterminada')}
  else if(a==='vista-def'){MINE=null;vistaAct='def';aplicarAvanzadas();aplicarPanel()}
  else if(a==='vista-ir'){const x=VISTAS[+v];MINE=clone(x.cfg);Object.assign(F,x.F);vistaAct=+v;aplicarAvanzadas();refrescar();aplicarPanel()}
  else if(a==='vista-del'){const n=+v;VISTAS.splice(n,1);if(vistaAct===n)vistaAct=MINE?'mine':'def';else if(typeof vistaAct==='number'&&vistaAct>n)vistaAct--;aplicarPanel()}
  else if(a==='vista-save'){const n=($('vista-nombre').value||'').trim()||('Vista '+(VISTAS.length+1));VISTAS.push({n,cfg:clone(cfg()),F:clone(F)});MINE=clone(cfg());vistaAct=VISTAS.length-1;aplicarPanel();avisar('Vista «'+n+'» guardada')}
  else if(a==='def-set'){DEF=Object.assign(clone(cfg()),{disp:DEF.disp});MINE=null;vistaAct='def';aplicarPanel();avisar('Predeterminada actualizada para todos los usuarios')}
  else if(a==='def-fab'){DEF=clone(FABRICA);MINE=null;vistaAct='def';aplicarAvanzadas();aplicarPanel();avisar('Se restauró el diseño original')}
 });
 root.addEventListener('change',e=>{const t=e.target;
  if(t.dataset.chip)cambiarChip(t.dataset.chip,t.value);
  else if(t.dataset.vis){editable().vis[t.dataset.vis]=t.checked?1:0;aplicarPanel()}
  else if(t.dataset.disp){DEF.disp[t.dataset.disp]=t.checked?1:0;aplicarPanel()}
  else if(t.dataset.adv){editable()[t.dataset.adv]=t.value;aplicarAvanzadas();aplicarPanel()}
  else if(t.dataset.colchk){COLS[t.dataset.colchk]=t.checked?1:0;aplicarColumnas()}
  else if(t.id==='inv-campus'){XINV=t.checked;irADetalleDocente(pending)}
 });
 root.addEventListener('keydown',e=>{if(e.key==='Escape'&&drawerOpen)abrirDrawer(false)});
 inicializarFiltros();
 inicializarSelectorGraficasUniversales();
 aplicarControlRoles(rol());
 renderChips();renderNuevas();aplicarPanel();aplicarColumnas();
 aplicarFiltros();
 if(!mapaVistas[sec]||(sec==='particular'&&!pending))sec='resumen';
 if(sec==='particular'&&pending){irADetalleDocente(pending);cambiarSeccion('particular')}else cambiarSeccion(allowed(sec)?sec:'resumen');
}

const allowed=s=>!(rol()==='secretaria'&&(s==='investigacion'||s==='historico'));

function cambiarSeccion(seccionId){
 sec=seccionId;
 $$('.content-section').forEach(s=>{s.classList.remove('view-active');s.classList.add('view-hidden')});
 const el=$(`section-${seccionId}`);el.classList.remove('view-hidden');el.classList.add('view-active');
 $('page-title').innerText=mapaVistas[seccionId].t;
 $('page-subtitle').innerText=mapaVistas[seccionId].s;
 const ch=$('vr-chips');if(ch)ch.hidden=!(seccionId==='resumen'||seccionId==='busqueda'||seccionId==='reprobacion');
 guardarEstado();
 window.scrollTo(0,0);cb();
}

// ================= SELECTORES MULTIGRÁFICA DINÁMICOS =================
function inicializarSelectorGraficasUniversales(){
 $$('.chart-selector').forEach(selector=>{
  selector.addEventListener('change',e=>{
   const target=e.target.getAttribute('data-target'),type=e.target.value;
   const viewBar=$(`view-chart-bar-${target}`),viewCirc=$(`view-chart-circular-${target}`),cssChart=$(`css-circular-chart-${target}`);
   if(type==='bar'){viewBar.classList.add('active-chart');viewBar.classList.remove('hidden-chart');viewCirc.classList.add('hidden-chart');viewCirc.classList.remove('active-chart')}
   else{viewBar.classList.add('hidden-chart');viewBar.classList.remove('active-chart');viewCirc.classList.add('active-chart');viewCirc.classList.remove('hidden-chart');
    cssChart.className=(type==='pie'?'css-pie':'css-donut')+` css-chart-${target}`}
  })});
}

// ================= TABLA Y FILTROS =================
function renderizarTabla(lista){
 const tbody=$('table-body-docentes');tbody.innerHTML='';
 if(lista.length===0){tbody.innerHTML=`<tr><td colspan="7" style="text-align:center; padding:30px; color:var(--text-muted);">Ningún registro coincide con los filtros aplicados.</td></tr>`;return}
 const oculta=rol()==='representante'||rol()==='rectoria';
 lista.forEach(doc=>{
  let badgeClass='badge-yellow-light',badgeText='🟡 Incompleto';
  if(doc.estado==='cumplido'){badgeClass='bg-green-bg text-green-text';badgeText='🟢 Cumplido'}
  else if(doc.estado==='critico'){badgeClass='bg-red-bg text-red-text';badgeText='🔴 Crítico'}
  else if(doc.estado==='extraordinario'){badgeClass='badge-purple-light';badgeText='🟣 Extraordinario'}
  const tr=document.createElement('tr');
  tr.innerHTML=`<td class="font-mono font-bold" data-col="emp">${doc.id}</td><td class="font-bold">${doc.nombre}</td><td class="text-muted" data-col="campus">${doc.campus||''}</td>
   <td class="text-muted" data-col="plan">Plan: ${doc.planHoras}h / Real: ${doc.realHoras}h</td>
   <td data-col="estado"><span class="table-badge ${badgeClass}">${badgeText}</span></td>
   <td class="font-bold" data-col="punt">${Math.round((doc.realHoras/doc.planHoras)*100)}%</td>
   <td class="text-right column-action${oculta?' hidden-hard':''}"><button class="btn-audit" data-act="audit" data-v="${doc.id}">Auditar Informe</button></td>`;
  tbody.appendChild(tr)});
}
function aplicarFiltros(){
 const txtId=$('filter-id').value.trim(),txtNombre=$('filter-nombre').value.toLowerCase(),selCarrera=$('filter-carrera').value,selSemaforo=$('filter-semaforo').value,selPerfil=$('filter-perfil').value;
 renderizarTabla(baseDocentes.filter(doc=>(txtId===''||doc.id.toString().includes(txtId))&&(txtNombre===''||doc.nombre.toLowerCase().includes(txtNombre))&&(selCarrera===''||doc.carrera===selCarrera)&&(selSemaforo===''||doc.estado===selSemaforo)&&(selPerfil===''||doc.perfilDeseable.toString()===selPerfil)&&(!F.campus||doc.campus===F.campus)&&(!F.carrera||doc.carrera===F.carrera)&&(!F.semestre||doc.semestre===F.semestre)&&(!F.semaforo||doc.estado===F.semaforo)));
}
function inicializarFiltros(){
 $('btn-apply-filters').addEventListener('click',aplicarFiltros);
 $('btn-clear-filters').addEventListener('click',()=>{['filter-id','filter-nombre','filter-carrera','filter-semaforo','filter-perfil'].forEach(i=>$(i).value='');aplicarFiltros()});
}
function verListaPerfil(v){$('filter-perfil').value=v;aplicarFiltros();cambiarSeccion('busqueda')}

// ================= DETALLE DOCENTE (expediente con pestañas internas) =================
function irADetalleDocente(id,tab){
 const doc=baseDocentes.find(d=>d.id===id);if(!doc)return;pending=id;
 if(tab)XT=tab;else if(sec!=='particular')XT='cumplimiento';
 const tabs=[['cumplimiento','checklist','Cumplimiento'],['investigacion','flask','Investigación'],['evaluaciones','school','Evaluaciones'],['informe','file-text','Informe']].filter(t=>!(rol()==='secretaria'&&t[0]==='investigacion'));
 if(!tabs.some(t=>t[0]===XT))XT='cumplimiento';
 const ok=doc.actividadesDetalle.filter(a=>a.cumplida).length,tot=doc.actividadesDetalle.length;
 let panel='';
 if(XT==='cumplimiento'){
  panel=`<div class="metrics-summary-grid">
   <div class="metric-summary-box"><p style="font-size: 11px; font-weight:bold; color:var(--text-muted); text-transform:uppercase;">Total Horas Planeadas</p><span style="font-size: 24px; font-weight:bold; font-family:monospace;">${doc.planHoras} hrs</span></div>
   <div class="metric-summary-box"><p style="font-size: 11px; font-weight:bold; color:var(--text-muted); text-transform:uppercase;">Total Horas Reportadas</p><span style="font-size: 24px; font-weight:bold; font-family:monospace; color: ${doc.estado==='critico'?'var(--red-text)':'var(--green-text)'}">${doc.realHoras} hrs</span></div>
  </div>
  <div class="checklist-container"><div class="checklist-header"><i class="ti ti-checklist" style="font-size:18px;"></i> Comprometido vs. Realizado <span class="xp-sum">${ok} de ${tot} cumplidas${tot-ok?` · <b class="text-red">${tot-ok} incumplida${tot-ok>1?'s':''}</b>`:''}</span></div>
   <table class="vr-cmp"><thead><tr><th>Comprometido (Plan de trabajo)</th><th>Realizado (Informe final)</th><th>Estado</th></tr></thead><tbody>
   ${doc.actividadesDetalle.map(a=>`<tr class="${a.cumplida?'':'bad'}"><td>${esc(a.nombre)}</td><td>${a.cumplida?'<i class="ti ti-check task-icon-done"></i> Reportada en el informe':'<i class="ti ti-x task-icon-fail"></i> No aparece en el informe'}</td><td><span class="table-badge ${a.cumplida?'bg-green-bg text-green-text':'bg-red-bg text-red-text'}">${a.cumplida?'Cumplida':'Incumplida'}</span></td></tr>`).join('')}
   </tbody></table></div>
  ${doc.actividadesExtra?`<div class="mt-4 p-4" style="background-color: var(--green-bg); border-radius: 12px; border: 1px solid var(--border-color);"><h4 style="font-size:12px; color:var(--green-text); font-weight:bold;">⭐ Actividades Extra (No Planeadas)</h4><ul style="font-size:12px; color:var(--green-text); padding-left:20px; margin-top:8px;">${doc.actividadesExtra.map(a=>`<li>${a}</li>`).join('')}</ul></div>`:''}
  ${doc.justificacion?`<div class="mt-4 p-4" style="background-color: var(--red-bg); border-radius: 12px; border: 1px solid var(--red-border);"><h4 style="font-size:12px; color:var(--red-text); font-weight:bold;">⚠ Alerta del Sistema de Auditoría</h4><p style="font-size:12px; margin-top:4px;">${doc.justificacion}</p></div>`:''}`;
 }else if(XT==='investigacion'){
  const inv=(doc.inv||[]).filter(x=>!XINV||x.campus===doc.campus);
  panel=`<div class="flex-row-between xp-bar"><p class="card-subtitle">Ingreso a la institución: <b>${doc.ingreso||'—'}</b> · Campus de adscripción: <b>${esc(doc.campus||'—')}</b> · ${(doc.inv||[]).length} trabajos registrados</p>
   <label class="xp-check"><input type="checkbox" id="inv-campus"${XINV?' checked':''}> Solo las hechas en el campus</label></div>
   ${inv.length?`<ol class="tl">${inv.map(x=>`<li class="${x.campus===doc.campus?'in':''}"><span class="tl-y">${x.a}</span><div class="tl-c"><b>${esc(x.t)}</b><div class="tl-m"><span class="tl-tipo">${esc(x.tipo)}</span>${x.campus===doc.campus?'<span class="tl-campus"><i class="ti ti-building-community"></i> En el campus</span>':`<span class="tl-ext">${esc(x.campus)}</span>`}</div></div></li>`).join('')}<li class="hoy"><span class="tl-y">Hoy</span><div class="tl-c"><b>${new Date().getFullYear()}</b></div></li></ol>`:'<p class="empty">Sin trabajos con este filtro.</p>'}`;
 }else if(XT==='evaluaciones'){
  const v=doc.evalEst||0,hist=[['2023-2024',Math.max(1,v-.3)],['2024-2025',Math.max(1,v-.1)],['2025-2026',v]];
  panel=`<div class="ev-head"><div class="ev-big">${v.toFixed(1)}<small>/ 5</small></div><div>${estrellas(v)}<p class="card-subtitle">Promedio de la evaluación estudiantil del periodo actual. Punto opcional de la minuta; datos de simulación.</p></div></div>
   <div class="rp-bars mt-4">${hist.map(([p,x])=>`<div class="rp-row"><div class="rp-lbl">${p}</div><div class="rp-track"><div class="rp-bar ev" style="width:${x/5*100}%"></div></div><div class="rp-val">${x.toFixed(1)}</div><div class="rp-go"></div></div>`).join('')}</div>`;
 }else{
  panel=`<div class="flex-row-between xp-bar"><p class="card-subtitle">Vista previa del informe que se descarga. Se abre la ventana de impresión; elige <b>Guardar como PDF</b>.</p><button class="btn-primary" data-act="pdf" data-v="${doc.id}"><i class="ti ti-file-type-pdf"></i> Descargar PDF</button></div>
   ${repDocCard(doc)}
   <div class="rep-prev">${informeHTML(doc)}</div>`;
 }
 $('particular-view-container').innerHTML=`
  <div class="particular-header"><div><span class="tag-meta">ID: ${doc.id}</span><h2 style="font-size: 20px; font-weight:bold; margin-top:8px;">${doc.nombre}</h2><p class="text-muted" style="font-size: 13px;">Departamento: ${doc.carrera} · Campus ${esc(doc.campus||'')} · ${esc(doc.semestre||'')} semestre</p></div>
   <div class="xp-acts">${doc.sni?`<span class="badge-sni">🔬 Padrón SNII Activo (${doc.sniNivel})</span>`:''}<button class="btn-secondary" data-act="xtab" data-v="informe"><i class="ti ti-download"></i> Descargar informe</button></div></div>
  <div class="xp-tabs" role="tablist">${tabs.map(t=>`<button role="tab" aria-selected="${XT===t[0]}" class="xp-tab${XT===t[0]?' on':''}" data-act="xtab" data-v="${t[0]}"><i class="ti ti-${t[1]}"></i> ${t[2]}</button>`).join('')}</div>
  <div class="xp-panel">${panel}</div>`;
 if(sec!=='particular')cambiarSeccion('particular');
 guardarEstado();
}
// ================= RBAC (rol tomado de la sesión) =================
function aplicarControlRoles(r){
 $$('.column-action').forEach(el=>el.classList.toggle('hidden-hard',r==='representante'||r==='rectoria'));
}

// ===== API para el marco SIGD =====
const items=()=>ITEMS.filter(x=>!(rol()==='secretaria'&&RESTRINGIDAS.includes(x[2])));
const active=()=>sec==='particular'?'busqueda':sec;
function navGo(k){if(!root)return;cambiarSeccion(k)}
function reset(){sec='resumen';pending=null;root=null;rolDebug=null;drawerOpen=false;XT='cumplimiento';try{sessionStorage.removeItem(VR_SS)}catch(e){}}
function setRolDebug(r){rolDebug=r||null;if(!allowed(sec))sec='resumen';guardarEstado()}
return{mount,items,navGo,active,reset,setRolDebug,rol,set onChange(f){cb=f}}})();
VR.onChange=()=>{if(cur==='reportes')nav()};