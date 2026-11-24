# SIGD · Diagrama de clases general (V4) — especificación del diagrama

**Qué es:** la lista consolidada de lo que cambia, clase por clase, en el diagrama general nuevo. Junta tres capas: el V2 (`SIGD_Diagrama_general_2_1.pdf`), las decisiones V3 del 20/11 (`SIGD_Decisiones_diagrama_general_V3.md`, citadas como V3-n) y los cambios V4 del 21/11 (`cambios_diagrama_general_V4.md`, citados como V4-nn). Donde la V4 revierte algo de la V3, aquí manda la V4.
**Dibujo:** generado el 21/11/2026 como `SIGD_Diagrama_clases_general_V4` (PDF y SVG, entregados en la conversación). Se dibujó a partir de esta especificación; ver la sección 6.
**Notación:** UML estricto, tres compartimentos, visibilidad `+ - # ~`, multiplicidad en los extremos de las asociaciones, sin colores ni adornos (preferencia fija). Los atributos y operaciones de las clases nuevas son propuesta derivada de las fuentes citadas; cada empresa los afina en su diagrama interno.
**Fuentes:** Minuta = MIN171126EA; T = transcripción 171126EA; LOGIN = `MODELO_LOGIN.docx`; DM = Documento maestro v2.

## 1. Conteo (verificado en el dibujo)
- V2: 57 clases + 3 interfaces.
- Se quitan `UbicacionCarrera`, `ExportadorExcel` y las tres `FuenteModulo*` de Reportes (−5).
- Se agregan: `Credencial`, `HistorialNumeroEmpleado`, `AsignacionCategoria`, `LicenciaProfesor`, `SolicitudCambio` (V3, +5); `TokenSeguridad`, `RegistroAcceso`, `ParametroSistema`, `CicloEscolar` (V4, +4); `FuenteRepositorio` (+1, reemplaza a las tres `FuenteModulo*`); 8 clases de Vista y Controlador (+8).
- Interfaces: `Exportable`, `Exportador`, `FuenteDatos` y las 7 de Repositorio (10).
- **Resultado: 70 clases + 10 interfaces = 80 elementos, en 11 paquetes.**

## 2. Enumeraciones nuevas o modificadas
| Enumeración | Valores | Fuente |
|---|---|---|
| `EstadoUsuario` | pendiente, activo, suspendido (configurables) | Minuta §5; LOGIN §3; V4-17 |
| `TipoToken` | activación, recuperación, OTP | LOGIN §3, §5; V4-19 |
| `AccionAcceso` | login exitoso, login fallido, activación, cambio de clave, cierre de sesión | LOGIN §5; V4-20 |
| `EstadoCarrera` | activa, en transición, reemplazada, cerrada | V3-21 |
| `AccionBitacora` | se agregan CONSULTAR y EXPORTAR para autoridades y secretarias | V3-12 |
| Valores sin fuente todavía | `Nivel`, `TipoResultado`, `Comparativo`, `TipoNotificacion`, `EstadoValidacion`, `ModalidadCambio`, `EstadoSolicitud`, `ResultadoCumplimiento` (V3-A3 da cumplida, parcial, no realizada, pendiente), `OrigenRegistro` (V3-1) | V3 §7 |

## 3. Cambios por paquete
Marca: **(nueva)**, **+** agrega, **−** quita, **~** modifica.

### 3.1 Administración · Usuarios y seguridad (Nexora)
| Clase | Cambio | Ref |
|---|---|---|
| `Usuario` | ~ `idUsuario : int`; ~ `correoInstitucional` obligatorio y único; ~ `estado : EstadoUsuario` (se agrega pendiente); `numeroEmpleado : string {unique}` se queda como dato con historial | V4-01, 17, 22 |
| `Usuario` | + composición con `Credencial` (1 a 1), `HistorialNumeroEmpleado` (1 a 0..*) y `TokenSeguridad` (1 a 0..*); asociación con `AsignacionCategoria` (1 a 0..*) y `RegistroAcceso` (0..1 a 0..*) | V3-14, 19; V4-19, 20 |
| `Credencial` (nueva) | `idCredencial : int`, `hashClave : string [0..1]` (vacío mientras la cuenta está pendiente), `ultimoCambio : datetime`, `intentosFallidos : int`, `bloqueadoHasta : datetime [0..1]`. Operaciones: `verificar`, `cambiarClave`, `registrarIntentoFallido`, `reiniciarIntentos`, `estaBloqueada` | V3-14; V4-18 |
| `TokenSeguridad` (nueva) | `idToken : int`, `tipo : TipoToken`, `hashToken : string`, `expiraEn : datetime`, `usadoEn : datetime [0..1]`, `intentos : int`. Operaciones: `generar`, `validar`, `marcarUsado`, `estaVigente`. Longitud y vigencia del código vienen de `ParametroSistema` | V4-19; Minuta §5; T |
| `RegistroAcceso` (nueva) | `idRegistro : int`, `correoIntentado`, `accion : AccionAcceso`, `ipOrigen`, `agenteUsuario`, `fechaHora`. Relación con `Usuario` 0..1 a 0..* (nulo cuando el correo no existe). Operación `registrar` | V4-20 |
| `Sesion` | + `ultimaActividad : datetime`, + `valorSesion : string` (hash del valor aleatorio de la cookie); + `renovar() : void` | V4-21 |
| `Rol`, `Permiso`, `RolPermiso` | Sin cambios de atributos. `AsignacionRol.asignar` usa `idUsuario : int` | V4-01 |
| `AsignacionRol` | Sin otros cambios. El jefe de carrera es una asignación con alcance de carrera; en una carrera en transición puede no existir | V4-04 |
| `Docente`, `AdscripcionDocente` | `Docente.registrar(idUsuario : int)`. Una sola adscripción vigente (`fechaFin` vacía) con historial | V4-01, 03 |
| `LicenciaProfesor` (nueva) | `idLicencia`, `tipo`, `fechaInicio`, `fechaFin [0..1]`, `observaciones [0..1]`; `Docente` ◆ 1 a 0..* | V3-15 |
| `CategoriaDocente` | ~ `idCategoria : int`; el `nivel` pasa a ser fila de catálogo configurable (Asociado A, B, C; Titular A, B, C) | V4-01, 08 |
| `AsignacionCategoria` (nueva) | `idAsignacionCategoria`, `fechaInicio`, `fechaFin [0..1]`; `Usuario` 1 a 0..*, `CategoriaDocente` 1 a 0..*. Se quita «clasifica» entre `Docente` y `CategoriaDocente` | V3-19 |
| `GradoEstudio` | − `certificadoEntregado`, − `cedulaEntregada`; ~ `cedulaProfesional : string` obligatoria | V4-09 |
| `Distincion` | + `estadoValidacion`, `fechaValidacion [0..1]`, relación «validada por» con `AsignacionRol` (0..*, 0..1) | V3-20 |
| `HistorialNumeroEmpleado` (nueva) | `idHistorial`, `numeroAnterior`, `numeroNuevo`, `fechaCambio` | V3-14 |

### 3.2 Administración · Estructura académica (Nexora)
| Clase | Cambio | Ref |
|---|---|---|
| `UbicacionCarrera` | **Se elimina** junto con sus asociaciones con `Campus` y `Carrera` | V4-02 |
| `Carrera` | + asociación «pertenece a» con `Campus` (* a 1); + `fechaFin : date [0..1]`; ~ `estado : EstadoCarrera`; se conserva «sucede a» (0..1 a 0..*) | V4-02, 04; V3-21 |
| `PlanEstudio` | + `fechaInicioVigencia`, `fechaFinVigencia [0..1]`; + `esVigente(fecha)`. `Carrera` 1 a 1..* `PlanEstudio` | V4-05, 06 |
| `Grupo` | + `semestre : int`; asociación con `Carrera` (* a 0..1, vacía en grupos transversales como Inglés); `clave` única por periodo y campus. **Se quita la liga «cursa» con `SemestrePlan`**: el plan y el semestre del plan se calculan con carrera, semestre y fecha | V4-05, 07; V3-18 |
| `SemestrePlan`, `AsignaturaPlan`, `Materia`, `Universidad`, `Campus` | Sin cambios | — |
| `AsignacionMateria` | ~ `horasSemana : decimal` (medias horas); `alumnosInscritos` lo captura Administración | V4-11; V3-22 |

### 3.3 Administración · Catálogo, periodos y configuración (Nexora)
| Clase | Cambio | Ref |
|---|---|---|
| `CicloEscolar` (nueva) | `idCiclo : int`, `nombre : string` (A, B, verano: configurables), `limiteHorasSemanaMateria : decimal` (10 en verano). `PeriodoAcademico` * a 1 `CicloEscolar`. Sus valores siguen sin fuente | V4-12; DM §6 |
| `PeriodoAcademico` | + `capacidadHorasBase : decimal` (valor inicial 640, por revisar); + `puedeAbrirse()`, `condicionesFaltantes()`, `permiteEdicion()` (falso con el periodo cerrado); se conserva `semanasEfectivas` | V3-5, 24; V4-13 |
| `PeriodoCaptura` | `abrir()` exige `puedeAbrirse()` | V3-24 |
| `ConfiguracionActividad` | + `horasMinimas : decimal`, `horasMaximas : decimal`. No se agregan `tipoCalculo` ni `parametroCalculo` (V3, decisión 4 revertida). Se conservan `horasAsignadas` y `peso` (por confirmar con The Seven) | V4-10, 11 |
| `RubroAcademico`, `ActividadAcademica`, `ClasificacionActividad`, `ConfiguracionRubro` (clase de asociación entre `PeriodoAcademico` y `RubroAcademico`), `DefinicionCampo`, `OpcionCampo`, `TipoEvidencia` | Sin cambios; `estado : string` pasa a enumeración propia | V3-21 |
| `CatalogoVersion` | Sin cambios de atributos; `publicar()` se ejecuta con cada cambio al catálogo (V3-7, A4) | V3 |
| `ParametroSistema` (nueva) | `idParametro : int`, `clave : string {unique}`, `valor : string`, `descripcion : string`, `modificadoEn : datetime`. Operaciones: `obtener(clave)`, `actualizar(clave, valor)` (registra en `Bitacora`). Claves iniciales propuestas: longitud mínima de contraseña (8, DM §5), máximo de intentos (5), minutos de bloqueo (15), longitud del código (5, T, dicho en condicional), vigencia del código (sin fuente), inactividad de sesión (30), dominios de correo permitidos, tope de horas semanales (40, T). Los valores sin fuente del cliente son propuesta nuestra | Hoy; V4-18, 19, 21, 22, 26 |

### 3.4 Auditoría y notificaciones · común (Nexora)
| Clase | Cambio | Ref |
|---|---|---|
| `Bitacora` | Pasa a este paquete; + relación con `SolicitudCambio`; `AccionBitacora` + CONSULTAR, EXPORTAR. Los accesos de login no van aquí: van en `RegistroAcceso` | V3-11, 12, 13; V4-20 |
| `Notificacion` | Pasa a este paquete; + `tipo : TipoNotificacion`, `entidadRelacionada [0..1]`, `idRegistroRelacionado [0..1]` | V3-13, 16 |
| `SolicitudCambio` (nueva) | Atributos y relaciones según V3-11 (solicita, atiende y valida con `AsignacionRol`; origina `Bitacora`) | V3-11 |

### 3.5 Documento docente · común (Nexora)
| Clase | Cambio | Ref |
|---|---|---|
| `DocumentoDocente` | + `version : int`, `versionEnviada : int [0..1]`; + `migrarCatalogo(nuevo)`; «elaborado con» `AdscripcionDocente` y `AsignacionCategoria`; `puedeEditarse()` también es falso si el periodo está cerrado | V3-8, 10, A4; V4-13 |
| `RegistroActividad` | − `idOrigen`; + `resultado`, `origen`, `observacionCumplimiento [0..1]`; autoasociación «cumple a» (0..1 a 0..1) | V3-1, A3 |
| `ValorCampo` | + `tipoReferencia [0..1]`, `idReferencia [0..1]` | V3-6 |
| `CursoImpartido` (en Informe) | Pasa a ser detalle de un `RegistroActividad` (1 a 0..1); conserva «reporta resultados de» `AsignacionMateria` | V3-3 |
| `Proyecto` | + relación con `Docente` (responsable) | V3-23 |
| `SeccionDocumento`, `Revision`, `Observacion`, `Evidencia`, `CatalogoSnapshot` | Sin cambios de atributos | V3 |

### 3.6 Plan de Trabajo · The Seven
| Clase | Cambio | Ref |
|---|---|---|
| `PlanDeTrabajo` | Se quitan `aprobar`, `devolver`, `observaciones`, `version`, `versionEnviada` y `migrarCatalogo` (suben a `DocumentoDocente` o a `Revision`); + `calcularHoras() : decimal` (el cálculo es de Plan). `enviar(claveIdempotencia)` y `revision` siguen por confirmar con The Seven | V4-10, 11; V3-4, 8, 9 |

### 3.7 Informe de Actividades · NextCode
| Clase | Cambio | Ref |
|---|---|---|
| `InformeActividad` | − `seccionActual`, `irASeccion()`, `descargar()` (pasan a Vista y Controlador); + `puedeCapturarse() : boolean` (exige plan aprobado) | V3-A2; V4-14, 23 |

### 3.8 Exportación · común (Nexora)
| Clase | Cambio | Ref |
|---|---|---|
| `ExportadorExcel` | **Se elimina** | V4-24 |
| `Exportable`, `Exportador`, `ExportadorPDF`, `ServicioExportacion` | Se conservan. Solo hay PDF individual por docente; el contrato queda abierto a otros formatos. Sin dependencias «solicita exportación» desde `DocumentoDocente` ni `Panel`; el controlador de cada módulo usa `ServicioExportacion` | Minuta §4, §5; V4-24 |

### 3.9 Reportes · Axion (propuestas a acordar con Axion)
| Clase | Cambio | Ref |
|---|---|---|
| `FuenteModuloPlanTrabajo`, `FuenteModuloInforme`, `FuenteModuloAdministracion` | Se quitan. Las reemplaza una clase `FuenteRepositorio`, que realiza `FuenteDatos` y lee a través de las interfaces de Repositorio (propuesta mía para representar a los «adaptadores» de la V3; Axion decide si son uno o varios). Se conserva `FuenteBDInstitucional` | V3 §3.5 |
| `ConsultaRegistrada`, `FuenteDatos` | Se quita `vistaSQL`; `leer(consulta : ConsultaDefinida, parametros : Map) : Tabla` | V3-A2 |
| `Panel` | + propietario (`Usuario`, * a 0..1); + visibilidad por rol (`Rol`, * a *), para decidir qué se muestra y qué se oculta según el rol; se conserva `ambito` | V3-26; V4-25; T |
| `Indicador`, `MotorIndicadores` | Indicadores mínimos (cumplió o no el plan, semáforo, comparación) y diseño modular para agregar indicadores sin reescribir código base | V4-25; T; Minuta §5 |

### 3.10 Repositorio (V3-A1, ajustado)
Siete interfaces, una por agregado, con las firmas de V3 §4 más:
- `IdentidadRepo`: agrega `TokenSeguridad` y `HistorialNumeroEmpleado`; firmas `guardarToken(t)`, `obtenerTokenVigente(idUsuario : int, tipo : TipoToken)`.
- `AuditoriaRepo`: agrega `RegistroAcceso`; firma `registrarAcceso(a)`.
- `PeriodoRepo`: agrega `CicloEscolar` y `ParametroSistema`; firma `obtenerParametro(clave : string)`.
- `EstructuraAcademicaRepo`: `planVigente(idCarrera : int, fecha : date)` (el plan se deduce por fecha).
- **En el dibujo**, la dependencia de cada Controlador (y de `FuenteRepositorio`) hacia el Repositorio se dibuja contra el paquete completo y no contra cada interfaz, para no llenar el diagrama de líneas. La tabla de qué módulo lee y escribe cada interfaz está en V3 §4.

### 3.11 Vista y Controlador (V4-23, propuesta mínima)
Una clase `«vista»` y una `«controlador»` por módulo (8 clases). La Vista depende del Controlador; el Controlador usa el Repositorio (dependencia) y una clase principal del Modelo (asociación navegable: `Usuario`, `PlanDeTrabajo`, `InformeActividad`, `Panel`). Los nombres y las operaciones son propuesta; cada empresa detalla las suyas.
| Clase | Operaciones propuestas | Origen |
|---|---|---|
| `VistaAdministracion` | `mostrarPantalla(nombre)`, `mostrarError(mensaje)` | Minuta §5 |
| `ControladorAdministracion` | `iniciarSesion(correo, clave)`, `activarCuenta(correo, codigo, claveNueva)`, `guardarUsuario(datos)`, `abrirPeriodoCaptura(idPeriodo, tipo)` | Minuta §5; V4-19 |
| `VistaPlan`, `ControladorPlan` | `enviarPlan(idDocumento, claveIdempotencia)`, `exportarPDF(idDocumento)` | V3 §3.2; V4-24 |
| `VistaInforme`, `ControladorInforme` | La vista lleva `seccionActual : char`; el controlador `irASeccion(letra)` y `exportarPDF(idDocumento)` | V3-A2 |
| `VistaReportes`, `ControladorReportes` | `mostrarTablero(idPanel)`, `consultar(filtros)`, `exportarPDF(idPanel)`; `MotorIndicadores` sigue siendo el cálculo | T; V3 §3.5 |

## 4. Relaciones: resumen de lo que se agrega, cambia y quita
| Acción | Relación | Multiplicidad |
|---|---|---|
| Agrega | `Usuario` ◆ `Credencial`, `TokenSeguridad` | 1 a 1; 1 a 0..* |
| Agrega | `Usuario` — `RegistroAcceso` | 0..1 a 0..* |
| Agrega | `Carrera` — `Campus` («pertenece a») | * a 1 |
| Agrega | `PeriodoAcademico` — `CicloEscolar` | * a 1 |
| Agrega | `Panel` — `Rol` («visible para») y `Panel` — `Usuario` («propietario») | * a *; * a 0..1 |
| Cambia | `Carrera` — `PlanEstudio` | 1 a 1..* |
| Cambia | `Grupo` — `Carrera` | * a 0..1 |
| Quita | `UbicacionCarrera` y sus dos asociaciones | — |
| Quita | `Grupo` — `SemestrePlan` («cursa») | — |
| Quita | dependencias «solicita exportación» desde `DocumentoDocente` y `Panel` | — |

## 5. Por revisar
- Confirmar en el V2 si ya existía la asociación `Grupo` — `Carrera` (en el dibujo V4 está con multiplicidad * a 0..1).
- Si `horasAsignadas` y `peso` de `ConfiguracionActividad` siguen vigentes con el cálculo en Plan (The Seven).
- Valores de `CicloEscolar`, `Nivel`, `TipoResultado`, `Comparativo` y `TipoNotificacion`.
- El DM §6 dice que el verano no lleva plan ni informe; la transcripción habla de horas de verano en el plan.
- Si Axion acepta `FuenteRepositorio` en lugar de las tres fuentes por módulo.

## 6. Cómo se dibujó
- Se partió de los atributos y operaciones reales de las 60 clases del V2 (extraídos del PDF) y se aplicaron estos cambios.
- 11 paquetes: Administración (Usuarios y seguridad; Estructura académica; Catálogo, periodos y configuración; Vista y Controlador), Auditoría y notificaciones, Documento docente, Exportación, Plan, Informe, Reportes y Repositorio.
- Es un diagrama nuevo, no el V2 retocado: las clases están acomodadas por paquete y las líneas se trazaron de forma automática con ángulos rectos. Por eso hay líneas largas entre paquetes (por ejemplo, las de `Usuario` hacia `Bitacora` y `Notificacion`) y algunas etiquetas de relación quedan encima de otras líneas.
- Las enumeraciones no se dibujan (igual que en el V2).
