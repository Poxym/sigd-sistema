import { Component, inject, output } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { ModuloActivoService } from '../../core/modulos/modulo-activo.service';
import { SesionService } from '../../core/sesion/sesion.service';
import { Marca } from '../marca/marca';

/** header.top del prototipo: marca, selector de módulo, campana, usuario y salir. */
@Component({
  selector: 'sigd-barra-superior',
  imports: [Marca, RouterLink],
  templateUrl: './barra-superior.html',
  styleUrl: './barra-superior.scss',
})
export class BarraSuperior {
  protected sesion = inject(SesionService);
  protected activo = inject(ModuloActivoService);
  private router = inject(Router);
  /** Abre el menú lateral en pantallas angostas. */
  abrirMenu = output<void>();

  protected noLeidas() {
    return this.activo.insignias()['plan/notificaciones'] ?? 0;
  }

  async salir() {
    await this.sesion.cerrar();
    this.router.navigateByUrl('/acceso');
  }
}
