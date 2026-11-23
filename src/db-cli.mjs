import{readFile}from'node:fs/promises';import{seed}from'./seed.mjs';import{validateRelations}from'./service.mjs';
const schema=JSON.parse(await readFile(new URL('./schema.json',import.meta.url),'utf8')),provider=process.env.DB_PROVIDER;
if(!['postgres','firebase'].includes(provider))throw Error('Define DB_PROVIDER=postgres o firebase.');
const C=provider==='postgres'?(await import('./postgres.mjs')).PostgresRepository:(await import('./firebase.mjs')).FirebaseRepository;
const repo=provider==='postgres'?new C(process.env.DATABASE_URL,schema.tables):new C(schema.tables);
try{await repo.transaction(s=>{if(process.argv[2]==='seed'){if(process.env.SIGD_DEMO!=='1')throw Error('La semilla requiere SIGD_DEMO=1 y un proyecto de pruebas.');seed(s,process.env.DEMO_PASSWORD||'Unistmo#2026')}validateRelations(s,schema);console.log(JSON.stringify({provider,tables:schema.tables.length,users:s.users.length,documents:s.documents.length,relationsValid:true}))})}finally{await repo.close()}
