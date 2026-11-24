import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { SesionService } from '../../core/sesion/sesion.service';
import { Marca } from '../../layout/marca/marca';

/** Pantalla de acceso (referencia: prototipo-referencia/00-marco/marco.html, bloque .login). */
@Component({
  selector: 'sigd-acceso',
  imports: [ReactiveFormsModule, Marca],
  templateUrl: './acceso.page.html',
  styleUrl: './acceso.page.scss',
})
export class AccesoPage {
  private sesion = inject(SesionService);
  private router = inject(Router);
  protected form = inject(FormBuilder).nonNullable.group({
    identificador: ['', Validators.required],
    password: ['', Validators.required],
  });
  protected verClave = signal(false);
  protected error = signal<string | null>(null);
  protected enviando = signal(false);

  entrar() {
    this.form.markAllAsTouched();
    if (this.form.invalid) return;
    this.error.set(null);
    this.enviando.set(true);
    this.sesion.iniciar(this.form.getRawValue()).subscribe({
      next: () => this.router.navigateByUrl(this.sesion.rutaInicial()),
      error: (e) => {
        this.error.set(e?.error?.mensaje ?? 'No fue posible iniciar sesión.');
        this.form.controls.password.reset();
        this.enviando.set(false);
      },
    });
  }
}
