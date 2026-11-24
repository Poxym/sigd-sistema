import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { SesionService } from '../../core/sesion/sesion.service';
import { Marca } from '../marca/marca';

/** «Elija un módulo»: se muestra cuando el usuario tiene más de un módulo. */
@Component({
  selector: 'sigd-selector-modulo',
  imports: [Marca, RouterLink],
  template: `
    <div class="pk-in">
      <div class="pk-head">
        <sigd-marca [subtitulo]="false" />
        <div><h1>Elija un módulo</h1><p>{{ sesion.perfil()?.nombre }}</p></div>
        <button class="btn" type="button" (click)="salir()"><i class="ti ti-logout"></i>Cerrar sesión</button>
      </div>
      <div class="pk-grid">
        @for (m of sesion.modulos(); track m.id) {
          <a class="pk-card" [routerLink]="'/' + m.ruta">
            <span class="pk-ic"><i class="ti ti-{{ m.icono }}"></i></span>
            <b>{{ m.nombre }}</b><span class="d">{{ m.descripcion }}</span>
            <span class="go">Entrar <i class="ti ti-arrow-right"></i></span>
          </a>
        }
      </div>
    </div>
  `,
  styles: `
    :host { display: block; min-height: 100vh; padding: 40px 24px; }
    .pk-in { max-width: 960px; margin: 0 auto; }
    .pk-head { display: flex; align-items: center; gap: 16px; margin-bottom: 28px; flex-wrap: wrap;
      h1 { font-size: 22px; } p { color: var(--muted); } .btn { margin-left: auto; } }
    .pk-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 16px; }
    .pk-card { display: flex; flex-direction: column; gap: 12px; padding: 20px; background: #fff; color: inherit; text-decoration: none;
      border: 1px solid var(--line); border-top: 4px solid var(--p); border-radius: var(--shape-md); transition: box-shadow 0.16s, transform 0.16s;
      &:hover { box-shadow: 0 6px 18px rgba(41, 75, 80, 0.12); transform: translateY(-2px); }
      b { font-size: 17px; } .d { color: var(--muted); font-size: 14px; }
      .go { margin-top: auto; color: var(--p); font-weight: 600; display: inline-flex; gap: 6px; align-items: center; } }
    .pk-ic { width: 48px; height: 48px; border-radius: 12px; background: var(--ps); color: var(--p); display: grid; place-items: center; .ti { font-size: 24px; } }
  `,
})
export class SelectorModulo {
  protected sesion = inject(SesionService);
  private router = inject(Router);
  async salir() {
    await this.sesion.cerrar();
    this.router.navigateByUrl('/acceso');
  }
}
