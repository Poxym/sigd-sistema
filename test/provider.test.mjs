import test from 'node:test';import assert from 'node:assert/strict';import{readFileSync}from'node:fs';
import{seed}from'../src/seed.mjs';import{Service,validateRelations}from'../src/service.mjs';
const provider=process.env.DB_PROVIDER,schema=JSON.parse(readFileSync(new URL('../src/schema.json',import.meta.url),'utf8'));
test('proveedor real: transacción, relaciones y lectura persistente',{skip:!['postgres','firebase'].includes(provider)},async()=>{
 const C=provider==='postgres'?(await import('../src/postgres.mjs')).PostgresRepository:(await import('../src/firebase.mjs')).FirebaseRepository;
 const repo=provider==='postgres'?new C(process.env.DATABASE_URL,schema.tables):new C(schema.tables);
 try{await repo.transaction(s=>{seed(s);validateRelations(s,schema)});const first=await repo.transaction(s=>new Service(s,'u209',new Date('2026-11-22T18:00:00Z')).create('PLAN'));assert.equal(first.kind,'PLAN');const second=await repo.transaction(s=>{validateRelations(s,schema);return s.documents.find(d=>d.id===first.id)});assert.equal(second.teacher_id,'demo-teacher-209');await assert.rejects(repo.transaction(s=>{s.users[0].first_name='No guardar';throw Error('fallo simulado')}));assert.notEqual(await repo.transaction(s=>s.users[0].first_name),'No guardar')}finally{await repo.close()}
});
