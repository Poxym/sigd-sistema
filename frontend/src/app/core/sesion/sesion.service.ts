import { Injectable, computed, inject, signal } from '@angular/core';
import { Observable, firstValueFrom, tap } from 'rxjs';
import { MODULOS } from '../modulos/modulos.registry';
import { Credenciales, Perfil } from './perfil.model';
import { SesionRepository } from './sesion.repository';

/** Nombre visible de cada rol (mismos textos del prototipo v17). */
export const NOMBRE_ROL: Record<string, string> = {
  DOCENTE: 'Docente',
  JEFE_CARRERA: 'Jefe de carrera',
  VICERRECTORIA: 'Vicerrectoría Académica',
  RECTORIA: 'Rectoría',
  SECRETARIA_ACADEMICA: 'Secretaría Académica',
  REPRESENTANTE_INSTITUCIONAL: 'Representante institucional',
  ADMINISTRADOR: 'Administrador general',
};

/** Estado de la sesión para toda la app (señales). */
@Injectable({ providedIn: 'root' })
export class SesionService {
  private repo = inject(SesionRepository);
  private _perfil = signal<Perfil | null>(null);
  private cargada = false;
  /** Cuenta del último inicio de sesión, aún no avisado a los módulos integrados. */
  private accesoPendiente: string | null = null;

  readonly perfil = this._perfil.asReadonly();
  readonly autenticado = computed(() => this._perfil() !== null);
  /** Módulos visibles, en el orden del registro. */
  readonly modulos = computed(() => {
    const ids = this._perfil()?.modulos ?? [];
    return MODULOS.filter((m) => ids.includes(m.id));
  });

  /** Se llama una vez desde los guards: recupera la sesión de la cookie al recargar. */
  async asegurarCargada(): Promise<void> {
    if (this.cargada) return;
    try {
      this._perfil.set(await firstValueFrom(this.repo.actual()));
    } catch {
      this._perfil.set(null);
    }
    this.cargada = true;
  }

  iniciar(c: Credenciales): Observable<Perfil> {
    return this.repo.iniciar(c).pipe(
      tap((p) => {
        this._perfil.set(p);
        this.accesoPendiente = p.numero_empleado;
      }),
    );
  }

  async cerrar(): Promise<void> {
    try { await firstValueFrom(this.repo.cerrar()); } finally { this.limpiar(); }
  }

  /**
   * Avisa a los módulos integrados (evento «sigd:sesion-iniciada», el mismo del prototipo) que hubo un
   * inicio de sesión correcto. Lo llama el módulo cuando ya está montado y escuchando; se entrega una sola vez.
   */
  avisarInicioDeSesion(): void {
    if (!this.accesoPendiente) return;
    document.dispatchEvent(new CustomEvent('sigd:sesion-iniciada', { detail: { cuenta: this.accesoPendiente } }));
    this.accesoPendiente = null;
  }

  limpiar(): void {
    this._perfil.set(null);
  }

  /** Texto bajo el nombre del usuario (U.r en el prototipo): «Docente», «Jefe de carrera», «Todos los módulos»… */
  readonly etiquetaRol = computed(() => {
    const p = this._perfil();
    if (!p) return '';
    if (MODULOS.every((m) => p.modulos.includes(m.id))) return 'Todos los módulos';
    const orden = ['ADMINISTRADOR', 'VICERRECTORIA', 'RECTORIA', 'SECRETARIA_ACADEMICA', 'REPRESENTANTE_INSTITUCIONAL', 'JEFE_CARRERA', 'DOCENTE'];
    const r = orden.find((x) => p.roles.includes(x));
    return r ? NOMBRE_ROL[r] : p.roles.join(' · ');
  });

  tieneRol(...roles: string[]): boolean {
    const mios = this._perfil()?.roles ?? [];
    return roles.some((r) => mios.includes(r));
  }

  /** A dónde ir al entrar: directo al módulo si solo tiene uno; si no, al selector. */
  rutaInicial(): string {
    const mods = this.modulos();
    if (!this.autenticado()) return '/acceso';
    return mods.length === 1 ? `/${mods[0].ruta}` : '/modulos';
  }
}
