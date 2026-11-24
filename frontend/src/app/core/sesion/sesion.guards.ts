import { inject } from '@angular/core';
import { CanActivateFn, CanMatchFn, Router } from '@angular/router';
import { ModuloId } from '../modulos/modulo.model';
import { SesionService } from './sesion.service';

// Importante: todo inject() va ANTES del primer await (después ya no hay contexto de inyección).

/** Requiere sesión iniciada. */
export const sesionGuard: CanActivateFn = async () => {
  const s = inject(SesionService);
  const router = inject(Router);
  await s.asegurarCargada();
  return s.autenticado() || router.parseUrl('/acceso');
};

/** Solo sin sesión (pantalla de acceso). */
export const invitadoGuard: CanActivateFn = async () => {
  const s = inject(SesionService);
  const router = inject(Router);
  await s.asegurarCargada();
  return !s.autenticado() || router.parseUrl(s.rutaInicial());
};

/** El módulo solo se carga si el perfil lo incluye. (El backend vuelve a comprobarlo en cada petición.) */
export const moduloGuard = (id: ModuloId): CanMatchFn => async () => {
  const s = inject(SesionService);
  const router = inject(Router);
  await s.asegurarCargada();
  return s.modulos().some((m) => m.id === id) || router.parseUrl(s.rutaInicial());
};
