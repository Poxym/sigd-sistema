# Historial del prototipo (versiones v2 y v3, antes de la Etapa A)

> Las secciones siguientes describen el prototipo cuando eran scripts sueltos en `js/`. Se conservan como registro de las decisiones de diseño. Las rutas `js/…` ya no existen; su código está hoy en `src/`.

## Prototipo v2: rediseño de «Catálogos académicos»

Misma estructura de carpetas que la v1 (y que el módulo Plan de Trabajo). **Solo cambia la pantalla de Catálogos académicos**;
Inicio, Solicitudes, Usuarios, Periodos, Bitácora y el editor de registros quedaron igual (se comparó contra la v1 pixel por pixel).

### Abrir
Doble clic en `index.html` (extrae primero el zip). Opcional: `node servidor.mjs` → http://localhost:4201 o `iniciar.bat`.
Cuenta: `001` · contraseña `Unistmo#2026`.

### Estructura
```
SIGD_Administracion_v2/
├─ index.html · iniciar.bat · servidor.mjs · README.md
├─ css/sigd.css                     marco común del SIGD (sin cambios)
├─ js/
│  ├─ admin-dominio.js              datos de referencia (sin cambios)
│  ├─ admin-estilos.js              estilos generales del módulo (sin cambios)
│  ├─ admin-vista.js                HTML del módulo  ← cambia la sección de Catálogos
│  ├─ admin-catalogos.js            NUEVO · lógica de la pantalla de Catálogos
│  ├─ admin-catalogos-estilos.js    NUEVO · estilos de la pantalla de Catálogos
│  ├─ admin.js                      pantallas y reglas  ← delega Catálogos en admin-catalogos.js
│  └─ sigd.js                       marco: acceso, menú, sesión
└─ assets/
```

### Qué cambió en la pantalla
| Antes | Ahora |
| --- | --- |
| 11 pestañas en una fila que se cortaba («Co…») | Lista lateral de tipos, agrupada, con ícono y conteo; en pantalla angosta pasa a una fila deslizable |
| Tabla de 4 columnas; la «información vinculada» era solo texto | Lista de registros: nombre + clave, descripción y etiquetas de relación (Campus de la carrera, Carrera del plan, Plan de la materia, Plan/Informe del rubro, valor del parámetro) |
| Selector de estado | Chips de filtro con conteo: Todos · Vigentes · Históricos |
| 85 opciones de captura en una sola lista | Subencabezados por grupo (21 grupos) y filtro por grupo |
| Botón de editar solo con ícono | Botón «Editar» con etiqueta; también se puede hacer clic en toda la fila |
| Vacío = mensaje suelto | Estado vacío con texto y acción («Nuevo registro» / «Quitar búsqueda y filtros») |

Agrupación de los tipos (propuesta de UX, por confirmar con el equipo): *Estructura institucional* (Institución, Campus, Carreras) ·
*Oferta académica* (Planes, Materias) · *Plan de Trabajo e Informe* (Rubros, Opciones de captura, Categorías, Comisiones, Distinciones) ·
*Reglas del sistema* (Parámetros y pesos).

### Criterios de Material Design 3 aplicados y de dónde salen
| Decisión | Criterio M3 | Fuente en el proyecto |
| --- | --- | --- |
| Lista lateral en vez de pestañas | Tabs son para pocas categorías; para muchas, patrón lista–detalle | Decisiones M3 §B «Pestañas solo para categorías del mismo nivel» |
| Elemento activo con contenedor secundario | Navigation drawer: indicador activo | cambios_material3 «indicador activo en contenedor secundario» |
| Chips de filtro con ✓ | M3 Chips (filter) | Decisiones M3 §D «Estado: color + texto + icono» |
| Botón «Editar» con etiqueta | Acciones de fila legibles | Decisiones M3 §D «acciones de fila con etiqueta» |
| Un solo botón principal (relleno, 12 px) | Jerarquía de botones | Decisiones reunión #6; M3 §D |
| Campo de búsqueda contorneado de 40 px, borde 3,3:1 | Outlined text field | Decisiones M3 §D; cambios_material3 «contorno de 3:1» |
| Estados vacíos con texto y acción | Empty states | Decisiones M3 §H |
| Texto ≥ 14 px, foco de 3 px, objetivos de 40 px | Accesibilidad | Decisiones M3 §G |
| Solo búsqueda dentro del catálogo (sin buscador global) | — | Decisiones M3 §B «Sin buscador global»; acuerdo 2 |
| Tema claro, paleta única, acento #183E56 | Color roles | Decisiones reunión #1; Documento maestro §6 (profesores > 40 años: claro, pastel, buen contraste) |
| Movimiento de 200 ms, curva estándar, respeta «reducir movimiento» | Motion | Decisiones M3 §G |
| Mostrar relaciones (campus→carrera, carrera→plan, plan→materia) | — | Documento maestro §6 «Campus, carreras y profesores» |
| Conservar y filtrar históricos | — | Documento maestro §6 «se conservan para consulta histórica» |
| Rubros con sección en Plan y en Informe | — | Documento maestro §6 «Plan e Informe no coinciden hoy» |
| Parámetro con valor y unidad visibles | — | Documento maestro §4, punto 3 (pesos y configuraciones) |

Contraste medido (WCAG): texto de apoyo 6,2:1 · clave 8,3:1 · activo 10,8:1 · botón Editar 11,3:1 · advertencia 5,6:1 · borde de búsqueda 3,3:1.

### Verificación
- 21 comprobaciones automáticas en Chromium (búsqueda, chips, grupos, vacíos, editar, guardar, crear, teclado, persistencia): todas correctas, sin errores de consola.
- Capturas en 1440, 1024 y 390 px; las demás pantallas, idénticas a la v1.

### Pendiente
- El editor de registros (diálogo) no se rediseñó: lo comparten Usuarios y Solicitudes. Es el siguiente candidato.
- Quedó CSS antiguo de la tabla y pestañas de catálogos sin usar en `admin-estilos.js`; se puede limpiar.
- El código del «buscador rápido» existe pero ningún control lo abre (igual que en la v1); conviene confirmar si se retira, por el acuerdo «sin buscador global».
- Confirmar con el equipo la agrupación de tipos de catálogo.


## Novedades de la v3 (rediseño Material Design 3 en todo el módulo)

- **Solicitudes de cambio** pasa de tabla a *lista–detalle* (`js/admin-m3.js`, `nxSolicitudes`): a la izquierda la lista, a la derecha la justificación, vigencia, referencia y avance (Pendiente → Autorizada → Aplicada). «Gestionar solicitud» abre el diálogo de siempre, por lo que las reglas de autorizar/aplicar no cambiaron.
- **Chips de filtro** (`nxChips`) para estado de solicitudes, estado de usuarios y tipo de acción de la bitácora. El `<select>` original sigue existiendo (oculto) y es quien manda.
- **Tablas** con encabezado tonal y estado al pasar el cursor (`js/admin-m3-estilos.js`).
- Sin cambios en Inicio, Periodos y Catálogos, salvo los estilos comunes.
- Pendientes: fechas de Periodos siguen el formato del navegador (mm/dd/aaaa en equipos en inglés) frente al acuerdo dd/mm/aaaa; rediseño del diálogo editor.
