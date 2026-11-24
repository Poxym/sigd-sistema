import { ModuloSigd } from './modulo.model';

/** Marcador mientras no se confirme qué empresa lleva cada módulo. */
export const RESPONSABLE_PENDIENTE = '[aquí empresa se encarga de ...]';

/**
 * Registro de módulos (antes MOD + NAVS + items() del prototipo v17).
 * Para agregar una pantalla al menú: añadir su ElementoNav aquí y su ruta en <modulo>.routes.ts.
 */
export const MODULOS: ModuloSigd[] = [
  {
    id: 'admin', nombre: 'Administración', descripcion: 'Catálogos, usuarios y periodos', icono: 'building-bank',
    ruta: 'admin', responsable: RESPONSABLE_PENDIENTE,
    nav: [
      { icono: 'layout-dashboard', etiqueta: 'Inicio', ruta: 'inicio' },
      { icono: 'git-pull-request', etiqueta: 'Solicitudes de cambio', ruta: 'solicitudes' },
      { icono: 'folders', etiqueta: 'Catálogos académicos', ruta: 'catalogos' },
      { icono: 'users', etiqueta: 'Usuarios y permisos', ruta: 'usuarios' },
      { icono: 'calendar-cog', etiqueta: 'Periodos de captura', ruta: 'periodos' },
      { icono: 'clipboard-list', etiqueta: 'Bitácora', ruta: 'bitacora' },
    ],
  },
  {
    id: 'plan', nombre: 'Plan de Trabajo', descripcion: 'Captura y envío del plan del periodo', icono: 'checklist',
    ruta: 'plan', responsable: RESPONSABLE_PENDIENTE,
    nav: [
      { icono: 'layout-dashboard', etiqueta: 'Mi plan', ruta: 'mi-plan', roles: ['DOCENTE'] },
      { icono: 'history', etiqueta: 'Historial', ruta: 'historial', roles: ['DOCENTE'] },
      { icono: 'file-alert', etiqueta: 'Bandeja de revisión', ruta: 'bandeja', roles: ['JEFE_CARRERA'] },
      { icono: 'bell', etiqueta: 'Notificaciones', ruta: 'notificaciones' },
      { icono: 'info-circle', etiqueta: 'Ayuda', ruta: 'ayuda' },
    ],
  },
  {
    id: 'informe', nombre: 'Informe de Actividades', descripcion: 'Actividades realizadas y evidencias', icono: 'file-description',
    ruta: 'informe', responsable: RESPONSABLE_PENDIENTE,
    nav: [
      { icono: 'layout-dashboard', etiqueta: 'Panel de control', ruta: 'panel' },
      { icono: 'pencil', etiqueta: 'Mi informe', ruta: 'mi-informe', roles: ['DOCENTE'] },
      { icono: 'clipboard-check', etiqueta: 'Revisión de informes', ruta: 'revision', roles: ['JEFE_CARRERA'] },
    ],
  },
  {
    id: 'reportes', nombre: 'Reportes', descripcion: 'Consulta e indicadores institucionales', icono: 'chart-bar',
    ruta: 'reportes', responsable: RESPONSABLE_PENDIENTE,
    nav: [
      { icono: 'layout-dashboard', etiqueta: 'Vista General y KPIs', ruta: 'resumen' },
      { icono: 'chart-bar', etiqueta: 'Estadísticas de Reprobación', ruta: 'reprobacion' },
      { icono: 'search', etiqueta: 'Búsqueda e Informes', ruta: 'busqueda' },
      { icono: 'flask', etiqueta: 'Investigación y SNII', ruta: 'investigacion', ocultarPara: ['SECRETARIA_ACADEMICA'] },
      { icono: 'history', etiqueta: 'Histórico y Comparativas', ruta: 'historico', ocultarPara: ['SECRETARIA_ACADEMICA'] },
    ],
  },
];
