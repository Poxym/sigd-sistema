// Prueba de las REGLAS DE SOLICITUDES que reglas-formulario.spec no recorre (registrar y gestionar).
// Archivo aparte, con su propia referencia, para no alterar las huellas de reglas-formulario ni acercarla a su
// límite de tiempo. Mismo método: abre el diálogo, llena campos, envía SIN la validación nativa del navegador y
// anota avisos, si el diálogo se cerró, la bitácora nueva y, en los casos que guardan, el efecto en la base.
// Cuatro grupos:
//   A · registrar: cada regla de «el cambio pedido» (v39ValidateChange).
//   B · gestionar: vigencia ejecutada antes de tiempo, aplicar con éxito (inmediata y programada), «ya contiene
//       el valor» y una regla que se vuelve a revisar al aplicar.
//   C · formulario forzado: valores que la interfaz no ofrece (otra acción, otro catálogo). Muestra QUÉ revisión
//       responde primero; varias revisiones posteriores nunca se alcanzan (ver CLAUDE.md, «Limpieza pendiente»).
//   D · datos de una versión anterior: una solicitud programada y autorizada que no guardó su vigencia.
// Compara TEXTO, no imágenes.
import { test, expect } from '@playwright/test';
import { CLAVE_BD, FECHA_FIJA, enviarAcceso, normalizar } from './ayudantes.mjs';

test('reglas de solicitudes: registrar, gestionar, formulario forzado y datos anteriores', async ({ page }) => {
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
  // Fuerza valores que la interfaz no ofrece: en una lista agrega la opción y, si el diálogo no tiene el campo,
  // lo crea oculto (como un envío manipulado). No dispara eventos (no recalcula nada).
  const forzar = async (campos) => {
    await page.locator('#editorForm').evaluate((form, campos) => {
      for (const [n, v] of Object.entries(campos)) {
        let el = form.elements[n];
        // Dentro de #modalContent, que se vuelve a pintar al abrir cada diálogo: el campo creado no pasa al siguiente caso.
        if (!el) { el = document.createElement('input'); el.type = 'hidden'; el.name = n; form.querySelector('#modalContent').append(el); }
        if (el.tagName === 'SELECT' && ![...el.options].some((o) => o.value === v)) { const o = document.createElement('option'); o.value = v; o.textContent = v; el.append(o); }
        [...(el.options || [])].forEach((o) => { o.disabled = false; });
        el.value = v;
        if (el.value !== v) throw new Error(`No se pudo forzar ${n} = «${v}» (${el.constructor.name} ${el.tagName || ''} ${el.length ?? ''})`);
      }
    }, campos);
  };

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
      avisos: (await page.locator('#toasts .toast').allInnerTexts()).map((t) => normalizar(t.replace(/\s+/g, ' ').trim())),
      dialogoCerrado: (await page.locator('#editor[open]').count()) === 0,
      solicitudes: `${antes.requests.length} → ${despues.requests.length}`,
      bitacoraNueva: despues.audit.slice(0, despues.audit.length - antes.audit.length).map((a) => `${a.kind} · ${a.detail}${a.oldVal || a.newVal ? ` (${String(a.oldVal).slice(0, 60)} → ${String(a.newVal).slice(0, 60)})` : ''}`),
    };
    if (efecto) r.efecto = efecto(despues);
    (registro[grupo] ??= {})[nombre] = r;
    await cerrar();
  };

  const idDe = async (titulo) => (await bd()).requests.find((x) => x.title === titulo)?.id;
  const nuevaSolicitud = async () => { await irA('Solicitudes'); await page.locator('#newRequest').click(); };
  const gestionar = (titulo) => async () => {
    const id = await idDe(titulo);
    if (!id) throw new Error('No existe la solicitud ' + titulo);
    await irA('Solicitudes');
    await page.locator(`#requestRows [data-rq="${id}"]`).click();
    await page.locator('#requestDetail [data-rq-open]').click();
  };
  const nuevoCatalogo = (tipo) => async () => { await irA('Catálogos'); await page.locator(`[data-cx-type="${tipo}"]`).click(); await page.locator('#newCatalog').click(); };
  const solicitudDe = (titulo) => (d) => { const s = d.requests.find((x) => x.title === titulo); return s && { status: s.status, appliedAt: s.appliedAt, beforeValue: s.beforeValue, afterValue: s.afterValue, effectiveDate: s.effectiveDate, expectedBefore: s.expectedBefore }; };
  const registroDe = (cat, id, titulo) => (d) => {
    const x = d.catalogs[cat].find((y) => y.id === id);
    return { registro: { name: x.name, status: x.status, updatedAt: x.updatedAt, cambio: x.changeHistory?.[0] }, solicitud: titulo ? solicitudDe(titulo)(d) : undefined };
  };

  const base = { type: 'Campus / carrera', authority: 'Vicerrectoría', schedule: 'Inmediata', evidence: 'Oficio de prueba', detail: 'Justificación de prueba' };
  const pedir = (title, targetCatalog, targetId, targetField, targetValue, extra = {}) => ({ ...base, title, targetCatalog, targetId: String(targetId), targetField, targetValue, ...extra });
  const instr = (o) => ({ transition: 'Registrar instrucción recibida', authorizationBy: 'Vicerrectoría', authorizationDate: '2026-11-02', authEvidence: 'Oficio VR-100', ...o });
  const apl = (o) => ({ transition: 'Marcar como aplicada', appliedAt: '2026-11-02', executionNote: 'Aplicado en prueba', ...o });

  // ───────────── A · REGISTRAR: reglas del cambio pedido ─────────────
  await reiniciar();
  await caso('A-registrar', 'catálogo que no existe', nuevaSolicitud, pedir('A1', 'campus', 1, 'name', 'Otro'), { forzados: { targetCatalog: 'inexistente' } });
  await caso('A-registrar', 'registro que no existe', nuevaSolicitud, pedir('A2', 'campus', 1, 'name', 'Otro'), { forzados: { targetId: '999' } });
  await caso('A-registrar', 'campo que no se puede modificar (clave)', nuevaSolicitud, pedir('A3', 'campus', 1, 'name', 'Otro'), { forzados: { targetField: 'code' } });
  await caso('A-registrar', 'valor vacío', nuevaSolicitud, pedir('A4', 'campus', 1, 'name', ''));
  await caso('A-registrar', 'valor con solo espacios', nuevaSolicitud, pedir('A5', 'campus', 1, 'name', '   '));
  await caso('A-registrar', 'nombre repetido (otro registro)', nuevaSolicitud, pedir('A6', 'campus', 1, 'name', 'Juchitán'));
  await caso('A-registrar', 'nombre repetido en mayúsculas', nuevaSolicitud, pedir('A7', 'campus', 1, 'name', 'JUCHITÁN'));
  await caso('A-registrar', 'estado que no es Vigente ni Histórico', nuevaSolicitud, pedir('A8', 'campus', 1, 'status', 'Cerrado'));
  await caso('A-registrar', 'unidad no admitida', nuevaSolicitud, pedir('A9', 'parametros', 1, 'paramUnit', 'Metros', { type: 'Parámetro / peso' }));
  await caso('A-registrar', 'desactivar un campus con carreras vigentes', nuevaSolicitud, pedir('A10', 'campus', 1, 'status', 'Histórico'));
  await caso('A-registrar', 'unidad admitida: correcta', nuevaSolicitud, pedir('Unidad del umbral', 'parametros', 1, 'paramUnit', 'Puntos', { type: 'Parámetro / peso' }), { efecto: solicitudDe('Unidad del umbral') });
  await caso('A-registrar', 'desactivar una carrera sin planes: correcta', nuevaSolicitud, pedir('Baja de Ingeniería Química', 'carreras', 1, 'status', 'Histórico'), { efecto: solicitudDe('Baja de Ingeniería Química') });
  await caso('A-registrar', 'el mismo nombre que ya tiene: correcta', nuevaSolicitud, pedir('Mismo nombre', 'campus', 2, 'name', 'Juchitán'), { efecto: solicitudDe('Mismo nombre') });
  await caso('A-registrar', 'renombrar un campus: correcta', nuevaSolicitud, pedir('Renombrar Ixtepec', 'campus', 3, 'name', 'Ixtepec Centro'), { efecto: solicitudDe('Renombrar Ixtepec') });
  await caso('A-registrar', 'programada: correcta', nuevaSolicitud, pedir('Programada', 'campus', 3, 'detail', 'Sede de Ixtepec', { schedule: 'Siguiente ciclo', effectiveDate: '2027-02-01' }), { efecto: solicitudDe('Programada') });

  // ───────────── B · GESTIONAR ─────────────
  // Inmediata: instrucción y aplicación con éxito (el registro cambia y queda en su historial).
  await caso('B-gestionar', 'renombrar: instrucción', gestionar('Renombrar Ixtepec'), instr({}));
  await caso('B-gestionar', 'renombrar: aplicar correcta', gestionar('Renombrar Ixtepec'), apl({}), { efecto: registroDe('campus', 3, 'Renombrar Ixtepec') });
  // «Ya contiene el valor indicado»: se registró pidiendo el nombre que el campus ya tiene.
  await caso('B-gestionar', 'mismo nombre: instrucción', gestionar('Mismo nombre'), instr({}));
  await caso('B-gestionar', 'mismo nombre: aplicar', gestionar('Mismo nombre'), apl({}));
  // La regla de «registros vigentes asociados» se revisa otra vez al aplicar: entre el registro y la aplicación
  // se da de alta un plan vigente de esa carrera.
  await caso('B-gestionar', 'baja de carrera: instrucción', gestionar('Baja de Ingeniería Química'), instr({}));
  await caso('B-gestionar', 'alta de un plan de esa carrera', nuevoCatalogo('planes'), { code: 'IQ-2026', name: 'Plan de Ingeniería Química', parentCode: 'REF-TEH-01', directAuthority: 'Rectoría', directEvidence: 'Oficio R-200' });
  await caso('B-gestionar', 'baja de carrera: aplicar con un plan vigente', gestionar('Baja de Ingeniería Química'), apl({}));
  // Programada: la vigencia se adelanta a una fecha ya pasada y se intenta ejecutar antes de esa fecha.
  await caso('B-gestionar', 'programada: instrucción', gestionar('Programada'), instr({ authorizationDate: '2026-10-20', effectiveDate: '2027-02-01' }));
  await caso('B-gestionar', 'programada: adelantar la vigencia', gestionar('Programada'), { transition: 'Guardar fecha programada', effectiveDate: '2026-10-25' });
  await caso('B-gestionar', 'programada: ejecutar antes de la vigencia', gestionar('Programada'), apl({ appliedAt: '2026-10-22' }));
  await caso('B-gestionar', 'programada: aplicar correcta', gestionar('Programada'), apl({}), { efecto: registroDe('campus', 3, 'Programada') });

  // ───────────── C · FORMULARIO FORZADO ─────────────
  await caso('C-forzado', 'aplicar una pendiente', gestionar('Unidad del umbral'), null, { forzados: apl({}) });
  // Una ya aplicada tiene autoridad, fecha y oficio: solo su estado impide volver a aplicarla.
  await caso('C-forzado', 'aplicar otra vez una ya aplicada', gestionar('Renombrar Ixtepec'), null, { forzados: apl({}) });
  await caso('C-forzado', 'instrucción a una autorizada', gestionar('Baja de Ingeniería Química'), null, { forzados: instr({}) });
  await caso('C-forzado', 'instrucción sin referencia', gestionar('Unidad del umbral'), null, { forzados: instr({ authEvidence: '' }) });
  await caso('C-forzado', 'instrucción de una autoridad que no es Rectoría ni Vicerrectoría', gestionar('Unidad del umbral'), null, { forzados: instr({ authorizationBy: 'Secretaría' }) });
  await caso('C-forzado', 'instrucción sin fecha', gestionar('Unidad del umbral'), null, { forzados: instr({ authorizationDate: '' }) });
  await caso('C-forzado', 'aplicar sin fecha de ejecución', gestionar('Baja de Ingeniería Química'), null, { forzados: apl({ appliedAt: '' }) });
  await caso('C-forzado', 'fecha programada en una inmediata', gestionar('Baja de Ingeniería Química'), null, { forzados: { transition: 'Guardar fecha programada', effectiveDate: '2026-11-02' } });
  await caso('C-forzado', 'acción que no existe', gestionar('Baja de Ingeniería Química'), null, { forzados: { transition: 'Acción inventada' } });

  // ───────────── D · DATOS DE UNA VERSIÓN ANTERIOR ─────────────
  // Una solicitud programada y autorizada que no guardó su vigencia (no se puede crear desde la interfaz actual).
  await page.evaluate((k) => {
    const d = JSON.parse(localStorage.getItem(k));
    d.requests.unshift({ id: 90, title: 'Programada sin vigencia', type: 'Campus / carrera', authority: 'Vicerrectoría', schedule: 'Siguiente ciclo', status: 'autorizada', detail: 'Guardada por una versión anterior', targetCatalog: 'campus', targetId: 2, targetField: 'detail', targetValue: 'Sede de Juchitán', evidence: 'Oficio antiguo', authorizationBy: 'Vicerrectoría', authorizationDate: '2026-10-01' });
    localStorage.setItem(k, JSON.stringify(d));
  }, CLAVE_BD);
  await page.goto('/'); await entrar();
  await caso('D-anterior', 'aplicar sin vigencia guardada', gestionar('Programada sin vigencia'), apl({}));
  await caso('D-anterior', 'guardar la vigencia', gestionar('Programada sin vigencia'), { transition: 'Guardar fecha programada', effectiveDate: '2026-10-15' });
  await caso('D-anterior', 'aplicar ya con vigencia', gestionar('Programada sin vigencia'), apl({}), { efecto: registroDe('campus', 2, 'Programada sin vigencia') });

  expect(errores, 'errores de consola').toEqual([]);
  expect(JSON.stringify(registro, null, 2)).toMatchSnapshot('solicitudes-reglas.json');
});
