import { TestBed } from '@angular/core/testing';
import { Router, UrlTree, provideRouter } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { moduloGuard } from './sesion.guards';
import { SesionMemoriaRepository, SesionRepository } from './sesion.repository';
import { SesionService } from './sesion.service';

describe('moduloGuard', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideRouter([]), { provide: SesionRepository, useClass: SesionMemoriaRepository }] });
  });

  it('un docente que pide Administración vuelve al selector', async () => {
    await firstValueFrom(TestBed.inject(SesionService).iniciar({ identificador: '209', password: 'Unistmo#2026' }));
    const r = await TestBed.runInInjectionContext(() => moduloGuard('admin')({} as never, [], {} as never) as Promise<boolean | UrlTree>);
    expect(TestBed.inject(Router).serializeUrl(r as UrlTree)).toBe('/modulos');
  });

  it('deja pasar a un módulo del perfil', async () => {
    await firstValueFrom(TestBed.inject(SesionService).iniciar({ identificador: '209', password: 'Unistmo#2026' }));
    expect(await TestBed.runInInjectionContext(() => moduloGuard('plan')({} as never, [], {} as never))).toBe(true);
  });
});
