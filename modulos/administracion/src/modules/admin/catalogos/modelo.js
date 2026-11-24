/* Catálogos académicos · MODELO (ADR-006, MVC).
   Reglas de la pantalla y del guardado; lee y cambia los datos SOLO por el repositorio; no pinta nada.
   - Lista: qué registros tiene cada tipo, quién es el padre de un registro (campus de una carrera, carrera de un plan,
     plan de una materia), qué coincide con la búsqueda, los grupos de «Opciones de captura» y el filtro por estado.
   - Diálogo: el registro, los padres que se ofrecen y los grupos de opciones.
   - Guardado (antes catalogos/guardar.js y catalogos/historial.js, movido sin cambios): pasos 2 y 4 a 10 del guardado
     unificado. Cada revisión DEVUELVE el aviso (o null) en lugar de mostrarlo; el controlador lo muestra.
   La clave repetida del paso 9, que nunca se alcanzaba, se quitó en refactor/revisiones-inalcanzables. La relación
   vigente del paso 8 se conserva: sí se alcanza con un formulario forzado que envíe parentCode en un tipo sin
   relación (el paso 6 no lo revisa en esos tipos). */
import { idOf } from '../../../core/utilidades.js';

export function crearModeloCatalogos(repo, { includes, types, hoyLocal, v41SeedOptions }) {
  // Tipo hijo → tipo padre (el registro hijo guarda la clave del padre en parentCode).
  const RELACION = { carreras: 'campus', planes: 'carreras', materias: 'planes' };

  const registros = t => repo.catalogos.deTipo(t);
  const padre = (t, r) => RELACION[t] ? registros(RELACION[t]).find(x => x.code === r.parentCode) || null : null;
  const audit = (...a) => repo.bitacora.registrar(...a);

  // ───── Lista ─────
  // Busca en clave, nombre, descripción, grupo, documento, secciones del Plan y del Informe, y en el nombre del padre.
  function coincide(t, r, q) {
    if (!q.trim()) return true;
    const p = padre(t, r);
    return [r.code, r.name, r.detail, r.group, r.appliesTo, r.planSection, r.reportSection, p && p.name].some(x => includes(x, q));
  }

  // Grupos de «Opciones de captura», en orden alfabético, y cuántas opciones tiene cada uno.
  const grupos = t => [...new Set(registros(t).map(x => x.group).filter(Boolean))].sort((a, b) => a.localeCompare(b, 'es'));
  const enGrupo = (t, g) => registros(t).filter(x => x.group === g).length;

  // Lo que coincide con la búsqueda y el grupo ('all' = todos), y de eso, lo que tiene un estado ('all' = todos).
  const filtrar = (t, q, grupo) => registros(t).filter(r => coincide(t, r, q) && (grupo === 'all' || r.group === grupo));
  const conEstado = (lista, e) => e === 'all' ? lista : lista.filter(r => r.status === e);

  // ───── Datos para el diálogo ─────
  const registro = (t, id) => repo.catalogos.buscar(t, id);
  // Padres que se ofrecen: los vigentes y, al editar, el que ya tiene aunque sea histórico. null si el tipo no tiene padre.
  const relacionesDisponibles = (t, actual) => RELACION[t] ? registros(RELACION[t]).filter(x => x.status === 'Vigente' || x.code === actual) : null;
  // Grupos del selector de «Opciones de captura»: los de la semilla y los guardados.
  const gruposDelDialogo = () => [...new Set([...v41SeedOptions.map(x => x.group), ...registros('opciones').map(x => x.group)])].sort((a, b) => a.localeCompare(b, 'es'));

  // ───── Guardado (pasos del guardado unificado) ─────
  // Paso 2 (antes v41-opciones) · Opciones de captura: grupo nuevo, grupo, documento y nombres repetidos.
  const grupoNuevo = f => String(f.groupCustom || '').trim();
  const revisarGrupoNuevo = f => grupoNuevo(f) ? null : 'Indica un nombre para el nuevo grupo';
  function revisarOpcion(f, modalItem) {
    if (!f.group || !['Plan de Trabajo', 'Informe de Actividades', 'Ambos'].includes(f.appliesTo)) return 'Selecciona un grupo y el documento al que aplica';
    if (registros('opciones').some(x => x.id !== modalItem && x.group === f.group && String(x.name).trim().toLocaleLowerCase('es') === String(f.name).trim().toLocaleLowerCase('es'))) return 'Esta opción ya existe en el grupo seleccionado';
    return null;
  }

  // Paso 4 (antes v38) · Fecha y motivo del cambio de relación académica.
  function revisarRelacion(f, modalItem, catalogType) {
    if (modalItem && ['carreras', 'planes', 'materias'].includes(catalogType)) {
      const before = registros(catalogType).find(x => x.id === modalItem);
      if (before && before.parentCode !== f.parentCode) {
        if (!f.movementReason?.trim() || !f.movementDate) return 'Indica la fecha efectiva y el motivo del cambio de relación';
        if (f.movementDate > hoyLocal()) return 'Para cambios futuros registra una solicitud programada';
      }
    }
    return null;
  }

  // Paso 5 (antes v36, parte previa) · Anotar el estado anterior para el historial del paso 10.
  function anotar(modalItem, catalogType) {
    const oldRecord = registros(catalogType).find(x => x.id === modalItem);
    return { itemId: modalItem, catalogKey: catalogType, oldRecord, oldParent: oldRecord?.parentCode };
  }

  // Pasos 6 (antes v35), 7 (antes v37) y 8 (antes la primera capa): respaldo, clave, relación vigente, dependencias,
  // vigencia del movimiento, motivo del cambio de relación y valor numérico del parámetro.
  function revisar(f, modalItem, catalogType) {
    // Paso 6 · Respaldo, clave, relación vigente y dependencias.
    if (!['Rectoría', 'Vicerrectoría'].includes(f.directAuthority) || !String(f.directEvidence || '').trim()) return 'Toda modificación del catálogo requiere respaldo de Rectoría o Vicerrectoría';
    const arr = registros(catalogType), existing = arr.find(x => x.id === modalItem);
    // Estado (fix/catalogos-estado): solo Vigente o Histórico; se acepta el que el registro ya tenía, como en Usuarios.
    if (!['Vigente', 'Histórico'].includes(f.status) && existing?.status !== f.status) return 'Selecciona un estado válido';
    const code = String(f.code || '').trim();
    if (!code) return 'La clave oficial es obligatoria';
    if (arr.some(x => x.id !== modalItem && String(x.code).trim().toLowerCase() === code.toLowerCase())) return 'La clave oficial ya existe';
    const relations = { carreras: 'campus', planes: 'carreras', materias: 'planes' }, parentType = relations[catalogType];
    if (parentType) {
      const parent = registros(parentType).find(x => x.code === f.parentCode);
      if (!parent || (parent.status !== 'Vigente' && existing?.parentCode !== f.parentCode)) return 'Debes seleccionar una relación institucional vigente';
    }
    if (existing && existing.status === 'Vigente' && f.status === 'Histórico') {
      const downstream = { campus: ['carreras'], carreras: ['planes'], planes: ['materias'] }[catalogType] || [];
      const deps = downstream.flatMap(type => registros(type).filter(x => x.parentCode === existing.code && x.status === 'Vigente'));
      if (deps.length) return 'No se puede cerrar la vigencia: existen ' + deps.length + ' registros vinculados activos';
    }
    if (existing && existing.code !== code) {
      const downstream = { campus: 'carreras', carreras: 'planes', planes: 'materias' }[catalogType];
      const deps = downstream ? registros(downstream).filter(x => x.parentCode === existing.code) : [];
      if (deps.length) return 'Esta clave tiene relaciones vinculadas. Conserva la clave y modifica la denominación';
    }

    // Paso 7 · Vigencia del movimiento y motivo del cambio de relación.
    if (f.movementDate) {
      if (!/^\d{4}-\d{2}-\d{2}$/.test(f.movementDate)) return 'Indica una fecha de vigencia válida';
      if (f.movementDate > hoyLocal()) return 'Los movimientos futuros deben registrarse mediante una solicitud programada';
    }
    if (modalItem) {
      const old = registros(catalogType).find(x => x.id === modalItem);
      if (old && old.parentCode !== f.parentCode && ['carreras', 'planes', 'materias'].includes(catalogType) && !String(f.movementReason || '').trim()) return 'Indica el motivo del cambio de relación académica';
    }

    // Paso 8 · Relación vigente y valor numérico del parámetro.
    if (f.parentCode) {
      const key = { carreras: 'campus', planes: 'carreras', materias: 'planes' }[catalogType];
      const parent = registros(key).find(x => x.code === f.parentCode);
      if (!parent || (parent.status !== 'Vigente' && !(modalItem && registros(catalogType).find(x => x.id === modalItem)?.parentCode === f.parentCode))) return 'Selecciona un registro relacionado vigente';
    }
    if (catalogType === 'parametros' && f.paramValue !== '' && !Number.isFinite(Number(f.paramValue))) return 'El valor del parámetro debe ser numérico';
    return null;
  }

  // Historial de versiones de un registro editado directamente (antes v40RecordDirectHistory, en historial.js).
  function v40RecordDirectHistory(record,previous,f,tipo){const fields=['code','name','detail','status','parentCode','paramValue','paramUnit'];const differences=fields.filter(key=>String(record[key]??'')!==String(previous[key]??''));if(!differences.length)return;differences.forEach(key=>repo.catalogos.anotarCambio(tipo,record.id,{requestId:null,date:f.movementDate||hoyLocal(),field:key,oldValue:String(previous[key]??''),newValue:String(record[key]??''),authority:f.directAuthority,evidence:f.directEvidence,executionNote:f.movementReason||'Modificación institucional'}))}

  // Paso 9 (antes la rama «catalog» de la función base) · Guardar el registro (sin avisos: los da el paso 6).
  // groupCustom (nombre de un grupo nuevo) solo sirve en el paso 2; no se guarda (fix/catalogos-groupcustom).
  function guardarRegistro(f, modalItem, catalogType) {
    // La clave se guarda sin espacios alrededor, igual que se revisó (fix/catalogos-clave-espacios).
    // Se cambia f.code mismo porque el paso 10 lo usa para encontrar el registro nuevo.
    f.code = String(f.code || '').trim();
    // Aquí se revisaba otra vez la clave repetida, igual que el paso 6 (revisar), que corre antes: nunca se
    // alcanzaba (refactor/revisiones-inalcanzables).
    let arr = registros(catalogType), r = arr.find(x => x.id === modalItem);
    if (r) { let old = r.name + ' / ' + r.status; const previous = structuredClone(r); repo.catalogos.actualizar(catalogType, r.id, f, ['groupCustom', 'directAuthority', 'directEvidence', 'movementReason', 'movementDate']); v40RecordDirectHistory(r, previous, f, catalogType); audit('Catálogo', 'Edición autorizada en ' + types[catalogType] + ' · ' + f.directEvidence, old, f.name + ' / ' + f.status) }
    else { const item = { ...f, id: idOf(arr) }; delete item.groupCustom; delete item.directAuthority; delete item.directEvidence; repo.catalogos.agregar(catalogType, item); audit('Catálogo', 'Alta documentada en ' + types[catalogType] + ' · ' + f.directEvidence, '', f.name) }
    return null;
  }

  // Paso 10 (antes v36, parte posterior) · Historial de relación académica. Se llama después de guardar el registro.
  function historialRelacion(f, { itemId, catalogKey, oldRecord, oldParent }) {
    const date = new Date().toISOString();
    const effectiveDate = f.movementDate || hoyLocal(), movementReason = String(f.movementReason || '').trim();
    if (['carreras', 'planes', 'materias'].includes(catalogKey)) {
      const item = registros(catalogKey).find(x => x.id === itemId) || registros(catalogKey).find(x => x.code === f.code);
      if (item) {
        const historial = repo.catalogos.historialRelacion(catalogKey, item.id);
        if (oldRecord && oldParent !== item.parentCode) {
          repo.catalogos.agregarMovimientoRelacion(catalogKey, item.id, { from: oldParent || '', to: item.parentCode, when: effectiveDate, recordedAt: date, reason: movementReason || 'Cambio de relación académica' });
          audit('Catálogo', 'Relación modificada: ' + item.name, oldParent || '', item.parentCode);
        } else if (!oldRecord && item.parentCode && historial.length === 0) {
          repo.catalogos.agregarMovimientoRelacion(catalogKey, item.id, { from: '', to: item.parentCode, when: date, reason: 'Alta del registro' });
        }
      }
    }
  }

  const guardar = () => repo.guardarTodo();

  return { registros, padre, grupos, enGrupo, filtrar, conEstado, registro, relacionesDisponibles, gruposDelDialogo,
    grupoNuevo, revisarGrupoNuevo, revisarOpcion, revisarRelacion, anotar, revisar, guardarRegistro, historialRelacion,
    guardar };
}
