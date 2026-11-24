/* Repositorio · adaptador de almacenamiento en el navegador (localStorage).
   Es la ÚNICA parte del módulo que conoce dónde y cómo se guardan los datos (ADR-006). Cuando exista la base
   relacional, se escribirá otro adaptador con los mismos dos métodos y el resto del módulo no cambiará.
   - cargar(): lee la base guardada; si no existe, está dañada o le falta una parte, usa la semilla; después aplica
     las migraciones de formatos antiguos (rol «Profesor» → «Docente», catálogos faltantes).
   - guardar(db): guarda la base completa.
   La clave y el formato de lo guardado no cambian (antes vivía en core/almacen.js).
   «almacenamiento» permite probarlo con uno falso en memoria; por omisión es localStorage, al que solo se accede
   dentro de los try: en algunos navegadores con la privacidad al máximo, con solo mencionarlo se lanza un error. */
import { makeSeed } from '../../../core/semilla.js';

export const CLAVE_BD = 'nexora-admin-v51-computacion';

export function crearAlmacenLocal(almacenamiento) {
  const destino = () => almacenamiento ?? globalThis.localStorage;

  function cargar() {
    let db;try{db=JSON.parse(destino().getItem(CLAVE_BD))||makeSeed();if(!db.users||!db.catalogs||!db.requests||!db.period||!db.audit)db=makeSeed();else{const defaults=makeSeed().catalogs;Object.keys(defaults).forEach(k=>{if(!Array.isArray(db.catalogs[k]))db.catalogs[k]=defaults[k]})}}catch{db=makeSeed()}
    (db.users||[]).forEach(u=>{if(u.role==='Profesor')u.role='Docente'});if(db.permissions&&db.permissions.Profesor){db.permissions.Docente=db.permissions.Profesor;delete db.permissions.Profesor}
    return db;
  }

  function guardar(db) {
    try{destino().setItem(CLAVE_BD,JSON.stringify(db))}catch{}
  }

  return { cargar, guardar };
}
