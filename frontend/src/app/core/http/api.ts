/** Todas las rutas del backend cuelgan de /api (en desarrollo, proxy.conf.json las manda a Django). */
export const API = '/api';

/** Forma uniforme de los errores del backend (apps/core/api/errores.py). */
export interface ErrorApi {
  codigo: string;
  mensaje: string;
  detalle?: Record<string, unknown>;
}
