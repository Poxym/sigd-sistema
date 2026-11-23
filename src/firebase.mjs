import {initializeApp,deleteApp,applicationDefault} from 'firebase-admin/app';
import {randomUUID} from 'node:crypto';
import {getFirestore} from 'firebase-admin/firestore';
import {isDeepStrictEqual} from 'node:util';
export class FirebaseRepository{
 // Cada repositorio usa su propia app de Firebase para que close() no afecte a otras instancias del proceso.
 constructor(tables){this.app=initializeApp({projectId:process.env.FIREBASE_PROJECT_ID||'demo-sigd',...(process.env.FIRESTORE_EMULATOR_HOST?{}:{credential:applicationDefault()}),storageBucket:process.env.FIREBASE_STORAGE_BUCKET},'sigd-'+randomUUID());this.db=getFirestore(this.app);this.tables=tables;
  // Firestore no admite arreglos anidados: las columnas jsonb del modelo se guardan como texto JSON y se decodifican al leer.
  this.json=Object.fromEntries(tables.map(t=>[t.name,t.columns.filter(c=>c.type==='jsonb').map(c=>c.name)]))}
 decode(table,data){for(const c of this.json[table]||[])if(typeof data[c]==='string'){try{data[c]=JSON.parse(data[c])}catch{}}return data}
 encode(table,row){const out={...row};for(const c of this.json[table]||[])if(out[c]!=null)out[c]=JSON.stringify(out[c]);return out}
 async transaction(fn){return this.db.runTransaction(async tx=>{
  const state={},previous=new Map();
  // Todas las lecturas preceden a cualquier escritura; los reintentos no producen efectos externos.
  // Lecturas en paralelo dentro de la misma transacción (antes, una colección tras otra).
  const snaps=await Promise.all(this.tables.map(t=>tx.get(this.db.collection(t.name))));
  this.tables.forEach((t,i)=>{state[t.name]=snaps[i].docs.map(d=>{const data=this.decode(t.name,d.data());previous.set(t.name+'/'+d.id,data);return structuredClone(data)})});
  const result=await fn(state),changes=[];
  for(const [collection,rows]of Object.entries(state))for(const row of rows){const key=collection+'/'+row.id;if(!isDeepStrictEqual(previous.get(key),row)){if(Buffer.byteLength(JSON.stringify(row))>800*1024)throw Error('Documento Firestore demasiado grande. Divide las actividades antes de guardar.');changes.push({ref:this.db.doc(key),row:this.encode(collection,row)})}previous.delete(key)}
  for(const key of previous.keys())changes.push({ref:this.db.doc(key),remove:true});
  if(changes.length>400)throw Error('La operación excede el tamaño transaccional permitido por SIGD.');
  for(const c of changes)c.remove?tx.delete(c.ref):tx.set(c.ref,c.row);
  return result;
 })}
 async close(){await this.db.terminate();await deleteApp(this.app)}
}
