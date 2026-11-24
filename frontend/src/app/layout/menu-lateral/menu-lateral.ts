import { Component, inject, input, output } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { ModuloActivoService } from '../../core/modulos/modulo-activo.service';

/** aside.nav del prototipo v17: botón «Ocultar menú», separador y la lista del módulo activo. */
@Component({
  selector: 'sigd-menu-lateral',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './menu-lateral.html',
})
export class MenuLateral {
  protected activo = inject(ModuloActivoService);
  colapsado = input(false);
  alternar = output<void>();
  navegar = output<void>();

  protected insignia(ruta: string) {
    const m = this.activo.modulo();
    return m ? (this.activo.insignias()[`${m.id}/${ruta}`] ?? 0) : 0;
  }
}
