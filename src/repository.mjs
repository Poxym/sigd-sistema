import { DatabaseSync } from 'node:sqlite';
import { mkdirSync } from 'node:fs';
import { dirname } from 'node:path';
export class SQLiteRepository {
 constructor(filename, tables){
  mkdirSync(dirname(filename),{recursive:true});this.tables=tables;
  this.db=new DatabaseSync(filename);this.db.exec('PRAGMA journal_mode=WAL; PRAGMA busy_timeout=5000; CREATE TABLE IF NOT EXISTS records (collection TEXT NOT NULL,id TEXT NOT NULL,body TEXT NOT NULL,PRIMARY KEY(collection,id));');
 }
 async transaction(fn){
  this.db.exec('BEGIN IMMEDIATE');
  try{
   const state=Object.fromEntries(this.tables.map(t=>[t.name,[]]));
   const previous=new Map();
   for(const row of this.db.prepare('SELECT collection,id,body FROM records').all()){
    if(!state[row.collection])continue;state[row.collection].push(JSON.parse(row.body));previous.set(row.collection+'\0'+row.id,row.body);
   }
   const result=await fn(state);
   const put=this.db.prepare('INSERT INTO records VALUES (?,?,?) ON CONFLICT(collection,id) DO UPDATE SET body=excluded.body');
   for(const [name,rows] of Object.entries(state))for(const row of rows){const key=name+'\0'+row.id,body=JSON.stringify(row);if(previous.get(key)!==body)put.run(name,row.id,body);previous.delete(key);}
   const del=this.db.prepare('DELETE FROM records WHERE collection=? AND id=?');for(const key of previous.keys())del.run(...key.split('\0'));
   this.db.exec('COMMIT');return result;
  }catch(e){this.db.exec('ROLLBACK');throw e}
 }
 close(){this.db.close()}
}
