// Prueba de la CAPA REPOSITORIO (ADR-006): adaptador, preferencias y un repositorio por agregado.
// Carga los archivos de src/modules/admin/repositorio/ en el navegador (los sirve Vite, igual que a la app) y los
// usa con un ALMACENAMIENTO FALSO en memoria: no toca el localStorage real ni la pantalla.
// Compara TEXTO (resultados de cada método), no imágenes.
import { test, expect } from '@playwright/test';
import { FECHA_FIJA } from './ayudantes.mjs';

test('repositorio: adaptador, preferencias y repositorios por agregado', async ({ page }) => {
  const errores = [];
  page.on('pageerror', (e) => errores.push(`pageerror: ${e.message}`));
  page.on('console', (m) => { if (m.type() === 'error') errores.push(`console.error: ${m.text()}`); });
  await page.clock.setFixedTime(FECHA_FIJA);
  await page.goto('/');

  const registro = await page.evaluate(async () => {
    const { crearAlmacenLocal, CLAVE_BD } = await import('/src/modules/admin/repositorio/almacen-local.js');
    const { crearPreferencias } = await import('/src/modules/admin/repositorio/preferencias.js');
    const { crearRepositorio } = await import('/src/modules/admin/repositorio/index.js');

    // Almacenamiento falso: guarda en un Map. «bloqueado» imita un navegador que no deja usar el almacenamiento.
    const falso = () => { const m = new Map(); return { getItem: (k) => (m.has(k) ? m.get(k) : null), setItem: (k, v) => { m.set(k, String(v)); }, m }; };
    const bloqueado = { getItem() { throw new Error('bloqueado'); }, setItem() { throw new Error('bloqueado'); } };
    const r = {};

    // ── Adaptador ──
    const s = falso(), adaptador = crearAlmacenLocal(s);
    const inicial = adaptador.cargar();
    adaptador.guardar(inicial);
    const releida = crearAlmacenLocal(s).cargar();
    r.adaptador = {
      clave: CLAVE_BD,
      sinDatosUsaLaSemilla: { usuarios: inicial.users.length, solicitudes: inicial.requests.length, bitacora: inicial.audit.length },
      guardaConLaClave: [...s.m.keys()],
      loGuardadoEsElMismoJSON: s.m.get(CLAVE_BD) === JSON.stringify(inicial),
      alReleerQuedaIgual: JSON.stringify(releida) === JSON.stringify(inicial),
      bloqueadoUsaLaSemilla: crearAlmacenLocal(bloqueado).cargar().users.length,
      bloqueadoGuardarNoFalla: (() => { try { crearAlmacenLocal(bloqueado).guardar(inicial); return true; } catch { return false; } })(),
    };

    // ── Preferencias ──
    const sp = falso(), pref = crearPreferencias(sp);
    const antes = pref.menuLateralPlegado();
    pref.guardarMenuLateralPlegado(true);
    const prefBloqueada = crearPreferencias(bloqueado);
    r.preferencias = {
      alPrincipioNoPlegado: antes === false,
      guardadoTrue: [...sp.m.entries()],
      leeTrue: pref.menuLateralPlegado(),
      bloqueadoLeeNoPlegado: prefBloqueada.menuLateralPlegado() === false,
      bloqueadoGuardarNoFalla: (() => { try { prefBloqueada.guardarMenuLateralPlegado(true); return true; } catch { return false; } })(),
    };

    // ── Repositorios por agregado ──
    // El repositorio ya no ofrece la base completa (refactor/app-sin-db). La prueba la toma del adaptador, que recibe el
    // MISMO objeto cada vez que el repositorio guarda (y guarda al crearse).
    const sr = falso(), adaptadorSr = crearAlmacenLocal(sr);
    let bd; const repo = crearRepositorio({ cargar: () => adaptadorSr.cargar(), guardar: (x) => { bd = x; adaptadorSr.guardar(x); } });
    // Sin app.js: al crearse, el repositorio ya aplicó las migraciones de arranque y guardó una vez.
    r.baseCompletaSinAppJs = {
      permisosDeRoles: Object.keys(bd.permissions || {}),
      opciones: repo.catalogos.deTipo('opciones').length,
      comisiones: repo.catalogos.deTipo('comisiones').map((x) => x.code),
      camposDelPeriodo: ['semester', 'activityStart', 'activityEnd'].filter((k) => k in repo.periodos.actual()),
      guardoAlCrearse: sr.m.has(CLAVE_BD) && sr.m.get(CLAVE_BD) === JSON.stringify(bd),
    };
    const nuevoUsuario = repo.usuarios.agregar({ num: '990001', name: 'Prueba Repo', mail: 'repo@unistmo.example', role: 'Docente', area: 'Tehuantepec', status: 'Activo' });
    r.usuarios = {
      todos: repo.usuarios.todos().length,
      buscar1: repo.usuarios.buscar(1)?.name,
      buscarPorNumeroConEspacios: repo.usuarios.buscarPorNumero(' 900002 ')?.name,
      noExiste: repo.usuarios.buscar(12345) ?? null,
      agregarAsignaId: nuevoUsuario.id,
      agregarVaAlFinal: bd.users.at(-1) === nuevoUsuario,
      esElMismoObjeto: repo.usuarios.buscar(nuevoUsuario.id) === bd.users.at(-1),
      aunNoSeGuarda: !sr.m.has(CLAVE_BD) || !sr.m.get(CLAVE_BD).includes('Prueba Repo'),
    };
    r.permisos = {
      docente: repo.permisos.delRol('Docente'),
      rolSinPermisos: repo.permisos.delRol('Rol inexistente'),
      asignar: repo.permisos.asignar('Docente', ['Consultar catálogos']),
      quedoEnDb: bd.permissions.Docente,
    };
    const nuevoCampus = repo.catalogos.agregar('campus', { code: 'REP', name: 'Campus Repo', status: 'Vigente' });
    r.catalogos = {
      campus: repo.catalogos.deTipo('campus').map((x) => x.code),
      tipoInexistente: repo.catalogos.deTipo('no-existe'),
      buscar: repo.catalogos.buscar('campus', 1)?.name,
      buscarPorClave: repo.catalogos.buscarPorClave('carreras', 'REF-TEH-04')?.name,
      agregarAsignaId: nuevoCampus.id,
      agregarVaAlFinal: bd.catalogs.campus.at(-1) === nuevoCampus,
    };
    r.catalogosTodos = { esElMismoObjeto: repo.catalogos.todos() === bd.catalogs, tipos: Object.keys(repo.catalogos.todos()).length };
    r.accesos = { semillaVacia: repo.accesos.registrados(), esElMismoArreglo: repo.accesos.registrados() === bd.demoAccessEvents };
    const sinAccesos = { ...bd }; delete sinAccesos.demoAccessEvents;
    r.accesos.sinLaParteDevuelveVacio = crearRepositorio({ cargar: () => structuredClone(sinAccesos), guardar() {} }).accesos.registrados();
    const nuevaSolicitud = repo.solicitudes.agregar({ title: 'Solicitud Repo', status: 'pendiente' });
    r.solicitudes = {
      todas: repo.solicitudes.todas().length,
      buscar2: repo.solicitudes.buscar(2)?.status,
      agregarAsignaId: nuevaSolicitud.id,
      agregarVaAlPrincipio: bd.requests[0] === nuevaSolicitud,
    };
    repo.periodos.agregarAlHistorial({ date: '2026-11-02T18:00:00.000Z', cycle: repo.periodos.actual().cycle, summary: 'Entrada Repo' });
    r.periodos = {
      ciclo: repo.periodos.actual().cycle,
      historial: repo.periodos.historial().map((x) => x.summary),
      esElMismoObjeto: repo.periodos.actual() === bd.period,
    };
    const periodoAntes = repo.periodos.actual();
    const actualizado = repo.periodos.actualizar({ cycle: '2030-2031', planState: 'Cerrado' });
    r.periodosActualizar = {
      mezcla: actualizado,
      actualDevuelveElNuevo: repo.periodos.actual() === actualizado && bd.period === actualizado,
      esUnObjetoNuevo: periodoAntes !== actualizado,
      elAnteriorNoCambia: periodoAntes.cycle,
      aunNoSeGuarda: !sr.m.get(CLAVE_BD).includes('2030-2031'),
    };
    const entradasAntes = repo.bitacora.entradas().length;
    repo.bitacora.registrar('Usuario', 'Entrada Repo', 'antes', 'después');
    const crudo = sr.m.get(CLAVE_BD), guardado = crudo ? JSON.parse(crudo) : null;
    r.bitacora = {
      entradasAntes,
      primeraTrasRegistrar: repo.bitacora.entradas()[0],
      registrarGuarda: guardado?.audit?.[0]?.detail === 'Entrada Repo',
      alGuardarSeLlevaTodo: guardado && { usuario: guardado.users.some((u) => u.name === 'Prueba Repo'), campus: guardado.catalogs.campus.some((x) => x.code === 'REP'), solicitud: guardado.requests[0].title, historial: guardado.periodHistory[0].summary },
    };
    return r;
  });

  expect(errores, 'errores de consola').toEqual([]);
  expect(JSON.stringify(registro, null, 2)).toMatchSnapshot('repositorio.json');
});

// Fase 3 (refactor/repo-usuarios-actualizar): el repositorio de usuarios también MODIFICA cuentas, para que el modelo
// no cambie los objetos por su cuenta. Cada método hace lo mismo que hacía el modelo (mismo orden de campos).
test('repositorio: usuarios.actualizar y los historiales de una cuenta', async ({ page }) => {
  const errores = [];
  page.on('pageerror', (e) => errores.push(`pageerror: ${e.message}`));
  page.on('console', (m) => { if (m.type() === 'error') errores.push(`console.error: ${m.text()}`); });
  await page.clock.setFixedTime(FECHA_FIJA);
  await page.goto('/');

  const registro = await page.evaluate(async () => {
    const { crearAlmacenLocal, CLAVE_BD } = await import('/src/modules/admin/repositorio/almacen-local.js');
    const { crearRepositorio } = await import('/src/modules/admin/repositorio/index.js');
    const m = new Map();
    const s = { getItem: (k) => (m.has(k) ? m.get(k) : null), setItem: (k, v) => { m.set(k, String(v)); } };
    const repo = crearRepositorio(crearAlmacenLocal(s));
    const guardadoAlCrear = m.get(CLAVE_BD);
    const u = repo.usuarios.agregar({ num: '990002', name: 'Cuenta Repo', role: 'Docente', area: 'Tehuantepec', status: 'Activo', movementDate: '2026-11-01' });
    const r = {};

    // actualizar: mezcla los cambios en la MISMA cuenta (los campos nuevos van al final) y quita los indicados
    const devuelta = repo.usuarios.actualizar(u.id, { name: 'Cuenta Repo 2', role: 'Jefe de carrera', movementReason: 'x', extra: 1 }, ['movementDate', 'movementReason']);
    r.actualizar = {
      esLaMismaCuenta: devuelta === u && repo.usuarios.buscar(u.id) === u,
      camposEnOrden: Object.keys(u),
      valores: { name: u.name, role: u.role, extra: u.extra },
      quitados: ['movementDate', 'movementReason'].filter((k) => k in u),
      noExiste: repo.usuarios.actualizar(98765, { name: 'nadie' }) ?? null,
    };

    // anotarCambioDeRol: crea history si no existe y pone lo más nuevo al principio
    repo.usuarios.anotarCambioDeRol(u.id, 'Docente → Jefe de carrera');
    repo.usuarios.anotarCambioDeRol(u.id, 'Jefe de carrera → Docente');
    r.anotarCambioDeRol = u.history;

    // historialAdscripcion: crea la lista si no es un arreglo (también si trae otro valor) y devuelve la misma
    const antes = 'assignmentHistory' in u;
    const lista = repo.usuarios.historialAdscripcion(u.id);
    u.assignmentHistory = 'valor antiguo';
    const reemplazada = repo.usuarios.historialAdscripcion(u.id);
    repo.usuarios.agregarMovimientoAdscripcion(u.id, { from: '', to: 'Tehuantepec' });
    repo.usuarios.agregarMovimientoAdscripcion(u.id, { from: 'Tehuantepec', to: 'Ixtepec' });
    r.adscripcion = {
      noExistiaAntes: !antes,
      creaArregloVacio: Array.isArray(lista) && lista.length === 0,
      reemplazaUnValorQueNoEsArreglo: Array.isArray(reemplazada),
      agregaAlFinal: u.assignmentHistory,
      esLaMismaLista: repo.usuarios.historialAdscripcion(u.id) === u.assignmentHistory,
    };

    // agregarMovimientoCarrera: crea careerHistory si no existe y agrega al final
    repo.usuarios.agregarMovimientoCarrera(u.id, { from: 'A', to: 'B' });
    repo.usuarios.agregarMovimientoCarrera(u.id, { from: 'B', to: 'C' });
    r.carrera = u.careerHistory;

    // Ninguno guarda por sí solo: lo hace guardarTodo(), como antes
    r.ningunoGuarda = m.get(CLAVE_BD) === guardadoAlCrear;
    return r;
  });

  expect(errores, 'errores de consola').toEqual([]);
  expect(JSON.stringify(registro, null, 2)).toMatchSnapshot('repositorio-usuarios.json');
});

// Fase 3 (refactor/repo-catalogos-actualizar): el repositorio de catálogos también MODIFICA registros.
test('repositorio: catalogos.actualizar y los historiales de un registro', async ({ page }) => {
  const errores = [];
  page.on('pageerror', (e) => errores.push(`pageerror: ${e.message}`));
  page.on('console', (m) => { if (m.type() === 'error') errores.push(`console.error: ${m.text()}`); });
  await page.clock.setFixedTime(FECHA_FIJA);
  await page.goto('/');

  const registro = await page.evaluate(async () => {
    const { crearAlmacenLocal, CLAVE_BD } = await import('/src/modules/admin/repositorio/almacen-local.js');
    const { crearRepositorio } = await import('/src/modules/admin/repositorio/index.js');
    const m = new Map();
    const s = { getItem: (k) => (m.has(k) ? m.get(k) : null), setItem: (k, v) => { m.set(k, String(v)); } };
    const repo = crearRepositorio(crearAlmacenLocal(s));
    const guardadoAlCrear = m.get(CLAVE_BD);
    const c = repo.catalogos.agregar('carreras', { code: 'REPO', name: 'Carrera Repo', status: 'Vigente', parentCode: 'TEH', movementDate: '2026-11-01' });
    const r = {};

    // actualizar: mezcla los cambios en el MISMO registro (los campos nuevos van al final) y quita los indicados
    const devuelto = repo.catalogos.actualizar('carreras', c.id, { name: 'Carrera Repo 2', directEvidence: 'x', extra: 1 }, ['movementDate', 'directEvidence']);
    r.actualizar = {
      esElMismoRegistro: devuelto === c && repo.catalogos.buscar('carreras', c.id) === c,
      camposEnOrden: Object.keys(c),
      valores: { name: c.name, extra: c.extra },
      quitados: ['movementDate', 'directEvidence'].filter((k) => k in c),
      noExiste: repo.catalogos.actualizar('carreras', 98765, { name: 'nadie' }) ?? null,
      tipoQueNoExiste: repo.catalogos.actualizar('noexiste', c.id, { name: 'nadie' }) ?? null,
    };

    // anotarCambio: crea changeHistory si no existe y pone lo más nuevo al principio
    repo.catalogos.anotarCambio('carreras', c.id, { field: 'name', oldValue: 'Carrera Repo', newValue: 'Carrera Repo 2' });
    repo.catalogos.anotarCambio('carreras', c.id, { field: 'status', oldValue: 'Vigente', newValue: 'Histórico' });
    r.anotarCambio = c.changeHistory;

    // historialRelacion: crea la lista si no es un arreglo (también si trae otro valor) y devuelve la misma
    const antes = 'relationHistory' in c;
    const lista = repo.catalogos.historialRelacion('carreras', c.id);
    c.relationHistory = 'valor antiguo';
    const reemplazada = repo.catalogos.historialRelacion('carreras', c.id);
    repo.catalogos.agregarMovimientoRelacion('carreras', c.id, { from: '', to: 'TEH' });
    repo.catalogos.agregarMovimientoRelacion('carreras', c.id, { from: 'TEH', to: 'IXT' });
    r.relacion = {
      noExistiaAntes: !antes,
      creaArregloVacio: Array.isArray(lista) && lista.length === 0,
      reemplazaUnValorQueNoEsArreglo: Array.isArray(reemplazada),
      agregaAlFinal: c.relationHistory,
      esLaMismaLista: repo.catalogos.historialRelacion('carreras', c.id) === c.relationHistory,
    };

    // Ninguno guarda por sí solo: lo hace guardarTodo(), como antes
    r.ningunoGuarda = m.get(CLAVE_BD) === guardadoAlCrear;
    return r;
  });

  expect(errores, 'errores de consola').toEqual([]);
  expect(JSON.stringify(registro, null, 2)).toMatchSnapshot('repositorio-catalogos.json');
});

// Fase 3 (refactor/repo-solicitudes-actualizar): el repositorio de solicitudes también MODIFICA solicitudes, y el de
// catálogos anota desde cuándo vale el último cambio (al aplicar una solicitud).
test('repositorio: solicitudes.actualizar y catalogos.anotarVigencia', async ({ page }) => {
  const errores = [];
  page.on('pageerror', (e) => errores.push(`pageerror: ${e.message}`));
  page.on('console', (m) => { if (m.type() === 'error') errores.push(`console.error: ${m.text()}`); });
  await page.clock.setFixedTime(FECHA_FIJA);
  await page.goto('/');

  const registro = await page.evaluate(async () => {
    const { crearAlmacenLocal, CLAVE_BD } = await import('/src/modules/admin/repositorio/almacen-local.js');
    const { crearRepositorio } = await import('/src/modules/admin/repositorio/index.js');
    const m = new Map();
    const s = { getItem: (k) => (m.has(k) ? m.get(k) : null), setItem: (k, v) => { m.set(k, String(v)); } };
    const repo = crearRepositorio(crearAlmacenLocal(s));
    const guardadoAlCrear = m.get(CLAVE_BD);
    const sol = repo.solicitudes.agregar({ title: 'Solicitud Repo', status: 'pendiente', schedule: 'Inmediata', borrador: 1 });
    const r = {};

    // actualizar: mezcla los cambios en la MISMA solicitud (los campos nuevos van al final, en su orden) y quita los indicados
    const devuelta = repo.solicitudes.actualizar(sol.id, { evidence: 'Oficio 1', authorizationBy: 'Rectoría', status: 'autorizada' }, ['borrador']);
    r.actualizar = {
      esLaMismaSolicitud: devuelta === sol && repo.solicitudes.buscar(sol.id) === sol,
      camposEnOrden: Object.keys(sol),
      valores: { status: sol.status, evidence: sol.evidence, authorizationBy: sol.authorizationBy },
      quitados: ['borrador'].filter((k) => k in sol),
      noExiste: repo.solicitudes.actualizar(98765, { status: 'x' }) ?? null,
    };

    // anotarVigencia: pone validFrom en el cambio MÁS RECIENTE (el primero); sin historial no hace nada
    const c = repo.catalogos.agregar('parametros', { code: 'PREPO', name: 'Parámetro Repo', status: 'Vigente' });
    repo.catalogos.anotarVigencia('parametros', c.id, '2026-12-01');
    const sinHistorial = { tieneHistorial: 'changeHistory' in c };
    repo.catalogos.anotarCambio('parametros', c.id, { field: 'name', oldValue: 'a', newValue: 'b' });
    repo.catalogos.anotarCambio('parametros', c.id, { field: 'name', oldValue: 'b', newValue: 'c' });
    repo.catalogos.anotarVigencia('parametros', c.id, '2026-12-01');
    r.anotarVigencia = { sinHistorial, historial: c.changeHistory, registroQueNoExiste: repo.catalogos.anotarVigencia('parametros', 98765, '2026-12-01') ?? null };

    // Ninguno guarda por sí solo: lo hace guardarTodo(), como antes
    r.ningunoGuarda = m.get(CLAVE_BD) === guardadoAlCrear;
    return r;
  });

  expect(errores, 'errores de consola').toEqual([]);
  expect(JSON.stringify(registro, null, 2)).toMatchSnapshot('repositorio-solicitudes.json');
});
