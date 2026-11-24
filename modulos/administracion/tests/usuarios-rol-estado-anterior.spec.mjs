// Usuarios · rol y estado que la cuenta YA TENÍA (paso 6 de revisar, fix/usuarios-estado-rol).
// La regla rechaza un rol o un estado fuera de la lista («Selecciona un rol institucional válido» / «Selecciona un
// estado válido»), SALVO que sea el que la cuenta ya tenía: una cuenta guardada por una versión anterior con un valor
// que hoy no existe se puede seguir editando. Ninguna cuenta de la semilla tiene un valor así, por eso esta prueba
// prepara una en la base guardada (rol «Invitado», estado «Suspendido») y registra:
//   1) qué muestra el diálogo al abrirla: el rol y el estado anteriores, marcados «(anterior)» y elegidos
//      (fix/usuarios-rol-estado-anterior; antes quedaba la primera opción y guardar cambiaba la cuenta sin aviso);
//   2) que al cambiar solo el nombre se guarda y conserva el rol y el estado anteriores;
//   3) que OTRO rol u OTRO estado fuera de la lista sí se rechaza.
// Compara TEXTO, no imágenes.
import { test, expect } from '@playwright/test';
import { CLAVE_BD, FECHA_FIJA, enviarAcceso, normalizar } from './ayudantes.mjs';

const limpio = (t) => normalizar(String(t).replace(/\s+/g, ' ').trim());

test('usuarios: rol y estado anteriores que ya no están en la lista', async ({ page }) => {
  test.setTimeout(120000);
  const errores = [];
  page.on('pageerror', (e) => errores.push(`pageerror: ${e.message}`));
  page.on('console', (m) => { if (m.type() === 'error') errores.push(`console.error: ${m.text()}`); });
  await page.clock.setFixedTime(FECHA_FIJA);

  const bd = async () => JSON.parse(await page.evaluate((k) => localStorage.getItem(k), CLAVE_BD));

  const entrar = async () => {
    await enviarAcceso(page);
    await expect(page.locator('#app')).toBeVisible();
  };
  // Base de la semilla (el módulo la crea y guarda al montarse, después del acceso) con UNA cuenta docente cambiada
  // a valores antiguos; luego se recarga para que el módulo la lea así.
  await page.goto('/'); await page.evaluate(() => localStorage.clear()); await page.goto('/'); await entrar();
  const id = await page.evaluate((k) => {
    const d = JSON.parse(localStorage.getItem(k));
    const u = d.users.find((x) => x.role === 'Docente');
    // Un rol no académico no lleva categoría docente ni carrera de adscripción (fix/usuarios-rol-estado-anterior: antes
    // la cuenta las conservaba de cuando era docente).
    u.role = 'Invitado'; u.status = 'Suspendido'; delete u.categoryCode; delete u.careerCode;
    localStorage.setItem(k, JSON.stringify(d));
    return u.id;
  }, CLAVE_BD);
  await page.goto('/'); await entrar();
  await page.locator('#ni .ni', { hasText: 'Usuarios' }).click(); await page.waitForTimeout(150);

  const abrir = async () => { await page.locator(`#view-usuarios [data-user="${id}"]`).click(); await page.waitForTimeout(150); };
  const cerrar = async () => { if (await page.locator('#editor[open]').count()) { await page.keyboard.press('Escape'); await page.waitForTimeout(100); } };
  // Fuerza valores en el formulario (en una lista agrega la opción si no existe). No dispara eventos.
  const forzar = (campos) => page.locator('#editorForm').evaluate((form, campos) => {
    for (const [n, v] of Object.entries(campos)) {
      const el = form.elements[n];
      if (!el) throw new Error('No existe el campo ' + n);
      if (el.tagName === 'SELECT' && ![...el.options].some((o) => o.value === v)) { const o = document.createElement('option'); o.value = v; o.textContent = v; el.append(o); }
      el.value = v;
      if (el.value !== v) throw new Error(`No se pudo forzar ${n} = «${v}»`);
    }
  }, campos);
  const enviar = async () => {
    await page.locator('#toasts .toast').evaluateAll((els) => els.forEach((e) => e.remove()));
    const antes = await bd();
    await page.locator('#editorForm').evaluate((f) => { f.noValidate = true; f.requestSubmit(); });
    await page.waitForTimeout(250);
    const despues = await bd();
    const u = despues.users.find((x) => x.id === id);
    return {
      avisos: (await page.locator('#toasts .toast').allInnerTexts()).map(limpio),
      dialogoCerrado: (await page.locator('#editor[open]').count()) === 0,
      bitacoraNueva: despues.audit.slice(0, despues.audit.length - antes.audit.length).map((a) => `${a.kind} · ${a.detail}`),
      cuentaGuardada: { name: u.name, role: u.role, status: u.status },
    };
  };

  const registro = {};

  // 1) Qué muestra el diálogo al abrir la cuenta con valores antiguos
  await abrir();
  registro.dialogoAlAbrir = await page.locator('#editorForm').evaluate((form) => ({
    rol: form.elements.role.value,
    rolEnLaLista: [...form.elements.role.options].some((o) => o.value === 'Invitado'),
    estado: form.elements.status.value,
    estadoEnLaLista: [...form.elements.status.options].some((o) => o.value === 'Suspendido'),
  }));

  // 2) Cambiar solo el nombre, conservando el rol y el estado anteriores
  await forzar({ name: 'Cuenta Anterior', role: 'Invitado', status: 'Suspendido' });
  registro.conservaRolYEstadoAnteriores = await enviar();
  await cerrar();

  // 2b) Desde la interfaz: solo se cambia el nombre; el rol y el estado quedan como el diálogo los muestra
  // (fix/usuarios-rol-estado-anterior). Se conservan.
  await abrir();
  await forzar({ name: 'Cuenta Anterior 2' });
  registro.desdeLaInterfazSeConservan = await enviar();
  await cerrar();

  // 3) Otro rol fuera de la lista (el estado anterior se conserva): se rechaza. Un cambio de rol pide antes fecha y
  // motivo del movimiento (paso 4); se dan para que la revisión del rol (paso 6) sea la que responda.
  await abrir();
  await forzar({ role: 'Visitante', status: 'Suspendido', movementDate: '2026-11-02', movementReason: 'Reasignación' });
  registro.otroRolFueraDeLaLista = await enviar();
  await cerrar();

  // 3b) Otro estado fuera de la lista (el rol anterior se conserva): se rechaza
  await abrir();
  await forzar({ role: 'Invitado', status: 'Bloqueado' });
  registro.otroEstadoFueraDeLaLista = await enviar();
  await cerrar();

  expect(errores, 'errores de consola').toEqual([]);
  expect(JSON.stringify(registro, null, 2)).toMatchSnapshot('usuarios-rol-estado-anterior.json');
});
