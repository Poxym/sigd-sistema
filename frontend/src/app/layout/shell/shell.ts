import { Component, HostListener, computed, inject, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ModuloActivoService } from '../../core/modulos/modulo-activo.service';
import { BarraSuperior } from '../barra-superior/barra-superior';
import { MenuLateral } from '../menu-lateral/menu-lateral';

const CLAVE = 'sigd.nav.col';

/** div.app del prototipo v17: cabecera + menú lateral + contenido (#mn). Estilos en styles/marco.css. */
@Component({
  selector: 'sigd-shell',
  imports: [RouterOutlet, BarraSuperior, MenuLateral],
  template: `
    <div class="app" [class.col]="colapsado()" [class.open]="abierto()" [attr.data-mod]="modulo()">
      <sigd-barra-superior [desplazado]="desplazado()" (abrirMenu)="abierto.set(true)" />
      <sigd-menu-lateral [colapsado]="colapsado()" (alternar)="alternar()" (navegar)="abierto.set(false)" />
      <main id="mn"><router-outlet /></main>
    </div>
    @if (abierto()) { <div class="scrim" (click)="abierto.set(false)"></div> }
  `,
})
export class Shell {
  private activo = inject(ModuloActivoService);
  protected modulo = computed(() => this.activo.modulo()?.id ?? '');
  protected abierto = signal(false);
  protected colapsado = signal(leer());
  protected desplazado = signal(false);

  @HostListener('window:scroll')
  alDesplazar() {
    this.desplazado.set((window.scrollY || document.documentElement.scrollTop) > 2);
  }

  alternar() {
    this.colapsado.update((v) => !v);
    try { localStorage.setItem(CLAVE, this.colapsado() ? '1' : '0'); } catch { /* sin almacenamiento */ }
  }
}

function leer(): boolean {
  try { return localStorage.getItem(CLAVE) === '1'; } catch { return false; }
}
