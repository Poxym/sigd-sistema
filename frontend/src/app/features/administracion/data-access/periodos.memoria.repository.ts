import { Injectable } from '@angular/core';
import { of, throwError } from 'rxjs';
import { NuevoPeriodo, Periodo } from '../models/periodo.model';
import { PeriodosRepository } from './periodos.repository';

/** Datos de demostración. Replica las reglas del backend solo lo necesario para probar la UI. */
@Injectable()
export class PeriodosMemoriaRepository extends PeriodosRepository {
  private datos: Periodo[] = [
    { id: 'p1', clave: '2026-2027 A', inicio: '2026-08-10', fin: '2026-12-04', semanas_efectivas: 14, minutos_nominales_semana: 2400, minutos_maximos_semana: 2400, aplicar_maximo: true, umbral_reprobacion: '30.00', estado: 'ACTIVO' },
    { id: 'p0', clave: '2025-2026 B', inicio: '2026-02-09', fin: '2026-06-12', semanas_efectivas: 14, minutos_nominales_semana: 2400, minutos_maximos_semana: null, aplicar_maximo: false, umbral_reprobacion: null, estado: 'ACTIVO' },
  ];

  listar() {
    return of([...this.datos]);
  }

  crear(d: NuevoPeriodo) {
    if (this.datos.some((p) => d.inicio <= p.fin && p.inicio <= d.fin)) {
      return throwError(() => ({ error: { codigo: 'regla_negocio', mensaje: 'Las fechas se traslapan con otro periodo.' } }));
    }
    const p: Periodo = { id: crypto.randomUUID(), semanas_efectivas: 14, minutos_nominales_semana: 2400, minutos_maximos_semana: null, aplicar_maximo: false, umbral_reprobacion: null, estado: 'ACTIVO', ...d };
    this.datos = [p, ...this.datos];
    return of(p);
  }
}
