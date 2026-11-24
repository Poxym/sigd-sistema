/* Repositorio del módulo de Administración (ADR-006).
   crearRepositorio(adaptador) carga la base UNA vez y ofrece:
   - un repositorio por agregado (usuarios, permisos, catalogos, solicitudes, periodos, accesos, bitacora). Trabajan
     sobre la MISMA base en memoria y devuelven los mismos objetos, no copias. Leen, agregan y (Fase 3) modifican:
     ningún modelo cambia un registro por su cuenta.
   - La base completa NO se ofrece (refactor/app-sin-db): solo el repositorio y su adaptador la conocen.
   - guardarTodo(): guarda la base completa (antes persist()).
   Reglas: «agregar» pone el registro donde hoy lo pone el código (usuarios y catálogos al final; solicitudes,
   historial de periodos y bitácora al principio, para mostrar lo más nuevo primero) y le asigna id si no lo trae.
   Solo bitacora.registrar() guarda por sí solo, igual que el audit() de antes; para lo demás, quien cambia los
   datos llama a guardarTodo(). El adaptador decide dónde se guarda (hoy almacen-local.js: localStorage). */
import { idOf } from '../../../core/utilidades.js';
import { aplicarMigraciones } from './migraciones.js';

export function crearRepositorio(adaptador) {
  // Al cargar se aplican las migraciones de arranque (migraciones.js) y se guarda una vez, como hacía app.js con el
  // persist() de v41Initialize: así cualquiera que use el repositorio recibe la base completa.
  const db = aplicarMigraciones(adaptador.cargar());
  const guardarTodo = () => adaptador.guardar(db);
  guardarTodo();
  const conId = (lista, r) => ({ ...r, id: r.id ?? idOf(lista) });

  const usuarios = {
    todos: () => db.users,
    buscar: (id) => db.users.find((u) => u.id === id),
    buscarPorNumero: (num) => db.users.find((u) => String(u.num).trim() === String(num).trim()),
    agregar(u) { const nuevo = conId(db.users, u); db.users.push(nuevo); return nuevo; },
    // Modificar una cuenta (Fase 3): cambian la MISMA cuenta guardada, con el mismo orden de campos que antes
    // (Object.assign deja los campos que ya tenía en su lugar y agrega los nuevos al final). Ninguno guarda: quien
    // cambia los datos llama a guardarTodo().
    actualizar(id, cambios, quitar = []) {
      const u = usuarios.buscar(id); if (!u) return undefined;
      Object.assign(u, cambios); for (const k of quitar) delete u[k]; return u;
    },
    // Historial de rol (history): lo más nuevo al principio.
    anotarCambioDeRol(id, texto) { const u = usuarios.buscar(id); u.history ??= []; u.history.unshift(texto); return u.history; },
    // Historial de adscripción (assignmentHistory): si no es un arreglo se crea vacío (también en una cuenta sin
    // movimientos, como antes); los movimientos van al final.
    historialAdscripcion(id) { const u = usuarios.buscar(id); if (!Array.isArray(u.assignmentHistory)) u.assignmentHistory = []; return u.assignmentHistory; },
    agregarMovimientoAdscripcion(id, mov) { usuarios.historialAdscripcion(id).push(mov); return mov; },
    // Historial de carrera de adscripción (careerHistory): se crea si no existe; los movimientos van al final.
    agregarMovimientoCarrera(id, mov) { const u = usuarios.buscar(id); u.careerHistory ??= []; u.careerHistory.push(mov); return mov; },
  };

  // La semilla no trae db.permissions: lo agrega una migración de arranque (migraciones.js). Estos métodos igual
  // funcionan aunque no exista.
  const permisos = {
    delRol: (rol) => db.permissions?.[rol] || [],
    asignar(rol, lista) { (db.permissions ??= {})[rol] = [...lista]; return db.permissions[rol]; },
  };

  const catalogos = {
    todos: () => db.catalogs,
    deTipo: (tipo) => db.catalogs[tipo] || [],
    buscar: (tipo, id) => (db.catalogs[tipo] || []).find((r) => r.id === id),
    buscarPorClave: (tipo, clave) => (db.catalogs[tipo] || []).find((r) => r.code === clave),
    agregar(tipo, r) { const lista = (db.catalogs[tipo] ??= []); const nuevo = conId(lista, r); lista.push(nuevo); return nuevo; },
    // Modificar un registro (Fase 3): cambian el MISMO registro guardado, con el mismo orden de campos que antes.
    // Ninguno guarda: quien cambia los datos llama a guardarTodo().
    actualizar(tipo, id, cambios, quitar = []) {
      const r = catalogos.buscar(tipo, id); if (!r) return undefined;
      Object.assign(r, cambios); for (const k of quitar) delete r[k]; return r;
    },
    // Historial de versiones (changeHistory): lo más nuevo al principio.
    anotarCambio(tipo, id, entrada) { const r = catalogos.buscar(tipo, id); r.changeHistory ??= []; r.changeHistory.unshift(entrada); return entrada; },
    // Historial de relación académica (relationHistory): si no es un arreglo se crea vacío (también en un registro sin
    // movimientos, como antes); los movimientos van al final.
    historialRelacion(tipo, id) { const r = catalogos.buscar(tipo, id); if (!Array.isArray(r.relationHistory)) r.relationHistory = []; return r.relationHistory; },
    agregarMovimientoRelacion(tipo, id, mov) { catalogos.historialRelacion(tipo, id).push(mov); return mov; },
    // Al aplicar una solicitud: desde cuándo vale el cambio más reciente (el primero del historial). Sin historial, nada.
    anotarVigencia(tipo, id, validFrom) { const r = catalogos.buscar(tipo, id); if (r?.changeHistory?.[0]) r.changeHistory[0].validFrom = validFrom; return r; },
  };

  const solicitudes = {
    todas: () => db.requests,
    buscar: (id) => db.requests.find((s) => s.id === id),
    agregar(s) { const nueva = conId(db.requests, s); db.requests.unshift(nueva); return nueva; },
    // Modificar una solicitud (Fase 3): cambia la MISMA solicitud guardada, con el mismo orden de campos que antes.
    actualizar(id, cambios, quitar = []) {
      const s = solicitudes.buscar(id); if (!s) return undefined;
      Object.assign(s, cambios); for (const k of quitar) delete s[k]; return s;
    },
  };

  const periodos = {
    actual: () => db.period,
    historial: () => (db.periodHistory ??= []),
    agregarAlHistorial(e) { periodos.historial().unshift(e); return e; },
    // Mezcla los cambios con el periodo vigente (lo demás se conserva); db.period pasa a ser un objeto nuevo.
    actualizar(cambios) { db.period = { ...db.period, ...cambios }; return db.period; },
  };

  // Accesos registrados (db.demoAccessEvents): { source, day, count }. La semilla lo deja vacío.
  const accesos = {
    registrados: () => db.demoAccessEvents || [],
    agregar(r) { (db.demoAccessEvents ??= []).push(r); return r; },
  };

  const bitacora = {
    entradas: () => db.audit,
    registrar(kind,detail,oldVal='',newVal=''){db.audit.unshift({id:idOf(db.audit),date:new Date().toISOString(),user:'Administrador general',kind,detail,oldVal,newVal});guardarTodo()},
  };

  return { guardarTodo, usuarios, permisos, catalogos, solicitudes, periodos, accesos, bitacora };
}
