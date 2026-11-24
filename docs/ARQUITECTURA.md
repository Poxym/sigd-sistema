# Arquitectura

## Backend: capas de cada app

```
api/views.py  ──►  servicios.py  ──►  repositorios.py  ──►  models.py (ORM)
 (HTTP, DRF)      (reglas, casos       (único que toca       (tablas)
                   de uso)              el ORM)
```

| Capa | Hace | No hace |
|---|---|---|
| `api/` (views, serializers, urls) | Lee la petición, valida forma, llama al servicio, responde | Reglas de negocio, consultas ORM |
| `servicios.py` | Reglas del dominio; lanza `ReglaNegocio`, `NoEncontrado`, `ConflictoVersion` | Conocer HTTP o importar modelos de otros módulos |
| `repositorios.py` | Interfaz `Protocol` + `RepositorioXDjango` + `RepositorioXMemoria` | Exponer QuerySets hacia fuera |
| `models.py` | Tablas, restricciones de BD | Lógica de negocio |

El servicio recibe el repositorio por constructor (`ServicioPeriodos(RepositorioPeriodosDjango())`). En pruebas se le pasa el de memoria y no hace falta base de datos.
**Ejemplo completo:** `backend/apps/estructura/` (Periodo) y su prueba `tests/test_periodos.py`.

Los errores de dominio se convierten en JSON uniforme `{codigo, mensaje, detalle}` en `apps/core/api/errores.py`.

### Dependencias permitidas entre apps

```
core ◄── todos
identidad ◄── todos (permisos acceso_a_modulo)
estructura, docentes, catalogo ◄── documentos, plan_trabajo, informe
documentos ◄── plan_trabajo, informe
reportes ──► solo consultas de lectura publicadas por cada módulo (consultas.py o vistas SQL)
bitacora, notificaciones ◄── cualquiera, a través de su servicio
```

Un módulo nunca importa `models` de otro para escribir: usa el servicio del otro.

## Frontend

```
core/      singleton de la app: sesión, guards, registro de módulos, interceptor http
layout/    marco compartido (shell, barra superior, menú lateral, selector, marca)
shared/    piezas visuales reutilizables, sin estado de negocio
features/<modulo>/
   <modulo>.routes.ts    rutas + providers del módulo (aquí se eligen los repositorios)
   pages/                una carpeta por pantalla (componente enrutable)
   components/           piezas internas del módulo
   data-access/          <x>.repository.ts (contrato) · <x>.http.repository.ts · <x>.memoria.repository.ts
   models/               interfaces TypeScript espejo de los serializers
```

- **El marco no conoce las pantallas**: lee `core/modulos/modulos.registry.ts` (nombre, icono, menú lateral por rol). Para que un módulo aparezca en el menú basta con editar ese registro y su `routes.ts`.
- **Repositorio en el front**: la página inyecta la clase abstracta; `proveerRepositorio()` usa la de HTTP o la de memoria según `environment.fuenteDatos`. Así cada equipo diseña con datos falsos antes de que exista su API.
- **Estilos**: solo variables de `src/styles/_tokens.scss` y clases globales de `_componentes.scss` (`.btn`, `.tarjeta`, `.campo`, `.tabla`, `.semaforo`, `.aviso`). Iconos Tabler (`<i class="ti ti-nombre">`), los mismos del prototipo.
- Las features no se importan entre sí. Si dos módulos necesitan lo mismo, se sube a `shared/` o `core/`.

## Docker

| Servicio | Imagen | Puerto |
|---|---|---|
| db | postgres:17-alpine | 5432 |
| backend | python:3.13-slim (runserver en dev, gunicorn en prod) | 8000 |
| frontend | node:24-alpine (`ng serve`) · etapa `prod` con nginx | 4200 |

En desarrollo `ng serve` manda `/api` a Django con `proxy.conf.mjs`; en producción lo hace `nginx.conf`. Mismo origen: sin CORS, con cookie de sesión HttpOnly + CSRF.
