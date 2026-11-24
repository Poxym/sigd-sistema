import { NX } from '../modules/admin/host.js';

/* Marco del SIGD (acceso, encabezado, menú lateral) acotado al módulo Administración (NEXORA). */

const PASS='Unistmo#2026';
const MOD={admin:{n:'Administración',d:'Catálogos, usuarios y periodos',ic:'building-bank',c:'#285C76'}};
/* Cuentas de demostración del módulo (mismas que el SIGD). */
const USERS={'001':{m:'administracion@unistmo.example',n:'Carlos Mendoza',r:'Administrador general',mods:['admin']},
 '000':{m:'coordinacion.sigd@unistmo.example',n:'Coordinación SIGD',r:'Todos los módulos',mods:['admin']}};
const NAVS={admin:[['layout-dashboard','Inicio','inicio'],['git-pull-request','Solicitudes de cambio','solicitudes'],['folders','Catálogos académicos','catalogos'],['users','Usuarios y permisos','usuarios'],['calendar-cog','Periodos de captura','periodos'],['clipboard-list','Bitácora','bitacora']]};
const $=id=>document.getElementById(id);let U=null,cur=null;
function show(w){$('login').hidden=w!=='login';$('app').hidden=w!=='app';document.documentElement.dataset.mod='';document.body.removeAttribute('data-mod');if(w!=='app')$('scrim').hidden=true}
$('eye').onclick=()=>{const t=$('pw').type==='password';$('pw').type=t?'text':'password';$('eye').firstElementChild.className='ti '+(t?'ti-eye-off':'ti-eye');$('eye').setAttribute('aria-pressed',String(t));$('eye').setAttribute('aria-label',t?'Ocultar contraseña':'Mostrar contraseña');$('eye').title=t?'Ocultar contraseña':'Mostrar contraseña'};
$('hb').onclick=()=>{const o=$('hx').hidden;$('hx').hidden=!o;$('hb').setAttribute('aria-expanded',String(o))};
$('lf').onsubmit=e=>{e.preventDefault();$('err').hidden=true;const v=$('u').value.trim().toLowerCase(),p=$('pw').value;
 $('ue').hidden=!!v;$('ue').textContent='Escribe tu número de empleado o correo institucional.';$('pe').hidden=!!p;$('pe').textContent='Escribe tu contraseña.';
 $('u').classList.toggle('bad',!v);$('pw').classList.toggle('bad',!p);if(!v){$('u').focus();return}if(!p){$('pw').focus();return}
 const k=Object.keys(USERS).find(k=>k===v||USERS[k].m===v);
 if(!k||p!==PASS){$('err').hidden=false;$('pw').value='';return}
 U=Object.assign({k},USERS[k]);$('lf').reset();open('admin');
 /* Aviso para los módulos: hubo un inicio de sesión correcto. Cada módulo decide si lo escucha (Administración cuenta los accesos). */
 document.dispatchEvent(new CustomEvent('sigd:sesion-iniciada',{detail:{cuenta:k}}))};
function out(){U=null;cur=null;show('login');$('u').focus()}$('out').onclick=out;
function open(m){cur=m;show('app');$('app').dataset.mod=m;$('app').classList.remove('open');$('scrim').hidden=true;
 $('hU').textContent=U.n;$('hR').textContent=U.r;
 $('mods').classList.add('one');$('mods').innerHTML=`<span class="mi" role="status" aria-label="Módulo actual: ${MOD[m].n}"><i class="ti ti-${MOD[m].ic}"></i><span class="mt"><b>${MOD[m].n}</b></span></span>`;
 render();window.scrollTo(0,0)}
const navItems=()=>NAVS[cur];
const isActive=x=>NX.active()===x[2];
function nav(){$('ni').innerHTML=navItems().map((x,i)=>`<button class="ni" data-v="${i}" ${isActive(x)?'aria-current="page"':''} aria-label="${x[1]}"><i class="ti ti-${x[0]}"></i><span>${x[1]}</span>${x[3]?`<em class="bdg" aria-label="${x[3]} sin leer">${x[3]}</em>`:''}</button>`).join('')}
$('ni').onclick=e=>{const b=e.target.closest('[data-v]');if(!b)return;NX.go(navItems()[+b.dataset.v][2]);nav();closeNav()};
$('menu').onclick=()=>{$('app').classList.add('open');$('scrim').hidden=false};
(()=>{const app=$('app'),tg=$('tg'),ic=tg.querySelector('.ti'),sp=tg.querySelector('span'),mq=matchMedia('(max-width:920px)'),K='sigd.menu.col';let pref=false;try{pref=localStorage.getItem(K)==='1'}catch(e){}
const paint=()=>{const c=app.classList.contains('col'),t=c?'Mostrar menú':'Ocultar menú';tg.setAttribute('aria-label',t);tg.setAttribute('aria-expanded',String(!c));sp.textContent=t;ic.className='ti ti-layout-sidebar-left-'+(c?'expand':'collapse')};
const sync=()=>{app.classList.toggle('col',pref&&!mq.matches);paint()};
tg.onclick=()=>{pref=!app.classList.contains('col');try{localStorage.setItem(K,pref?'1':'0')}catch(e){}sync()};
mq.addEventListener('change',sync);sync()})();
function render(){$('mn').innerHTML='';NX.mount($('mn'));nav()}

/* Cerrar el menú móvil al tocar fuera o con Escape */
const closeNav=()=>{$('app').classList.remove('open');$('scrim').hidden=true};$('scrim').onclick=closeNav;document.addEventListener('keydown',e=>{if(e.key==='Escape'&&$('app').classList.contains('open'))closeNav()});

NX.onChange=()=>{if(cur==='admin')nav()};
show('login');
(function(){var h=document.querySelector('header.top');if(!h)return;var f=function(){h.classList.toggle('sc',(window.scrollY||document.documentElement.scrollTop)>2)};window.addEventListener('scroll',f,{passive:true});f()})();
