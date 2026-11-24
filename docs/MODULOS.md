# Módulos: tablas, pantallas y referencia del prototipo

## Tablas por app de backend

Las 58 tablas de `modelo/schema.json` quedan asignadas a un solo dueño (verificado con un script: ninguna sin asignar ni repetida).

| App | Tablas | Estado |
|---|---|---|
| `identidad` | `users` (Usuario), `employee_history` (Historial de número), `credentials` (Credencial local), `sessions` (Sesión), `roles` (Rol), `permissions` (Permiso), `role_permissions` (Rol permiso), `role_assignments` (Asignación de rol), `approval_delegations` (Delegación temporal) | users, roles, role_assignments implementadas |
| `estructura` | `universities` (Universidad), `campuses` (Campus), `careers` (Carrera), `study_plans` (Plan de estudio), `curriculum_semesters` (Semestre del plan), `subjects` (Materia), `curriculum_subjects` (Asignatura del plan), `periods` (Periodo académico), `capture_windows` (Periodo de captura), `groups` (Grupo), `course_offerings` (Oferta grupo materia), `teaching_assignments` (Asignación docente) | periods implementada (ejemplo) |
| `docentes` | `teachers` (Docente), `teacher_categories` (Categoría docente), `affiliations` (Adscripción docente), `degrees` (Grado de estudios), `distinctions` (Distinción) | pendiente |
| `catalogo` | `rubrics` (Rubro académico), `activities` (Actividad académica), `activity_classifications` (Clasificación vigente), `field_definitions` (Definición de campo), `field_options` (Opción de campo), `evidence_types` (Tipo de evidencia), `activity_evidence_types` (Evidencia requerida), `catalog_versions` (Versión de catálogo), `rubric_configuration` (Configuración de rubro), `activity_configuration` (Configuración de actividad) | pendiente |
| `documentos` | `documents` (Documento docente), `document_sections` (Sección del documento), `activity_records` (Registro de actividad), `field_values` (Valor de campo), `selected_options` (Selección múltiple), `document_versions` (Versión inmutable), `reviews` (Revisión de versión), `review_visits` (Sección revisada), `observations` (Observación), `evidence` (Evidencia) | pendiente |
| `plan_trabajo` | `work_plans` (Plan de trabajo) | pendiente |
| `informe` | `activity_reports` (Informe de actividades), `course_results` (Resultado de curso), `projects` (Proyecto) | pendiente |
| `reportes` | `indicators` (Indicador registrado), `panels` (Panel), `panel_indicators` (Indicador en panel) | pendiente |
| `administracion` | `change_requests` (Solicitud de cambio), `system_settings` (Configuración del sistema) | pendiente |
| `bitacora` | `audit_events` (Bitácora) | pendiente |
| `notificaciones` | `notifications` (Notificación) | pendiente |
| `core` | `idempotency_keys` (Solicitud idempotente) | pendiente |

### Tablas que faltan para Reportes

El diagrama de clases de Vicerrectoría (Usuario, Cumplimiento, ConfiguracionSemaforo, MotorComparacion, Reporte, HistoricoReporte, Dashboard, ArchivoExportado) incluye datos que **no están en `schema.json`**: configuración del semáforo (umbrales cumplido/incompleto/crítico, tope de puntos extra), resultados de cumplimiento por docente y periodo, e histórico de reportes. Hay que agregarlos al esquema (ver DECISIONES D8).

## Pantallas por módulo

| Módulo | Ruta | Pantallas (menú lateral) | Referencia en `prototipo-referencia/` |
|---|---|---|---|
| Administración | `/admin` | inicio, solicitudes, catalogos, usuarios, **periodos** (hecha), bitacora | `administracion/` (html + app.js + css) |
| Plan de Trabajo | `/plan` | mi-plan, historial (docente) · bandeja (jefatura) · notificaciones · ayuda | `plan-trabajo/` (plan.js + plan.dominio.js + css) |
| Informe de Actividades | `/informe` | panel · mi-informe (docente) · revision (jefatura) | `informe-actividades/` |
| Reportes | `/reportes` | resumen, reprobacion, busqueda, investigacion, historico | `reportes/` (html + js + css) |
