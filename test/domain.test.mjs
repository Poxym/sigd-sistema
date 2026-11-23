import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,mkdtempSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import path from 'node:path';
import {Service,validateRelations} from '../src/service.mjs';
import {seed} from '../src/seed.mjs';
import D from '../src/plan-domain.cjs';
import {SQLiteRepository} from '../src/repository.mjs';
import {verifyPassword,hashPassword} from '../src/security.mjs';
const schema=JSON.parse(readFileSync(new URL('../src/schema.json',import.meta.url),'utf8'));
const base=Object.fromEntries(schema.tables.map(t=>[t.name,[]]));seed(base);
const date=new Date('2026-11-22T18:00:00Z');
const setup=()=>{const s=structuredClone(base);return{s,teacher:new Service(s,'u209',date),head:new Service(s,'u118',date),admin:new Service(s,'u001',date)}};
function ready(svc){let p=svc.create('PLAN');for(const [id,a]of Object.entries(p.sections)){a.completion='done';if(!a.rows.length)a.applicability='not_applicable'}return svc.save(p.id,p,p.revision)}
function approved(env){let p=ready(env.teacher);p=env.teacher.submit(p.id,p.revision,'submit-key-123');for(const sec of p.catalogSnapshot.sections.filter(s=>s.active))env.head.visit(p.id,p.version,sec.id);return env.head.review(p.id,p.revision,'approved','','review-key-123')}
test('semilla satisface las 90 FK y restricciones únicas',()=>validateRelations(base,schema));
test('contraseñas con salt y verificación resistente a comparación simple',()=>{const h=hashPassword('segura#123456');assert.notEqual(h,hashPassword('segura#123456'));assert(verifyPassword('segura#123456',h));assert(!verifyPassword('incorrecta',h))});
test('identidad permanece al cambiar el número de empleado',()=>{const{s,admin}=setup();admin.changeEmployee('u209','000219');assert.equal(s.teachers.find(t=>t.user_id==='u209').id,'demo-teacher-209');assert.equal(s.employee_history.filter(h=>h.user_id==='u209').length,2);assert.equal(s.users.find(u=>u.id==='u209').employee_number,'000219');validateRelations(s,schema)});
test('rol y permiso impiden a un docente publicar catálogos',()=>{const{teacher}=setup();assert.throws(()=>teacher.publishCatalog(teacher.period().id,D.FX.v2),e=>e.status===403)});
test('sin plan aprobado no puede crearse informe',()=>{const{teacher}=setup();assert.throws(()=>teacher.create('REPORT'),/aprobado/)});
test('plan completo se envía y queda bloqueado para edición',()=>{const{teacher}=setup();let p=ready(teacher);p=teacher.submit(p.id,p.revision,'idempotent-submit');assert.equal(p.status,'in_review');assert.throws(()=>teacher.save(p.id,p,p.revision),/bloqueado/)});
test('envío incompleto se rechaza',()=>{const{teacher}=setup();const p=teacher.create('PLAN');assert.throws(()=>teacher.submit(p.id,p.revision,'incomplete-submit'),/pendiente/)});
test('CAS rechaza actualizaciones con revisión vencida',()=>{const{teacher}=setup();const p=teacher.create('PLAN');teacher.save(p.id,p,p.revision);assert.throws(()=>teacher.save(p.id,p,p.revision),e=>e.status===409)});
test('idempotencia conserva una sola versión y rechaza reutilización diferente',()=>{const{s,teacher}=setup();const p=ready(teacher);const first=teacher.submit(p.id,p.revision,'same-submit-key');assert.deepEqual(teacher.submit(p.id,p.revision,'same-submit-key'),first);assert.equal(s.document_versions.length,1);assert.throws(()=>teacher.submit(p.id,999,'same-submit-key'),/otra operación/)});
test('carrera sin jefatura exige delegación explícita vigente',()=>{const{s,teacher}=setup();s.role_assignments=s.role_assignments.filter(a=>a.role_id!=='head');const p=ready(teacher);assert.throws(()=>teacher.submit(p.id,p.revision,'no-reviewer-key'),/autoridad/);s.approval_delegations.push({id:'delegate',career_id:'comp',user_id:'u100',assigned_by:'u001',start:'2026-11-01',end:'2026-12-01',reason:'Transición'});assert.equal(teacher.submit(p.id,p.revision,'delegated-submit').status,'in_review')});
test('jefe docente no puede autoaprobar',()=>{const{s}=setup();const headTeacher=new Service(s,'u118',date);let p=ready(headTeacher);p=headTeacher.submit(p.id,p.revision,'own-plan-key');assert.throws(()=>headTeacher.review(p.id,p.revision,'approved','','own-review-key'),e=>e.status===403)});
test('la revisión requiere visitar todas las secciones de la versión',()=>{const{teacher,head}=setup();let p=ready(teacher);p=teacher.submit(p.id,p.revision,'review-sections-key');assert.throws(()=>head.review(p.id,p.revision,'approved','','approve-sections-key'),/todas las secciones/)});
test('aprobación crea nueva versión sin modificar el envío congelado',()=>{const e=setup();let p=ready(e.teacher);p=e.teacher.submit(p.id,p.revision,'freeze-submit-key');const frozen=JSON.stringify(e.s.document_versions[0]);for(const sec of p.catalogSnapshot.sections.filter(s=>s.active))e.head.visit(p.id,p.version,sec.id);const decision=e.head.review(p.id,p.revision,'approved','','freeze-review-key');assert.equal(decision.status,'approved');assert.equal(JSON.stringify(e.s.document_versions[0]),frozen);assert.equal(e.s.document_versions.length,2);validateRelations(e.s,schema)});
test('informe referencia exactamente la versión aprobada',()=>{const e=setup();const p=approved(e),r=e.teacher.create('REPORT');assert.equal(r.planVersion,p.version);const ref=e.s.activity_reports[0];assert.equal(e.s.document_versions.find(v=>v.id===ref.plan_version_id).event,'approved');validateRelations(e.s,schema)});
test('devolución obliga comentario y permite corregir y reenviar',()=>{const e=setup();let p=ready(e.teacher);p=e.teacher.submit(p.id,p.revision,'return-submit-key');assert.throws(()=>e.head.review(p.id,p.revision,'returned','','return-empty-key'),/corregir/);p=e.head.review(p.id,p.revision,'returned','Completa la descripción del proyecto.','return-review-key');p=e.teacher.save(p.id,p,p.revision);assert.equal(e.teacher.submit(p.id,p.revision,'resubmit-key-123').status,'in_review')});
test('la jefatura no consulta documentos de otra carrera',()=>{const e=setup();const p=ready(e.teacher);e.s.documents[0].career_id='otra';assert.throws(()=>e.head.document(p.id),e=>e.status===403)});
test('periodo cerrado impide captura y cambios de catálogo',()=>{const e=setup();e.s.periods[0].state='closed';assert.throws(()=>e.teacher.create('PLAN'),/cerrado/);assert.throws(()=>e.admin.publishCatalog(e.s.periods[0].id,D.FX.v2),/cerrado/)});
test('catálogo nuevo no reescribe el borrador anterior y permite migrar',()=>{const e=setup(),p=e.teacher.create('PLAN');e.admin.publishCatalog(p.semester.id,D.FX.v2);assert.equal(e.s.documents[0].content.catalogSnapshot.version,1);const migrated=e.teacher.migrate(p.id,p.revision);assert.equal(migrated.catalogSnapshot.version,2);validateRelations(e.s,schema)});
test('horas institucionales no se duplican ni se editan desde el plan',()=>{const e=setup(),p=e.teacher.create('PLAN');p.sections.docencia.rows[0].weeklyHours=99;assert.throws(()=>e.teacher.save(p.id,p,p.revision),/Administración/)});
test('carga nominal no se confunde con avance ni se vuelve a sumar la asignación',()=>{const e=setup(),p=e.teacher.create('PLAN');assert.equal(D.calculateLoad(p).totalWeeklyHours,14);assert.equal(D.calculateLoad(p).doneSections,0)});
test('tutorías, proporción y periodos superpuestos usan el dominio compartido',()=>{const l=D.calculateLoad(D.FX.demo);assert.equal(l.totalWeeklyHours,34);assert.equal(l.totalSemesterHours,476);assert.equal(D.uncoveredDays('2026-01-01','2026-01-10','2026-01-01','2026-01-10',[['2026-01-01','2026-01-05'],['2026-01-03','2026-01-07']]),3)});
test('informe en formato anterior (sin secciones A–I): resultados de cursos validan rango y reprobación ponderada',()=>{const e=setup();approved(e);let r=e.teacher.create('REPORT');delete e.s.documents.find(d=>d.id===r.id).content.informe;delete r.informe;r.courseResults[0].passed=1000;assert.throws(()=>e.teacher.save(r.id,r,r.revision),/aprobados/);r.courseResults[0].passed=10;for(const a of Object.values(r.sections)){a.applicability='not_applicable';a.completion='done'}r=e.teacher.save(r.id,r,r.revision);assert.throws(()=>e.teacher.submit(r.id,r.revision,'report-unjustified'),/Justifica/)});
test('FK inexistente y duplicado se detectan antes de persistir',()=>{const e=setup();e.s.careers[0].campus_id='missing';assert.throws(()=>validateRelations(e.s,schema),/FK/)});
test('SQLite revierte la transacción completa y sobrevive reinicio',async()=>{const dir=mkdtempSync(path.join(tmpdir(),'sigd-'));const repo=new SQLiteRepository(path.join(dir,'data.sqlite'),schema.tables);try{await repo.transaction(s=>{seed(s)});await assert.rejects(repo.transaction(s=>{s.users[0].first_name='Perdido';throw Error('fallo')}));assert.equal(await repo.transaction(s=>s.users[0].first_name),'Ana');repo.close();const reopened=new SQLiteRepository(path.join(dir,'data.sqlite'),schema.tables);assert.equal(await reopened.transaction(s=>s.users.length),8);reopened.close()}finally{try{repo.close()}catch{}rmSync(dir,{recursive:true,force:true})}});
test('Administración agrega o retira actividades de Docencia por periodo (sinodal de examen)',()=>{
 const e=setup();const cat=structuredClone(e.s.catalog_versions[0].content);
 const p1=e.teacher.create('PLAN');assert(p1.catalogSnapshot.sections.some(s=>s.id==='sinodales'),'la semilla incluye Sinodal de examen');
 const opts=p1.catalogSnapshot.sections.find(s=>s.id==='sinodales').fields.find(f=>f.id==='examType').options.map(o=>o.label);
 assert.deepEqual(opts,['Extraordinario 1','Extraordinario 2','Especial']);
 cat.sections=cat.sections.filter(s=>s.id!=='sinodales');e.admin.publishCatalog(p1.semester.id,cat);
 const other=new Service(e.s,'u301',date).create('PLAN');assert(!other.catalogSnapshot.sections.some(s=>s.id==='sinodales'),'retirada del catálogo vigente');
 assert(e.s.documents.find(d=>d.id===p1.id).content.catalogSnapshot.sections.some(s=>s.id==='sinodales'),'el plan anterior conserva su catálogo congelado');
 validateRelations(e.s,schema)});
test('las 40 horas semanales son un máximo obligatorio al enviar el plan (acuerdo del 22/11)',()=>{
 const{teacher,s}=setup();assert.equal(s.periods[0].enforce_maximum,true);
 let p=ready(teacher);const c=p.sections.comisiones;c.applicability='applies';c.completion='done';
 c.rows=[{id:'comision-larga',title:'Comisión extraordinaria',weeklyHours:30,notes:''}];
 p=teacher.save(p.id,p,p.revision);assert.equal(p.semester.enforceMaximum,true);assert.equal(p.semester.maximumWeeklyMinutes,2400);
 assert.throws(()=>teacher.submit(p.id,p.revision,'over-40-key-1'),/máximo obligatorio de 40 h/);
 c.rows[0].weeklyHours=10;p.sections.comisiones=c;p=teacher.save(p.id,p,p.revision);assert.equal(teacher.submit(p.id,p.revision,'under-40-key-1').status,'in_review')});

test('Informe original A–I: se crea con cursos institucionales y valida el envío por secciones',()=>{
 const e=setup();approved(e);let r=e.teacher.create('REPORT');
 assert.deepEqual(Object.keys(r.informe.sec),['A','B','C','D','E','F','G','H','I']);
 assert.equal(r.informe.courses.length,3);assert(r.informe.courses.every(c=>c.assignmentId));
 const inf=structuredClone(r.informe);inf.sec.A='done';
 r=e.teacher.save(r.id,{informe:inf},r.revision);
 assert.throws(()=>e.teacher.submit(r.id,r.revision,'inf-pend-1'),/sección B está pendiente/);
 for(const k of 'BCDEFGHI')inf.sec[k]='noact';inf.courses[0].r=40;
 r=e.teacher.save(r.id,{informe:inf},r.revision);
 assert.throws(()=>e.teacher.submit(r.id,r.revision,'inf-just-1'),/Justifica la reprobación/);
 inf.courses[0].j='Grupo con alta inasistencia en el semestre.';
 r=e.teacher.save(r.id,{informe:inf},r.revision);
 const cr=r.courseResults.find(c=>c.assignmentId===inf.courses[0].assignmentId);assert.equal(cr.enrolled-cr.passed,Math.round(cr.enrolled*0.4));
 r=e.teacher.submit(r.id,r.revision,'inf-ok-1');assert.equal(r.status,'in_review');validateRelations(e.s,schema)});

test('Informe original: Jefatura debe consultar A–I antes de aprobar',()=>{
 const e=setup();approved(e);let r=e.teacher.create('REPORT');const inf=structuredClone(r.informe);for(const k of 'ABCDEFGHI')inf.sec[k]='noact';
 r=e.teacher.save(r.id,{informe:inf},r.revision);r=e.teacher.submit(r.id,r.revision,'inf-sub-2');
 e.head.visit(r.id,r.version,'A');assert.throws(()=>e.head.review(r.id,r.revision,'approved','','inf-rev-2a'),/todas las secciones/);
 assert.throws(()=>e.head.visit(r.id,r.version,'docencia'),/Sección inválida/);
 for(const k of 'BCDEFGHI')e.head.visit(r.id,r.version,k);r=e.head.review(r.id,r.revision,'approved','','inf-rev-2b');assert.equal(r.status,'approved')});

test('Informe original: datos inválidos se rechazan y el borrador nunca enviado se puede eliminar',()=>{
 const e=setup();approved(e);let r=e.teacher.create('REPORT');const inf=structuredClone(r.informe);
 assert.throws(()=>e.teacher.save(r.id,{informe:{...inf,courses:[{...inf.courses[0],r:120}]}},r.revision),/entre 0 y 100/);
 assert.throws(()=>e.teacher.save(r.id,{informe:{...inf,sin:['otro']}},r.revision),/Sinodal/);
 assert.throws(()=>e.teacher.save(r.id,{informe:{...inf,courses:[{...inf.courses[0],assignmentId:'ajena'}]}},r.revision),/ajeno/);
 assert.deepEqual(e.teacher.discard(r.id),{ok:true});assert(!e.s.documents.some(d=>d.id===r.id));validateRelations(e.s,schema);
 r=e.teacher.create('REPORT');for(const k of 'ABCDEFGHI')r.informe.sec[k]='noact';r=e.teacher.save(r.id,{informe:r.informe},r.revision);r=e.teacher.submit(r.id,r.revision,'inf-sub-3');
 assert.throws(()=>e.teacher.discard(r.id),/nunca se ha enviado/)});
