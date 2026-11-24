/* Anfitrión del módulo: crea su Shadow DOM, le inyecta estilos y HTML, y expone NX.mount / NX.go / NX.active. */
import { nxApp } from './app.js';
import cssIconos from '../../../css/iconos.css?raw';
import cssAdmin from '../../styles/admin.css?raw';
// Estilos de cada pantalla (antes dentro de admin.css): van justo después de admin.css, en este orden.
import cssInicio from './inicio/estilos.css?raw';
import cssSolicitudes from './solicitudes/estilos.css?raw';
import cssCatalogosPantalla from './catalogos/estilos.css?raw';
import cssUsuarios from './usuarios/estilos.css?raw';
import cssPeriodos from './periodos/estilos.css?raw';
import cssBitacora from './bitacora/estilos.css?raw';
import cssAlineacion from '../../styles/alineacion.css?raw';
import cssCatalogos from '../../styles/catalogos.css?raw';
import cssM3 from '../../styles/m3.css?raw';
import vistaBase from '../../vista/admin.html?raw';
import vistaBitacora from './bitacora/vista.html?raw';
import vistaPeriodos from './periodos/vista.html?raw';
import vistaInicio from './inicio/vista.html?raw';
import vistaSolicitudes from './solicitudes/vista.html?raw';
import vistaCatalogos from './catalogos/vista.html?raw';
import vistaUsuarios from './usuarios/vista.html?raw';

/* Cada submódulo aporta su propia sección HTML; aquí se ensambla la vista completa. */
const vistaAdmin = vistaBase.replace('<!--@bitacora-->', vistaBitacora).replace('<!--@periodos-->', vistaPeriodos).replace('<!--@inicio-->', vistaInicio).replace('<!--@solicitudes-->', vistaSolicitudes).replace('<!--@catalogos-->', vistaCatalogos).replace('<!--@usuarios-->', vistaUsuarios);

export const NX = (() => {
// Hoja de íconos compartida del marco (la misma que carga index.html): ver css/iconos.css.
const ICONS = cssIconos;
let host = null, root = null, box = null, api = null, cb = () => {}, cur_view = 'inicio';
const VIEWS = ['inicio', 'solicitudes', 'catalogos', 'usuarios', 'periodos', 'bitacora'];
function build() {
  host = document.createElement('div'); host.id = 'nxhost'; root = host.attachShadow({ mode: 'open' });
  root.innerHTML = '<style>' + ICONS + cssAdmin + cssInicio + cssSolicitudes + cssCatalogosPantalla + cssUsuarios + cssPeriodos + cssBitacora + cssAlineacion + cssCatalogos + cssM3 + '</style><div class="nxb" id="nxroot">' + vistaAdmin + '</div>'; box = root.querySelector('.nxb');
  const doc = new Proxy(document, { get(t, k) {
    if (k === 'getElementById') return id => root.getElementById(id);
    if (k === 'querySelector') return s => root.querySelector(s);
    if (k === 'querySelectorAll') return s => root.querySelectorAll(s);
    if (k === 'body') return box; if (k === 'documentElement') return host; if (k === 'activeElement') return root.activeElement || document.activeElement;
    if (k === 'addEventListener') return (ty, f, o) => document.addEventListener(ty, e => { if (host.isConnected) f(e); }, o);
    const v = t[k]; return typeof v === 'function' ? v.bind(t) : v; } });
  try { api = nxApp(doc); } catch (e) { console.error('NX', e); }
}
function mount(el) { if (!host) build(); el.appendChild(host); if (api) api.navigate(cur_view); cb(); }
function go(v) { cur_view = v; if (api) api.navigate(v); window.scrollTo(0, 0); cb(); }
return { mount, go, views: VIEWS, active: () => cur_view, set onChange(f) { cb = f; } };
})();

