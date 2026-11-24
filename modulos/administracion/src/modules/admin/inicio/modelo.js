/* Inicio (panel de administración) · MODELO (ADR-006, MVC).
   Reglas de los indicadores y de los pendientes. Solo LEE, y solo por el repositorio.
   Movido sin cambios desde inicio/index.js:
   - Accesos hoy: suma los registros de hoy (hora local) que no son de origen «demo»; un conteo negativo o
     inválido vale 0. Solo cuenta los registros existentes, nunca los genera.
   - Catálogos vigentes: registros con estado «Vigente» de todos los tipos de catálogo.
   - Pendientes: hasta 4, primero las solicitudes por autorizar y después las autorizadas (por aplicar). */
export function crearModeloInicio(repo, { hoyLocal }) {
  function accesosHoy() {
   return repo.accesos.registrados().filter(x=>x.source!=='demo'&&x.day===hoyLocal())
     .reduce((n,x)=>n+Math.max(0,Number(x.count)||0),0);
  }

  /* Todo lo que muestra el panel: conteos, pendientes y el periodo vigente. */
  function resumen() {
   const requests=repo.solicitudes.todas();
   const pending=requests.filter(r=>r.status==='pendiente');
   const authorized=requests.filter(r=>r.status==='autorizada');
   const active=repo.usuarios.todos().filter(u=>u.status==='Activo').length;
   const catalogs=Object.values(repo.catalogos.todos()).reduce((n,arr)=>n+arr.filter(r=>r.status==='Vigente').length,0);
   return {
    conteos: { activos: active, vigentes: catalogs, porAutorizar: pending.length, porAplicar: authorized.length, accesosHoy: accesosHoy() },
    pendientes: [...pending,...authorized].slice(0,4),
    periodo: repo.periodos.actual(),
   };
  }

  /* Registra un inicio de sesión correcto (Documento maestro, sección 6 «Accesos»): un registro por cuenta y por día
     (hora local); cada login le suma 1. Lo que ya estaba guardado se conserva. */
  function registrarAcceso(cuenta) {
    const day = hoyLocal();
    const existente = repo.accesos.registrados().find((x) => x.source === 'login' && x.day === day && x.account === cuenta);
    if (existente) existente.count = (Number(existente.count) || 0) + 1;
    else repo.accesos.agregar({ source: 'login', day, account: cuenta, count: 1 });
    repo.guardarTodo();
  }

  return { resumen, accesosHoy, registrarAcceso };
}
