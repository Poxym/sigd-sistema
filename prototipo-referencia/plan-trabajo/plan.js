/* ===== Módulo Plan de Trabajo integrado al SIGD =====
   Dominio (carga, validación, reglas de envío, colores): PTD, original del prototipo.
   Interfaz: reescrita sobre el marco SIGD (tokens, Inter, capa Material 3). Sin acceso, menú ni paleta propios. */
const PT=(()=>{
const D=PTD,FX=D.FX;
let root=null,api={onChange(){}};
let DB,role=null,roleKey=null,screen='home',prm={},dlg=null,filt={},openRows={};
let saveTimer=null,saveState='clean',saveErr=null,dirty=false,explicitPending=false,conflict=null,toastT=null,mounted=false;
const incomplete={};
const KEY='sigd.plan.v2';
const $=s=>root.querySelector(s),$$=s=>[...root.querySelectorAll(s)];
const esc=s=>String(s??'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const I=(n,c='')=>`<i class="ti ti-${n} ${c}" aria-hidden="true"></i>`;
const clone=x=>structuredClone(x);
const fdate=(v,t)=>{if(v==null||v==='')return'';const s=String(v);if(/^\d{4}-\d{2}-\d{2}$/.test(s)){const[y,m,d]=s.split('-');return d+'/'+m+'/'+y}const d=new Date(v);if(isNaN(d))return s;const f=new Intl.DateTimeFormat('en-CA',{timeZone:'America/Mexico_City',year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',hourCycle:'h23'}).formatToParts(d),g=k=>f.find(x=>x.type===k).value;return g('day')+'/'+g('month')+'/'+g('year')+(t?' '+g('hour')+':'+g('minute'):'')};
const fh=D.fmtHours,fd=(v,t)=>fdate(v,t),pad=D.pad2,fp=D.fmtPercent;
const SI={book:'books',users:'users',research:'flask',publication:'file-description',community:'building-community',briefcase:'briefcase',link:'link'};
const sic=s=>SI[s.icon]||'list-details';
const TID='demo-teacher-209',HID='demo-head-118';
const ST={draft:['Borrador','borrador'],in_review:['En revisión','revision'],returned:['Devuelto','obs'],approved:['Aprobado','aprobado']};
const pill=s=>`<span class="pill ${ST[s][1]}">${ST[s][0]}</span>`;
const EVL={created:'Plan creado',saved:'Versión guardada',submitted:'Enviado a Jefatura',resubmitted:'Reenviado a Jefatura',returned:'Devuelto con comentarios',approved:'Aprobado',catalog_updated:'Configuración actualizada'};
const online=()=>typeof navigator==='undefined'||navigator.onLine!==false;

/* ---------- datos iniciales ---------- */
const SEMB={id:'sem-2025-b',label:'2025-2026 B',start:'2026-02-09',end:'2026-06-12',effectiveWeeks:14,nominalWeeklyMinutes:2400,timezone:'America/Mexico_City',isOpen:false,ordinal:4};
const SEMA={id:'sem-2025-a',label:'2025-2026 A',start:'2025-08-11',end:'2025-12-05',effectiveWeeks:14,nominalWeeklyMinutes:2400,timezone:'America/Mexico_City',isOpen:false,ordinal:3};
const CUR={...FX.demo.semester,ordinal:5};
const PEOPLE={
 'demo-teacher-209':{id:'demo-teacher-209',employeeNumber:'209',name:'Ana Ramírez',career:'Ingeniería en Computación',campus:'Tehuantepec'},
 'demo-head-118':{id:'demo-head-118',employeeNumber:'118',name:'Luis López',career:'Ingeniería en Computación',campus:'Tehuantepec'},
 'demo-teacher-301':{id:'demo-teacher-301',employeeNumber:'301',name:'Luis Martínez',career:'Ingeniería en Computación',campus:'Tehuantepec'},
 'demo-teacher-302':{id:'demo-teacher-302',employeeNumber:'302',name:'Elena Cruz',career:'Ingeniería en Computación',campus:'Tehuantepec'},
 'demo-teacher-303':{id:'demo-teacher-303',employeeNumber:'303',name:'Raúl Santiago',career:'Ingeniería en Computación',campus:'Tehuantepec'}};
function basePlan(){const p=clone(FX.demo);delete p.expected;p.catalogSnapshot=clone(FX.v1);p.semester=clone(CUR);p.revision=p.version;p.colors=D.presentationColors(FX.v1.sections);return p}
function allDone(p,at){for(const s of Object.values(p.sections)){s.completion='done';s.confirmedAt=at}return p}
function hist(sem,wk,ver,at,com){const p=basePlan();p.id='plan-demo-teacher-209-'+sem.id;p.semester=clone(sem);p.status='approved';p.version=ver;p.revision=ver;
 const d=p.sections.docencia.rows;wk.forEach((h,i)=>{if(d[i])d[i].weeklyHours=h});
 p.sections['servicio-social'].rows=[{id:'social-'+sem.id,originId:'social-'+sem.id,title:'Taller de programación para bachillerato',start:sem.start,end:sem.end,totalHours:70,accountedIntervals:[]}];
 p.sections.comisiones.rows[0].weeklyHours=com;
 p.sections.publicaciones.rows=p.sections.publicaciones.rows.filter(r=>r.firstSemesterOrdinal<=sem.ordinal).map(r=>({...r,id:r.originId+'@'+sem.id}));
 allDone(p,at);p.savedAt=at;p.submittedVersion=ver;p.submittedAt=at;p.decidedAt=at;p.observations='';
 p.events=[{id:'ev-'+sem.id+'-1',type:'created',at:sem.start+'T15:00:00Z',actorId:TID},{id:'ev-'+sem.id+'-2',type:'submitted',at,actorId:TID,version:ver},{id:'ev-'+sem.id+'-3',type:'approved',at,actorId:HID,actorName:'Luis López',version:ver}];return p}
function other(tid,hrs,at,ver){const p=basePlan();p.teacher=clone(PEOPLE[tid]);
 p.id='plan-'+tid+'-'+CUR.id;p.status='in_review';p.version=ver;p.revision=ver;
 const subj=['Programación Orientada a Objetos','Estructuras de Datos','Sistemas Operativos','Compiladores'];
 p.sections.docencia.rows=hrs.map((h,i)=>({id:'course-'+tid+'-'+i,subject:subj[i%4],group:String(404+100*(i%3)),weeklyHours:h,students:24+i}));
 p.sections.publicaciones.rows=[];p.sections.publicaciones.applicability='not_applicable';allDone(p,at);
 p.submittedVersion=ver;p.submittedAt=at;p.savedAt=at;p.observations='';
 p.events=[{id:'ev-'+tid+'-1',type:'created',at:'2026-10-10T15:00:00Z',actorId:tid},{id:'ev-'+tid+'-2',type:'submitted',at,actorId:tid,version:ver}];return p}
const snapOf=p=>({key:p.id+'#'+p.version,planId:p.id,version:p.version,status:p.status,createdAt:p.decidedAt||p.submittedAt||p.savedAt,plan:clone(p)});
function seed(){
 const hb=hist(SEMB,[8,4,4],8,'2026-02-15T17:20:00Z',2),ha=hist(SEMA,[6,4,4],8,'2025-08-15T16:05:00Z',2);
 const luis=other('demo-teacher-301',[8,6,4],'2026-10-19T17:10:00Z',8),elena=other('demo-teacher-302',[10,8,4],'2026-10-19T17:36:00Z',8),raul=other('demo-teacher-303',[6,6,4],'2026-10-17T15:00:00Z',8);
 raul.status='approved';raul.decidedAt='2026-10-18T16:00:00Z';raul.events.push({id:'ev-raul-3',type:'approved',at:raul.decidedAt,actorId:HID,actorName:'Luis López',version:8});
 const ana=basePlan();
 const db={v:2,plans:{},snaps:{},visits:[],published:2,notes:[
  {id:'n-1',userId:TID,type:'approved',title:'Tu plan fue aprobado',body:'La versión 8 de 2025-2026 B está disponible para consulta.',planId:hb.id,version:8,createdAt:'2026-02-15T17:20:00Z',readAt:'2026-02-16T09:00:00Z'},
  {id:'n-2',userId:HID,type:'received',title:'Elena Cruz envió su plan',body:'2026-2027 A · versión 8 · 42 h por semana.',planId:elena.id,version:8,createdAt:'2026-10-19T17:36:00Z',readAt:null},
  {id:'n-3',userId:HID,type:'received',title:'Luis Martínez envió su plan',body:'2026-2027 A · versión 8 · 38 h por semana.',planId:luis.id,version:8,createdAt:'2026-10-19T17:10:00Z',readAt:null},
  {id:'n-4',userId:TID,type:'catalog',title:'Nueva configuración disponible',body:'Administración publicó la versión 2. Revisa los cambios antes de aplicarlos a tu borrador.',planId:ana.id,version:2,createdAt:'2026-10-19T17:00:00Z',readAt:null}]};
 for(const p of [ana,ha,hb,luis,elena,raul])db.plans[p.id]=p;
 for(const p of [ha,hb,luis,elena,raul])db.snaps[p.id+'#'+p.version]=snapOf(p);
 return db}

/* ---------- persistencia (localStorage; memoria si no está disponible) ---------- */
const store={
 read(){try{const t=(localStorage.getItem(KEY)||'').replace(/(20\d\d)\u2013(20\d\d)/g,'$1-$2');const d=t&&JSON.parse(t);return d&&d.v===2?d:null}catch(e){return null}},
 write(d){try{localStorage.setItem(KEY,JSON.stringify(d));return true}catch(e){return false}}};
let persistent=true;
function persist({plans=[],snaps=[],notes=[],visits=[]}={}){
 const f=store.read()||clone(DB);
 for(const p of plans)f.plans[p.id]=clone(p);
 for(const s of snaps)f.snaps[s.key]=clone(s);
 for(const n of notes){const i=f.notes.findIndex(x=>x.id===n.id);if(i>=0)f.notes[i]=clone(n);else f.notes.push(clone(n))}
 for(const v of visits)if(!f.visits.some(x=>x.key===v.key))f.visits.push(clone(v));
 persistent=store.write(f);
 const keep=dirty?curPlanId():null;
 for(const [id,p] of Object.entries(f.plans))if(id!==keep||!DB.plans[id])DB.plans[id]=p;
 DB.snaps=f.snaps;DB.notes=f.notes;DB.visits=f.visits;DB.published=f.published}
DB=store.read()||seed();store.write(DB);
if(typeof window!=='undefined')window.addEventListener('storage',e=>{if(e.key!==KEY||!mounted)return;const f=store.read();if(!f)return;
 if(dirty||dlg)return;DB=f;render();api.onChange()});
if(typeof window!=='undefined'){window.addEventListener('online',()=>mounted&&render());window.addEventListener('offline',()=>mounted&&render())}

/* ---------- sesión y datos del usuario ---------- */
const isBoth=()=>!!U&&(U.k==='118'||U.k==='000');
const tid=()=>U&&U.k==='118'?HID:TID;
const userId=()=>role==='head'?HID:tid();
const reviewerName=()=>U&&U.k==='000'?'Coordinación SIGD':(U?U.n:'Jefatura');
const mine=()=>Object.values(DB.plans).filter(p=>p.teacher.id===tid()).sort((a,b)=>(b.semester.ordinal||0)-(a.semester.ordinal||0));
const P=()=>mine().find(p=>p.semester.id===CUR.id)||null;
const curPlanId=()=>{const p=P();return p&&p.id};
const notes=()=>DB.notes.filter(n=>n.userId===userId()).sort((a,b)=>b.createdAt.localeCompare(a.createdAt));
const unread=()=>notes().filter(n=>!n.readAt).length;
const canEdit=p=>!!p&&D.canEdit(p)&&!conflict;
const secs=p=>D.activeSections(p);
const load=p=>D.safeLoad(p);
const published=()=>DB.published===2?FX.v2:FX.v1;
const NOUN={docencia:['asignatura','asignaturas'],investigacion:['proyecto activo','proyectos activos'],comisiones:['comisión','comisiones'],publicaciones:['registro','registros'],'servicio-social':['actividad','actividades']};
const noun=(id,n)=>{const[a,b]=NOUN[id]||['actividad','actividades'];return n+' '+(n===1?a:b)};
const pubAge=(p,r)=>D.publicationAge(r,p.semester.ordinal||0,p.catalogSnapshot.policy.publicationCompletionStates);

/* ---------- cálculo y textos de apoyo ---------- */
function tile(p,s,l){const a=p.sections[s.id],rows=a?.rows||[],v=l.values.find(x=>x.id===s.id),done=a?.completion==='done';
 if(a?.applicability==='not_applicable')return{value:'No aplica',status:'Confirmada · sin aporte a la carga',done:true};
 let value=v?fh(v.weeklyHours)+' h / semana':'—',det=noun(s.id,rows.length);
 const k=s.calculation.kind;
 if(k==='tracking_only'){value='Sin carga adicional';const n=rows.filter(r=>!pubAge(p,r).concluded).length;det=n+' '+(n===1?'registro pendiente':'registros pendientes')}
 else if(k==='tutoring'){const n=Number(rows[0]?.count||0);det=n+' '+(n===1?'tutorado':'tutorados')}
 else if(k==='proportional_total')det=v?fh(v.semesterHours)+' h este semestre':det;
 if(!rows.length&&!done)det='Sin captura';
 return{value,status:done?'Confirmada · '+det:det,done}}
function propText(p,row){try{const d=D.proportionalDetail(row,p.semester),h=d.minutes/60,wk=h/p.semester.effectiveWeeks;
 if(d.insideDays===0)return{ok:true,text:'La actividad no coincide con este semestre: aporta 0 h.'};
 const prev=d.insideDays-d.availableDays;
 return{ok:true,text:`${d.availableDays} de ${d.totalDays} días · ${fh(h)} h atribuibles · ${fh(wk)} h / semana${prev>0?` · ${prev} días ya contabilizados`:''}`}}
 catch(e){return{ok:false,text:e.message==='Intervalo invertido'?'La fecha de término es anterior al inicio.':'Completa fechas y horas válidas para calcular.'}}}
function timeline(p,r){try{const a=D.dateDay(r.start),b=D.dateDay(r.end);if(b<a)return null;const ps=D.dateDay(p.semester.start),pe=D.dateDay(p.semester.end),tot=b-a+1;
 const bef=Math.max(0,Math.min(ps,b+1)-a)/tot,aft=Math.max(0,b-Math.max(pe,a-1))/tot,ins=Math.max(0,1-bef-aft);
 const sh=d=>{const x=new Date(d*86400000);return String(x.getUTCDate()).padStart(2,'0')+'/'+String(x.getUTCMonth()+1).padStart(2,'0')+'/'+x.getUTCFullYear()};
 const lb=[{at:0,t:sh(a)}];if(bef>0&&bef<1)lb.push({at:bef,t:sh(ps)});if(aft>0&&aft<1)lb.push({at:1-aft,t:sh(pe)});lb.push({at:1,t:sh(b)});return{bef,ins,aft,lb}}catch(e){return null}}
function val(s,r,id){const f=s.fields.find(x=>x.id===id),v=r[id];if(v===undefined||v===null||v==='')return'—';
 if(f.type==='select')return f.options.find(o=>o.value===v)?.label||String(v);if(f.type==='date')return fd(String(v));if(f.type==='decimal'||f.type==='integer')return fh(Number(v));return String(v)}
function rowTitle(s,r){const f=s.fields.find(x=>x.type==='text');return(f&&String(r[f.id]||'').trim())||'Actividad sin nombre'}
function extra(p,s,r){if(s.calculation.kind==='proportional_total')return propText(p,r).text;
 if(s.fields.some(f=>f.id==='editorialStatus'))return pubAge(p,r).label;
 if(s.calculation.kind==='tutoring')return`${r.count||0} × ${s.calculation.minutesPerTuteeWeekly} min × ${p.semester.effectiveWeeks} semanas`;return null}
const catUpdate=p=>{const c=published();if(!p||c.version<=p.catalogSnapshot.version||!(p.status==='draft'||p.status==='returned'))return null;
 return{catalog:c,diff:D.diffCatalog(p.catalogSnapshot,c),dismissed:p.dismissedCatalogVersion===c.version}};

/* ---------- guardado con concurrencia por revisión ---------- */
const hhmm=iso=>iso?D.fmtTime(iso):'';
function saveHtml(){const p=P();let ic='circle-check',t,cl='';
 const inc=Object.keys(incomplete).length;
 if(saveState==='saving'){ic='loader-2 spin';t='Guardando…';cl=' saving'}
 else if(saveState==='error'){ic='alert-circle';t=saveErr||'No se pudo guardar';cl=' bad'}
 else if(inc){ic='alert-triangle';t=`Hay un campo incompleto · último guardado ${hhmm(p?.savedAt)}`;cl=' saving'}
 else if(!online()){ic='alert-triangle';t='Sin conexión · cambios guardados en este dispositivo';cl=' saving'}
 else t=p?.savedAt?`${persistent?'Guardado en este dispositivo':'Guardado en esta sesión'} · ${hhmm(p.savedAt)}`:'Sin cambios';
 return`<span id="si" class="si${cl}" role="status" aria-live="polite">${I(ic)}${esc(t)}</span>`}
function paintSave(){const e=$('#si');if(e)e.outerHTML=saveHtml()}
function touch(){saveState='saving';paintSave();clearTimeout(saveTimer);saveTimer=setTimeout(()=>flush(false),800)}
function mut(fn,sec){const p=P();if(!canEdit(p))return false;fn(p);
 if(sec&&p.sections[sec]?.completion==='done'){p.sections[sec].completion='pending';p.sections[sec].confirmedAt=null}
 dirty=true;touch();derived();return true}
function flush(explicit){clearTimeout(saveTimer);if(explicit)explicitPending=true;const p=P();if(!p)return true;
 if(!dirty&&!explicitPending)return saveState!=='error';
 if(conflict)return false;
 const f=store.read(),sp=f&&f.plans[p.id];
 if(sp&&sp.revision!==p.revision){conflict={mine:clone(p),theirs:clone(sp)};saveState='error';saveErr='El plan cambió en otra sesión. Elige qué conservar.';render();return false}
 const now=new Date().toISOString();p.revision=p.revision+1;p.savedAt=now;
 if(explicitPending){p.version++;p.events=[...p.events,{id:D.uid('ev'),type:'saved',at:now,actorId:p.teacher.id,version:p.version}]}
 persist({plans:[p]});dirty=false;explicitPending=false;saveState='saved';saveErr=null;paintSave();return true}
window.addEventListener&&window.addEventListener('beforeunload',e=>{if(dirty){e.preventDefault();e.returnValue=''}});

/* ---------- navegación ---------- */
function go(s,p={}){if(dirty)flush(false);screen=s;prm=p;dlg=null;render();window.scrollTo(0,0);api.onChange()}
const items=()=>{let u=0;try{u=unread()||0}catch(e){}
 return role==='head'?[['file-alert','Bandeja de revisión','inbox'],['info-circle','Ayuda','help']]
 :[['layout-dashboard','Mi plan','home'],['history','Historial','history'],['info-circle','Ayuda','help']]};
const active=()=>({capture:'home',summary:'home',catalog:'home',pdf:'home',version:role==='head'?'inbox':'history',review:'inbox'}[screen]||screen);
function navGo(k){if(!root)return;go(k)}

/* ---------- piezas comunes ---------- */
function loadPanel(p,l,ttl='Tu carga, de un vistazo'){
 const R=42,C=2*Math.PI*R;let off=0,seg='';
 for(const c of l.chart){if(c.fraction<=0)continue;const len=Math.min(c.fraction*C,C),col=p.colors[c.id]?.color||'#62737E';seg+=`<circle cx="50" cy="50" r="${R}" fill="none" stroke="${col}" stroke-width="12" stroke-dasharray="${len.toFixed(2)} ${(C-len).toFixed(2)}" stroke-dashoffset="${(-off).toFixed(2)}" transform="rotate(-90 50 50)"/>`;off+=len}
 const pct=l.loadPercent===null?'—':fp(l.loadPercent);
 const leg=secs(p).map(s=>{const v=l.values.find(x=>x.id===s.id);const t=!v?'—':v.applicability==='not_applicable'?'No aplica':v.kind==='tracking_only'?'Seguimiento':fh(v.weeklyHours)+' h';return`<li><i class="dot" style="background:${p.colors[s.id]?.color||'#62737E'}"></i><span>${esc(s.label)}</span><b>${t}</b></li>`}).join('');
 let st;if(l.nominalMinutes<=0)st=['warn','Sin carga nominal configurada'];else if(l.overload)st=['warn',fh(l.totalWeeklyHours-l.nominalWeeklyHours)+' h sobre la carga nominal'];else{const r=l.nominalWeeklyHours-l.totalWeeklyHours;st=r<=.0001?['ok','Carga nominal completa']:['ok',fh(r)+' h disponibles de carga nominal']}
 return`<section class="xc lp" aria-label="Carga horaria"><h2>${I('chart-donut-2')}${ttl}</h2>
 <div class="dn"><svg viewBox="0 0 100 100" role="img" aria-label="Carga: ${pct} de la carga nominal. ${fh(l.totalWeeklyHours)} h comprometidas de ${fh(l.nominalWeeklyHours)} h nominales por semana."><circle cx="50" cy="50" r="${R}" fill="none" stroke="var(--line)" stroke-width="12"/>${seg}</svg><div class="ct2"><b>${pct}</b><small>carga nominal</small></div></div>
 <div class="two"><div><b>${fh(l.totalWeeklyHours)} h</b><small>Comprometidas</small></div><div><b>${fh(l.nominalWeeklyHours)} h</b><small>Nominales</small></div></div>
 <ul class="lg">${leg}</ul><span class="pill ${st[0]==='warn'?'borrador':'revision'}">${I(st[0]==='warn'?'alert-triangle':'info-circle')}${st[1]}</span>
 <p class="mut sm fn">La carga es independiente del avance de captura.</p>
 <div class="sr"><table><caption>Distribución de la carga por sección</caption><thead><tr><th>Sección</th><th>Horas por semana</th><th>Horas en el semestre</th></tr></thead><tbody>${l.values.map(v=>`<tr><td>${esc(v.label)}</td><td>${fh(v.weeklyHours)}</td><td>${fh(v.semesterHours)}</td></tr>`).join('')}</tbody></table></div></section>`}
function loadMini(l){const pct=l.loadPercent===null?'—':fp(l.loadPercent);
 return`<div class="lm${l.overload?' warn':''}" role="group" aria-label="Carga: ${pct} de la nominal; ${fh(l.totalWeeklyHours)} de ${fh(l.nominalWeeklyHours)} horas por semana.">${I('chart-donut-2')}<b>${fh(l.totalWeeklyHours)} / ${fh(l.nominalWeeklyHours)} h</b><span class="grow"></span><span class="pill ${l.overload?'borrador':'revision'}">${pct}</span></div>`}
const lpSide=(p,l)=>`<div id="lw" class="side">${loadMini(l)}${loadPanel(p,l)}</div>`;
const head=(h,sub,acts='')=>`<div class="hd"><div><h1>${h}</h1>${sub?`<p>${sub}</p>`:''}</div>${acts?`<div class="acts">${acts}</div>`:''}</div>`;
const banner=(k,ic,title,desc,act='')=>`<div class="bn ${k}" role="status">${I(ic)}<div class="bt"><b>${title}</b><p>${desc}</p></div>${act?`<div class="ba">${act}</div>`:''}</div>`;
const notice=(k,ic,body)=>`<div class="nt ${k}" role="${k==='err'?'alert':'status'}">${I(ic)}<div>${body}</div></div>`;
const empty=(ic,t)=>`<div class="em">${I(ic)}<p>${t}</p></div>`;
const crumb=(to,label)=>`<button class="crumb" data-act="to" data-v="${to}">${I('arrow-left')}${label}</button>`;
function topBar(){let h='';
 if(isBoth())h+=`<div class="rb"><span class="mut">Vista</span><div class="seg" role="group" aria-label="Vista del módulo"><button data-act="role" data-v="teacher" aria-pressed="${role==='teacher'}">${I('user')}Docente</button><button data-act="role" data-v="head" aria-pressed="${role==='head'}">${I('clipboard-check')}Jefatura</button></div></div>`;
 if(!online())h+=notice('warn','alert-triangle','<b>Sin conexión.</b>Tus cambios se guardan en este dispositivo. El envío y las decisiones se habilitan al reconectar.');
 return h}
const greeting=()=>{const h=Number(new Date().toLocaleString('en-US',{hour:'numeric',hour12:false,timeZone:'America/Mexico_City'}));return h<12?'Buen día':h<19?'Buenas tardes':'Buenas noches'};
const firstName=()=>(PEOPLE[tid()].name).replace(/^(Mtro\.|Dra?\.|Lic\.)\s*/,'').split(' ')[0];

/* ---------- Mi plan ---------- */
function vHome(){const p=P();
 if(!p)return head('Plan de trabajo',`Aún no tienes un plan para el semestre ${esc(CUR.label)}.`)+
  `<section class="xc state"><span class="bi">${I('file-pencil')}</span><div><h2>Crear plan de trabajo</h2><p>Se tomarán las secciones publicadas por Administración. Tu avance se guarda automáticamente.</p><div class="rowa"><button class="btn primary" data-act="create">Crear mi plan${I('arrow-right')}</button></div></div></section>`;
 const l=load(p),first=D.firstPendingSection(p),ss=secs(p),isE=canEdit(p);
 if(p.status==='in_review'||p.status==='approved'){
  const rv=p.status==='in_review';
  return head(rv?'En revisión':'Aprobado',`${esc(p.semester.label)} · ${esc(p.teacher.name)} · Versión ${p.version}`)+`<div class="pg"><div class="main"><section class="xc state"><span class="bi ${rv?'':'ok'}">${I(rv?'send':'circle-check')}</span><div><h2>${rv?'Tu plan ya está en buenas manos.':'Todo listo para este semestre.'}</h2>
   <p>${rv?`Jefatura recibió la versión ${p.version}${p.submittedAt?' el '+fd(p.submittedAt,true):''}. Puedes consultar el plan y conservar tu copia personal.`:`La versión ${p.version} fue aprobada${p.decidedAt?' el '+fd(p.decidedAt):''}. Puedes consultarla y descargar tu respaldo personal.`}</p>
   <div class="rowa"><button class="btn primary" data-act="pdf">${I('file-type-pdf')}Exportar PDF</button><button class="btn" data-act="ver" data-v="${p.id}|${p.version}">${I('file-description')}Consultar esta versión</button></div></div></section></div>${lpSide(p,l)}</div>`}
 const tiles=ss.map((s,i)=>{const t=tile(p,s,l);return`<li><button class="st${t.done?' ok':''}" data-act="sec" data-v="${s.id}" aria-label="${esc(s.label)}: ${esc(t.value)}. ${esc(t.status)}"><span class="sh2"><span class="ic2" style="color:${p.colors[s.id]?.color}">${I(sic(s))}</span><b>${esc(s.label)}</b></span><span class="vv">${esc(t.value)}</span><span class="sf"><span class="${t.done?'okt':'mut'}">${esc(t.status)}</span>${I(t.done?'circle-check':'arrow-right','e')}</span></button></li>`}).join('');
 let ret='';if(p.status==='returned'&&p.lastReturn){const rs=p.lastReturn.sectionId&&ss.find(s=>s.id===p.lastReturn.sectionId);ret=banner('warn','message-exclamation',`Tu plan necesita una corrección · versión ${p.lastReturn.version}`,`${esc(p.lastReturn.authorName)}: «${esc(p.lastReturn.comment)}»`,rs?`<button class="btn sm" data-act="sec" data-v="${rs.id}">Atender en ${esc(rs.label)}${I('arrow-right')}</button>`:'')}
 const cu=catUpdate(p);
 const cat=cu&&(!cu.dismissed||cu.catalog.mandatory)?banner('info','info-circle',`Nueva configuración del plan · versión ${cu.catalog.version}`,`Administración publicó ${cu.diff.length} ${cu.diff.length===1?'cambio':'cambios'}. Tu borrador no cambia hasta que decidas aplicarlos.`,`<button class="btn sm" data-act="to" data-v="catalog">Revisar cambios${I('arrow-right')}</button>`):'';
 const closed=!p.semester.isOpen?banner('warn','lock','Periodo de captura cerrado','Puedes consultar y descargar tu copia; no es posible editar ni enviar.'):'';
 return head('Mi plan de trabajo',`Semestre ${esc(p.semester.label)} · ${esc(p.teacher.career)}`,`${pill(p.status)}<span class="mut">Versión ${p.version}</span>`)+ret+cat+closed+
 `<div class="pg"><div class="main"><section class="xc hero"><div class="hr1"><div><span class="cap">Avance de captura</span><h2>${l.doneSections} de ${l.totalSections} secciones confirmadas</h2></div>${isE?(first?`<button class="btn primary" data-act="sec" data-v="${first.id}">${p.status==='returned'?'Atender correcciones':'Continuar captura'}${I('arrow-right')}</button>`:`<button class="btn primary" data-act="to" data-v="summary">Revisar y enviar${I('arrow-right')}</button>`):`<button class="btn" data-act="to" data-v="summary">${I('list-check')}Resumen</button>`}</div>
  <div class="bar" role="progressbar" aria-valuemin="0" aria-valuemax="${l.totalSections}" aria-valuenow="${l.doneSections}" aria-label="Secciones confirmadas"><i style="width:${l.totalSections?100*l.doneSections/l.totalSections:0}%"></i></div>
  <p class="mut hn">${isE?(first?`Siguiente sección: <b>${esc(first.label)}</b>`:'Todas las secciones están confirmadas. Revisa el resumen y envía tu plan.'):'Plan en modo de consulta.'}</p></section>
  <div class="tl2"><h2>Secciones del plan</h2></div><ul class="tls">${tiles}</ul>
  <div class="rowa bk">${saveHtml()}<span class="grow"></span><button class="btn" data-act="pdf">${I('file-type-pdf')}Exportar PDF</button></div>
  </div>${lpSide(p,l)}</div>`}

/* ---------- Captura de sección ---------- */
const CARD={docencia:['Tus asignaturas','Cada grupo conserva sus horas y número de estudiantes.'],tutorias:['Detalle de tutorías','Registra la cantidad. La duración la define Administración.'],investigacion:['Tus proyectos','Registra cada proyecto con sus horas semanales.'],publicaciones:['Publicaciones y continuidad','El historial continúa aunque cambies de revista.'],'servicio-social':['Detalle de servicio social','Solo cuenta el tramo que coincide con este semestre.'],comisiones:['Tus comisiones','Registra cada comisión con sus horas semanales.']};
const ADD={docencia:'Agregar asignatura',investigacion:'Agregar proyecto',publicaciones:'Nueva publicación','servicio-social':'Agregar actividad',comisiones:'Agregar comisión'};
const DLG_TITLE={docencia:'Asignatura del semestre',investigacion:'Proyecto de investigación',publicaciones:'Seguimiento de publicación',comisiones:'Comisión institucional','servicio-social':'Actividad de servicio social'};
const isPub=s=>s.fields.some(f=>f.id==='editorialStatus');
const titleField=s=>s.fields.find(f=>f.type==='text')||null;
const inlineFields=s=>!s.repeatable||s.calculation.kind==='proportional_total'?s.fields:s.fields.filter(f=>f.type==='integer'||f.type==='decimal').slice(0,3);
function chipText(s,r){const t=titleField(s),f=s.fields.find(x=>x.type==='text'&&x!==t&&(x.maxLength??999)<=80);if(!f)return'';const v=String(r[f.id]??'').trim();return v?(f.id==='group'?'Grupo '+v:v):''}
function fieldHtml(f,v,err,pfx,ro,attrs=''){const id=`${pfx}-${f.id}`,op=f.required?'':' <span class="mut">· opcional</span>';
 const sv=v===undefined||v===null?'':typeof v==='number'?String(v).replace('.',','):String(v);
 const at=`id="${id}" data-f="${f.id}" ${attrs} ${ro?'disabled':''} ${err?'class="bad" aria-invalid="true" aria-describedby="'+id+'-e"':''}`;
 let c;
 if(f.type==='boolean')return`<label class="ck"><input type="checkbox" ${at} ${v?'checked':''}><span>${esc(f.label)}${op}</span></label>`;
 if(f.type==='textarea')c=`<textarea ${at} rows="3" ${f.maxLength?`maxlength="${f.maxLength}"`:''}>${esc(sv)}</textarea>`;
 else if(f.type==='select')c=`<select ${at}><option value="">Elige una opción</option>${(f.options||[]).map(o=>`<option value="${esc(o.value)}" ${v===o.value?'selected':''}>${esc(o.label)}</option>`).join('')}</select>`;
 else if(f.type==='date')c=`<input type="date" ${at} value="${esc(sv)}">`;
 else c=`<input type="${f.type==='url'?'url':'text'}" ${f.type==='integer'?'inputmode="numeric"':f.type==='decimal'?'inputmode="decimal"':''} autocomplete="off" ${f.maxLength?`maxlength="${f.maxLength}"`:''} ${at} value="${esc(sv)}">`;
 return`<div class="field${f.type==='textarea'||(f.type==='text'&&(f.maxLength||0)>60)?' full':''}"><label class="fl2" for="${id}">${esc(f.label)}${op}</label>${c}${err?`<span class="fe" id="${id}-e">${esc(err)}</span>`:f.help?`<span class="hlp">${esc(f.help)}</span>`:''}</div>`}
function readField(f,el){if(!el)return{};if(f.type==='boolean')return{v:el.checked};const raw=el.value;
 if(f.type==='integer'||f.type==='decimal'){const r=D.parseLocaleNumber(raw,f.type==='integer',f.precision??2);return r.error?{e:r.error,raw}:{v:r.value===undefined?null:r.value}}
 if(f.type==='select'||f.type==='date')return{v:raw||null};return{v:raw}}

const capProgress=(p,s,ss,l)=>`<ol class="segs" aria-label="${l.doneSections} de ${l.totalSections} secciones confirmadas">${ss.map(x=>`<li class="${p.sections[x.id]?.completion==='done'?'done':''}${x.id===s.id?' cur':''}"></li>`).join('')}</ol><span class="mut sm">${l.doneSections} de ${l.totalSections} confirmadas · sección ${ss.indexOf(s)+1} de ${ss.length}</span><span class="grow"></span>${saveHtml()}`;
function capFooter(p,s,ss){const a=p.sections[s.id],ed=canEdit(p),nx=ss[ss.indexOf(s)+1],ok=D.sectionSupported(s);
 return`${ed?`<button class="btn" data-act="savedraft">${I('device-floppy')}Guardar borrador</button>`:`<button class="btn" data-act="to" data-v="home">${I('arrow-left')}Volver a mi plan</button>`}<span class="grow"></span>${a.completion==='done'?`<span class="pill aprobado">${I('circle-check')}Sección confirmada</span>${nx?`<button class="btn primary" data-act="sec" data-v="${nx.id}">Siguiente: ${esc(nx.label)}${I('arrow-right')}</button>`:`<button class="btn primary" data-act="to" data-v="summary">Revisar y enviar${I('arrow-right')}</button>`}`:ed?`<button class="btn primary" data-act="confirm" ${ok?'':'disabled'}>Confirmar sección${I('arrow-right')}</button>`:''}`}
function rowCalc(p,s,r){
 if(s.calculation.kind==='proportional_total'){const t=propText(p,r),tl=timeline(p,r);
  return`<b>Solo cuenta el tramo de este semestre.</b>${tl?`<div class="tb2" aria-hidden="true"><span class="o" style="flex-grow:${tl.bef}"></span><span class="in" style="flex-grow:${tl.ins}"></span><span class="o" style="flex-grow:${tl.aft}"></span></div><div class="tk" aria-hidden="true">${tl.lb.map(x=>`<span style="left:${x.at*100}%">${x.t}</span>`).join('')}</div>`:''}<span class="${t.ok?'':'bad'}">${esc(t.text)}</span>`}
 return''}
function tutDerived(p,s){const r=p.sections[s.id].rows[0]||{},n=Number(r.count||0),m=s.calculation.minutesPerTuteeWeekly||0,w=p.semester.effectiveWeeks,h=n*m*w/60;
 return`<b>${n} × ${m} min × ${w} semanas</b><span>${fh(h)} h semestrales · promedio de ${fh(h/w)} h por semana</span>`}
function vCapture(){const p=P(),ss=p?secs(p):[],s=ss.find(x=>x.id===prm.sec);
 if(!p||!s)return vStatus('missing');
 const l=load(p),a=p.sections[s.id],ed=canEdit(p),ok=D.sectionSupported(s);
 if(!s.repeatable&&!a.rows.length&&ed&&a.applicability==='applies')a.rows.push({id:D.uid(s.id)});
 const card=CARD[s.id]||['Detalle de '+s.label.toLowerCase(),s.description||'Captura cada actividad. Tu carga se actualiza con cada cambio.'];
 const rn=p.status==='returned'&&p.lastReturn&&(!p.lastReturn.sectionId||p.lastReturn.sectionId===s.id)?p.lastReturn:null;
 let body='';
 if(a.applicability==='not_applicable')body=`<div class="na">${I('minus')}<div><b>Marcaste esta sección como «No aplica».</b><p>Su aporte a la carga es cero.${a.rows.length?` Tus ${a.rows.length} registros se conservan en el borrador y vuelven si restauras la sección.`:''}</p></div>${ed?`<button class="btn" data-act="applies">${I('arrow-back-up')}Sí aplica</button>`:''}</div>`;
 else if(!s.repeatable){const r=a.rows[0]||{id:'_new'};
  body=`<div class="single">${s.fields.map(f=>fieldHtml(f,r[f.id],null,'in',!ed,`data-chg="inl" data-row="${r.id}"`)).join('')}${s.calculation.kind==='tutoring'?`<div class="field"><span class="fl2">Duración por tutoría</span><div class="ro">${s.calculation.minutesPerTuteeWeekly} minutos · parámetro institucional</div></div><div class="der" id="drv">${tutDerived(p,s)}</div><p class="mut sm">Solo se registra cantidad. No se solicitan nombres de estudiantes.</p>`:''}</div>`}
 else{
  body=a.rows.length?'':empty('file-off',`Aún no hay registros en esta sección. Agrega el primero${s.allowNotApplicable?' o marca «No aplica» si no corresponde':''}.`);
  const tf=titleField(s),prop=s.calculation.kind==='proportional_total';
  body+=a.rows.map(r=>{
   if(isPub(s)){const ag=pubAge(p,r),stt=s.fields.find(f=>f.id==='editorialStatus').options.find(o=>o.value===r.editorialStatus)?.label||'Sin estado';
    return`<article class="rc2"><span class="pill ${ag.tone==='success'?'aprobado':ag.tone==='warning'?'borrador':ag.tone==='danger'?'obs':'revision'}">${esc(ag.label)}</span><h3>${esc(rowTitle(s,r))}</h3><p class="mut">${esc(r.journal||'')}</p><div class="ra"><span class="mut sm">Seguimiento editorial · <b>${esc(stt)}</b></span><span class="grow"></span>${ed?`<button class="btn sm" data-act="redit" data-v="${r.id}">Actualizar estado</button>`:''}</div></article>`}
   const chip=chipText(s,r);
   return`<article class="rc2" data-row="${r.id}"><div class="rn"><h3>${esc(rowTitle(s,r))}</h3>${chip?`<span class="pill revision">${esc(chip)}</span>`:''}<span class="grow"></span>${ed?`<button class="btn sm sq" data-act="redit" data-v="${r.id}" aria-label="Editar ${esc(rowTitle(s,r))}" title="Editar">${I('pencil')}</button>`:''}</div>
   <div class="rfs${prop?' wide':''}">${inlineFields(s).filter(f=>!prop||f!==tf).map(f=>fieldHtml(f,r[f.id],null,'r-'+r.id,!ed,`data-chg="inl" data-row="${r.id}"`)).join('')}</div>
   ${prop?`<div class="tml" data-calc="${r.id}">${rowCalc(p,s,r)}</div>`:''}</article>`}).join('');
  if(ed)body+=`<button class="btn tonal addb" data-act="radd">${I('plus')}${ADD[s.id]||'Agregar actividad'}</button>`}
 return crumb('home','Mi plan')+head(esc(s.label),'Captura tus compromisos. Tu carga se actualiza con cada cambio.',pill(p.status))+
 `<div class="prow" id="pr">${capProgress(p,s,ss,l)}</div>`+
 (rn?notice('warn','message-exclamation',`<b>Observación de Jefatura · versión ${rn.version}</b>${esc(rn.authorName)} (${fd(rn.at,true)}): «${esc(rn.comment)}»`):'')+
 (!ed?notice('info','lock','<b>Consulta de solo lectura.</b>'+(!p.semester.isOpen?'El periodo de captura está cerrado.':conflict?'Resuelve el conflicto de versiones para seguir editando.':`El plan está ${ST[p.status][0].toLowerCase()} y no admite edición.`)):'')+
 (!ok?notice('err','alert-triangle','<b>Esta configuración requiere una actualización del sistema.</b>Puedes consultar los datos existentes; el envío queda bloqueado.'):'')+
 `<div class="pg"><div class="main"><section class="xc"><div class="sh"><span class="ic" style="color:${p.colors[s.id]?.color}">${I(sic(s))}</span><h2>${card[0]}</h2><span class="grow"></span>${s.allowNotApplicable&&ed&&a.applicability==='applies'?`<button class="btn sm" data-act="na">No aplica</button>`:''}</div><p class="mut sub">${card[1]}</p><div id="se">${prm.errs&&prm.errs.length?notice('err','alert-triangle',`<b>Antes de confirmar, revisa:</b><ul class="errs">${prm.errs.map(e=>`<li>${esc(e)}</li>`).join('')}</ul>`):''}</div>${body}</section><div class="fa" id="ft">${capFooter(p,s,ss)}</div><p class="mut sm">Al editar una sección confirmada, vuelve a revisarla antes de enviar.</p></div>${lpSide(p,l)}</div>`}
/* actualiza solo lo derivado, sin recrear los campos que se están editando */
function derived(){if(!root||screen!=='capture')return;const p=P(),ss=p?secs(p):[],s=ss.find(x=>x.id===prm.sec);if(!s)return;const l=load(p);
 const set=(sel,h)=>{const e=$(sel);if(e)e.innerHTML=h};
 set('#lw',loadMini(l)+loadPanel(p,l));set('#pr',capProgress(p,s,ss,l));set('#ft',capFooter(p,s,ss));if(s.calculation.kind==='tutoring')set('#drv',tutDerived(p,s));
 for(const r of p.sections[s.id].rows){const e=$(`[data-calc="${r.id}"]`);if(e)e.innerHTML=rowCalc(p,s,r)}}

/* ---------- Resumen y envío ---------- */
const chk=p=>D.submitCheck(p,{online:online(),saveState:dirty?'saving':saveState,catalogBlocked:!!catUpdate(p)&&!!catUpdate(p).catalog.mandatory});
function vSummary(){const p=P();if(!p)return vStatus('missing');const l=load(p),c=chk(p),ss=secs(p),ed=canEdit(p);
 const rows=ss.map(s=>{const t=tile(p,s,l),done=p.sections[s.id]?.completion==='done';return`<li><button class="sr2" data-act="sec" data-v="${s.id}"><span class="ic2" style="color:${p.colors[s.id]?.color}">${I(sic(s))}</span><span class="lab">${esc(s.label)}${done?'':' <span class="pill borrador">Pendiente</span>'}</span><b>${esc(t.value)}</b>${I('chevron-right','mut')}</button></li>`}).join('');
 return crumb('home','Mi plan')+head('Resumen del plan',c.ok?'La captura está completa. Revisa los datos antes de enviarlos a revisión.':'Completa lo pendiente antes de enviar tu plan a revisión.')+
 `<div class="pg"><div class="main"><section class="xc"><div class="sl"><span class="pill ${l.doneSections===l.totalSections?'aprobado':'borrador'}">${I(l.doneSections===l.totalSections?'circle-check':'clock-exclamation')}${l.doneSections} / ${l.totalSections} confirmadas</span><span class="grow"></span><span class="mut sm">${ST[p.status][0]} · versión ${p.version}</span></div><ul class="sums">${rows}</ul>
 <div class="field"><label class="fl2" for="ob">Observaciones generales · opcionales</label><textarea id="ob" rows="3" maxlength="4000" data-chg="obs" ${ed?'':'readonly'}>${esc(p.observations)}</textarea><span class="mut sm" id="obn">${p.observations.length} / 4000</span></div>
 ${!c.ok?notice('warn','alert-triangle',`<b>Aún no puedes enviar:</b><ul class="errs">${c.reasons.map(r=>`<li>${r.sectionId?`<button class="link" data-act="sec" data-v="${r.sectionId}">${esc(r.message)}</button>`:esc(r.message)}</li>`).join('')}</ul>`):''}
 ${l.overload?notice('info','info-circle',`<b>Tu carga supera la nominal (${fp(l.loadPercent)}).</b>Puedes enviar el plan; Jefatura verá la sobrecarga.`):''}
 <div class="fa"><button class="btn" data-act="pdf">${I('file-type-pdf')}Exportar PDF</button>${saveHtml()}<span class="grow"></span><button class="btn primary" data-act="send" ${c.ok?'':'disabled'} ${c.ok?'':'aria-describedby="why"'}>Enviar a revisión${I('send')}</button>${c.ok?'':`<span id="why" class="sr">Envío no disponible: ${esc(c.reasons[0]?.message||'')}</span>`}</div></section></div>${lpSide(p,l)}</div>`}

/* ---------- Actualización de configuración (catálogo) ---------- */
const KIND={added:'Nueva',removed:'Se retira',renamed:'Nombre',reordered:'Orden',rule:'Regla',fields:'Campos',parameter:'Parámetro'};
function vCatalog(){const p=P(),cu=p&&catUpdate(p);
 const h=crumb('home','Mi plan')+head('Nueva configuración del plan','Administración publicó cambios. Tu borrador no cambia hasta que decidas aplicarlos.');
 if(!cu)return h+notice('ok','circle-check','<b>Tu plan usa la configuración vigente.</b>No hay cambios pendientes de aplicar.');
 const b=load(p),a=D.safeLoad(D.migratePlan(clone(p),cu.catalog));
 return h+`<div class="pg"><div class="main"><section class="xc"><h2>${I('git-pull-request')}Qué cambia · versión ${p.catalogSnapshot.version} → ${cu.catalog.version}</h2><p class="mut sub">Publicada el ${fd(cu.catalog.publishedAt)}.</p>
 <ul class="diff">${cu.diff.map(d=>`<li><span class="pill ${d.kind==='added'?'revision':d.invalidatesConfirmation?'borrador':'neutral'}">${KIND[d.kind]||d.kind}</span><div><b>${esc(d.label)}</b><p>${esc(d.detail)}${d.invalidatesConfirmation?' La sección volverá a «Pendiente».':''}</p></div></li>`).join('')}</ul></section></div>
 <div class="side"><section class="xc imp"><h2>${I('chart-donut-2')}Impacto en tu carga</h2>
 <div class="nums"><div><small>Hoy</small><b>${fh(b.totalWeeklyHours)} h</b><span>${fp(b.loadPercent)}</span></div>${I('arrow-right','mut')}<div><small>Con la versión ${cu.catalog.version}</small><b>${fh(a.totalWeeklyHours)} h</b><span>${fp(a.loadPercent)}</span></div></div>
 <p class="mut sm">Las secciones nuevas quedan vacías y pendientes. Reordenar o renombrar conserva tus datos y colores. Los planes enviados y aprobados conservan su configuración original.</p>
 ${cu.catalog.mandatory?'<p class="warnt">Esta versión es obligatoria: podrás guardar, pero el envío queda bloqueado hasta aplicarla.</p>':''}
 <div class="rowa"><button class="btn primary" data-act="capply">Actualizar borrador${I('arrow-right')}</button><button class="btn" data-act="ckeep">Mantener por ahora</button></div></section></div></div>`}

/* ---------- Historial y consulta de versión ---------- */
const PER=20;
function vHistory(){const all=mine();const sems=[...new Map(all.map(p=>[p.semester.id,p.semester])).values()];
 const list=all.filter(p=>(!filt.hs||p.semester.id===filt.hs)&&(!filt.hst||p.status===filt.hst)),pages=Math.max(1,Math.ceil(list.length/PER)),pg=Math.min(filt.hp||1,pages);
 const li=list.slice((pg-1)*PER,pg*PER).map(p=>{const l=load(p);return`<li class="hi"><span class="sm2"><b>${p.semester.label.slice(-1)}</b></span><div class="gi"><b>${esc(p.semester.label)}</b><span class="mut">Versión ${p.version} · ${p.decidedAt?'decidido el '+fd(p.decidedAt):p.submittedAt?'enviado el '+fd(p.submittedAt):'en captura'}</span></div><span class="grow"></span><b>${fh(l.totalWeeklyHours)} h</b>${pill(p.status)}<button class="btn sm" data-act="ver" data-v="${p.id}|${p.version}">Consultar${I('arrow-up-right')}</button></li>`}).join('');
 return head('Historial de planes','Consulta cada plan con la configuración y las decisiones de su momento.')+`<section class="xc"><div class="fil"><label class="fl">Semestre<select data-chg="hs"><option value="">Todos los semestres</option>${sems.map(s=>`<option value="${s.id}" ${filt.hs===s.id?'selected':''}>${s.label}</option>`).join('')}</select></label><label class="fl">Estado<select data-chg="hst"><option value="">Todos los estados</option>${Object.entries(ST).map(([k,v])=>`<option value="${k}" ${filt.hst===k?'selected':''}>${v[0]}</option>`).join('')}</select></label><span class="grow"></span><button class="btn" data-act="clrh" ${filt.hs||filt.hst?'':'disabled'}>Limpiar filtros</button></div>
 <h2 class="h2i">${I('history')}Planes anteriores<span class="grow"></span><span class="mut sm">${list.length} ${list.length===1?'registro':'registros'}</span></h2>${list.length?`<ul class="hl">${li}</ul>`:empty('search-off','Ningún plan coincide con estos filtros.')}${pager(pg,pages,'hp')}</section>`}
const pager=(pg,pages,k)=>pages>1?`<nav class="pager" aria-label="Paginación"><button class="btn" data-act="page" data-v="${k}|${pg-1}" ${pg<=1?'disabled':''}>Anterior</button><span class="mut sm">Página ${pg} de ${pages}</span><button class="btn" data-act="page" data-v="${k}|${pg+1}" ${pg>=pages?'disabled':''}>Siguiente</button></nav>`:'';
function snapOf2(id,ver){const s=DB.snaps[id+'#'+ver];if(s)return s;const p=DB.plans[id];return p?{plan:p,version:p.version}:null}
/* acceso a una versión: su dueño, o Jefatura de la misma carrera cuando ya no es borrador */
function canView(p){if(!p)return false;if(p.teacher.id===tid())return true;
 return role==='head'&&p.status!=='draft'&&p.teacher.career===PEOPLE[HID].career}
function vVersion(){const sn=snapOf2(prm.id,prm.ver);if(!sn||!canView(DB.plans[prm.id]||sn.plan))return vStatus(sn?'forbidden':'missing');
 const p=sn.plan,l=load(p),ss=secs(p),back=role==='head'?['inbox','Bandeja de revisión']:['history','Historial'];
 const rows=ss.map(s=>{const v=l.values.find(x=>x.id===s.id),a=p.sections[s.id],na=a?.applicability==='not_applicable',op=!!openRows[s.id];
  const det=na?'No aplica':s.calculation.kind==='tracking_only'?'Seguimiento sin carga adicional':s.calculation.kind==='tutoring'?`${a.rows[0]?.count||0} tutorados`:noun(s.id,a.rows.length);
  return`<tr><th scope="row"><i class="dot" style="background:${p.colors[s.id]?.color}"></i>${esc(s.label)}</th><td>${det}</td><td class="r">${na?'0':fh(v?.semesterHours||0)}</td><td class="r">${a.rows.length&&!na?`<button class="btn sm sq" data-act="tog" data-v="${s.id}" aria-expanded="${op}" aria-label="Ver actividades de ${esc(s.label)}">${I(op?'chevron-up':'chevron-down')}</button>`:''}</td></tr>${op?`<tr class="ar"><td colspan="4"><ul class="al2">${a.rows.map(r=>`<li>${s.fields.map(f=>`<span><small>${esc(f.label)}</small>${esc(val(s,r,f.id))}</span>`).join('')}</li>`).join('')}</ul></td></tr>`:''}`}).join('');
 const ev=p.events.slice().reverse().map(e=>`<li><i class="dot"></i><div><b>${EVL[e.type]||e.type}${e.version?' · v'+e.version:''}</b><span class="mut sm">${fd(e.at,true)}${e.actorName?' · '+esc(e.actorName):''}</span>${e.comment?`<p>«${esc(e.comment)}»</p>`:''}</div></li>`).join('');
 return crumb(back[0],back[1])+head(`Plan de Trabajo · ${esc(p.semester.label)}`,`${esc(p.teacher.name)} · Versión ${sn.version||p.version} · ${ST[p.status][0]}${p.status==='approved'&&p.decidedAt?' el '+fd(p.decidedAt):''}`,`${pill(p.status)}<button class="btn" data-act="pdf" data-v="${p.id}|${sn.version||p.version}">${I('file-type-pdf')}Exportar PDF</button>`)+
 notice('info','info-circle',`<b>Consulta de solo lectura</b>Este plan conserva los nombres, parámetros y colores de la configuración con la que fue registrado.`)+
 `<div class="pg"><div class="main"><section class="xc"><div class="tw"><table><thead><tr><th>Sección</th><th>Detalle</th><th class="r">Horas / semestre</th><th></th></tr></thead><tbody>${rows}</tbody><tfoot><tr><th>Total</th><td>${fh(l.totalWeeklyHours)} h por semana</td><td class="r"><b>${fh(l.totalSemesterHours)}</b></td><td></td></tr></tfoot></table></div>
 <p class="obs"><b>Observaciones.</b> ${esc(p.observations||'Sin observaciones.')}</p>${p.lastReturn?`<p class="obs"><b>Comentario de Jefatura (v${p.lastReturn.version}).</b> ${esc(p.lastReturn.comment)}</p>`:''}</section>
 <section class="xc"><h2>${I('history')}Historial del plan</h2><ul class="evs">${ev}</ul></section></div>${lpSide(p,l)}</div>`}

/* ---------- Notificaciones, ayuda y estados ---------- */
const NIC={returned:'message-exclamation',approved:'circle-check',submitted:'send',catalog:'refresh',received:'file-alert'};
function vNotes(){const ns=notes();
 return head('Notificaciones','Cambios del plan y avisos de revisión.',ns.some(n=>!n.readAt)?`<button class="btn" data-act="readall">${I('checks')}Marcar todo como leído</button>`:'')+
 `<section class="xc">${ns.length?`<ul class="nl2">${ns.map(n=>`<li><button class="ni2${n.readAt?'':' un'}" data-act="note" data-v="${n.id}"><span class="ic2 ${n.type}">${I(NIC[n.type]||'bell')}</span><span class="tx"><b>${esc(n.title)}${n.readAt?'':'<span class="sr"> (sin leer)</span>'}</b><span>${esc(n.body)}</span><small>${fd(n.createdAt,true)}</small></span>${I('chevron-right','mut')}</button></li>`).join('')}</ul><p class="mut sm">Selecciona una notificación para consultar el detalle. Se marca como leída al abrir su destino.</p>`:empty('bell-off','No tienes notificaciones. Aquí verás devoluciones, aprobaciones y cambios de configuración.')}</section>`}
const FAQ=[
 ['¿Carga y avance son lo mismo?','No. La carga compara tus horas comprometidas con tu dedicación nominal (por ejemplo, 34 de 40 h = 85%). El avance cuenta las secciones que confirmaste como listas. Puedes tener 100% de avance con 85% de carga.'],
 ['¿Puedo superar el 100%?','Sí. Verás una advertencia para revisar tus compromisos, pero puedes guardar y enviar. El porcentaje real se conserva y Jefatura lo ve en su bandeja.'],
 ['¿Quién cambia las secciones?','Administración publica la configuración (secciones, campos y parámetros). Este módulo la consulta. Si llega una nueva versión, tu borrador no cambia hasta que revises el impacto y decidas actualizarlo.'],
 ['¿Qué significa «No aplica»?','Confirma que la sección aporta cero horas este semestre. Tus registros se conservan por si la restauras; en el PDF aparece como «No aplica».'],
 ['¿Qué contiene mi PDF?','Tus datos, el semestre, actividades, parámetros de carga, tabla de horas, observaciones, comentarios, estado, versión y fecha de emisión. Es una copia personal: un borrador no equivale a un plan aprobado.'],
 ['¿Dónde se guardan mis cambios?','En este dispositivo, aislados por usuario. Verás «Guardado en este dispositivo» con la hora. Si algo falla, el aviso lo indica y conservas una copia local.'],
 ['¿Necesito ayuda con mi cuenta?','Contacta al área que gestiona accesos y usuarios del SIGD en tu campus. Este módulo no crea cuentas ni envía correos.']];
function vHelp(){return head('Ayuda','Respuestas breves para completar tu plan.')+`<section class="xc faq">${FAQ.map(([q,a])=>`<details><summary><span>${q}</span>${I('chevron-down')}</summary><p>${a}</p></details>`).join('')}</section>
 <button class="btn" data-act="to" data-v="${role==='head'?'inbox':'home'}">${role==='head'?'Volver a la bandeja':'Volver a mi plan'}${I('arrow-right')}</button>`}
function vStatus(kind){const f=kind==='forbidden';
 return head(f?'Acceso no disponible.':'No encontramos este contenido.',f?'Tu cuenta no tiene permiso para este registro. No se muestran datos.':'El enlace puede estar incompleto o el registro ya no existe. No se creó ningún plan nuevo.')+`<button class="btn primary" data-act="to" data-v="${role==='head'?'inbox':'home'}">${role==='head'?'Ir a la bandeja':'Ir a mi plan'}${I('arrow-right')}</button>`}

/* ---------- Copia personal en PDF (sin capturar el DOM) ---------- */
const HW={"r":[278,278,355,556,556,889,667,191,333,333,389,584,278,333,278,278,556,556,556,556,556,556,556,556,556,556,278,278,584,584,584,556,1015,667,667,722,722,667,611,778,722,278,500,667,556,833,722,778,667,778,722,667,611,722,667,944,667,667,611,278,278,278,469,556,333,556,556,500,556,556,278,556,556,222,222,500,222,833,556,556,556,556,333,500,278,556,500,722,500,500,500,334,260,334,584,500,500,500,500,500,500,500,500,500,500,500,500,500,500,500,500,500,500,500,500,500,500,500,500,500,500,500,500,500,500,500,500,500,278,333,556,556,556,556,260,556,333,737,370,556,584,333,737,333,400,584,333,333,333,556,537,278,333,333,365,556,834,834,834,611,667,667,667,667,667,667,1000,722,667,667,667,667,278,278,278,278,722,722,778,778,778,778,778,584,778,722,722,722,722,667,667,611,556,556,556,556,556,556,889,500,556,556,556,556,278,278,278,278,556,556,556,556,556,556,556,584,611,556,556,556,556,500,556,500],"b":[278,333,474,556,556,889,722,238,333,333,389,584,278,333,278,278,556,556,556,556,556,556,556,556,556,556,333,333,584,584,584,611,975,722,722,722,722,667,611,778,722,278,556,722,611,833,722,778,667,778,722,667,611,722,667,944,667,667,611,333,278,333,584,556,333,556,611,556,611,556,333,611,611,278,278,556,278,889,611,611,611,611,389,556,333,611,556,778,556,556,500,389,280,389,584,500,500,500,500,500,500,500,500,500,500,500,500,500,500,500,500,500,500,500,500,500,500,500,500,500,500,500,500,500,500,500,500,500,278,333,556,556,556,556,280,556,333,737,370,556,584,333,737,333,400,584,333,333,333,611,556,278,333,333,365,556,834,834,834,611,722,722,722,722,722,722,1000,722,667,667,667,667,278,278,278,278,722,722,778,778,778,778,778,584,778,722,722,722,722,667,667,611,556,556,556,556,556,556,889,556,556,556,556,556,278,278,278,278,611,611,611,611,611,611,611,584,611,611,611,611,611,556,611,556]};
const CP={8364:128,8218:130,402:131,8222:132,8230:133,8224:134,8225:135,710:136,8240:137,352:138,8249:139,338:140,381:142,8216:145,8217:146,8220:147,8221:148,8226:149,8211:150,8212:151,732:152,8482:153,353:154,8250:155,339:156,382:158,376:159};
const byte=c=>{const n=c.charCodeAt(0);return n<256&&(n<128||n>159)?n:CP[n]||63};
const wText=(t,b,sz)=>{let w=0;for(const c of t){const n=byte(c);w+=(n>=32?HW[b?'b':'r'][n-32]:500)}return w*sz/1000};
function wrap(t,b,sz,maxW){const out=[];for(const para of String(t).split('\n')){let line='';for(const w of para.split(/\s+/)){if(!w)continue;const test=line?line+' '+w:w;if(wText(test,b,sz)<=maxW)line=test;else{if(line)out.push(line);line=w;while(wText(line,b,sz)>maxW&&line.length>1){let k=line.length;while(k>1&&wText(line.slice(0,k),b,sz)>maxW)k--;out.push(line.slice(0,k));line=line.slice(k)}}}out.push(line)}return out}
function makePdf(p,{local=false,issued=new Date()}={}){
 const W=595.28,H=841.89,M=48,CW=W-2*M,pages=[];let cur=null,y=0;
 const hex=h=>{const m=/^#?([0-9a-f]{6})$/i.exec(h||'');const n=m?parseInt(m[1],16):0x62737E;return[(n>>16&255)/255,(n>>8&255)/255,(n&255)/255].map(v=>v.toFixed(3)).join(' ')};
 const hs=s=>{let o='';for(const c of String(s)){const n=byte(c);o+=n===40||n===41||n===92?'\\'+String.fromCharCode(n):n<32||n>126?'\\'+n.toString(8).padStart(3,'0'):String.fromCharCode(n)}return'('+o+')'};
 const status=ST[p.status][0],issuedTxt=fd(issued,true);
 const page=()=>{cur=[];pages.push(cur);y=H-M-30;
  cur.push(`BT /F2 8 Tf 0.094 0.243 0.337 rg ${M} ${H-34} Td ${hs('UNIVERSIDAD DEL ISTMO · SIGD')} Tj ET`);
  const bt=`COPIA PERSONAL · ${status.toUpperCase()} · v${p.version}`;cur.push(`BT /F2 8 Tf 0.384 0.451 0.494 rg ${W-M-wText(bt,true,8)} ${H-34} Td ${hs(bt)} Tj ET`);
  cur.push(`0.878 0.906 0.918 RG 0.6 w ${M} ${H-42} m ${W-M} ${H-42} l S`);
  if(local){cur.push(`BT /F2 8 Tf 0.541 0.353 0 rg ${M} ${H-56} Td ${hs('COPIA LOCAL SIN SINCRONIZAR · Puede diferir de la última versión confirmada. No es un plan enviado ni aprobado.')} Tj ET`);y-=14}};
 const need=h=>{if(y-h<M+24)page()};
 const text=(t,{sz=10,b=false,col='#22313B',x=M,w=CW,lh=1.4,gap=0}={})=>{for(const ln of wrap(t,b,sz,w)){need(sz*lh);y-=sz*lh;cur.push(`BT /${b?'F2':'F1'} ${sz} Tf ${hex(col)} rg ${x} ${y.toFixed(2)} Td ${hs(ln)} Tj ET`)}y-=gap};
 const textAt=(t,x,{sz=10,b=false,col='#22313B',right=false}={})=>{const xx=right?x-wText(t,b,sz):x;cur.push(`BT /${b?'F2':'F1'} ${sz} Tf ${hex(col)} rg ${xx.toFixed(2)} ${y.toFixed(2)} Td ${hs(t)} Tj ET`)};
 const rect=(x,yy,w,h,col)=>cur.push(`${hex(col)} rg ${x.toFixed(2)} ${yy.toFixed(2)} ${w.toFixed(2)} ${h.toFixed(2)} re f`);
 const rule=()=>{cur.push(`0.878 0.906 0.918 RG 0.6 w ${M} ${y.toFixed(2)} m ${W-M} ${y.toFixed(2)} l S`)};
 page();
 const l=load(p),ss=secs(p),tab=(a,b,c)=>{need(18);y-=14;textAt(a,M+14);textAt(b,M+250);textAt(c,W-M,{right:true});};
 text(p.teacher.name,{sz:20,b:true,gap:2});text(`${p.teacher.career} · Campus ${p.teacher.campus} · Empleado ${p.teacher.employeeNumber}`,{sz:9.5,col:'#62737E',gap:10});
 const kv=[['Semestre',`${p.semester.label} · ${fd(p.semester.start)} – ${fd(p.semester.end)}`],['Estado',status+(p.status==='approved'&&p.decidedAt?' · '+fd(p.decidedAt,true):'')],['Versión del plan',`Versión ${p.version}`],['Configuración',`Versión ${p.catalogSnapshot.version} · publicada ${fd(p.catalogSnapshot.publishedAt)}`],['Parámetros',`${p.semester.effectiveWeeks} semanas efectivas · carga nominal ${fh(p.semester.nominalWeeklyMinutes/60)} h/semana`],['Emisión',`${issuedTxt} · hora de México`]];
 for(const[k,v]of kv){const ls=wrap(v,false,9.5,CW-110);need(ls.length*14);const y0=y-13;ls.forEach((ln,i)=>{y-=13.3;cur.push(`BT /F1 9.5 Tf ${hex('#22313B')} rg ${M+110} ${y.toFixed(2)} Td ${hs(ln)} Tj ET`)});cur.push(`BT /F2 9.5 Tf ${hex('#62737E')} rg ${M} ${y0.toFixed(2)} Td ${hs(k)} Tj ET`)}
 y-=10;text('Carga horaria',{sz:13,b:true,gap:6});
 need(24);rect(M,y-18,CW,18,'#E8F1F8');y-=13;textAt('Sección',M+14,{b:true,sz:8.5,col:'#183E56'});textAt('Detalle',M+250,{b:true,sz:8.5,col:'#183E56'});textAt('h / semestre',W-M-8,{b:true,sz:8.5,col:'#183E56',right:true});y-=6;
 for(const s of ss){const v=l.values.find(x=>x.id===s.id),a=p.sections[s.id],na=a?.applicability==='not_applicable';
  const det=na?'No aplica':s.calculation.kind==='tracking_only'?'Seguimiento sin carga adicional':s.calculation.kind==='tutoring'?`${a.rows[0]?.count||0} tutorados · ${fh(v?.weeklyHours||0)} h/sem`:`${noun(s.id,a.rows.length)} · ${fh(v?.weeklyHours||0)} h/sem`;
  need(22);y-=15;rect(M+2,y+1,8,8,p.colors[s.id]?.color);textAt(s.label,M+14,{b:true});textAt(det,M+250,{sz:9.5});textAt(na?'0':fh(v?.semesterHours||0),W-M-8,{right:true});y-=5;rule()}
 need(30);y-=18;textAt('Total',M+14,{b:true});textAt(`${fh(l.totalWeeklyHours)} h por semana`,M+250,{b:true});textAt(fh(l.totalSemesterHours),W-M-8,{b:true,right:true});y-=8;
 const pct=l.loadPercent===null?0:Math.min(l.loadPercent,100);
 need(40);y-=8;rect(M,y-8,CW,8,'#E0E7EA');rect(M,y-8,CW*pct/100,8,l.overload?'#A32845':'#285C76');y-=22;
 text(`${fh(l.totalSemesterHours)} h de ${fh(l.nominalMinutes/60)} h nominales del semestre · ${l.loadPercent===null?'—':fp(l.loadPercent)} de la carga nominal${l.overload?' (sobrecarga)':''}`,{sz:9.5,b:true,gap:12});
 for(const s of ss){const a=p.sections[s.id];if(!a||a.applicability==='not_applicable'||!a.rows.length)continue;
  need(40);text(s.label,{sz:12,b:true,col:'#183E56',gap:3});
  for(const r of a.rows){const parts=s.fields.filter(f=>val(s,r,f.id)!=='—').map(f=>`${f.label}: ${val(s,r,f.id)}`);const ex=extra(p,s,r);
   text('• '+rowTitle(s,r),{sz:9.5,b:true,x:M+6,w:CW-6});const rest=parts.filter(t=>!t.startsWith((titleField(s)||{}).label+':'));
   if(rest.length)text(rest.join('  ·  '),{sz:9,col:'#62737E',x:M+16,w:CW-16});if(ex)text(ex,{sz:9,col:'#183E56',x:M+16,w:CW-16});y-=3}
  y-=6}
 need(40);text('Observaciones',{sz:12,b:true,col:'#183E56',gap:3});text(p.observations||'Sin observaciones.',{sz:9.5,gap:8});
 if(p.lastReturn){text(`Comentario de Jefatura (v${p.lastReturn.version}) · ${p.lastReturn.authorName}`,{sz:9.5,b:true});text(p.lastReturn.comment,{sz:9.5,gap:8})}
 need(40);text('Historial del plan',{sz:12,b:true,col:'#183E56',gap:3});
 for(const e of p.events.slice().reverse())text(`${fd(e.at,true)} · ${EVL[e.type]||e.type}${e.version?' · v'+e.version:''}${e.actorName?' · '+e.actorName:''}${e.comment?' — «'+e.comment+'»':''}`,{sz:9,col:'#22313B',x:M+6,w:CW-6});
 /* pie y ensamblado */
 const n=pages.length,foot=`${p.teacher.name} · ${p.semester.label} · ${status} · versión ${p.version} · Emitido ${issuedTxt}`;
 pages.forEach((c,i)=>{c.push(`0.878 0.906 0.918 RG 0.6 w ${M} 40 m ${W-M} 40 l S`,`BT /F1 7.5 Tf 0.384 0.451 0.494 rg ${M} 28 Td ${hs(foot)} Tj ET`,`BT /F1 7.5 Tf 0.384 0.451 0.494 rg ${W-M-wText(`Página ${i+1} de ${n}`,false,7.5)} 28 Td ${hs(`Página ${i+1} de ${n}`)} Tj ET`)});
 const objs=[];const add=s=>(objs.push(s),objs.length);
 add('<< /Type /Catalog /Pages 2 0 R >>');add('');const f1=add('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>'),f2=add('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>');
 const kids=[];
 for(const c of pages){const body=c.join('\n');const ci=add(`<< /Length ${body.length} >>\nstream\n${body}\nendstream`);kids.push(add(`<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${W} ${H}] /Resources << /Font << /F1 ${f1} 0 R /F2 ${f2} 0 R >> >> /Contents ${ci} 0 R >>`))}
 objs[1]=`<< /Type /Pages /Kids [${kids.map(k=>k+' 0 R').join(' ')}] /Count ${kids.length} >>`;
 const info=add(`<< /Title ${hs('Plan de Trabajo · '+p.teacher.name+' · '+p.semester.label)} /Author ${hs(p.teacher.name)} /Subject ${hs('Copia personal · '+status+' · versión '+p.version)} /Producer (SIGD) >>`);
 let out='%PDF-1.4\n';const off=[];objs.forEach((o,i)=>{off.push(out.length);out+=`${i+1} 0 obj\n${o}\nendobj\n`});
 const xr=out.length;out+=`xref\n0 ${objs.length+1}\n0000000000 65535 f \n`+off.map(o=>String(o).padStart(10,'0')+' 00000 n \n').join('')+`trailer\n<< /Size ${objs.length+1} /Root 1 0 R /Info ${info} 0 R >>\nstartxref\n${xr}\n%%EOF`;
 const u=new Uint8Array(out.length);for(let i=0;i<out.length;i++)u[i]=out.charCodeAt(i)&255;return{bytes:u,pages:n}}
function pdfName(p,issued){const f=new Intl.DateTimeFormat('en-CA',{timeZone:p.semester.timezone,year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',hourCycle:'h23'}).formatToParts(issued),g=t=>f.find(x=>x.type===t)?.value||'00';
 const safe=s=>String(s).normalize('NFD').replace(/[̀-ͯ]/g,'').replace(/[–—\s]+/g,'-').replace(/[^A-Za-z0-9_-]/g,'');
 return`PT_${safe(p.teacher.employeeNumber)}_${safe(p.semester.label)}_${safe(ST[p.status][0])}_v${p.version}_${g('year')}${g('month')}${g('day')}-${g('hour')}${g('minute')}.pdf`}
function vPdf(){let p=prm.id&&prm.id!==curPlanId()?(snapOf2(prm.id,prm.ver)||{}).plan:P();
 if(!p||!canView(DB.plans[p.id]||p))return vStatus(p?'forbidden':'missing');
 const l=load(p),local=!online()||saveState==='error',own=p.teacher.id===tid();
 const prev=secs(p).map(s=>{const v=l.values.find(x=>x.id===s.id),na=p.sections[s.id]?.applicability==='not_applicable';return`<li><i class="dot" style="background:${p.colors[s.id]?.color}"></i><span>${esc(s.label)}</span><span class="grow"></span><b>${na?'No aplica':fh(v?.weeklyHours||0)+' h'}</b></li>`}).join('');
 return crumb(role==='head'?'inbox':'home',role==='head'?'Bandeja de revisión':'Mi plan')+head('Exportar PDF','Instantánea del plan. El estado y la versión se incluyen en el documento.')+
 `<div class="pg"><div class="main"><section class="xc"><h2>${I('file-type-pdf')}Tu plan. Tu respaldo.</h2><ul class="chk">${['Datos del docente y semestre','Actividades y parámetros de carga','Observaciones y decisiones','Estado, versión y fecha de emisión'].map(t=>`<li>${I('circle-check')}${t}</li>`).join('')}</ul>
 <p><span class="pill revision">${ST[p.status][0].toUpperCase()} · VERSIÓN ${p.version}</span></p>
 <p class="mut">${local?'Cada página llevará la etiqueta «Copia local sin sincronizar».':p.status==='approved'?'La copia corresponde a la versión aprobada.':'La copia indicará que todavía no está aprobada.'}</p>
 ${prm.err?notice('err','alert-circle',esc(prm.err)):''}
 <div class="fa"><button class="btn primary" id="gen" data-act="gen" data-v="${p.id}|${p.version}">Generar y descargar PDF${I('download')}</button><span class="mut sm">Documento A4 · Texto seleccionable</span></div></section></div>
 <div class="side"><section class="xc sheet" aria-label="Vista previa de la primera hoja"><span class="cap">Universidad del Istmo</span><h2>Plan de Trabajo Docente</h2><hr><h3>${esc(p.teacher.name)}</h3><p class="mut sm">${esc(p.teacher.career)} · ${esc(p.teacher.employeeNumber)}</p><span class="pill revision">Copia personal · ${esc(p.semester.label)}</span><ul class="pv">${prev}</ul>
 <div class="tot"><b>${fh(l.totalSemesterHours)} h / ${fh(l.nominalMinutes/60)} h nominales</b><span class="pill ${l.overload?'borrador':'aprobado'}">${l.loadPercent===null?'—':fp(l.loadPercent)}</span></div><p class="mut sm">${ST[p.status][0]} · versión ${p.version} · ${fd(p.savedAt,true)}</p></section></div></div>`}

/* ---------- Bandeja y revisión (Jefatura) ---------- */
const career=()=>PEOPLE[HID].career;
const inboxPlans=()=>Object.values(DB.plans).filter(p=>p.teacher.career===career()&&p.semester.id===CUR.id&&p.status!=='draft');
function vInbox(){const all=inboxPlans(),st=filt.is||'in_review',q=(filt.iq||'').trim().toLowerCase();
 const cnt=k=>pad(all.filter(p=>p.status===k).length);
 const list=all.filter(p=>p.status===st).filter(p=>!q||p.teacher.name.toLowerCase().includes(q)||p.teacher.employeeNumber.toLowerCase().includes(q)).sort((a,b)=>(a.submittedAt||'').localeCompare(b.submittedAt||'')),pages=Math.max(1,Math.ceil(list.length/PER)),pg=Math.min(filt.ip||1,pages);
 const li=list.slice((pg-1)*PER,pg*PER).map(p=>{const l=load(p),ini=p.teacher.name.split(' ').map(w=>w[0]).slice(0,2).join('').toUpperCase(),rv=p.status==='in_review';
  return`<li class="ib"><span class="av2">${ini}</span><span class="wh"><b>${esc(p.teacher.name)}</b><small class="mut">${esc(p.teacher.career)} · ${esc(p.teacher.employeeNumber)}</small></span><span class="mut sm">${fd(p.submittedAt,true)}</span><span class="grow"></span>${l.overload?`<span class="pill borrador">${fp(l.loadPercent)} · sobrecarga</span>`:pill(p.status)}<b>${fh(l.totalWeeklyHours)} h</b><button class="btn ${rv?'primary':''} sm" data-act="${rv?'rev':'ver'}" data-v="${p.id}|${p.submittedVersion||p.version}" aria-label="${rv?'Revisar plan de':'Consultar plan de'} ${esc(p.teacher.name)}">${rv?'Revisar plan':'Consultar'}${I(rv?'arrow-right':'arrow-up-right')}</button></li>`}).join('');
 return head('Bandeja de revisión','Cada decisión conserva la versión, los comentarios y las secciones revisadas.')+
 `<div class="stats" role="tablist" aria-label="Filtrar por estado">${[['in_review','Planes por revisar'],['returned','Devueltos'],['approved','Aprobados']].map(([k,t])=>`<button role="tab" class="stat${st===k?' sel':''}" aria-selected="${st===k}" data-act="ist" data-v="${k}"><span>${t}</span><b>${cnt(k)}</b></button>`).join('')}</div>
 <section class="xc"><div class="fil"><label class="fl">Buscar docente<input id="iq" type="search" placeholder="Nombre o número de empleado" value="${esc(filt.iq||'')}" data-chg="iq"></label><span class="grow"></span><span class="pill revision">${I('calendar-event')}${esc(CUR.label)}</span></div>
 ${list.length?`<ul class="hl">${li}</ul>${pager(pg,pages,'ip')}`:empty('search-off',all.length?'Ningún plan coincide con la búsqueda o el estado elegido.':'Aún no hay planes enviados por docentes de tu carrera en este semestre.')}</section>`}
const visitKey=(id,ver,sec)=>`${HID}|${id}|${ver}|${sec}`;
const visited=(id,ver)=>new Set(DB.visits.filter(v=>v.planId===id&&v.version===+ver&&v.reviewerId===HID).map(v=>v.sectionId));
function decidable(cur){if(!cur)return{ok:false,why:'Plan no disponible.'};
 if(cur.teacher.id===HID)return{ok:false,why:'Este plan requiere revisión por otra persona autorizada.'};
 if(cur.status!=='in_review'||cur.submittedVersion!==+prm.ver)return{ok:false,why:cur.status==='in_review'?`Hay una versión más reciente (v${cur.submittedVersion}). Las visitas de esta versión no autorizan aprobar la nueva.`:'Este plan ya tiene una decisión registrada.'};
 if(!online())return{ok:false,why:'Sin conexión: las decisiones se habilitan al reconectar.'};
 return{ok:true,why:''}}
function vReview(){const sn=snapOf2(prm.id,prm.ver),cur=DB.plans[prm.id];
 if(!sn||!cur)return vStatus('missing');if(cur.teacher.career!==career())return vStatus('forbidden');
 const p=sn.plan,ss=secs(p),i=ss.findIndex(s=>s.id===prm.sec),s=ss[i];
 if(!s)return crumb('inbox','Bandeja de revisión')+head('Revisión','')+empty('search-off','La sección no existe en esta versión.');
 const vs=visited(prm.id,prm.ver),all=ss.every(x=>vs.has(x.id)||x.id===s.id&&false),l=load(p),v=l.values.find(x=>x.id===s.id),a=p.sections[s.id],nx=ss[i+1],dc=decidable(cur);
 const sub=a.applicability==='not_applicable'?'No aplica · sin aporte a la carga':s.calculation.kind==='tracking_only'?`Seguimiento sin carga adicional · ${a.rows.length} registros`:`${fh(v?.weeklyHours||0)} h por semana · ${fh(v?.semesterHours||0)} h durante el semestre`;
 const nv=ss.filter(x=>vs.has(x.id)).length;
 return crumb('inbox','Bandeja de revisión')+head('Revisión del plan',`${esc(p.teacher.name)} · Plan ${esc(p.semester.label)} · Versión enviada ${prm.ver} · ${fh(l.totalWeeklyHours)} h por semana${l.overload?' · '+fp(l.loadPercent)+' (sobrecarga)':''}`)+
 (!dc.ok?notice('warn','info-circle',esc(dc.why)):'')+
 `<div class="rv2"><nav class="trail xc" aria-label="Secciones del plan"><p><b id="rvc">${nv} de ${ss.length} visitadas</b></p><ol>${ss.map(x=>`<li><button data-act="rsec" data-v="${x.id}" class="${x.id===s.id?'cur':''}" ${x.id===s.id?'aria-current="step"':''}>${I(vs.has(x.id)?'circle-check':'clock-exclamation',vs.has(x.id)?'okc':'')}<span>${esc(x.label)}</span><span class="sr">${vs.has(x.id)?'(visitada)':'(pendiente)'}</span></button></li>`).join('')}</ol></nav>
 <section class="xc rdc" id="rd"><span class="pill revision">${nx?`Sección ${i+1} de ${ss.length}`:'Última sección'}</span><h2 class="rt">${esc(s.label)}</h2><p class="mut">${sub}</p><hr>
 ${a.applicability==='not_applicable'?'':a.rows.length?`<ul class="acts2">${a.rows.map(r=>`<li>${s.fields.map(f=>`<span class="kv2${f.type==='textarea'||f===s.fields.find(x=>x.type==='text')?' w':''}"><small>${esc(f.label)}</small>${esc(val(s,r,f.id))}</span>`).join('')}${extra(p,s,r)?`<span class="kv2 w dv"><small>Cálculo</small>${esc(extra(p,s,r))}</span>`:''}</li>`).join('')}</ul>`:'<p class="mut">Sin actividades registradas.</p>'}
 <div id="rvn">${rvNotice(ss,vs)}</div>
 <div class="fa"><button class="btn" data-act="oret" ${dc.ok?'':'disabled'}>${I('arrow-back-up')}Devolver con comentarios</button><span class="grow"></span>${nx?`<button class="btn primary" data-act="rsec" data-v="${nx.id}">Ver siguiente sección${I('arrow-right')}</button>`:''}<button class="btn ${nx?'':'primary'}" id="apr" data-act="oapr" ${all&&dc.ok?'':'disabled'}>${I('check')}Aprobar plan</button></div>
 <p class="mut sm">Las visitas quedan registradas para esta versión. No sustituyen tu criterio de revisión.</p></section></div>`}
const rvNotice=(ss,vs)=>ss.every(x=>vs.has(x.id))?notice('ok','circle-check','<b>Todas las secciones fueron revisadas.</b>Puedes aprobar esta versión o devolverla con comentarios.'):notice('info','info-circle',`<b>Aprobación pendiente</b>Faltan ${ss.filter(x=>!vs.has(x.id)).length} ${ss.filter(x=>!vs.has(x.id)).length===1?'sección':'secciones'} por visitar para habilitar “Aprobar plan”.`);
/* una sección cuenta como visitada cuando su lectura está visible en pantalla */
let obs=null;
function watchVisit(){if(obs){obs.disconnect();obs=null}const el=$('#rd');if(!el||screen!=='review'||!window.IntersectionObserver)return;
 obs=new IntersectionObserver(es=>{if(!es.some(e=>e.isIntersecting))return;obs.disconnect();obs=null;recordVisit()},{threshold:.3});obs.observe(el)}
function recordVisit(){const key=visitKey(prm.id,prm.ver,prm.sec);if(screen!=='review'||DB.visits.some(v=>v.key===key)||!DB.plans[prm.id]||DB.plans[prm.id].teacher.id===HID)return;
 persist({visits:[{key,reviewerId:HID,planId:prm.id,version:+prm.ver,sectionId:prm.sec,at:new Date().toISOString()}]});
 const p=snapOf2(prm.id,prm.ver).plan,ss=secs(p),vs=visited(prm.id,prm.ver),dc=decidable(DB.plans[prm.id]);
 const n=$('#rvn');if(n)n.innerHTML=rvNotice(ss,vs);const c=$('#rvc');if(c)c.textContent=`${ss.filter(x=>vs.has(x.id)).length} de ${ss.length} visitadas`;
 const b=$('#apr');if(b)b.disabled=!(ss.every(x=>vs.has(x.id))&&dc.ok);
 $$('.trail button').forEach((bt,i)=>{const ok=vs.has(ss[i].id);bt.querySelector('.ti').className='ti ti-'+(ok?'circle-check okc':'clock-exclamation');bt.querySelector('.sr').textContent=ok?'(visitada)':'(pendiente)'})}

/* ---------- vista ---------- */
function render(){if(!root)return;const v=$('#v');if(!dlg){const d=$('#dl');d.innerHTML=''}
 const map={home:vHome,capture:vCapture,summary:vSummary,catalog:vCatalog,history:vHistory,version:vVersion,pdf:vPdf,notes:vNotes,help:vHelp,inbox:vInbox,review:vReview,status:()=>vStatus(prm.kind)};
 if(role==='head'&&['home','capture','summary','history','catalog'].includes(screen)){screen='inbox';prm={}}
 if(role==='teacher'&&['inbox','review'].includes(screen)){screen='home';prm={}}
 v.innerHTML=topBar()+map[screen]();if(conflict)renderConflict();else if(dlg===null&&$('#cf'))$('#cf').innerHTML='';paintSave();watchVisit()}

/* ---------- diálogos ---------- */
function openDlg(d){dlg=d;renderDlg()}
function closeDlg(){dlg=null;renderDlg()}
const ac=(...b)=>`<div class="ac">${b.join('')}</div>`;
const xbtn=`<button class="x" data-act="dcl" aria-label="Cerrar">${I('x')}</button>`;
function readRowForm(s){const vals={};for(const f of s.fields){const el=$('#dg-'+f.id);if(!el)continue;vals[f.id]=f.type==='boolean'?el.checked:el.value}return vals}
function renderDlg(){const el=$('#dl');if(!dlg){el.innerHTML='';if(root._last)try{root._last.focus()}catch(e){}return}
 if(!root._last||!el.firstChild)root._last=root.activeElement;
 let h='';const p=P();
 if(dlg.t==='row'){const s=secs(p).find(z=>z.id===dlg.sec),r=dlg.row;
  h=`<h3 id="dt">${DLG_TITLE[s.id]||s.label}</h3><p class="mut">${r?'Actualiza los datos. Se conserva el mismo registro y su historial.':'Completa los datos de esta actividad. La carga se recalcula al guardar.'}</p>
  ${dlg.note?notice('warn','alert-triangle',esc(dlg.note)):''}${dlg.errCount?notice('err','alert-triangle',`<b>Revisa ${dlg.errCount===1?'un dato':dlg.errCount+' datos'} antes de guardar.</b>`):''}
  <form id="rf" novalidate><div class="fg">${s.fields.map(f=>fieldHtml(f,dlg.vals?dlg.vals[f.id]:r?.[f.id],dlg.err&&dlg.err[f.id],'dg',false,'data-dirty')).join('')}</div>${ac(`<button type="button" class="btn" data-act="dclose">Cancelar</button>`,r?`<button type="button" class="btn danger" data-act="rdelask">${I('trash')}Eliminar</button>`:'','<span class="grow"></span>',`<button type="submit" class="btn primary">${r?'Guardar cambios':'Agregar'}${I('arrow-right')}</button>`)}</form>`}
 else if(dlg.t==='discard'){h=`<h3 id="dt">¿Descartar los cambios?</h3><p>Los datos que escribiste en este diálogo no se guardarán. El resto de tu borrador queda intacto.</p>${ac(`<button class="btn" data-act="dback">Seguir editando</button>`,`<button class="btn danger" data-act="dcl">Descartar</button>`)}`}
 else if(dlg.t==='del'){h=`<h3 id="dt">¿Eliminar «${esc(dlg.title)}»?</h3><p>La actividad sale de tu borrador y la carga se recalcula. Podrás deshacerlo durante 8 segundos. Las versiones ya enviadas no cambian.</p>${ac(`<button class="btn" data-act="dcl">Cancelar</button>`,`<button class="btn danger" data-act="ddel">${I('trash')}Eliminar actividad</button>`)}`}
 else if(dlg.t==='na'){const s=secs(p).find(z=>z.id===dlg.sec);h=`<h3 id="dt">¿Declarar «${esc(s.label)}» como No aplica?</h3><p>Su aporte a la carga será cero y la sección quedará confirmada. Los registros que ya capturaste se conservan y regresan si la restauras.</p>${ac(`<button class="btn" data-act="dcl">Cancelar</button>`,`<button class="btn primary" data-act="dna">Confirmar No aplica</button>`)}`}
 else if(dlg.t==='send'){const l=load(p);h=`<h3 id="dt">¿Enviar este plan a revisión?</h3><p>Enviarás la versión guardada del semestre ${esc(p.semester.label)}. Mientras esté en revisión, no podrás editarla.</p>${notice('ok','circle-check',`<b>Todas las secciones están listas.</b>Se registrarán la fecha de envío y la versión exacta · ${fh(l.totalWeeklyHours)} h por semana · ${fp(l.loadPercent)}.`)}${dlg.err?notice('err','alert-circle',`<b>No se envió.</b>${esc(dlg.err)}`):''}${ac(`<button class="btn" data-act="dcl">Cancelar</button>`,`<button class="btn primary" data-act="dsend">${I('send')}${dlg.err?'Reintentar envío':'Confirmar envío'}</button>`)}`}
 else if(dlg.t==='ret'){const sn=snapOf2(prm.id,prm.ver).plan,ss=secs(sn),sel=dlg.refSec??prm.sec,rows=sel?sn.sections[sel]?.rows||[]:[];
  h=`<h3 id="dt">Devolver plan a ${esc(sn.teacher.name)}</h3><p class="mut">Explica qué debe corregir. El comentario quedará asociado a esta versión.</p>
  <div class="field"><label class="fl2" for="rs">Sección relacionada · opcional</label><select id="rs" data-chg="rsec"><option value="">Plan completo</option>${ss.map(s=>`<option value="${s.id}" ${sel===s.id?'selected':''}>${esc(s.label)}</option>`).join('')}</select></div>
  ${rows.length?`<div class="field"><label class="fl2" for="ra">Actividad · opcional</label><select id="ra"><option value="">Toda la sección</option>${rows.map(r=>`<option value="${r.id}">${esc(r.subject||r.title||r.id)}</option>`).join('')}</select></div>`:''}
  <div class="field"><label class="fl2" for="cm">Comentario obligatorio</label><textarea id="cm" rows="4" maxlength="2000" ${dlg.err?'class="bad" aria-invalid="true" aria-describedby="cmh"':'aria-describedby="cmh"'}>${esc(dlg.cm||'')}</textarea>${dlg.err?`<span class="fe" id="cmh">${esc(dlg.err)}</span>`:'<span class="mut sm" id="cmh">Máximo 2000 caracteres.</span>'}</div>
  ${notice('info','info-circle','<b>El docente podrá corregir y reenviar.</b>Recibirá el aviso en su centro de notificaciones; no se envían correos.')}${dlg.derr?notice('err','alert-circle',esc(dlg.derr)):''}${ac(`<button class="btn" data-act="dcl">Cancelar</button>`,`<button class="btn danger" data-act="dret">Confirmar devolución</button>`)}`}
 else if(dlg.t==='apr'){const sn=snapOf2(prm.id,prm.ver).plan,l=load(sn);h=`<h3 id="dt">¿Aprobar el plan de ${esc(sn.teacher.name)}?</h3><p>Visitaste las ${secs(sn).length} secciones de la versión ${prm.ver}. Esta acción registra tu decisión y habilita su consulta para Reportes.</p>${notice('info','info-circle',`<b>Versión ${prm.ver} · ${fh(l.totalWeeklyHours)} h por semana</b>La decisión se guarda una sola vez y el plan queda en solo lectura.`)}${dlg.derr?notice('err','alert-circle',esc(dlg.derr)):''}${ac(`<button class="btn" data-act="dcl">Cancelar</button>`,`<button class="btn primary" data-act="dapr">Confirmar aprobación</button>`)}`}
 else if(dlg.t==='res'){h=`<h3 id="dt">${dlg.r==='approved'?'Aprobación registrada':'Devolución registrada'}</h3><p>${dlg.r==='approved'?'La versión quedó aprobada y disponible para consulta.':'El docente verá tu comentario y podrá corregir y reenviar.'}</p>${ac(`<button class="btn primary" data-act="dinbox">Volver a la bandeja${I('arrow-right')}</button>`)}`}
 el.innerHTML=`<div class="mb"><div class="md" role="dialog" aria-modal="true" aria-labelledby="dt">${dlg.t==='res'?'':xbtn}${h}</div></div>`;
 const f=el.querySelector('.bad,input:not([type=checkbox]),select,textarea,.btn.primary,.btn');setTimeout(()=>f&&f.focus(),30)}
/* conflicto de versiones: comparación por campo y elección explícita */
function mergePlans(mineP,theirs,ch){const out=clone(theirs);out.observations=(ch['observations']??'mine')==='mine'?mineP.observations:theirs.observations;
 for(const[sid,ans]of Object.entries(mineP.sections)){const t=out.sections[sid];if(!t){out.sections[sid]=clone(ans);continue}
  const ak=`${sid}::applicability`;if(ans.applicability!==t.applicability)t.applicability=(ch[ak]??'mine')==='mine'?ans.applicability:t.applicability;
  for(const row of ans.rows){const tr=t.rows.find(r=>r.id===row.id);
   if(!tr){if((ch[`${sid}:${row.id}::deleted`]??'mine')==='mine')t.rows.push(clone(row));continue}
   for(const k of Object.keys(row)){if(JSON.stringify(row[k])===JSON.stringify(tr[k]))continue;if((ch[`${sid}:${row.id}:${k}`]??'mine')==='mine')tr[k]=row[k]}}
  for(const tr of [...t.rows])if(!ans.rows.some(r=>r.id===tr.id)&&ch[`${sid}:${tr.id}::deleted`]==='mine')t.rows=t.rows.filter(r=>r.id!==tr.id);
  t.completion='pending';t.confirmedAt=null}
 return out}
function conflictFields(a,b){const out=[];const sv=v=>v===undefined||v===null||v===''?'(vacío)':String(v);
 if(a.observations!==b.observations)out.push({key:'observations',label:'Observaciones generales',mine:a.observations||'(vacío)',theirs:b.observations||'(vacío)'});
 for(const s of secs(a)){const x=a.sections[s.id],y=b.sections[s.id];if(!x||!y)continue;
  if(x.applicability!==y.applicability)out.push({key:`${s.id}::applicability`,label:`${s.label} · Aplica`,mine:x.applicability==='applies'?'Aplica':'No aplica',theirs:y.applicability==='applies'?'Aplica':'No aplica'});
  for(const r of x.rows){const t=y.rows.find(z=>z.id===r.id),name=String(r[s.fields[0]?.id]??r.id);
   if(!t){out.push({key:`${s.id}:${r.id}::deleted`,label:`${s.label} · ${name}`,mine:'Conservar actividad',theirs:'Eliminada en la otra sesión'});continue}
   for(const f of s.fields)if(JSON.stringify(r[f.id])!==JSON.stringify(t[f.id]))out.push({key:`${s.id}:${r.id}:${f.id}`,label:`${s.label} · ${name} · ${f.label}`,mine:sv(r[f.id]),theirs:sv(t[f.id])})}
  for(const t of y.rows)if(!x.rows.some(r=>r.id===t.id))out.push({key:`${s.id}:${t.id}::deleted`,label:`${s.label} · ${String(t[s.fields[0]?.id]??t.id)}`,mine:'Eliminada en esta sesión',theirs:'Conservar actividad'})}
 return out}
let cchoice={};
function renderConflict(){const el=$('#cf');if(!el||!conflict)return;const fs=conflictFields(conflict.mine,conflict.theirs),ch=k=>cchoice[k]||'mine';
 el.innerHTML=`<div class="mb"><div class="md wide" role="dialog" aria-modal="true" aria-labelledby="ct"><h3 id="ct">Hay dos versiones de tu borrador</h3><p class="mut">No reemplazaremos tus cambios sin que elijas qué conservar. Los cambios sin conflicto ya se fusionaron.</p>
 ${fs.length?`<div class="cmp" role="table" aria-label="Campos en conflicto"><div class="cr h" role="row"><span role="columnheader">Campo</span><span role="columnheader">Esta sesión</span><span role="columnheader">Otra sesión</span></div>${fs.map(f=>`<div class="cr" role="row"><span role="cell" class="lab">${esc(f.label)}</span>${['mine','theirs'].map(w=>`<label role="cell" class="opt${ch(f.key)===w?' sel':''}"><input type="radio" name="c-${esc(f.key)}" data-chg="cch" data-k="${esc(f.key)}" data-w="${w}" ${ch(f.key)===w?'checked':''}> ${esc(f[w])}</label>`).join('')}</div>`).join('')}</div>`:'<p class="mut">Las diferencias no afectan los mismos campos. Puedes guardar la versión combinada.</p>'}
 <p class="mut sm">Al guardar se revalida contra la versión más reciente (revisión ${conflict.theirs.revision}). Las secciones afectadas vuelven a «Pendiente».</p>
 ${ac(`<button class="btn" data-act="call">Usar todo de la otra sesión</button>`,'<span class="grow"></span>',`<button class="btn primary" data-act="cres">Guardar mi elección${I('arrow-right')}</button>`)}</div></div>`;
 const f=el.querySelector('input:checked,.btn');setTimeout(()=>f&&f.focus(),30)}

/* ---------- acciones ---------- */
function toast(m,act){const t=$('#tt');clearTimeout(toastT);t.innerHTML=`<span>${esc(m)}</span>${act?`<button class="tb" data-act="tact">${esc(act.label)}</button>`:''}`;t.classList.add('on');t._fn=act&&act.fn;toastT=setTimeout(()=>t.classList.remove('on'),act?8000:3200)}
function badRev(p){const f=store.read(),sp=f&&f.plans[p.id];if(sp&&sp.revision!==p.revision){conflict={mine:clone(p),theirs:clone(sp)};saveState='error';saveErr='El plan cambió en otra sesión. Elige qué conservar.';dlg=null;render();return true}return false}
function createPlan(){let p=P();if(p){go('home');return}
 const t=PEOPLE[tid()],cat=published(),prev=mine().find(x=>x.semester.id!==CUR.id&&x.status==='approved')||null,now=new Date().toISOString(),sections={};
 for(const s of D.activeSections({catalogSnapshot:cat}))sections[s.id]={applicability:'applies',completion:'pending',confirmedAt:null,rows:[]};
 p={id:`plan-${t.id}-${CUR.id}`,teacher:clone(t),semester:clone(CUR),status:'draft',version:1,revision:1,savedAt:now,catalogSnapshot:clone(cat),colors:D.presentationColors(cat.sections),sections,observations:'',events:[{id:D.uid('ev'),type:'created',at:now,actorId:t.id,version:1}]};
 const carried=D.carryOverPublications(prev,p,cat.policy.publicationCompletionStates);if(carried.length&&p.sections.publicaciones)p.sections.publicaciones.rows.push(...carried);
 persist({plans:[p]});DB.plans[p.id]=p;const first=D.firstPendingSection(p);saveState='saved';first?go('capture',{sec:first.id}):go('summary')}
function sendPlan(){const p=P();if(!online()){dlg.err='Sin conexión: no se puede enviar.';renderDlg();return}
 if(!flush(false)){if(conflict)return;dlg.err=saveErr||'No se pudo guardar antes de enviar.';renderDlg();return}
 if(badRev(p))return;const c=chk(p);if(!c.ok){dlg.err=c.reasons[0].message;renderDlg();return}
 const now=new Date().toISOString(),wasRet=p.status==='returned',ver=p.version+1;
 p.status='in_review';p.version=ver;p.revision++;p.savedAt=now;p.submittedVersion=ver;p.submittedAt=now;p.events=[...p.events,{id:D.uid('ev'),type:wasRet?'resubmitted':'submitted',at:now,actorId:p.teacher.id,version:ver}];
 const l=load(p);
 persist({plans:[p],snaps:[snapOf(p)],notes:[{id:D.uid('n'),userId:p.teacher.id,type:'submitted',title:'Enviaste la versión '+ver,body:p.semester.label+' · Jefatura recibió tu plan.',planId:p.id,version:ver,createdAt:now,readAt:null},
  {id:D.uid('n'),userId:HID,type:'received',title:p.teacher.name+' '+(wasRet?'reenvió':'envió')+' su plan',body:`${p.semester.label} · versión ${ver} · ${fh(l.totalWeeklyHours)} h por semana.`,planId:p.id,version:ver,createdAt:now,readAt:null}]});
 dlg=null;go('home');toast('Plan enviado a Jefatura.')}
function decide(kind,cm,sec,act){const f=store.read()||DB,cur=f.plans[prm.id],ver=+prm.ver;
 const fail=m=>{dlg.derr=m;renderDlg()};
 if(!online())return fail('Sin conexión: no se puede registrar la decisión.');
 if(!cur||cur.status!=='in_review'||cur.submittedVersion!==ver)return fail('El plan cambió de versión o ya tiene una decisión.');
 if(cur.teacher.id===HID)return fail('Este plan requiere revisión por otra persona autorizada.');
 if(kind==='approve'){const vs=visited(prm.id,ver),miss=secs(cur).filter(s=>!vs.has(s.id));if(miss.length)return fail(`Faltan ${miss.length} secciones por revisar.`)}
 const now=new Date().toISOString(),nm=reviewerName();
 cur.events=[...cur.events,{id:D.uid('ev'),type:kind==='approve'?'approved':'returned',at:now,actorId:HID,actorName:nm,version:ver,comment:cm,sectionId:sec||null,activityId:act||null}];
 cur.status=kind==='approve'?'approved':'returned';cur.revision++;cur.decidedAt=now;
 const snap=clone(snapOf2(prm.id,ver)||snapOf(cur));snap.key=prm.id+'#'+ver;
 if(kind==='return'){cur.lastReturn={comment:cm,authorId:HID,authorName:nm,at:now,version:ver,sectionId:sec||null,activityId:act||null};if(sec&&cur.sections[sec]){cur.sections[sec].completion='pending';cur.sections[sec].confirmedAt=null}}
 snap.status=cur.status;snap.createdAt=now;snap.plan={...snap.plan,status:cur.status,decidedAt:now,events:clone(cur.events),lastReturn:cur.lastReturn||null};
 persist({plans:[cur],snaps:[snap],notes:[kind==='approve'?{id:D.uid('n'),userId:cur.teacher.id,type:'approved',title:'Tu plan fue aprobado',body:`La versión ${ver} está disponible para consulta.`,planId:cur.id,version:ver,createdAt:now,readAt:null}
  :{id:D.uid('n'),userId:cur.teacher.id,type:'returned',title:'Tu plan necesita una corrección',body:`${nm}: ${cm.slice(0,140)}`,planId:cur.id,version:ver,createdAt:now,readAt:null,sectionId:sec||null}]});
 openDlg({t:'res',r:kind==='approve'?'approved':'returned'})}
function openRowDlg(secId,rowId){const p=P(),s=secs(p).find(x=>x.id===secId),r=rowId?p.sections[secId].rows.find(x=>x.id===rowId):null;let note=null;
 if(r&&isPub(s)){const ag=pubAge(p,r);if(ag.semesters>0&&!ag.concluded)note=`Pendiente desde hace ${ag.semesters} ${ag.semesters===1?'semestre':'semestres'}. Cambiar de revista no reinicia el historial.`}
 openDlg({t:'row',sec:secId,row:r,note})}
function saveRow(){const p=P(),s=secs(p).find(x=>x.id===dlg.sec),row={...(dlg.row||{id:D.uid(s.id)})},err={},vals={};
 for(const f of s.fields){const el=$('#dg-'+f.id),r=readField(f,el);vals[f.id]=f.type==='boolean'?el.checked:el.value;if(r.e)err[f.id]=r.e;else row[f.id]=r.v}
 if(!Object.keys(err).length)for(const e of D.validateRow(s,row))err[e.fieldId]=err[e.fieldId]||e.message;
 if(Object.keys(err).length){dlg.err=err;dlg.vals=vals;dlg.errCount=Object.keys(err).length;renderDlg();return}
 if(!dlg.row&&isPub(s)){row.originId=row.id;row.firstSemesterOrdinal=p.semester.ordinal||0}
 const clean=D.trimRow(s,row),edit=!!dlg.row;
 mut(pl=>{const a=pl.sections[s.id],i=a.rows.findIndex(x=>x.id===clean.id);if(i>=0)a.rows[i]=clean;else a.rows.push(clean)},s.id);
 dlg=null;renderDlg();render();toast(edit?'Actividad actualizada.':'Actividad agregada.')}
function closeRowAttempt(){if(dlg.t==='row'&&dlg.dirty){const s=secs(P()).find(x=>x.id===dlg.sec);dlg.vals=readRowForm(s);dlg={t:'discard',back:dlg};renderDlg()}else closeDlg()}
function download(bytes,name){const a=document.createElement('a'),u=URL.createObjectURL(new Blob([bytes],{type:'application/pdf'}));a.href=u;a.download=name;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(u),4000)}
const A={
 to:v=>go(v),sec:v=>go('capture',{sec:v}),create:()=>createPlan(),
 role:v=>{role=v;screen=role==='head'?'inbox':'home';prm={};render();window.scrollTo(0,0);api.onChange()},
 pdf:v=>{const[id,ver]=(v||'').split('|');go('pdf',id?{id,ver:+ver}:{})},
 gen:v=>{const[id,ver]=v.split('|');let p=id===curPlanId()?P():snapOf2(id,+ver).plan;
  if(id===curPlanId()&&dirty)flush(false);const issued=new Date(),local=!online()||saveState==='error';
  try{const r=makePdf(p,{local,issued}),name=pdfName(p,issued);download(r.bytes,name);toast(`Descarga preparada: ${name} · ${r.pages} ${r.pages===1?'página':'páginas'}.`)}catch(e){prm.err='No pudimos generar el PDF. Intenta de nuevo.';render()}},
 ver:v=>{const[id,ver]=v.split('|');go('version',{id,ver:+ver})},
 tog:v=>{openRows[v]=!openRows[v];render()},
 radd:()=>openRowDlg(prm.sec,null),redit:v=>openRowDlg(prm.sec,v),
 rdelask:()=>{const s=secs(P()).find(x=>x.id===dlg.sec),r=dlg.row;openDlg({t:'del',sec:dlg.sec,rid:r.id,title:rowTitle(s,r)})},
 ddel:()=>{const sec=dlg.sec,rid=dlg.rid,a=P().sections[sec],idx=a.rows.findIndex(x=>x.id===rid),row=a.rows[idx],title=dlg.title;
  mut(p=>{p.sections[sec].rows.splice(idx,1)},sec);dlg=null;renderDlg();render();
  toast(`Se eliminó «${title}».`,{label:'Deshacer',fn:()=>{const aa=P().sections[sec];if(aa.rows.some(x=>x.id===row.id)){toast('No se pudo deshacer: el registro cambió.');return}mut(p=>{p.sections[sec].rows.splice(Math.min(idx,p.sections[sec].rows.length),0,row)},sec);render();toast('Actividad restaurada.')}})},
 tact:()=>{const t=$('#tt'),f=t._fn;t.classList.remove('on');f&&f()},
 na:()=>openDlg({t:'na',sec:prm.sec}),
 dna:()=>{const sec=dlg.sec;mut(p=>{const a=p.sections[sec];a.applicability='not_applicable';a.completion='done';a.confirmedAt=new Date().toISOString()});flush(false);dlg=null;renderDlg();prm.errs=null;render()},
 applies:()=>{mut(p=>{const a=p.sections[prm.sec];a.applicability='applies';a.completion='pending';a.confirmedAt=null});render()},
 savedraft:()=>{if(flush(true))toast(persistent?'Borrador guardado en este dispositivo.':'Borrador guardado en esta sesión.')},
 confirm:()=>{const p=P(),s=secs(p).find(x=>x.id===prm.sec),a=p.sections[s.id];
  if(Object.keys(incomplete).some(k=>k.startsWith(s.id+':'))){prm.errs=['Hay un campo incompleto. Corrígelo antes de confirmar.'];render();return}
  const er=D.validateSection(s,a.rows,a.applicability);if(er.length){prm.errs=er;render();const e=$('#se');e&&e.scrollIntoView({block:'center'});return}
  prm.errs=null;const keep=clone(p);a.completion='done';a.confirmedAt=new Date().toISOString();dirty=true;
  if(!flush(false)){Object.assign(p,keep);render();return}
  const nx=D.firstPendingSection(P());if(nx)go('capture',{sec:nx.id});else go('summary')},
 send:()=>openDlg({t:'send'}),dsend:()=>sendPlan(),dcl:()=>closeDlg(),dclose:()=>closeRowAttempt(),dback:()=>{dlg=dlg.back;renderDlg()},
 capply:()=>{const p=P(),c=published();if(!flush(false))return;const m=D.migratePlan(clone(P()),c);m.events=[...m.events,{id:D.uid('ev'),type:'catalog_updated',at:new Date().toISOString(),actorId:p.teacher.id,version:p.version+1}];
  Object.assign(p,m);dirty=true;if(flush(true)){go('home');toast('Tu borrador usa la nueva configuración.')}else toast(saveErr||'No se pudo aplicar la configuración.')},
 ckeep:()=>{const c=published();mut(p=>{p.dismissedCatalogVersion=c.version});flush(false);go('home')},
 cres:()=>{const ch={};for(const f of conflictFields(conflict.mine,conflict.theirs))ch[f.key]=cchoice[f.key]||'mine';
  const m=mergePlans(conflict.mine,conflict.theirs,ch);conflict=null;cchoice={};Object.assign(P(),m);dirty=true;saveState='saving';if(flush(true))toast('Se guardó la versión combinada.');render()},
 call:()=>{for(const f of conflictFields(conflict.mine,conflict.theirs))cchoice[f.key]='theirs';renderConflict()},
 page:v=>{const[k,n]=v.split('|');filt[k]=+n;render();window.scrollTo(0,0)},
 clrh:()=>{filt.hs=filt.hst='';filt.hp=1;render()},
 ist:v=>{filt.is=v;filt.ip=1;render()},
 rev:v=>{const[id,ver]=v.split('|'),p=DB.plans[id];go('review',{id,ver:+ver,sec:secs(p)[0].id})},
 rsec:v=>{prm.sec=v;render();window.scrollTo(0,0)},
 oret:()=>openDlg({t:'ret',refSec:prm.sec}),oapr:()=>openDlg({t:'apr'}),
 dret:()=>{const cm=$('#cm').value.trim();if(!cm){dlg.err='Escribe qué debe corregir.';dlg.cm='';renderDlg();return}
  decide('return',cm,$('#rs').value,$('#ra')?$('#ra').value:'')},
 dapr:()=>decide('approve'),dinbox:()=>{dlg=null;filt.is='in_review';go('inbox')},
 note:v=>{const n=DB.notes.find(x=>x.id===v);n.readAt=n.readAt||new Date().toISOString();persist({notes:[n]});const p=DB.plans[n.planId];
  if(!p){go('status',{kind:'missing'});return}
  if(n.type==='received'){go('review',{id:p.id,ver:n.version,sec:secs(p)[0].id});return}
  if(n.type==='returned'){go('capture',{sec:n.sectionId||secs(P())[0].id});return}
  if(n.type==='catalog'){go('catalog');return}
  go('version',{id:n.planId,ver:n.version})},
 readall:()=>{const ns=notes().filter(n=>!n.readAt);ns.forEach(n=>n.readAt=new Date().toISOString());persist({notes:ns});render();api.onChange()}};
const C={
 inl:(el,live)=>{const p=P(),s=secs(p).find(x=>x.id===prm.sec),f=s.fields.find(x=>x.id===el.dataset.f),r=readField(f,el),key=`${s.id}:${el.dataset.row}:${f.id}`,box=el.closest('.field');
  const msg=box.querySelector('.fe');
  if(r.e){incomplete[key]=r.raw;el.classList.add('bad');el.setAttribute('aria-invalid','true');if(!live){let m=msg;if(!m){m=document.createElement('span');m.className='fe';box.appendChild(m)}m.textContent=r.e}paintSave();return}
  delete incomplete[key];el.classList.remove('bad');el.removeAttribute('aria-invalid');if(msg)msg.remove();
  mut(pl=>{const a=pl.sections[s.id];let row=a.rows.find(x=>x.id===el.dataset.row)||a.rows[0];if(!row){row={id:D.uid(s.id)};a.rows.push(row)}row[f.id]=r.v},s.id);paintSave()},
 obs:el=>{mut(p=>{p.observations=el.value.slice(0,4000)});const n=$('#obn');if(n)n.textContent=`${el.value.length} / 4000`},
 hs:el=>{filt.hs=el.value;filt.hp=1;render()},hst:el=>{filt.hst=el.value;filt.hp=1;render()},
 iq:el=>{filt.iq=el.value;filt.ip=1;render();const e=$('#iq');if(e){e.focus();e.setSelectionRange(e.value.length,e.value.length)}},
 rsec:el=>{dlg.refSec=el.value;dlg.cm=$('#cm').value;renderDlg()},
 cch:el=>{cchoice[el.dataset.k]=el.dataset.w;renderConflict()}};
function trap(e,box){if(e.key!=='Tab')return;const f=[...box.querySelectorAll('button:not([disabled]),input,select,textarea,[href]')].filter(x=>x.offsetParent!==null||x===root.activeElement);if(!f.length)return;
 const first=f[0],last=f[f.length-1],act=root.activeElement;if(e.shiftKey&&(act===first||!box.contains(act))){e.preventDefault();last.focus()}else if(!e.shiftKey&&(act===last||!box.contains(act))){e.preventDefault();first.focus()}}
function mount(el,css){root=el.attachShadow({mode:'open'});mounted=true;
 root.innerHTML=`<style>${css}</style><div id="v"></div><div id="dl"></div><div id="cf"></div><div id="tt" role="status" aria-live="polite"></div>`;
 if(roleKey!==U.k){roleKey=U.k;role=U.k==='118'?'head':'teacher';screen=role==='head'?'inbox':'home';prm={}}
 root.addEventListener('click',e=>{const t=e.target.closest('[data-act]');if(t&&!t.disabled)A[t.dataset.act]?.(t.dataset.v,t);
  else if(e.target.classList&&e.target.classList.contains('mb')&&dlg&&dlg.t!=='res'&&e.target.parentNode.id==='dl')dlg.t==='row'?closeRowAttempt():closeDlg()});
 root.addEventListener('change',e=>{const t=e.target.closest('[data-chg]');if(t&&C[t.dataset.chg])C[t.dataset.chg](t,false)});
 root.addEventListener('submit',e=>{e.preventDefault();if(e.target.id==='rf')saveRow()});
 root.addEventListener('keydown',e=>{if(e.key==='Escape'&&dlg&&dlg.t!=='res'){dlg.t==='row'?closeRowAttempt():closeDlg()}
  if(e.key==='Enter'&&e.target.matches&&e.target.matches('[data-chg="inl"]')){e.preventDefault();e.target.blur()}
  const box=$('#cf .md')||$('#dl .md');if(box)trap(e,box)});
 root.addEventListener('input',e=>{const t=e.target;
  if(t.id==='iq'){clearTimeout(root._iq);root._iq=setTimeout(()=>C.iq(t),250)}
  else if(t.id==='ob')C.obs(t);
  else if(t.matches&&t.matches('[data-chg="inl"]'))C.inl(t,true);
  else if(dlg&&dlg.t==='row'&&t.closest('#rf'))dlg.dirty=true});
 render()}
function logout(){if(dirty)flush(false);role=null;roleKey=null;screen='home';prm={};dlg=null;conflict=null;filt={};openRows={};for(const k in incomplete)delete incomplete[k]}
return{mount,logout,items,navGo,active,unread:()=>root?unread():0,set onChange(f){api.onChange=f}}})();

