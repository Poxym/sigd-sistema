/* ===== Módulo Informe de Actividades integrado al SIGD ===== */
const INF=(()=>{
const IC={doc:'file-description',gauge:'gauge',cal:'calendar-event',plusc:'circle-plus',list:'list',pen:'pencil',trash:'trash',eye:'eye',dl:'download',okc:'circle-check',alc:'alert-triangle',alt:'alert-triangle',bell:'bell',cla:'message-exclamation',cll:'clipboard-list',clc:'clipboard-check',chr:'chevron-right',chl:'chevron-left',save:'device-floppy',send:'send',clock:'clock',book:'book',flask:'flask',ban:'ban',up:'upload',plus:'plus',x:'x',info:'info-circle',chart:'chart-bar',ck:'check',circ:'circle',print:'printer',back:'arrow-left',cap:'school',case:'briefcase'};
let root=null,host=null,lastFocus=null,api={onChange(){}};
const $=s=>root.querySelector(s),$$=s=>[...root.querySelectorAll(s)];
const I=(n,c='')=>`<i class="ti ti-${IC[n]||n} ${c}" aria-hidden="true"></i>`;
const esc=s=>String(s??'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const today=()=>new Date().toLocaleDateString('es-MX',{day:'2-digit',month:'2-digit',year:'numeric'});
const now=()=>today()+' '+new Date().toTimeString().slice(0,5);
const fmt=s=>s?s.split('-').reverse().join('/'):'';
const SEC=[['A','Docencia','DOCENCIA','book'],['B','Investigación','INVESTIGACIÓN','flask'],['C','Formación de Recursos Humanos','FORMACIÓN RH','doc'],['D','Tutorías','TUTORÍAS','doc'],['E','Vinculación','VINCULACIÓN','doc'],['F','Difusión de la Cultura','DIFUSIÓN CULTURA','doc'],['G','Gestión','GESTIÓN','doc'],['H','Distinciones','DISTINCIONES','doc'],['I','Promoción al Desarrollo','PROMOCIÓN AL DESARROLLO','doc']];
const G={B:[['Memorias de congreso',['Trabajo presentado','Congreso','Fecha','Lugar']],['Ponencias en congresos, seminarios, foros o talleres',['Evento','Fecha','Lugar']],['Publicación de carteles',['Nombre del cartel','Fecha','Lugar']],['Libros / capítulos de libro',['Título','Autores','Editorial','Fecha']],['Otros (patente, informe técnico, prototipo…)',['Actividad','Clave / oficio / informe','Descripción']]],
C:[['Jurado de exámenes profesionales',['Sustentante','Fecha']],['Dirección de tesis (solo concluidas y aprobadas)',['Título de tesis','Tesista','Fecha de conclusión']],['Revisión de tesis',['Título de tesis','Tesista','Fecha']]],
D:[['Tutorados atendidos',['Nombre del tutorado','Matrícula','Semestre / grupo']]],
E:[['Asesoría y capacitación profesional externas',['Descripción','Institución o empresa']],['Distinciones obtenidas',['Descripción']],['Otras actividades de vinculación',['Descripción']]],
F:[['Participación en eventos culturales',['Evento','Fecha']],['Coordinación relacionada con la cultura',['Descripción']],['Compilación de libros y revistas culturales',['Descripción']],['Elaboración de materiales (trípticos, folletos, carteles)',['Descripción']]],
G:[['Integrante de comisión',['Comisión','Periodo']],['Integrante de comité',['Comité','Periodo']],['Coordinador(a) de programa',['Programa','Periodo']],['Planeación institucional',['Descripción']],['PRODEP',['Descripción']],['CONACYT',['Descripción']],['Representaciones externas a la UNISTMO',['Descripción']],['Sinodales en concursos de definitividad',['Descripción']],['Viajes de prácticas',['Descripción']],['Actualización de planes y programas',['Descripción']],['Representante de Cuerpo Académico',['Descripción','Periodo']],['Otras actividades de gestión',['Descripción']]],
H:[['Distinciones, perfil deseable y becas',['Nombre de distinción','Fuente de financiamiento','Nivel','Vigencia (inicio–término)']]],
I:[['Proyectos de promoción al desarrollo',['Proyecto','Hombres beneficiados','Mujeres beneficiadas','Municipio']]]};
const mk=k=>G[k].map(g=>[g[1].map(()=>'')]);
const mkd=()=>({B:{p:{},a:{},arts:[],projs:[],x:mk('B')},C:mk('C'),D:mk('D'),E:mk('E'),F:mk('F'),G:mk('G'),H:mk('H'),I:mk('I')});
const SL={A:'Docencia',B:'Investigación',C:'Formación RH',D:'Tutorías',E:'Vinculación',F:'Difusión de la cultura',G:'Gestión',H:'Distinciones',I:'Promoción al desarrollo'};
const SIN={na:'No aplica',e1:'Extraordinario 1',e2:'Extraordinario 2',es:'Especial'};
const PL={borrador:['Borrador','pencil'],revision:['En revisión','clock'],aprobado:['Aprobado','circle-check'],obs:['Devuelto','alert-triangle']};
const STN={borrador:'Borrador',revision:'En revisión',aprobado:'Aprobado',obs:'Devuelto'};
const initial=()=>({st:'borrador',del:false,sent:null,apr:null,cur:'A',mod:(()=>{const d=new Date(),q=n=>String(n).padStart(2,'0');return q(d.getDate())+'/'+q(d.getMonth()+1)+'/'+d.getFullYear()+' '+q(d.getHours())+':'+q(d.getMinutes())})(),
 courses:[{n:'Programación Web',g:'404-A',a:35,r:15,j:''},{n:'Bases de Datos',g:'405-B',a:28,r:35,j:'Grupo numeroso y contenidos complejos.'}],sin:['na'],esp:'',
 sec:{A:'done',B:'pend',C:'noact',D:'noact',E:'noact',F:'noact',G:'noact',H:'noact',I:'noact'},
 d:mkd(),
 obs:['Justificar reprobación en Bases de Datos (35%).','Completar Investigación.']});
const blank=()=>({st:'borrador',del:false,sent:null,apr:null,cur:'A',mod:now(),courses:[],sin:['na'],esp:'',sec:{A:'pend',B:'pend',C:'pend',D:'pend',E:'pend',F:'pend',G:'pend',H:'pend',I:'pend'},d:mkd(),obs:[]});
const SAMPLE={courses:[{n:'Estructuras de Datos',g:'301-A',a:30,r:10,j:''},{n:'Redes',g:'502-B',a:26,r:32,j:'Alta inasistencia durante el semestre.'}],sin:['na'],esp:'',sec:{A:'done',B:'noact',C:'noact',D:'done',E:'noact',F:'noact',G:'noact',H:'noact',I:'noact'},d:Object.assign(mkd(),{D:[[['Ana López Ruiz','2201001','3° A'],['Luis Pérez Gómez','2101045','5° B']]]})};
let S,JPo,JR,RV,JI,PV,PF,role,roleKey,screen;
function reset(){S=initial();JPo=[{n:'L. Pérez',i:'L.P',p:'2026-2027 A',d:'20/10/2026'},{n:'J. López',i:'J.L',p:'2025-2026 B',d:'10/05/2026'}];JR=[{n:'R. Méndez',i:'R.M',st:'aprobado',d:'27/10/2026'},{n:'S. Gómez',i:'S.G',st:'obs',d:'26/10/2026'}];RV={i:0,k:'A'};JI=0;PV=null;PF='dp';role=null;roleKey=null;screen='dp'}
reset();
const person=()=>U&&U.r==='Docente'?U.n:'María García Pérez';
const short=n=>{const w=n.split(' ');return w[0][0]+'. '+(w[1]||'')};
const inis=n=>{const w=n.split(' ');return w[0][0]+'.'+(w[1]||' ')[0]};
const JP=()=>{const l=(S.st==='revision'&&!S.del)?[{n:short(person()),i:inis(person()),p:'2026-2027 A',d:S.sent,live:1}]:[];return l.concat(JPo)};
const canSwitch=()=>U&&U.k==='000';
const lock=()=>S.st==='revision'||S.st==='aprobado';
const aBad=()=>S.courses.findIndex(c=>c.r>=30&&!c.j.trim());
const st=k=>k==='A'&&aBad()>-1?'warn':S.sec[k];
const nDone=()=>SEC.filter(s=>['done','noact'].includes(st(s[0]))).length;
const rowsOk=g=>g.some(grp=>grp.some(r=>r.some(c=>String(c||'').trim())));
const has=k=>k==='B'?S.d.B.projs.length>0||S.d.B.arts.length>0||rowsOk(S.d.B.x):rowsOk(S.d[k]);
function lab(k){const s=st(k);if(s==='noact')return'Sin actividad';if(s==='done')return k==='A'?S.courses.length+' cursos'+(S.courses.some(c=>c.r>=30)?', justificada':''):'Completo';return'Pendiente'}
function toast(m){const t=$('#toast');t.textContent=m;t.classList.add('on');clearTimeout(toast.t);toast.t=setTimeout(()=>t.classList.remove('on'),3200)}
function openM(id){lastFocus=root.activeElement||null;$('#mb').classList.remove('hidden');$$('.md').forEach(m=>m.classList.toggle('hidden',m.id!==id));const f=$('#'+id).querySelector('textarea,button:not(.x),input');setTimeout(()=>f&&f.focus(),30)}
const closeM=()=>{$('#mb').classList.add('hidden');if(lastFocus&&lastFocus.focus&&lastFocus.isConnected)lastFocus.focus()};
function go(id){screen=id;$$('.screen').forEach(s=>s.classList.toggle('active',s.id===id));({dp,dj,editor,review,preview}[id])();window.scrollTo(0,0);api.onChange()}
const get=p=>p.split('.').reduce((o,k)=>o?.[k],S);
function set(p,v){const k=p.split('.'),l=k.pop();k.reduce((o,x)=>o[x],S)[l]=v}
const val=p=>esc(get(p)),chk=p=>get(p)?'checked':'';
const pill=s=>`<span class="pill ${s}">${I(PL[s][1])}${PL[s][0]}</span>`;
const btn=(c,i,t,a,v='',x='')=>`<button class="btn ${c}" data-act="${a}" data-v="${v}" ${x}>${i?I(i):''}${t}</button>`;
const seg=()=>canSwitch()?`<div class="seg" role="group" aria-label="Vista del módulo"><button data-act="role" data-v="prof" aria-pressed="${role==='prof'}">${I('cap')}Docente</button><button data-act="role" data-v="jefe" aria-pressed="${role==='jefe'}">${I('case')}Jefatura</button></div>`:'';
const tile=(ic,v,l)=>`<div class="tile"><span class="ic">${I(ic)}</span><div><b>${v}</b><small>${l}</small></div></div>`;
/* ---------- Paneles ---------- */
function rows(){const r=[];if(!S.del)r.push({p:'2026-2027 A',s:S.st,e:S.sent||'--',a:S.apr||'--',act:1});r.push({p:'2025-2026 B',s:'aprobado',e:'15/05/2026',a:'20/05/2026'},{p:'2025-2026 A',s:'obs',e:'10/01/2026',a:'--'});return r}
function dp(){const R=rows(),al=[];
 R.forEach(r=>{if(r.s==='obs')al.push(`Tu informe ${r.p} tiene observaciones pendientes.`);if(r.act&&r.s==='borrador')al.push(`Tu informe ${r.p} está en borrador; puedes enviarlo.`);if(r.act&&r.s==='revision')al.push(`Tu informe ${r.p} está en revisión por Jefatura.`);if(r.act&&r.s==='aprobado')al.push(`Tu informe ${r.p} fue aprobado.`)});
 const ac=r=>({borrador:btn('sm','pen','Editar','edit')+btn('sm danger','trash','Eliminar','del'),revision:btn('sm','eye','Consultar','view',r.p),aprobado:btn('sm','eye','Consultar','view',r.p)+btn('sm','dl','Exportar','exp',r.p),obs:(r.act?btn('sm','pen','Editar','edit'):btn('sm','pen','Editar','edit2'))+btn('sm','eye','Consultar','view',r.p)})[r.s];
 $('#dp').innerHTML=`<div class="hd"><div><h1>Panel de control</h1><p>Docente · ${esc(person())}</p></div><div class="acts">${seg()}${btn('primary','circle-plus','Nuevo informe','nuevo')}</div></div>
 <div class="tiles">${tile('cal','2026-2027 A','Periodo activo')}${tile('clock','15/12/2026','Fecha límite')}${tile('doc',S.del?'Sin informe':STN[S.st],'Estado de tu informe actual')}</div>
 <div class="xc" id="tbl"><h2>${I('list')}Mis informes</h2><div class="tw"><table><thead><tr><th>Periodo</th><th>Estado</th><th>Envío</th><th>Aprobación</th><th class="r">Acciones</th></tr></thead><tbody>${R.map(r=>`<tr><td><b>${r.p}</b></td><td>${pill(r.s)}</td><td>${r.e}</td><td>${r.a}</td><td class="r">${ac(r)}</td></tr>`).join('')}</tbody></table></div></div>
 <div class="xc al"><span class="ic">${I('bell')}</span><div style="flex:1"><h2>Alertas</h2><ul>${al.length?al.map(x=>`<li>${x}</li>`).join(''):'<li>No tienes alertas pendientes.</li>'}</ul></div></div>`}
function dj(){const P=JP(),rv=JR.map(r=>`<tr><td><span class="who"><span class="av2">${r.i}</span>${r.n}</span></td><td>${pill(r.st)}</td><td>${r.d}</td><td class="r">${btn('sm','eye','Consultar','vrev',r.n)}</td></tr>`).join('');
 $('#dj').innerHTML=`<div class="hd"><div><h1>Panel de control</h1><p>Jefatura de carrera · Ingeniería en Computación</p></div><div class="acts">${seg()}</div></div>
 <div class="tiles">${tile('cll',P.length,'Pendientes de revisión')}${tile('clc',JR.length,'Revisados recientemente')}</div>
 <div class="xc"><h2>${I('cll')}Informes pendientes de revisión (${P.length})</h2><div class="tw"><table><thead><tr><th>Docente</th><th>Periodo</th><th>Fecha de envío</th><th class="r">Acciones</th></tr></thead><tbody>${P.length?P.map((r,i)=>`<tr><td><span class="who"><span class="av2">${r.i}</span>${esc(r.n)}</span></td><td>${r.p}</td><td>${r.d}</td><td class="r">${btn('sm primary','eye','Revisar','rev',i)}</td></tr>`).join(''):'<tr><td colspan="4" class="mut">No hay informes pendientes.</td></tr>'}</tbody></table></div></div>
 <div class="xc"><h2>${I('clc')}Informes revisados recientemente</h2><div class="tw"><table><thead><tr><th>Docente</th><th>Estado</th><th>Fecha de revisión</th><th class="r">Acciones</th></tr></thead><tbody>${rv}</tbody></table></div></div>`}
/* ---------- Editor ---------- */
function editor(){const L=lock(),n=nDone(),pc=Math.round(n/9*100);
 if(S.del){$('#editor').innerHTML=`<div class="hd"><div><h1>Mi informe</h1><p>No tienes un informe del periodo 2026-2027 A.</p></div><div class="acts">${btn('primary','circle-plus','Nuevo informe','nuevo')}</div></div>`;return}
 $('#editor').innerHTML=`<button class="crumb" data-act="back">${I('back')}Volver al panel</button>
 <div class="hd"><div><h1>Informe 2026-2027 A <span class="pill ${S.st}">${I(PL[S.st][1])}${STN[S.st]}</span></h1><p>${I('clock')} Última modificación: ${S.mod}</p>
 <div class="prog"><b>Progreso general: <span class="gt">${pc}%</span></b><span class="mut">(${n} de 9 secciones listas)</span><div class="bar" role="progressbar" aria-valuenow="${pc}" aria-valuemin="0" aria-valuemax="100" aria-label="Progreso del informe"><i style="width:${pc}%"></i></div></div></div>
 <div class="acts">${btn('tonal','save','Guardar borrador','saveR','',L?'disabled':'')}${btn('','eye','Vista previa','prev')}${btn('primary','send','Enviar a revisión','send','',L?'disabled':'')}</div></div>
 ${L?`<div class="lockb">${I('info')}El informe está ${S.st==='aprobado'?'aprobado':'en revisión'}; la edición está bloqueada.</div>`:''}
 <div class="eg"><aside class="xc" aria-label="Índice del informe"><h3 class="cap">Índice del informe</h3>${SEC.map(([k])=>{const s=st(k);return`<button class="xi ${S.cur===k?'on':''} ${s==='pend'||s==='warn'?'w':''}" data-act="cur" data-v="${k}" ${S.cur===k?'aria-current="true"':''}>${I(s==='done'?'okc':s==='noact'?'circ':'alt',s==='done'?'c1':s==='noact'?'c3':'c2')}<span class="t"><b>${k}. ${SL[k]}</b><small>${lab(k)}</small></span>${I('chr','ch')}</button>`}).join('')}</aside>
 <section class="xc"><fieldset id="sc" ${L?'disabled':''}></fieldset></section>
 <aside class="xc ob"><span class="ic">${I('cla')}</span><h3>Observaciones de Jefatura</h3>${S.obs.length?`<ul>${S.obs.map(o=>`<li>${esc(o)}</li>`).join('')}</ul>${btn('primary','okc','Marcar como atendidas','accObs')}`:'<p class="mut">Sin observaciones.</p>'}</aside></div>`;
 sec()}
function sec(){const k=S.cur,m=SEC.find(s=>s[0]===k);let b=k==='A'?secA():k==='B'?secB():secG(k);
 $('#sc').innerHTML=`<div class="sh"><span class="ic">${I(m[3])}</span><h2>${k}. ${m[1]}</h2></div>${b}<div class="acts2">${btn('tonal','save','Guardar sección','ss')}${btn('warnb','ban','Marcar como sin actividad','na')}</div>`;
 $$('#sc [data-b]').forEach(e=>{const f=()=>{let v=e.type==='checkbox'?e.checked:e.type==='number'?(e.value===''?'':Number(e.value)):e.value;const p=e.dataset.b;set(p,v);if(/^courses\.\d+\.(n|r)$/.test(p))updRep(+p.split('.')[1])};e.addEventListener('input',f);e.addEventListener('change',f)});
 $$('#sc [data-sin]').forEach(e=>e.addEventListener('change',()=>{const k=e.dataset.sin;let a=S.sin.filter(x=>x!==k);if(e.checked){a=k==='na'?['na']:[...a.filter(x=>x!=='na'),k]}S.sin=a;sec()}));
 const fi=$('#fa');if(fi)fi.addEventListener('change',()=>{const f=fi.files[0];if(!f)return;if(f.type!=='application/pdf'||f.size>5*1048576){toast('El archivo debe ser PDF de hasta 5 MB.');fi.value='';return}S.d.B.a.fn=f.name;$('#fn').textContent=f.name})}
function secA(){return `<div class="box"><h4>Datos generales</h4><div class="g2"><p>Número de empleado: ${esc(U.k)}</p><p>Nombre: ${esc(person())}</p><p>Carrera: Ing. Computación</p><p>Fecha del informe: ${today()}</p></div></div>
 <div class="box"><h4>Cursos impartidos</h4><div class="tw"><table class="ct"><thead><tr><th>Curso</th><th>Grupo</th><th>Alumnos inscritos</th><th><span class="sr" style="position:absolute;left:-9999px">Quitar</span></th></tr></thead><tbody>${S.courses.map((c,i)=>`<tr><td><input aria-label="Curso" data-b="courses.${i}.n" value="${esc(c.n)}"></td><td><input aria-label="Grupo" data-b="courses.${i}.g" value="${esc(c.g)}"></td><td><input aria-label="Alumnos inscritos" type="number" min="0" data-b="courses.${i}.a" value="${c.a}"></td><td><button class="btn sm sq danger" data-act="delc" data-v="${i}" aria-label="Eliminar curso" title="Eliminar curso">${I('trash')}</button></td></tr>`).join('')}</tbody></table></div>${btn('tonal sm mini','plus','Agregar curso','addc')}</div>
 <div class="box"><h4>Sinodal de examen</h4>${Object.entries(SIN).map(([k,v])=>`<label class="ck"><input type="checkbox" data-sin="${k}" ${S.sin.includes(k)?'checked':''}>${v}</label>`).join('')}<label class="fl" style="margin-top:8px">Especificar<input data-b="esp" value="${esc(S.esp)}" placeholder="Escribe aquí (opcional)"></label></div>
 <div class="box"><h4>Porcentaje de reprobación</h4><div id="rp">${S.courses.map((c,i)=>repRow(i)).join('')||'<span class="mut">Agrega cursos.</span>'}</div></div>`}
const repCell=i=>{const c=S.courses[i];return c.r>=30?`<div class="rc"><button class="btn jbtn ${c.j.trim()?'ok':'bad'}" data-act="just" data-v="${i}"><span style="overflow:hidden;text-overflow:ellipsis">${c.j.trim()?esc(c.j):'Justifica el porcentaje de reprobación...'}</span></button><span class="req">${I('alt')}Obligatorio</span></div>`:`<span class="okt">No requiere justificación (&lt; 30%)</span>`};
const repRow=i=>{const c=S.courses[i];return`<div class="rp"><span class="lb" id="rl${i}">${esc(c.n)||'Curso'}</span><span class="pcw"><input aria-label="Porcentaje de reprobación" type="number" min="0" max="100" data-b="courses.${i}.r" value="${c.r}">%</span><div id="rc${i}">${repCell(i)}</div></div>`};
function updRep(i){const c=S.courses[i];if(c.r>100||c.r<0){c.r=Math.min(100,Math.max(0,c.r||0))}const l=$('#rl'+i),r=$('#rc'+i);if(l)l.textContent=c.n||'Curso';if(r)r.innerHTML=repCell(i)}
function secB(){const a=S.d.B.a;return `<div class="box"><h4>Proyectos <small class="mut" style="font-weight:400">(puedes agregar varios)</small></h4><div class="gr r2"><label class="fl">Nombre del proyecto<input data-b="d.B.p.nombre" value="${val('d.B.p.nombre')}"></label><label class="fl">Clave/oficio<input data-b="d.B.p.clave" value="${val('d.B.p.clave')}"></label></div>
 <div style="margin:10px 0 2px"><small class="mut">Tipo de proyecto</small><div>${[['int','Interno'],['con','Conacyt'],['pro','Prodep'],['otr','Otro']].map(([k,v])=>`<label class="ck"><input type="checkbox" data-b="d.B.p.t_${k}" ${chk('d.B.p.t_'+k)}>${v}</label>`).join('')}</div></div>
 <div class="gr r2" style="margin-top:12px"><div><label class="fl">Vigencia<span style="display:flex;gap:8px;align-items:center"><input aria-label="Inicio de vigencia" type="date" data-b="d.B.p.v1" value="${val('d.B.p.v1')}">al<input aria-label="Fin de vigencia" type="date" data-b="d.B.p.v2" value="${val('d.B.p.v2')}"></span></label><label class="fl" style="margin-top:12px">Colaboradores<input data-b="d.B.p.col" value="${val('d.B.p.col')}"></label></div><label class="fl">Descripción<textarea rows="4" data-b="d.B.p.desc">${val('d.B.p.desc')}</textarea></label></div><div style="margin-top:12px;text-align:right">${btn('tonal','plus','Agregar proyecto','addp')}</div>${S.d.B.projs.length?`<ul class="arts">${S.d.B.projs.map((x,i)=>`<li><span><b>${esc(x.nombre)}</b>${x.clave?' · '+esc(x.clave):''}${x.v1?' · '+fmt(x.v1)+' al '+fmt(x.v2):''}</span><button class="btn sm sq danger" data-act="delp" data-v="${i}" aria-label="Eliminar proyecto">${I('trash')}</button></li>`).join('')}</ul>`:''}</div>
 <div class="box blue"><h4>${I('doc')} Artículos <small class="mut" style="font-weight:400">(solo publicados en el periodo)</small></h4>
 <div class="gr r3"><label class="fl">Título<input data-b="d.B.a.t" value="${val('d.B.a.t')}"></label><label class="fl">Revista<input data-b="d.B.a.r" value="${val('d.B.a.r')}"></label><label class="fl">Autores<input data-b="d.B.a.au" value="${val('d.B.a.au')}"></label></div>
 <div class="gr r2" style="margin-top:12px"><div>${[['ind','Indexado'],['arb','Arbitrado'],['div','Divulgación'],['ace','Aceptado'],['pub','Publicado'],['nac','Nacional'],['ext','Extranjero']].map(([k,v])=>`<label class="ck"><input type="checkbox" data-b="d.B.a.${k}" ${chk('d.B.a.'+k)}>${v}</label>`).join('')}</div><label class="fl">Fecha de publicación<input type="date" data-b="d.B.a.f" value="${val('d.B.a.f')}"></label></div>
 <div class="gr r3" style="margin-top:12px"><label class="fl">ISSN<input data-b="d.B.a.issn" value="${val('d.B.a.issn')}"></label><label class="fl">Índice: JCR / SCOPUS / Otro<input data-b="d.B.a.idx" value="${val('d.B.a.idx')}"></label><label class="fl">URL/DOI<input data-b="d.B.a.doi" value="${val('d.B.a.doi')}"></label></div>
 <div style="display:flex;gap:12px;align-items:end;margin-top:12px;flex-wrap:wrap"><div style="flex:1;min-width:240px"><small class="mut">Adjuntar archivo (PDF, hasta 5 MB)</small><div class="fb"><label class="btn sm" for="fa" tabindex="0" data-act="pick">${I('up')}Seleccionar archivo</label><input type="file" id="fa" accept="application/pdf"><span id="fn">${esc(a.fn)||'Ningún archivo seleccionado'}</span></div></div>${btn('tonal','plus','Agregar artículo','adda')}</div>
 ${S.d.B.arts.length?`<ul class="arts">${S.d.B.arts.map((x,i)=>`<li><span><b>${esc(x.t)}</b> – ${esc(x.r)}${x.fn?' · '+esc(x.fn):''}</span><button class="btn sm sq danger" data-act="dela" data-v="${i}" aria-label="Eliminar artículo">${I('trash')}</button></li>`).join('')}</ul>`:''}</div>`+grp('B',S.d.B.x,'d.B.x')}
function grp(k,base,path){return G[k].map((g,gi)=>{const R=base[gi];return `<div class="box"><h4>${g[0]}</h4>${R.length?R.map((r,ri)=>`<div class="gr" style="grid-template-columns:repeat(${g[1].length},minmax(0,1fr)) 40px;margin-bottom:8px;align-items:end">${g[1].map((c,ci)=>`<label class="fl">${ri?'':c}<input aria-label="${c}" ${/Fecha/.test(c)?'type="date"':/Hombres|Mujeres/.test(c)?'type="number" min="0"':''} placeholder="${c}" data-b="${path}.${gi}.${ri}.${ci}" value="${esc(r[ci])}"></label>`).join('')}<button class="btn sm sq danger" style="min-height:40px" data-act="delr" data-v="${k}.${gi}.${ri}" aria-label="Eliminar registro" title="Eliminar registro">${I('trash')}</button></div>`).join(''):'<p class="mut" style="margin:0 0 8px">Sin registros.</p>'}${btn('tonal sm mini','plus','Agregar','addr',k+'.'+gi)}</div>`}).join('')}
const secG=k=>grp(k,S.d[k],'d.'+k);
/* ---------- Revisión / Vista previa ---------- */
function summ(k,s){if(s.sec[k]==='noact')return'<p class="mut">Sin actividad que reportar.</p>';
 if(k==='A')return s.courses.map(x=>`<div class="rw"><b>• ${esc(x.n)} (${esc(x.g)})</b><span>Alumnos: ${x.a}</span><span>Reprobación: <b class="${x.r>=30?'rd':''}">${x.r}%</b></span><span>Justificación: ${x.r>=30?'“'+esc(x.j||'Sin justificar')+'”':'<span class="gt">No requerida</span>'}</span></div>`).join('')+`<div class="rw"><span>Sinodal: <b>${s.sin.map(x=>SIN[x]).join(', ')||'—'}</b></span><span>Especificar: <b>${esc(s.esp)||'—'}</b></span></div>`;
 const gs=(k,b)=>G[k].map((g,gi)=>b[gi].filter(r=>r.some(c=>String(c||'').trim())).map(r=>`<div class="rw"><b>${g[0]}</b>${g[1].map((c,ci)=>r[ci]?`<span>${c}: ${esc(/Fecha/.test(c)?fmt(r[ci]):r[ci])}</span>`:'').join('')}</div>`).join('')).join('');
 if(k==='B'){const B=s.d.B,o=B.projs.map(p=>`<div class="rw"><span>Proyecto: <b>${esc(p.nombre)}</b></span><span>Clave: ${esc(p.clave)||'—'}</span><span>Vigencia: ${fmt(p.v1)||'—'} al ${fmt(p.v2)||'—'}</span><span>Colaboradores: ${esc(p.col)||'—'}</span></div>`).join('')+B.arts.map(x=>`<div class="att">${I('doc')}<span><small class="mut">Artículo adjunto</small><br><b>${esc(x.t)}${x.fn?' (PDF)':''}</b><br><small class="mut">DOI: ${esc(x.doi)||'—'} · ${esc(x.r)}</small></span></div>`).join(' ')+gs('B',B.x);return o||'<p class="mut">Pendiente de captura.</p>'}
 return gs(k,s.d[k])||'<p class="mut">Pendiente de captura.</p>'}
function review(){const P=JP(),t=P[RV.i];if(!t){return go('dj')}const s=t.live?S:SAMPLE,full=t.live?person():t.n;
 $('#review').innerHTML=`<button class="crumb" data-act="back2">${I('back')}Volver a pendientes</button><div class="hd"><div><h1>Revisión de informe</h1><p>Docente ${esc(full)} · Periodo ${t.p}</p></div><div class="acts"><span class="pill revision">${I('clock')}En revisión</span></div></div>
 <div class="rv"><aside class="xc" aria-label="Índice"><h3 class="cap">Índice</h3>${SEC.map(([k,n])=>`<button class="xi ${RV.k===k?'on':''}" data-act="rk" data-v="${k}" ${RV.k===k?'aria-current="true"':''}>${I('okc','c1')}<span class="t"><b>${n.replace('Formación de Recursos Humanos','Formación RH').replace('Difusión de la Cultura','Difusión')}</b></span></button>`).join('')}</aside>
 <div><div class="xc"><h3 class="cap">Contenido</h3><div class="box"><h4 style="color:var(--pon)">${I(SEC.find(x=>x[0]===RV.k)[3])}${SEC.find(x=>x[0]===RV.k)[1]}</h4><div style="margin-top:8px">${RV.k==='A'?`<small class="mut">Cursos impartidos (${s.courses.length} registrados)</small>`:''}${summ(RV.k,s)}</div></div>
 <div class="rvb">${btn('primary','okc','Aprobar','apr')}${btn('warnb','alc','Devolver con observaciones','corr')}${btn('','dl','Exportar','exp',t.p)}${btn('','pen','Ver adjuntos','adj')}</div></div>
 <div class="obx"><h4>Observaciones</h4><label class="fl">Escribe tus observaciones<textarea id="ro" rows="2" placeholder="Escribe tus observaciones aquí..."></textarea></label>${btn('primary','send','Confirmar devolución','sobs')}<div style="clear:both"></div></div></div></div>`}
function preview(){const s=PV?SAMPLE:S,per=PV||'2026-2027 A';
 $('#preview').innerHTML=`<div class="pbar">${btn('','chl','Volver','back')}${btn('primary','print','Exportar / Imprimir','print')}</div><div class="pv"><h1>INFORME INDIVIDUAL DE ACTIVIDADES</h1><p style="text-align:center">Semestre ${per} · Campus Tehuantepec</p><div class="g2" style="margin-top:12px"><p><b>Docente:</b> ${esc(person())}</p><p><b>Número de empleado:</b> ${esc(U.k)}</p><p><b>Carrera:</b> Ing. en Computación</p><p><b>Fecha de elaboración:</b> ${today()}</p></div>${SEC.map(([k,n,t])=>`<h3>${k}. ${t}</h3>${summ(k,s)}`).join('')}<div class="sig"><div>Elaboró<br><small>Docente investigador</small></div><div>Revisó<br><small>Jefe de Carrera de Ingeniería en Computación</small></div></div></div>`}
/* ---------- Modales ---------- */
function sendModal(){const items=[['Datos generales','done','Completos'],...SEC.map(([k,n])=>[n,st(k),lab(k)])],bad=SEC.find(([k])=>['pend','warn'].includes(st(k)));
 $('#msb').innerHTML=`<h3>Confirmar envío a revisión</h3><p>Estás a punto de enviar tu informe del periodo <b class="gt">2026-2027 A</b>. Una vez enviado, no podrás editar hasta que Jefatura lo revise o solicite correcciones.</p>
 <div class="cl2"><div class="head"><b>Verifica que todos los datos estén completos</b></div>${items.map(([n,s,l])=>{const o=s==='done'||s==='noact';return`<div>${I(o?'okc':'alt',o?'ok':'no')}<b>${n}</b><em class="${o?'ok':'no'}">– ${o?l:'Pendiente (requerido)'}</em></div>`}).join('')}</div>
 ${bad?`<div class="nb">${I('alt')}<span><b>No se puede enviar:</b> La sección de ${bad[1]} está pendiente. Completa o marca como 'Sin actividad'.</span></div>`:''}
 <div class="ac"><button class="btn" data-act="cm">Cancelar</button>${bad?btn('primary','','Ir a sección pendiente','goP',bad[0]):btn('primary','send','Confirmar envío','confS')}</div>`;openM('ms')}
function delModal(){$('#msb').innerHTML=`<h3>Eliminar borrador</h3><p>Se eliminará el borrador del informe 2026-2027 A. Esta acción no se puede deshacer.</p><div class="ac"><button class="btn" data-act="cm">Cancelar</button>${btn('danger','trash','Eliminar borrador','confD')}</div>`;openM('ms')}
/* ---------- Acciones ---------- */
function finish(k,t){S.mod=now();toast(t);editor();api.onChange()}
const A={
 cm:closeM,
 role(v){role=v;go(role==='jefe'?'dj':'dp');toast('Vista cambiada a '+(role==='jefe'?'Jefatura.':'Docente.'))},
 nuevo(){if(S.del){S=blank();S.cur='A';go('editor');toast('Informe nuevo creado.');return}toast('Ya tienes un borrador activo para 2026-2027 A.');S.cur='A';go('editor')},
 todos(){$('#tbl').scrollIntoView({behavior:'smooth',block:'start'})},
 edit(){S.cur='A';go('editor')},edit2(){toast('Periodo cerrado: solo se puede editar el informe del periodo activo (2026-2027 A).')},
 del(){delModal()},confD(){closeM();S.del=true;dp();toast('Borrador eliminado.')},
 view(p){PF='dp';PV=p==='2026-2027 A'?null:p;go('preview')},prev(){PV=null;PF='editor';go('preview')},
 exp(p){PF=screen;PV=p==='2026-2027 A'?null:p;go('preview');setTimeout(()=>{try{window.print()}catch(e){toast('Use Ctrl+P para exportar a PDF.')}},300)},print(){try{window.print()}catch(e){toast('Use Ctrl+P para exportar a PDF.')}},
 back(){go(screen==='preview'&&PF==='editor'?'editor':role==='jefe'?'dj':'dp')},
 cur(k){S.cur=k;editor()},saveR(){S.mod=now();toast('Borrador guardado.');editor()},
 addc(){S.courses.push({n:'Nuevo curso',g:'000-A',a:0,r:0,j:''});sec();toast('Curso agregado.')},
 delc(i){S.courses.splice(+i,1);sec();toast('Curso eliminado.')},
 just(i){JI=+i;const c=S.courses[JI];$('#jm').textContent=c.n;$('#jp').textContent=c.r+'%';$('#jt').value=c.j;$('#je').classList.add('hidden');openM('mj')},
 saveJ(){const v=$('#jt').value.trim();if(v.length<10){$('#je').textContent='La justificación es obligatoria (mínimo 10 caracteres).';$('#je').classList.remove('hidden');return}S.courses[JI].j=v;closeM();if(S.cur==='A'){$('#rc'+JI).innerHTML=repCell(JI)}toast('Justificación guardada correctamente.');S.mod=now()},
 adda(){const a=S.d.B.a;if(!(a.t||'').trim()||!(a.r||'').trim()||!(a.au||'').trim()){toast('Completa título, revista y autores del artículo.');return}if(!a.pub){toast('Solo se registran artículos publicados en el periodo: marque "Publicado".');return}S.d.B.arts.push({...a});S.d.B.a={};sec();toast('Artículo agregado.')},
 addp(){const p=S.d.B.p;if(!(p.nombre||'').trim()){toast('Escribe el nombre del proyecto.');return}S.d.B.projs.push({...p});S.d.B.p={};sec();toast('Proyecto agregado.')},
 delp(i){S.d.B.projs.splice(+i,1);sec()},
 addr(v){const[k,g]=v.split('.'),b=k==='B'?S.d.B.x:S.d[k];b[g].push(G[k][g][1].map(()=>''));sec()},
 delr(v){const[k,g,r]=v.split('.'),b=k==='B'?S.d.B.x:S.d[k];b[g].splice(+r,1);sec()},
 dela(i){S.d.B.arts.splice(+i,1);sec()},
 ss(){const k=S.cur;if(k==='A'){const b=aBad();if(S.courses.some(c=>!c.n.trim()||c.r<0||c.r>100)){toast('Revisa los nombres de curso y que el porcentaje esté entre 0 y 100.');return}if(b>-1){toast('Justifica el porcentaje de reprobación (≥ 30%).');A.just(b);return}S.sec.A='done';return finish(k,'Sección Docencia guardada.')}
  if(k==='B'&&(S.d.B.p.nombre||'').trim()){toast('Agrega el proyecto con "Agregar proyecto" antes de guardar.');return}
  if(k==='B'&&(S.d.B.a.t||'').trim()){toast('Agrega el artículo con "Agregar artículo" antes de guardar.');return}
  if(!has(k)){toast('Capture información o marque la sección como "Sin actividad".');return}S.sec[k]='done';finish(k,'Sección guardada.')},
 na(){const k=S.cur;S.sec[k]='noact';finish(k,'Sección marcada como "Sin actividad que reportar".')},
 accObs(){S.obs=[];toast('Observaciones aceptadas.');editor()},
 send(){sendModal()},goP(k){closeM();S.cur=k==='A'&&aBad()<0?'B':k;editor();toast('Completa la sección o márcala como "Sin actividad".')},
 confS(){closeM();S.st='revision';S.sent=today();S.mod=now();JR=JR.filter(r=>!r.live);toast('Informe enviado a revisión.');go('dp')},
 rev(i){RV={i:+i,k:'A'};go('review')},vrev(n){toast('Informe de '+n+' ya revisado.')},back2(){go('dj')},rk(k){RV.k=k;review()},adj(){const n=S.d.B.arts.filter(x=>x.fn).map(x=>x.fn);toast(n.length?'Adjuntos: '+n.join(', '):'Este informe no tiene archivos adjuntos.')},
 apr(){const t=JP()[RV.i];if(t.live){S.st='aprobado';S.apr=today();S.obs=[];JR.unshift({n:t.n,i:t.i,st:'aprobado',d:today(),live:1})}else{JPo.splice(RV.i-(S.st==='revision'&&!S.del?1:0),1);JR.unshift({n:t.n,i:t.i,st:'aprobado',d:today()})}toast('Informe aprobado. Queda bloqueado para edición.');go('dj')},
 corr(){const v=$('#ro').value.trim();if(!v){$('#ro').focus();toast('Escribe las observaciones para solicitar correcciones.');return}A.sobs()},
 sobs(){const v=$('#ro').value.trim();if(!v){$('#ro').focus();toast('Escribe las observaciones para solicitar correcciones.');return}const t=JP()[RV.i];if(t.live){S.st='obs';S.obs=v.split('\n').filter(Boolean);JR.unshift({n:t.n,i:t.i,st:'obs',d:today(),live:1})}else{JPo.splice(RV.i-(S.st==='revision'&&!S.del?1:0),1);JR.unshift({n:t.n,i:t.i,st:'obs',d:today()})}toast('Observaciones enviadas al profesor.');go('dj')}};
const SKEL=`<div id="dp" class="screen"></div><div id="dj" class="screen"></div><div id="editor" class="screen"></div><div id="review" class="screen"></div><div id="preview" class="screen"></div>
<div class="mb hidden" id="mb">
 <div class="md hidden" id="mj" role="dialog" aria-modal="true" aria-labelledby="mjt"><button class="x" data-act="cm" aria-label="Cerrar">${I('x')}</button>
  <h3 id="mjt">Justificar porcentaje de reprobación</h3>
  <div class="jb"><span>${I('chart')}</span><div>Materia: <b id="jm"></b><br>Porcentaje: <b class="rd" id="jp"></b> (≥ 30%: justificación obligatoria)</div></div>
  <label class="fl">Motivo de la reprobación<textarea id="jt" placeholder="Describa el motivo de la reprobación..."></textarea></label><p class="err hidden" id="je" role="alert"></p>
  <div class="inf">${I('info')}<span>Si el porcentaje es menor a 30%, la justificación no es necesaria y se muestra el mensaje "No requiere justificación (&lt; 30%)".</span></div>
  <div class="ac"><button class="btn" data-act="cm">Cancelar</button><button class="btn primary" data-act="saveJ">${I('save')}Guardar justificación</button></div></div>
 <div class="md hidden" id="ms" role="dialog" aria-modal="true"><button class="x" data-act="cm" aria-label="Cerrar">${I('x')}</button><div id="msb"></div></div>
</div><div id="toast" role="status" aria-live="polite"></div>`;
function mount(el,css){host=el;root=el.attachShadow({mode:'open'});root.innerHTML=`<style>${css}.screen{display:none}.screen.active{display:block}</style>${SKEL}`;
 if(roleKey!==U.k){roleKey=U.k;role=U.k==='118'?'jefe':'prof';screen=role==='jefe'?'dj':'dp'}
 root.addEventListener('click',e=>{const t=e.target.closest('[data-act]');if(t&&!t.disabled)A[t.dataset.act]?.(t.dataset.v,t)});
 root.addEventListener('keydown',e=>{if(e.key==='Escape'&&!$('#mb').classList.contains('hidden'))closeM();if(e.key==='Enter'&&e.target.dataset?.act==='pick')$('#fa').click()});
 $('#mb').addEventListener('click',e=>{if(e.target.id==='mb')closeM()});
 if(role==='jefe'&&['dp','editor','preview'].includes(screen))screen='dj';if(role==='prof'&&['dj','review'].includes(screen))screen='dp';
 go(screen)}
const items=()=>role==='jefe'?[['layout-dashboard','Panel de control','dj'],['clipboard-check','Revisión de informes','review']]:[['layout-dashboard','Panel de control','dp'],['pencil','Mi informe','editor']];
function navGo(k){if(!root)return;if(k==='review'&&!JP().length){toast('No hay informes pendientes de revisión.');return}if(k==='review')RV={i:Math.min(RV.i,JP().length-1),k:'A'};if(k==='preview'){PV=null;PF='editor'}go(k)}
return{mount,reset,items,navGo,active:()=>screen,set onChange(f){api.onChange=f}}})();