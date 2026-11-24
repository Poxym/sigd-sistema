// Prueba de las MIGRACIONES DE ARRANQUE: lo que el sistema corrige en una base guardada por una versión anterior.
// Cada caso escribe en localStorage una base «vieja» ANTES de arrancar, arranca y registra qué cambió en lo guardado.
// datos-guardados.spec parte de una base que ya pasó por las migraciones; aquí se les quita a propósito lo que agregan,
// para que cada migración tenga algo que hacer:
//   1. normalizeLegacyRelations (carreras, planes y materias sin padre)
//   2. db.permissions y db.periodHistory faltantes
//   3. v41Initialize (opciones, comisiones, rubros, parámetro REB-UMBRAL y fechas académicas del periodo)
//   4. v41Initialize no sobrescribe secciones de rubros que ya existen (??=)
// Compara TEXTO, no imágenes.
import { test, expect } from '@playwright/test';
import { CLAVE_BD, FECHA_FIJA, enviarAcceso, normalizar } from './ayudantes.mjs';

// Lista las rutas que difieren entre dos objetos (igual que en datos-guardados.spec).
function diferencias(a, b, ruta = '', out = []) {
  if (out.length > 80) return out;
  const tipo = (x) => (Array.isArray(x) ? 'array' : x === null ? 'null' : typeof x);
  if (tipo(a) !== tipo(b)) { out.push(`${ruta || '(raíz)'}: ${tipo(a)} → ${tipo(b)}`); return out; }
  if (tipo(a) === 'array') {
    if (a.length !== b.length) out.push(`${ruta}: ${a.length} elementos → ${b.length}`);
    for (let i = 0; i < Math.min(a.length, b.length); i++) diferencias(a[i], b[i], `${ruta}[${i}]`, out);
    for (let i = a.length; i < b.length; i++) out.push(`${ruta}[${i}]: agregado ${JSON.stringify(b[i])}`);
  } else if (tipo(a) === 'object') {
    for (const k of new Set([...Object.keys(a), ...Object.keys(b)])) {
      const r = ruta ? `${ruta}.${k}` : k;
      if (!(k in a)) out.push(`${r}: (no existía) → agregado ${JSON.stringify(b[k]).slice(0, 200)}`);
      else if (!(k in b)) out.push(`${r}: (existía) → eliminado`);
      else diferencias(a[k], b[k], r, out);
    }
  } else if (a !== b) out.push(`${ruta}: ${JSON.stringify(a)} → ${JSON.stringify(b)}`);
  return out;
}

test('migraciones de arranque: corrigen una base guardada por una versión anterior', async ({ page }) => {
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
  const arrancarCon = async (base) => {
    await page.evaluate(([k, v]) => { localStorage.clear(); localStorage.setItem(k, v); }, [CLAVE_BD, JSON.stringify(base)]);
    await page.goto('/');
    await entrar();
    return JSON.parse(await leerBd());
  };

  // Base de partida: la semilla tal como la deja un primer arranque (ya migrada).
  await page.goto('/');
  await page.evaluate(() => localStorage.clear());
  await page.goto('/');
  await entrar();
  const semilla = JSON.parse(await leerBd());
  const registro = {};

  // ───── 1) Relaciones heredadas: solo se infiere el padre si la descripción menciona UN catálogo padre ─────
  const r1 = structuredClone(semilla);
  const carrera = (code) => r1.catalogs.carreras.find((x) => x.code === code);
  Object.assign(carrera('REF-TEH-01'), { detail: 'Se imparte en el campus Juchitán' }); delete carrera('REF-TEH-01').parentCode; // un padre → JUC
  Object.assign(carrera('REF-TEH-02'), { detail: 'Compartida entre Tehuantepec e Ixtepec' }); delete carrera('REF-TEH-02').parentCode; // dos → sin padre
  Object.assign(carrera('REF-TEH-03'), { detail: 'Sin referencia a sede' }); delete carrera('REF-TEH-03').parentCode; // ninguno → sin padre
  carrera('REF-TEH-05').detail = 'Antes se impartía en Juchitán'; // ya tiene padre (TEH) → no se toca
  const plan = r1.catalogs.planes.find((x) => x.code === 'IC-2016');
  plan.detail = 'Plan vigente de Ingeniería en Computación'; delete plan.parentCode; // por nombre → REF-TEH-04
  const materia = r1.catalogs.materias.find((x) => x.code === 'IC-M01');
  materia.detail = 'Pertenece al plan IC-2024'; delete materia.parentCode; // por clave → IC-2024 (antes IC-2016)
  registro['1 · relaciones heredadas'] = { cambiosAlArrancar: diferencias(r1, await arrancarCon(r1)) };

  // ───── 2) Base sin permisos ni historial de periodos ─────
  const r2 = structuredClone(semilla);
  delete r2.permissions; delete r2.periodHistory;
  const tras2 = await arrancarCon(r2);
  await irA('Periodos');
  registro['2 · sin permisos ni historial de periodos'] = {
    cambiosAlArrancar: diferencias(r2, tras2).map((d) => d.replace(/agregado .*/, 'agregado')),
    permisosIgualesALosDeUnPrimerArranque: JSON.stringify(tras2.permissions) === JSON.stringify(semilla.permissions),
    historialDePeriodos: tras2.periodHistory,
    panelDeHistorial: await texto('#periodHistoryPanel'),
  };

  // ───── 3) Base anterior a v41 ─────
  const r3 = structuredClone(semilla);
  delete r3.catalogs.opciones;
  r3.catalogs.comisiones = [{ id: 50, code: 'COM-X', name: 'FINANZAS', detail: 'Comisión registrada antes', status: 'Vigente' }]; // mismo nombre que una de v41 (sin distinguir mayúsculas)
  r3.catalogs.rubros = r3.catalogs.rubros.filter((x) => !['DIST', 'PROM', 'SUPAC'].includes(x.code));
  r3.catalogs.rubros.forEach((x) => { delete x.planSection; delete x.reportSection; });
  r3.catalogs.parametros = r3.catalogs.parametros.filter((x) => x.code !== 'REB-UMBRAL');
  delete r3.period.semester; delete r3.period.activityStart; delete r3.period.activityEnd;
  const tras3 = await arrancarCon(r3);
  registro['3 · base anterior a v41'] = {
    cambiosAlArrancar: diferencias(r3, tras3).filter((d) => !d.startsWith('catalogs.opciones')),
    // Resumen propio (no comparado con la semilla: un sabotaje cambiaría las dos por igual).
    opcionesAgregadas: tras3.catalogs.opciones && {
      total: tras3.catalogs.opciones.length,
      grupos: [...new Set(tras3.catalogs.opciones.map((x) => x.group))],
      primera: tras3.catalogs.opciones[0],
    },
  };

  // ───── 4) Secciones de rubros ya escritas: no se sobrescriben ─────
  const r4 = structuredClone(semilla);
  const doc = r4.catalogs.rubros.find((x) => x.code === 'DOC');
  doc.planSection = 'Sección propia del Plan'; delete doc.reportSection; // conserva la propia, completa la faltante
  const inv = r4.catalogs.rubros.find((x) => x.code === 'INV');
  inv.planSection = ''; inv.reportSection = 'Sección propia del Informe'; // '' no es null: tampoco se sobrescribe
  registro['4 · secciones de rubros ya escritas'] = { cambiosAlArrancar: diferencias(r4, await arrancarCon(r4)) };

  expect(errores, 'errores de consola').toEqual([]);
  expect(JSON.stringify(registro, null, 2)).toMatchSnapshot('migraciones-arranque.json');
});
