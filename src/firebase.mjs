import {initializeApp,getApps,applicationDefault} from 'firebase-admin/app';
import {getFirestore} from 'firebase-admin/firestore';
import {isDeepStrictEqual} from 'node:util';
export class FirebaseRepository{
 constructor(tables){if(!getApps().length)initializeApp({projectId:process.env.FIREBASE_PROJECT_ID||'demo-sigd',...(process.env.FIRESTORE_EMULATOR_HOST?{}:{credential:applicationDefault()}),storageBucket:process.env.FIREBASE_STORAGE_BUCKET});this.db=getFirestore();this.tables=tables}
 async transaction(fn){return this.db.runTransaction(async tx=>{
  const state={},previous=new Map();
  // Todas las lecturas preceden a cualquier escritura; los reintentos no producen efectos externos.
  for(const t of this.tables){const snap=await tx.get(this.db.collection(t.name));state[t.name]=snap.docs.map(d=>{const data=d.data();previous.set(t.name+'/'+d.id,data);return structuredClone(data)})}
  const result=await fn(state),changes=[];
  for(const [collection,rows]of Object.entries(state))for(const row of rows){const key=collection+'/'+row.id;if(!isDeepStrictEqual(previous.get(key),row)){if(Buffer.byteLength(JSON.stringify(row))>800*1024)throw Error('Documento Firestore demasiado grande. Divide las actividades antes de guardar.');changes.push({ref:this.db.doc(key),row})}previous.delete(key)}
  for(const key of previous.keys())changes.push({ref:this.db.doc(key),remove:true});
  if(changes.length>400)throw Error('La operación excede el tamaño transaccional permitido por SIGD.');
  for(const c of changes)c.remove?tx.delete(c.ref):tx.set(c.ref,c.row);
  return result;
 })}
 async close(){await this.db.terminate()}
}
