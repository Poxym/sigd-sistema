import { Injectable, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router } from '@angular/router';
import { filter, map } from 'rxjs';
import { SesionService } from '../sesion/sesion.service';
import { ElementoNav } from './modulo.model';
import { MODULOS } from './modulos.registry';

/** Deduce el módulo activo de la URL y entrega el menú lateral ya filtrado por rol. */
@Injectable({ providedIn: 'root' })
export class ModuloActivoService {
  private router = inject(Router);
  private sesion = inject(SesionService);
  private url = toSignal(
    this.router.events.pipe(filter((e) => e instanceof NavigationEnd), map(() => this.router.url)),
    { initialValue: this.router.url },
  );
  /** Contadores para el menú, por 'modulo/ruta' (p. ej. 'plan/notificaciones' → 3). Los módulos lo actualizan. */
  readonly insignias = signal<Record<string, number>>({});

  readonly modulo = computed(() => {
    const seg = this.url().split(/[/?#]/)[1];
    return MODULOS.find((m) => m.ruta === seg) ?? null;
  });

  readonly nav = computed<ElementoNav[]>(() => {
    const m = this.modulo();
    if (!m) return [];
    const roles = this.sesion.perfil()?.roles ?? [];
    return m.nav.filter(
      (x) =>
        (!x.roles || x.roles.some((r) => roles.includes(r))) &&
        // se oculta solo si TODOS los roles del usuario están excluidos
        !(x.ocultarPara?.length && roles.length && roles.every((r) => x.ocultarPara!.includes(r))),
    );
  });

  ponerInsignia(clave: string, n: number) {
    this.insignias.update((v) => ({ ...v, [clave]: n }));
  }
}
