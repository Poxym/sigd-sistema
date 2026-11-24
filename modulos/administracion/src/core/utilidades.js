/* Utilidades puras del módulo Administración: no tocan el DOM ni la base de datos. */
export const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export const includes=(a,b)=>String(a??'').toLowerCase().includes(String(b).trim().toLowerCase());
export const fmt=v=>new Date(v).toLocaleString('es-MX',{dateStyle:'medium',timeStyle:'short'});
export const idOf=arr=>Math.max(0,...arr.map(x=>Number(x.id)||0))+1;
export const stateTag=(s='')=>`<span class="status ${['Vigente','Activo','Abierto','aplicada','autorizada'].includes(s)?'good':['Histórico','Cerrado','rechazada','Inactivo'].includes(s)?'neutral':'warn'}">${esc(s[0]?.toUpperCase()+s.slice(1))}</span>`;

/* Fechas */
export function hoyLocal(){const now=new Date();return [now.getFullYear(),String(now.getMonth()+1).padStart(2,'0'),String(now.getDate()).padStart(2,'0')].join('-')}
export function esFechaValida(s){return /^\d{4}-\d{2}-\d{2}$/.test(String(s||''))&&!Number.isNaN(new Date(s+'T12:00:00').getTime())}
export function fechaLegible(s){if(!esFechaValida(s))return s||'Sin fecha';return new Date(s+'T12:00:00').toLocaleDateString('es-MX',{day:'2-digit',month:'short',year:'numeric'})}
export function fechaDMA(value){if(!value)return 'Sin fecha';const [y,m,d]=String(value).split('-');return y&&m&&d?`${d}/${m}/${y}`:String(value)}
