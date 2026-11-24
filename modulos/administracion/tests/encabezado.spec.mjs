// Separación del encabezado de cada pantalla (fila 13 de la sección 10 del Documento maestro).
// En src/styles/admin.css, una llave «}» suelta (desde la línea base) hace que el navegador descarte la regla
// siguiente, «.nxb .heading{gap:8px 12px!important}». Esta prueba registra la separación (gap) que el navegador
// aplica de verdad al encabezado (.heading) de las seis pantallas, a 1440, 1024, 768 y 390 px de ancho.
// Compara TEXTO (no imágenes): estilos calculados, que no dependen de las fuentes del sistema.
import { test, expect } from '@playwright/test';
import { FECHA_FIJA, enviarAcceso } from './ayudantes.mjs';

const VISTAS = ['Inicio', 'Solicitudes de cambio', 'Catálogos académicos', 'Usuarios y permisos', 'Periodos de captura', 'Bitácora'];
const ANCHOS = [1440, 1024, 768, 390];

async function entrar(page) {
  await page.clock.setFixedTime(FECHA_FIJA);
  await page.goto('/');
  await page.evaluate(() => localStorage.clear());
  await page.goto('/');
  await enviarAcceso(page);
  await expect(page.locator('#app')).toBeVisible();
}

test('encabezado: separación entre el título y los botones de cada pantalla', async ({ page }) => {
  test.setTimeout(120000);
  const registro = {};
  for (const ancho of ANCHOS) {
    await page.setViewportSize({ width: ancho, height: 900 });
    await entrar(page);
    for (const vista of VISTAS) {
      // En pantalla angosta el menú está oculto detrás del botón de hamburguesa (como en capturas)
      const hamburguesa = page.locator('#menu');
      if (await hamburguesa.isVisible()) await hamburguesa.click();
      await page.locator('#ni .ni', { hasText: vista }).click();
      await page.waitForTimeout(150);
      const encabezado = page.locator('.view.active > .heading');
      await expect(encabezado).toHaveCount(1);
      registro[`${ancho}px · ${vista}`] = await encabezado.evaluate((e) => {
        const s = getComputedStyle(e);
        return { display: s.display, flexDirection: s.flexDirection, flexWrap: s.flexWrap, rowGap: s.rowGap, columnGap: s.columnGap };
      });
    }
  }
  expect(JSON.stringify(registro, null, 2)).toMatchSnapshot('encabezado.json');
});
