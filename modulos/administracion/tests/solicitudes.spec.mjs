// Prueba de la pantalla «Solicitudes de cambio»: lista–detalle, diálogos de registro y de gestión,
// campos del registro que se modificará, fecha de vigencia y la regla «el valor actual cambió».
// (El guardado y sus avisos ya los vigila reglas-formulario; aquí se vigila lo que se VE y cómo reacciona.)
// Compara TEXTO (no imágenes).
import { test, expect } from '@playwright/test';
import { FECHA_FIJA, enviarAcceso, normalizar } from './ayudantes.mjs';

test('solicitudes: lista, detalle, diálogos y reglas visibles', async ({ page }) => {
  test.setTimeout(120000);
  const errores = [];
  page.on('pageerror', (e) => errores.push(`pageerror: ${e.message}`));
  page.on('console', (m) => { if (m.type() === 'error') errores.push(`console.error: ${m.text()}`); });
  await page.clock.setFixedTime(FECHA_FIJA);

  const irA = async (t) => { await page.locator('#ni .ni', { hasText: t }).click(); await page.waitForTimeout(150); };
  const reiniciar = async () => {
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
    await page.goto('/');
    await enviarAcceso(page);
    await expect(page.locator('#app')).toBeVisible();
    await page.waitForTimeout(200);
  };
  const texto = async (sel) => normalizar((await page.locator(sel).allInnerTexts()).join(' | ').replace(/\s+/g, ' ').trim());
  const cerrar = async () => { if (await page.locator('#editor[open]').count()) { await page.keyboard.press('Escape'); await page.waitForTimeout(100); } };
  const elegirFiltro = async (valor) => { await page.locator('#requestFilter').evaluate((s, v) => { s.value = v; s.dispatchEvent(new Event('change', { bubbles: true })); }, valor); await page.waitForTimeout(100); };
  const buscar = async (q) => { await page.locator('#requestSearch').fill(q); await page.waitForTimeout(100); };

  // Lista y detalle tal como se ven.
  const lista = async () => ({
    filas: (await page.locator('#requestRows li').allInnerTexts()).map((t) => normalizar(t.replace(/\s+/g, ' ').trim())),
    seleccionada: normalizar((await page.locator('#requestRows .rq-item.on').allInnerTexts()).join('').replace(/\s+/g, ' ').trim()),
    detalle: await texto('#requestDetail'),
  });

  // Resumen del diálogo abierto: título, botones, campos (visible, obligatorio, valor, opciones) y textos de ayuda.
  const dialogo = () => page.locator('#editor').evaluate((d) => {
    const t = (s) => String(s ?? '').replace(/\s+/g, ' ').trim();
    const visible = (el) => el.checkVisibility();
    const campos = [...d.querySelectorAll('#modalContent [name]')].map((el) => {
      const c = { nombre: el.name, visible: visible(el), obligatorio: el.required, valor: el.value };
      if (el.placeholder) c.placeholder = el.placeholder;
      if (el.tagName === 'SELECT') c.opciones = [...el.options].map((o) => `${o.value}${o.text !== o.value ? '=' + t(o.text) : ''}${o.disabled ? ' (desactivada)' : ''}${o.selected ? ' ✓' : ''}`);
      return c;
    });
    return {
      titulo: t(d.querySelector('#modalTitle').textContent),
      seccion: t(d.querySelector('#modalEyebrow').textContent),
      botonGuardar: t(d.querySelector('#submitModal').textContent) + (visible(d.querySelector('#submitModal')) ? '' : ' (oculto)'),
      campos,
      ayudas: [...d.querySelectorAll('#v39Current, .v40-due-note, .v38-final, .callout, .modal-intro')].filter(visible).map((el) => t(el.textContent)),
    };
  });
  const poner = async (campos) => {
    await page.locator('#editorForm').evaluate((form, campos) => {
      for (const [n, v] of Object.entries(campos)) {
        const el = form.elements[n];
        if (!el) throw new Error('No existe el campo ' + n);
        el.value = v;
        el.dispatchEvent(new Event('input', { bubbles: true }));
        el.dispatchEvent(new Event('change', { bubbles: true }));
        if (el.value !== v) throw new Error(`El campo ${n} no acepta «${v}»`);
      }
    }, campos);
    await page.waitForTimeout(50);
  };
  const enviar = async () => {
    await page.locator('#toasts .toast').evaluateAll((els) => els.forEach((e) => e.remove()));
    await page.locator('#editorForm').evaluate((f) => { f.noValidate = true; f.requestSubmit(); });
    await page.waitForTimeout(250);
    return (await page.locator('#toasts .toast').allInnerTexts()).map((t) => normalizar(t.replace(/\s+/g, ' ').trim()));
  };
  const abrirGestion = async (id) => { await irA('Solicitudes'); await page.locator(`#requestRows [data-rq="${id}"]`).click(); await page.locator('#requestDetail [data-rq-open]').click(); await page.waitForTimeout(100); };

  const registro = {};

  // ───────────── 1) Lista y detalle ─────────────
  await reiniciar();
  await irA('Solicitudes');
  registro.lista = { inicial: await lista() };
  for (const estado of ['pendiente', 'autorizada', 'aplicada', 'rechazada']) {
    await elegirFiltro(estado);
    registro.lista['filtro ' + estado] = await lista();
  }
  await elegirFiltro('all');
  await buscar('tutorías'); registro.lista['búsqueda «tutorías»'] = await lista();
  await buscar('Rectoría'); registro.lista['búsqueda «Rectoría»'] = await lista();
  await buscar('zzz'); registro.lista['búsqueda sin resultados'] = await lista();
  await buscar('');
  await page.locator('#requestRows [data-rq="2"]').click(); await page.waitForTimeout(100);
  registro.lista['elegir la #2 (autorizada)'] = await lista();
  await page.locator('#requestRows [data-rq="4"]').click(); await page.waitForTimeout(100);
  registro.lista['elegir la #4 (siguiente ciclo)'] = await lista();

  // ───────────── 2) Diálogo «Registrar solicitud» ─────────────
  registro.registrar = {};
  await page.locator('#newRequest').click(); await page.waitForTimeout(150);
  registro.registrar['al abrir'] = await dialogo();
  await poner({ schedule: 'Siguiente ciclo' });
  registro.registrar['aplicación: siguiente ciclo'] = await dialogo();
  await poner({ schedule: 'Inmediata' });
  await poner({ targetCatalog: 'campus' });
  registro.registrar['catálogo: campus'] = await dialogo();
  await poner({ targetId: '1', targetField: 'status' });
  registro.registrar['campus #1 · campo estado'] = await dialogo();
  await poner({ targetCatalog: 'parametros' });
  await poner({ targetId: '1', targetField: 'paramUnit' });
  registro.registrar['parámetro #1 · campo unidad'] = await dialogo();
  await cerrar();

  // ───────────── 3) Diálogo de gestión según el estado ─────────────
  registro.gestionar = {};
  await abrirGestion(1);
  registro.gestionar['pendiente inmediata (#1)'] = await dialogo();
  await poner({ transition: 'Registrar instrucción recibida' });
  registro.gestionar['pendiente inmediata (#1) · registrar instrucción'] = await dialogo();
  await cerrar();
  await abrirGestion(4);
  registro.gestionar['pendiente siguiente ciclo (#4)'] = await dialogo();
  await cerrar();
  await abrirGestion(2);
  registro.gestionar['autorizada (#2)'] = await dialogo();
  await poner({ transition: 'Marcar como aplicada' });
  registro.gestionar['autorizada (#2) · marcar como aplicada'] = await dialogo();
  await cerrar();
  // Finalizada: se devuelve la #3 y se vuelve a abrir.
  await abrirGestion(3);
  await poner({ transition: 'Devolver para aclaración' });
  registro.gestionar['devolver la #3: avisos'] = await enviar();
  registro.gestionar['lista tras devolver la #3'] = await lista();
  await abrirGestion(3);
  registro.gestionar['finalizada (#3)'] = await dialogo();
  await cerrar();

  // ───────────── 4) Regla «el valor actual cambió» ─────────────
  // Se registra una solicitud sobre el parámetro #1, se autoriza, se edita el parámetro desde Catálogos
  // y se intenta aplicar: debe rechazarse porque el valor ya no es el que había al registrarla.
  await reiniciar();
  registro.valorCambiado = {};
  await irA('Solicitudes');
  await page.locator('#newRequest').click(); await page.waitForTimeout(150);
  await poner({ title: 'Ajuste del umbral', type: 'Parámetro / peso', authority: 'Vicerrectoría', schedule: 'Inmediata', evidence: 'Oficio 1', detail: 'Prueba',
    targetCatalog: 'parametros' });
  await poner({ targetId: '1', targetField: 'paramValue', targetValue: '40' });
  registro.valorCambiado['registrar'] = await enviar();
  await abrirGestion(5);
  await poner({ transition: 'Registrar instrucción recibida', authorizationBy: 'Vicerrectoría', authorizationDate: '2026-11-02', authEvidence: 'Oficio VR-9' });
  registro.valorCambiado['autorizar'] = await enviar();
  await irA('Catálogos'); await page.locator('[data-cx-type="parametros"]').click(); await page.locator('[data-edit-cat]').first().click(); await page.waitForTimeout(100);
  await poner({ paramValue: '36', directAuthority: 'Rectoría', directEvidence: 'Oficio R-9' });
  registro.valorCambiado['editar el parámetro a 36'] = await enviar();
  await abrirGestion(5);
  await poner({ transition: 'Marcar como aplicada', appliedAt: '2026-11-02', executionNote: 'Intento de aplicación' });
  registro.valorCambiado['aplicar'] = await enviar();
  registro.valorCambiado['diálogo sigue abierto'] = (await page.locator('#editor[open]').count()) === 1;
  await cerrar();

  expect(errores, 'errores de consola').toEqual([]);
  expect(JSON.stringify(registro, null, 2)).toMatchSnapshot('solicitudes.json');
});
