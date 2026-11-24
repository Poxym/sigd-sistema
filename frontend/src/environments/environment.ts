/** Configuración de producción. */
export const environment = {
  produccion: true,
  /** 'http' = API Django · 'memoria' = datos de demostración sin backend */
  fuenteDatos: 'http' as 'http' | 'memoria',
};
