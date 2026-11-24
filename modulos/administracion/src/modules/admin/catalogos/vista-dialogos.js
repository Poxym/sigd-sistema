/* Catálogos · VISTA DE DIÁLOGOS (ADR-006, MVC) · diálogo «Nuevo / Editar registro» (antes catalogos/dialogo.js).
   Solo pinta y lee el formulario; nunca toca la base ni el repositorio: el registro lo recibe del controlador y los
   padres y grupos que ofrece los pide a `datos` (el modelo). El HTML que genera es el mismo de antes.
   También pinta los historiales del registro (v36CatalogHistory, y v40ApprovedHistory/v40FieldName, antes en
   catalogos/historial.js) y hace los cambios del formulario que pide el guardado («Nuevo grupo…»).
   No usa el document global: `document` llega por env y es el del Shadow DOM del módulo. */
export function crearVistaDialogosCatalogos({ $, esc, input, select, openDialog, types, document, hoyLocal, fechaLegible, v41FormatPlan, v41FormatReport, datos }) {

  function v36CatalogHistory(record){
   if(!record)return '';
   const changes=record.relationHistory||[];
   return `<details class="v36-assignment-history"><summary>Historial de relación académica <span class="status neutral">${changes.length} movimientos</span></summary><div class="v36-timeline">${changes.length?changes.slice().reverse().map(x=>`<div class="v36-event"><strong>${esc(x.from||'Sin relación previa')} → ${esc(x.to)}</strong><small>${esc(x.when)} · ${esc(x.reason||'Actualización institucional')}</small></div>`).join(''):'<p class="muted">No hay movimientos de relación registrados.</p>'}</div></details>`;
  }

  function v40ApprovedHistory(record){if(!record)return '';const lines=record.changeHistory||[];if(!lines.length)return '';return `<details class="v40-history"><summary><span><i class="ti ti-history"></i> Versiones anteriores y cambios</span><span class="status neutral">${lines.length} ajustes</span></summary><div class="v40-history-items">${lines.map(x=>`<div class="v40-history-item"><strong>${esc(v40FieldName(x.field))} · ${esc(fechaLegible(x.date))}</strong><p><span>Antes:</span> ${esc(x.oldValue||'Sin dato')}</p><p><span>Después:</span> ${esc(x.newValue||'Sin dato')}</p><small>${esc(x.authority||'Administración')} · ${esc(x.evidence||'Referencia no registrada')}${x.requestId?' · Solicitud #'+esc(x.requestId):''}</small></div>`).join('')}</div></details>`}
  function v40FieldName(field){return ({name:'Denominación',detail:'Descripción',status:'Vigencia',paramValue:'Valor del parámetro',paramUnit:'Unidad del parámetro',code:'Clave oficial',parentCode:'Relación institucional'})[field]||field}

  // Selector del padre (campus, carrera o plan). Los registros que se ofrecen los decide el modelo.
  function catalogRelations(type,record){
   const title={carreras:'Campus asociado',planes:'Carrera asociada',materias:'Plan de estudios asociado'}[type];
   if(!title)return '';
   const current=record?.parentCode||'';
   const available=datos.relacionesDisponibles(type,current);
   return `<div class="form-field span-all"><label class="required" for="m_parentCode">${title}</label><select name="parentCode" id="m_parentCode" required><option value="">Selecciona un registro</option>${available.map(x=>`<option value="${esc(x.code)}" ${x.code===current?'selected':''}>${esc(x.name)} · ${esc(x.code)}${x.status!=='Vigente'?' (histórico)':''}</option>`).join('')}</select><small class="field-help">Solo se ofrecen registros vigentes; una relación anterior se conserva al editar.</small></div>`;
  }

  // Diálogo «Nuevo / Editar registro» del tipo catalogType; r = el registro a editar, o undefined para uno nuevo.
  // Antes eran 2 capas: la base y una capa v41 que, después de abrir el diálogo, le agregaba campos.
  function abrirCatalogo(catalogType,r){
   // Paso 1 (base) · Campos comunes, relación, parámetro, traslado, historiales y respaldo; abre el diálogo.
   const isParam=catalogType==='parametros';
   const paramFields=isParam?`<div class="form-field"><label>Valor del parámetro</label><input class="field" name="paramValue" type="number" step="any" value="${esc(r?.paramValue??'') }" placeholder="Ej. 2"></div><div class="form-field"><label>Unidad de medida</label><select name="paramUnit">${['Horas','Porcentaje','Puntos','Cantidad','No aplica'].map(x=>`<option ${x===(r?.paramUnit||'Horas')?'selected':''}>${x}</option>`).join('')}</select></div>`:'';
   openDialog(r?'Editar registro':'Nuevo registro',types[catalogType].toUpperCase(),`<div class="fields">${input('code','Clave oficial',r?.code)}${select('status','Estado',['Vigente','Histórico'],r?.status||'Vigente')}<div class="form-field span-all"><label class="required" for="m_name">Denominación oficial</label><input class="field" id="m_name" name="name" required value="${esc(r?.name)}"></div>${catalogRelations(catalogType,r)}${paramFields}<div class="form-field span-all"><label>Descripción y observaciones</label><textarea name="detail" placeholder="Especificaciones y notas de gestión">${esc(r?.detail)}</textarea></div></div>${r&&['carreras','planes','materias'].includes(catalogType)?`<div class="fields v37-reason-fields"><div class="form-field"><label>Fecha efectiva del traslado</label><input name="movementDate" type="date" class="field" value="${hoyLocal()}"></div><div class="form-field"><label>Motivo del movimiento</label><input name="movementReason" class="field" maxlength="180" placeholder="Ej. Reestructuración académica"></div></div>`:''}${v36CatalogHistory(r)}${v40ApprovedHistory(r)}<div class="v40-approval"><div class="v40-approval-title"><i class="ti ti-file-check"></i><strong>Respaldo de la modificación</strong></div><div class="fields"><div class="form-field"><label class="required" for="m_directAuthority">Autoridad que instruyó</label><select id="m_directAuthority" name="directAuthority" required><option value="">Seleccionar autoridad</option><option>Rectoría</option><option>Vicerrectoría</option></select></div><div class="form-field"><label class="required">Referencia de autorización</label><input name="directEvidence" class="field" maxlength="160" required placeholder="Oficio, acuerdo o instrucción"></div></div></div><p class="hint" style="margin-top:12px">Se conservan las relaciones y vigencias anteriores para consulta.</p>`);
   // Paso 2 (v41) · Campos propios de Opciones de captura y de Rubros, agregados sobre el diálogo ya abierto.
   const item=r,name=$('modalContent').querySelector('input[name="name"]');
   if(!name)return;
   if(catalogType==='opciones'){
    const groups=datos.gruposDelDialogo();
    const el=document.createElement('div');el.className='v41-form-specific-fields';
    const opt=(name,arr,current)=>`<div class="form-field"><label class="required">${name==='group'?'Grupo de opciones':'Aplicable en'}</label><select name="${name}" class="v41-reference-select" required><option value="">Seleccionar</option>${arr.map(s=>`<option value="${esc(s)}" ${current===s?'selected':''}>${esc(s)}</option>`).join('')}</select></div>`;
    el.innerHTML=opt('group',groups,item?.group||'')+opt('appliesTo',['Plan de Trabajo','Informe de Actividades','Ambos'],item?.appliesTo||'');
    const selector=el.querySelector('[name=group]');selector.insertAdjacentHTML('beforeend','<option value="__NEW__">Nuevo grupo…</option>');
    const custom=document.createElement('div');custom.className='form-field';custom.hidden=true;
    custom.innerHTML='<label>Nombre del nuevo grupo</label><input class="field" name="groupCustom" maxlength="85" placeholder="Ej. Tipo de evaluación">';
    const flip=()=>{custom.hidden=selector.value!=='__NEW__';custom.querySelector('input').required=!custom.hidden};
    selector.addEventListener('change',flip);
    el.append(custom);flip();
    name.closest('.form-field').after(el);
    const mode=document.createElement('div');mode.className='form-field';
    mode.innerHTML=`<label>Tipo de selección</label><select name="selectionMode" class="v41-reference-select"><option ${(item?.selectionMode||'Única')==='Única'?'selected':''}>Única</option><option ${(item?.selectionMode||'Única')==='Múltiple'?'selected':''}>Múltiple</option></select>`;
    el.after(mode);
   }else if(catalogType==='rubros'){
    const el=document.createElement('div');el.className='v41-form-specific-fields';
    const field=(key,label,arr)=>`<div class="form-field"><label>${label}</label><select name="${key}" class="v41-reference-select">${arr.map(x=>`<option value="${esc(x)}" ${(item?.[key]||'')===x?'selected':''}>${esc(x||'No está en este formato')}</option>`).join('')}</select></div>`;
    el.innerHTML=field('planSection','Sección en el Plan',v41FormatPlan)+field('reportSection','Sección en el Informe',v41FormatReport);
    name.closest('.form-field').after(el);
   }
  }

  // «Nuevo grupo…» al guardar (paso 2): el grupo escrito se agrega al selector y queda elegido, y el campo del nombre
  // deja de enviarse. Se queda así aunque una revisión posterior impida guardar (como antes).
  function agregarGrupo(custom){
   const selector=$('modalContent').querySelector('[name=group]');
   selector.add(new Option(custom,custom,true,true));selector.value=custom;
   $('modalContent').querySelector('[name=groupCustom]').removeAttribute('name');
  }

  function cerrarDialogo(){ $('editor').close(); }

  return { abrirCatalogo, agregarGrupo, cerrarDialogo };
}
