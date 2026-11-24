// Prueba de la pantalla «Inicio» (panel de administración): indicadores, pendientes, periodos y accesos de los botones.
// Compara TEXTO (no imágenes) en tres escenarios: datos de ejemplo, datos modificados y sin solicitudes.
import { test, expect } from '@playwright/test';
import { CLAVE_BD, FECHA_FIJA, enviarAcceso, normalizar } from './ayudantes.mjs';

test('inicio: indicadores, pendientes, periodos y botones', async ({ page }) => {
  const errores = [];
  page.on('pageerror', (e) => errores.push(`pageerror: ${e.message}`));
  page.on('console', (m) => { if (m.type() === 'error') errores.push(`console.error: ${m.text()}`); });
  await page.clock.setFixedTime(FECHA_FIJA);

  const entrar = async () => {
    await page.goto('/');
    await enviarAcceso(page);
    await expect(page.locator('#app')).toBeVisible();
    await page.waitForTimeout(250);
  };
  const texto = async (sel) => normalizar((await page.locator(sel).allInnerTexts()).join(' | ').replace(/\s+/g, ' ').trim());
  const pantalla = async () => ({
    subtitulo: await texto('#homeCycleText'),
    indicadores: await texto('#homeSummaryGrid .home-indicator'),
    pendientes: await texto('#homeTasks'),
    cicloPeriodos: await texto('#homePeriodCycle'),
    periodos: await texto('#homePeriodList'),
  });
  const modificarBd = async (fn) => {
    await page.evaluate(([k, cuerpo]) => {
      const d = JSON.parse(localStorage.getItem(k));
      new Function('d', cuerpo)(d);
      localStorage.setItem(k, JSON.stringify(d));
    }, [CLAVE_BD, fn]);
  };

  const registro = {};
  await entrar();
  registro.ejemplo = await pantalla();

  // Botones: cada pendiente abre su detalle, «Ver todas» navega, «Registrar solicitud» abre el formulario.
  const botonesIr = await page.locator('#view-inicio [data-go]').evaluateAll((bs) => bs.map((b) => b.dataset.go));
  registro.botonesIr = botonesIr;
  registro.cantidadPendientes = await page.locator('#homeTasks .home-task').count();
  await page.locator('#homeTasks .home-task').first().click();
  registro.detallePendiente = { titulo: await texto('#modalTitle'), eyebrow: await texto('#modalEyebrow') };
  await page.click('#closeModal');
  await page.click('#newRequestHome');
  registro.nuevaSolicitud = { titulo: await texto('#modalTitle') };
  await page.click('#closeModal');
  await page.locator('#view-inicio [data-go]').first().click();
  await page.waitForTimeout(200);
  registro.viendoTrasIr = await page.locator('.view.active').first().getAttribute('id');

  // Escenario 2: usuario inactivo, accesos de hoy reales, periodos cambiados.
  await modificarBd(`
    d.users[0].status='Inactivo';
    d.demoAccessEvents=(d.demoAccessEvents||[]).concat([{source:'real',day:new Date().toLocaleDateString('en-CA'),count:7}]);
    d.period.planState='Cerrado'; d.period.reportState='Abierto';
    d.period.cycle='2027-A';
  `);
  await entrar();
  registro.modificado = await pantalla();

  // Escenario 3: sin solicitudes ni bitácora.
  await modificarBd(`d.requests=[]; d.audit=[];`);
  await entrar();
  registro.sinSolicitudes = await pantalla();

  expect(errores, 'errores de consola').toEqual([]);
  expect(JSON.stringify(registro, null, 2)).toMatchSnapshot('inicio-registro.json');
});

// Ampliación (aparte, con su propia referencia, para no alterar la de arriba): reglas de los conteos y de los
// pendientes, escape de HTML, cifras grandes, clics en una autorizada y en cada botón «Ver…», y periodo sin fecha.
test('inicio: accesos de hoy, límite de pendientes, escape, cifras grandes y botones', async ({ page }) => {
  const errores = [];
  page.on('pageerror', (e) => errores.push(`pageerror: ${e.message}`));
  page.on('console', (m) => { if (m.type() === 'error') errores.push(`console.error: ${m.text()}`); });
  await page.clock.setFixedTime(FECHA_FIJA);

  const entrar = async () => {
    await page.goto('/');
    await enviarAcceso(page);
    await expect(page.locator('#app')).toBeVisible();
    await page.waitForTimeout(250);
  };
  const texto = async (sel) => normalizar((await page.locator(sel).allInnerTexts()).join(' | ').replace(/\s+/g, ' ').trim());
  const irA = async (t) => { await page.locator('#ni .ni', { hasText: t }).click(); await page.waitForTimeout(150); };

  await entrar();
  await page.evaluate((k) => {
    const d = JSON.parse(localStorage.getItem(k));
    const hoy = new Date().toLocaleDateString('en-CA');
    // C1: solo cuentan los accesos de hoy que no son de origen «demo»; conteos negativos o inválidos valen 0.
    d.demoAccessEvents = [
      { source: 'demo', day: hoy, count: 50 }, { source: 'real', day: '2026-11-01', count: 9 },
      { source: 'real', day: hoy, count: 3 }, { source: 'real', day: hoy, count: -5 },
      { source: 'real', day: hoy, count: 'abc' }, { source: 'real', day: hoy, count: '2' },
    ];
    // C2 y C3: 3 por autorizar, 3 autorizadas, 1 rechazada y 1 aplicada, intercaladas; títulos con HTML y comillas.
    const s = (id, status, title) => ({ id, status, title, authority: 'Vicerrectoría', type: 'Catálogo' });
    d.requests = [s(11, 'autorizada', 'Autorizada uno'), Object.assign(s(12, 'pendiente', '<b>Negrita</b> & "comillas"'), { authority: "Rectoría 'A'" }),
      s(13, 'autorizada', 'Autorizada dos'), s(14, 'pendiente', 'Pendiente dos'), s(15, 'rechazada', 'Rechazada'),
      s(16, 'pendiente', 'Pendiente tres'), s(17, 'aplicada', 'Aplicada'), s(18, 'autorizada', 'Autorizada tres')];
    // C4: 1000 registros vigentes más uno «No vigente» en materias.
    for (let i = 0; i < 1000; i++) d.catalogs.materias.push({ id: 1000 + i, code: 'M-' + i, name: 'Materia ' + i, detail: '', status: 'Vigente', parentCode: 'IC-2016' });
    d.catalogs.materias.push({ id: 5000, code: 'M-NV', name: 'No vigente', detail: '', status: 'No vigente', parentCode: 'IC-2016' });
    // C6: periodo del Plan sin fecha de inicio.
    d.period.planStart = '';
    localStorage.setItem(k, JSON.stringify(d));
  }, CLAVE_BD);
  await entrar();

  const r = {
    indicadores: await texto('#homeSummaryGrid .home-indicator'),
    pendientes: await page.locator('#homeTasks .home-task').evaluateAll((bs) => bs.map((b) => b.dataset.homeRequest + ' · ' + b.innerText.replace(/\s+/g, ' ').trim())),
    htmlDelPendienteConComillas: normalizar(await page.locator('#homeTasks [data-home-request="12"] .home-task-main').evaluate((e) => e.innerHTML)),
    periodos: await texto('#homePeriodList'),
  };

  // C5: una autorizada abre su detalle; cada botón «Ver…» lleva a su sección.
  await page.locator('#homeTasks [data-home-request="11"]').click();
  r.detalleDeAutorizada = { titulo: await texto('#modalTitle'), eyebrow: await texto('#modalEyebrow') };
  await page.click('#closeModal');
  const destinos = await page.locator('#view-inicio [data-go]').evaluateAll((bs) => bs.map((b) => b.dataset.go));
  r.botonesVer = [];
  for (let i = 0; i < destinos.length; i++) {
    await page.locator('#view-inicio [data-go]').nth(i).click();
    await page.waitForTimeout(150);
    r.botonesVer.push(`${destinos[i]} → ${await page.locator('.view.active').first().getAttribute('id')}`);
    await irA('Inicio');
  }

  expect(errores, 'errores de consola').toEqual([]);
  expect(JSON.stringify(r, null, 2)).toMatchSnapshot('inicio-ampliacion.json');
});

// Cifras accionables (hallazgo de la auditoría de Inicio, A1): primero lo que hay que atender (Por autorizar, Por aplicar),
// después el inventario. Las cuatro primeras son botones que llevan a su pantalla con el filtro puesto (y sin búsqueda ni
// rol previos, para que se vean tantas filas como dice la cifra); «Accesos hoy» no lleva a ninguna pantalla.
// El color del ícono sigue al tipo de cifra, no a su posición (antes dependía de :nth-child).
test('inicio: cifras accionables, en orden de prioridad y con su filtro', async ({ page }) => {
  await page.clock.setFixedTime(FECHA_FIJA);
  await page.goto('/');
  await page.evaluate(() => localStorage.clear());
  await page.goto('/');
  await enviarAcceso(page);
  await expect(page.locator('#app')).toBeVisible();
  const irA = async (t) => { await page.locator('#ni .ni', { hasText: t }).click(); await page.waitForTimeout(150); };
  const cifras = page.locator('#homeSummaryGrid .home-indicator');

  await expect(cifras.locator('.home-indicator-label')).toHaveText(['Por autorizar', 'Por aplicar', 'Usuarios activos', 'Catálogos vigentes', 'Accesos hoy']);
  expect(await cifras.evaluateAll((cs) => cs.map((c) => c.tagName)), 'botones').toEqual(['BUTTON', 'BUTTON', 'BUTTON', 'BUTTON', 'DIV']);
  const colorIcono = (i) => cifras.nth(i).locator('.home-indicator-icon').evaluate((e) => getComputedStyle(e).color);
  expect([await colorIcono(0), await colorIcono(1), await colorIcono(2)], 'colores por tipo').toEqual(['rgb(148, 102, 39)', 'rgb(109, 103, 161)', 'rgb(24, 62, 86)']);
  const numero = async (i) => Number((await cifras.nth(i).locator('.home-indicator-number').innerText()).replace(/\D/g, ''));
  const n = { autorizar: await numero(0), aplicar: await numero(1), usuarios: await numero(2) };

  // Filtros «sucios» antes de usar las cifras: deben limpiarse
  await irA('Solicitudes de cambio'); await page.locator('#requestSearch').fill('zzz');
  await irA('Usuarios y permisos'); await page.locator('#userSearch').fill('zzz');
  await page.locator('#userRole').selectOption({ index: 1 });
  await irA('Inicio');

  const usar = async (i, vista) => { await cifras.nth(i).click(); await page.waitForTimeout(150); await expect(page.locator('.view.active')).toHaveAttribute('id', vista); };
  await usar(0, 'view-solicitudes');
  await expect(page.locator('#requestFilter')).toHaveValue('pendiente');
  await expect(page.locator('#requestSearch')).toHaveValue('');
  await expect(page.locator('#requestRows .rq-item')).toHaveCount(n.autorizar);
  await expect(page.locator('#requestFilterChips .m3-chip.on')).toHaveText('Pendientes');

  await irA('Inicio'); await usar(1, 'view-solicitudes');
  await expect(page.locator('#requestFilter')).toHaveValue('autorizada');
  await expect(page.locator('#requestRows .rq-item')).toHaveCount(n.aplicar);

  await irA('Inicio'); await usar(2, 'view-usuarios');
  await expect(page.locator('#userStatus')).toHaveValue('Activo');
  await expect(page.locator('#userSearch')).toHaveValue('');
  await expect(page.locator('#userRole')).toHaveValue('all');
  await expect(page.locator('#userRows tr')).toHaveCount(n.usuarios);

  await irA('Inicio'); await usar(3, 'view-catalogos');
});
