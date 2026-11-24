import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { SesionService } from '../sesion/sesion.service';

/** Si el backend responde 401/403 por sesión vencida, limpia la sesión y vuelve al acceso. */
export const erroresInterceptor: HttpInterceptorFn = (req, next) => {
  const sesion = inject(SesionService);
  const router = inject(Router);
  return next(req).pipe(
    catchError((e: HttpErrorResponse) => {
      if (e.status === 401 || (e.status === 403 && !sesion.autenticado())) {
        sesion.limpiar();
        router.navigateByUrl('/acceso');
      }
      return throwError(() => e);
    }),
  );
};
