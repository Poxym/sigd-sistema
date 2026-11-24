/* Formulario compartido del módulo (editorForm): usuarios, catálogos y solicitudes.
   Historia: eran 9 capas encadenadas sobre editorForm.onsubmit; luego una sola guardar() con 11 pasos;
   luego se repartió por dominio. Aquí guardar() solo despacha según la acción del diálogo abierto.
   Por qué es equivalente: en cada envío la acción tiene UN valor y cada paso actuaba sobre un solo dominio;
   cada archivo conserva el orden relativo de sus pasos (la numeración «Paso N» es la de antes).
   La prueba tests/reglas-formulario.spec.mjs comprueba la equivalencia.
   Las revisiones repetidas que nunca se alcanzaban se quitaron después, en refactor/revisiones-inalcanzables.
   El «Paso 9» (guardado) va en una función aparte en cada dominio. Los pasos 10 y 11 (historiales) corren después
   y la base se guarda una vez al final (refactor/guardar-una-vez; antes miraban si la bitácora creció).
   env: { $, render, getModal, usuarios, catalogos, solicitudes } (los tres últimos, desde app.js; lo demás que recibe ya no lo usa).
   getModal() y getType() se leen al guardar, porque cambian cada vez que se abre un diálogo. */


export function nxFormulario(env) {
  const { $, render, getModal } = env;
  const leerFormulario = (form) => Object.fromEntries(new FormData(form));
  // Las tres pantallas están en MVC: su controlador revisa y guarda (env.usuarios, env.catalogos y env.solicitudes, desde app.js).
  const usuarios = env.usuarios;
  const catalogos = env.catalogos;
  const solicitudes = env.solicitudes;

  function guardar(e) {
    e.preventDefault();
    const f = leerFormulario(e.target);
    const modalAction = getModal().action;
    if (modalAction === 'user') return usuarios.guardar(f);
    if (modalAction === 'catalog') return catalogos.guardar(f, () => leerFormulario(e.target));
    if (modalAction === 'request') return solicitudes.registrar(f);
    if (modalAction === 'requestAction') return solicitudes.gestionar(f);
    // Sin acción (no ocurre desde la interfaz): cierra y repinta, como la versión anterior. Ya no vuelve a guardar la base
    // (refactor/app-sin-db): solo repetía lo ya guardado, porque cada cambio se guarda al hacerse.
    $('editor').close(); render();
  }

  return { guardar };
}
