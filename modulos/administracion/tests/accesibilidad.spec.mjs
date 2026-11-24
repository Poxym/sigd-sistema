// Prueba de accesibilidad (WCAG 2.1 AA) del módulo Administración.
// 1) Nombres accesibles: cada campo visible (input, select, textarea) de las seis pantallas y de los diálogos
//    «Nuevo usuario», «Nuevo registro» y «Registrar solicitud» tiene un nombre que un lector de pantalla pueda leer
///    (criterios 1.3.1 y 4.1.2). Los campos que antes no lo tenían se comprueban además con su nombre exacto.
// 2) Contraste: los textos grises que no llegaban a 4.5:1 (criterio 1.4.3) en el acceso, Inicio, Usuarios,
//    Periodos y los diálogos de solicitud (registrar y seguimiento), catálogo y usuario.
// 3) Diálogos de Solicitudes: cada campo se llama exactamente como su etiqueta visible.
// 4) Contorno de foco: al menos 2 px y 3:1 contra el fondo en Solicitudes y en «Registrar solicitud».
// 5) Solicitudes: al elegir una se anuncia solo su título (el panel de detalle no lleva aria-live).
// Compara TEXTO (no imágenes).
import { test, expect } from '@playwright/test';
import { FECHA_FIJA, enviarAcceso } from './ayudantes.mjs';

const VISTAS = ['Inicio', 'Solicitudes de cambio', 'Catálogos académicos', 'Usuarios y permisos', 'Periodos de captura', 'Bitácora'];

async function entrar(page) {
  await page.clock.setFixedTime(FECHA_FIJA);
  await page.goto('/');
  await page.evaluate(() => localStorage.clear());
  await page.goto('/');
  await enviarAcceso(page);
  await expect(page.locator('#app')).toBeVisible();
}
const irA = async (page, t) => { await page.locator('#ni .ni', { hasText: t }).click(); await page.waitForTimeout(150); };

// Devuelve la lista de campos visibles sin nombre accesible (vacía si todo está bien)
async function camposSinNombre(page, donde) {
  const campos = page.locator('input:visible, select:visible, textarea:visible');
  const sinNombre = [];
  for (let i = 0; i < await campos.count(); i++) {
    const c = campos.nth(i);
    if (await c.getAttribute('type') === 'hidden') continue;
    // Selectores que la pantalla reemplaza por chips: van con aria-hidden y fuera del orden de tabulación
    if (await c.evaluate((e) => !!e.closest('[aria-hidden="true"]'))) continue;
    try { await expect(c).toHaveAccessibleName(/\S/, { timeout: 200 }); }
    catch { sinNombre.push(`${donde}: ${await c.evaluate((e) => e.outerHTML.slice(0, 90))}`); }
  }
  return sinNombre;
}

test('accesibilidad: cada campo visible tiene nombre accesible', async ({ page }) => {
  test.setTimeout(120000);
  await entrar(page);
  const faltan = [];
  for (const v of VISTAS) { await irA(page, v); faltan.push(...await camposSinNombre(page, v)); }

  // Filtro de rol (sin etiqueta visible: lleva aria-label; el de estado está oculto, se usan los chips)
  await irA(page, 'Usuarios y permisos');
  await expect(page.locator('#userRole')).toHaveAccessibleName('Filtrar por rol');

  const dialogos = [
    ['Usuarios y permisos', '#newUser', { 'input[name="mail"]': 'Correo institucional' }],
    ['Catálogos académicos', '#newCatalog', { 'input[name="name"]': 'Denominación oficial', 'select[name="directAuthority"]': 'Autoridad que instruyó' }],
    ['Solicitudes de cambio', '#newRequest', { '#v39Catalog': 'Catálogo', '#v39Record': 'Registro oficial', '#v39Field': 'Campo que cambiará' }],
  ];
  for (const [vista, boton, esperados] of dialogos) {
    await irA(page, vista);
    await page.locator(boton).click();
    await expect(page.locator('#editor[open]')).toBeVisible();
    faltan.push(...await camposSinNombre(page, `diálogo de ${vista}`));
    for (const [sel, nombre] of Object.entries(esperados)) await expect(page.locator(`#editor ${sel}`)).toHaveAccessibleName(new RegExp(`^${nombre}( \\*)?$`)); // « *»: lo agrega el CSS a los obligatorios
    await page.keyboard.press('Escape');
    await expect(page.locator('#editor[open]')).toHaveCount(0);
  }
  expect(faltan, 'campos sin nombre accesible').toEqual([]);
});

// Contraste de un elemento contra el primer fondo opaco de sus ancestros (cruza el Shadow DOM)
async function contrastes(page, selectores) {
  const r = {};
  for (const sel of selectores) {
    const loc = page.locator(sel).first();
    await expect(loc, sel).toBeVisible();
    r[sel] = await loc.evaluate((el) => {
      const rgb = (c) => c.match(/[\d.]+/g).map(Number);
      const lum = ([R, G, B]) => [R, G, B].map((v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; }).reduce((s, v, i) => s + v * [0.2126, 0.7152, 0.0722][i], 0);
      let n = el, fondo = null;
      while (n && !fondo) {
        if (n.nodeType === 1) { const c = rgb(getComputedStyle(n).backgroundColor); if (c.length < 4 || c[3] > 0) fondo = c; }
        n = n.parentNode || n.host;
      }
      const a = lum(rgb(getComputedStyle(el).color)), b = lum(fondo || [255, 255, 255]);
      return Math.round(((Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05)) * 100) / 100;
    });
  }
  return r;
}

test('accesibilidad: contraste mínimo 4.5:1 en los textos grises', async ({ page }) => {
  test.setTimeout(120000);
  await page.clock.setFixedTime(FECHA_FIJA);
  await page.goto('/');
  const medidos = { acceso: await contrastes(page, ['.desc', 'label[for="u"]', 'label[for="pw"]', '#hb', '.sec']) };
  await entrar(page);
  const pantallas = {
    Inicio: ['.home-task-main > span', '.home-period-content > span'],
    'Usuarios y permisos': ['.user-stat-caption'],
    'Periodos de captura': ['.period-config-top > div > p', '.period-module-title-wrap p', '.period-history-hour'],
  };
  for (const [v, sels] of Object.entries(pantallas)) { await irA(page, v); medidos[v] = await contrastes(page, sels); }
  const dialogos = [
    ['Solicitudes de cambio', '#newRequest', ['#editor #v39Record', '#editor #v39Current']],
    ['Catálogos académicos', '#newCatalog', ['#editor select[name="directAuthority"]']],
    ['Usuarios y permisos', '#newUser', ['#editor #m_area', '#editor #v41Category', '#editor #v41Career']],
  ];
  for (const [v, boton, sels] of dialogos) {
    await irA(page, v);
    await page.locator(boton).click();
    await expect(page.locator('#editor[open]')).toBeVisible();
    medidos[`diálogo de ${v}`] = await contrastes(page, sels);
    await page.keyboard.press('Escape');
    await expect(page.locator('#editor[open]')).toHaveCount(0);
  }
  // Diálogo «Seguimiento de cambio»: etiquetas de los datos de la solicitud («Autoridad solicitante», «Estado»…)
  await irA(page, 'Solicitudes de cambio');
  await page.locator('.rq-item', { hasText: 'Revisión de descripción' }).click();
  await page.locator('#requestDetail [data-rq-open]').click();
  await expect(page.locator('#editor[open]')).toBeVisible();
  medidos['diálogo de seguimiento'] = await contrastes(page, ['#editor .v38-request-facts small']);
  await page.keyboard.press('Escape');
  const bajos = Object.entries(medidos).flatMap(([donde, m]) => Object.entries(m).filter(([, c]) => c < 4.5).map(([s, c]) => `${donde} · ${s}: ${c}`));
  expect(bajos, 'textos con contraste menor a 4.5:1').toEqual([]);
});

// 3) Diálogos de Solicitudes: cada campo se llama como su etiqueta visible (no como su texto de ejemplo),
//    en «Registrar solicitud» y en los dos estados de «Seguimiento de cambio» (criterios 1.3.1, 2.5.3 y 4.1.2).
//    Antes varios campos no tenían <label for>: el lector de pantalla leía el placeholder o no leía nada.
test('accesibilidad: los campos de los diálogos de Solicitudes se nombran con su etiqueta', async ({ page }) => {
  await entrar(page);
  await irA(page, 'Solicitudes de cambio');
  const revisar = async (esperados) => {
    await expect(page.locator('#editor[open]')).toBeVisible();
    for (const [sel, nombre] of Object.entries(esperados)) await expect(page.locator(`#editor ${sel}`)).toHaveAccessibleName(new RegExp(`^${nombre}( \\*)?$`)); // « *»: lo agrega el CSS a los obligatorios
    await page.keyboard.press('Escape');
    await expect(page.locator('#editor[open]')).toHaveCount(0);
  };

  await page.locator('#newRequest').click();
  await revisar({
    '[name="title"]': 'Concepto del cambio',
    '[name="evidence"]': 'Referencia de autorización',
    '[name="detail"]': 'Justificación y alcance',
    '[name="targetValue"]': 'Nuevo valor',
  });

  // Solicitud pendiente: «Registrar instrucción recibida» muestra los datos de la autorización
  await page.locator('.rq-item', { hasText: 'Revisión de descripción' }).click();
  await page.locator('#requestDetail [data-rq-open]').click();
  await page.locator('#m_transition').selectOption('Registrar instrucción recibida');
  await revisar({
    '[name="authorizationBy"]': 'Autoridad que emitió la instrucción',
    '[name="authorizationDate"]': 'Fecha de autorización',
    '[name="authEvidence"]': 'Oficio o referencia documental',
  });

  // Solicitud autorizada: «Marcar como aplicada» muestra los datos de la ejecución
  await page.locator('.rq-item', { hasText: 'Actualización de categoría docente' }).click();
  await page.locator('#requestDetail [data-rq-open]').click();
  await page.locator('#m_transition').selectOption('Marcar como aplicada');
  await revisar({
    '[name="targetValue"]': 'Nuevo valor',
    '[name="appliedAt"]': 'Fecha de ejecución',
    '[name="executionNote"]': 'Registro de ejecución',
  });
});

// 4) Contorno de foco con teclado: cada parada de Tab en Solicitudes y en «Registrar solicitud» muestra un contorno
//    de al menos 2 px y 3:1 contra el fondo (criterios 2.4.7 y 1.4.11). Antes los campos, chips y la lista usaban
//    rgba(24,62,86,.35), cerca de 2:1; el marco común y los botones ya usaban var(--p). Los campos de los diálogos no
//    llevan contorno: su foco es el borde oscuro de Material 3 (borde de 1 px + sombra de 1 px). En ellos se mide el
//    borde con foco contra el mismo borde sin foco (3:1, «cambio de contraste»): antes la regla de foco perdía por
//    especificidad, el borde seguía gris (#7F919C) y solo aparecía un hilo de 1 px.
const focoActual = (page) => page.evaluate(async () => {
  let a = document.activeElement; while (a?.shadowRoot?.activeElement) a = a.shadowRoot.activeElement;
  await Promise.all(a.getAnimations().map((x) => x.finished)); // el borde y la sombra cambian con una transición
  const rgba = (c) => { const v = c.match(/[\d.]+/g).map(Number); return v.length < 4 ? [...v, 1] : v; };
  const lum = ([R, G, B]) => [R, G, B].map((v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; }).reduce((s, v, i) => s + v * [0.2126, 0.7152, 0.0722][i], 0);
  const s = getComputedStyle(a);
  // Fondo junto al contorno: si va por fuera (offset ≥ 0), el del contenedor; si va por dentro, el del propio elemento
  let n = parseFloat(s.outlineOffset) < 0 ? a : (a.parentNode || a.host), fondo = [255, 255, 255];
  while (n) { if (n.nodeType === 1) { const c = rgba(getComputedStyle(n).backgroundColor); if (c[3] > 0.9) { fondo = c; break; } } n = n.parentNode || n.host; }
  // Sin contorno, los campos de los diálogos marcan el foco como Material 3: borde oscuro + sombra de 1 px (2 px en total)
  const borde = s.outlineStyle === 'none';
  const anchoSombra = borde ? Number((s.boxShadow.match(/0px 0px 0px ([0-9.]+)px/) || [0, 0])[1]) : 0;
  if (borde) {
    // Cómo se ve el borde sin foco: una copia del campo que nunca recibe el foco (se quita enseguida)
    const copia = a.cloneNode(false); copia.removeAttribute('id'); copia.removeAttribute('name'); a.parentNode.appendChild(copia);
    fondo = rgba(getComputedStyle(copia).borderTopColor); copia.remove();
  }
  const [r, g, b, al] = rgba(borde ? s.borderTopColor : s.outlineColor); const color = [r, g, b].map((v, i) => v * al + fondo[i] * (1 - al));
  const x = lum(color), y = lum(fondo);
  // ¿Algún contenedor con overflow recorta el contorno? (p. ej. la lista de solicitudes tiene overflow:hidden)
  let recortado = '';
  const ext = borde ? 0 : parseFloat(s.outlineOffset) + parseFloat(s.outlineWidth);
  if (ext > 0) {
    const q = a.getBoundingClientRect();
    for (let p = a.parentNode || a.host; p; p = p.parentNode || p.host) {
      if (p.nodeType !== 1 || p === document.documentElement || p === document.body || getComputedStyle(p).overflow === 'visible') continue;
      const c = p.getBoundingClientRect();
      if (q.left - ext < c.left - 0.5 || q.right + ext > c.right + 0.5 || q.top - ext < c.top - 0.5 || q.bottom + ext > c.bottom + 0.5) { recortado = ' recortado por ' + (p.id || p.className); break; }
    }
  }
  return { recortado, el: (a.id || a.className || a.tagName) + ' «' + (a.textContent || a.name || '').trim().slice(0, 25) + '»', estilo: borde ? 'borde ' + s.borderTopStyle : s.outlineStyle, ancho: borde ? parseFloat(s.borderTopWidth) + anchoSombra : parseFloat(s.outlineWidth), ratio: Math.round(((Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05)) * 100) / 100 };
});

test('accesibilidad: el contorno de foco se ve con 3:1 en Solicitudes y su diálogo', async ({ page }) => {
  await entrar(page);
  await irA(page, 'Solicitudes de cambio');
  const malos = [], vistos = [];
  const recorrer = async (donde, paradas) => {
    for (let i = 0; i < paradas; i++) {
      await page.keyboard.press('Tab');
      const f = await focoActual(page); vistos.push(f.el);
      if (f.estilo === 'borde none' || f.ancho < 2 || f.ratio < 3 || f.recortado) malos.push(`${donde} · ${f.el}: ${f.estilo} ${f.ancho}px ${f.ratio}:1${f.recortado}`);
    }
  };
  await page.locator('#requestSearch').focus();
  await expect(page.locator('#requestSearch')).toBeFocused();
  await recorrer('pantalla', 10); // chips de estado, las 4 solicitudes y «Gestionar solicitud»
  await page.locator('#newRequest').click();
  await expect(page.locator('#editor[open]')).toBeVisible();
  await recorrer('registrar', 8); // campos del diálogo
  expect(vistos.some((v) => v.startsWith('rq-item')), 'el recorrido pasa por la lista').toBe(true);
  expect(malos, 'paradas de Tab con contorno de foco débil').toEqual([]);
});

// 5) Anuncio al elegir una solicitud: el panel de detalle ya no lleva aria-live (se repintaba completo en cada tecla de la
//    búsqueda y en cada guardado, y el lector lo volvía a leer entero). Un anuncio oculto dice solo el título de la
//    solicitud que la persona eligió, y no habla mientras se escribe en la búsqueda.
test('accesibilidad: al elegir una solicitud se anuncia solo su título', async ({ page }) => {
  await entrar(page);
  await irA(page, 'Solicitudes de cambio');
  await expect(page.locator('#requestDetail')).not.toHaveAttribute('aria-live', /.*/);
  const vivos = page.locator('#view-solicitudes [aria-live]');
  await expect(vivos).toHaveCount(1);
  const anuncio = page.locator('#requestAnnounce');
  await expect(anuncio).toHaveAttribute('aria-live', 'polite');
  expect(await anuncio.evaluate((e) => e.getBoundingClientRect().width), 'el anuncio no se ve en pantalla').toBeLessThanOrEqual(1);
  await expect(anuncio).toHaveText('');

  await page.locator('.rq-item', { hasText: 'Actualización de categoría docente' }).click();
  await expect(anuncio).toHaveText('Solicitud seleccionada: Actualización de categoría docente');
  await page.locator('#requestSearch').fill('Ajuste');
  await expect(page.locator('.rq-item')).toHaveCount(1);
  await expect(anuncio).toHaveText('Solicitud seleccionada: Actualización de categoría docente');
});
