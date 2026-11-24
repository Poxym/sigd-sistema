import { Component, input } from '@angular/core';

/** Escudo + «SIGD» + subtítulo. Se usa en la barra superior, el acceso y el selector. */
@Component({
  selector: 'sigd-marca',
  template: `
    <span class="escudo"><img src="assets/escudo-unistmo.png" alt="Escudo de la Universidad del Istmo" /></span>
    <i class="div" aria-hidden="true"></i>
    <span class="texto">
      <b>SIGD</b>
      @if (subtitulo()) { <small>Sistema Integral de Gestión Docente</small> }
    </span>
  `,
  styles: `
    :host { display: flex; align-items: center; gap: 14px; }
    .escudo { width: 52px; height: 52px; display: grid; place-items: center; flex: none; }
    img { width: 100%; height: 100%; object-fit: contain; }
    .div { width: 1px; height: 44px; background: var(--line); }
    .texto { display: flex; flex-direction: column; line-height: 1; }
    b { font-size: 26px; line-height: 28px; font-weight: 800; letter-spacing: 0.04em; color: var(--p); }
    small { color: var(--muted); font-size: 13px; line-height: 16px; margin-top: 2px; max-width: 170px; }
    @media (max-width: 1020px) { small { display: none; } }
    @media (max-width: 470px) { .div { display: none; } }
  `,
})
export class Marca {
  subtitulo = input(true);
}
