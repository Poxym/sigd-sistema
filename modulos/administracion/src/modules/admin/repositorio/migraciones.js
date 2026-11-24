/* Repositorio · migraciones de arranque (ADR-006).
   Ponen al día una base guardada por una versión anterior: agregan lo que falta sin tocar lo que ya existe, así que
   se pueden aplicar en cada arranque (si la base ya está al día, no cambian nada). crearRepositorio() las aplica justo
   después de cargar y guarda una vez. Movidas sin cambios desde app.js, en el mismo orden; antes, las tres primeras
   corrían antes del primer render y v41Initialize después (con su propio persist(), que ahora hace crearRepositorio).
   Las de formatos más antiguos (rol «Profesor», catálogos faltantes, base dañada) siguen en almacen-local.js. */
import { NXD } from '../../../config/dominio.js';
import { idOf } from '../../../core/utilidades.js';

const { rolePermissions, v41SeedOptions, v41CommissionNames, v41RubricMapping } = NXD;

// Las relaciones heredadas se infieren únicamente cuando la descripción menciona inequívocamente un catálogo vigente.
function normalizeLegacyRelations(db){
 const specs=[['carreras','campus'],['planes','carreras'],['materias','planes']];
 for(const [child,parent] of specs){for(const entry of db.catalogs[child]||[]){if(entry.parentCode)continue;
  const desc=String(entry.detail||'').toLocaleLowerCase('es');
  const candidates=(db.catalogs[parent]||[]).filter(x=>desc.includes(x.name.toLocaleLowerCase('es'))||desc.includes(x.code.toLocaleLowerCase('es')));
  if(candidates.length===1)entry.parentCode=candidates[0].code;
 }}
}

// V41 · Catálogos de captura extraídos de los formatos facilitados por la institución.
// No se fija la estructura en el formulario docente: Administración mantiene estas listas.
function v41Initialize(db){
 db.catalogs.opciones??=structuredClone(v41SeedOptions);
 const codes=new Set((db.catalogs.comisiones||[]).map(x=>String(x.name||'').toLocaleLowerCase('es')));
 v41CommissionNames.forEach((name,i)=>{
  if(codes.has(name.toLocaleLowerCase('es')))return;
  db.catalogs.comisiones.push({id:idOf(db.catalogs.comisiones),code:'COM-F'+String(i+1).padStart(2,'0'),name,detail:'Comisión indicada en el Plan de Trabajo',status:'Vigente'});
 });
 const rub=db.catalogs.rubros;
 if(!rub.some(x=>x.code==='DIST'))rub.push({id:idOf(rub),code:'DIST',name:'Distinciones',detail:'Plan e Informe de Actividades',status:'Vigente'});
 if(!rub.some(x=>x.code==='PROM'))rub.push({id:idOf(rub),code:'PROM',name:'Promoción del desarrollo',detail:'Plan e Informe de Actividades',status:'Vigente'});
 if(!rub.some(x=>x.code==='SUPAC'))rub.push({id:idOf(rub),code:'SUPAC',name:'Superación académica',detail:'Plan de Trabajo',status:'Vigente'});
 rub.forEach(r=>{const map=v41RubricMapping[r.code];if(map){r.planSection??=map[0];r.reportSection??=map[1]}});
 const params=db.catalogs.parametros;
 if(!params.some(x=>x.code==='REB-UMBRAL'))params.push({id:idOf(params),code:'REB-UMBRAL',name:'Umbral de reprobación para justificar',detail:'Porcentaje superior al cual debe solicitarse justificación en el Informe, conforme a entrevista institucional.',paramValue:'',paramUnit:'Porcentaje',status:'Vigente'});
 db.period.semester??='';db.period.activityStart??='';db.period.activityEnd??='';
}
// Las fechas académicas describen las actividades reportadas; no reemplazan las ventanas de captura.

export function aplicarMigraciones(db){
 normalizeLegacyRelations(db);
 // Configuración demostrativa, persistida en el navegador del equipo.
 if(!db.permissions)db.permissions=structuredClone(rolePermissions);
 if(!db.periodHistory)db.periodHistory=[];
 v41Initialize(db);
 return db;
}
