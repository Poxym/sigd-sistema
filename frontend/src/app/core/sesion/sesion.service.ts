import { Injectable, computed, inject, signal } from '@angular/core';
import { Observable, firstValueFrom, tap } from 'rxjs';
import { MODULOS } from '../modulos/modulos.registry';
import { Credenciales, Perfil } from './perfil.model';
import { SesionRepository } from './sesion.repository';

/** Estado de la sesión para toda la app (señales). */
@Injectable({ providedIn: 'root' })
export class SesionService {
  private repo = inject(SesionRepository);
  private _perfil = signal<Perfil | null>(null);
  private cargada = false;

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
    return this.repo.iniciar(c).pipe(tap((p) => this._perfil.set(p)));
  }

  async cerrar(): Promise<void> {
    try { await firstValueFrom(this.repo.cerrar()); } finally { this.limpiar(); }
  }

  limpiar(): void {
    this._perfil.set(null);
  }

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
