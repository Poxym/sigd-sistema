import { ModuloId } from '../modulos/modulo.model';

/** Respuesta de GET /api/identidad/sesion/ (apps/identidad/servicios.py · PerfilSesion). */
export interface Perfil {
  id: string;
  nombre: string;
  correo: string;
  numero_empleado: string;
  roles: string[];
  modulos: ModuloId[];
}

export interface Credenciales {
  identificador: string; // número de empleado o correo institucional
  password: string;
}
