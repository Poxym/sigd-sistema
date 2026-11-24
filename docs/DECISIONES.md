# Decisiones abiertas

Puntos donde los materiales se contradicen o no definen algo. El esqueleto tomó la opción marcada **(provisional)**; confirmar con el equipo/cliente.

| # | Tema | Lo que dicen las fuentes | Provisional en el esqueleto |
|---|---|---|---|
| D1 | Tipo de identificadores | Diagrama general v3 y `schema.json`: texto (UUID v7). Diagrama v4 de Informe y diagrama de Vicerrectoría: `int`. | UUID v7 como texto |
| D3 | Idioma de nombres | Tablas en inglés (`schema.json`), clases en español (diagramas). | `db_table` en inglés como el esquema; modelos y campos en español |
| D4 | Contraseña | El esquema la separa en `credentials`; Django la guarda en `users.password`. | En `users` (AbstractBaseUser). `credentials` se descartaría o quedaría para `must_change` |
| D5 | Códigos de rol | Enumeración «por definir con el cliente». Los usados salen de las cuentas del prototipo y del diagrama de Vicerrectoría. | `DOCENTE`, `JEFE_CARRERA`, `VICERRECTORIA`, `RECTORIA`, `SECRETARIA_ACADEMICA`, `REPRESENTANTE_INSTITUCIONAL`, `ADMINISTRADOR` |
| D6 | Firebase | El repo actual mantiene proveedores PostgreSQL y Firebase. Con Django el ORM está pensado para SQL. | Solo PostgreSQL. ¿Sigue siendo requisito Firebase? |
| D7 | Código Node actual (`src/*.mjs`, `public/`) | Es la implementación vigente y probada. | No se migra; queda en su rama. Conservar `modelo/` |
| D8 | Roles como subclases | El diagrama de Vicerrectoría hereda `Vicerrectoria`, `Rectoria`… de `Usuario`; el v3 usa `AsignacionRol` con vigencia. | Roles por asignación (v3). Las operaciones de cada rol van como permisos/servicios |
| D9 | Tablas de Reportes | Semáforo, cumplimiento e histórico no están en `schema.json`. | Pendiente de diseñar en `apps/reportes` |
| D10 | Ruta de notificaciones | El prototipo las abre desde la campana dentro de Plan. | `/plan/notificaciones`; si serán de todos los módulos, mover a una ruta global |
