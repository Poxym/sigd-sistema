import { inject } from '@angular/core';
import { Routes } from '@angular/router';
import { invitadoGuard, moduloGuard, sesionGuard } from './core/sesion/sesion.guards';
import { SesionService } from './core/sesion/sesion.service';
import { Shell } from './layout/shell/shell';

/**
 * Rutas raíz. Cada módulo se carga perezosamente desde features/<modulo>/<modulo>.routes.ts
 * y solo si el perfil lo incluye (moduloGuard). Los segmentos coinciden con MODULOS[].ruta.
 */
export const routes: Routes = [
  { path: 'acceso', canActivate: [invitadoGuard], loadComponent: () => import('./features/acceso/acceso.page').then((m) => m.AccesoPage) },
  { path: 'modulos', canActivate: [sesionGuard], loadComponent: () => import('./layout/selector-modulo/selector-modulo').then((m) => m.SelectorModulo) },
  {
    path: '',
    component: Shell,
    canActivate: [sesionGuard],
    children: [
      { path: 'admin', canMatch: [moduloGuard('admin')], loadChildren: () => import('./features/administracion/administracion.routes') },
      { path: 'plan', canMatch: [moduloGuard('plan')], loadChildren: () => import('./features/plan-trabajo/plan-trabajo.routes') },
      { path: 'informe', canMatch: [moduloGuard('informe')], loadChildren: () => import('./features/informe-actividades/informe-actividades.routes') },
      { path: 'reportes', canMatch: [moduloGuard('reportes')], loadChildren: () => import('./features/reportes/reportes.routes') },
      { path: '', pathMatch: 'full', redirectTo: () => inject(SesionService).rutaInicial() },
    ],
  },
  { path: '**', redirectTo: '' },
];
