import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { SesionService } from '../../core/sesion/sesion.service';

/** Pantalla de acceso. HTML y estilos idénticos al prototipo v17 (styles/marco.css, bloque «Acceso»). */
@Component({
  selector: 'sigd-acceso',
  imports: [ReactiveFormsModule],
  templateUrl: './acceso.page.html',
})
export class AccesoPage {
  private sesion = inject(SesionService);
  private router = inject(Router);
  protected form = inject(FormBuilder).nonNullable.group({
    identificador: ['', Validators.required],
    password: ['', Validators.required],
  });
  protected verClave = signal(false);
  protected ayuda = signal(false);
  protected error = signal<string | null>(null);
  protected enviando = signal(false);
  private intentado = signal(false);

  protected falta(campo: 'identificador' | 'password') {
    return this.intentado() && this.form.controls[campo].invalid;
  }

  entrar() {
    this.intentado.set(true);
    this.error.set(null);
    const c = this.form.controls;
    if (c.identificador.invalid) return document.getElementById('u')?.focus();
    if (c.password.invalid) return document.getElementById('pw')?.focus();
    this.enviando.set(true);
    this.sesion.iniciar(this.form.getRawValue()).subscribe({
      next: () => this.router.navigateByUrl(this.sesion.rutaInicial()),
      error: (e) => {
        this.error.set(e?.error?.mensaje ?? 'No fue posible iniciar sesión.');
        c.password.reset();
        this.intentado.set(false);
        this.enviando.set(false);
      },
    });
  }
}
