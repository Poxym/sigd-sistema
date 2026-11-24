// Prueba de la pantalla «Catálogos académicos»: navegación por tipos, búsqueda, chips de estado, grupos de
// opciones, estados vacíos, diálogo según el tipo de catálogo y los historiales que muestra el diálogo.
// (El guardado y sus avisos ya los vigila reglas-formulario; aquí se vigila lo que se VE y cómo reacciona.)
// El buscador global no se prueba: ningún control de la interfaz lo abre.
// Compara TEXTO (no imágenes).
import { test, expect } from '@playwright/test';
import { FECHA_FIJA, enviarAcceso, normalizar } from './ayudantes.mjs';

test('catálogos: pantalla, diálogo por tipo e historiales', async ({ page }) => {
  test.setTimeout(150000);
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
  const limpio = (t) => normalizar(String(t).replace(/\s+/g, ' ').trim());
  const textos = async (sel) => (await page.locator(sel).allInnerTexts()).map(limpio);
  const cerrar = async () => { if (await page.locator('#editor[open]').count()) { await page.keyboard.press('Escape'); await page.waitForTimeout(100); } };
  const tipo = async (t) => { await page.locator(`[data-cx-type="${t}"]`).click(); await page.waitForTimeout(100); };
  const buscar = async (q) => { await page.locator('#cxSearch').fill(q); await page.waitForTimeout(100); };
  const chip = async (v) => { await page.locator(`#cxChips [data-cx-estado="${v}"]`).click(); await page.waitForTimeout(100); };

  // Lo que se ve en la pantalla. En «Opciones» (muchos registros) se guardan los subencabezados y las 3 primeras filas.
  const pantalla = async ({ filas = 'todas' } = {}) => {
    const todas = await textos('#cxList .cx-row');
    return {
      tipoActual: limpio(await page.locator('#cxNav [aria-current="true"]').innerText()),
      titulo: limpio(await page.locator('#cxTitle').innerText()),
      descripcion: limpio(await page.locator('#cxDesc').innerText()),
      filtroDeGrupoVisible: await page.locator('#cxGroupWrap').isVisible(),
      cuenta: limpio(await page.locator('#cxCount').innerText()),
      chips: await textos('#cxChips .cx-fchip'),
      subencabezados: await textos('#cxList .cx-subhead'),
      vacio: await textos('#cxList .cx-empty'),
      filas: filas === 'todas' ? todas : todas.slice(0, filas),
      totalFilas: todas.length,
    };
  };

  // Resumen del diálogo abierto: título, sección, campos (visible, obligatorio, valor, opciones) e historiales.
  const dialogo = () => page.locator('#editor').evaluate((d) => {
    const t = (s) => String(s ?? '').replace(/\s+/g, ' ').trim();
    const campos = [...d.querySelectorAll('#modalContent [name]')].map((el) => {
      const c = { nombre: el.name, visible: el.checkVisibility(), obligatorio: el.required, valor: el.value };
      if (el.placeholder) c.placeholder = el.placeholder;
      if (el.tagName === 'SELECT') c.opciones = [...el.options].map((o) => `${o.value}${o.text !== o.value ? '=' + t(o.text) : ''}${o.disabled ? ' (desactivada)' : ''}${o.selected ? ' ✓' : ''}`);
      return c;
    });
    return {
      titulo: t(d.querySelector('#modalTitle').textContent),
      seccion: t(d.querySelector('#modalEyebrow').textContent),
      campos,
      historiales: [...d.querySelectorAll('#modalContent details')].map((x) => t(x.textContent)),
      textos: [...d.querySelectorAll('#modalContent .hint, #modalContent .modal-intro, #modalContent .v40-approval-title')].map((x) => t(x.textContent)),
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
    return (await page.locator('#toasts .toast').allInnerTexts()).map(limpio);
  };
  const nuevo = async (t) => { await irA('Catálogos'); await tipo(t); await page.locator('#newCatalog').click(); await page.waitForTimeout(150); };
  const editar = async (t, nombre) => {
    await irA('Catálogos'); await tipo(t);
    const fila = nombre ? page.locator('#cxList .cx-row', { hasText: nombre }).first() : page.locator('#cxList .cx-row').first();
    await fila.locator('[data-edit-cat]').click(); await page.waitForTimeout(150);
  };
  const resp = { directAuthority: 'Rectoría', directEvidence: 'Oficio R-001' };

  const registro = {};

  // ───────────── 1) Pantalla ─────────────
  await reiniciar();
  await irA('Catálogos');
  registro.pantalla = { navegacion: await textos('#cxNav .cx-group'), inicial: await pantalla() };
  const tipos = await page.locator('#cxNav [data-cx-type]').evaluateAll((bs) => bs.map((b) => b.dataset.cxType));
  registro.pantalla.porTipo = {};
  for (const t of tipos) { await tipo(t); registro.pantalla.porTipo[t] = await pantalla(t === 'opciones' ? { filas: 3 } : {}); }

  await tipo('carreras');
  await buscar('Química'); registro.pantalla['carreras · buscar «Química»'] = await pantalla();
  await buscar('Juchitán'); registro.pantalla['carreras · buscar el campus «Juchitán»'] = await pantalla();
  await buscar('zzz'); registro.pantalla['carreras · sin resultados'] = await pantalla();
  await page.locator('#cxList [data-cx-act="clear"]').click(); await page.waitForTimeout(100);
  registro.pantalla['carreras · tras «Quitar búsqueda y filtros»'] = await pantalla();
  await tipo('planes');
  await chip('Histórico'); registro.pantalla['planes · chip Históricos'] = await pantalla();
  await chip('Vigente'); registro.pantalla['planes · chip Vigentes'] = await pantalla();
  await tipo('opciones');
  registro.pantalla['opciones · grupos disponibles'] = await page.locator('#cxGroup option').evaluateAll((os) => os.map((o) => o.textContent.trim()));
  const grupo = await page.locator('#cxGroup option').nth(1).getAttribute('value');
  await page.locator('#cxGroup').selectOption(grupo); await page.waitForTimeout(100);
  registro.pantalla['opciones · un grupo'] = await pantalla();
  await tipo('campus');
  registro.pantalla['campus · cambiar de tipo limpia filtros'] = await pantalla();

  // Clic en la fila y en el botón «Editar»: ambos abren el diálogo del registro.
  await page.locator('#cxList .cx-row .cx-name').first().click(); await page.waitForTimeout(150);
  registro.pantalla['clic en la fila abre'] = (await dialogo()).titulo;
  await cerrar();
  await page.locator('#cxList [data-edit-cat]').first().click(); await page.waitForTimeout(150);
  registro.pantalla['botón Editar abre'] = (await dialogo()).titulo;
  await cerrar();

  // ───────────── 2) Diálogo según el tipo ─────────────
  registro.dialogo = {};
  for (const t of ['campus', 'carreras', 'planes', 'materias', 'parametros', 'rubros', 'categorias']) {
    await nuevo(t); registro.dialogo[`nuevo · ${t}`] = await dialogo(); await cerrar();
  }
  await nuevo('opciones');
  registro.dialogo['nuevo · opciones'] = await dialogo();
  await poner({ group: '__NEW__' });
  registro.dialogo['nuevo · opciones · «Nuevo grupo…»'] = await dialogo();
  await cerrar();
  for (const t of ['campus', 'carreras', 'planes', 'parametros', 'rubros', 'opciones']) {
    await editar(t); registro.dialogo[`editar · ${t}`] = await dialogo(); await cerrar();
  }

  // ───────────── 3) Historiales que muestra el diálogo ─────────────
  registro.historiales = {};
  // a) Traslado de una carrera a otro campus: historial de relación y versiones anteriores.
  await editar('carreras', 'Ingeniería Química');
  await poner({ ...resp, parentCode: 'JUC', movementReason: 'Reubicación', movementDate: '2026-11-02' });
  registro.historiales['traslado de carrera · avisos'] = await enviar();
  await editar('carreras', 'Ingeniería Química');
  registro.historiales['carrera trasladada · diálogo'] = await dialogo();
  await cerrar();
  // b) Edición directa del nombre de un campus.
  await editar('campus', 'Tehuantepec');
  await poner({ ...resp, name: 'Tehuantepec Centro' });
  registro.historiales['renombrar campus · avisos'] = await enviar();
  await editar('campus', 'Tehuantepec Centro');
  registro.historiales['campus renombrado · diálogo'] = await dialogo();
  await cerrar();
  // c) Aplicar la solicitud autorizada #2, que cambia la descripción de una categoría docente.
  await irA('Solicitudes'); await page.locator('#requestRows [data-rq="2"]').click(); await page.locator('#requestDetail [data-rq-open]').click(); await page.waitForTimeout(100);
  await poner({ transition: 'Marcar como aplicada', appliedAt: '2026-11-02', executionNote: 'Aplicado en prueba' });
  registro.historiales['aplicar solicitud #2 · avisos'] = await enviar();
  await editar('categorias', 'Profesor investigador');
  registro.historiales['categoría tras aplicar la solicitud · diálogo'] = await dialogo();
  await cerrar();
  await irA('Catálogos'); await tipo('carreras');
  registro.historiales['carreras · pantalla tras el traslado'] = await pantalla();

  expect(errores, 'errores de consola').toEqual([]);
  expect(JSON.stringify(registro, null, 2)).toMatchSnapshot('catalogos.json');
});
