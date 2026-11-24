// Prueba de las REGLAS DE USUARIOS que reglas-formulario.spec y usuarios.spec no recorren.
// Archivo aparte, con su propia referencia, para no alterar las huellas de reglas-formulario ni acercarla a su
// límite de tiempo. Mismo método: abre el diálogo, llena campos, envía SIN la validación nativa del navegador y
// anota avisos, si el diálogo se cerró, la bitácora nueva y, en los casos que guardan, la cuenta en la base.
// Cuatro grupos:
//   A · guardado desde la interfaz: cada parte de las condiciones con «o» (fecha y motivo), número y correo con
//       espacios o mayúsculas, administración general inactiva, cambios de rol, categoría y carrera, y sus historiales;
//       categoría y carrera que pasan a históricas (se conservan al editar).
//   B · formulario forzado: valores que la interfaz no ofrece (categoría o carrera histórica en una cuenta nueva,
//       carrera de otro campus, fecha con otro formato, estado o rol que no existen). Muestra QUÉ revisión responde.
//   C · pantalla: búsqueda por adscripción, filtros combinados sin resultados, tarjetas por rol y un nombre con HTML.
//   D · permisos: quitar y volver a poner una casilla (dónde queda el permiso en la lista guardada).
// Compara TEXTO, no imágenes.
import { test, expect } from '@playwright/test';
import { CLAVE_BD, FECHA_FIJA, enviarAcceso, normalizar } from './ayudantes.mjs';

test('reglas de usuarios: guardado, formulario forzado, pantalla y permisos', async ({ page }) => {
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
  const cerrar = async () => { if (await page.locator('#editor[open]').count()) { await page.keyboard.press('Escape'); await page.waitForTimeout(100); } };
  const limpio = (t) => normalizar(String(t).replace(/\s+/g, ' ').trim());
  const textos = async (sel) => (await page.locator(sel).allInnerTexts()).map(limpio);

  // Llena campos como lo haría la persona (solo valores que el formulario acepta), en el orden dado.
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
  // Fuerza valores que la interfaz no ofrece: en una lista agrega la opción; un campo de fecha que no acepta el texto
  // pasa a ser de texto. No dispara eventos (no recalcula nada).
  const forzar = async (campos) => {
    await page.locator('#editorForm').evaluate((form, campos) => {
      for (const [n, v] of Object.entries(campos)) {
        const el = form.elements[n];
        if (!el) throw new Error('No existe el campo ' + n);
        if (el.tagName === 'SELECT' && ![...el.options].some((o) => o.value === v)) { const o = document.createElement('option'); o.value = v; o.textContent = v; el.append(o); }
        el.value = v;
        if (el.value !== v && el.tagName === 'INPUT') { el.type = 'text'; el.value = v; }
        if (el.value !== v) throw new Error(`No se pudo forzar ${n} = «${v}»`);
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
      avisos: (await page.locator('#toasts .toast').allInnerTexts()).map(limpio),
      dialogoCerrado: (await page.locator('#editor[open]').count()) === 0,
      cuentas: `${antes.users.length} → ${despues.users.length}`,
      bitacoraNueva: despues.audit.slice(0, despues.audit.length - antes.audit.length).map((a) => `${a.kind} · ${a.detail}${a.oldVal || a.newVal ? ` (${String(a.oldVal).slice(0, 60)} → ${String(a.newVal).slice(0, 60)})` : ''}`),
    };
    if (efecto) r.efecto = efecto(despues);
    (registro[grupo] ??= {})[nombre] = r;
    await cerrar();
  };

  const nuevo = async () => { await irA('Usuarios'); await page.locator('#newUser').click(); };
  const editar = (id) => async () => { await irA('Usuarios'); await page.locator(`#view-usuarios [data-user="${id}"]`).click(); };
  const cuenta = (pred) => (d) => d.users.find(pred) || 'no existe';
  const porId = (id) => cuenta((u) => u.id === id);
  const porNombre = (n) => cuenta((u) => u.name === n);
  const editarCatalogo = (tipo, id) => async () => { await irA('Catálogos'); await page.locator(`[data-cx-type="${tipo}"]`).click(); await page.locator(`#cxList [data-edit-cat="${id}"]`).click(); };
  const resp = { directAuthority: 'Rectoría', directEvidence: 'Oficio R-001' };
  const alta = (o) => ({ num: '910001', name: 'Cuenta Nueva', mail: 'nueva@unistmo.example', role: 'Rectoría', area: 'Institucional', ...o });
  const mov = { movementDate: '2026-11-02', movementReason: 'Reasignación' };

  // ───────────── A · GUARDADO DESDE LA INTERFAZ ─────────────
  await page.goto('/'); await page.evaluate(() => localStorage.clear()); await page.goto('/'); await entrar();
  // Número y correo (paso 6): espacios y mayúsculas. El campo de correo (type=email) ya quita los espacios.
  await caso('A-guardado', 'alta: número con espacios alrededor', nuevo, alta({ num: '  910001 ' }), { efecto: porNombre('Cuenta Nueva') });
  await caso('A-guardado', 'alta: número repetido contra uno guardado con espacios', nuevo, alta({ num: '910001', name: 'Otra Cuenta', mail: 'otra@unistmo.example' }));
  await caso('A-guardado', 'alta: correo repetido con mayúsculas (el campo de correo quita los espacios solo)', nuevo, alta({ num: '910002', name: 'Otra Cuenta', mail: 'ADMINISTRACION@unistmo.example' }));
  await caso('A-guardado', 'alta: correo vacío', nuevo, alta({ num: '910003', name: 'Sin Correo', mail: '' }), { efecto: porNombre('Sin Correo') });
  // Administración general: una segunda cuenta INACTIVA sí se permite.
  await caso('A-guardado', 'alta: segunda administración general inactiva', nuevo, alta({ num: '910004', name: 'Admin Inactiva', mail: 'admin2@unistmo.example', role: 'Administrador general', status: 'Inactivo' }), { efecto: porNombre('Admin Inactiva') });
  // Adscripción a una institución (Rectoría) y alta de docente en otro campus.
  await caso('A-guardado', 'alta: adscripción Rectoría', nuevo, alta({ num: '910005', name: 'Secretaria Nueva', mail: 'secre@unistmo.example', role: 'Secretaría de Rectoría', area: 'Rectoría' }), { efecto: porNombre('Secretaria Nueva') });
  await caso('A-guardado', 'alta: docente en Ixtepec', nuevo, alta({ num: '910006', name: 'Docente Ixtepec', mail: 'ixt@unistmo.example', role: 'Docente', area: 'Ixtepec', categoryCode: 'CAT-P', careerCode: 'REF-IXT-09' }), { efecto: porNombre('Docente Ixtepec') });
  // Cambio de carrera (paso 1) y de rol (paso 4): fecha y motivo son dos condiciones; un caso por cada una.
  await caso('A-guardado', 'edición: cambio de carrera con motivo y sin fecha', editar(4), { careerCode: 'REF-TEH-01', movementReason: 'Reasignación', movementDate: '' });
  await caso('A-guardado', 'edición: cambio de rol con motivo y sin fecha', editar(3), { role: 'Docente', movementReason: 'Reasignación', movementDate: '' });
  await caso('A-guardado', 'edición: cambio de rol con fecha futura', editar(3), { role: 'Docente', movementReason: 'Reasignación', movementDate: '2027-01-15' });
  // Sin cambio de rol ni de adscripción, la fecha futura la revisa el paso 7 (otro aviso).
  await caso('A-guardado', 'edición: solo el nombre, con fecha futura', editar(6), { name: 'Sergio Juárez V.', movementDate: '2027-01-15' });
  await caso('A-guardado', 'edición: solo el nombre', editar(6), { name: 'Sergio Juárez V.' }, { efecto: porId(6) });
  // Cambio de categoría: no pide motivo ni deja historial de carrera.
  await caso('A-guardado', 'edición: cambio de categoría', editar(7), { categoryCode: 'CAT-P' }, { efecto: porId(7) });
  // De docente a Rectoría: se quitan categoría y carrera (historial de carrera) y queda el historial de roles.
  await caso('A-guardado', 'edición: de docente a Rectoría sin motivo', editar(8), { role: 'Rectoría', movementDate: '2026-11-02' });
  await caso('A-guardado', 'edición: de docente a Rectoría', editar(8), { role: 'Rectoría', ...mov }, { efecto: porId(8) });
  // Categoría histórica: se cierra en Catálogos; una cuenta que ya la tiene se puede seguir editando.
  await caso('A-guardado', 'catálogos: cerrar la categoría «Profesor»', editarCatalogo('categorias', 2), { ...resp, status: 'Histórico' });
  await caso('A-guardado', 'edición: docente con categoría histórica', editar(10), { name: 'Guadalupe Toledo T.' }, { efecto: porId(10) });
  // Carrera histórica: una cuenta pasa a Ingeniería Química, la carrera se cierra y la cuenta se sigue editando.
  await caso('A-guardado', 'edición: cambio de carrera correcto', editar(11), { careerCode: 'REF-TEH-01', ...mov }, { efecto: porId(11) });
  await caso('A-guardado', 'catálogos: cerrar Ingeniería Química', editarCatalogo('carreras', 1), { ...resp, status: 'Histórico' });
  await caso('A-guardado', 'edición: docente con carrera histórica', editar(11), { name: 'Martha Patricia Luna G.' }, { efecto: porId(11) });

  // ───────────── B · FORMULARIO FORZADO ─────────────
  const docente = (o) => alta({ num: '920001', name: 'Docente Forzado', mail: 'forzado@unistmo.example', role: 'Docente', area: 'Tehuantepec', categoryCode: 'CAT-PI', careerCode: 'REF-TEH-04', ...o });
  await caso('B-forzado', 'alta: categoría histórica', nuevo, docente(), { forzados: { categoryCode: 'CAT-P' } });
  await caso('B-forzado', 'edición: pasar a la categoría histórica', editar(3), {}, { forzados: { categoryCode: 'CAT-P' } });
  await caso('B-forzado', 'alta: carrera histórica', nuevo, docente(), { forzados: { careerCode: 'REF-TEH-01' } });
  await caso('B-forzado', 'alta: carrera de otro campus', nuevo, docente(), { forzados: { careerCode: 'REF-JUC-12' } });
  await caso('B-forzado', 'edición: fecha con otro formato', editar(9), { name: 'Silvia Reyes J.' }, { forzados: { movementDate: '02/11/2026' } });
  await caso('B-forzado', 'alta: estado que no es Activo ni Inactivo', nuevo, alta({ num: '920002', name: 'Cuenta Suspendida', mail: 'susp@unistmo.example' }), { forzados: { status: 'Suspendido' }, efecto: porNombre('Cuenta Suspendida') });
  await caso('B-forzado', 'alta: rol que no existe', nuevo, alta({ num: '920003', name: 'Cuenta Invitada', mail: 'inv@unistmo.example' }), { forzados: { role: 'Invitado' }, efecto: porNombre('Cuenta Invitada') });

  // ───────────── C · PANTALLA ─────────────
  registro['C-pantalla'] = {};
  const P = registro['C-pantalla'];
  const pantalla = async () => ({
    tarjetas: await textos('#userRoleStats .user-stat'),
    filas: await textos('#userRows tr'),
    htmlDeNombres: await page.locator('#userRows .cell-strong').evaluateAll((els) => els.map((e) => e.innerHTML)),
  });
  const filtros = async ({ q = '', rol = 'all', estado = 'all' }) => {
    await page.locator('#userRole').selectOption(rol); await page.locator('#userStatus').selectOption(estado);
    await page.locator('#userSearch').fill(q); await page.waitForTimeout(150);
  };
  await caso('C-pantalla-alta', 'alta: nombre con HTML', nuevo, alta({ num: '930001', name: 'Ana <b>Ruiz</b> & Cía', mail: 'html@unistmo.example' }));
  await irA('Usuarios');
  await filtros({ q: 'Rectoría' }); P['buscar por adscripción «Rectoría» (ningún nombre ni correo la contiene)'] = await pantalla();
  await filtros({ q: '<b>' }); P['nombre con HTML'] = await pantalla();
  await filtros({ rol: 'Docente', estado: 'Inactivo' }); P['Docente e Inactivo: sin resultados'] = await pantalla();
  await filtros({ rol: 'Administrador general' }); P['Administrador general (una activa y una inactiva)'] = await pantalla();
  await filtros({});

  // ───────────── D · PERMISOS ─────────────
  // Quitar y volver a poner la primera casilla de «Docente»: el permiso vuelve a su lugar en la lista guardada
  // (antes de fix/usuarios-orden-permisos quedaba al final).
  const panel = page.locator('#permissionPanel');
  if (!(await panel.isVisible())) await page.locator('details:has(#permissionPanel) > summary').click();
  await page.locator('#permissionRole').selectOption('Docente'); await page.waitForTimeout(100);
  const permisosDe = async (rol) => (await bd()).permissions[rol];
  const antesP = await permisosDe('Docente');
  const casilla = page.locator('#permissionCheckboxes input').first();
  await casilla.click(); await page.waitForTimeout(100);
  const sinElla = await permisosDe('Docente');
  await casilla.click(); await page.waitForTimeout(100);
  registro['D-permisos'] = { antes: antesP, alQuitarLaPrimera: sinElla, alVolverAPonerla: await permisosDe('Docente') };

  expect(errores, 'errores de consola').toEqual([]);
  expect(JSON.stringify(registro, null, 2)).toMatchSnapshot('usuarios-reglas.json');
});
