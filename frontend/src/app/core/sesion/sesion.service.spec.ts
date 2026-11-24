import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';
import { SesionMemoriaRepository, SesionRepository } from './sesion.repository';
import { SesionService } from './sesion.service';

// Patrón de prueba: se sustituye el repositorio por la implementación en memoria.
describe('SesionService', () => {
  let s: SesionService;
  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [{ provide: SesionRepository, useClass: SesionMemoriaRepository }] });
    s = TestBed.inject(SesionService);
  });

  it('docente con dos módulos va al selector', async () => {
    await firstValueFrom(s.iniciar({ identificador: '209', password: 'Unistmo#2026' }));
    expect(s.modulos().map((m) => m.id)).toEqual(['plan', 'informe']);
    expect(s.rutaInicial()).toBe('/modulos');
  });

  it('Vicerrectoría entra directo a Reportes', async () => {
    await firstValueFrom(s.iniciar({ identificador: 'vicerrectoria@unistmo.example', password: 'Unistmo#2026' }));
    expect(s.rutaInicial()).toBe('/reportes');
  });

  it('rechaza contraseña incorrecta', async () => {
    await expect(firstValueFrom(s.iniciar({ identificador: '209', password: 'x' }))).rejects.toBeTruthy();
    expect(s.autenticado()).toBe(false);
  });
});
