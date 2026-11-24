// Prueba de las REGLAS DE CATÁLOGOS que reglas-formulario.spec y catalogos.spec no recorren.
// Archivo aparte, con su propia referencia, para no alterar las huellas de reglas-formulario ni acercarla a su
// límite de tiempo. Mismo método: abre el diálogo, llena campos, envía SIN la validación nativa del navegador y
// anota avisos, si el diálogo se cerró, la bitácora nueva y, en los casos que guardan, el registro en la base.
// Tres grupos:
//   A · guardado desde la interfaz: cada parte de las condiciones con «o» (respaldo, fecha y motivo), claves con
//       mayúsculas o espacios, cierres y cambios de clave permitidos, versiones, parámetros y opciones.
//   B · formulario forzado: valores que la interfaz no ofrece (relación histórica o inexistente, fecha o número
//       con otro formato, estado, autoridad o documento que no existen). Muestra QUÉ revisión responde primero.
//   C · pantalla: catálogo vacío, teclado en la lista de tipos, búsqueda con chips y grupo, registro sin padre,
//       parámetro sin valor y un nombre con HTML (se prepara en la base guardada).
// Compara TEXTO, no imágenes.
import { test, expect } from '@playwright/test';
import { CLAVE_BD, FECHA_FIJA, enviarAcceso, normalizar } from './ayudantes.mjs';

test('reglas de catálogos: guardado, formulario forzado y pantalla', async ({ page }) => {
  test.setTimeout(180000);
  const errores = [];
  page.on('pageerror', (e) => errores.push(`pageerror: ${e.message}`));
  page.on('console', (m) => { if (m.type() === 'error') errores.push(`console.error: ${m.text()}`); });
  await page.clock.setFixedTime(FECHA_FIJA);

  const bd = async () => JSON.parse(await page.evaluate((k) => localStorage.getItem(k), CLAVE_BD));
  const irA = async (t) => { await page.locator('#ni .ni', { hasText: t }).click(); await page.waitForTimeout(150); };
  const entrar = async () => {
    await enviarAcceso(page);
    await expect(page.locator('#app')).toBeVisible();
    await page.waitForTimeout(200);
  };
  const reiniciar = async () => { await page.goto('/'); await page.evaluate(() => localStorage.clear()); await page.goto('/'); await entrar(); };
  const cerrar = async () => { if (await page.locator('#editor[open]').count()) { await page.keyboard.press('Escape'); await page.waitForTimeout(100); } };
  const limpio = (t) => normalizar(String(t).replace(/\s+/g, ' ').trim());
  const textos = async (sel) => (await page.locator(sel).allInnerTexts()).map(limpio);
  const tipo = async (t) => { await page.locator(`[data-cx-type="${t}"]`).click(); await page.waitForTimeout(100); };
  const buscar = async (q) => { await page.locator('#cxSearch').fill(q); await page.waitForTimeout(100); };
  const chip = async (v) => { await page.locator(`#cxChips [data-cx-estado="${v}"]`).click(); await page.waitForTimeout(100); };

  // Llena campos como lo haría la persona (solo valores que el formulario acepta).
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
  };
  // Fuerza valores que la interfaz no ofrece: en una lista agrega la opción; un campo de fecha o número que no
  // acepta el texto pasa a ser de texto; si el diálogo no tiene el campo, lo crea oculto (dentro de #modalContent,
  // que se vuelve a pintar en cada diálogo). No dispara eventos (no recalcula nada).
  const forzar = async (campos) => {
    await page.locator('#editorForm').evaluate((form, campos) => {
      for (const [n, v] of Object.entries(campos)) {
        let el = form.elements[n];
        if (!el) { el = document.createElement('input'); el.type = 'hidden'; el.name = n; form.querySelector('#modalContent').append(el); }
        if (el.tagName === 'SELECT' && ![...el.options].some((o) => o.value === v)) { const o = document.createElement('option'); o.value = v; o.textContent = v; el.append(o); }
        el.value = v;
        if (el.value !== v && el.tagName === 'INPUT') { el.type = 'text'; el.value = v; }
        if (el.value !== v) throw new Error(`No se pudo forzar ${n} = «${v}»`);
      }
    }, campos);
  };

  // Lo que se ve en la pantalla de Catálogos (como en catalogos.spec).
  const pantalla = async () => ({
    tipoActual: limpio(await page.locator('#cxNav [aria-current="true"]').innerText()),
    herramientasVisibles: await page.locator('#cxTools').isVisible(),
    cuenta: limpio(await page.locator('#cxCount').innerText()),
    chips: await textos('#cxChips .cx-fchip'),
    subencabezados: await textos('#cxList .cx-subhead'),
    vacio: await textos('#cxList .cx-empty'),
    filas: await textos('#cxList .cx-row'),
    htmlDeNombres: await page.locator('#cxList .cx-name strong').evaluateAll((els) => els.map((e) => e.innerHTML)),
  });

  const registro = {};
  // efecto(d): qué mirar de la base después de guardar (solo en los casos que lo piden).
  const caso = async (grupo, nombre, abrir, campos, { forzados, efecto } = {}) => {
    await cerrar();
    await abrir();
    await page.waitForTimeout(100);
    if (campos) await poner(campos);
    if (forzados) await forzar(forzados);
    const antes = await bd();
    await page.locator('#toasts .toast').evaluateAll((els) => els.forEach((e) => e.remove()));
    await page.locator('#editorForm').evaluate((f) => { f.noValidate = true; f.requestSubmit(); });
    await page.waitForTimeout(250);
    const despues = await bd();
    const r = {
      avisos: (await page.locator('#toasts .toast').allInnerTexts()).map(limpio),
      dialogoCerrado: (await page.locator('#editor[open]').count()) === 0,
      bitacoraNueva: despues.audit.slice(0, despues.audit.length - antes.audit.length).map((a) => `${a.kind} · ${a.detail}${a.oldVal || a.newVal ? ` (${String(a.oldVal).slice(0, 60)} → ${String(a.newVal).slice(0, 60)})` : ''}`),
    };
    if (efecto) r.efecto = efecto(despues);
    (registro[grupo] ??= {})[nombre] = r;
    await cerrar();
  };

  const nuevo = (t) => async () => { await irA('Catálogos'); await tipo(t); await page.locator('#newCatalog').click(); };
  const editar = (t, id) => async () => { await irA('Catálogos'); await tipo(t); await page.locator(`#cxList [data-edit-cat="${id}"]`).click(); };
  const idDe = async (t, nombre) => { const x = (await bd()).catalogs[t].find((y) => y.name === nombre); if (!x) throw new Error(`No existe ${nombre} en ${t}`); return x.id; };
  const editarNombre = (t, nombre) => async () => { const id = await idDe(t, nombre); await editar(t, id)(); };
  // El registro guardado completo (sin la descripción, que es larga).
  const reg = (t, pred) => (d) => { const x = d.catalogs[t].find(pred); if (!x) return 'no existe'; const { detail, ...resto } = x; return resto; };
  const porNombre = (t, nombre) => reg(t, (x) => x.name === nombre);
  const porId = (t, id) => reg(t, (x) => x.id === id);
  const resp = { directAuthority: 'Rectoría', directEvidence: 'Oficio R-001' };

  // ───────────── A · GUARDADO DESDE LA INTERFAZ ─────────────
  await reiniciar();
  // Respaldo (paso 6): autoridad y referencia son dos condiciones; un caso por cada una.
  await caso('A-guardado', 'respaldo: autoridad sin referencia', nuevo('campus'), { directAuthority: 'Rectoría', directEvidence: '', code: 'NUE', name: 'Campus Nuevo' });
  await caso('A-guardado', 'respaldo: referencia con solo espacios', nuevo('campus'), { directAuthority: 'Vicerrectoría', directEvidence: '   ', code: 'NUE', name: 'Campus Nuevo' });
  await caso('A-guardado', 'respaldo: referencia sin autoridad', nuevo('campus'), { directAuthority: '', directEvidence: 'Oficio R-001', code: 'NUE', name: 'Campus Nuevo' });
  // Clave (paso 6).
  await caso('A-guardado', 'clave repetida con otras mayúsculas', nuevo('campus'), { ...resp, code: 'teh', name: 'Campus Nuevo' });
  await caso('A-guardado', 'clave solo con espacios', nuevo('campus'), { ...resp, code: '   ', name: 'Campus Nuevo' });
  await caso('A-guardado', 'alta con espacios alrededor de la clave', nuevo('campus'), { ...resp, code: '  NUE  ', name: 'Campus Nuevo' }, { efecto: porNombre('campus', 'Campus Nuevo') });
  await caso('A-guardado', 'clave repetida contra una guardada con espacios', nuevo('campus'), { ...resp, code: 'NUE', name: 'Campus Otro' });
  // Cambio de campus de una carrera (paso 4): fecha y motivo son dos condiciones.
  await caso('A-guardado', 'carrera: cambio de campus con motivo y sin fecha', editar('carreras', 1), { ...resp, parentCode: 'JUC', movementReason: 'Reubicación', movementDate: '' });
  // Sin cambio de campus, la fecha futura la revisa el paso 7 (otro aviso).
  await caso('A-guardado', 'carrera: sin cambio de campus y fecha futura', editar('carreras', 2), { ...resp, name: 'Ingeniería de Petróleos y Gas', movementDate: '2027-01-15' });
  await caso('A-guardado', 'carrera: sin cambio de campus, renombrar', editar('carreras', 2), { ...resp, name: 'Ingeniería de Petróleos y Gas', movementReason: 'Ajuste de denominación' }, { efecto: porId('carreras', 2) });
  // Cierre de vigencia y cambio de clave cuando NO hay registros vinculados (sí se permiten).
  // Antes de fix/catalogos-clave-espacios la clave se guardaba con espacios, se aceptaba otro «NUE» y este
  // registro ya no se podía guardar. Ahora se guarda «NUE», el duplicado se rechaza y esta edición sí se guarda.
  await caso('A-guardado', 'editar el registro con espacios en la clave cuando ya existe sin espacios', editarNombre('campus', 'Campus Nuevo'), { ...resp, detail: 'Sede nueva' });
  await caso('A-guardado', 'campus: cambiar la clave sin relaciones', editarNombre('campus', 'Campus Nuevo'), { ...resp, code: 'NUE2' }, { efecto: porNombre('campus', 'Campus Nuevo') });
  await caso('A-guardado', 'campus: cerrar la vigencia sin carreras', editarNombre('campus', 'Campus Nuevo'), { ...resp, status: 'Histórico' }, { efecto: porNombre('campus', 'Campus Nuevo') });
  // Cierre con vinculados: la carrera 4 tiene un plan vigente (se rechaza). El caso con vinculados solo históricos va con las materias.
  await caso('A-guardado', 'carrera: cerrar con un plan vigente', editar('carreras', 4), { ...resp, status: 'Histórico' });
  // Editar sin cambiar nada: hay bitácora, pero no versiones nuevas.
  await caso('A-guardado', 'editar sin cambiar nada', editar('categorias', 2), { ...resp }, { efecto: porId('categorias', 2) });
  // Parámetros.
  await caso('A-guardado', 'parámetro: cambiar valor y unidad', editar('parametros', 1), { ...resp, paramValue: '40', paramUnit: 'Horas' }, { efecto: porId('parametros', 1) });
  await caso('A-guardado', 'parámetro: valor vacío', editar('parametros', 1), { ...resp, paramValue: '' }, { efecto: porId('parametros', 1) });
  // Opciones de captura: nombre repetido en el grupo, ignorando mayúsculas y espacios; en otro grupo sí se permite.
  await caso('A-guardado', 'opciones: mismo nombre con mayúsculas y espacios en el mismo grupo', nuevo('opciones'), { ...resp, code: 'OPC-X1', name: '  PRESENCIAL ', group: 'Modalidad de curso', appliesTo: 'Ambos' });
  await caso('A-guardado', 'opciones: mismo nombre en otro grupo', nuevo('opciones'), { ...resp, code: 'OPC-X2', name: 'Presencial', group: 'Vinculación', appliesTo: 'Informe de Actividades', selectionMode: 'Múltiple' }, { efecto: reg('opciones', (x) => x.code === 'OPC-X2') });
  await caso('A-guardado', 'opciones: editar la propia opción sin cambiar el nombre', editar('opciones', 1), { ...resp, appliesTo: 'Ambos' }, { efecto: porId('opciones', 1) });
  await caso('A-guardado', 'opciones: grupo nuevo con espacios alrededor', nuevo('opciones'), { ...resp, code: 'OPC-X3', name: 'Opción con grupo', group: '__NEW__', groupCustom: '  Grupo con espacios  ', appliesTo: 'Plan de Trabajo' }, { efecto: reg('opciones', (x) => x.code === 'OPC-X3') });
  await caso('A-guardado', 'opciones: grupo nuevo con solo espacios', nuevo('opciones'), { ...resp, code: 'OPC-X4', name: 'Otra opción', group: '__NEW__', groupCustom: '   ', appliesTo: 'Ambos' });
  // Materias: alta (historial «Alta del registro») y edición conservando un plan histórico.
  await caso('A-guardado', 'materia: alta', nuevo('materias'), { ...resp, code: 'IC-M99', name: 'Materia Nueva', parentCode: 'IC-2024' }, { efecto: porNombre('materias', 'Materia Nueva') });
  await caso('A-guardado', 'materia: editar conservando un plan histórico', editar('materias', 1), { ...resp, name: 'Programación Estructurada I' }, { efecto: porId('materias', 1) });
  await caso('A-guardado', 'materia: pasar del plan histórico al vigente', editar('materias', 2), { ...resp, parentCode: 'IC-2024', movementReason: 'Actualización del plan' }, { efecto: porId('materias', 2) });
  // Un plan nuevo con una sola materia, histórica: cerrarlo sí se permite (solo cuentan los vinculados vigentes).
  await caso('A-guardado', 'plan: alta', nuevo('planes'), { ...resp, code: 'PLAN-C', name: 'Plan para cerrar', parentCode: 'REF-TEH-01' });
  await caso('A-guardado', 'materia histórica: pasar al plan nuevo', editar('materias', 3), { ...resp, parentCode: 'PLAN-C', movementReason: 'Prueba de cierre' });
  await caso('A-guardado', 'plan: cerrar con materias solo históricas', editarNombre('planes', 'Plan para cerrar'), { ...resp, status: 'Histórico' }, { efecto: porNombre('planes', 'Plan para cerrar') });

  // ───────────── B · FORMULARIO FORZADO ─────────────
  await caso('B-forzado', 'alta de materia con un plan histórico', nuevo('materias'), { ...resp, code: 'IC-M98', name: 'Materia Forzada' }, { forzados: { parentCode: 'IC-2016' } });
  await caso('B-forzado', 'alta de carrera con un campus que no existe', nuevo('carreras'), { ...resp, code: 'CAR-Z', name: 'Carrera Forzada' }, { forzados: { parentCode: 'ZZZ' } });
  await caso('B-forzado', 'editar materia: pasar a un plan que no existe', editar('materias', 3), { ...resp, movementReason: 'Prueba' }, { forzados: { parentCode: 'IC-2099' } });
  await caso('B-forzado', 'fecha con otro formato', editar('carreras', 3), { ...resp }, { forzados: { movementDate: '02/11/2026' } });
  await caso('B-forzado', 'valor del parámetro no numérico', editar('parametros', 1), { ...resp }, { forzados: { paramValue: 'abc' } });
  await caso('B-forzado', 'autoridad que no es Rectoría ni Vicerrectoría', nuevo('campus'), { code: 'NUE3', name: 'Campus Forzado' }, { forzados: { directAuthority: 'Secretaría', directEvidence: 'Oficio S-1' } });
  await caso('B-forzado', 'opciones: documento que no existe', nuevo('opciones'), { ...resp, code: 'OPC-X5', name: 'Opción forzada', group: 'Vinculación' }, { forzados: { appliesTo: 'Otro documento' } });
  await caso('B-forzado', 'estado que no es Vigente ni Histórico', nuevo('campus'), { ...resp, code: 'NUE4', name: 'Campus Cerrado' }, { forzados: { status: 'Cerrado' }, efecto: porNombre('campus', 'Campus Cerrado') });

  // ───────────── C · PANTALLA ─────────────
  registro['C-pantalla'] = {};
  const P = registro['C-pantalla'];
  // Catálogo vacío (Distinciones no trae registros) y su botón «Nuevo registro».
  await irA('Catálogos'); await tipo('distinciones');
  P['distinciones · vacío'] = await pantalla();
  await page.locator('#cxList [data-cx-act="new"]').click(); await page.waitForTimeout(150);
  P['distinciones · botón «Nuevo registro»'] = { titulo: limpio(await page.locator('#modalTitle').innerText()), seccion: limpio(await page.locator('#modalEyebrow').innerText()) };
  await cerrar();
  // Teclado en la lista de tipos: flechas (dan la vuelta), Inicio y Fin. Solo mueven el foco.
  const enfocado = () => page.locator('#cxNav').evaluate((n) => n.getRootNode().activeElement?.dataset.cxType ?? null);
  await page.locator('#cxNav [data-cx-type]').first().focus();
  const teclas = [];
  for (const k of ['ArrowDown', 'ArrowDown', 'ArrowUp', 'ArrowUp', 'End', 'ArrowDown', 'Home', 'Enter']) { await page.keyboard.press(k); await page.waitForTimeout(50); teclas.push(`${k} → ${await enfocado()}`); }
  P['teclado en la lista de tipos'] = { teclas, tipoActual: limpio(await page.locator('#cxNav [aria-current="true"]').innerText()) };
  // Búsqueda y chips combinados.
  await tipo('materias');
  await buscar('Programación'); P['materias · buscar «Programación»'] = await pantalla();
  await chip('Vigente'); P['materias · buscar y chip Vigentes'] = await pantalla();
  await chip('Histórico'); P['materias · buscar y chip Históricos'] = await pantalla();
  await buscar(''); P['materias · sin búsqueda y chip Históricos'] = await pantalla();
  // Grupo y búsqueda en Opciones de captura.
  await tipo('opciones');
  await page.locator('#cxGroup').selectOption('Modalidad de curso'); await page.waitForTimeout(100);
  await buscar('vir'); P['opciones · grupo y búsqueda'] = await pantalla();
  await buscar('presencial'); await page.locator('#cxGroup').selectOption('all'); await page.waitForTimeout(100);
  P['opciones · todos los grupos y búsqueda'] = await pantalla();
  // Datos que la interfaz no crea: una carrera cuyo campus no existe, con HTML en el nombre, y un parámetro sin valor.
  await page.evaluate((k) => {
    const d = JSON.parse(localStorage.getItem(k));
    d.catalogs.carreras.push({ id: 90, code: 'REF-X-90', name: 'Carrera <b>sin</b> campus & más', detail: '<i>detalle</i>', parentCode: 'NOEXISTE', status: 'Vigente' });
    d.catalogs.parametros.push({ id: 90, code: 'PAR-SIN', name: 'Parámetro sin valor', detail: '', status: 'Vigente' });
    localStorage.setItem(k, JSON.stringify(d));
  }, CLAVE_BD);
  await page.goto('/'); await entrar();
  await irA('Catálogos'); await tipo('carreras');
  await buscar('<b>sin</b>'); P['carreras · campus inexistente y HTML en el nombre (se busca en el texto guardado)'] = await pantalla();
  await buscar('detalle'); P['carreras · buscar en la descripción'] = await pantalla();
  await tipo('parametros'); P['parámetros · uno sin valor'] = await pantalla();

  expect(errores, 'errores de consola').toEqual([]);
  expect(JSON.stringify(registro, null, 2)).toMatchSnapshot('catalogos-reglas.json');
});
