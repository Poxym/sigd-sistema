# Contexto de la aplicación

## Qué es

El SIGD concentra el ciclo de trabajo docente de un periodo académico en la Universidad del Istmo:

1. **Administración** prepara el periodo: estructura académica, usuarios, roles, catálogo de rubros y ventanas de captura.
2. **Docente** captura su **Plan de Trabajo** sobre el catálogo congelado del periodo y lo envía.
3. **Jefatura de carrera** revisa todas las secciones y aprueba o devuelve con comentario (no puede autoaprobarse).
4. Con el plan aprobado, el docente elabora su **Informe de Actividades**, que referencia exactamente la versión aprobada, y sube evidencias.
5. **Vicerrectoría / Rectoría / Secretaría / Representante** consultan **Reportes**: cumplimiento (plan vs informe), semáforo, reprobación, investigación e histórico.

## Actores y roles

| Rol (código provisional) | Módulos | Notas |
|---|---|---|
| `DOCENTE` | Plan, Informe | Elabora sus documentos |
| `JEFE_CARRERA` | Plan, Informe, Reportes | Revisa documentos de su carrera |
| `VICERRECTORIA` | Reportes | Acceso total al panel; configura semáforo |
| `RECTORIA` | Reportes | Consulta, sin columna de acción |
| `SECRETARIA_ACADEMICA` | Reportes | Sin Investigación ni Histórico |
| `REPRESENTANTE_INSTITUCIONAL` | Reportes | Consulta y auditoría |
| `ADMINISTRADOR` | Administración | Catálogos, usuarios, periodos, bitácora |

Un usuario puede tener varios roles (asignaciones con vigencia y alcance institucional/campus/carrera). Los códigos están por confirmar (ver DECISIONES D5).

## Módulos y contextos

Lo que ve el usuario son **4 módulos**; por dentro el backend se divide en **contextos** más finos para que cada equipo toque sus propias tablas.

| Módulo (UI) | Empresa responsable | Contextos de backend que usa |
|---|---|---|
| Administración del sistema | [aquí empresa se encarga de ...] | identidad, estructura, docentes, catalogo, administracion, bitacora |
| Plan de Trabajo | [aquí empresa se encarga de ...] | plan_trabajo + documentos (común) |
| Informe de Actividades | [aquí empresa se encarga de ...] | informe + documentos (común) |
| Reportes (Vicerrectoría) | [aquí empresa se encarga de ...] | reportes (lee vistas de los demás) |
| (todos) | compartido | core, identidad, notificaciones |

En el frontend el responsable de cada módulo se llena en `core/modulos/modulos.registry.ts` (campo `responsable`) y aparece en las pantallas pendientes.

## Reglas transversales (convenciones v3)

- Identificadores de texto, UUID v7.
- `Vigencia` = inicio + fin opcional; «una vigente» se garantiza con restricción en BD.
- Un catálogo **publicado** es inmutable; un cambio crea una nueva versión. Cada documento conserva su catálogo.
- Las versiones enviadas de un documento son inmutables.
- Evidencias en almacenamiento externo; la BD guarda metadatos y la clave del objeto. Las URL de descarga se generan al momento.
- **Reportes lee vistas publicadas por cada módulo, no sus clases.**
- La bitácora es solo de inserción.
- El backend decide la autorización; el frontend solo oculta lo que no aplica.
