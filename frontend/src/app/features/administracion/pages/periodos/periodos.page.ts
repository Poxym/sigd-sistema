import { DatePipe } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { EncabezadoPagina } from '../../../../shared/ui/encabezado-pagina/encabezado-pagina';
import { PeriodosRepository } from '../../data-access/periodos.repository';
import { Periodo } from '../../models/periodo.model';

/**
 * EJEMPLO DE REFERENCIA de una página completa: página → repositorio (contrato) → http | memoria.
 * Diseño final pendiente: prototipo-referencia/administracion (vista #view-periodos).
 */
@Component({
  selector: 'sigd-periodos',
  imports: [EncabezadoPagina, ReactiveFormsModule, DatePipe],
  templateUrl: './periodos.page.html',
  styles: `
    .alta { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 12px; align-items: end; }
    .alta .btn { min-height: 48px; justify-content: center; }
    .aviso { margin-top: 12px; }
  `,
})
export class PeriodosPage {
  private repo = inject(PeriodosRepository);
  protected periodos = signal<Periodo[]>([]);
  protected error = signal<string | null>(null);
  protected hoy = new Date().toISOString().slice(0, 10);
  protected vigente = computed(() => this.periodos().find((p) => p.inicio <= this.hoy && this.hoy <= p.fin) ?? null);
  protected form = inject(FormBuilder).nonNullable.group({
    clave: ['', Validators.required],
    inicio: ['', Validators.required],
    fin: ['', Validators.required],
  });

  constructor() {
    this.cargar();
  }

  cargar() {
    this.repo.listar().subscribe((p) => this.periodos.set(p));
  }

  crear() {
    if (this.form.invalid) return this.form.markAllAsTouched();
    this.error.set(null);
    this.repo.crear(this.form.getRawValue()).subscribe({
      next: () => { this.form.reset(); this.cargar(); },
      error: (e) => this.error.set(e?.error?.mensaje ?? 'No se pudo guardar.'),
    });
  }
}
