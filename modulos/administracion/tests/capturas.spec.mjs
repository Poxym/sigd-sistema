// Recorre el módulo Administración y compara cada pantalla con su captura de referencia.
// Si mueves código y una pantalla cambia de aspecto, la prueba falla y te muestra la diferencia.
import { test, expect } from '@playwright/test';
import { FECHA_FIJA, enviarAcceso } from './ayudantes.mjs';

// [nombre del archivo, texto del botón del menú lateral]
const VISTAS = [
  ['inicio', 'Inicio'],
  ['solicitudes', 'Solicitudes de cambio'],
  ['catalogos', 'Catálogos académicos'],
  ['usuarios', 'Usuarios y permisos'],
  ['periodos', 'Periodos de captura'],
  ['bitacora', 'Bitácora'],
];

const PANTALLAS = [
  { nombre: 'escritorio', ancho: 1440, alto: 900 },
  { nombre: 'movil', ancho: 390, alto: 844 },
];

async function prepararPagina(page) {
  const errores = [];
  page.on('pageerror', (e) => errores.push(`pageerror: ${e.message}`));
  page.on('console', (m) => { if (m.type() === 'error') errores.push(`console.error: ${m.text()}`); });
  await page.clock.setFixedTime(FECHA_FIJA);
  await page.goto('/');
  await page.evaluate(() => document.fonts.ready);
  return errores;
}

async function entrar(page) {
  await enviarAcceso(page);
  await expect(page.locator('#app')).toBeVisible();
}

async function irA(page, textoMenu) {
  // En pantalla angosta el menú está oculto detrás del botón de hamburguesa
  const hamburguesa = page.locator('#menu');
  if (await hamburguesa.isVisible()) await hamburguesa.click();
  await page.locator('#ni .ni', { hasText: textoMenu }).click();
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(300); // deja que termine de pintar la vista
}

for (const pantalla of PANTALLAS) {
  test.describe(`Pantalla ${pantalla.nombre} (${pantalla.ancho}px)`, () => {
    test.use({ viewport: { width: pantalla.ancho, height: pantalla.alto } });

    test('acceso (login)', async ({ page }) => {
      const errores = await prepararPagina(page);
      await expect(page).toHaveScreenshot(`${pantalla.nombre}-00-acceso.png`, { fullPage: true });
      expect(errores, 'errores de consola').toEqual([]);
    });

    test('recorrido por las seis vistas', async ({ page }) => {
      const errores = await prepararPagina(page);
      await entrar(page);
      for (const [archivo, textoMenu] of VISTAS) {
        await irA(page, textoMenu);
        await expect(page).toHaveScreenshot(`${pantalla.nombre}-${archivo}.png`, { fullPage: true });
      }
      expect(errores, 'errores de consola').toEqual([]);
    });
  });
}
