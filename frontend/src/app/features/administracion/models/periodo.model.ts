/** Espejo de apps/estructura/api/serializers.py · PeriodoSerializer. */
export interface Periodo {
  id: string;
  clave: string;
  inicio: string; // AAAA-MM-DD
  fin: string;
  semanas_efectivas: number;
  minutos_nominales_semana: number;
  minutos_maximos_semana: number | null;
  aplicar_maximo: boolean;
  umbral_reprobacion: string | null;
  estado: 'ACTIVO' | 'INACTIVO';
}

export type NuevoPeriodo = Pick<Periodo, 'clave' | 'inicio' | 'fin'> & Partial<Pick<Periodo, 'semanas_efectivas' | 'minutos_nominales_semana'>>;
