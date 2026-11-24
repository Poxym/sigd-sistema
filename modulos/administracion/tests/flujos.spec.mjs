// Prueba de ESCRITURA: crea usuarios, una solicitud, un registro de catálogo y guarda periodos,
// y compara la base de datos resultante (localStorage) con la guardada.
// Las capturas solo prueban cómo se ve el sistema; esta prueba detecta si se rompió la lógica de guardado.
import { test, expect } from '@playwright/test';
import { CLAVE_BD, FECHA_FIJA, enviarAcceso } from './ayudantes.mjs';

const VISTAS = { inicio: 'Inicio', solicitudes: 'Solicitudes de cambio', catalogos: 'Catálogos académicos',
  usuarios: 'Usuarios y permisos', periodos: 'Periodos de captura', bitacora: 'Bitácora' };

async function irA(page, vista) {
  await page.locator('#ni .ni', { hasText: VISTAS[vista] }).click();
  await page.waitForTimeout(150);
}

// Llena todos los campos del diálogo con valores fijos y predecibles
async function llenarDialogo(page, texto) {
  const campos = page.locator('#editorForm [name]');
  const n = await campos.count();
  for (let i = 0; i < n; i++) {
    const c = campos.nth(i);
    if (!(await c.isVisible())) continue;
    const tipo = await c.evaluate((el) => (el.tagName === 'SELECT' ? 'select' : el.tagName === 'TEXTAREA' ? 'textarea' : el.type));
    const nombre = await c.getAttribute('name');
    if (tipo === 'select') {
      const valor = await c.inputValue();
      if (!valor) { const op = await c.locator('option').evaluateAll((os) => os.map((o) => o.value).filter(Boolean)); if (op.length) await c.selectOption(op[0]); }
    } else if (tipo === 'email') await c.fill(`${texto}@unistmo.example`);
    else if (tipo === 'date') await c.fill('2026-12-01');
    else if (tipo === 'number') await c.fill('5');
    else if (tipo === 'checkbox' || tipo === 'radio' || tipo === 'hidden') continue;
    else if (tipo === 'textarea') await c.fill(`Texto de prueba ${texto}`);
    else if ((await c.inputValue()) === '') await c.fill(nombre === 'num' ? texto.replace(/\D/g, '').padStart(6, '9') : `Prueba ${texto}`);
  }
}

async function guardarDialogo(page) {
  await page.locator('#editorForm button[type="submit"]').first().click();
  await page.waitForTimeout(250);
  // si el diálogo no se cerró hubo una validación; se cierra para seguir
  if (await page.locator('#editor[open]').count()) await page.keyboard.press('Escape');
  await page.waitForTimeout(150);
}

test('flujo de escritura: usuarios, solicitud, catálogo y periodos', async ({ page }) => {
  const errores = [];
  const avisos = [];
  page.on('pageerror', (e) => errores.push(`pageerror: ${e.message}`));
  page.on('console', (m) => { if (m.type() === 'error') errores.push(`console.error: ${m.text()}`); });
  await page.clock.setFixedTime(FECHA_FIJA);
  await page.goto('/');
  await enviarAcceso(page);
  await expect(page.locator('#app')).toBeVisible();

  // 1) Un usuario por cada rol (recorre los parches de roles y asignaciones)
  await irA(page, 'usuarios');
  await page.locator('#newUser').click();
  const roles = await page.locator('#editorForm [name="role"] option').evaluateAll((os) => os.map((o) => o.value));
  await page.keyboard.press('Escape');
  for (const [i, rol] of roles.entries()) {
    await page.locator('#newUser').click();
    await llenarDialogo(page, `usr${i}`);
    await page.locator('#editorForm [name="role"]').selectOption(rol);
    await page.waitForTimeout(100);
    await llenarDialogo(page, `usr${i}`);
    await guardarDialogo(page);
  }
  // editar el primer usuario de la lista (cambio de rol deja historial)
  const editar = page.locator('#view-usuarios [data-edit-user], #view-usuarios button:has-text("Editar")').first();
  if (await editar.count()) { await editar.click(); await llenarDialogo(page, 'edit'); await guardarDialogo(page); }

  // 2) Solicitud de cambio
  await irA(page, 'solicitudes');
  await page.locator('#newRequest').click();
  await llenarDialogo(page, 'sol1');
  await guardarDialogo(page);

  // 3) Registro nuevo en cada tipo de catálogo disponible
  await irA(page, 'catalogos');
  await page.locator('#newCatalog').click();
  await llenarDialogo(page, 'cat1');
  await guardarDialogo(page);

  // 4) Periodos de captura
  await irA(page, 'periodos');
  await page.locator('#savePeriods').click();
  await page.waitForTimeout(250);
  if (await page.locator('#editor[open]').count()) { await llenarDialogo(page, 'per'); await guardarDialogo(page); }

  // 5) Bitácora: filtrar y buscar (lectura)
  await irA(page, 'bitacora');
  await page.locator('#auditSearch').fill('Usuario');
  await page.waitForTimeout(150);

  const bd = await page.evaluate((k) => localStorage.getItem(k), CLAVE_BD);
  const datos = JSON.parse(bd);
  // Resumen legible para ver de un vistazo qué cambió
  const resumen = {
    usuarios: datos.users.length, solicitudes: datos.requests.length, bitacora: datos.audit.length,
    catalogos: Object.fromEntries(Object.entries(datos.catalogs).map(([k, v]) => [k, v.length])),
    ultimasAcciones: datos.audit.slice(0, 12).map((a) => `${a.kind}: ${a.detail}`),
  };
  expect(errores, 'errores de consola').toEqual([]);
  expect(JSON.stringify(resumen, null, 2)).toMatchSnapshot('flujo-resumen.json');
  expect(JSON.stringify(datos, null, 2)).toMatchSnapshot('flujo-bd-completa.json');
});
