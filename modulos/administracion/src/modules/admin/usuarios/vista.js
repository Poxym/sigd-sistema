/* Usuarios y permisos · VISTA (ADR-006, MVC) · lista y tarjetas por rol.
   Solo pinta lo que recibe y avisa de los eventos; nunca toca la base ni el repositorio.
   El HTML que genera es el mismo de antes (movido sin cambios desde usuarios/index.js).
   No usa el document global: `document` llega por env y es el del Shadow DOM del módulo. */
export function crearVistaUsuarios({ $, esc, stateTag, empty, document }) {
  /* Lo escrito en la búsqueda y lo elegido en los filtros de rol y estado. */
  const leerFiltros = () => ({ q: $('userSearch').value, r: $('userRole').value, s: $('userStatus').value });

  /* c = cuentas activas por grupo ({docentes, jefaturas, autoridades, administrador}). */
  function pintarTarjetas(c) {
   const groups=[
    {label:'Docentes',icon:'ti-chalkboard',tone:'blue',value:c.docentes,note:'Activos'},
    {label:'Jefaturas',icon:'ti-user-star',tone:'green',value:c.jefaturas,note:'De carrera'},
    {label:'Autoridades',icon:'ti-building-bank',tone:'purple',value:c.autoridades,note:'Rectoría, Vicerrectoría y secretarías'},
    {label:'Administrador',icon:'ti-user-cog',tone:'orange',value:c.administrador,note:'General'}
   ];
   $('userRoleStats').innerHTML=groups.map(g=>`<div class="user-stat user-stat-${g.tone}"><div class="user-stat-symbol"><i class="ti ${g.icon}" aria-hidden="true"></i></div><div class="user-stat-content"><span class="user-stat-label">${g.label}</span><strong class="user-stat-value">${g.value.toLocaleString('es-MX')}</strong><span class="user-stat-caption">${g.note}</span></div></div>`).join('');
  }

  /* Pinta las filas. «alEditar(id)» se llama con el botón del lápiz de cada fila. */
  function pintarLista(list, alEditar) {
   $('userRows').innerHTML=list.map(u=>`<tr><td><span class="cell-strong">${esc(u.name)}</span><span class="cell-sub">${esc(u.mail)}</span></td><td>${esc(u.num)}</td><td>${esc(u.role)}</td><td>${esc(u.area)}</td><td>${stateTag(u.status)}</td><td><div class="row-buttons"><button class="btn icon-only" data-user="${u.id}" title="Editar usuario" aria-label="Editar ${esc(u.name)}"><i class="ti ti-pencil"></i></button></div></td></tr>`).join('')||empty('Prueba otra búsqueda');document.querySelectorAll('[data-user]').forEach(b=>b.onclick=()=>alEditar(+b.dataset.user));
  }

  /* «alFiltrar()» se llama al escribir en la búsqueda o cambiar un filtro. */
  function alFiltrar(fn) { ['userSearch','userStatus','userRole'].forEach(id=>$(id).addEventListener(id==='userSearch'?'input':'change',fn)); }

  /* Agrega los roles al filtro de rol (después de «Todos»). */
  function agregarRoles(roles) { $('userRole').innerHTML+=[...roles].map(x=>`<option>${esc(x)}</option>`).join(''); }

  /* Botón «Importar» y selector de archivo. «alImportar(archivo)» se llama al elegir uno; al terminar se vacía el
     selector. El selector se guarda en «input» antes del await: el evento ocurre dentro del Shadow DOM y, al
     terminar de repartirlo, el navegador deja e.target en null (antes el finally fallaba y no lo vaciaba). */
  function alImportar(fn) {
   $('importUsers').onclick=()=>$('importUsersFile').click();
   $('importUsersFile').addEventListener('change',async e=>{
    const input=e.target,file=input.files?.[0];if(!file)return;
    try{await fn(file)}finally{input.value=''}
   });
  }

  return { leerFiltros, pintarTarjetas, pintarLista, alFiltrar, agregarRoles, alImportar };
}
