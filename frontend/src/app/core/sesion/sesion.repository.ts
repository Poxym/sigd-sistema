import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map, of, throwError } from 'rxjs';
import { API } from '../http/api';
import { Credenciales, Perfil } from './perfil.model';

/** Contrato. Los componentes y servicios dependen de esta clase, no de las implementaciones. */
export abstract class SesionRepository {
  abstract actual(): Observable<Perfil | null>;
  abstract iniciar(c: Credenciales): Observable<Perfil>;
  abstract cerrar(): Observable<void>;
}

@Injectable()
export class SesionHttpRepository extends SesionRepository {
  private http = inject(HttpClient);
  private url = `${API}/identidad/sesion/`;

  actual() {
    return this.http.get<Perfil | null>(this.url, { observe: 'response' }).pipe(map((r) => (r.status === 204 ? null : r.body)));
  }
  iniciar(c: Credenciales) {
    return this.http.post<Perfil>(this.url, c);
  }
  cerrar() {
    return this.http.delete<void>(this.url);
  }
}

/** Cuentas sintéticas del prototipo v17 (contraseña Unistmo#2026). Solo para `start:demo`. */
const DEMO: Perfil[] = [
  { id: 'u209', nombre: 'Ana Ramírez', correo: 'ana.ramirez@unistmo.example', numero_empleado: '209', roles: ['DOCENTE'], modulos: ['plan', 'informe'] },
  { id: 'u118', nombre: 'Luis López', correo: 'luis.lopez@unistmo.example', numero_empleado: '118', roles: ['DOCENTE', 'JEFE_CARRERA'], modulos: ['plan', 'informe', 'reportes'] },
  { id: 'u100', nombre: 'Vicerrectoría', correo: 'vicerrectoria@unistmo.example', numero_empleado: '100', roles: ['VICERRECTORIA'], modulos: ['reportes'] },
  { id: 'u001', nombre: 'Carlos Mendoza', correo: 'administracion@unistmo.example', numero_empleado: '001', roles: ['ADMINISTRADOR'], modulos: ['admin'] },
  { id: 'u000', nombre: 'Coordinación SIGD', correo: 'coordinacion.sigd@unistmo.example', numero_empleado: '000', roles: ['ADMINISTRADOR', 'JEFE_CARRERA'], modulos: ['admin', 'plan', 'informe', 'reportes'] },
];

@Injectable()
export class SesionMemoriaRepository extends SesionRepository {
  private clave = 'sigd-demo-sesion';

  actual() {
    let id: string | null = null;
    try { id = sessionStorage.getItem(this.clave); } catch { /* almacenamiento no disponible */ }
    return of(DEMO.find((p) => p.id === id) ?? null);
  }
  iniciar({ identificador, password }: Credenciales) {
    const v = identificador.trim().toLowerCase();
    const p = DEMO.find((x) => x.numero_empleado === v || x.correo === v);
    if (!p || password !== 'Unistmo#2026') {
      return throwError(() => ({ error: { codigo: 'credenciales', mensaje: 'Usuario o contraseña incorrectos.' } }));
    }
    try { sessionStorage.setItem(this.clave, p.id); } catch { /* sin persistencia */ }
    return of(p);
  }
  cerrar() {
    try { sessionStorage.removeItem(this.clave); } catch { /* nada */ }
    return of(undefined);
  }
}
