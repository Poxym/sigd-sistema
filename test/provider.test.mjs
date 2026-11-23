import test from 'node:test';import assert from 'node:assert/strict';import{readFileSync}from'node:fs';
import{seed}from'../src/seed.mjs';import{Service,validateRelations}from'../src/service.mjs';
const provider=process.env.DB_PROVIDER,schema=JSON.parse(readFileSync(new URL('../src/schema.json',import.meta.url),'utf8'));
test('proveedor real: transacción, relaciones y lectura persistente',{skip:!['postgres','firebase'].includes(provider)},async()=>{
 const C=provider==='postgres'?(await import('../src/postgres.mjs')).PostgresRepository:(await import('../src/firebase.mjs')).FirebaseRepository;
 const repo=provider==='postgres'?new C(process.env.DATABASE_URL,schema.tables):new C(schema.tables);
 try{await repo.transaction(s=>{seed(s);validateRelations(s,schema)});const first=await repo.transaction(s=>new Service(s,'u209',new Date('2026-11-22T18:00:00Z')).create('PLAN'));assert.equal(first.kind,'PLAN');const second=await repo.transaction(s=>{validateRelations(s,schema);return s.documents.find(d=>d.id===first.id)});assert.equal(second.teacher_id,'demo-teacher-209');await assert.rejects(repo.transaction(s=>{s.users[0].first_name='No guardar';throw Error('fallo simulado')}));assert.notEqual(await repo.transaction(s=>s.users[0].first_name),'No guardar')}finally{await repo.close()}
});
test('proveedor real: informe A–I con arreglos anidados se guarda, envía y relee igual',{skip:!['postgres','firebase'].includes(provider)},async()=>{
 const C=provider==='postgres'?(await import('../src/postgres.mjs')).PostgresRepository:(await import('../src/firebase.mjs')).FirebaseRepository;
 const repo=provider==='postgres'?new C(process.env.DATABASE_URL,schema.tables):new C(schema.tables);const at=new Date('2026-11-22T18:00:00Z');
 try{await repo.transaction(s=>{seed(s)});
  const planId=await repo.transaction(s=>{const t=new Service(s,'u209',at),h=new Service(s,'u118',at);let p=s.documents.find(d=>d.teacher_id==='demo-teacher-209'&&d.kind==='PLAN');p=p?t.dto(p):t.create('PLAN');if(p.status!=='approved'){for(const a of Object.values(p.sections)){a.completion='done';if(!a.rows.length)a.applicability='not_applicable'}if(['draft','returned'].includes(p.status)){p=t.save(p.id,p,p.revision);p=t.submit(p.id,p.revision,'provider-plan-submit-'+p.revision)}for(const sec of p.catalogSnapshot.sections.filter(x=>x.active))h.visit(p.id,p.version,sec.id);h.review(p.id,p.revision,'approved','','provider-plan-review-'+p.revision)}return p.id});
  const d={B:{p:{},a:{},arts:[{t:'Artículo',r:'Revista',au:'A. R.',pub:true}],projs:[],x:[[['Trabajo','Congreso','2026-10-01','Oaxaca']]]},C:[[['','']]],D:[[['Ana','2201','3A'],['Luis','2202','5B']]],E:[[['']]],F:[[['','']]],G:[[['Comisión','2026']]],H:[[['','','','']]],I:[[['','','','']]]};
  const id=await repo.transaction(s=>{const t=new Service(s,'u209',at);let r=s.documents.find(x=>x.teacher_id==='demo-teacher-209'&&x.kind==='REPORT');r=r?t.dto(r):t.create('REPORT');const inf={...r.informe,d,sec:Object.fromEntries('ABCDEFGHI'.split('').map(k=>[k,'D'===k||'G'===k?'done':'noact']))};r=t.save(r.id,{informe:inf},r.revision);if(r.status==='draft')t.submit(r.id,r.revision,'provider-report-submit');return r.id});
  const back=await repo.transaction(s=>{validateRelations(s,schema);return s.documents.find(x=>x.id===id)});assert.deepEqual(back.content.informe.d.D,d.D);assert.equal(back.state,'in_review');
 }finally{await repo.close()}});
