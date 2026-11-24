# Documento maestro del proyecto: Sistema de Plan de Trabajo e Informe de Actividades

Fuente: transcripciones de reuniones (01, 03, 04, 08 y 22 de junio de 2026), entrevista con el cliente (PDF) y los formatos Excel de Plan 2025-2026 A e Informe 2022-2023 B.
Equipo del usuario: empresa **Nexora Technologies**, responsable del **módulo de Administración del sistema**.

---

## 1. Contexto y objetivo

- Cliente: una universidad pública (los formatos son de la Universidad del Istmo, UNISTMO), con **3 campus**: Tehuantepec, Juchitán e Ixtepec.
- Problema actual: cada ciclo escolar (2 por año) los profesores llenan a mano en **Excel** un *Plan de Trabajo* (al inicio) y un *Informe de Actividades* (al final). La jefatura de carrera los valida, y se archivan en la nube y en papel (expediente físico).
- Consecuencias: no se pueden sacar reportes por profesor o carrera (p. ej. cuántas publicaciones se planearon o se lograron), el plan y el informe **nunca se contrastan**, y la información se pide por correo y casi nadie contesta hasta que llega una orden de Vicerrectoría.
- Objetivo: reemplazar los Excel por un **sistema web con una sola base de datos**, que permita capturar, validar, consultar y comparar Plan vs. Informe, y generar reportes (por profesor, por carrera, histórico de cumplimiento). También sirve para categorización/promoción de profesores, auditorías y solicitudes de transparencia.
- Escala: aproximadamente 150–160 profesores, 16 carreras, 20 planes de estudio.

## 2. Fases y fechas (según el Sr. J)

| Etapa | Alcance | Fechas dichas |
|---|---|---|
| Etapa 1 | Plan de Administración del Proyecto (PAP), Especificación de Requerimientos de Software (SRS), prototipo tipo maqueta (sin base de datos real), modelado | PAP: 8 de junio. SRS primera versión y revisión: 15 de junio. Prototipos, interfaces y modelado: 29–30 de junio |
| Etapa 2 | Implementación (materializar lo documentado) | Sin fecha en las transcripciones |

- Metodología: **Proceso Unificado de desarrollo de software**. Seguimiento en **Trello** con columnas *Por hacer / En proceso / Terminado*. Cada tarea lleva fecha límite y se actualiza en tiempo real.
- Documentos obligatorios: PAP, SRS, diagrama de casos de uso, fichas de casos de uso, diagrama de clases, minutas firmadas (con ID por minuta: A, B, C si hay varias en un día), constitución de empresa, roles y reglamento de trabajo. Todo se guarda en la nube con enlace en Trello.
- Los cambios de requisitos tras la firma del cliente se tratan como **cambio extra** (con costo adicional si obligan a rehacer la estructura).
- Hay un esquema de dos entregas con revisión de nómina, bonificaciones y penalizaciones (mencionado en la reunión 2).

> Nota: las fechas anteriores ya pasaron (revisado el 16 de noviembre de 2026). Falta confirmar en qué etapa del proyecto (1 o 2) está el equipo. El prototipo del módulo de Administración sigue sin base de datos real y se está reorganizando internamente; ver la sección 9.

## 3. Los cuatro módulos y las empresas

| Módulo | Empresa |
|---|---|
| Plan de Trabajo | Next Code se postuló; en la reunión 2 había una vacante y dos postulantes (la otra empresa aparece en la transcripción como "The seven"). La decisión quedó pendiente |
| Informe de Actividades | En la reunión 2 nadie se había postulado; sin confirmar |
| Generación de reportes (Plan vs. Informe, por profesor y carrera) | Axion Software |
| **Administración del sistema** (catálogos, pesos, usuarios, bitácora) | **Nexora Technologies** |

Reglas comunes que pidió el Sr. J:
- Una **sola base de datos** compartida y un solo modelo entidad-relación integrado (cada empresa define sus tablas).
- **Interfaz homogénea** entre módulos: misma paleta, botones, menús y barras. Que no parezca un "Frankenstein".
- Los módulos no deben bloquearse entre sí: acordar el formato de entrada/salida de datos y trabajar con datos ficticios.
- La clave que une todo es el **número de nómina / número de empleado** del profesor (único e irrepetible).

## 4. Qué administra el módulo de Administración (nuestro módulo)

1. Usuarios y roles (con historial completo de cambios de rol).
2. Catálogos: campus, carreras, planes de estudio y materias, categorías docentes, rubros/secciones y sus actividades, comisiones, comités, programas, etc.
3. Pesos y configuraciones (p. ej. horas asignadas a tutorías por tutorado).
4. Vigencia de cambios (aplicar ahora o programar para el siguiente ciclo).
5. Periodos de captura (abrir/cerrar plan e informe) y bloqueo mientras se actualiza el sistema.
6. Bitácora de auditoría.
7. Sugerencias/solicitudes de cambio de autoridades (Vicerrectoría y Rectoría).

Pantallas del prototipo de Nexora (versión actual): **Inicio** (panel con indicadores y pendientes), **Solicitudes de cambio** (registro, instrucción de la autoridad, vigencia y aplicación), **Catálogos académicos** (campus, carreras, planes, materias, categorías, rubros, comisiones, parámetros, opciones de captura), **Usuarios y permisos** (con historial de roles, adscripción y carrera), **Periodos de captura** y **Bitácora de auditoría**. En las transcripciones se numeraban (1) usuarios y roles, (2) catálogos y vigencia de cambios, (6) bitácora y (7) periodos. **La bitácora y los periodos aún no se han validado con el cliente**; el Sr. C ofreció responder por correo.

## 5. Roles y permisos

| Rol | Puede | No puede |
|---|---|---|
| Profesor | Llenar su propio Plan e Informe; ver solo lo suyo | Ver a otros profesores; sugerir cambios al sistema (no contemplado, para evitar abusos en las horas reportadas) |
| Jefe de carrera | Validar Plan e Informe de sus profesores; ver todo lo de su carrera; llenar su propio plan | Modificar catálogos |
| Vicerrectoría | Consultar todo, de todos los campus, incluida la bitácora del administrador; enviar **sugerencias o indicaciones** de cambio (con texto explícito "sugiero" o "hágase") | Modificar catálogos o pesos directamente |
| Rectoría | Mismos permisos que Vicerrectoría (pueden ser usuarios separados) | Igual que arriba |
| Secretaria(o) de Vicerrectoría/Rectoría | Consultar, como usuario **distinto** para saber quién vio qué (planteado por el Sr. C) | Modificar |
| Representante de distinciones (el Sr. C lo llamó «representante institucional»; nombre por confirmar) | Modificar **únicamente** SNI y Perfil Deseable en "Distinciones" (valida si es verdad lo que el profesor declaró) | Todo lo demás |
| Administrador (**solo uno**, según el Sr. C) | Único que modifica catálogos, pesos, usuarios y vigencias | Actuar sin dejar registro en la bitácora |

**Estados de la cuenta** (decisión del equipo, 21-nov-2026; «pendiente» y «suspendido» salen de la minuta del 17-nov y del modelo de login; validar con el cliente):
- **pendiente:** la cuenta existe pero aún no activa su contraseña;
- **activo:** es el único estado que puede iniciar sesión;
- **suspendido:** bloqueo temporal y reversible (licencia, sanción o demasiados intentos fallidos);
- **inactivo:** baja definitiva (la persona ya no labora).

En ningún estado se borra el historial.

Reglas sobre cambio de rol:
- Una persona puede tener **varios roles a la vez**, cada uno con fecha de inicio y de fin (por ejemplo, Profesor y Jefe de carrera de su carrera). El historial de roles son los roles que ya terminaron.
- El número de empleado **no cambia** y no se crea otro registro: cambia el rol/estatus y se conserva **todo el historial**.
- Trayectorias típicas: profesor → jefe de carrera → vicerrector → rector, y también el regreso a profesor. Al volver a profesor, pierde los permisos de validar/ver a otros y solo llena su propio plan.
- En Vicerrectoría y Rectoría los cambios de persona pueden ser muy rápidos (hasta una semana), por eso se guarda todo el historial.
- Contraseña segura: mínimo 8 caracteres, con mayúscula, minúscula, número y carácter especial; validar que no se acepten contraseñas como 1234567.

## 6. Reglas de negocio importantes

**Autoridad y trazabilidad**
- Vicerrectoría/Rectoría dan la indicación; el administrador la ejecuta. Hoy no hay asignación formal ni oficio para el administrador (lo hacen 2 personas "de palabra"); la nueva administración quiere formalizarlo.
- **Bitácora:** registrar quién hizo el cambio (credenciales), qué campo, cómo estaba, cómo quedó, fecha y hora, **cuándo llegó la indicación y de quién**, cuándo se atendió y si Vicerrectoría la validó después. Sirve también para evaluar el desempeño del administrador. Vicerrectoría puede ver esta bitácora. Referencia dada: línea base de configuración inicial.

**Accesos (indicador de Inicio)** · definido por el equipo Nexora el 19 de noviembre de 2026; pendiente de validar con el cliente (sección 8, punto 16)
- «Accesos hoy» cuenta **cada inicio de sesión correcto** del día, de todas las cuentas: si la misma cuenta entra 3 veces, suma 3.
- El día se toma en **hora local** (centro de México), no en hora universal.
- Los intentos fallidos no cuentan. Los accesos **no** se registran en la bitácora, que es para cambios.
- Se guarda **un registro por cada intento** de acceso: correo, acción (acceso correcto, acceso fallido, activación, cambio de contraseña, cierre de sesión), origen y fecha y hora. «Accesos hoy» cuenta los accesos correctos del día. Así los intentos fallidos sirven para bloquear la cuenta, sin contarse en el indicador. (Cambio del 21-nov-2026, decisión D7; antes era un registro por cuenta y por día.)
- **Limitación del prototipo:** los datos viven en el navegador, así que cada equipo cuenta solo sus propios accesos. En el sistema real, el servidor registrará el acceso al validar la contraseña.

**Vigencia de cambios**
- Debe poder decidirse en cada cambio: **aplicar ya** o **programar para el siguiente ciclo**, y el sistema notifica al administrador al abrir el ciclo ("entran estos cambios" o "no hay cambios").
- Según el Sr. C, lo común es "inmediato"; los cambios de **pesos** pueden ser inmediatos, pero agregar o quitar una **sección** es más delicado (genera caos a los profesores).
- Se permite aplicar cambios inmediatos aunque ya haya planes o informes capturados o enviados (en la práctica se pide rehacerlos). Es lo que se hace hoy, aunque el Sr. C reconoce que no es lo ideal.

**Apertura de ciclo**
- Antes de abrir: debe estar dada de alta la plantilla de profesores (sin eso no pueden capturar), definidos los rubros del semestre y las actividades de cada rubro.
- Mientras se configura, el acceso a captura se bloquea con un aviso de mantenimiento; se puede ver lo anterior. Debe poder definirse un periodo de captura para el Plan y otro para el Informe. Idealmente el Informe se abre desde que inicia el semestre para registrar actividades no planeadas.

**Campus, carreras y profesores**
- Relación: campus → carrera (sin departamento académico). Una carrera puede cambiar de campus.
- Campus y carreras se pueden dar de alta, baja y renombrar. Carreras en transición o reemplazadas se **conservan para consulta histórica** y se enlazan con la carrera que las sustituye para trasladar la adscripción de los profesores de forma automática.
- Los profesores cambian de adscripción con frecuencia.
- Los datos oficiales de las carreras (clave, nombre oficial, número de semestres, materias por semestre, créditos) salen del **plan de estudios**. Las materias del Plan/Informe deben **seleccionarse** (carrera → grupo → materias del semestre), no escribirse, y no se debe poder elegir planes no vigentes. Un profesor puede dar materias en otra carrera.
- Grado de estudios: **texto libre** (no catálogo), porque cada profesor lo escribe a su manera.
- Categorías: Asociado A/B/C y Titular A/B/C. Recientemente se agregaron "profesor asociado/titular" (sin "investigador") y "profesor visitante". Debe poder agregar y **eliminar** categorías.
- Todo debe ser configurable, incluso el nombre de la universidad. Se mencionó que no existe un departamento de vinculación (hoy es una comisión) y que conviene poder crearlo.

**Rubros**
- Rubros reconocidos: docencia, investigación, formación de recursos humanos, promoción del desarrollo, difusión de la cultura, gestión (más tutorías, vinculación, distinciones y superación académica, según el formato). Docencia e investigación son obligatorias; la investigación es la que más se pide.
- Los rubros pueden cambiar de nombre, agregarse o quitarse. Algunas actividades se han movido de rubro (p. ej. cursos a niños de primaria: antes docencia, ahora promoción del desarrollo).
- Plan e Informe **no coinciden hoy**; hay que analizar qué empata, homogeneizar y definir con qué se llena cada uno.
- Un incumplimiento puede quedar **pendiente para el siguiente semestre** (ejemplo: la revista pospone la publicación). El informe incluye evidencias; el contraste Plan vs. Informe marca cumplió / no cumplió por rubro, con observación.

**Interfaz (comentarios del Sr. C)**
- La mayoría de los profesores tiene más de 40 años: preferir **modo claro con paleta pastel** y buen contraste, evitando tonos oscuros.
- En el prototipo, el botón seleccionado (campus-carreras vs. categorías) generaba confusión visual: el estado activo debe ser claro.

## 7. Formatos Excel (resumen)

**Plan de Trabajo 2025-2026 A** (hoja "Hoja de Planeación" + hoja "Datos" con catálogos): encabezado con campus, profesor, categoría, carrera de adscripción y # de nómina. Secciones: A Docencia, B Formación de recursos humanos (dirección de tesis y de protocolo, revisor, asesor de estancia, asesor de servicio social), C Tutorías, D Vinculación, E Difusión de la cultura, F Gestión (comisiones, comités, coordinación de programa, otras), G Distinciones, H Promoción del desarrollo, I Superación académica, J Investigación (proyectos en desarrollo, por presentar, publicaciones, foros). Cada renglón lleva **horas**, con total de horas y **tiempo libre de 640** (capacidad base del semestre).

**Informe 2022-2023 B**: Docencia, Investigación (proyectos, artículos con indexación/arbitraje/ISSN, memorias, ponencias, carteles, libros, otros), Dirección de tesis, Tutorías, Vinculación, Difusión de la cultura, Gestión, Distinciones (SNI, Perfil Deseable, becas), Promoción al desarrollo. Marca "S/A" (sin actividad), pide **documentos probatorios** y firma del profesor y del jefe de carrera. No maneja horas ni tiene la sección de Superación académica.

**Catálogos que ya vienen en la hoja "Datos"** (sirven para sembrar la base de datos):
- Campus: Tehuantepec, Ixtepec, Juchitán.
- Carreras Tehuantepec: Ing. en Computación, Ing. Química, Ing. Industrial, Ing. de Petróleos, Ing. en Energías Renovables, Ing. en Diseño, Lic. Matemáticas Aplicadas, Posgrado.
- Carreras Ixtepec: Lic. Administración Pública, Lic. Ciencias Empresariales, Lic. en Informática, Lic. en Derecho.
- Carreras Juchitán: Lic. en Nutrición, Lic. en Enfermería.
- Categorías: Asociado A/B/C, Titular A/B/C. Tipo de curso: presencial, virtual, híbrido. Tipo de dirección: director, co-director. Y listas de comisiones, comités, programas, tipos de proyecto, publicaciones, foros, vinculación, difusión, distinciones, promoción y superación académica (ver el archivo del Plan).

## 8. Contradicciones y pendientes por aclarar

1. **Vigencia de cambios:** el Sr. J pide poder elegir "ahora o siguiente ciclo"; el Sr. C dice que casi siempre es inmediato pero le gusta poder programar. Se resuelve con ambas opciones.
2. **Roles:** el Sr. J lista 5 (administrador, profesor, jefe de carrera, Vicerrectoría, Rectoría). El Sr. C agrega secretarias de VR/Rectoría y un **representante institucional** (SNI/Perfil Deseable). Confirmar si se incorporan formalmente. El equipo propone llamarlo «Representante de distinciones» (D12); confirmar también el nombre.
3. **Administrador único:** el Sr. C dice uno solo; falta definir cómo se cubre su ausencia o suplencia.
4. **Número de profesores:** ~150 (Sr. C) vs. ~160 (mismo Sr. C, otro momento).
5. **Quién es quién:** las transcripciones usan "Sr. J" (docente/patrocinador que dirige las reuniones y también aparece como cliente en la entrevista en PDF) y "Sr. C" (cliente entrevistado el 8 y 22 de junio). Confirmar sus roles reales.
6. Pendiente validar pantallas de **bitácora de auditoría** y **periodos de captura** con el cliente.
7. Pendiente definir contratos de datos con los otros tres equipos (Plan, Informe, Reportes).
8. Pendiente confirmar qué empresa quedó con Plan de Trabajo e Informe de Actividades, y en qué etapa está hoy el proyecto.
9. **Categorías docentes del prototipo.** ~~La semilla del prototipo usa «Profesor investigador» y «Profesor», marcadas como «denominación por validar». Este documento (secciones 6 y 7) indica Asociado A/B/C y Titular A/B/C, y menciona «profesor asociado/titular» y «profesor visitante». Confirmar la lista oficial y alinear la semilla con la hoja «Datos» del Plan.~~ **Resuelto el 21 de noviembre de 2026 (D4):** la lista oficial es la de las secciones 6 y 7 (Asociado A/B/C, Titular A/B/C, profesor asociado/titular, profesor visitante), como catálogo configurable. La categoría de cada profesor guarda historial con fechas. El prototipo se alinea después.
10. **Umbral de reprobación del 35 %.** El prototipo trae el parámetro «Umbral de reprobación para justificar». Un texto lo atribuye a «las reuniones» y otro a una «entrevista institucional». **Este documento no lo menciona.** Confirmar de qué reunión o entrevista sale, y agregarlo a la sección 6 o quitarlo.
11. **Administrador único y suplencia** (complementa el punto 3). El prototipo ya obliga a que exista exactamente **una** cuenta de administración general activa: no deja activar una segunda ni desactivar la única. Si se define una suplencia, hará falta una regla nueva (p. ej. un suplente temporal con fecha de fin).
12. **Búsqueda en Solicitudes.** Buscar «Rectoría» también encuentra las solicitudes de «Vicerrectoría», porque la búsqueda compara pedazos de texto. Decidir si debe distinguir ambas autoridades.
13. **Historial de relación en Catálogos.** El diálogo de campus y de categorías docentes muestra «Historial de relación académica · 0 movimientos», aunque esos tipos no se relacionan con otro catálogo. Decidir si se oculta en esos tipos.
14. **Buscador global.** ~~El prototipo tiene el código de un buscador rápido, pero ningún control de la interfaz lo abre.~~ **Resuelto el 21 de noviembre de 2026:** se retiró, conforme al acuerdo «sin buscador global». Nada se ve distinto, porque nunca se abría (PR #69).
15. **Reglas distintas para la adscripción al importar.** La importación desde CSV acepta como adscripción cualquier nombre del catálogo de institución, aunque no esté vigente. El formulario solo acepta los vigentes. Decidir si la importación debe aplicar la misma regla.
16. **Indicador «Accesos hoy».** Lo definió el equipo Nexora (cada inicio de sesión correcto del día), no el cliente. Confirmar con el cliente si le es útil y si debe contar accesos o personas distintas.
17. **Estados de la cuenta** (sección 5): confirmar con el cliente los estados «pendiente» y «suspendido» (decisión D1).
18. **Estados de una solicitud de cambio:** el equipo propone pendiente, autorizada, devuelta y aplicada (D9; hoy el prototipo dice «rechazada» en lugar de «devuelta»). Confirmar con el cliente.

## 9. Estructura técnica del prototipo de Administración

> «Etapas A, B y C» son etapas **internas** de reorganización del código del prototipo de Nexora; no son las «Etapa 1» y «Etapa 2» del proyecto (sección 2).

- **Tecnología:** página web con módulos de JavaScript (ES) servida con Vite (`npm run dev`, http://localhost:4201). Ya no se abre con doble clic en el HTML.
- **Datos:** sigue siendo un prototipo **sin base de datos real**. Los datos de demostración se guardan en el navegador (`localStorage`). Esto es coherente con la Etapa 1 (maqueta sin base de datos).
- **Convivencia con los otros módulos:** el módulo se monta dentro de un *Shadow DOM*, para que sus estilos no choquen con los de los otros equipos. Apoya la regla de **interfaz homogénea** sin "Frankenstein" (sección 3).
- **Organización del código** (`src/`):
  - `config/`: datos de referencia (catálogos semilla, roles, permisos).
  - `core/`: utilidades y datos de demostración. (Guardar y registrar en bitácora pasó a `modules/admin/repositorio/`.)
  - `shared/`: piezas comunes (filtros, avisos, tablas).
  - `shell/`: marco del SIGD (acceso, encabezado y menú). Al iniciar sesión correctamente anuncia el evento `sigd:sesion-iniciada` con la cuenta; cada módulo decide si lo escucha (el de Administración lo usa para contar los accesos) y el marco no conoce los datos de ningún módulo.
  - `modules/admin/repositorio/`: **único lugar que lee, agrega, modifica y guarda los datos** (en el prototipo, `localStorage`). Ninguna pantalla recibe la base completa: cada cambio, incluidos los historiales, se pide al repositorio. Tiene un repositorio por tipo de dato (usuarios, permisos, catálogos, solicitudes, periodos, accesos y bitácora) y las migraciones que corrigen, al arrancar, datos guardados por versiones anteriores. Cuando exista una base de datos real, solo cambia esta capa (decisión ADR-006, `docs/adr-006-repositorio-mvc.md`).
  - `modules/admin/`: un submódulo por pantalla. **Las seis pantallas** (**Inicio**, **Solicitudes**, **Catálogos**, **Usuarios**, **Periodos** y **Bitácora**) están separadas, con prueba y organizadas en **modelo–vista–controlador**:
    - el **modelo** tiene las reglas de negocio y pide los datos al repositorio;
    - la **vista** pinta la pantalla y avisa lo que hace la persona;
    - el **controlador** recibe cada acción, consulta al modelo y elige qué mostrar.
  
    Cada pantalla tiene también su HTML (`vista.html`) y sus estilos propios (`estilos.css`). **Formulario** queda solo como despachador del guardado compartido. En el núcleo del módulo (`app.js`) quedan la navegación, el marco del diálogo y el menú del perfil.
  - **Íconos compartidos:** una sola hoja de íconos (Tabler) para los cuatro módulos del SIGD, en `css/iconos.css`, junto a los estilos del marco. Funciona sin internet. Apoya la regla de **interfaz homogénea** (sección 3).
- **Reorganización interna:**
  - Etapa A: proyecto de módulos ES con Vite.
  - Etapa B: separación de Bitácora, Periodos e Inicio.
  - Etapa C: el formulario compartido, que guardaba con 9 capas de parches encadenados, quedó como un submódulo con una función por dominio.
  - Solicitudes: la pantalla, sus diálogos y sus reglas quedaron en su propio submódulo; la aplicación de una solicitud pasó de 2 capas a una sola función.
  - Catálogos: la pantalla, su diálogo, su historial de versiones y su guardado quedaron en su propio submódulo; el diálogo pasó de 2 capas a una sola función.
  - Usuarios: la pantalla, su diálogo, los campos docentes, el panel de permisos por rol, la importación desde CSV y su guardado quedaron en su propio submódulo; el diálogo pasó de 2 capas a una sola función. Con esto terminó la separación por pantallas.
  - **ADR-006 (repositorio y MVC):** Fase 0, decisión y línea base. Fase 1, capa `repositorio/`, con las migraciones de arranque. Fase 2, las seis pantallas en modelo–vista–controlador. Fase 3, el repositorio también modifica los registros y nadie más recibe la base completa. Terminada. Es una **decisión cerrada** del equipo: todo cambio al módulo la respeta.
  - **Limpieza** (sin efecto visible, comprobada con las pruebas):
    - se quitaron las revisiones repetidas que nunca se alcanzaban;
    - la base se guarda una vez por guardado (antes, hasta tres);
    - se quitó un segundo pintado al arrancar;
    - los nombres de las funciones de fecha quedaron en español (`hoyLocal`, `esFechaValida`, `fechaLegible`, `fechaDMA`);
    - se retiraron el buscador global y dos sistemas de íconos que no hacían nada;
    - los estilos de cada pantalla quedaron en su submódulo. Para esto último se comprobó que el navegador calcula exactamente los mismos estilos en las seis pantallas, a cuatro anchos de pantalla.
- **Pruebas automáticas** (Playwright, `npm test`): 31 pruebas que se corren antes de cada cambio. Comparan:
  - capturas de pantalla de las 6 vistas, en escritorio y en móvil;
  - un flujo de escritura completo y cada una de las seis pantallas por separado (incluida la importación de usuarios desde CSV);
  - más de 160 casos de reglas de guardado de Usuarios, Catálogos y Solicitudes (cada aviso y cada efecto en la base), incluidos formularios forzados con valores que la interfaz no ofrece;
  - la compatibilidad con datos guardados por versiones anteriores, la capa de repositorio (incluidos los métodos que modifican registros), los accesos de Inicio, las fechas de calendario de noche, la accesibilidad (nombres de los campos y contraste) y la separación del encabezado.

  Método de trabajo:
  1. Se escribe una prueba del comportamiento actual.
  2. Se comprueba que falla si se rompe una regla a propósito (prueba de sabotaje).
  3. Solo entonces se cambia el código.

## 10. Errores encontrados en el prototipo de Administración

| # | Error | Dónde | Estado |
|---|---|---|---|
| 1 | Al guardar la ventana de captura se perdían el semestre y las fechas académicas | Periodos | **Corregido** (PR #9) |
| 2 | Al editar una cuenta sin carrera (p. ej. la administración general) sin motivo, salía el aviso «Indica fecha y motivo del cambio de carrera», que no corresponde. Causa: la cuenta no tiene carrera y el formulario envía un valor vacío; se tomaban como distintos | Usuarios | **Corregido** (PR #14) |
| 3 | La regla «El valor del parámetro debe ser numérico» nunca se alcanza desde la interfaz, porque el campo ya solo acepta números | Catálogos · parámetros | Abierto, sin impacto para el usuario |
| 4 | **«Hoy» se calcula en hora universal (UTC) en algunas validaciones.** Después de las 18:00 h (hora del centro de México), la fecha del día siguiente se acepta como si no fuera futura. Afecta la fecha de los movimientos de usuarios y catálogos y las fechas de autorización y de ejecución de solicitudes. Otras validaciones sí usan la hora local, así que el sistema no es consistente | Usuarios, Catálogos, Solicitudes | **Corregido** (PR #21 prueba, PR #22 corrección). Los valores por defecto y las validaciones usan la hora local |
| 5 | Al importar usuarios desde CSV, el selector de archivo no se vaciaba y aparecía un error en la consola. Volver a elegir el mismo archivo (por ejemplo, después de corregirlo) no importaba nada. Causa: el selector vive dentro del *Shadow DOM*; al terminar el aviso del evento, el navegador borra la referencia al elemento, y la importación la usaba después de esperar a leer el archivo | Usuarios · importación CSV | **Corregido** (PR #32 prueba, PR #35 corrección) |
| 6 | **«Accesos hoy» siempre vale 0.** El indicador suma los accesos registrados en el día, pero nada registra los inicios de sesión: la base de demostración lo deja vacío y ninguna parte del sistema lo escribe | Inicio | **Corregido** (rama `fix/accesos-hoy`): cada inicio de sesión correcto suma 1 en un registro por cuenta y por día, en hora local |
| 7 | La clave oficial se revisaba sin espacios, pero se guardaba tal como se escribió («  NUE  »). Por eso se aceptaba otro registro con «NUE», y el primero ya no se podía guardar | Catálogos | **Corregido** (PR #58): la clave se guarda sin espacios alrededor. Un registro guardado así antes de la corrección, que además tenga registros vinculados, no se puede editar sin una migración de los datos |
| 8 | El número de empleado se guardaba con los espacios que se escribieron | Usuarios | **Corregido** (PR #59) |
| 9 | Se aceptaba una cuenta con el correo vacío (el navegador lo pide, pero el guardado no lo revisaba) | Usuarios | **Corregido** (PR #60): aviso «El correo institucional es obligatorio» |
| 10 | Al editar, la cuenta guardaba también la fecha y el motivo del movimiento, que solo sirven para el historial | Usuarios | **Corregido** (PR #61) |
| 11 | Con el formulario forzado se guardaban un estado («Suspendido») y un rol («Invitado») que no existen | Usuarios | **Corregido** (PR #62): avisos «Selecciona un rol institucional válido» y «Selecciona un estado válido». Se acepta el valor que la cuenta ya tenía |
| 12 | En «Permisos por rol», quitar y volver a poner una casilla dejaba ese permiso al final de la lista guardada | Usuarios · permisos | **Corregido** (PR #63): la lista se guarda en el orden de las casillas |
| 13 | Una llave `}` suelta en la hoja de estilos (está así desde la primera versión) hace que el navegador descarte la regla siguiente, que daba separación a los elementos del encabezado de cada pantalla | Estilos (`admin.css`) | **Corregido** (PR #85): se aplica la separación del encabezado. Solo se nota en celular (390 px), donde el título y los botones quedan 4 px más juntos (de 12 a 8 px); en tableta y escritorio no cambia nada |
| 14 | Un parámetro con valor vacío y unidad muestra «Valor: — horas» | Catálogos · parámetros | **Corregido** (PR #74): sin valor se muestra solo «—», sin unidad |
| 15 | Al elegir un tipo de catálogo con la tecla Enter se vuelve a pintar la lista y se pierde el foco del teclado | Catálogos | **Corregido** (PR #75): después de elegir un tipo con Enter, el foco vuelve al tipo elegido |
| 16 | Una opción de captura guarda un campo vacío de más (`groupCustom`) cuando no se eligió «Nuevo grupo…» | Catálogos · opciones | **Corregido** (PR #77): ese campo ya no se guarda, ni al dar de alta ni al editar |
| 17 | Con el formulario forzado se guarda un estado que no es Vigente ni Histórico (p. ej. «Cerrado») | Catálogos | **Corregido** (PR #78): aviso «Selecciona un estado válido», el mismo de Usuarios (fila 11); se acepta el estado que el registro ya tenía |
| 18 | Con el formulario forzado, «Guardar fecha programada» en una solicitud inmediata da un aviso que no explica la causa, y una acción que no existe responde «Estado de la solicitud actualizado» sin cambiar nada | Solicitudes | **Corregido** (PR #80): avisos «Selecciona una acción válida» (si no es una de las 6 acciones del diálogo) y «Solo una solicitud programada para el siguiente ciclo lleva fecha de vigencia» |

La **deuda técnica** sin efecto visible que registraba esta sección ya se limpió, con las pruebas en verde (PR #64 a #72): revisiones repetidas que nunca se alcanzaban, guardados repetidos y helpers de fecha con nombres de versión. Algunas funciones internas conservan nombres con prefijo de versión (`v36`, `v39`, `v41`…); no tienen efecto para el usuario.

> Cambios de esta versión aprobados el 16 de noviembre de 2026; ver `docs/propuesta-documento-maestro-etapa-c.md`, `docs/propuesta-documento-maestro-fechas.md` , `docs/propuesta-documento-maestro-modulos.md` y `docs/propuesta-documento-maestro-cierre.md` (17 de noviembre de 2026).

> Cambios aprobados el 19 de noviembre de 2026: indicador «Accesos hoy»; ver `docs/propuesta-documento-maestro-accesos.md` y `docs/propuesta-documento-maestro-accesos-corregido.md`.

> Cambios aprobados el 21 de noviembre de 2026: arquitectura (repositorio y MVC), limpieza, íconos y estilos, pruebas y errores; ver `docs/propuesta-documento-maestro-limpieza.md`.

> Cambios aprobados el 21 de noviembre de 2026: errores 14 a 18 corregidos; ver `docs/propuesta-documento-maestro-errores-14-18.md`.

> Cambios aprobados el 21 de noviembre de 2026: error 13 corregido; ver `docs/propuesta-documento-maestro-error-13.md`.

> Cambios aprobados el 21 de noviembre de 2026: Fase 3 de la arquitectura; ver `docs/propuesta-documento-maestro-fase-3.md`.

> Cambios aprobados el 21 de noviembre de 2026: decisiones del diagrama V4; ver `docs/propuesta-documento-maestro-decisiones-v4.md` y `docs/decisiones-diagrama-v4.md`.
