/* Usuarios · VISTA DEL PANEL «Permisos por rol» (ADR-006, MVC; antes usuarios/permisos.js). Está dentro de la pantalla
   de Usuarios, en un bloque plegable. Solo pinta y avisa de los eventos; nunca toca la base ni el repositorio. Qué
   permisos tiene cada rol y el cambio de una casilla los resuelve el modelo; el rol elegido lo recuerda el controlador.
   El HTML que genera es el mismo de antes. */
export function crearVistaPermisos({ $, esc, labelRoles, capabilities }) {
  /* Pinta el panel con el rol elegido (o «Docente»). «alCambiarRol(rol)» se llama al elegir otro rol.
     Devuelve false si el panel no está en la página. */
  function pintarPanel(rolElegido, alCambiarRol){
   const el=$('permissionPanel');if(!el)return false;
   el.innerHTML=`<div class="surface-head"><div><h3>Permisos por rol</h3><small>Reglas de acceso para los módulos institucionales</small></div><span class="status neutral">Configuración</span></div><div class="permission-editor"><div class="form-field"><label for="permissionRole">Seleccionar rol</label><select id="permissionRole">${labelRoles.map(r=>`<option>${esc(r)}</option>`).join('')}</select></div><div id="permissionCheckboxes" class="permission-options"></div></div><p class="hint" style="margin-top:12px">Los permisos asignados determinan las funciones disponibles para cada rol.</p>`;
   const dropdown=$('permissionRole');dropdown.value=rolElegido||'Docente';
   dropdown.onchange=()=>alCambiarRol(dropdown.value);
   return true;
  }

  /* El rol que muestra el selector (undefined si no hay panel). */
  const rolActual = () => $('permissionRole')?.value;

  /* Pinta una casilla por permiso, marcadas las de «perms». «alMarcar(permiso, marcada)» se llama al cambiar una. */
  function pintarCasillas(perms, alMarcar){
   $('permissionCheckboxes').innerHTML=capabilities.map((p,i)=>`<label class="permission-check"><input type="checkbox" data-cap="${i}" ${perms.includes(p)?'checked':''}><span>${p}</span></label>`).join('');
   $('permissionCheckboxes').querySelectorAll('input').forEach(c=>c.onchange=()=>alMarcar(capabilities[Number(c.dataset.cap)],c.checked));
  }

  return { pintarPanel, rolActual, pintarCasillas };
}
