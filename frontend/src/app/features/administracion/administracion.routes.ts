import { Routes } from '@angular/router';
import { proveerRepositorio } from '../../core/repositorios/proveer-repositorio';
import { PaginaPendiente } from '../../shared/ui/pagina-pendiente/pagina-pendiente';
import { PeriodosHttpRepository } from './data-access/periodos.http.repository';
import { PeriodosMemoriaRepository } from './data-access/periodos.memoria.repository';
import { PeriodosRepository } from './data-access/periodos.repository';

const ref = 'prototipo-referencia/administracion/administracion.html';
const pendiente = (titulo: string, vista: string) => ({
  component: PaginaPendiente,
  data: { titulo, referencia: `${ref} · #view-${vista}` },
});

/** Rutas del módulo Administración. Los repositorios del módulo se proveen aquí (no en root). */
export default [
  {
    path: '',
    providers: [proveerRepositorio(PeriodosRepository, PeriodosHttpRepository, PeriodosMemoriaRepository)],
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'inicio' },
      { path: 'inicio', ...pendiente('Inicio', 'inicio') },
      { path: 'solicitudes', ...pendiente('Solicitudes de cambio', 'solicitudes') },
      { path: 'catalogos', ...pendiente('Catálogos académicos', 'catalogos') },
      { path: 'usuarios', ...pendiente('Usuarios y permisos', 'usuarios') },
      { path: 'periodos', loadComponent: () => import('./pages/periodos/periodos.page').then((m) => m.PeriodosPage) },
      { path: 'bitacora', ...pendiente('Bitácora', 'bitacora') },
    ],
  },
] satisfies Routes;
