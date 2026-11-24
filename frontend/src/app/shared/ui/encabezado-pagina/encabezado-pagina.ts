import { Component, input } from '@angular/core';

/** Encabezado de página (.hd del prototipo): título, subtítulo y acciones proyectadas a la derecha. */
@Component({
  selector: 'sigd-encabezado-pagina',
  template: `
    <div class="hd">
      <div><h1>{{ titulo() }}</h1>@if (subtitulo()) { <p>{{ subtitulo() }}</p> }</div>
      <div class="acts"><ng-content /></div>
    </div>
  `,
})
export class EncabezadoPagina {
  titulo = input.required<string>();
  subtitulo = input<string>();
}
