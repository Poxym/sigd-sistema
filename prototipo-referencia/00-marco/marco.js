const ICONS=document.getElementById("icons").textContent;
const LOGO="assets/escudo-unistmo.png";const PASS='Unistmo#2026';
const MOD={
 admin:{n:'Administración',d:'Catálogos, usuarios y periodos',ic:'building-bank',c:'#285C76'},
 plan:{n:'Plan de Trabajo',d:'Captura y envío del plan del periodo',ic:'checklist',c:'#285C76'},
 informe:{n:'Informe de Actividades',d:'Actividades realizadas y evidencias',ic:'file-description',c:'#285C76'},
 reportes:{n:'Reportes',d:'Consulta e indicadores institucionales',ic:'chart-bar',c:'#285C76'}};
const USERS={'209':{m:'ana.ramirez@unistmo.example',n:'Ana Ramírez',r:'Docente',mods:['plan','informe']},
 '118':{m:'luis.lopez@unistmo.example',n:'Luis López',r:'Jefe de carrera',mods:['plan','informe','reportes']},
 '100':{m:'vicerrectoria@unistmo.example',n:'Vicerrectoría',r:'Vicerrectoría Académica',mods:['reportes']},
 '001':{m:'administracion@unistmo.example',n:'Administración institucional',r:'Administrador general',mods:['admin']},
 '000':{m:'coordinacion.sigd@unistmo.example',n:'Coordinación SIGD',r:'Todos los módulos',mods:['admin','plan','informe','reportes']}};
const NAVS={admin:[['layout-dashboard','Inicio','inicio'],['git-pull-request','Solicitudes de cambio','solicitudes'],['folders','Catálogos académicos','catalogos'],['users','Usuarios y permisos','usuarios'],['calendar-cog','Periodos de captura','periodos'],['clipboard-list','Bitácora','bitacora']],
 plan:[],
 informe:[['home','Mi informe'],['list-check','Actividades'],['file-check','Evidencias'],['history','Historial']],
 reportes:[]};
const $=id=>document.getElementById(id);let U=null,cur=null,view=0;
const E=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
function show(w){$('login').hidden=w!=='login';$('picker').hidden=w!=='picker';$('app').hidden=w!=='app';document.documentElement.dataset.mod='';document.body.removeAttribute('data-mod');if(w!=='app')$('scrim').hidden=true}
$('eye').onclick=()=>{const t=$('pw').type==='password';$('pw').type=t?'text':'password';$('eye').firstElementChild.className='ti '+(t?'ti-eye-off':'ti-eye');$('eye').setAttribute('aria-pressed',String(t));$('eye').setAttribute('aria-label',t?'Ocultar contraseña':'Mostrar contraseña');$('eye').title=t?'Ocultar contraseña':'Mostrar contraseña'};
$('hb').onclick=()=>{const o=$('hx').hidden;$('hx').hidden=!o;$('hb').setAttribute('aria-expanded',String(o))};
$('lf').onsubmit=e=>{e.preventDefault();$('err').hidden=true;const v=$('u').value.trim().toLowerCase(),p=$('pw').value;
 $('ue').hidden=!!v;$('ue').textContent='Escribe tu número de empleado o correo institucional.';$('pe').hidden=!!p;$('pe').textContent='Escribe tu contraseña.';
 $('u').classList.toggle('bad',!v);$('pw').classList.toggle('bad',!p);if(!v){$('u').focus();return}if(!p){$('pw').focus();return}
 const k=Object.keys(USERS).find(k=>k===v||USERS[k].m===v);
 if(!k||p!==PASS){$('err').hidden=false;$('pw').value='';return}
 U=Object.assign({k},USERS[k]);$('lf').reset();if(U.mods.length===1)open(U.mods[0]);else picker()};
function picker(){show('picker');$('pkU').textContent=U.n+' · '+U.r;$('pkGrid').innerHTML=U.mods.map(m=>`<button class="pk-card" data-mod="${m}" data-go="${m}"><span class="pk-ic"><i class="ti ti-${MOD[m].ic}"></i></span><b>${MOD[m].n}</b><span class="d">${MOD[m].d}</span><span class="go">Entrar <i class="ti ti-arrow-right"></i></span></button>`).join('')}
$('pkGrid').onclick=e=>{const b=e.target.closest('[data-go]');if(b)open(b.dataset.go)};
function out(){U=null;cur=null;INF.reset();VR.reset();PT.logout();show('login');$('u').focus()}$('out').onclick=out;$('pkOut').onclick=out;
function bellPaint(){const b=$('bell');if(!b)return;const on=!!(U&&U.mods.includes('plan'));b.hidden=!on;if(!on)return;let n=0;try{n=PT.unread()||0}catch(e){}const e=$('bellN');e.hidden=!n;e.textContent=n>99?'99+':String(n);b.setAttribute('aria-label',n?'Notificaciones, '+n+' sin leer':'Notificaciones')}
function open(m){cur=m;view=0;show('app');$('app').dataset.mod=m;$('app').classList.remove('open');$('scrim').hidden=true;
 $('hU').textContent=U.n;$('hR').textContent=U.r;bellPaint();
 $('mods').classList.toggle('one',U.mods.length<2);$('mods').innerHTML=U.mods.length<2?`<span class="mi" role="status" aria-label="Módulo actual: ${MOD[m].n}"><i class="ti ti-${MOD[m].ic}"></i><span class="mt"><b>${MOD[m].n}</b></span></span>`:U.mods.map(x=>`<button data-m="${x}" ${x===m?'aria-current="true"':''} title="${MOD[x].n}" aria-label="${MOD[x].n}"><i class="ti ti-${MOD[x].ic}"></i><span class="l">${MOD[x].n}</span></button>`).join('');
 nav();render();bellPaint();window.scrollTo(0,0)}
$('bell').onclick=()=>{if(cur!=='plan')open('plan');PT.navGo('notes');nav();bellPaint()};
$('mods').onclick=e=>{const b=e.target.closest('[data-m]');if(b&&b.dataset.m!==cur)open(b.dataset.m)};
const navItems=()=>cur==='informe'?INF.items():cur==='plan'?PT.items():cur==='reportes'?VR.items():NAVS[cur];
const isActive=(x,i)=>cur==='informe'?INF.active()===x[2]:cur==='plan'?PT.active()===x[2]:cur==='reportes'?VR.active()===x[2]:cur==='admin'?NX.active()===x[2]:i===view;
function nav(){$('ni').innerHTML=navItems().map((x,i)=>`<button class="ni" data-v="${i}" ${isActive(x,i)?'aria-current="page"':''} aria-label="${x[1]}"><i class="ti ti-${x[0]}"></i><span>${x[1]}</span>${x[3]?`<em class="bdg" aria-label="${x[3]} sin leer">${x[3]}</em>`:''}</button>`).join('')}
$('ni').onclick=e=>{const b=e.target.closest('[data-v]');if(!b)return;if(cur==='informe'||cur==='admin'||cur==='plan'||cur==='reportes'){const k=navItems()[+b.dataset.v][2];if(cur==='informe')INF.navGo(k);else if(cur==='plan')PT.navGo(k);else if(cur==='reportes')VR.navGo(k);else NX.go(k);nav();$('app').classList.remove('open');$('scrim').hidden=true;return}view=+b.dataset.v;nav();render();$('app').classList.remove('open');$('scrim').hidden=true};
$('menu').onclick=()=>{$('app').classList.add('open');$('scrim').hidden=false};
(()=>{const app=$('app'),tg=$('tg'),ic=tg.querySelector('.ti'),sp=tg.querySelector('span'),mq=matchMedia('(max-width:920px)'),K='sigd.menu.col';let pref=false;try{pref=localStorage.getItem(K)==='1'}catch(e){}
const paint=()=>{const c=app.classList.contains('col'),t=c?'Mostrar menú':'Ocultar menú';tg.setAttribute('aria-label',t);tg.setAttribute('aria-expanded',String(!c));sp.textContent=t;ic.className='ti ti-layout-sidebar-left-'+(c?'expand':'collapse')};
const sync=()=>{app.classList.toggle('col',pref&&!mq.matches);paint()};
tg.onclick=()=>{pref=!app.classList.contains('col');try{localStorage.setItem(K,pref?'1':'0')}catch(e){}sync()};
mq.addEventListener('change',sync);sync()})();
const tile=(ic,v,l)=>`<div class="tile"><span class="ic"><i class="ti ti-${ic}"></i></span><div><b>${v}</b><small>${l}</small></div></div>`;
const BODY={}; /* la pantalla "Panorama" de relleno se reemplazó por el módulo VR (Vicerrectoría) */
function render(){if(cur==='admin'){$('mn').innerHTML='';NX.mount($('mn'));nav();return}
if(cur==='informe'){$('mn').innerHTML='<div id="infhost"></div>';INF.mount($('infhost'),ICONS+INFCSS);return}
if(cur==='plan'){$('mn').innerHTML='<div id="pthost"></div>';PT.mount($('pthost'),ICONS+PTCSS);nav();return}
if(cur==='reportes'){$('mn').innerHTML='<div id="vrhost"></div>';VR.mount($('vrhost'),ICONS+VRCSS);nav();return}
 $('mn').innerHTML=view===0?BODY[cur]():`<div class="hd"><div><h1>${NAVS[cur][view][1]}</h1><p>${MOD[cur].d}</p></div></div><div class="card"><p style="margin:0;color:var(--muted)">Aún no hay información para mostrar en esta sección.</p></div>`}
INF.onChange=()=>{if(cur==='informe')nav()};
PT.onChange=()=>{if(cur==='plan')nav();bellPaint()};
NX.onChange=()=>{if(cur==='admin')nav()};
show('login');

(function(){var h=document.querySelector('header.top');if(!h)return;var f=function(){h.classList.toggle('sc',(window.scrollY||document.documentElement.scrollTop)>2)};window.addEventListener('scroll',f,{passive:true});f()})();