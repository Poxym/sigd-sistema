import { Routes } from '@angular/router';
import { PaginaPendiente } from '../../shared/ui/pagina-pendiente/pagina-pendiente';

/**
 * Rutas del módulo Plan de Trabajo.
 * Al implementar una pantalla: crear pages/<pantalla>/, cambiar su entrada a loadComponent y,
 * si usa datos, agregar su repositorio en data-access/ y proveerlo en `providers` (ver administracion.routes.ts).
 */
export default [
  {
    path: '',
    providers: [],
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'mi-plan' },
      { path: 'mi-plan', component: PaginaPendiente, data: { titulo: 'Mi plan', referencia: 'prototipo-referencia/plan-trabajo/plan.js' } },
      { path: 'historial', component: PaginaPendiente, data: { titulo: 'Historial', referencia: 'prototipo-referencia/plan-trabajo/plan.js' } },
      { path: 'bandeja', component: PaginaPendiente, data: { titulo: 'Bandeja de revisión', referencia: 'prototipo-referencia/plan-trabajo/plan.js' } },
      { path: 'notificaciones', component: PaginaPendiente, data: { titulo: 'Notificaciones', referencia: 'prototipo-referencia/plan-trabajo/plan.js' } },
      { path: 'ayuda', component: PaginaPendiente, data: { titulo: 'Ayuda', referencia: 'prototipo-referencia/plan-trabajo/plan.js' } },
    ],
  },
] satisfies Routes;
