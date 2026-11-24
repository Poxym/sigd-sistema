// Prueba de la pantalla Bitácora: búsqueda, filtro por chips y exportación a CSV.
// Compara TEXTO (filas visibles y archivo CSV), no imágenes, así que funciona igual en cualquier sistema operativo.
import { test, expect } from '@playwright/test';
import { CLAVE_BD, FECHA_FIJA, enviarAcceso, normalizar } from './ayudantes.mjs';
import fs from 'node:fs';

test('bitácora: búsqueda, filtro por chips y exportación CSV', async ({ page }) => {
  const errores = [];
  page.on('pageerror', (e) => errores.push(`pageerror: ${e.message}`));
  page.on('console', (m) => { if (m.type() === 'error') errores.push(`console.error: ${m.text()}`); });
  await page.clock.setFixedTime(FECHA_FIJA);
  await page.goto('/');
  await enviarAcceso(page);
  await expect(page.locator('#app')).toBeVisible();
  await page.locator('#ni .ni', { hasText: 'Bitácora' }).click();
  await page.waitForTimeout(200);

  const filas = async () => (await page.locator('#auditRows tr').allInnerTexts()).map((t) => normalizar(t.replace(/\s+/g, ' ').trim()));
  const instantaneas = {};

  instantaneas.inicial = await filas();

  await page.fill('#auditSearch', 'plan');
  await page.waitForTimeout(150);
  instantaneas.busquedaPlan = await filas();

  await page.fill('#auditSearch', 'zzz-no-existe');
  await page.waitForTimeout(150);
  instantaneas.busquedaSinResultados = await filas();

  await page.fill('#auditSearch', '');
  const chips = await page.locator('#auditFilterChips button').allInnerTexts();
  instantaneas.chipsDisponibles = chips.map((t) => t.trim());
  for (const nombre of ['Usuario', 'Solicitud', 'Catálogo']) {
    await page.locator('#auditFilterChips button', { hasText: nombre }).first().click();
    await page.waitForTimeout(150);
    instantaneas[`filtro${nombre}`] = await filas();
  }
  await page.locator('#auditFilterChips button').first().click(); // «Todas las acciones»
  await page.waitForTimeout(150);
  instantaneas.despuesDeQuitarFiltro = (await filas()).length;

  const [descarga] = await Promise.all([page.waitForEvent('download'), page.click('#exportAudit')]);
  expect(descarga.suggestedFilename()).toBe('bitacora-administracion.csv');
  const csv = normalizar(fs.readFileSync(await descarga.path(), 'utf8'));

  expect(errores, 'errores de consola').toEqual([]);
  expect(JSON.stringify(instantaneas, null, 2)).toMatchSnapshot('bitacora-filas.json');
  expect(csv).toMatchSnapshot('bitacora-exportacion.csv');
});

// Ampliación (aparte, con su propia referencia, para no alterar las de arriba): búsqueda en «Antes»/«Después»,
// búsqueda combinada con filtro, mayúsculas y acentos, una entrada con comillas, comas, HTML y valores vacíos
// (pantalla y CSV) y la bitácora vacía.
test('bitácora: búsqueda en antes/después, combinada, mayúsculas, CSV con caracteres especiales y vacía', async ({ page }) => {
  const errores = [];
  page.on('pageerror', (e) => errores.push(`pageerror: ${e.message}`));
  page.on('console', (m) => { if (m.type() === 'error') errores.push(`console.error: ${m.text()}`); });
  await page.clock.setFixedTime(FECHA_FIJA);

  const entrar = async () => {
    await enviarAcceso(page);
    await expect(page.locator('#app')).toBeVisible();
    await page.locator('#ni .ni', { hasText: 'Bitácora' }).click();
    await page.waitForTimeout(200);
  };
  const arrancarCon = async (base) => {
    await page.evaluate(([k, v]) => { localStorage.clear(); localStorage.setItem(k, v); }, [CLAVE_BD, JSON.stringify(base)]);
    await page.goto('/'); await entrar();
  };
  const filas = async () => (await page.locator('#auditRows tr').allInnerTexts()).map((t) => normalizar(t.replace(/\s+/g, ' ').trim()));
  const buscar = async (t) => { await page.fill('#auditSearch', t); await page.waitForTimeout(150); return filas(); };
  const r = {};

  await page.goto('/');
  await page.evaluate(() => localStorage.clear());
  await page.goto('/');
  await entrar();
  const semilla = JSON.parse(await page.evaluate((k) => localStorage.getItem(k), CLAVE_BD));

  r['B1 · solo coincide en «Después» (IC-2024)'] = await buscar('IC-2024');
  r['B1 · solo coincide en «Antes» (Sin fechas)'] = await buscar('Sin fechas');
  await buscar('plan');
  await page.locator('#auditFilterChips button', { hasText: 'Catálogo' }).first().click();
  await page.waitForTimeout(150);
  r['B2 · «plan» y chip Catálogo'] = await filas();
  await page.locator('#auditFilterChips button').first().click();
  await page.waitForTimeout(150);
  r['B3 · CATÁLOGO en mayúsculas'] = (await buscar('CATÁLOGO')).length;
  r['B3 · catalogo sin acento'] = (await buscar('catalogo')).length;
  r['B3 · espacios alrededor'] = (await buscar('  plan  ')).length;

  // B4: entradas con caracteres especiales, escritas antes de arrancar.
  const especial = structuredClone(semilla);
  especial.audit.unshift(
    { id: 98, date: '2026-11-01T10:00:00', user: 'Administrador general', kind: 'Periodo', detail: 'Solo valor anterior', oldVal: 'Antes', newVal: '' },
    { id: 99, date: '2026-11-01T09:15:00', user: 'Usuario "de prueba"', kind: 'Catálogo', detail: 'Dice "hola", y más; <b>negrita</b>', oldVal: null, newVal: 'Después, con coma' },
  );
  await arrancarCon(especial);
  await page.locator('#toasts .toast').evaluateAll((els) => els.forEach((e) => e.remove()));
  const [descarga] = await Promise.all([page.waitForEvent('download'), page.click('#exportAudit')]);
  const bytes = fs.readFileSync(await descarga.path());
  const csv = normalizar(bytes.toString('utf8'));
  r['B4 · caracteres especiales'] = {
    filas: (await filas()).slice(0, 2),
    htmlDeLasFilas: normalizar(await page.locator('#auditRows tr').evaluateAll((trs) => trs.slice(0, 2).map((tr) => tr.innerHTML).join('\n'))),
    archivo: descarga.suggestedFilename(),
    empiezaConBOM: bytes[0] === 0xef && bytes[1] === 0xbb && bytes[2] === 0xbf,
    separadorDeLineas: csv.includes('\r\n') ? 'CRLF' : 'LF',
    primerasLineasDelCSV: csv.split('\r\n').slice(0, 3),
    totalDeLineas: csv.split('\r\n').length,
    avisos: (await page.locator('#toasts .toast').allInnerTexts()).map((t) => t.trim()),
  };

  // B5: bitácora vacía.
  const vacia = structuredClone(semilla); vacia.audit = [];
  await arrancarCon(vacia);
  r['B5 · bitácora vacía'] = await filas();

  expect(errores, 'errores de consola').toEqual([]);
  expect(JSON.stringify(r, null, 2)).toMatchSnapshot('bitacora-ampliacion.json');
});
