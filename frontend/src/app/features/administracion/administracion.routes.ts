import { Routes } from '@angular/router';
import { proveerRepositorio } from '../../core/repositorios/proveer-repositorio';
import { PeriodosHttpRepository } from './data-access/periodos.http.repository';
import { PeriodosMemoriaRepository } from './data-access/periodos.memoria.repository';
import { PeriodosRepository } from './data-access/periodos.repository';
import { ModuloAdministracion } from './integracion/modulo-administracion';

/**
 * Rutas del módulo Administración.
 *
 * Las seis pantallas del menú las pinta el módulo del equipo de Administración
 * (código en modulos/administracion, integrado con ModuloAdministracion).
 *
 * `periodos-api` es el EJEMPLO DE REFERENCIA del patrón Angular → Django (página → repositorio
 * → API → servicio → BD). No está en el menú; sirve de plantilla para conectar las pantallas a la API.
 */
const vista = (v: string) => ({ path: v, component: ModuloAdministracion, data: { vista: v } });

export default [
  {
    path: '',
    providers: [proveerRepositorio(PeriodosRepository, PeriodosHttpRepository, PeriodosMemoriaRepository)],
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'inicio' },
      vista('inicio'),
      vista('solicitudes'),
      vista('catalogos'),
      vista('usuarios'),
      vista('periodos'),
      vista('bitacora'),
      { path: 'periodos-api', loadComponent: () => import('./pages/periodos/periodos.page').then((m) => m.PeriodosPage) },
    ],
  },
] satisfies Routes;
