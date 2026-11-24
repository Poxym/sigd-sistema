// Prueba de la pantalla «Periodos de captura»: validaciones, guardado, historial y bitácora.
// Registra, paso a paso, los avisos que ve la persona y cómo queda la base de datos. Compara TEXTO, no imágenes.
import { test, expect } from '@playwright/test';
import { CLAVE_BD, FECHA_FIJA, enviarAcceso, normalizar } from './ayudantes.mjs';

const CAMPOS = ['cycleName', 'v41Semester', 'v41AcademicStart', 'v41AcademicEnd', 'planStart', 'planEnd', 'planState', 'reportStart', 'reportEnd', 'reportState'];

test('periodos: validaciones, guardado, historial y bitácora', async ({ page }) => {
  const errores = [];
  page.on('pageerror', (e) => errores.push(`pageerror: ${e.message}`));
  page.on('console', (m) => { if (m.type() === 'error') errores.push(`console.error: ${m.text()}`); });
  await page.clock.setFixedTime(FECHA_FIJA);
  await page.goto('/');
  await enviarAcceso(page);
  await expect(page.locator('#app')).toBeVisible();

  const irA = async (t) => { await page.locator('#ni .ni', { hasText: t }).click(); await page.waitForTimeout(200); };
  const bd = async () => JSON.parse(await page.evaluate((k) => localStorage.getItem(k), CLAVE_BD));
  const formulario = async () => Object.fromEntries(await Promise.all(CAMPOS.map(async (c) => [c, await page.locator('#' + c).inputValue()])));
  const texto = async (sel) => normalizar((await page.locator(sel).allInnerTexts()).join(' | ').replace(/\s+/g, ' ').trim());
  const poner = async (c, v) => { const l = page.locator('#' + c); if ((await l.evaluate((e) => e.tagName)) === 'SELECT') await l.selectOption(v === '' ? { index: 0 } : { label: v }); else await l.fill(v); };

  const registro = [];
  const guardar = async (nombre) => {
    await page.locator('#toasts .toast').evaluateAll((els) => els.forEach((e) => e.remove()));
    await page.click('#savePeriods');
    await page.waitForTimeout(250);
    const d = await bd();
    registro.push({
      paso: nombre,
      avisos: (await page.locator('#toasts .toast').allInnerTexts()).map((t) => t.trim()),
      periodo: d.period,
      historial: (d.periodHistory || []).slice(0, 2).map((h) => `${h.cycle} · ${h.summary}`),
      totalHistorial: (d.periodHistory || []).length,
      bitacora: d.audit.slice(0, 2).map((a) => `${a.kind}: ${a.detail} [${a.oldVal} → ${a.newVal}]`),
      formulario: await formulario(),
    });
  };

  await irA('Periodos de captura');
  const inicial = await formulario();
  registro.push({ paso: '0 · estado inicial', formulario: inicial, resumen: await texto('#periodOverviewList'), historial: await texto('#periodHistoryPanel'), insignia: await texto('#cycleBadge') });

  await poner('v41Semester', ''); await guardar('1 · sin semestre');
  await poner('v41Semester', 'A'); await poner('v41AcademicStart', '2026-08-01'); await poner('v41AcademicEnd', ''); await guardar('2 · solo fecha de inicio académica');
  await poner('v41AcademicEnd', '2026-07-01'); await guardar('3 · cierre académico antes del inicio');
  await poner('v41AcademicStart', ''); await poner('v41AcademicEnd', ''); await poner('cycleName', 'abc'); await guardar('4 · identificador de ciclo inválido');
  await poner('cycleName', '2026-2027'); await poner('planStart', '2026-09-01'); await poner('planEnd', '2026-08-01'); await guardar('5 · cierre de captura antes del inicio');
  for (const c of CAMPOS) await poner(c, inicial[c] === '' && c === 'v41Semester' ? 'A' : inicial[c]);
  await poner('v41Semester', inicial.v41Semester === '' ? '' : inicial.v41Semester);
  await guardar('6 · sin cambios (valores iniciales)');

  // Paso 7: al guardar solo la ventana de captura se CONSERVAN el semestre y las fechas académicas
  // (antes de la corrección se borraban: el periodo quedaba sin semester/activityStart/activityEnd).
  await poner('v41Semester', inicial.v41Semester || 'A'); await poner('planEnd', '2027-01-31'); await poner('planState', 'Cerrado'); await guardar('7 · cambia solo ventana de captura');
  await poner('v41Semester', 'B'); await guardar('8 · cambia solo el semestre');
  await poner('planEnd', '2027-02-28'); await poner('v41Semester', 'A'); await poner('v41AcademicStart', '2026-08-10'); await poner('v41AcademicEnd', '2026-12-15'); await guardar('9 · cambia captura y periodo académico a la vez');

  await irA('Inicio'); await irA('Periodos de captura');
  registro.push({ paso: '10 · al volver a la pantalla', formulario: await formulario(), resumen: await texto('#periodOverviewList'), historial: await texto('#periodHistoryPanel'), insignia: await texto('#cycleBadge') });

  expect(errores, 'errores de consola').toEqual([]);
  expect(JSON.stringify(registro, null, 2)).toMatchSnapshot('periodos-registro.json');
});

// Ampliación (aparte, con su propia referencia, para no alterar la de arriba): caminos que la primera prueba no recorre.
// Campo obligatorio vacío (reportValidity), prioridad del aviso del semestre sobre esa revisión, cierre del Informe
// antes de su inicio (la otra mitad del «||») y ciclo con espacios (se recorta al comparar y al guardar).
test('periodos: campos obligatorios, cierre del Informe y ciclo con espacios', async ({ page }) => {
  const errores = [];
  page.on('pageerror', (e) => errores.push(`pageerror: ${e.message}`));
  page.on('console', (m) => { if (m.type() === 'error') errores.push(`console.error: ${m.text()}`); });
  await page.clock.setFixedTime(FECHA_FIJA);
  await page.goto('/');
  await enviarAcceso(page);
  await expect(page.locator('#app')).toBeVisible();

  const irA = async (t) => { await page.locator('#ni .ni', { hasText: t }).click(); await page.waitForTimeout(200); };
  const bd = async () => JSON.parse(await page.evaluate((k) => localStorage.getItem(k), CLAVE_BD));
  const formulario = async () => Object.fromEntries(await Promise.all(CAMPOS.map(async (c) => [c, await page.locator('#' + c).inputValue()])));
  const texto = async (sel) => normalizar((await page.locator(sel).allInnerTexts()).join(' | ').replace(/\s+/g, ' ').trim());
  const poner = async (c, v) => { const l = page.locator('#' + c); if ((await l.evaluate((e) => e.tagName)) === 'SELECT') await l.selectOption(v === '' ? { index: 0 } : { label: v }); else await l.fill(v); };

  const registro = [];
  const guardar = async (nombre) => {
    await page.locator('#toasts .toast').evaluateAll((els) => els.forEach((e) => e.remove()));
    const antes = JSON.stringify(await bd());
    await page.click('#savePeriods');
    await page.waitForTimeout(250);
    const d = await bd();
    registro.push({
      paso: nombre,
      avisos: (await page.locator('#toasts .toast').allInnerTexts()).map((t) => t.trim()),
      seGuardoAlgo: JSON.stringify(d) !== antes,
      camposInvalidos: await page.locator('#periodForm :invalid').evaluateAll((els) => els.map((e) => e.id)),
      periodo: d.period,
      historial: (d.periodHistory || []).slice(0, 2).map((h) => `${h.cycle} · ${h.summary}`),
      bitacora: d.audit.slice(0, 2).map((a) => `${a.kind}: ${a.detail} [${a.oldVal} → ${a.newVal}]`),
      formulario: await formulario(),
    });
  };

  await irA('Periodos de captura');
  const inicial = await formulario();
  const restaurar = async () => { for (const c of CAMPOS) await poner(c, inicial[c]); };

  await poner('planStart', ''); await guardar('A1 · inicio del Plan vacío');
  await poner('v41Semester', ''); await guardar('A2 · inicio del Plan vacío y sin semestre');
  await restaurar();
  await poner('reportStart', '2026-12-01'); await poner('reportEnd', '2026-11-01'); await guardar('A3 · cierre del Informe antes de su inicio');
  await restaurar();
  await poner('cycleName', `  ${inicial.cycleName}  `); await guardar('A4 · mismo ciclo con espacios');
  await poner('cycleName', '  2026-2028 '); await guardar('A5 · ciclo nuevo con espacios');
  registro.push({ paso: 'A6 · pantalla tras guardar', resumen: await texto('#periodOverviewList'), historial: await texto('#periodHistoryPanel'), insignia: await texto('#cycleBadge') });

  expect(errores, 'errores de consola').toEqual([]);
  expect(JSON.stringify(registro, null, 2)).toMatchSnapshot('periodos-ampliacion.json');
});
