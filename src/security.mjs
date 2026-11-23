import { scryptSync,randomBytes,timingSafeEqual,createHash } from 'node:crypto';
export const hashToken=s=>createHash('sha256').update(s).digest('hex');
export function hashPassword(password){const salt=randomBytes(16).toString('hex');return salt+':'+scryptSync(password,salt,64).toString('hex')}
export function verifyPassword(password,hash){try{const[salt,value]=hash.split(':');const expected=Buffer.from(value,'hex');return expected.length===64&&timingSafeEqual(scryptSync(password,salt,64),expected)}catch{return false}}
export const token=()=>randomBytes(32).toString('base64url');
