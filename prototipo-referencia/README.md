# Prototipo v17 separado por módulo (solo referencia)

Extraído automáticamente de `SIGD_UNIFICACION_v17_Vicerrectoria.html`. No se ejecuta tal cual: las piezas dependen del marco (`$`, `U`, `ICONS`…). Sirve para consultar pantallas, textos, datos de ejemplo y reglas al migrar a Angular.

| Carpeta | Contenido | Empresa responsable |
|---|---|---|
| `00-marco/` | acceso, selector de módulo, barra superior, menú lateral (`marco.html/css/js`), iconos, logo y fuente | compartido |
| `administracion/` *(superado: la versión vigente es `modulos/administracion/`)* | `administracion.html` (vistas), `administracion.app.js` (lógica), `.css` | [aquí empresa se encarga de ...] |
| `plan-trabajo/` | `plan.js` (interfaz), `plan.dominio.js` (carga, validación, envío; empaquetado), `plan.css` | [aquí empresa se encarga de ...] |
| `informe-actividades/` | `informe.js`, `informe.css` | [aquí empresa se encarga de ...] |
| `reportes/` | `reportes.html` (vistas), `reportes.js`, `reportes.css` | [aquí empresa se encarga de ...] |

`extras-debug-y-sesion.html` contiene el simulador de rol y la sesión persistente del prototipo; no pasan a producción.
