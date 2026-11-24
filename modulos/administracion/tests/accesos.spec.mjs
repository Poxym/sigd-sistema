// Prueba del indicador «Accesos hoy» de Inicio: qué pasa con cada inicio de sesión.
// Recorre logins correctos, uno fallido, salir y volver a entrar, otra cuenta, entrar con el correo, recargar la
// página, accesos de ayer guardados y un login a las 20:00 (cuando en hora universal ya es el día siguiente).
// En cada paso registra lo que muestra el indicador y lo que quedó guardado. Compara TEXTO, no imágenes.
// Regla (Documento maestro, sección 6 «Accesos»): cuenta cada inicio de sesión correcto del día en hora local;
// los fallidos no cuentan; un registro por cuenta y por día.
import { test, expect } from '@playwright/test';
import { CLAVE_BD, FECHA_FIJA, enviarAcceso } from './ayudantes.mjs';

test('accesos: inicios de sesión y el indicador «Accesos hoy»', async ({ page }) => {
  const errores = [];
  page.on('pageerror', (e) => errores.push(`pageerror: ${e.message}`));
  page.on('console', (m) => { if (m.type() === 'error') errores.push(`console.error: ${m.text()}`); });
  await page.clock.setFixedTime(FECHA_FIJA);

  const bd = async () => JSON.parse(await page.evaluate((k) => localStorage.getItem(k), CLAVE_BD));
  const entrar = async (usuario, clave = 'Unistmo#2026') => {
    await enviarAcceso(page, usuario, clave);
    await page.waitForTimeout(250);
  };
  const salir = async () => { await page.locator('#out').evaluate((b) => b.click()); await page.waitForTimeout(150); };
  const registro = [];
  const anotar = async (paso) => {
    const dentro = await page.locator('#app').isVisible();
    const indicador = dentro
      ? (await page.locator('#homeSummaryGrid .home-indicator', { hasText: 'Accesos hoy' }).innerText()).replace(/\s+/g, ' ').trim()
      : '(pantalla de acceso)';
    registro.push({ paso, indicador, guardado: (await bd())?.demoAccessEvents ?? '(sin base guardada)' });
  };

  await page.goto('/');
  await page.evaluate(() => localStorage.clear());
  await page.goto('/');

  await entrar('001'); await anotar('1 · primer login (001)');
  await salir(); await entrar('001'); await anotar('2 · salir y volver a entrar (001)');
  await salir(); await entrar('000'); await anotar('3 · otra cuenta (000)');
  await salir(); await entrar('001', 'incorrecta'); await anotar('4 · contraseña incorrecta (001)');
  await entrar('001'); await anotar('5 · login correcto después del fallido (001)');
  await salir(); await entrar('administracion@unistmo.example'); await anotar('6 · entra con el correo de 001');
  await page.goto('/'); await entrar('001'); await anotar('7 · después de recargar la página (001)');

  // Accesos de ayer guardados: no cuentan hoy.
  await page.evaluate((k) => {
    const d = JSON.parse(localStorage.getItem(k));
    d.demoAccessEvents = [{ source: 'login', day: '2026-11-01', account: '001', count: 4 }, ...(d.demoAccessEvents || [])];
    localStorage.setItem(k, JSON.stringify(d));
  }, CLAVE_BD);
  await page.goto('/'); await entrar('000'); await anotar('8 · con 4 accesos de ayer guardados (000)');

  // 20:00 en el centro de México = 02:00 del día siguiente en hora universal: debe contar como hoy.
  await page.clock.setFixedTime(new Date('2026-11-02T20:00:00-06:00'));
  await salir(); await entrar('001'); await anotar('9 · a las 20:00 hora local (001)');

  expect(errores, 'errores de consola').toEqual([]);
  expect(JSON.stringify(registro, null, 2)).toMatchSnapshot('accesos-registro.json');
});
