import { Provider, Type } from '@angular/core';
import { environment } from '../../../environments/environment';

/**
 * Patrón repositorio en el frontend (espejo del backend y del diagrama del Plan:
 * RepositorioPlan «interface» · RepositorioHttp · RepositorioMemoria «prototipo»).
 *
 * Los componentes inyectan la clase abstracta; aquí se decide qué implementación usar.
 *   - 'http'    → API Django (/api/...)
 *   - 'memoria' → datos del prototipo, para trabajar sin backend (`npm run start:demo`)
 */
export function proveerRepositorio<T>(contrato: abstract new (...a: never[]) => T, http: Type<T>, memoria: Type<T>): Provider {
  return { provide: contrato, useClass: environment.fuenteDatos === 'memoria' ? memoria : http };
}
