import { Observable } from 'rxjs';
import { NuevoPeriodo, Periodo } from '../models/periodo.model';

/** Contrato del repositorio de periodos. La página solo conoce esta clase. */
export abstract class PeriodosRepository {
  abstract listar(): Observable<Periodo[]>;
  abstract crear(datos: NuevoPeriodo): Observable<Periodo>;
}
