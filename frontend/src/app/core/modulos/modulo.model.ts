export type ModuloId = 'admin' | 'plan' | 'informe' | 'reportes';

/** Un elemento del menú lateral. */
export interface ElementoNav {
  icono: string; // nombre de Tabler sin prefijo: 'layout-dashboard'
  etiqueta: string;
  ruta: string; // relativa al módulo: 'periodos'
  /** Si se indica, solo lo ven estos roles. */
  roles?: string[];
  /** Roles que no lo ven (p. ej. Secretaría no ve Investigación ni Histórico en Reportes). */
  ocultarPara?: string[];
}

/** Descriptor de módulo: lo único que el marco necesita saber de cada módulo. */
export interface ModuloSigd {
  id: ModuloId;
  nombre: string;
  descripcion: string;
  icono: string;
  ruta: string; // segmento de URL
  /** Empresa responsable del módulo. De momento es un marcador; se llena cuando se confirme. */
  responsable: string;
  nav: ElementoNav[];
}
