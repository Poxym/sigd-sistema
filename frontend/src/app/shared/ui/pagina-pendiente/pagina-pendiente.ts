import { Component, inject, input } from '@angular/core';
import { ModuloActivoService } from '../../../core/modulos/modulo-activo.service';
import { EncabezadoPagina } from '../encabezado-pagina/encabezado-pagina';

/**
 * Página provisional. Las rutas que aún no existen la usan con `data: { titulo, referencia }`
 * (withComponentInputBinding pasa `data` como inputs). Reemplazar al implementar la pantalla.
 */
@Component({
  selector: 'sigd-pagina-pendiente',
  imports: [EncabezadoPagina],
  template: `
    <sigd-encabezado-pagina [titulo]="titulo()" [subtitulo]="activo.modulo()?.nombre">
      <span class="resp"><i class="ti ti-users"></i>Empresa responsable: {{ activo.modulo()?.responsable }}</span>
    </sigd-encabezado-pagina>
    <section class="card pendiente">
      <span class="ic"><i class="ti ti-tools"></i></span>
      <b>Pantalla pendiente de migrar a Angular</b>
      <span>Toma el diseño, los textos y los datos de ejemplo del prototipo.</span>
      @if (referencia()) { <code>{{ referencia() }}</code> }
    </section>
  `,
})
export class PaginaPendiente {
  protected activo = inject(ModuloActivoService);
  titulo = input('En construcción');
  referencia = input<string>();
}
