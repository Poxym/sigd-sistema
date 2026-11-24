// Prueba de las ADSCRIPCIONES INSTITUCIONALES que ofrece y acepta el diálogo de Usuarios.
// Un sabotaje (ofrecer cualquier institución vigente, no solo Rectoría y Vicerrectoría) no hizo fallar ninguna prueba:
// la semilla solo trae la Universidad, Rectoría y Vicerrectoría Académica. Aquí se dan de alta en Catálogos una
// «Dirección de Planeación» (vigente) y una «Vicerrectoría Administrativa» (histórica) y se anotan las adscripciones
// del diálogo y qué responde el guardado si se fuerza cada una. Compara TEXTO, no imágenes.
import { test, expect } from '@playwright/test';
import { FECHA_FIJA, enviarAcceso } from './ayudantes.mjs';

test('usuarios: adscripciones institucionales que se ofrecen y se aceptan', async ({ page }) => {
  test.setTimeout(120000);
  const errores = [];
  page.on('pageerror', (e) => errores.push(`pageerror: ${e.message}`));
  page.on('console', (m) => { if (m.type() === 'error') errores.push(`console.error: ${m.text()}`); });
  await page.clock.setFixedTime(FECHA_FIJA);
  await page.goto('/'); await page.evaluate(() => localStorage.clear()); await page.goto('/');
  await enviarAcceso(page);
  await expect(page.locator('#app')).toBeVisible();
  await page.waitForTimeout(200);

  const irA = async (t) => { await page.locator('#ni .ni', { hasText: t }).click(); await page.waitForTimeout(150); };
  const cerrar = async () => { if (await page.locator('#editor[open]').count()) { await page.keyboard.press('Escape'); await page.waitForTimeout(100); } };
  const llenar = (campos, forzar = false) => page.locator('#editorForm').evaluate((form, [campos, forzar]) => {
    for (const [n, v] of Object.entries(campos)) {
      const el = form.elements[n];
      if (forzar && el.tagName === 'SELECT' && ![...el.options].some((o) => o.value === v)) { const o = document.createElement('option'); o.value = v; o.textContent = v; el.append(o); }
      el.value = v;
      if (!forzar) { el.dispatchEvent(new Event('input', { bubbles: true })); el.dispatchEvent(new Event('change', { bubbles: true })); }
      if (el.value !== v) throw new Error(`El campo ${n} no acepta «${v}»`);
    }
  }, [campos, forzar]);
  const enviar = async () => {
    await page.locator('#toasts .toast').evaluateAll((els) => els.forEach((e) => e.remove()));
    await page.locator('#editorForm').evaluate((f) => { f.noValidate = true; f.requestSubmit(); });
    await page.waitForTimeout(250);
    return (await page.locator('#toasts .toast').allInnerTexts()).map((t) => t.replace(/\s+/g, ' ').trim());
  };
  const resp = { directAuthority: 'Rectoría', directEvidence: 'Oficio R-001' };
  const institucion = async (campos) => {
    await irA('Catálogos'); await page.locator('[data-cx-type="institucion"]').click(); await page.locator('#newCatalog').click(); await page.waitForTimeout(150);
    await llenar({ ...resp, ...campos });
    return enviar();
  };

  const registro = {};
  registro['alta de «Dirección de Planeación»'] = await institucion({ code: 'DPL', name: 'Dirección de Planeación' });
  registro['alta de «Vicerrectoría Administrativa» (histórica)'] = await institucion({ code: 'VAD', name: 'Vicerrectoría Administrativa', status: 'Histórico' });

  const nuevo = async () => { await cerrar(); await irA('Usuarios'); await page.locator('#newUser').click(); await page.waitForTimeout(150); };
  await nuevo();
  registro['adscripciones del diálogo'] = await page.locator('#modalContent [name=area] option').evaluateAll((os) => os.map((o) => `${o.value}=${o.textContent.trim()}`));
  const cuenta = { num: '940001', name: 'Cuenta Forzada', mail: 'forzada@unistmo.example', role: 'Rectoría' };
  for (const area of ['Dirección de Planeación', 'Vicerrectoría Administrativa', 'Vicerrectoría Académica']) {
    await nuevo();
    await llenar(cuenta);
    await llenar({ area }, true);
    registro[`guardar con «${area}»`] = await enviar();
  }
  await cerrar();

  expect(errores, 'errores de consola').toEqual([]);
  expect(JSON.stringify(registro, null, 2)).toMatchSnapshot('usuarios-adscripcion-institucion.json');
});
