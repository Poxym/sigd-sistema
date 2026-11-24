# Propuesta de cambio al Documento maestro · decisiones del diagrama V4

**Módulo:** Administración del sistema (Nexora Technologies)
**Fecha:** 21 de noviembre de 2026
**Estado:** **aprobada** por el usuario el 21 de noviembre de 2026 (los 7 cambios) y **aplicada** a la copia `docs/Documento_Maestro_Proyecto_Plan_Informe.md`. En el cambio 5 se tachó el texto anterior del punto 9 y se conservó su título, con el mismo formato que el punto 14.

**Por qué:** el 21 de noviembre el equipo tomó 14 decisiones para resolver contradicciones entre el diagrama de clases
general V4, este documento y el prototipo (`docs/decisiones-diagrama-v4.md`). Seis de ellas cambian o completan lo que
dice este documento. Las demás solo afectan al diagrama y al prototipo.

**Importante:** varias decisiones son **propuesta del equipo, sin fuente del cliente**. Se marcan así en el texto para
no presentarlas como requisitos del cliente.

Cada cambio se aprueba por separado (tabla al final).

---

## Cambio 1 · Sección 5, estados de la cuenta (D1)

**Se agrega** después de la tabla de roles, antes de «Reglas sobre cambio de rol»:

> **Estados de la cuenta** (decisión del equipo, 21-nov-2026; «pendiente» y «suspendido» salen de la minuta del 17-nov
> y del modelo de login; validar con el cliente):
> - **pendiente:** la cuenta existe pero aún no activa su contraseña;
> - **activo:** es el único estado que puede iniciar sesión;
> - **suspendido:** bloqueo temporal y reversible (licencia, sanción o demasiados intentos fallidos);
> - **inactivo:** baja definitiva (la persona ya no labora).
>
> En ningún estado se borra el historial.

---

## Cambio 2 · Sección 5, varios roles a la vez (D3)

**Se agrega** como primera viñeta de «Reglas sobre cambio de rol»:

> - Una persona puede tener **varios roles a la vez**, cada uno con fecha de inicio y de fin (por ejemplo, Profesor y
>   Jefe de carrera de su carrera). El historial de roles son los roles que ya terminaron.

---

## Cambio 3 · Sección 5, nombre del rol de distinciones (D12)

**Texto actual (primera columna de la fila):**
> Representante institucional

**Texto propuesto:**
> Representante de distinciones (el Sr. C lo llamó «representante institucional»; nombre por confirmar)

(El resto de la fila no cambia.)

---

## Cambio 4 · Sección 6, «Accesos» (D7)

**Texto actual:**
> - Se guarda un registro por cuenta y por día (cuenta, día, número de accesos), para saber quién entró sin guardar cada acceso por separado.

**Texto propuesto:**
> - Se guarda **un registro por cada intento** de acceso: correo, acción (acceso correcto, acceso fallido, activación,
>   cambio de contraseña, cierre de sesión), origen y fecha y hora. «Accesos hoy» cuenta los accesos correctos del
>   día. Así los intentos fallidos sirven para bloquear la cuenta, sin contarse en el indicador. (Cambio del 21-nov-2026,
>   decisión D7; antes era un registro por cuenta y por día.)

---

## Cambio 5 · Sección 8, punto 9 resuelto (D4)

**Texto actual (inicio del punto):**
> 9. **Categorías docentes del prototipo.**

**Texto propuesto (inicio del punto):**
> 9. ~~**Categorías docentes del prototipo.**~~ **Resuelto el 21 de noviembre de 2026 (D4):** la lista oficial es la
> de las secciones 6 y 7 (Asociado A/B/C, Titular A/B/C, profesor asociado/titular, profesor visitante), como catálogo
> configurable. La categoría de cada profesor guarda historial con fechas. El prototipo se alinea después.

(El resto del punto se conserva tachado, como el punto 14.)

---

## Cambio 6 · Sección 8, punto 2 y puntos nuevos 17 y 18

**Texto actual (final del punto 2):**
> Confirmar si se incorporan formalmente.

**Texto propuesto:**
> Confirmar si se incorporan formalmente. El equipo propone llamarlo «Representante de distinciones» (D12); confirmar
> también el nombre.

**Se agregan al final de la lista:**
> 17. **Estados de la cuenta** (sección 5): confirmar con el cliente los estados «pendiente» y «suspendido»
>     (decisión D1).
>
> 18. **Estados de una solicitud de cambio:** el equipo propone pendiente, autorizada, devuelta y aplicada (D9; hoy
>     el prototipo dice «rechazada» en lugar de «devuelta»). Confirmar con el cliente.

---

## Cambio 7 · Nota al final de la sección 10

**Se agrega:**
> Cambios aprobados el 21 de noviembre de 2026: decisiones del diagrama V4; ver
> `docs/propuesta-documento-maestro-decisiones-v4.md` y `docs/decisiones-diagrama-v4.md`.

---

## Lo que no cambia aquí

Estas decisiones no tocan este documento: D2 (inicio de sesión), D5 (estados de la carrera; la §6 ya habla de carreras
en transición y reemplazadas), D6a, D6b, D8, D10, D11 y D14. Aplican al diagrama V5 y, después, al prototipo. D13
(suplencia) sigue abierta, como dicen los puntos 3 y 11.

---

## Decisiones

| Cambio | Sección | Tipo | Decisión |
|---|---|---|---|
| 1 | 5 · estados de la cuenta | Agregar | ☑ Aprobado (21-nov-2026) |
| 2 | 5 · varios roles a la vez | Agregar | ☑ Aprobado (21-nov-2026) |
| 3 | 5 · nombre del rol | Modificar | ☑ Aprobado (21-nov-2026) |
| 4 | 6 · accesos | Modificar | ☑ Aprobado (21-nov-2026) |
| 5 | 8 · punto 9 | Marcar resuelto | ☑ Aprobado (21-nov-2026) |
| 6 | 8 · punto 2, 17 y 18 | Modificar y agregar | ☑ Aprobado (21-nov-2026) |
| 7 | 10 · nota final | Agregar | ☑ Aprobado (21-nov-2026) |
