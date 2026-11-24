// Prueba del selector de padre en el diálogo de Catálogos cuando el padre actual es HISTÓRICO.
// Un sabotaje (quitar la etiqueta «(histórico)») no hizo fallar ninguna prueba: ninguna abría una materia del plan
// 2016. Aquí se anotan las opciones del selector al editar esa materia (el plan histórico se conserva y se marca) y al
// dar de alta una nueva (solo se ofrecen planes vigentes). Compara TEXTO, no imágenes.
import { test, expect } from '@playwright/test';
import { FECHA_FIJA, enviarAcceso } from './ayudantes.mjs';

test('catálogos: selector de padre con un padre histórico', async ({ page }) => {
  const errores = [];
  page.on('pageerror', (e) => errores.push(`pageerror: ${e.message}`));
  page.on('console', (m) => { if (m.type() === 'error') errores.push(`console.error: ${m.text()}`); });
  await page.clock.setFixedTime(FECHA_FIJA);
  await page.goto('/'); await page.evaluate(() => localStorage.clear()); await page.goto('/');
  await enviarAcceso(page);
  await expect(page.locator('#app')).toBeVisible();
  await page.waitForTimeout(200);

  const opciones = () => page.locator('#modalContent [name=parentCode] option').evaluateAll((os) => os.map((o) => `${o.value}=${o.textContent.trim()}${o.selected ? ' ✓' : ''}`));
  const cerrar = async () => { await page.keyboard.press('Escape'); await page.waitForTimeout(100); };
  await page.locator('#ni .ni', { hasText: 'Catálogos' }).click(); await page.waitForTimeout(150);
  await page.locator('[data-cx-type="materias"]').click(); await page.waitForTimeout(100);

  const registro = {};
  await page.locator('#cxList [data-edit-cat="1"]').click(); await page.waitForTimeout(150);
  registro['editar materia del plan 2016 (histórico)'] = await opciones();
  await cerrar();
  await page.locator('#newCatalog').click(); await page.waitForTimeout(150);
  registro['nueva materia'] = await opciones();
  await cerrar();

  expect(errores, 'errores de consola').toEqual([]);
  expect(JSON.stringify(registro, null, 2)).toMatchSnapshot('catalogos-padre-historico.json');
});
