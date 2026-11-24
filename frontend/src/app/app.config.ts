import { provideHttpClient, withInterceptors, withXsrfConfiguration } from '@angular/common/http';
import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { routes } from './app.routes';
import { erroresInterceptor } from './core/http/errores.interceptor';
import { proveerRepositorio } from './core/repositorios/proveer-repositorio';
import { SesionHttpRepository, SesionMemoriaRepository, SesionRepository } from './core/sesion/sesion.repository';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes, withComponentInputBinding()),
    // Django: cookie csrftoken → cabecera X-CSRFToken en POST/PUT/PATCH/DELETE
    provideHttpClient(withXsrfConfiguration({ cookieName: 'csrftoken', headerName: 'X-CSRFToken' }), withInterceptors([erroresInterceptor])),
    // Repositorios globales (los de cada módulo se proveen en sus rutas)
    proveerRepositorio(SesionRepository, SesionHttpRepository, SesionMemoriaRepository),
  ],
};
