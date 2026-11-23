# Diccionario de datos SIGD

Identificadores opacos `text` estables. El número de empleado conserva ceros iniciales y tiene historial. `auth_uid` es único, opcional para acceso local y distinto del ID de negocio. PK, FK e índices se generan desde schema.json.

## Universidad · `universities`

| Campo | Tipo | Obligatorio | Relación |
|---|---|---|---|
| id | text | Sí |  |
| name | text | Sí |  |

Unicidad: []

## Campus · `campuses`

| Campo | Tipo | Obligatorio | Relación |
|---|---|---|---|
| id | text | Sí |  |
| university_id | text | Sí | universities |
| code | text | Sí |  |
| name | text | Sí |  |
| active | boolean | Sí |  |

Unicidad: [['code']]

## Carrera · `careers`

| Campo | Tipo | Obligatorio | Relación |
|---|---|---|---|
| id | text | Sí |  |
| campus_id | text | Sí | campuses |
| predecessor_id | text | No | careers |
| code | text | Sí |  |
| name | text | Sí |  |
| active | boolean | Sí |  |

Unicidad: [['code']]

## Plan de estudio · `study_plans`

| Campo | Tipo | Obligatorio | Relación |
|---|---|---|---|
| id | text | Sí |  |
| career_id | text | Sí | careers |
| created_by | text | Sí | users |
| name | text | Sí |  |
| semesters | integer | Sí |  |
| registered_at | timestamptz | Sí |  |
| active | boolean | Sí |  |

Unicidad: []

## Semestre del plan · `curriculum_semesters`

| Campo | Tipo | Obligatorio | Relación |
|---|---|---|---|
| id | text | Sí |  |
| study_plan_id | text | Sí | study_plans |
| number | integer | Sí |  |

Unicidad: [['study_plan_id', 'number']]

## Materia · `subjects`

| Campo | Tipo | Obligatorio | Relación |
|---|---|---|---|
| id | text | Sí |  |
| code | text | Sí |  |
| name | text | Sí |  |
| credits | numeric | Sí |  |
| active | boolean | Sí |  |

Unicidad: [['code']]

## Asignatura del plan · `curriculum_subjects`

| Campo | Tipo | Obligatorio | Relación |
|---|---|---|---|
| id | text | Sí |  |
| semester_id | text | Sí | curriculum_semesters |
| subject_id | text | Sí | subjects |

Unicidad: [['semester_id', 'subject_id']]

## Periodo académico · `periods`

| Campo | Tipo | Obligatorio | Relación |
|---|---|---|---|
| id | text | Sí |  |
| code | text | Sí |  |
| start | date | Sí |  |
| end | date | Sí |  |
| effective_weeks | numeric | Sí |  |
| nominal_weekly_minutes | numeric | Sí |  |
| maximum_weekly_minutes | numeric | Sí |  |
| enforce_maximum | boolean | Sí |  |
| rejection_threshold | numeric | Sí |  |
| state | text | Sí |  |
| catalog_id | text | No | catalog_versions |

Unicidad: [['code']]

## Periodo de captura · `capture_windows`

| Campo | Tipo | Obligatorio | Relación |
|---|---|---|---|
| id | text | Sí |  |
| period_id | text | Sí | periods |
| kind | text | Sí |  |
| opens_at | timestamptz | Sí |  |
| closes_at | timestamptz | Sí |  |
| enabled | boolean | Sí |  |

Unicidad: [['period_id', 'kind']]

## Grupo · `groups`

| Campo | Tipo | Obligatorio | Relación |
|---|---|---|---|
| id | text | Sí |  |
| period_id | text | Sí | periods |
| campus_id | text | Sí | campuses |
| semester_id | text | No | curriculum_semesters |
| code | text | Sí |  |
| kind | text | Sí |  |
| capacity | integer | Sí |  |

Unicidad: [['period_id', 'campus_id', 'code']]

## Oferta grupo materia · `course_offerings`

| Campo | Tipo | Obligatorio | Relación |
|---|---|---|---|
| id | text | Sí |  |
| group_id | text | Sí | groups |
| subject_id | text | Sí | subjects |

Unicidad: [['group_id', 'subject_id']]

## Asignación docente · `teaching_assignments`

| Campo | Tipo | Obligatorio | Relación |
|---|---|---|---|
| id | text | Sí |  |
| offering_id | text | Sí | course_offerings |
| teacher_id | text | Sí | teachers |
| previous_id | text | No | teaching_assignments |
| start | date | Sí |  |
| end | date | No |  |
| weekly_minutes | numeric | Sí |  |
| students | integer | Sí |  |
| change_reason | text | No |  |

Unicidad: []

## Usuario · `users`

| Campo | Tipo | Obligatorio | Relación |
|---|---|---|---|
| id | text | Sí |  |
| auth_uid | text | No |  |
| employee_number | text | Sí |  |
| first_name | text | Sí |  |
| last_name | text | Sí |  |
| second_last_name | text | No |  |
| email | text | Sí |  |
| active | boolean | Sí |  |

Unicidad: [['employee_number'], ['email'], ['auth_uid']]

## Historial de número · `employee_history`

| Campo | Tipo | Obligatorio | Relación |
|---|---|---|---|
| id | text | Sí |  |
| user_id | text | Sí | users |
| employee_number | text | Sí |  |
| start | date | Sí |  |
| end | date | No |  |

Unicidad: []

## Grado de estudios · `degrees`

| Campo | Tipo | Obligatorio | Relación |
|---|---|---|---|
| id | text | Sí |  |
| user_id | text | Sí | users |
| level | text | Sí |  |
| program | text | Sí |  |
| institution | text | Sí |  |
| obtained_on | date | Sí |  |
| license | text | No |  |
| official | boolean | Sí |  |
| maximum | boolean | Sí |  |

Unicidad: []

## Categoría docente · `teacher_categories`

| Campo | Tipo | Obligatorio | Relación |
|---|---|---|---|
| id | text | Sí |  |
| code | text | Sí |  |
| name | text | Sí |  |
| level | text | Sí |  |
| researcher | boolean | Sí |  |
| active | boolean | Sí |  |

Unicidad: [['code']]

## Docente · `teachers`

| Campo | Tipo | Obligatorio | Relación |
|---|---|---|---|
| id | text | Sí |  |
| user_id | text | Sí | users |
| category_id | text | Sí | teacher_categories |
| joined_on | date | Sí |  |

Unicidad: [['user_id']]

## Adscripción docente · `affiliations`

| Campo | Tipo | Obligatorio | Relación |
|---|---|---|---|
| id | text | Sí |  |
| teacher_id | text | Sí | teachers |
| career_id | text | Sí | careers |
| start | date | Sí |  |
| end | date | No |  |

Unicidad: []

## Distinción · `distinctions`

| Campo | Tipo | Obligatorio | Relación |
|---|---|---|---|
| id | text | Sí |  |
| teacher_id | text | Sí | teachers |
| name | text | Sí |  |
| level | text | No |  |
| start | date | Sí |  |
| end | date | No |  |

Unicidad: []

## Rol · `roles`

| Campo | Tipo | Obligatorio | Relación |
|---|---|---|---|
| id | text | Sí |  |
| code | text | Sí |  |
| name | text | Sí |  |
| active | boolean | Sí |  |

Unicidad: [['code']]

## Permiso · `permissions`

| Campo | Tipo | Obligatorio | Relación |
|---|---|---|---|
| id | text | Sí |  |
| resource | text | Sí |  |
| action | text | Sí |  |

Unicidad: [['resource', 'action']]

## Rol permiso · `role_permissions`

| Campo | Tipo | Obligatorio | Relación |
|---|---|---|---|
| id | text | Sí |  |
| role_id | text | Sí | roles |
| permission_id | text | Sí | permissions |

Unicidad: [['role_id', 'permission_id']]

## Asignación de rol · `role_assignments`

| Campo | Tipo | Obligatorio | Relación |
|---|---|---|---|
| id | text | Sí |  |
| user_id | text | Sí | users |
| role_id | text | Sí | roles |
| campus_id | text | No | campuses |
| career_id | text | No | careers |
| start | date | Sí |  |
| end | date | No |  |

Unicidad: []

## Delegación temporal · `approval_delegations`

| Campo | Tipo | Obligatorio | Relación |
|---|---|---|---|
| id | text | Sí |  |
| career_id | text | Sí | careers |
| user_id | text | Sí | users |
| assigned_by | text | Sí | users |
| start | date | Sí |  |
| end | date | Sí |  |
| reason | text | Sí |  |

Unicidad: []

## Bitácora · `audit_events`

| Campo | Tipo | Obligatorio | Relación |
|---|---|---|---|
| id | text | Sí |  |
| actor_id | text | Sí | users |
| at | timestamptz | Sí |  |
| action | text | Sí |  |
| entity | text | Sí |  |
| record_id | text | Sí |  |
| before | jsonb | No |  |
| after | jsonb | No |  |

Unicidad: []

## Notificación · `notifications`

| Campo | Tipo | Obligatorio | Relación |
|---|---|---|---|
| id | text | Sí |  |
| user_id | text | Sí | users |
| document_id | text | No | documents |
| at | timestamptz | Sí |  |
| title | text | Sí |  |
| body | text | Sí |  |
| read_at | timestamptz | No |  |

Unicidad: []

## Rubro académico · `rubrics`

| Campo | Tipo | Obligatorio | Relación |
|---|---|---|---|
| id | text | Sí |  |
| code | text | Sí |  |
| name | text | Sí |  |
| axis | text | Sí |  |
| active | boolean | Sí |  |

Unicidad: [['code']]

## Actividad académica · `activities`

| Campo | Tipo | Obligatorio | Relación |
|---|---|---|---|
| id | text | Sí |  |
| code | text | Sí |  |
| name | text | Sí |  |
| active | boolean | Sí |  |

Unicidad: [['code']]

## Clasificación vigente · `activity_classifications`

| Campo | Tipo | Obligatorio | Relación |
|---|---|---|---|
| id | text | Sí |  |
| activity_id | text | Sí | activities |
| rubric_id | text | Sí | rubrics |
| start | date | Sí |  |
| end | date | No |  |

Unicidad: []

## Definición de campo · `field_definitions`

| Campo | Tipo | Obligatorio | Relación |
|---|---|---|---|
| id | text | Sí |  |
| activity_id | text | Sí | activities |
| key | text | Sí |  |
| label | text | Sí |  |
| type | text | Sí |  |
| required | boolean | Sí |  |
| position | integer | Sí |  |
| constraints | jsonb | Sí |  |
| comparison_key | text | No |  |

Unicidad: [['activity_id', 'key']]

## Opción de campo · `field_options`

| Campo | Tipo | Obligatorio | Relación |
|---|---|---|---|
| id | text | Sí |  |
| field_id | text | Sí | field_definitions |
| value | text | Sí |  |
| label | text | Sí |  |
| position | integer | Sí |  |

Unicidad: [['field_id', 'value']]

## Tipo de evidencia · `evidence_types`

| Campo | Tipo | Obligatorio | Relación |
|---|---|---|---|
| id | text | Sí |  |
| code | text | Sí |  |
| name | text | Sí |  |
| mime_types | jsonb | Sí |  |
| max_bytes | integer | Sí |  |

Unicidad: [['code']]

## Evidencia requerida · `activity_evidence_types`

| Campo | Tipo | Obligatorio | Relación |
|---|---|---|---|
| id | text | Sí |  |
| activity_id | text | Sí | activities |
| evidence_type_id | text | Sí | evidence_types |
| required | boolean | Sí |  |

Unicidad: [['activity_id', 'evidence_type_id']]

## Versión de catálogo · `catalog_versions`

| Campo | Tipo | Obligatorio | Relación |
|---|---|---|---|
| id | text | Sí |  |
| period_id | text | Sí | periods |
| version | integer | Sí |  |
| published_at | timestamptz | Sí |  |
| published_by | text | Sí | users |
| content | jsonb | Sí |  |

Unicidad: [['period_id', 'version']]

## Configuración de rubro · `rubric_configuration`

| Campo | Tipo | Obligatorio | Relación |
|---|---|---|---|
| id | text | Sí |  |
| catalog_id | text | Sí | catalog_versions |
| rubric_id | text | Sí | rubrics |
| in_plan | boolean | Sí |  |
| in_report | boolean | Sí |  |
| required | boolean | Sí |  |
| position | integer | Sí |  |

Unicidad: [['catalog_id', 'rubric_id']]

## Configuración de actividad · `activity_configuration`

| Campo | Tipo | Obligatorio | Relación |
|---|---|---|---|
| id | text | Sí |  |
| configuration_id | text | Sí | rubric_configuration |
| activity_id | text | Sí | activities |
| calculation | text | Sí |  |
| parameters | jsonb | Sí |  |
| required | boolean | Sí |  |
| position | integer | Sí |  |

Unicidad: [['configuration_id', 'activity_id']]

## Proyecto · `projects`

| Campo | Tipo | Obligatorio | Relación |
|---|---|---|---|
| id | text | Sí |  |
| code | text | Sí |  |
| name | text | Sí |  |
| funding | text | Sí |  |
| start | date | Sí |  |
| end | date | No |  |

Unicidad: [['code']]

## Documento docente · `documents`

| Campo | Tipo | Obligatorio | Relación |
|---|---|---|---|
| id | text | Sí |  |
| teacher_id | text | Sí | teachers |
| period_id | text | Sí | periods |
| career_id | text | Sí | careers |
| catalog_id | text | Sí | catalog_versions |
| kind | text | Sí |  |
| state | text | Sí |  |
| version | integer | Sí |  |
| revision | integer | Sí |  |
| created_at | timestamptz | Sí |  |
| updated_at | timestamptz | Sí |  |
| submitted_at | timestamptz | No |  |
| approved_at | timestamptz | No |  |
| content | jsonb | Sí |  |

Unicidad: [['teacher_id', 'period_id', 'kind']]

## Plan de trabajo · `work_plans`

| Campo | Tipo | Obligatorio | Relación |
|---|---|---|---|
| id | text | Sí |  |
| document_id | text | Sí | documents |
| submitted_version | integer | No |  |

Unicidad: [['document_id']]

## Informe de actividades · `activity_reports`

| Campo | Tipo | Obligatorio | Relación |
|---|---|---|---|
| id | text | Sí |  |
| document_id | text | Sí | documents |
| plan_document_id | text | Sí | documents |
| plan_version_id | text | Sí | document_versions |
| current_section | text | No |  |

Unicidad: [['document_id']]

## Sección del documento · `document_sections`

| Campo | Tipo | Obligatorio | Relación |
|---|---|---|---|
| id | text | Sí |  |
| document_id | text | Sí | documents |
| rubric_id | text | Sí | rubrics |
| state | text | Sí |  |
| confirmed_at | timestamptz | No |  |

Unicidad: [['document_id', 'rubric_id']]

## Registro de actividad · `activity_records`

| Campo | Tipo | Obligatorio | Relación |
|---|---|---|---|
| id | text | Sí |  |
| section_id | text | Sí | document_sections |
| activity_id | text | Sí | activities |
| project_id | text | No | projects |
| origin_id | text | No | activity_records |
| weekly_minutes | numeric | Sí |  |
| values | jsonb | Sí |  |

Unicidad: []

## Valor de campo · `field_values`

| Campo | Tipo | Obligatorio | Relación |
|---|---|---|---|
| id | text | Sí |  |
| record_id | text | Sí | activity_records |
| field_id | text | Sí | field_definitions |
| value | jsonb | Sí |  |

Unicidad: [['record_id', 'field_id']]

## Selección múltiple · `selected_options`

| Campo | Tipo | Obligatorio | Relación |
|---|---|---|---|
| id | text | Sí |  |
| value_id | text | Sí | field_values |
| option_id | text | Sí | field_options |

Unicidad: [['value_id', 'option_id']]

## Resultado de curso · `course_results`

| Campo | Tipo | Obligatorio | Relación |
|---|---|---|---|
| id | text | Sí |  |
| document_id | text | Sí | documents |
| assignment_id | text | Sí | teaching_assignments |
| enrolled | integer | Sí |  |
| passed | integer | Sí |  |
| justification | text | No |  |

Unicidad: [['document_id', 'assignment_id']]

## Evidencia · `evidence`

| Campo | Tipo | Obligatorio | Relación |
|---|---|---|---|
| id | text | Sí |  |
| document_id | text | Sí | documents |
| record_id | text | No | activity_records |
| type_id | text | Sí | evidence_types |
| uploaded_by | text | Sí | users |
| filename | text | Sí |  |
| mime | text | Sí |  |
| bytes | integer | Sí |  |
| sha256 | text | Sí |  |
| storage_path | text | Sí |  |
| uploaded_at | timestamptz | Sí |  |

Unicidad: []

## Versión inmutable · `document_versions`

| Campo | Tipo | Obligatorio | Relación |
|---|---|---|---|
| id | text | Sí |  |
| document_id | text | Sí | documents |
| number | integer | Sí |  |
| event | text | Sí |  |
| actor_id | text | Sí | users |
| at | timestamptz | Sí |  |
| content | jsonb | Sí |  |
| digest | text | Sí |  |

Unicidad: [['document_id', 'number']]

## Revisión de versión · `reviews`

| Campo | Tipo | Obligatorio | Relación |
|---|---|---|---|
| id | text | Sí |  |
| document_id | text | Sí | documents |
| version_id | text | Sí | document_versions |
| reviewer_id | text | Sí | users |
| result | text | Sí |  |
| comment | text | Sí |  |
| at | timestamptz | Sí |  |

Unicidad: []

## Sección revisada · `review_visits`

| Campo | Tipo | Obligatorio | Relación |
|---|---|---|---|
| id | text | Sí |  |
| version_id | text | Sí | document_versions |
| reviewer_id | text | Sí | users |
| section_key | text | Sí |  |
| at | timestamptz | Sí |  |

Unicidad: [['version_id', 'reviewer_id', 'section_key']]

## Observación · `observations`

| Campo | Tipo | Obligatorio | Relación |
|---|---|---|---|
| id | text | Sí |  |
| review_id | text | Sí | reviews |
| section_key | text | No |  |
| record_id | text | No | activity_records |
| text | text | Sí |  |
| resolved_at | timestamptz | No |  |

Unicidad: []

## Solicitud idempotente · `idempotency_keys`

| Campo | Tipo | Obligatorio | Relación |
|---|---|---|---|
| id | text | Sí |  |
| actor_id | text | Sí | users |
| request_key | text | Sí |  |
| request_hash | text | Sí |  |
| response | jsonb | Sí |  |
| created_at | timestamptz | Sí |  |

Unicidad: [['actor_id', 'request_key']]

## Indicador registrado · `indicators`

| Campo | Tipo | Obligatorio | Relación |
|---|---|---|---|
| id | text | Sí |  |
| code | text | Sí |  |
| name | text | Sí |  |
| unit | text | Sí |  |
| handler | text | Sí |  |
| confidentiality | text | Sí |  |
| active | boolean | Sí |  |

Unicidad: [['code']]

## Panel · `panels`

| Campo | Tipo | Obligatorio | Relación |
|---|---|---|---|
| id | text | Sí |  |
| owner_id | text | Sí | users |
| name | text | Sí |  |
| scope | text | Sí |  |
| default_panel | boolean | Sí |  |

Unicidad: []

## Indicador en panel · `panel_indicators`

| Campo | Tipo | Obligatorio | Relación |
|---|---|---|---|
| id | text | Sí |  |
| panel_id | text | Sí | panels |
| indicator_id | text | Sí | indicators |
| position | integer | Sí |  |
| filters | jsonb | Sí |  |

Unicidad: [['panel_id', 'indicator_id']]

## Credencial local · `credentials`

| Campo | Tipo | Obligatorio | Relación |
|---|---|---|---|
| id | text | Sí |  |
| user_id | text | Sí | users |
| password_hash | text | Sí |  |
| must_change | boolean | Sí |  |

Unicidad: [['user_id']]

## Sesión · `sessions`

| Campo | Tipo | Obligatorio | Relación |
|---|---|---|---|
| id | text | Sí |  |
| user_id | text | Sí | users |
| token_hash | text | Sí |  |
| created_at | timestamptz | Sí |  |
| expires_at | timestamptz | Sí |  |
| revoked_at | timestamptz | No |  |

Unicidad: [['token_hash']]

## Solicitud de cambio · `change_requests`

| Campo | Tipo | Obligatorio | Relación |
|---|---|---|---|
| id | text | Sí |  |
| requested_by | text | Sí | users |
| authorized_by | text | No | users |
| state | text | Sí |  |
| effective_on | date | No |  |
| content | jsonb | Sí |  |
| created_at | timestamptz | Sí |  |

Unicidad: []

## Configuración del sistema · `system_settings`

| Campo | Tipo | Obligatorio | Relación |
|---|---|---|---|
| id | text | Sí |  |
| revision | integer | Sí |  |
| content | jsonb | Sí |  |

Unicidad: []
