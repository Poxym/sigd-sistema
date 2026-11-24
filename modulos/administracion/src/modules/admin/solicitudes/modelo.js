/* Solicitudes de cambio · MODELO (ADR-006, MVC).
   Reglas de negocio de las solicitudes y acceso a sus datos, SOLO por el repositorio. No conoce la pantalla:
   cada revisión DEVUELVE el aviso (texto) o null; quien lo muestra es el controlador.
   Movido sin cambios desde solicitudes/index.js (lista), solicitudes/reglas.js (v39ValidateChange,
   v40SelectedValue, v39ApplyRequest) y solicitudes/guardar.js (pasos 3, 4, 6 y 9 del guardado unificado; la
   numeración «Paso N» es la de formulario/index.js). Cambios mecánicos: db.catalogs[x] → catalogo(x),
   db.requests → repo.solicitudes.todas(), audit → repo.bitacora.registrar y «notify(aviso);return» → «return aviso».
   Las revisiones repetidas que nunca se alcanzaban se quitaron en refactor/revisiones-inalcanzables. */
import { idOf } from '../../../core/utilidades.js';

export function crearModeloSolicitudes(repo, { includes, types, hoyLocal, esFechaValida, fechaLegible }) {
  // Igual que db.catalogs[cat]: undefined si el tipo de catálogo no existe (la regla «catálogo válido» lo necesita).
  const catalogo = (cat) => repo.catalogos.todos()[cat];
  const audit = (...a) => repo.bitacora.registrar(...a);

  // ───── Lista y detalle ─────
  /* Solicitudes del estado «f» ('all' = todas) cuyo título, autoridad o tipo contiene «q». */
  function filtrar(q, f) {
    return repo.solicitudes.todas().filter(r => (f === 'all' || r.status === f) && [r.title, r.authority, r.type].some(x => includes(x, q)));
  }
  /* La solicitud con ese id (entre TODAS, no solo las filtradas), o undefined. */
  const buscar = (id) => repo.solicitudes.todas().find(r => r.id === id);

  // ───── Datos que piden los diálogos ─────
  function tiposDisponibles(){return Object.entries(types).filter(([k])=>k!=='institucion'||(catalogo(k)||[]).length).map(([k,v])=>[k,v]);}
  const registrosDe = (cat) => catalogo(cat)||[];
  const registro = (cat, id) => (catalogo(cat)||[]).find(x=>String(x.id)===String(id));

  // ───── Reglas del cambio pedido (antes solicitudes/reglas.js) ─────
  function v39ValidateChange(f){const cat=f.targetCatalog,arr=catalogo(cat);if(!arr)return 'Selecciona un catálogo válido';const r=arr.find(x=>String(x.id)===String(f.targetId));if(!r)return 'Selecciona un registro del catálogo';const allowed=['name','detail','status',...(cat==='parametros'?['paramValue','paramUnit']:[])];if(!allowed.includes(f.targetField))return 'Ese campo no se puede modificar desde esta solicitud';const value=String(f.targetValue||'').trim();if(!value)return 'Escribe el valor autorizado';if(f.targetField==='name'&&arr.some(x=>x.id!==r.id&&x.name.toLocaleLowerCase('es')===value.toLocaleLowerCase('es')))return 'Ya existe un registro con ese nombre';if(f.targetField==='status'&&!['Vigente','Histórico'].includes(value))return 'El estado solo puede ser Vigente o Histórico';if(f.targetField==='paramValue'&&(!Number.isFinite(Number(value))||Number(value)<0))return 'El valor debe ser numérico y no negativo';if(f.targetField==='paramUnit'&&!['Horas','Porcentaje','Puntos','Cantidad','No aplica'].includes(value))return 'Selecciona una unidad admitida';if(f.targetField==='status'&&value==='Histórico'&&r.status!=='Histórico'){const dependencies={campus:'carreras',carreras:'planes',planes:'materias'};const child=dependencies[cat];if(child&&(catalogo(child)||[]).some(x=>x.parentCode===r.code&&x.status==='Vigente'))return 'No se puede desactivar: existen registros vigentes asociados'}return null}
  function v40SelectedValue(f){const record=(catalogo(f.targetCatalog)||[]).find(x=>String(x.id)===String(f.targetId));return record?String(record[f.targetField]??''):''}

  // Aplicar una solicitud autorizada. Antes eran 2 capas: v39 (revisar y aplicar) y una envoltura v40
  // (vigencia, valor esperado y fecha de validez). Una sola función con los mismos pasos en el mismo orden.
  // Solo la llama ejecutarGestion («Marcar como aplicada»), después de revisarGestion. Por eso ya no repite
  // (refactor/revisiones-inalcanzables): el antiguo paso 1, la vigencia (misma condición que el paso 3 de
  // revisarGestion), ni en el paso 3 el estado autorizado, la instrucción documentada, la fecha y el resultado de
  // la ejecución y «no anterior a la autorización» (los exigen los pasos 4 y 6 de revisarGestion).
  function v39ApplyRequest(request,f){
   // Paso 2 (v40) · El registro debe conservar el valor que tenía al registrar la solicitud.
   const targetCat=request.targetCatalog||f.targetCatalog,targetId=request.targetId||f.targetId,targetField=request.targetField||f.targetField;
   const registro=(catalogo(targetCat)||[]).find(x=>String(x.id)===String(targetId));
   if(registro&&request.expectedBefore!==undefined&&String(registro[targetField]??'')!==String(request.expectedBefore))return 'El valor actual cambió desde que se registró la solicitud. Registra una nueva solicitud con los datos actualizados';
   // Paso 3 (v39) · Revisar el cambio y aplicarlo. Todos sus «return» son de error.
   const patch={targetCatalog:request.targetCatalog||f.targetCatalog,targetId:request.targetId||f.targetId,targetField:request.targetField||f.targetField,targetValue:request.targetValue??f.targetValue};const problem=v39ValidateChange(patch);if(problem)return problem;const item=catalogo(patch.targetCatalog).find(x=>String(x.id)===String(patch.targetId));const old=String(item[patch.targetField]??'');const next=String(patch.targetValue).trim();if(old===next)return 'El registro ya contiene el valor indicado; no hay modificación que aplicar';const previous=structuredClone(item);repo.catalogos.actualizar(patch.targetCatalog,item.id,{[patch.targetField]:patch.targetField==='paramValue'?Number(next):next,updatedAt:f.appliedAt});repo.catalogos.anotarCambio(patch.targetCatalog,item.id,{requestId:request.id,date:f.appliedAt,field:patch.targetField,oldValue:old,newValue:next,authority:request.authorizationBy,evidence:request.evidence});repo.solicitudes.actualizar(request.id,{...patch,appliedAt:f.appliedAt,executionNote:f.executionNote.trim(),status:'aplicada',beforeValue:old,afterValue:next,executedBy:'Administrador general'});audit('Catálogo',`Solicitud #${request.id} aplicada: ${item.name} · ${patch.targetField}`,old,next);audit('Solicitud',`Aplicación documentada #${request.id} por Administrador general`,JSON.stringify(previous),JSON.stringify(item));
   // Paso 4 (v40) · Si se aplicó, anotar desde cuándo vale el cambio.
   if(registro){repo.catalogos.anotarVigencia(targetCat,registro.id,request.effectiveDate||f.appliedAt);}
   return null;
  }

  // ───── Registrar (antes registrarSolicitud y guardarSolicitudNueva) ─────
  /* Paso 3 (antes v40) · Una solicitud programada necesita fecha futura de entrada en vigor. */
  function revisarNueva(f){
   if(f.schedule==='Siguiente ciclo'&&(!esFechaValida(f.effectiveDate)||f.effectiveDate<=hoyLocal()))return 'Indica una fecha futura de entrada en vigor';
   return null;
  }
  /* Paso 9 · Valida el cambio pedido y guarda la solicitud con su bitácora. Devuelve el aviso de error o null. */
  function registrarNueva(f){
   const invalid=v39ValidateChange(f);if(invalid)return invalid;
   repo.solicitudes.agregar({...f,id:idOf(repo.solicitudes.todas()),status:'pendiente',expectedBefore:v40SelectedValue(f)});
   audit('Solicitud','Registro de solicitud vinculada: '+f.title);
   return null;
  }

  // ───── Gestionar (antes gestionarSolicitud y guardarGestion) ─────
  /* Pasos 3, 4 y 6, en ese orden. Solo revisan (no cambian nada). Devuelve el primer aviso o null. */
  function revisarGestion(f, modalItem){
   // La solicitud se busca una vez (antes los pasos 3, 4 y 6 la buscaban cada uno y el 4 repetía «No se encontró»).
   const r=repo.solicitudes.todas().find(x=>x.id===modalItem);
   if(!r)return 'No se encontró la solicitud';
   // Acción y tipo de solicitud (fix/solicitudes-forzado; solo se alcanzan con el formulario forzado): antes una acción
   // inventada respondía «Estado de la solicitud actualizado» sin cambiar nada, y «Guardar fecha programada» en una
   // solicitud inmediata respondía «La fecha de vigencia no puede ser anterior a la autorización».
   // Las 6 acciones que ofrece el diálogo (vista-dialogos.js); «Mantener…» no cambia nada, como desde la interfaz.
   if(!['Mantener pendiente','Registrar instrucción recibida','Devolver para aclaración','Mantener autorizada','Guardar fecha programada','Marcar como aplicada'].includes(f.transition))return 'Selecciona una acción válida';
   if(f.transition==='Guardar fecha programada'&&r.schedule!=='Siguiente ciclo')return 'Solo una solicitud programada para el siguiente ciclo lleva fecha de vigencia';
   // Paso 3 (antes v40) · Vigencias de la operación programada.
   {
    if(f.transition==='Registrar instrucción recibida'&&r.schedule==='Siguiente ciclo'&&(!esFechaValida(f.effectiveDate)||f.effectiveDate<f.authorizationDate))return 'La vigencia debe ser igual o posterior a la fecha de autorización';
    if(f.transition==='Guardar fecha programada'&&(!esFechaValida(f.effectiveDate)||f.effectiveDate<r.authorizationDate))return 'La vigencia debe ser igual o posterior a la fecha autorizada';
    if(f.transition==='Marcar como aplicada'&&r.schedule==='Siguiente ciclo'){
     const due=r.effectiveDate||f.effectiveDate;
     if(!esFechaValida(due))return 'Define primero la vigencia de esta solicitud';
     if(due>hoyLocal())return 'Aplicación disponible desde '+fechaLegible(due);
     if(f.appliedAt<due)return 'La ejecución no puede preceder a la fecha de vigencia';
    }
   }
   // Paso 4 (antes v38) · Instrucción y aplicación.
   {
    if(f.transition==='Registrar instrucción recibida'){
     if(r.status!=='pendiente'||!['Rectoría','Vicerrectoría'].includes(f.authorizationBy)||f.authorizationBy!==r.authority||!f.authEvidence?.trim()||!f.authorizationDate)return 'Registra la instrucción de la autoridad correspondiente con fecha y evidencia';
     if(f.authorizationDate>hoyLocal())return 'La fecha de autorización no puede estar en el futuro';
    }
    if(f.transition==='Marcar como aplicada'){
     if(r.status!=='autorizada'||!r.evidence||!r.authorizationBy||!r.authorizationDate)return 'La solicitud requiere una instrucción autorizada identificable';
     if(!f.executionNote?.trim()||!f.appliedAt)return 'Indica fecha y resultado de ejecución';
     if(f.appliedAt<r.authorizationDate)return 'La ejecución no puede preceder a la autorización';
     if(f.appliedAt>hoyLocal())return 'Para ejecuciones futuras, conserva la solicitud autorizada';
    }
   }
   // Paso 6 (antes v35) · Origen de la instrucción y estado para aplicar.
   if(f.transition==='Registrar instrucción recibida'){
    if(!['Rectoría','Vicerrectoría'].includes(r.authority))return 'La instrucción debe provenir de Rectoría o Vicerrectoría';
    if(!String(f.authEvidence||'').trim())return 'Indica el oficio o referencia de la instrucción';
   }
   if(f.transition==='Marcar como aplicada'&&r.status!=='autorizada')return 'Solo pueden aplicarse cambios autorizados';
   return null;
  }
  /* Paso 9 · Ejecuta la transición (con su bitácora). Devuelve el aviso de error o null si se guardó.
     Ya no repite «Completa autoridad, fecha y referencia documental» ni «Documenta la fecha y el resultado de la
     ejecución»: el paso 4 (revisarGestion) exige esos mismos campos antes (refactor/revisiones-inalcanzables). Tampoco «La fecha
     de vigencia no puede ser anterior a la autorización»: el tipo lo revisa revisarGestion al empezar y la fecha su paso 3
     (fix/solicitudes-forzado). */
  function ejecutarGestion(f, modalItem){
  let r=repo.solicitudes.todas().find(x=>x.id===modalItem),old=r.status;if(f.transition==='Registrar instrucción recibida'){repo.solicitudes.actualizar(r.id,{evidence:f.authEvidence.trim(),authorizationBy:f.authorizationBy,authorizationDate:f.authorizationDate,...(r.schedule==='Siguiente ciclo'?{effectiveDate:f.effectiveDate}:{}),status:'autorizada'});audit('Autorización','Instrucción documentada de '+r.authorizationBy+': '+r.title,old,r.status)}else if(f.transition==='Guardar fecha programada'){const oldDate=r.effectiveDate||'';repo.solicitudes.actualizar(r.id,{effectiveDate:f.effectiveDate});audit('Solicitud','Actualización de vigencia de la solicitud #'+r.id,oldDate,r.effectiveDate)}else if(f.transition==='Devolver para aclaración'){repo.solicitudes.actualizar(r.id,{status:'rechazada'});audit('Solicitud','Solicitud devuelta para aclaración: '+r.title,old,r.status)}else if(f.transition==='Marcar como aplicada'){const invalid=v39ApplyRequest(r,f);if(invalid)return invalid}
  return null;
  }

  // ───── Guardado ─────
  const guardar = () => repo.guardarTodo();

  return { filtrar, buscar, tiposDisponibles, registrosDe, registro, revisarNueva, registrarNueva, revisarGestion, ejecutarGestion, guardar };
}
