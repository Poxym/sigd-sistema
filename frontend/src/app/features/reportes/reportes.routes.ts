import { Routes } from '@angular/router';
import { PaginaPendiente } from '../../shared/ui/pagina-pendiente/pagina-pendiente';

/**
 * Rutas del módulo Reportes.
 * Al implementar una pantalla: crear pages/<pantalla>/, cambiar su entrada a loadComponent y,
 * si usa datos, agregar su repositorio en data-access/ y proveerlo en `providers` (ver administracion.routes.ts).
 */
export default [
  {
    path: '',
    providers: [],
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'resumen' },
      { path: 'resumen', component: PaginaPendiente, data: { titulo: 'Vista General y KPIs', referencia: 'prototipo-referencia/reportes/reportes.html' } },
      { path: 'reprobacion', component: PaginaPendiente, data: { titulo: 'Estadísticas de Reprobación', referencia: 'prototipo-referencia/reportes/reportes.html' } },
      { path: 'busqueda', component: PaginaPendiente, data: { titulo: 'Búsqueda e Informes', referencia: 'prototipo-referencia/reportes/reportes.html' } },
      { path: 'investigacion', component: PaginaPendiente, data: { titulo: 'Investigación y SNII', referencia: 'prototipo-referencia/reportes/reportes.html' } },
      { path: 'historico', component: PaginaPendiente, data: { titulo: 'Histórico y Comparativas', referencia: 'prototipo-referencia/reportes/reportes.html' } },
    ],
  },
] satisfies Routes;
