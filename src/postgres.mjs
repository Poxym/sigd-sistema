import {Pool} from 'pg';
import {isDeepStrictEqual} from 'node:util';
const quote=s=>'"'+s.replaceAll('"','""')+'"';
export class PostgresRepository{
 constructor(connectionString,tables){if(!connectionString)throw Error('Falta DATABASE_URL.');this.pool=new Pool({connectionString,max:10});this.tables=tables}
 async transaction(fn){const client=await this.pool.connect();try{await client.query('BEGIN');await client.query('SELECT pg_advisory_xact_lock(729102026)');await client.query('SET CONSTRAINTS ALL DEFERRED');const state={},previous={};
  for(const t of this.tables){const {rows}=await client.query('SELECT * FROM '+quote(t.name));state[t.name]=rows.map(row=>{for(const c of t.columns){const v=row[c.name];if(v==null)continue;if(c.type==='numeric')row[c.name]=Number(v);if(c.type==='timestamptz'&&v instanceof Date)row[c.name]=v.toISOString();if(c.type==='date'&&v instanceof Date)row[c.name]=v.toISOString().slice(0,10)}return row});previous[t.name]=new Map(state[t.name].map(r=>[r.id,structuredClone(r)]))}
  const result=await fn(state);
  for(const t of this.tables){for(const row of state[t.name]){const old=previous[t.name].get(row.id);if(!isDeepStrictEqual(old,row)){const cols=t.columns.map(c=>c.name),values=t.columns.map(c=>c.type==='jsonb'&&row[c.name]!=null?JSON.stringify(row[c.name]):row[c.name]??null);const sql='INSERT INTO '+quote(t.name)+' ('+cols.map(quote).join(',')+') VALUES ('+cols.map((_,i)=>'$'+(i+1)).join(',')+') ON CONFLICT (id) DO UPDATE SET '+cols.filter(c=>c!=='id').map(c=>quote(c)+'=EXCLUDED.'+quote(c)).join(',');await client.query(sql,values)}previous[t.name].delete(row.id)}}
  for(const t of [...this.tables].reverse())for(const id of previous[t.name].keys())await client.query('DELETE FROM '+quote(t.name)+' WHERE id=$1',[id]);
  await client.query('COMMIT');return result;
 }catch(e){await client.query('ROLLBACK');throw e}finally{client.release()}}
 async close(){await this.pool.end()}
}
