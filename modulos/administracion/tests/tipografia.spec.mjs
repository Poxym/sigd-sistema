// Tipografía de los diálogos de Solicitudes (hallazgo del paso 3 de `/impeccable audit Solicitudes`).
// 1) Los datos de la solicitud en «Seguimiento de cambio» usan los mismos roles de texto que el panel de detalle:
//    la etiqueta («Autoridad solicitante») y el dato («Rectoría») tienen el mismo tamaño, peso y color en los dos lugares.
//    Antes el dato (12.3 px) era más chico que su etiqueta (13 px): la jerarquía estaba invertida.
// 2) Ningún texto visible de los diálogos de Solicitudes mide menos de 12 px (antes: aviso de 10.8 px y ayuda de 10.5 px).
// 3) En el seguimiento cada dato queda pegado a su etiqueta aunque la celda vecina sea más alta (segundo test).
// Compara TEXTO (no imágenes): estilos calculados por el navegador.
import { test, expect } from '@playwright/test';
import { FECHA_FIJA, enviarAcceso } from './ayudantes.mjs';

async function entrar(page) {
  await page.clock.setFixedTime(FECHA_FIJA);
  await page.goto('/');
  await page.evaluate(() => localStorage.clear());
  await page.goto('/');
  await enviarAcceso(page);
  await expect(page.locator('#app')).toBeVisible();
  await page.locator('#ni .ni', { hasText: 'Solicitudes de cambio' }).click();
}

const estilo = (loc) => loc.evaluate((e) => { const s = getComputedStyle(e); return `${s.fontSize} ${s.fontWeight} ${s.color}`; });

// Textos visibles del diálogo con letra menor a 12 px (vacía si todo está bien)
const textosChicos = (page, donde) => page.locator('#editor').evaluate((d, donde) => {
  const chicos = []; const w = d.ownerDocument.createTreeWalker(d, NodeFilter.SHOW_TEXT); let t;
  while ((t = w.nextNode())) {
    const el = t.parentElement;
    if (!t.textContent.trim() || !el || el.getBoundingClientRect().width === 0 || el.closest('option')) continue;
    const px = parseFloat(getComputedStyle(el).fontSize);
    if (px < 12) chicos.push(`${donde}: ${px}px «${t.textContent.trim().slice(0, 40)}»`);
  }
  return chicos;
}, donde);

const abrirSeguimiento = async (page, titulo, accion) => {
  await page.locator('.rq-item', { hasText: titulo }).click();
  await page.locator('#requestDetail [data-rq-open]').click();
  await expect(page.locator('#editor[open]')).toBeVisible();
  if (accion) await page.locator('#m_transition').selectOption(accion);
};
const cerrar = async (page) => { await page.keyboard.press('Escape'); await expect(page.locator('#editor[open]')).toHaveCount(0); };

test('tipografía: los diálogos de Solicitudes usan los roles del detalle y nada mide menos de 12 px', async ({ page }) => {
  await entrar(page);

  // 1) Mismos roles en el detalle y en el diálogo de la misma solicitud
  await page.locator('.rq-item', { hasText: 'Actualización de categoría docente' }).click();
  const detalle = { etiqueta: await estilo(page.locator('#requestDetail .rq-fact small').first()), dato: await estilo(page.locator('#requestDetail .rq-fact strong').first()) };
  await abrirSeguimiento(page, 'Actualización de categoría docente');
  const dialogo = { etiqueta: await estilo(page.locator('#editor .v38-request-facts small').first()), dato: await estilo(page.locator('#editor .v38-request-facts strong').first()) };
  expect(dialogo, 'etiqueta y dato del diálogo frente al panel de detalle').toEqual(detalle);
  await cerrar(page);

  // 2) Ningún texto menor a 12 px en los cuatro estados de los diálogos
  const chicos = [];
  await page.locator('#newRequest').click();
  await expect(page.locator('#editor[open]')).toBeVisible();
  chicos.push(...await textosChicos(page, 'registrar'));
  await cerrar(page);
  for (const [titulo, accion, donde] of [
    ['Revisión de parámetro de reprobación', 'Registrar instrucción recibida', 'pendiente de siguiente ciclo'],
    ['Actualización de categoría docente', 'Marcar como aplicada', 'autorizada'],
  ]) {
    await abrirSeguimiento(page, titulo, accion);
    chicos.push(...await textosChicos(page, donde));
    await cerrar(page);
  }
  expect(chicos, 'textos de menos de 12 px').toEqual([]);
});

// 3) En «Seguimiento de cambio» cada dato queda pegado a su etiqueta, aunque la celda vecina sea más alta.
//    Antes cada celda era un grid estirado a la altura de la fila y repartía el espacio sobrante: «SIM-AUT-002» quedaba
//    26 px debajo del texto de «Referencia documental» (y «Autoridad solicitante» 8 px, por el chip de estado vecino).
//    Lo normal son 6 px: la separación de 4 px más el interlineado de la etiqueta.
test('tipografía: en el seguimiento cada dato queda pegado a su etiqueta', async ({ page }) => {
  await entrar(page);
  await abrirSeguimiento(page, 'Actualización de categoría docente');
  const separaciones = await page.locator('#editor .v38-request-facts > div').evaluateAll((celdas) => celdas.map((c) => {
    const [etiqueta, dato] = c.children; if (!etiqueta || !dato) return null;
    // Se mide el renglón de TEXTO de la etiqueta (un Range), no su caja: la caja estirada es justo el problema
    const r = etiqueta.ownerDocument.createRange(); r.selectNodeContents(etiqueta);
    return `${etiqueta.textContent.trim()}: ${Math.round(dato.getBoundingClientRect().top - r.getBoundingClientRect().bottom)} px`;
  }).filter(Boolean));
  expect(separaciones.length, 'celdas medidas').toBeGreaterThan(5);
  expect(separaciones.filter((s) => parseInt(s.split(': ')[1]) > 7), 'datos separados de su etiqueta').toEqual([]);
});
