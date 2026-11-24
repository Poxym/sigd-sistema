// Prueba de las REGLAS DEL FORMULARIO compartido (usuarios, solicitudes, catálogos).
// Hoy esas reglas son una cadena de capas encadenadas en un solo envío; esta prueba registra, caso por caso,
// qué aviso ve la persona y si la base de datos cambió. Al reorganizar el código, el registro debe quedar IDÉNTICO.
// Compara TEXTO (avisos y conteos), no imágenes.
import { test, expect } from '@playwright/test';
import { CLAVE_BD, FECHA_FIJA, enviarAcceso, normalizar } from './ayudantes.mjs';
import crypto from 'node:crypto';

test('reglas del formulario: avisos y efectos en usuarios, solicitudes y catálogos', async ({ page }) => {
  test.setTimeout(180000);
  const errores = [];
  page.on('pageerror', (e) => errores.push(`pageerror: ${e.message}`));
  page.on('console', (m) => { if (m.type() === 'error') errores.push(`console.error: ${m.text()}`); });
  await page.clock.setFixedTime(FECHA_FIJA);

  const bd = async () => JSON.parse(await page.evaluate((k) => localStorage.getItem(k), CLAVE_BD));
  const irA = async (t) => { await page.locator('#ni .ni', { hasText: t }).click(); await page.waitForTimeout(150); };
  const reiniciar = async () => {
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
    await page.goto('/');
    await enviarAcceso(page);
    await expect(page.locator('#app')).toBeVisible();
    await page.waitForTimeout(200);
  };
  const cerrar = async () => { if (await page.locator('#editor[open]').count()) { await page.keyboard.press('Escape'); await page.waitForTimeout(100); } };
  const poner = async (campos) => {
    await page.locator('#editorForm').evaluate((form, campos) => {
      for (const [n, v] of Object.entries(campos)) {
        const el = form.elements[n];
        if (!el) throw new Error('No existe el campo ' + n);
        el.value = v;
        el.dispatchEvent(new Event('input', { bubbles: true }));
        el.dispatchEvent(new Event('change', { bubbles: true }));
        if (el.value !== v) throw new Error(`El campo ${n} no acepta «${v}»`);
      }
    }, campos);
  };
  const resumen = (d) => ({ usuarios: d.users.length, solicitudes: d.requests.length, bitacora: d.audit.length,
    catalogos: Object.values(d.catalogs).reduce((n, a) => n + a.length, 0) });
  const huella = (d) => crypto.createHash('sha1').update(JSON.stringify([d.users, d.requests, d.catalogs, d.audit])).digest('hex').slice(0, 10);

  const registro = {};
  // Ejecuta un caso: abre el formulario, llena campos, envía SIN la validación nativa del navegador
  // (así solo se prueban las reglas del sistema) y anota aviso, cierre del diálogo y cambios.
  const caso = async (grupo, nombre, abrir, campos, extra) => {
    await cerrar();
    await abrir();
    await page.waitForTimeout(100);
    if (campos) await poner(campos);
    if (extra) await extra();
    const antes = await bd();
    await page.locator('#toasts .toast').evaluateAll((els) => els.forEach((e) => e.remove()));
    await page.locator('#editorForm').evaluate((f) => { f.noValidate = true; f.requestSubmit(); });
    await page.waitForTimeout(250);
    const despues = await bd();
    const avisos = (await page.locator('#toasts .toast').allInnerTexts()).map((t) => normalizar(t.replace(/\s+/g, ' ').trim()));
    const guardo = (await page.locator('#editor[open]').count()) === 0;
    const nuevos = despues.audit.slice(0, despues.audit.length - antes.audit.length).map((a) => `${a.kind} · ${a.detail}${a.oldVal || a.newVal ? ` (${a.oldVal} → ${a.newVal})` : ''}`);
    (registro[grupo] ??= {})[nombre] = { avisos, dialogoCerrado: guardo, antes: resumen(antes), despues: resumen(despues), bitacoraNueva: nuevos };
    await cerrar();
  };
  const cierre = async (grupo) => { registro[grupo]._huellaFinal = huella(await bd()); };

  const nuevoUsuario = async () => { await irA('Usuarios'); await page.locator('#newUser').click(); };
  const editarUsuario = (id) => async () => { await irA('Usuarios'); await page.locator(`#view-usuarios [data-user="${id}"]`).click(); };
  const nuevaSolicitud = async () => { await irA('Solicitudes'); await page.locator('#newRequest').click(); };
  const gestionarSolicitud = (id) => async () => { await irA('Solicitudes'); await page.locator(`#requestRows [data-rq="${id}"]`).click(); await page.locator('#requestDetail [data-rq-open]').click(); };
  const nuevoCatalogo = (tipo) => async () => { await irA('Catálogos'); await page.locator(`[data-cx-type="${tipo}"]`).click(); await page.locator('#newCatalog').click(); };
  const editarCatalogo = (tipo) => async () => { await irA('Catálogos'); await page.locator(`[data-cx-type="${tipo}"]`).click(); await page.locator('[data-edit-cat]').first().click(); };

  // ───────────── USUARIOS ─────────────
  await reiniciar();
  const base = { name: 'Persona de Prueba', mail: 'prueba@unistmo.example', role: 'Rectoría', area: 'Institucional', status: 'Activo' };
  await caso('usuarios', 'alta: número no numérico', nuevoUsuario, { ...base, num: 'abc' });
  await caso('usuarios', 'alta: número repetido', nuevoUsuario, { ...base, num: '900001' });
  await caso('usuarios', 'alta: correo repetido', nuevoUsuario, { ...base, num: '810001', mail: 'administracion@unistmo.example' });
  await caso('usuarios', 'alta: segunda administración general activa', nuevoUsuario, { ...base, num: '810001', role: 'Administrador general' });
  await caso('usuarios', 'alta: adscripción vacía', nuevoUsuario, { ...base, num: '810001', area: '' });
  await caso('usuarios', 'alta docente: sin categoría', nuevoUsuario, { ...base, num: '810001', role: 'Docente', area: 'Tehuantepec' });
  await caso('usuarios', 'alta docente: sin carrera', nuevoUsuario, { ...base, num: '810001', role: 'Docente', area: 'Tehuantepec', categoryCode: 'CAT-P' });
  await caso('usuarios', 'alta docente: correcta', nuevoUsuario, { ...base, num: '810002', mail: 'docente@unistmo.example', role: 'Docente', area: 'Tehuantepec', categoryCode: 'CAT-P', careerCode: 'REF-TEH-04' });
  await caso('usuarios', 'alta rectoría: correcta', nuevoUsuario, { ...base, num: '810003', mail: 'rector@unistmo.example' });
  await caso('usuarios', 'edición: cambio de adscripción sin motivo', editarUsuario(1), { area: 'Tehuantepec' });
  await caso('usuarios', 'edición: cambio de adscripción sin fecha', editarUsuario(1), { area: 'Tehuantepec', movementReason: 'Reasignación', movementDate: '' });
  await caso('usuarios', 'edición: cambio de adscripción con fecha futura', editarUsuario(1), { area: 'Tehuantepec', movementReason: 'Reasignación', movementDate: '2027-01-15' });
  await caso('usuarios', 'edición: quitar la única administración general', editarUsuario(1), { role: 'Rectoría', movementReason: 'Cambio de funciones' });
  await caso('usuarios', 'edición: desactivar la única administración general (sin motivo)', editarUsuario(1), { status: 'Inactivo' });
  await caso('usuarios', 'edición: desactivar la única administración general (con motivo)', editarUsuario(1), { status: 'Inactivo', movementReason: 'Baja temporal' });
  await caso('usuarios', 'edición: cambio de rol sin motivo (jefe de carrera)', editarUsuario(3), { role: 'Docente' });
  await caso('usuarios', 'edición: cambio de rol con motivo (jefe de carrera)', editarUsuario(3), { role: 'Docente', movementReason: 'Cambio de funciones' });
  await caso('usuarios', 'edición: cambio de carrera sin motivo', editarUsuario(2), { careerCode: 'REF-TEH-01' });
  await caso('usuarios', 'edición: cambio de carrera correcto', editarUsuario(2), { careerCode: 'REF-TEH-01', movementReason: 'Reasignación de carrera' });
  await caso('usuarios', 'edición: cambio de adscripción correcto', editarUsuario(1), { area: 'Tehuantepec', movementReason: 'Reasignación', movementDate: '2026-11-02' });
  await cierre('usuarios');

  // ───────────── SOLICITUDES ─────────────
  await reiniciar();
  const sol = { title: 'Ajuste de prueba', type: 'Parámetro / peso', authority: 'Vicerrectoría', schedule: 'Inmediata', evidence: 'Oficio de prueba 1', detail: 'Justificación de prueba',
    targetCatalog: 'parametros', targetId: '1', targetField: 'paramValue', targetValue: '40' };
  await caso('solicitudes', 'alta: sin título', nuevaSolicitud, { ...sol, title: '' });
  await caso('solicitudes', 'alta: valor no numérico', nuevaSolicitud, { ...sol, targetValue: 'abc' });
  await caso('solicitudes', 'alta: siguiente ciclo sin fecha', nuevaSolicitud, { ...sol, schedule: 'Siguiente ciclo', effectiveDate: '' });
  await caso('solicitudes', 'alta: siguiente ciclo con fecha pasada', nuevaSolicitud, { ...sol, schedule: 'Siguiente ciclo', effectiveDate: '2026-10-01' });
  await caso('solicitudes', 'alta: inmediata correcta', nuevaSolicitud, sol);
  await caso('solicitudes', 'alta: siguiente ciclo correcta', nuevaSolicitud, { ...sol, title: 'Ajuste programado', schedule: 'Siguiente ciclo', effectiveDate: '2027-02-01' });
  const instr = (o) => ({ transition: 'Registrar instrucción recibida', authorizationBy: 'Vicerrectoría', authorizationDate: '2026-11-02', authEvidence: 'Oficio VR-001', ...o });
  await caso('solicitudes', 'instrucción: sin referencia', gestionarSolicitud(1), instr({ authEvidence: '' }));
  await caso('solicitudes', 'instrucción: autoridad que no corresponde', gestionarSolicitud(1), instr({ authorizationBy: 'Rectoría' }));
  await caso('solicitudes', 'instrucción: fecha futura', gestionarSolicitud(1), instr({ authorizationDate: '2027-01-01' }));
  await caso('solicitudes', 'instrucción: vigencia anterior a la autorización', gestionarSolicitud(4), instr({ effectiveDate: '2026-10-01' }));
  await caso('solicitudes', 'instrucción: correcta', gestionarSolicitud(1), instr({}));
  await caso('solicitudes', 'devolver para aclaración', gestionarSolicitud(3), { transition: 'Devolver para aclaración' });
  const apl = (o) => ({ transition: 'Marcar como aplicada', appliedAt: '2026-11-02', executionNote: 'Aplicado en prueba', ...o });
  await caso('solicitudes', 'aplicar: sin resultado', gestionarSolicitud(2), apl({ executionNote: '' }));
  await caso('solicitudes', 'aplicar: antes de la autorización', gestionarSolicitud(2), apl({ appliedAt: '2026-09-01' }));
  await caso('solicitudes', 'aplicar: fecha futura', gestionarSolicitud(2), apl({ appliedAt: '2027-01-01' }));
  await caso('solicitudes', 'aplicar: correcta', gestionarSolicitud(2), apl({}));
  await cierre('solicitudes');

  // ───────────── SOLICITUDES · ampliación ─────────────
  // Caminos que guardan sin escribir en la bitácora y la operación programada (Siguiente ciclo).
  // Grupo aparte (misma base, sin reiniciar) para no alterar la huella del grupo anterior.
  await caso('solicitudes-ampliacion', 'mantener pendiente', gestionarSolicitud(4), { transition: 'Mantener pendiente' });
  await caso('solicitudes-ampliacion', 'instrucción siguiente ciclo: correcta', gestionarSolicitud(4), instr({ effectiveDate: '2027-02-01' }));
  await caso('solicitudes-ampliacion', 'mantener autorizada', gestionarSolicitud(4), { transition: 'Mantener autorizada' });
  await caso('solicitudes-ampliacion', 'fecha programada: anterior a la autorización', gestionarSolicitud(4), { transition: 'Guardar fecha programada', effectiveDate: '2026-10-01' });
  await caso('solicitudes-ampliacion', 'fecha programada: correcta', gestionarSolicitud(4), { transition: 'Guardar fecha programada', effectiveDate: '2027-03-01' });
  await caso('solicitudes-ampliacion', 'aplicar siguiente ciclo: antes de la vigencia', gestionarSolicitud(4), apl({}));
  await cierre('solicitudes-ampliacion');

  // ───────────── CATÁLOGOS ─────────────
  await reiniciar();
  const resp = { directAuthority: 'Rectoría', directEvidence: 'Oficio R-001' };
  await caso('catalogos', 'alta campus: sin respaldo', nuevoCatalogo('campus'), { code: 'NUE', name: 'Campus Nuevo' });
  await caso('catalogos', 'alta campus: sin clave', nuevoCatalogo('campus'), { ...resp, name: 'Campus Nuevo' });
  await caso('catalogos', 'alta campus: clave repetida', nuevoCatalogo('campus'), { ...resp, code: 'TEH', name: 'Campus Nuevo' });
  await caso('catalogos', 'alta campus: correcta', nuevoCatalogo('campus'), { ...resp, code: 'NUE', name: 'Campus Nuevo' });
  await caso('catalogos', 'alta carrera: sin relación', nuevoCatalogo('carreras'), { ...resp, code: 'CAR-1', name: 'Carrera Nueva' });
  await caso('catalogos', 'alta carrera: correcta', nuevoCatalogo('carreras'), { ...resp, code: 'CAR-1', name: 'Carrera Nueva', parentCode: 'TEH' });
  await caso('catalogos', 'alta parámetro: correcto', nuevoCatalogo('parametros'), { ...resp, code: 'PAR-1', name: 'Parámetro Nuevo', paramValue: '10' });
  await caso('catalogos', 'alta opción: grupo nuevo sin nombre', nuevoCatalogo('opciones'), { ...resp, code: 'OPC-1', name: 'Opción Nueva', group: '__NEW__', groupCustom: '', appliesTo: 'Ambos' });
  await caso('catalogos', 'alta opción: sin documento', nuevoCatalogo('opciones'), { ...resp, code: 'OPC-1', name: 'Opción Nueva', group: 'Comités', appliesTo: '' });
  await caso('catalogos', 'alta opción: correcta con grupo nuevo', nuevoCatalogo('opciones'), { ...resp, code: 'OPC-1', name: 'Opción Nueva', group: '__NEW__', groupCustom: 'Grupo de prueba', appliesTo: 'Ambos' });
  await caso('catalogos', 'edición campus: cerrar con carreras vigentes', editarCatalogo('campus'), { ...resp, status: 'Histórico' });
  await caso('catalogos', 'edición campus: cambiar clave con relaciones', editarCatalogo('campus'), { ...resp, code: 'TEH2' });
  await caso('catalogos', 'edición campus: correcta', editarCatalogo('campus'), { ...resp, name: 'Tehuantepec Centro' });
  await caso('catalogos', 'edición carrera: cambio de relación sin motivo', editarCatalogo('carreras'), { ...resp, parentCode: 'JUC' });
  await caso('catalogos', 'edición carrera: cambio de relación con fecha futura', editarCatalogo('carreras'), { ...resp, parentCode: 'JUC', movementReason: 'Reubicación', movementDate: '2027-01-15' });
  await caso('catalogos', 'edición carrera: cambio de relación correcto', editarCatalogo('carreras'), { ...resp, parentCode: 'JUC', movementReason: 'Reubicación', movementDate: '2026-11-02' });
  await cierre('catalogos');

  // ───────────── CATÁLOGOS · ampliación ─────────────
  // Nombre repetido en un grupo de opciones, alta con relación (historial) y campos propios de rubros.
  await caso('catalogos-ampliacion', 'alta opción: nombre repetido en el grupo', nuevoCatalogo('opciones'), { ...resp, code: 'OPC-2', name: 'Opción Nueva', group: 'Grupo de prueba', appliesTo: 'Ambos' });
  await caso('catalogos-ampliacion', 'alta plan: correcta', nuevoCatalogo('planes'), { ...resp, code: 'PLAN-1', name: 'Plan Nuevo', parentCode: 'CAR-1' });
  await caso('catalogos-ampliacion', 'edición rubro: secciones del Plan y del Informe', editarCatalogo('rubros'), { ...resp, planSection: 'C. Tutorías', reportSection: 'D. Tutorías' });
  await cierre('catalogos-ampliacion');

  expect(errores, 'errores de consola').toEqual([]);
  expect(JSON.stringify(registro, null, 2)).toMatchSnapshot('reglas-formulario.json');
});
