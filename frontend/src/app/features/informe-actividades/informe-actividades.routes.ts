import { Routes } from '@angular/router';
import { PaginaPendiente } from '../../shared/ui/pagina-pendiente/pagina-pendiente';

/**
 * Rutas del módulo Informe de Actividades.
 * Al implementar una pantalla: crear pages/<pantalla>/, cambiar su entrada a loadComponent y,
 * si usa datos, agregar su repositorio en data-access/ y proveerlo en `providers` (ver administracion.routes.ts).
 */
export default [
  {
    path: '',
    providers: [],
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'panel' },
      { path: 'panel', component: PaginaPendiente, data: { titulo: 'Panel de control', referencia: 'prototipo-referencia/informe-actividades/informe.js' } },
      { path: 'mi-informe', component: PaginaPendiente, data: { titulo: 'Mi informe', referencia: 'prototipo-referencia/informe-actividades/informe.js' } },
      { path: 'revision', component: PaginaPendiente, data: { titulo: 'Revisión de informes', referencia: 'prototipo-referencia/informe-actividades/informe.js' } },
    ],
  },
] satisfies Routes;
