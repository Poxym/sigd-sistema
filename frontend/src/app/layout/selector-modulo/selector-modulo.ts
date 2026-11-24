import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { SesionService } from '../../core/sesion/sesion.service';

/** «Elija un módulo» (div.picker del prototipo v17). Estilos en styles/marco.css. */
@Component({
  selector: 'sigd-selector-modulo',
  template: `
    <div class="picker" id="picker"><div class="pk-in">
      <div class="pk-head">
        <img src="assets/escudo-unistmo.png" alt="Escudo de la Universidad del Istmo" /><b class="wm">SIGD</b><i class="vd"></i>
        <div><h1>Elija un módulo</h1><p>{{ sesion.perfil()?.nombre }} · {{ sesion.etiquetaRol() }}</p></div>
        <button class="btn" type="button" (click)="salir()"><i class="ti ti-logout"></i>Cerrar sesión</button>
      </div>
      <div class="pk-grid">
        @for (m of sesion.modulos(); track m.id) {
          <button class="pk-card" type="button" [attr.data-mod]="m.id" (click)="router.navigateByUrl('/' + m.ruta)">
            <span class="pk-ic"><i class="ti ti-{{ m.icono }}"></i></span><b>{{ m.nombre }}</b><span class="d">{{ m.descripcion }}</span>
            <span class="go">Entrar <i class="ti ti-arrow-right"></i></span>
          </button>
        }
      </div>
    </div></div>
  `,
})
export class SelectorModulo {
  protected sesion = inject(SesionService);
  protected router = inject(Router);
  async salir() {
    await this.sesion.cerrar();
    this.router.navigateByUrl('/acceso');
  }
}
