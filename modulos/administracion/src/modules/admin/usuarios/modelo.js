/* Usuarios y permisos · MODELO (ADR-006, MVC).
   Reglas de la pantalla y del guardado; lee y cambia los datos SOLO por el repositorio; no pinta nada.
   - Lista: cuentas que coinciden con la búsqueda y los filtros, y cuántas cuentas ACTIVAS hay en cada grupo de roles.
   - Diálogo: la cuenta, y las adscripciones, categorías y carreras que se ofrecen.
   - Guardado (antes usuarios/guardar.js y v41AcademicRole de usuarios/docentes.js, movido sin cambios): pasos 1, 4,
     5, 6, 7, 9, 10 y 11 del guardado unificado. Cada revisión DEVUELVE el aviso (o null); el controlador lo muestra.
   - Permisos por rol (antes usuarios/permisos.js): qué permisos tiene un rol y marcar o desmarcar uno.
   - Importación desde CSV (antes usuarios/importar.js, movido sin cambios): leer el archivo y agregar las cuentas.
   Las revisiones repetidas que nunca se alcanzaban se quitaron en refactor/revisiones-inalcanzables. */
import { idOf } from '../../../core/utilidades.js';

// Roles que llevan categoría docente y carrera de adscripción.
export function v41AcademicRole(role){return role==='Docente'||role==='Jefe de carrera'}

export function crearModeloUsuarios(repo, { includes, hoyLocal, labelRoles, capabilities }) {
  const cuentas = () => repo.usuarios.todos();
  const catalogo = (t) => repo.catalogos.todos()[t];
  const audit = (...a) => repo.bitacora.registrar(...a);

  // ───── Lista ─────
  // Busca en nombre, número, correo y adscripción; rol y estado: 'all' = todos.
  const filtrar = (q, r, s) => cuentas().filter(u => (r === 'all' || u.role === r) && (s === 'all' || u.status === s) && [u.name, u.num, u.mail, u.area].some(v => includes(v, q)));

  // Cuentas activas por grupo de roles (las tarjetas de arriba).
  function activosPorGrupo() {
    const active = cuentas().filter(u => u.status === 'Activo');
    return {
      docentes: active.filter(u => u.role === 'Docente').length,
      jefaturas: active.filter(u => u.role === 'Jefe de carrera').length,
      autoridades: active.filter(u => ['Rectoría', 'Vicerrectoría', 'Secretaría de Rectoría', 'Secretaría de Vicerrectoría'].includes(u.role)).length,
      administrador: active.filter(u => u.role === 'Administrador general').length,
    };
  }

  // ───── Datos para el diálogo ─────
  const cuenta = (id) => cuentas().find(x => x.id === id);
  // Adscripciones que se ofrecen: campus vigentes (o el actual) y las instituciones de Rectoría y Vicerrectoría.
  function adscripcionesDisponibles(current) {
    const campuses=(catalogo('campus')||[]).filter(x=>x.status==='Vigente'||x.name===current||x.code===current);
    const official=(catalogo('institucion')||[]).filter(x=>x.status==='Vigente'&&x.code!=='UNI'&&/rector|vicerrector/i.test(x.name));
    return { campuses, official };
  }
  // Categorías vigentes y la que ya tiene la cuenta.
  const categoriasDisponibles = (user) => catalogo('categorias').filter(x=>x.status==='Vigente'||x.code===user?.categoryCode);
  // Carreras vigentes del campus de la adscripción y la carrera actual.
  function carrerasDisponibles(area, current) {
    const campus=(catalogo('campus')||[]).find(x=>x.name===area);
    return (catalogo('carreras')||[]).filter(x=>x.code===current||x.status==='Vigente'&&(campus&&x.parentCode===campus.code));
  }

  // ───── Guardado (pasos del guardado unificado) ─────
  // Paso 1 (antes v41-usuario) · Categoría y carrera de docentes; motivo del cambio de carrera.
  function revisarDocente(f, modalItem) {
   const academic=v41AcademicRole(f.role);
   const existing=cuentas().find(u=>u.id===modalItem);
   if(academic){
    const category=catalogo('categorias').find(x=>x.code===f.categoryCode);
    const carrera=catalogo('carreras').find(x=>x.code===f.careerCode);
    const campus=catalogo('campus').find(x=>x.name===f.area);
    if(!category||(!existing||existing.categoryCode!==f.categoryCode)&&category.status!=='Vigente')return 'Selecciona una categoría docente vigente';
    if(!carrera||!campus||carrera.parentCode!==campus.code||(!existing||existing.careerCode!==f.careerCode)&&carrera.status!=='Vigente')return 'Selecciona una carrera vigente del campus indicado';
   }
   // Vacío, null y undefined cuentan como «sin carrera» (igual que en el paso 11); así no se pide motivo
   // de cambio de carrera a cuentas que nunca tuvieron una, como la administración general.
   if(existing&&(existing.careerCode||'')!==(f.careerCode||'')&&(!f.movementReason?.trim()||!f.movementDate))return 'Indica fecha y motivo del cambio de carrera';
   return null;
  }

  // Paso 4 (antes v38) · Fecha y motivo de los movimientos.
  function revisarMovimiento(f, modalItem) {
   if(modalItem){
    const before=cuentas().find(x=>x.id===modalItem);
    if(before&&(before.area!==f.area||before.role!==f.role)){
     if(!f.movementReason?.trim()||!f.movementDate)return 'Indica la fecha efectiva y el motivo del movimiento';
     if(f.movementDate>hoyLocal())return 'Registra los movimientos futuros mediante solicitudes de cambio';
    }
   }
   return null;
  }

  // Paso 5 (antes v36, parte previa; y la carrera previa del paso 1) · Anotar el estado anterior para los pasos 10 y 11.
  function anotar(modalItem) {
   const existing=cuentas().find(u=>u.id===modalItem);
   return { itemId: modalItem, existing, oldArea: existing?.area, carreraPrevia: existing?.careerCode||'' };
  }

  // Pasos 6 (antes v35) y 7 (antes v37) · Administración general única, número y correo, adscripción vigente,
  // vigencia del movimiento y motivo obligatorio.
  function revisar(f, modalItem) {
   const users=cuentas();
   // Paso 6 · Rol y estado que existen, administración general única, número y correo, adscripción vigente.
   // Rol y estado (fix/usuarios-estado-rol): como la adscripción, se acepta el valor que la cuenta ya tenía.
   const anterior=users.find(u=>u.id===modalItem);
   if(!labelRoles.includes(f.role)&&anterior?.role!==f.role)return 'Selecciona un rol institucional válido';
   if(!['Activo','Inactivo'].includes(f.status)&&anterior?.status!==f.status)return 'Selecciona un estado válido';
   const existingAdmins=users.filter(u=>u.id!==modalItem&&u.role==='Administrador general'&&u.status==='Activo');
   const previousAdmin=users.find(u=>u.id===modalItem);
   if(f.role==='Administrador general'&&f.status==='Activo'&&existingAdmins.length)return 'La administración general solo puede asignarse a una cuenta activa';
   if(previousAdmin?.role==='Administrador general'&&previousAdmin.status==='Activo'&&(f.role!=='Administrador general'||f.status!=='Activo')&&existingAdmins.length===0)return 'Debe mantenerse una cuenta de administración general activa';
   const n=String(f.num||'').trim(), mail=String(f.mail||'').trim().toLowerCase();
   if(!/^\d+$/.test(n))return 'El número de empleado debe contener solo dígitos';
   if(users.some(u=>u.id!==modalItem&&String(u.num).trim()===n))return 'El número de empleado ya está asignado';
   if(!mail)return 'El correo institucional es obligatorio'; // fix/usuarios-correo-vacio
   if(users.some(u=>u.id!==modalItem&&String(u.mail).trim().toLowerCase()===mail))return 'El correo institucional ya está registrado';
   const legal=new Set([...(catalogo('campus')||[]).filter(x=>x.status==='Vigente').map(x=>x.name),...(catalogo('institucion')||[]).filter(x=>x.status==='Vigente'&&x.code!=='UNI'&&/rector|vicerrector/i.test(x.name)).map(x=>x.name),'Institucional']);
   const original=users.find(u=>u.id===modalItem);
   if(!legal.has(f.area)&&(!original||original.area!==f.area))return 'Selecciona una adscripción institucional vigente';

   // Paso 7 · Vigencia del movimiento y motivo obligatorio.
   if(f.movementDate){
    if(!/^\d{4}-\d{2}-\d{2}$/.test(f.movementDate))return 'Indica una fecha de vigencia válida';
    if(f.movementDate > hoyLocal())return 'Los movimientos futuros deben registrarse mediante una solicitud programada';
   }
   // El cambio de rol no crea otra cuenta; la adscripción anterior debe permanecer en el historial.
   if(modalItem){
    const old=users.find(x=>x.id===modalItem);
    if(old&&(old.area!==f.area||old.role!==f.role)&&!String(f.movementReason||'').trim())return 'Indica el motivo del movimiento institucional';
   }
   return null;
  }

  // Paso 9 (antes la rama «user» de la función base) · Guardar la cuenta (sin avisos: los da el paso 6).
  function guardarCuenta(f, modalItem) {
  // El número se guarda sin espacios alrededor, igual que se revisó (fix/usuarios-numero-empleado).
  // Se cambia f mismo porque los pasos 10 y 11 lo usan para encontrar la cuenta nueva.
  f.num=String(f.num||'').trim();
  // Aquí se revisaban otra vez la adscripción del catálogo y el número repetido, con las mismas listas y
  // condiciones que el paso 6 (revisar), que corre antes: nunca se alcanzaban (refactor/revisiones-inalcanzables).
  let u=cuentas().find(x=>x.id===modalItem);if(u){let old=u.role;repo.usuarios.actualizar(u.id,f,['movementDate','movementReason']);/* fix/usuarios-campos-movimiento: solo sirven para los historiales, como en Catálogos */if(old!==f.role){repo.usuarios.anotarCambioDeRol(u.id,`${old} → ${f.role} · ${new Date().toLocaleDateString('es-MX')}`)}audit('Usuario','Actualización de '+u.name,old,f.role)}else{repo.usuarios.agregar({...f,id:idOf(cuentas()),history:['Alta de usuario · '+new Date().toLocaleDateString('es-MX')]});audit('Usuario','Alta de cuenta '+f.name)}
  return null;
  }

  // Paso 10 (antes v36, parte posterior) · Historial de adscripción. Se llama después de guardar la cuenta
  // (una presentación inválida no debe generar movimientos históricos).
  function historialAdscripcion(f, { itemId, existing, oldArea }) {
    const date=new Date().toISOString();
    const effectiveDate=f.movementDate||hoyLocal(), movementReason=String(f.movementReason||'').trim();
    const user=cuentas().find(x=>x.id===itemId)||(cuentas().find(x=>x.num===f.num));
    if(user){
     const historial=repo.usuarios.historialAdscripcion(user.id);
     if(existing&&oldArea!==user.area){
      repo.usuarios.agregarMovimientoAdscripcion(user.id,{from:oldArea,to:user.area,when:effectiveDate,recordedAt:date,reason:movementReason||'Cambio de adscripción'});
      audit('Usuario','Cambio de adscripción de '+user.name,oldArea,user.area);
     }else if(!existing&&historial.length===0){
      repo.usuarios.agregarMovimientoAdscripcion(user.id,{from:'',to:user.area,when:date,reason:'Alta de cuenta'});
     }
    }
  }

  // Paso 11 (antes v41-usuario, parte posterior) · Historial de carrera de adscripción. Se llama después de guardar
  // la cuenta (el controlador guarda la base al final).
  function historialCarrera(f, modalItem, { existing, carreraPrevia }) {
    const updated=cuentas().find(u=>u.id===modalItem)||cuentas().find(u=>u.num===f.num);
    if(!updated)return;
    const newer=f.careerCode||'';
    if(existing&&carreraPrevia!==newer){
     const from=catalogo('carreras').find(x=>x.code===carreraPrevia)?.name||carreraPrevia;
     const to=catalogo('carreras').find(x=>x.code===newer)?.name||newer;
     repo.usuarios.agregarMovimientoCarrera(updated.id,{from,to,when:f.movementDate||hoyLocal(),reason:f.movementReason||'Cambio de carrera de adscripción'});
     audit('Usuario','Cambio de carrera de adscripción de '+updated.name,from,to);
    }
  }

  // ───── Permisos por rol ─────
  const permisosDe = (role) => repo.permisos.delRol(role);
  // Marcar o desmarcar un permiso: se guarda en la bitácora (que guarda la base). La lista se guarda en el orden
  // del catálogo de permisos, el de las casillas (fix/usuarios-orden-permisos; antes un permiso que se volvía a
  // marcar quedaba al final); uno que no esté en el catálogo se conserva al final, en su orden.
  function cambiarPermiso(role, cap, marcado) {
    const before=repo.permisos.delRol(role).join(', ');
    const set=new Set(repo.permisos.delRol(role));marcado?set.add(cap):set.delete(cap);
    const ordenada=[...capabilities.filter(c=>set.has(c)),...[...set].filter(c=>!capabilities.includes(c))];
    const nueva=repo.permisos.asignar(role,ordenada);
    audit('Usuario','Permisos configurados para '+role,before,nueva.join(', '));
  }

  // ───── Importación desde CSV ─────
  function parseUserCSV(text){
   const rows=[];let row=[],cell='',quoted=false;
   text=text.replace(/^\uFEFF/,'');
   for(let i=0;i<text.length;i++){let c=text[i];if(c==='"'){if(quoted&&text[i+1]==='"'){cell+='"';i++}else quoted=!quoted}else if(c===','&&!quoted){row.push(cell.trim());cell=''}else if((c==='\n'||c==='\r')&&!quoted){if(c==='\r'&&text[i+1]==='\n')i++;row.push(cell.trim());if(row.some(x=>x))rows.push(row);row=[];cell=''}else cell+=c}
   if(quoted)throw Error('El CSV tiene comillas sin cerrar');row.push(cell.trim());if(row.some(x=>x))rows.push(row);
   return rows;
  }
  // Agrega las cuentas válidas del CSV y omite las demás. Si el archivo no sirve, lanza el error con su mensaje.
  // Devuelve cuántas se agregaron y cuántas se omitieron (si se agregó alguna, queda en la bitácora).
  function importarCSV(text){
     const data=parseUserCSV(text);if(data.length<2)throw Error('El archivo debe incluir encabezados y al menos un usuario');
     const headers=data.shift().map(x=>x.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,''));
     const aliases={num:['num','numero de empleado','no empleado','numero_empleado'],name:['name','nombre','nombre completo'],mail:['mail','correo','correo institucional','email'],role:['role','rol'],area:['area','adscripcion','campus'],status:['status','estado']};
     const cols=Object.fromEntries(Object.entries(aliases).map(([k,terms])=>[k,headers.findIndex(h=>terms.includes(h))]));
     if(Object.values(cols).slice(0,4).some(i=>i<0))throw Error('Se requieren columnas: num, name, mail y role');
     const seen=new Set(cuentas().map(u=>String(u.num)));let added=0,skipped=0;
     for(const row of data){const f=k=>cols[k]<0?'':String(row[cols[k]]??'').trim();let num=f('num'),name=f('name'),mail=f('mail'),role=f('role');
       if(!num||!name||!mail||!labelRoles.includes(role)||seen.has(num)||!(/^\d+$/.test(num))||cuentas().some(u=>u.mail?.toLowerCase()===mail.toLowerCase())||(role==='Administrador general'&&cuentas().some(u=>u.role==='Administrador general'&&u.status==='Activo'))){skipped++;continue}
       if(f('area')&&![...(catalogo('campus')||[]).filter(x=>x.status==='Vigente').map(x=>x.name),'Institucional',...(catalogo('institucion')||[]).map(x=>x.name)].includes(f('area'))){skipped++;continue}repo.usuarios.agregar({id:idOf(cuentas()),num,name,mail,role,area:f('area')||'Institucional',status:f('status')==='Inactivo'?'Inactivo':'Activo',history:['Importación CSV · '+new Date().toLocaleDateString('es-MX')]});seen.add(num);added++;
     }
     if(added)audit('Usuario','Importación CSV: '+added+' cuentas agregadas');
     return { added, skipped };
  }

  const guardar = () => repo.guardarTodo();

  return { filtrar, activosPorGrupo, cuenta, adscripcionesDisponibles, categoriasDisponibles, carrerasDisponibles,
    esAcademico: v41AcademicRole, revisarDocente, revisarMovimiento, anotar, revisar, guardarCuenta, historialAdscripcion,
    historialCarrera, permisosDe, cambiarPermiso, importarCSV, guardar };
}
