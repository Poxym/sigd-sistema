# Registro de decisiones · Diagrama de clases V4 frente al prototipo de Administración

**Fecha:** 21 de noviembre de 2026
**Decidió:** el usuario (Nexora), guiado por un análisis de requisitos. Cada decisión cita su evidencia.
**Para qué:** resolver las contradicciones entre la especificación del diagrama general V4
(`docs/SIGD_Diagrama_general_V4_especificacion.md`), el Documento maestro (DM) y el prototipo de Administración,
antes de pasar el diagrama al modelo relacional.

**Fuentes:**
- **Esp. V4:** la especificación del diagrama.
- **DM:** el Documento maestro (`docs/Documento_Maestro_Proyecto_Plan_Informe.md`).
- **Prototipo:** el código y la base de demostración.
- **Minuta y LOGIN:** las fuentes que cita la Esp. V4 (MIN171126EA y `MODELO_LOGIN.docx`). No están en este
  repositorio.

**Estado de cada decisión:**
- **Cerrada:** la decide el equipo.
- **Validar con el cliente:** es una propuesta nuestra sin fuente del cliente.
- **Abierta:** sin decidir.

---

## Bloque 1 · Usuarios y seguridad

### D1 · Estados del usuario — Cerrada (pendiente y suspendido: validar con el cliente)
- **Evidencia:**
  - La Esp. V4 da pendiente, activo y suspendido (Minuta §5; LOGIN §3).
  - El prototipo usa Activo e Inactivo, y hoy rechaza «Suspendido» (DM §10, fila 11).
  - El DM no define estados.
- **Decisión:** `EstadoUsuario` tiene **4 valores**:
  - **pendiente:** cuenta creada que aún no activa su contraseña;
  - **activo:** el único estado que puede iniciar sesión;
  - **suspendido:** bloqueo temporal y reversible (licencia, sanción o bloqueo por intentos fallidos);
  - **inactivo:** baja definitiva (ya no labora).

  En ningún estado se borra el historial.
- **Impacto:**
  - **Diagrama:** se agrega «inactivo» a `EstadoUsuario`.
  - **DM:** proponer los 4 estados en la §5.
  - **Prototipo:** pasa de 2 a 4 estados.

### D2 · Dónde vive el inicio de sesión — Cerrada
- **Evidencia:**
  - La Esp. V4 pone `iniciarSesion` y `activarCuenta` en `ControladorAdministracion`, y `Credencial`,
    `TokenSeguridad` y `Sesion` en el paquete de Nexora.
  - En el prototipo, el acceso es del marco común (`src/shell/sigd.js`), con dos cuentas fijas (001 y 000).
- **Decisión:**
  - La **pantalla** de acceso sigue en el marco común, para que los 4 módulos la vean igual.
  - La **lógica**, las credenciales y las sesiones son del módulo de Administración, a través de su controlador y su
    repositorio.
- **Impacto:**
  - **Diagrama:** sin cambio.
  - **Prototipo, Etapa 2:** el marco llama al controlador de Administración y desaparecen las cuentas fijas.

### D3 · Uno o varios roles por usuario — Cerrada
- **Evidencia:**
  - DM §5: el jefe de carrera también llena su propio plan; hay trayectorias de ida y vuelta; se conserva todo el
    historial.
  - Esp. V4: `AsignacionRol` con alcance (V4-04).
  - El prototipo guarda un solo rol en texto.
- **Decisión:** un usuario tiene **varias `AsignacionRol`**, cada una con fechaInicio y fechaFin. Puede ser Docente y
  Jefe de carrera a la vez. El historial de roles son las asignaciones cerradas.
- **Impacto:**
  - **Diagrama:** confirmar fechaInicio y fechaFin en `AsignacionRol`.
  - **Prototipo:** el rol pasa a ser una lista de asignaciones, y el historial `history` (texto) desaparece.

### D4 · Categoría docente — Cerrada
- **Evidencia:**
  - DM §6: Asociado A/B/C y Titular A/B/C, más «profesor asociado/titular» y «profesor visitante»; se deben poder
    agregar y eliminar.
  - Esp. V4: `AsignacionCategoria` con fechas (V3-19).
  - El prototipo tiene «Profesor» y «Profesor investigador», sin historial.
- **Decisión:**
  - `AsignacionCategoria` lleva historial.
  - `CategoriaDocente` es un catálogo configurable con los valores del DM.
  - Cierra el DM §8, punto 9.
- **Impacto:**
  - **DM:** marcar el punto 9 como resuelto.
  - **Prototipo:** cambiar la semilla de categorías y agregar su historial.

### D11 · Adscripción de quien no es docente — Cerrada
- **Evidencia:**
  - En la Esp. V4 la adscripción cuelga de `Docente`.
  - El prototipo también adscribe a autoridades y secretarías: «Rectoría», «Vicerrectoría Académica» o
    «Institucional».
  - DM §6: «todo debe ser configurable».
- **Decisión:** nueva clase **`AreaInstitucional`** (Rectoría, Vicerrectoría…), configurable. La adscripción de un
  usuario apunta a un **campus o** a un **área**.
- **Impacto en el diagrama:**
  - nueva clase `AreaInstitucional`, en Estructura académica;
  - la adscripción deja de colgar solo de `Docente` (ver D6a).

### D12 · Nombre del rol de distinciones — Cerrada (contradice al DM: validar con el cliente)
- **Evidencia:**
  - El DM §5 lo llama «Representante institucional»: solo modifica SNI y Perfil Deseable en Distinciones.
  - El prototipo lo llama «Representante de distinciones».
  - El DM §8, punto 2, sigue pendiente.
- **Decisión:** se usa **«Representante de distinciones»**.
- **Riesgo:** no es el nombre que dio el cliente. Confirmarlo junto con el punto 2 (si el rol se incorpora
  formalmente).
- **Impacto:** el DM §5 cambiaría de nombre, como propuesta.

### D13 · Suplencia del administrador único — Abierta
- **Evidencia:**
  - El DM §8, puntos 3 y 11, siguen sin respuesta del cliente.
  - El prototipo exige exactamente una administración general activa.
- **Decisión:** **no se modela** hasta que el cliente responda.
- **Opción preparada, si el cliente la pide:** una `AsignacionRol` temporal de Administrador general, con fechaFin y
  motivo «suplencia». La regla pasaría a ser «una sola asignación de administración vigente a la vez».

## Bloque 2 · Estructura académica

### D5 · Estados de la carrera — Cerrada
- **Evidencia:**
  - DM §6: las carreras en transición o reemplazadas se conservan para consulta histórica y se enlazan con la que las
    sustituye, para trasladar la adscripción de los profesores. Una carrera puede cambiar de campus.
  - Esp. V4: `EstadoCarrera` y «sucede a».
  - El prototipo tiene Vigente e Histórico.
- **Decisión:** **`EstadoCarrera`** = activa, en transición, reemplazada, cerrada. Se agrega la relación «sucede a».
- **Impacto en el prototipo:** las carreras pasan a esos 4 estados y suman la carrera sucesora.

### D6a · Historial de adscripción — Cerrada
- **Evidencia:**
  - El prototipo guarda dos historiales por usuario: adscripción (campus o área) y carrera, cada uno con fecha
    efectiva y motivo.
  - La Esp. V4 tiene `AdscripcionDocente`, sin atributos listados.
- **Decisión:** **dos clases**, cada una con fechaInicio, fechaFin (vacía = vigente) y motivo. Hay una sola vigente
  de cada una.
  - **Adscripción del usuario:** apunta a un campus **o** a un área institucional (D11).
  - **Adscripción a carrera:** solo para usuarios con rol académico. Es la que se traslada sola cuando la carrera es
    reemplazada (D5).
- **Pendiente de nombrar en el diagrama:** por ejemplo, `Adscripcion` y `AdscripcionCarrera`. Como la primera ya no es
  solo de docentes, `AdscripcionDocente` cambiaría de nombre o de dueño (`Usuario`).

### D6b · Historial de los catálogos — Cerrada
- **Evidencia:**
  - El prototipo guarda en cada registro su historial de versiones y de relación.
  - La Esp. V4 tiene `CatalogoVersion` (`publicar()` con cada cambio) y `Bitacora`, ligada a `SolicitudCambio`.
  - DM §6: qué debe registrar la bitácora.
- **Decisión:** cada cambio a un catálogo queda en `Bitacora` (con su solicitud, si la hubo) y publica una
  `CatalogoVersion`. Eso incluye el cambio de campus de una carrera. **No** se crean clases de historial por registro.
- **Impacto en el prototipo, Etapa 2:** `changeHistory` y `relationHistory` se reemplazan por consultas a la bitácora.

### D14 · Comisiones — Cerrada
- **Evidencia:**
  - El prototipo tiene un catálogo «Comisiones» aparte de las opciones de captura.
  - DM §7: la hoja «Datos» del Plan trae listas de comisiones, comités, programas…
  - La Esp. V4 usa `DefinicionCampo` y `OpcionCampo`.
- **Decisión:** las comisiones son **`OpcionCampo`** de una `DefinicionCampo` «Comisión», como comités y programas.
- **Impacto en el prototipo:** el catálogo «Comisiones» se vuelve un grupo de opciones de captura.

## Bloque 3 · Configuración, accesos y solicitudes

### D7 · Registro de accesos — Cerrada (cambia una regla del DM)
- **Evidencia:**
  - DM §6 (lo definió Nexora el 19-nov y está pendiente con el cliente): un registro por cuenta y por día.
  - Esp. V4: `RegistroAcceso`, un evento por intento (LOGIN §5).
- **Decisión:** **`RegistroAcceso`**: un evento por intento (correo, acción, IP, fecha y hora). «Accesos hoy» cuenta
  los «login exitoso» del día.
- **Impacto:**
  - **DM:** proponer el cambio de la §6 «Accesos».
  - **Prototipo, Etapa 2:** `demoAccessEvents` se reemplaza por esos eventos.

### D8 · Parámetros — Cerrada
- **Evidencia:**
  - El prototipo tiene un catálogo «Parámetros y pesos», con un solo registro: el umbral del 35 %, sin fuente (DM §8,
    punto 10).
  - La Esp. V4 tiene `ParametroSistema` para seguridad, y los pesos están en `ConfiguracionRubro` y
    `ConfiguracionActividad`.
- **Decisión:**
  - Todo valor configurable suelto (de seguridad y umbrales académicos) va en **`ParametroSistema`**, al que se le
    agrega el atributo **`unidad`**.
  - Los pesos se quedan donde están.
  - El catálogo «parametros» desaparece.
  - El umbral del 35 % sigue sin fuente (DM §8, punto 10).
- **Impacto:**
  - **Diagrama:** + `unidad : string` en `ParametroSistema`.

### D9 · Valores de `ModalidadCambio` y `EstadoSolicitud` — Cerrada
- **Evidencia:**
  - DM §6 «Vigencia de cambios» y §8, punto 1: aplicar ya o programar para el siguiente ciclo.
  - El prototipo usa pendiente, autorizada, rechazada («Devolver para aclaración») y aplicada.
- **Decisión:**
  - **`ModalidadCambio`** = inmediata, siguiente ciclo. Tiene fuente: el DM.
  - **`EstadoSolicitud`** = pendiente, autorizada, devuelta, aplicada. Es propuesta Nexora: **validar con el
    cliente**.
- **Impacto en el prototipo:** el estado «rechazada» se llamará «devuelta».

### D10 · Quién autoriza una solicitud — Cerrada
- **Evidencia:**
  - DM §6: registrar cuándo llegó la indicación y de quién, cuándo se atendió y si Vicerrectoría la validó después.
  - Esp. V4 (V3-11): `SolicitudCambio` se liga con `AsignacionRol` (solicita, atiende, valida).
  - El prototipo guarda la autoridad como texto y quien la aplica fijo («Administrador general»).
- **Decisión:** las relaciones **solicita**, **atiende** y **valida** (esta, opcional) apuntan a `AsignacionRol`, cada
  una con su fecha.
- **Impacto en el prototipo, Etapa 2:** los textos `authority`, `authorizationBy` y `executedBy` se vuelven
  referencias.

---

## Resumen de cambios al diagrama (para la V5)

| Clase o enumeración | Cambio | Decisión |
|---|---|---|
| `EstadoUsuario` | + inactivo (baja definitiva) | D1 |
| `AsignacionRol` | fechaInicio y fechaFin; varias por usuario | D3 |
| `AreaInstitucional` | **nueva** (Estructura académica) | D11 |
| `AdscripcionDocente` | se divide: adscripción del usuario (campus o área) y adscripción a carrera, ambas con fechas y motivo | D6a, D11 |
| `CategoriaDocente` | valores del DM como filas de catálogo | D4 |
| `EstadoCarrera`, «sucede a» | se confirman | D5 |
| `ParametroSistema` | + `unidad : string` | D8 |
| `ModalidadCambio` | inmediata, siguiente ciclo | D9 |
| `EstadoSolicitud` | pendiente, autorizada, devuelta, aplicada (validar con el cliente) | D9 |
| `SolicitudCambio` — `AsignacionRol` | solicita, atiende, valida (con fechas) | D10 |
| Comisiones | como `OpcionCampo`, sin clase propia | D14 |

## Pendiente con el cliente
- D1: los estados pendiente y suspendido.
- D9: los valores de `EstadoSolicitud`.
- D12: el nombre y la incorporación del rol de distinciones (DM §8, punto 2).
- D13: la suplencia del administrador.
- D8: la fuente del umbral del 35 %.
- D7: el cambio de la regla de accesos.
