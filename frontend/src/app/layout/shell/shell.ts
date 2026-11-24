import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { BarraSuperior } from '../barra-superior/barra-superior';
import { MenuLateral } from '../menu-lateral/menu-lateral';

const CLAVE = 'sigd-menu-colapsado';

/** Marco común: barra superior + menú lateral + contenido del módulo (router-outlet). */
@Component({
  selector: 'sigd-shell',
  imports: [RouterOutlet, BarraSuperior, MenuLateral],
  template: `
    <div class="app" [class.col]="colapsado()" [class.abierto]="abierto()">
      <sigd-barra-superior (abrirMenu)="abierto.set(true)" />
      <sigd-menu-lateral [colapsado]="colapsado()" (alternar)="alternar()" (navegar)="abierto.set(false)" />
      <main id="contenido"><router-outlet /></main>
    </div>
    @if (abierto()) { <div class="scrim" (click)="abierto.set(false)"></div> }
  `,
  styles: `
    .app { min-height: 100vh; display: grid; grid-template-columns: var(--nav-w) minmax(0, 1fr); grid-template-rows: auto 1fr;
      transition: grid-template-columns 0.2s ease; }
    .app.col { grid-template-columns: var(--nav-w-col) minmax(0, 1fr); }
    main { padding: 20px var(--mp) 32px; min-width: 0; }
    .scrim { position: fixed; inset: 0; background: rgba(41, 75, 80, 0.35); z-index: 60; }
    @media (max-width: 920px) { .app, .app.col { grid-template-columns: minmax(0, 1fr); } }
  `,
})
export class Shell {
  protected abierto = signal(false);
  protected colapsado = signal(leer());

  alternar() {
    this.colapsado.update((v) => !v);
    try { localStorage.setItem(CLAVE, this.colapsado() ? '1' : '0'); } catch { /* sin almacenamiento */ }
  }
}

function leer(): boolean {
  try { return localStorage.getItem(CLAVE) === '1'; } catch { return false; }
}
