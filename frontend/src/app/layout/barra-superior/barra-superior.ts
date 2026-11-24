import { Component, inject, input, output } from '@angular/core';
import { Router } from '@angular/router';
import { ModuloActivoService } from '../../core/modulos/modulo-activo.service';
import { SesionService } from '../../core/sesion/sesion.service';

/** header.top del prototipo v17 (mismo HTML y clases; estilos en styles/marco.css). */
@Component({
  selector: 'sigd-barra-superior',
  templateUrl: './barra-superior.html',
})
export class BarraSuperior {
  protected sesion = inject(SesionService);
  protected activo = inject(ModuloActivoService);
  protected router = inject(Router);
  abrirMenu = output<void>();
  /** Sombra de la cabecera al desplazar (clase .sc del prototipo). */
  desplazado = input(false);

  protected noLeidas() {
    return this.activo.insignias()['plan/notificaciones'] ?? 0;
  }

  async salir() {
    await this.sesion.cerrar();
    this.router.navigateByUrl('/acceso');
  }
}
