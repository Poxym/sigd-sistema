import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { API } from '../../../core/http/api';
import { NuevoPeriodo, Periodo } from '../models/periodo.model';
import { PeriodosRepository } from './periodos.repository';

@Injectable()
export class PeriodosHttpRepository extends PeriodosRepository {
  private http = inject(HttpClient);
  private url = `${API}/estructura/periodos/`;

  listar() {
    return this.http.get<Periodo[]>(this.url);
  }
  crear(datos: NuevoPeriodo) {
    return this.http.post<Periodo>(this.url, datos);
  }
}
