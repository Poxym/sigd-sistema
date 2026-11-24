// Prueba de COMPATIBILIDAD CON DATOS YA GUARDADOS en el navegador.
// Escribe una base en localStorage ANTES de arrancar, arranca el sistema y registra qué cambió en lo guardado.
// Protege la regla de la ADR-006: la clave y el formato de lo guardado no cambian, para no perder datos.
// Compara TEXTO (rutas que cambiaron y lo que se ve), no imágenes.
import { test, expect } from '@playwright/test';
import { CLAVE_BD, FECHA_FIJA, enviarAcceso, normalizar } from './ayudantes.mjs';

// Lista las rutas que difieren entre dos objetos (p. ej. «users[3].role: "Profesor" → "Docente"»).
function diferencias(a, b, ruta = '', out = []) {
  if (out.length > 80) return out;
  const tipo = (x) => (Array.isArray(x) ? 'array' : x === null ? 'null' : typeof x);
  if (tipo(a) !== tipo(b)) { out.push(`${ruta || '(raíz)'}: ${tipo(a)} → ${tipo(b)}`); return out; }
  if (tipo(a) === 'array') {
    if (a.length !== b.length) out.push(`${ruta}: ${a.length} elementos → ${b.length}`);
    for (let i = 0; i < Math.min(a.length, b.length); i++) diferencias(a[i], b[i], `${ruta}[${i}]`, out);
  } else if (tipo(a) === 'object') {
    for (const k of new Set([...Object.keys(a), ...Object.keys(b)])) {
      const r = ruta ? `${ruta}.${k}` : k;
      if (!(k in a)) out.push(`${r}: (no existía) → agregado`);
      else if (!(k in b)) out.push(`${r}: (existía) → eliminado`);
      else diferencias(a[k], b[k], r, out);
    }
  } else if (a !== b) out.push(`${ruta}: ${JSON.stringify(a)} → ${JSON.stringify(b)}`);
  return out;
}

test('datos guardados: se leen y se conservan al arrancar', async ({ page }) => {
  test.setTimeout(120000);
  const errores = [];
  page.on('pageerror', (e) => errores.push(`pageerror: ${e.message}`));
  page.on('console', (m) => { if (m.type() === 'error') errores.push(`console.error: ${m.text()}`); });
  await page.clock.setFixedTime(FECHA_FIJA);

  const leerBd = () => page.evaluate((k) => localStorage.getItem(k), CLAVE_BD);
  const entrar = async () => {
    await enviarAcceso(page);
    await expect(page.locator('#app')).toBeVisible();
    await page.waitForTimeout(250);
  };
  const irA = async (t) => { await page.locator('#ni .ni', { hasText: t }).click(); await page.waitForTimeout(150); };
  const texto = async (sel) => normalizar((await page.locator(sel).allInnerTexts()).join(' | ').replace(/\s+/g, ' ').trim());

  // Base de partida: la semilla, tal como la deja un primer arranque.
  await page.goto('/');
  await page.evaluate(() => localStorage.clear());
  await page.goto('/');
  await entrar();
  const semilla = JSON.parse(await leerBd());
  expect(semilla, `el sistema no guardó la base en la clave «${CLAVE_BD}» (¿cambió la clave de almacenamiento?)`).not.toBeNull();

  // Escribe «contenido» como texto guardado, recarga, entra y devuelve lo que quedó guardado.
  const arrancarCon = async (contenido) => {
    await page.evaluate(([k, v]) => { localStorage.clear(); localStorage.setItem(k, v); }, [CLAVE_BD, contenido]);
    await page.goto('/');
    await entrar();
    return JSON.parse(await leerBd());
  };

  const registro = {};

  // ───── Forma de lo guardado: partes de la base y campos de cada tipo de registro ─────
  // Se registra aparte porque la base de partida la genera el propio sistema: si el formato cambiara,
  // cambiaría igual al principio y al final, y la comparación de A no lo notaría.
  const campos = (lista) => [...new Set((lista || []).flatMap((x) => Object.keys(x)))].sort();
  registro['forma de lo guardado'] = {
    partes: Object.keys(semilla).sort(),
    users: campos(semilla.users), requests: campos(semilla.requests), audit: campos(semilla.audit),
    period: Object.keys(semilla.period).sort(), periodHistory: campos(semilla.periodHistory),
    tiposDeCatalogo: Object.keys(semilla.catalogs).sort(),
    camposDeCatalogo: Object.fromEntries(Object.entries(semilla.catalogs).map(([k, v]) => [k, campos(v)])),
    rolesConPermisos: Object.keys(semilla.permissions).sort(),
  };

  // ───── A) Formato actual, con datos modificados por el uso ─────
  const usada = structuredClone(semilla);
  usada.users.push({ id: 99, num: '990099', name: 'Cuenta Guardada Antes', mail: 'guardada@unistmo.example', role: 'Docente', area: 'Tehuantepec', status: 'Activo', categoryCode: 'CAT-P', careerCode: 'REF-TEH-04', history: ['Alta inicial'], assignmentHistory: [], careerHistory: [] });
  Object.assign(usada.requests.find((r) => r.id === 2), { status: 'aplicada', appliedAt: '2026-10-20', executionNote: 'Aplicada antes de esta versión' });
  usada.audit.unshift({ id: 999, date: '2026-10-20T10:00:00.000Z', user: 'Administrador general', kind: 'Solicitud', detail: 'Entrada guardada antes de esta versión', oldVal: 'autorizada', newVal: 'aplicada' });
  usada.period.cycle = '2030-2031';
  usada.campoDeOtraVersion = { conservar: true };
  const tras = await arrancarCon(JSON.stringify(usada));
  await irA('Usuarios');
  const usuarios = await texto('#userRows');
  await irA('Solicitudes');
  const solicitudes = await texto('#requestRows');
  await irA('Bitácora');
  const bitacora = await texto('#view-bitacora');
  registro['A · formato actual con datos modificados'] = {
    cambiosAlArrancar: diferencias(usada, tras),
    seVeLaCuentaGuardada: usuarios.includes('Cuenta Guardada Antes'),
    seVeLaSolicitudAplicada: /Actualización de categoría docente\s*Aplicada/i.test(solicitudes),
    seVeLaEntradaDeBitacora: bitacora.includes('Entrada guardada antes de esta versión'),
  };

  // ───── B) Formato antiguo: lo que corrigen las migraciones al arrancar ─────
  const antigua = structuredClone(semilla);
  antigua.users.find((u) => u.id === 4).role = 'Profesor';
  antigua.permissions = { ...antigua.permissions, Profesor: ['Consultar catálogos'] };
  delete antigua.permissions.Docente;
  delete antigua.catalogs.opciones;
  delete antigua.catalogs.distinciones;
  registro['B · formato antiguo (migraciones)'] = { cambiosAlArrancar: diferencias(antigua, await arrancarCon(JSON.stringify(antigua))) };

  // ───── C) Texto guardado dañado y D) falta una parte obligatoria: se usa la semilla ─────
  const danada = await arrancarCon('{esto no es JSON');
  registro['C · JSON dañado'] = { cambiosRespectoALaSemilla: diferencias(semilla, danada) };
  const incompleta = structuredClone(semilla); delete incompleta.audit; incompleta.users = [];
  registro['D · falta la bitácora'] = { cambiosRespectoALaSemilla: diferencias(semilla, await arrancarCon(JSON.stringify(incompleta))) };

  // ───── E) Preferencia de interfaz: el menú lateral recuerda si está plegado (en escritorio) ─────
  const CLAVE_MENU = 'nexora-sidebar-collapsed';
  const menu = async () => ({
    plegado: await page.locator('#shell').evaluate((s) => s.classList.contains('collapsed')),
    guardado: await page.evaluate((k) => localStorage.getItem(k), CLAVE_MENU),
  });
  // El menú lateral propio del módulo (#shell con #collapse y #sidebarToggle) existe, pero dentro del marco del SIGD
  // no se muestra (el marco usa su propio menú). El código igual lee y guarda la preferencia: se pulsa el botón desde
  // el código para recorrer el mismo camino, y se registra que los botones no se ven.
  const alternar = async () => { await page.locator('#collapse').evaluate((b) => b.click()); await page.waitForTimeout(100); };
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.evaluate((k) => localStorage.setItem(k, 'true'), CLAVE_MENU);
  await page.goto('/'); await entrar();
  const botonesVisibles = { collapse: await page.locator('#collapse').isVisible(), sidebarToggle: await page.locator('#sidebarToggle').isVisible() };
  const alArrancar = await menu();
  await alternar();
  const trasDesplegar = await menu();
  await alternar();
  const trasPlegar = await menu();
  await page.goto('/'); await entrar();
  registro['E · menú lateral plegado'] = { botonesVisibles, alArrancar, trasDesplegar, trasPlegar, trasRecargar: await menu() };

  expect(errores, 'errores de consola').toEqual([]);
  expect(JSON.stringify(registro, null, 2)).toMatchSnapshot('datos-guardados.json');
});
