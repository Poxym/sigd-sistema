// Ayudantes comunes de las pruebas: constantes y funciones que antes estaban copiadas en cada archivo .spec.mjs.
// No es una prueba (Playwright solo corre los archivos *.spec.mjs).

// Clave de localStorage donde el módulo guarda su base de datos de demostración.
export const CLAVE_BD = 'nexora-admin-v51-computacion';

// Fecha fija de todas las pruebas: 2 de noviembre de 2026, mediodía en el centro de México.
export const FECHA_FIJA = new Date('2026-11-02T12:00:00-06:00');

// Cuenta de demostración (administrador general).
export const CUENTA_DEMO = { usuario: '001', clave: 'Unistmo#2026' };

// Llena la pantalla de acceso y pulsa «Entrar». No espera nada después: cada prueba decide qué esperar.
export async function enviarAcceso(page, usuario = CUENTA_DEMO.usuario, clave = CUENTA_DEMO.clave) {
  await page.fill('#u', usuario); await page.fill('#pw', clave); await page.click('#lf button[type="submit"]');
}

// Iguala los textos entre versiones de Chrome: los espacios especiales (sin salto \u00a0 y angosto \u202f) pasan a
// espacio normal, «a. m.» / «p. m.» a «am» / «pm», y los espacios seguidos a uno solo.
// Se escriben como \u00a0 y \u202f (no el carácter literal) porque al copiarlo se puede convertir en un espacio normal.
export const normalizar = (t) => String(t).replace(/[\u00a0\u202f]/g, ' ').replace(/\b([ap])\.\s?m\./gi, '$1m').replace(/[ \t]+/g, ' ');
