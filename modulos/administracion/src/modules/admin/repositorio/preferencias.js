/* Repositorio · preferencias de interfaz de quien usa este navegador (no son datos del negocio).
   Hoy solo una: si el menú lateral propio del módulo está plegado (clave «nexora-sidebar-collapsed», valores
   "true"/"false", igual que antes en app.js). Dentro del marco del SIGD ese menú no se muestra, pero la
   preferencia se sigue leyendo y guardando.
   Si el navegador no deja usar el almacenamiento, leer da «no plegado» y guardar no hace nada, como antes.
   «almacenamiento» permite probarlo con uno falso; por omisión es localStorage (solo se toca dentro de los try). */
const CLAVE_MENU = 'nexora-sidebar-collapsed';

export function crearPreferencias(almacenamiento) {
  const destino = () => almacenamiento ?? globalThis.localStorage;
  return {
    menuLateralPlegado() { try { return destino().getItem(CLAVE_MENU) === 'true'; } catch { return false; } },
    guardarMenuLateralPlegado(plegado) { try { destino().setItem(CLAVE_MENU, String(plegado)); } catch {} },
  };
}
