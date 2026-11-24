// Prueba de FECHAS DE CALENDARIO de noche (hora del centro de México).
// A las 20:00 del 2 de noviembre, en UTC ya es el 3 de noviembre. Esta prueba registra:
//  1) qué fecha traen por defecto los campos de fecha al abrir cada formulario, y
//  2) si se acepta como «no futura» la fecha de mañana en movimientos, autorizaciones y ejecuciones,
//     con un control usando la fecha de hoy.
// Compara TEXTO (fechas, avisos y bitácora), no imágenes.
import { test, expect } from '@playwright/test';
import { CLAVE_BD, enviarAcceso } from './ayudantes.mjs';

const NOCHE = new Date('2026-11-02T20:00:00-06:00'); // 2026-11-03 02:00 en UTC
const HOY = '2026-11-02', MANANA = '2026-11-03';

test('fechas de noche: valores por defecto y fechas futuras', async ({ page }) => {
  test.setTimeout(180000);
  const errores = [];
  page.on('pageerror', (e) => errores.push(`pageerror: ${e.message}`));
  page.on('console', (m) => { if (m.type() === 'error') errores.push(`console.error: ${m.text()}`); });
  await page.clock.setFixedTime(NOCHE);

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
  const leer = (campo) => page.locator('#editorForm').evaluate((form, n) => {
    const el = form.elements[n]; if (!el) throw new Error('No existe el campo ' + n); return el.value;
  }, campo);
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

  const editarUsuario = (id) => async () => { await irA('Usuarios'); await page.locator(`#view-usuarios [data-user="${id}"]`).click(); };
  const gestionarSolicitud = (id) => async () => { await irA('Solicitudes'); await page.locator(`#requestRows [data-rq="${id}"]`).click(); await page.locator('#requestDetail [data-rq-open]').click(); };
  const editarCatalogo = (tipo) => async () => { await irA('Catálogos'); await page.locator(`[data-cx-type="${tipo}"]`).click(); await page.locator('[data-edit-cat]').first().click(); };

  const registro = { valoresPorDefecto: {}, casos: {} };

  // ───────────── 1) Valores por defecto de los campos de fecha ─────────────
  await reiniciar();
  const porDefecto = async (nombre, abrir, campo) => {
    await cerrar(); await abrir(); await page.waitForTimeout(100);
    registro.valoresPorDefecto[nombre] = await leer(campo);
    await cerrar();
  };
  await porDefecto('usuario · fecha efectiva del movimiento', editarUsuario(1), 'movementDate');
  await porDefecto('carrera · fecha efectiva del traslado', editarCatalogo('carreras'), 'movementDate');
  await porDefecto('solicitud pendiente · fecha de autorización', gestionarSolicitud(1), 'authorizationDate');
  await porDefecto('solicitud autorizada · fecha de ejecución', gestionarSolicitud(2), 'appliedAt');

  // ───────────── 2) Fecha de mañana vs. fecha de hoy ─────────────
  // Cada caso empieza con la base reiniciada, para que un caso aceptado no cambie el siguiente.
  const caso = async (nombre, abrir, campos) => {
    await reiniciar();
    await abrir(); await page.waitForTimeout(100);
    await poner(campos);
    const antes = await bd();
    await page.locator('#toasts .toast').evaluateAll((els) => els.forEach((e) => e.remove()));
    await page.locator('#editorForm').evaluate((f) => { f.noValidate = true; f.requestSubmit(); });
    await page.waitForTimeout(250);
    const despues = await bd();
    const avisos = (await page.locator('#toasts .toast').allInnerTexts()).map((t) => t.replace(/\s+/g, ' ').trim());
    const guardo = (await page.locator('#editor[open]').count()) === 0;
    const nuevos = despues.audit.slice(0, despues.audit.length - antes.audit.length).map((a) => `${a.kind} · ${a.detail}${a.oldVal || a.newVal ? ` (${a.oldVal} → ${a.newVal})` : ''}`);
    registro.casos[nombre] = { avisos, dialogoCerrado: guardo, bitacoraNueva: nuevos };
    await cerrar();
  };
  const resp = { directAuthority: 'Rectoría', directEvidence: 'Oficio R-001' };
  for (const [cuando, fecha] of [['mañana', MANANA], ['hoy', HOY]]) {
    await caso(`usuario · cambio de adscripción con fecha de ${cuando}`, editarUsuario(1), { area: 'Tehuantepec', movementReason: 'Reasignación', movementDate: fecha });
    await caso(`carrera · cambio de relación con fecha de ${cuando}`, editarCatalogo('carreras'), { ...resp, parentCode: 'JUC', movementReason: 'Reubicación', movementDate: fecha });
    await caso(`solicitud · instrucción con fecha de ${cuando}`, gestionarSolicitud(1), { transition: 'Registrar instrucción recibida', authorizationBy: 'Vicerrectoría', authorizationDate: fecha, authEvidence: 'Oficio VR-001' });
    await caso(`solicitud · aplicación con fecha de ${cuando}`, gestionarSolicitud(2), { transition: 'Marcar como aplicada', appliedAt: fecha, executionNote: 'Aplicado en prueba' });
  }

  expect(errores, 'errores de consola').toEqual([]);
  expect(JSON.stringify(registro, null, 2)).toMatchSnapshot('fechas-hora-local.json');
});
