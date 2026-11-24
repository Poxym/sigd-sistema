import { Component, input } from '@angular/core';

/** Título + subtítulo + acciones (contenido proyectado). Úsalo en todas las páginas. */
@Component({
  selector: 'sigd-encabezado-pagina',
  template: `
    <div><h1>{{ titulo() }}</h1>@if (subtitulo()) { <p>{{ subtitulo() }}</p> }</div>
    <div class="acts"><ng-content /></div>
  `,
  styles: `
    :host { display: flex; align-items: flex-end; gap: 8px 16px; flex-wrap: wrap; margin-bottom: 16px; }
    h1 { font-size: 26px; line-height: 32px; } p { margin-top: 2px; color: var(--muted); }
    .acts { margin-left: auto; display: flex; gap: 8px; flex-wrap: wrap; }
  `,
})
export class EncabezadoPagina {
  titulo = input.required<string>();
  subtitulo = input<string>();
}
