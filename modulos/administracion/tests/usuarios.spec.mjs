// Prueba de la pantalla «Usuarios y permisos»: tarjetas por rol, lista y filtros, diálogo según el rol y el campus,
// historiales (roles, adscripción y carrera), panel de permisos por rol e importación de usuarios desde CSV.
// (El guardado y sus avisos ya los vigila reglas-formulario; aquí se vigila lo que se VE y cómo reacciona.)
// Compara TEXTO (no imágenes).
import { test, expect } from '@playwright/test';
import { CLAVE_BD, FECHA_FIJA, enviarAcceso, normalizar } from './ayudantes.mjs';

test('usuarios: pantalla, diálogo, historiales, permisos e importación CSV', async ({ page }) => {
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
  const modificarBd = async (cuerpo) => {
    await page.evaluate(([k, c]) => { const d = JSON.parse(localStorage.getItem(k)); new Function('d', c)(d); localStorage.setItem(k, JSON.stringify(d)); }, [CLAVE_BD, cuerpo]);
    await page.goto('/'); await entrar();
  };
  const limpio = (t) => normalizar(String(t).replace(/\s+/g, ' ').trim());
  const textos = async (sel) => (await page.locator(sel).allInnerTexts()).map(limpio);
  const cerrar = async () => { if (await page.locator('#editor[open]').count()) { await page.keyboard.press('Escape'); await page.waitForTimeout(100); } };
  const elegir = async (id, valor) => { await page.locator('#' + id).evaluate((s, v) => { s.value = v; s.dispatchEvent(new Event('change', { bubbles: true })); }, valor); await page.waitForTimeout(100); };
  const buscar = async (q) => { await page.locator('#userSearch').fill(q); await page.waitForTimeout(100); };
  const avisos = async () => (await page.locator('#toasts .toast').allInnerTexts()).map(limpio);
  const sinAvisos = () => page.locator('#toasts .toast').evaluateAll((els) => els.forEach((e) => e.remove()));

  // #userCompactCount: renderUsers lo llena solo si existe; hoy la vista no lo tiene (se registra como null).
  const cuentaCompacta = async () => ((await page.locator('#userCompactCount').count()) ? limpio(await page.locator('#userCompactCount').innerText()) : null);
  const pantalla = async () => ({
    tarjetas: await textos('#userRoleStats > *'),
    cuenta: await cuentaCompacta(),
    filas: await textos('#userRows tr'),
  });

  // Resumen del diálogo abierto: campos (visible, obligatorio, valor, opciones), historiales y si el de roles está plegado.
  const dialogo = () => page.locator('#editor').evaluate((d) => {
    const t = (s) => String(s ?? '').replace(/\s+/g, ' ').trim();
    const campos = [...d.querySelectorAll('#modalContent [name]')].map((el) => {
      const c = { nombre: el.name, visible: el.checkVisibility(), obligatorio: el.required, valor: el.value };
      if (el.placeholder) c.placeholder = el.placeholder;
      if (el.tagName === 'SELECT') c.opciones = [...el.options].map((o) => `${o.value}${o.text !== o.value ? '=' + t(o.text) : ''}${o.selected ? ' ✓' : ''}`);
      return c;
    });
    return {
      titulo: t(d.querySelector('#modalTitle').textContent),
      seccion: t(d.querySelector('#modalEyebrow').textContent),
      campos,
      historiales: [...d.querySelectorAll('#modalContent details')].map((x) => `${x.className}: ${t(x.textContent)}`),
      ayuda: [...d.querySelectorAll('#modalContent .modal-intro')].map((x) => t(x.textContent)),
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
    await sinAvisos();
    await page.locator('#editorForm').evaluate((f) => { f.noValidate = true; f.requestSubmit(); });
    await page.waitForTimeout(250);
    return avisos();
  };
  const editar = async (id) => { await irA('Usuarios'); await page.locator(`#view-usuarios [data-user="${id}"]`).click(); await page.waitForTimeout(150); };
  const nuevo = async () => { await irA('Usuarios'); await page.locator('#newUser').click(); await page.waitForTimeout(150); };

  const registro = {};

  // ───────────── 1) Pantalla, lista y filtros ─────────────
  await reiniciar();
  await irA('Usuarios');
  registro.pantalla = {
    inicial: await pantalla(),
    opcionesDeRol: await page.locator('#userRole option').evaluateAll((os) => os.map((o) => o.textContent.trim())),
  };
  await buscar('Aguilar'); registro.pantalla['buscar «Aguilar» (nombre)'] = await pantalla();
  await buscar('900003'); registro.pantalla['buscar «900003» (número)'] = await pantalla();
  await buscar('administracion@'); registro.pantalla['buscar por correo'] = await pantalla();
  await buscar('');
  await elegir('userRole', 'Jefe de carrera'); registro.pantalla['rol Jefe de carrera'] = await pantalla();
  await elegir('userRole', 'all');
  await elegir('userStatus', 'Inactivo'); registro.pantalla['estado Inactivo'] = await pantalla();
  await elegir('userStatus', 'all');

  // ───────────── 2) Diálogo según el rol y el campus ─────────────
  registro.dialogo = {};
  await nuevo();
  registro.dialogo['nuevo'] = await dialogo();
  await poner({ role: 'Docente', area: 'Ixtepec' });
  registro.dialogo['nuevo · Docente en Ixtepec'] = await dialogo();
  await poner({ role: 'Rectoría' });
  registro.dialogo['nuevo · cambiar a Rectoría'] = await dialogo();
  await cerrar();
  await editar(1);
  registro.dialogo['editar · administración general (#1)'] = await dialogo();
  await cerrar();
  await editar(2);
  registro.dialogo['editar · docente (#2)'] = await dialogo();
  await poner({ area: 'Juchitán' });
  registro.dialogo['editar · docente (#2) · cambiar a Juchitán'] = await dialogo();
  await cerrar();
  await editar(3);
  registro.dialogo['editar · jefe de carrera (#3)'] = await dialogo();
  await cerrar();

  // ───────────── 3) Historiales y adscripción anterior ─────────────
  registro.historiales = {};
  await editar(2);
  await poner({ careerCode: 'REF-TEH-01', movementReason: 'Reasignación de carrera' });
  registro.historiales['cambiar carrera del #2 · avisos'] = await enviar();
  await editar(2);
  registro.historiales['#2 tras cambiar de carrera'] = await dialogo();
  await cerrar();
  await editar(1);
  await poner({ area: 'Tehuantepec', movementReason: 'Reasignación', movementDate: '2026-11-02' });
  registro.historiales['cambiar adscripción del #1 · avisos'] = await enviar();
  await editar(1);
  registro.historiales['#1 tras cambiar de adscripción'] = await dialogo();
  await cerrar();
  await modificarBd("d.users.find(u => u.id === 5).area = 'Campus Antiguo';");
  await editar(5);
  registro.historiales['#5 con adscripción que ya no existe'] = await dialogo();
  await cerrar();

  // ───────────── 4) Panel de permisos por rol ─────────────
  await reiniciar();
  await irA('Usuarios');
  const permisos = async () => ({
    rol: await page.locator('#permissionRole').inputValue(),
    casillas: await page.locator('#permissionCheckboxes label').evaluateAll((ls) => ls.map((l) => `${l.querySelector('input').checked ? '☑' : '☐'} ${l.textContent.trim()}`)),
  });
  // El panel vive dentro de un <details> plegado («Configuración de permisos por rol»): primero se despliega.
  const plegado = async () => !(await page.locator('#view-usuarios details.permission-disclosure').evaluate((d) => d.open));
  registro.permisos = { plegadoAlEntrar: await plegado() };
  await page.locator('#view-usuarios details.permission-disclosure > summary').click(); await page.waitForTimeout(100);
  registro.permisos.plegadoTrasDesplegar = await plegado();
  registro.permisos.inicial = await permisos();
  await elegir('permissionRole', 'Jefe de carrera');
  registro.permisos['rol Jefe de carrera'] = await permisos();
  await sinAvisos();
  const antes = (await bd()).audit.length;
  await page.locator('#permissionCheckboxes input').first().click(); await page.waitForTimeout(150);
  const despues = await bd();
  registro.permisos['cambiar la primera casilla'] = {
    avisos: await avisos(),
    bitacoraNueva: despues.audit.slice(0, despues.audit.length - antes).map((a) => `${a.kind} · ${a.detail} (${a.oldVal} → ${a.newVal})`),
    guardado: despues.permissions['Jefe de carrera'],
  };
  await irA('Inicio'); await irA('Usuarios');
  registro.permisos['al volver a la pantalla'] = await permisos();

  // ───────────── 5) Importación de usuarios desde CSV ─────────────
  registro.importar = {};
  const importar = async (nombre, contenido) => {
    await reiniciar();
    await irA('Usuarios');
    const antes = await bd();
    await sinAvisos();
    const erroresAntes = errores.length;
    await page.locator('#importUsersFile').setInputFiles({ name: 'usuarios.csv', mimeType: 'text/csv', buffer: Buffer.from(contenido, 'utf8') });
    await page.waitForTimeout(300);
    // Errores de página que provoca la importación: se registran aquí y se quitan de «errores». Antes del
    // fix/importar-csv-selector había uno por importación y el selector de archivo no se vaciaba.
    const erroresDePagina = errores.splice(erroresAntes);
    const despues = await bd();
    const nuevos = despues.users.slice(antes.users.length).map((u) => `${u.num} · ${u.name} · ${u.mail} · ${u.role} · ${u.area} · ${u.status} · ${(u.history || []).join(' | ')}`);
    registro.importar[nombre] = {
      avisos: await avisos(),
      usuariosNuevos: nuevos,
      bitacoraNueva: despues.audit.slice(0, despues.audit.length - antes.audit.length).map((a) => `${a.kind} · ${a.detail}`),
      filas: (await textos('#userRows tr')).length,
      valorDelInput: await page.locator('#importUsersFile').inputValue(),
      erroresDePagina,
    };
  };
  await importar('válido · BOM, acentos, sinónimos y comas entre comillas',
    '﻿Número de empleado,Nombre completo,Correo,Rol,Adscripción,Estado\n' +
    '810001,"Pérez, Ana",ana@unistmo.example,Docente,Tehuantepec,Activo\n' +
    '810002,"Luis ""Lucho"" Gómez",luis@unistmo.example,Rectoría,,Inactivo\n');
  await importar('filas que se omiten',
    'num,name,mail,role,area\n' +
    '900001,Número repetido,rep@unistmo.example,Docente,Tehuantepec\n' +
    '810010,Correo repetido,administracion@unistmo.example,Docente,Tehuantepec\n' +
    '810011,Rol inválido,rol@unistmo.example,Profesor,Tehuantepec\n' +
    'abc,Número con letras,letras@unistmo.example,Docente,Tehuantepec\n' +
    '810012,Segunda administración,admin2@unistmo.example,Administrador general,Institucional\n' +
    '810013,Adscripción inexistente,marte@unistmo.example,Docente,Marte\n' +
    ',Sin número,sin@unistmo.example,Docente,Tehuantepec\n' +
    '810014,Fila válida,valida@unistmo.example,Jefe de carrera,Juchitán\n');
  await importar('faltan columnas', 'num,name,mail\n810020,Alguien,alguien@unistmo.example\n');
  await importar('comillas sin cerrar', 'num,name,mail,role\n810021,"Sin cerrar,x@unistmo.example,Docente\n');
  await importar('solo encabezados', 'num,name,mail,role\n');

  expect(errores, 'errores de consola').toEqual([]);
  expect(JSON.stringify(registro, null, 2)).toMatchSnapshot('usuarios.json');
});
