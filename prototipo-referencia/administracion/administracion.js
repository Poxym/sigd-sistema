/* ===== Módulo Administración dentro del SIGD ===== */
const NX=(()=>{let host=null,root=null,box=null,fn=null,cb=()=>{};
const VIEWS=['inicio','solicitudes','catalogos','usuarios','periodos','bitacora'];
function build(){
 host=document.createElement('div');host.id='nxhost';root=host.attachShadow({mode:'open'});
 root.innerHTML='<style>'+ICONS+NXCSS+'</style><div class="nxb">'+NXHTML+'</div>';box=root.querySelector('.nxb');
 const doc=new Proxy(document,{get(t,k){
  if(k==='getElementById')return id=>root.getElementById(id);
  if(k==='querySelector')return s=>root.querySelector(s);
  if(k==='querySelectorAll')return s=>root.querySelectorAll(s);
  if(k==='body')return box;if(k==='documentElement')return host;if(k==='activeElement')return root.activeElement||document.activeElement;
  if(k==='addEventListener')return (ty,f,o)=>document.addEventListener(ty,e=>{if(host.isConnected)f(e)},o);
  const v=t[k];return typeof v==='function'?v.bind(t):v}});
 fn=new Function('document',NXJS+'\n;return {navigate,getView:()=>view};');
 try{api=fn(doc)}catch(e){console.error('NX',e)}
}
let api=null;
function mount(el){if(!host)build();el.appendChild(host);if(api)api.navigate(cur_view);cb()}
let cur_view='inicio';
function go(v){cur_view=v;if(api)api.navigate(v);window.scrollTo(0,0);cb()}
return{mount,go,views:VIEWS,active:()=>cur_view,set onChange(f){cb=f}}})();