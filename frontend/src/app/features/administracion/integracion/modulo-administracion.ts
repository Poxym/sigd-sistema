import { Component, ElementRef, OnDestroy, effect, inject, input, signal, viewChild } from '@angular/core';
import { Router } from '@angular/router';
import { SesionService } from '../../../core/sesion/sesion.service';

/**
 * Integración del módulo Administración (proyecto propio en modulos/administracion).
 *
 * El módulo se compila con `npm run build:sigd` a public/modulos/administracion/administracion.js
 * y expone window.SigdAdministracion.NX. Aquí solo se monta dentro del marco de Angular:
 *   - cada ruta del menú lateral llama a NX.go(<vista>);
 *   - si el módulo cambia de vista por dentro (p. ej. una cifra de Inicio abre Solicitudes),
 *     se actualiza la URL para que el menú lateral marque la opción correcta.
 * Sus datos viven por ahora en el navegador (su repositorio, ADR-006); conectarlo a la API
 * se hace cambiando su adaptador de almacenamiento, no este componente.
 */
interface NxApi {
  mount(el: HTMLElement): void;
  go(vista: string): void;
  active(): string;
  views: string[];
}
declare global {
  interface Window { SigdAdministracion?: { NX: NxApi } }
}

const URL_MODULO = '/modulos/administracion/administracion.js';
let carga: Promise<NxApi> | null = null;

/** Carga el script una sola vez por sesión del navegador. */
function cargarModulo(): Promise<NxApi> {
  if (window.SigdAdministracion) return Promise.resolve(window.SigdAdministracion.NX);
  return (carga ??= new Promise<NxApi>((resolve, reject) => {
    const s = document.createElement('script');
    s.src = URL_MODULO;
    s.onload = () => (window.SigdAdministracion ? resolve(window.SigdAdministracion.NX) : reject(new Error('El módulo no expuso NX')));
    s.onerror = () => { carga = null; reject(new Error('No se encontró ' + URL_MODULO + '. Ejecuta npm run build:sigd en modulos/administracion.')); };
    document.head.appendChild(s);
  }));
}

@Component({
  selector: 'sigd-modulo-administracion',
  template: `
    @if (error()) {
      <div class="aviso error" role="alert"><i class="ti ti-alert-triangle"></i><span>{{ error() }}</span></div>
    }
    <div #anfitrion class="nx-anfitrion"></div>
  `,
  styles: `:host { display: block; } .nx-anfitrion { min-height: 60vh; }`,
})
export class ModuloAdministracion implements OnDestroy {
  /** Vista del módulo; llega desde `data: { vista }` de la ruta. */
  vista = input.required<string>();
  private anfitrion = viewChild.required<ElementRef<HTMLElement>>('anfitrion');
  private router = inject(Router);
  private sesion = inject(SesionService);
  protected error = signal<string | null>(null);
  private nx: NxApi | null = null;
  private observador?: MutationObserver;

  constructor() {
    effect(() => {
      const vista = this.vista();
      const el = this.anfitrion().nativeElement;
      cargarModulo()
        .then((nx) => {
          this.nx = nx;
          if (!el.firstChild) { nx.mount(el); this.vigilarNavegacionInterna(el); }
          if (nx.active() !== vista) nx.go(vista);
          // Inicio cuenta los accesos: se le avisa ya que está montado y escuchando.
          this.sesion.avisarInicioDeSesion();
        })
        .catch((e: Error) => this.error.set(e.message));
    });
  }

  /** Si el módulo cambia de vista por su cuenta, la URL lo sigue (sin recargar nada). */
  private vigilarNavegacionInterna(el: HTMLElement) {
    const raiz = el.querySelector('#nxhost')?.shadowRoot;
    if (!raiz) return;
    this.observador = new MutationObserver(() => {
      const activa = raiz.querySelector('.view.active')?.id?.replace('view-', '');
      if (activa && activa !== this.vista() && this.nx?.views.includes(activa)) {
        this.router.navigate(['/admin', activa], { replaceUrl: true });
      }
    });
    raiz.querySelectorAll('.view').forEach((v) => this.observador!.observe(v, { attributes: true, attributeFilter: ['class'] }));
  }

  ngOnDestroy() {
    this.observador?.disconnect();
  }
}
