# Propuesta de cambio al Documento maestro · indicador «Accesos hoy»

**Módulo:** Administración del sistema (Nexora Technologies)
**Fecha:** 19 de noviembre de 2026
**Estado:** **aprobada** por el usuario el 19 de noviembre de 2026 y **aplicada** a la copia `docs/Documento_Maestro_Proyecto_Plan_Informe.md`.

**Origen del requisito:** decisión del equipo Nexora (19 de noviembre de 2026). **No sale de una reunión con el cliente**: el Documento maestro solo dice que Inicio es un «panel con indicadores y pendientes» (sección 4). Por eso el cambio 3 lo deja como pendiente de validar con el cliente.

---

## Cambio 1 · Sección 10 (agregar la fila #6)

**Texto propuesto:**

| # | Error | Dónde | Estado |
|---|---|---|---|
| 6 | **«Accesos hoy» siempre vale 0.** El indicador suma los accesos registrados en el día, pero nada registra los inicios de sesión: la base de demostración lo deja vacío y ninguna parte del sistema lo escribe | Inicio | **Abierto.** Se corrige en la rama `fix/accesos-hoy`, con su prueba |

**Motivo:** se encontró al pasar Inicio a MVC (rama `refactor/inicio-mvc`). La prueba `inicio.spec`, en su segunda parte, confirma que el indicador sí suma cuando existen registros; lo que falta es crearlos.

---

## Cambio 2 · Sección 6 (agregar una regla, después de «Autoridad y trazabilidad»)

**Texto propuesto:**

> **Accesos (indicador de Inicio)**
> - «Accesos hoy» cuenta **cada inicio de sesión correcto** del día, de todas las cuentas: si la misma cuenta entra 3 veces, suma 3.
> - El día se toma en **hora local** (centro de México), no en hora universal.
> - Los intentos fallidos no cuentan. Los accesos **no** se registran en la bitácora, que es para cambios (ver «Bitácora» arriba).
> - Se guarda un registro por cuenta y por día (cuenta, día, número de accesos), para saber quién entró sin guardar cada acceso por separado.
> - **Limitación del prototipo:** los datos viven en el navegador, así que cada equipo cuenta solo sus propios accesos. En el sistema real, el servidor registrará el acceso al validar la contraseña.

**Motivo:** fija qué mide el indicador antes de implementarlo.

---

## Cambio 3 · Sección 8 (agregar el punto 16)

**Texto propuesto:**

> 16. **Indicador «Accesos hoy».** Lo definió el equipo Nexora (cada inicio de sesión correcto del día), no el cliente. Confirmar con el cliente si le es útil y si debe contar accesos o personas distintas.

**Motivo:** el requisito no sale de las reuniones; queda pendiente de validar.

---

## Cambio 4 · Sección 9 (estructura técnica; una línea en el marco `shell/`)

**Texto propuesto (agregar a la descripción de `shell/`):**

> Al iniciar sesión correctamente, el marco anuncia el evento `sigd:sesion-iniciada` con la cuenta. Cada módulo decide si lo escucha; el de Administración lo usa para contar los accesos. El marco no conoce los datos de ningún módulo.

**Motivo:** es el único cambio al marco común (`src/shell/sigd.js`, una línea), aprobado por el usuario el 19 de noviembre de 2026.

---

| Cambio | Sección | Tipo | Decisión |
|---|---|---|---|
| 1 | 10 · fila #6 | Agregar | ☑ Aprobado (19-nov-2026) |
| 2 | 6 · regla de accesos | Agregar | ☑ Aprobado (19-nov-2026) |
| 3 | 8 · punto 16 | Agregar | ☑ Aprobado (19-nov-2026) |
| 4 | 9 · marco `shell/` | Agregar | ☑ Aprobado (19-nov-2026) |
