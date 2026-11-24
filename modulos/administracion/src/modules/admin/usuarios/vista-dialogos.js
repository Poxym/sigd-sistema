/* Usuarios · VISTA DE DIÁLOGOS (ADR-006, MVC) · diálogo «Nuevo / Editar usuario» (antes usuarios/dialogo.js) y sus
   campos docentes (antes usuarios/docentes.js: v41TeachingOptions y v41UpdateTeaching).
   Solo pinta y lee el formulario; nunca toca la base ni el repositorio: la cuenta la recibe del controlador y las
   adscripciones, categorías y carreras que ofrece las pide a `datos` (el modelo). El HTML que genera es el mismo de antes.
   No usa el document global: `document` llega por env y es el del Shadow DOM del módulo. */
export function crearVistaDialogosUsuarios({ $, esc, input, select, openDialog, labelRoles, document, hoyLocal, datos }) {

  function selectInstitutionalArea(current=''){
   const {campuses,official}=datos.adscripcionesDisponibles(current);
   const options=[...campuses.map(x=>({value:x.name,label:x.name+(x.status==='Histórico'?' (histórico)':'')})),...official.map(x=>({value:x.name,label:x.name})),{value:'Institucional',label:'Institucional (servicios centrales)'}];
   if(current&&!options.some(x=>x.value===current))options.push({value:current,label:current+' (adscripción anterior)',legacy:true});
   const unique=[...new Map(options.map(x=>[x.value,x])).values()];
   return `<div class="form-field"><label class="required" for="m_area">Campus / adscripción</label><select id="m_area" name="area" required><option value="">Selecciona una adscripción</option>${unique.map(x=>`<option value="${esc(x.value)}" ${current===x.value?'selected':''}>${esc(x.label)}</option>`).join('')}</select></div>`;
  }

  function v36Assignments(user){
   if(!user)return '';
   const records=Array.isArray(user.assignmentHistory)?user.assignmentHistory:[];
   return `<details class="v36-assignment-history"><summary>Historial de adscripciones <span class="status neutral">${records.length} movimientos</span></summary><div class="v36-timeline">${records.length?records.slice().reverse().map(x=>`<div class="v36-event"><strong>${esc(x.from||'Alta inicial')} → ${esc(x.to)}</strong><small>${esc(x.when)} · ${esc(x.reason||'Actualización institucional')}</small></div>`).join(''):'<p class="muted">Los cambios de adscripción aparecerán aquí.</p>'}</div></details>`;
  }

  // ───── Campos docentes (categoría y carrera de adscripción) ─────
  function v41TeachingOptions(user){
   const categories=datos.categoriasDisponibles(user);
   const options=categories.map(x=>`<option value="${esc(x.code)}" ${x.code===user?.categoryCode?'selected':''}>${esc(x.name)}${x.status==='Histórico'?' (histórica)':''}</option>`).join('');
   return `<div class="v41-form-specific-fields" id="v41TeachingFields"><div class="form-field"><label class="required" for="v41Category">Categoría docente</label><select class="v41-reference-select" name="categoryCode" id="v41Category"><option value="">Seleccionar categoría</option>${options}</select></div><div class="form-field"><label class="required" for="v41Career">Carrera de adscripción</label><select class="v41-reference-select" name="careerCode" id="v41Career"><option value="">Seleccionar carrera</option></select></div></div>`;
  }
  function v41UpdateTeaching(user,reset=false){
   const role=document.querySelector('#editor [name="role"]')?.value;
   const area=document.querySelector('#editor [name="area"]')?.value;
   const container=$('v41TeachingFields'),career=$('v41Career'),category=$('v41Category');
   if(!container||!career||!category)return;
   const academic=datos.esAcademico(role);container.hidden=!academic;
   category.required=career.required=academic;
   if(!academic){category.value='';career.value='';return}
   const current=reset?'':career.value||user?.careerCode||'';
   const available=datos.carrerasDisponibles(area,current);
   career.innerHTML='<option value="">Seleccionar carrera</option>'+available.map(x=>`<option value="${esc(x.code)}" ${x.code===current?'selected':''}>${esc(x.name)}${x.status==='Histórico'?' (histórica)':''}</option>`).join('');
  }

  // Diálogo «Nuevo / Editar usuario»; u = la cuenta a editar, o undefined para una nueva. Antes eran 2 capas: la
  // base y una capa v41 que, después de abrir el diálogo, le agregaba los campos docentes. Aquí, una sola función.
  function abrirUsuario(u){
   // Paso 1 (base) · Datos de la cuenta, adscripción, historial de roles, fecha y motivo, historial de adscripciones.
   openDialog(u?'Editar usuario':'Nuevo usuario','USUARIOS Y PERMISOS',`<div class="fields">${input('num','Número de empleado',u?.num)}${input('name','Nombre completo',u?.name)}<div class="form-field span-all"><label class="required" for="m_mail">Correo institucional</label><input class="field" id="m_mail" name="mail" type="email" required value="${esc(u?.mail)}"></div>${select('role','Rol institucional',labelRoles,u?.role||'Docente')}${selectInstitutionalArea(u?.area)}${select('status','Estado',['Activo','Inactivo'],u?.status||'Activo')}</div>${u?`<div class="soft-divider"></div><h3>Historial de roles</h3><div class="list">${(u.history||[]).map(t=>`<div class="list-row"><div class="list-icon"><i class="ti ti-arrow-left-right"></i></div><div class="details"><strong>${esc(t)}</strong></div></div>`).join('')}</div>`:''}${u?`<div class="soft-divider"></div><div class="fields v37-reason-fields"><div class="form-field"><label for="v37_userDate">Fecha efectiva del movimiento</label><input id="v37_userDate" name="movementDate" type="date" class="field" value="${hoyLocal()}"></div><div class="form-field"><label for="v37_userReason">Motivo del cambio</label><input id="v37_userReason" name="movementReason" class="field" maxlength="180" placeholder="Ej. Reasignación institucional"></div></div>`:''}${v36Assignments(u)}`)
   // Paso 1b (fix/usuarios-rol-estado-anterior) · Un rol o un estado que ya no está en la lista (cuenta de una versión
   // anterior) se ofrece marcado «(anterior)» y queda elegido: guardar sin tocarlo lo conserva (el paso 6 del guardado lo
   // acepta) y se puede cambiar a uno válido. Antes el selector quedaba en la primera opción y la cuenta cambiaba sin aviso.
   for(const [campo,lista] of [['role',labelRoles],['status',['Activo','Inactivo']]]){
    const v=u?.[campo];if(!v||lista.includes(v))continue;
    const o=document.createElement('option');o.value=v;o.textContent=v+' (anterior)';
    const sel=document.querySelector(`#editor [name="${campo}"]`);sel.append(o);sel.value=v;
   }
   // Paso 2 (v41) · Campos docentes (categoría y carrera) e historial de carreras de adscripción.
   const user=u;
   const role=document.querySelector('#editor [name="role"]'),area=document.querySelector('#editor [name="area"]');
   const target=area?.closest('.form-field');if(!target)return;
   target.insertAdjacentHTML('afterend',v41TeachingOptions(user));
   v41UpdateTeaching(user);
   role.addEventListener('change',()=>v41UpdateTeaching(user));
   area.addEventListener('change',()=>v41UpdateTeaching(user,true));
   if(user){
    const changes=user.careerHistory||[];
    const block=document.createElement('details');block.className='v36-assignment-history';
    block.innerHTML=`<summary>Historial de carreras de adscripción <span class="status neutral">${changes.length} movimientos</span></summary><div class="v36-timeline">${changes.length?changes.slice().reverse().map(x=>`<div class="v36-event"><strong>${esc(x.from||'Sin asignación')} → ${esc(x.to||'Sin asignación')}</strong><small>${esc(x.when)} · ${esc(x.reason||'Cambio institucional')}</small></div>`).join(''):'<p class="muted">No hay movimientos registrados.</p>'}</div>`;
    $('modalContent').append(block);
   }
  }

  function cerrarDialogo(){ $('editor').close(); }

  return { abrirUsuario, cerrarDialogo };
}
