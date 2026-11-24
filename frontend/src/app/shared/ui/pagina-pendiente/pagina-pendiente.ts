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
    <sigd-encabezado-pagina [titulo]="titulo()" [subtitulo]="'Empresa responsable: ' + (activo.modulo()?.responsable ?? '')" />
    <div class="tarjeta vacia">
      <i class="ti ti-tools"></i>
      <p>Pantalla pendiente de migrar a Angular.</p>
      @if (referencia()) { <small>Referencia del prototipo: <code>{{ referencia() }}</code></small> }
    </div>
  `,
  styles: `
    .vacia { display: flex; flex-direction: column; align-items: center; gap: 8px; padding: 48px 16px; text-align: center; color: var(--muted);
      .ti { font-size: 40px; color: var(--pa); } code { background: var(--panel); padding: 2px 6px; border-radius: 4px; } }
  `,
})
export class PaginaPendiente {
  protected activo = inject(ModuloActivoService);
  titulo = input('En construcción');
  referencia = input<string>();
}
