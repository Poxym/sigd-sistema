/* Bitácora de auditoría · MODELO (ADR-006, MVC).
   Reglas de consulta: qué entradas coinciden con la búsqueda y el filtro, y el formato del archivo CSV
   (columnas, comillas duplicadas, BOM para que Excel lea los acentos, saltos de línea CRLF).
   Solo LEE, y solo por el repositorio (repo.bitacora.entradas()). Quien escribe en la bitácora es
   repo.bitacora.registrar(), llamado desde las demás pantallas. Movido sin cambios desde bitacora/index.js. */
export function crearModeloBitacora(repo, { includes, fmt }) {
  const entradas = () => repo.bitacora.entradas();

  /* Entradas del tipo «f» ('all' = todas) en las que algún campo contiene «q». */
  function filtrar(q, f) {
    return entradas().filter(a=>(f==='all'||a.kind===f)&&[a.detail,a.user,a.kind,a.oldVal,a.newVal].some(x=>includes(x,q)));
  }

  /* Texto completo del CSV con todas las entradas. */
  function textoCSV() {
    let lines=[['Fecha','Responsable','Acción','Detalle','Antes','Después'],...entradas().map(a=>[fmt(a.date),a.user,a.kind,a.detail,a.oldVal,a.newVal])];
    return '﻿'+lines.map(r=>r.map(x=>'"'+String(x??'').replace(/"/g,'""')+'"').join(',')).join('\r\n');
  }

  return { entradas, filtrar, textoCSV, nombreCSV: 'bitacora-administracion.csv' };
}
