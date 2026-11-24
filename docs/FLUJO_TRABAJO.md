# Cómo trabajar

## Ramas

- `main`: siempre compila y pasa pruebas (CI en `.github/workflows/ci.yml`).
- Una rama por cambio: `<modulo>/<descripcion>`, p. ej. `reportes/semaforo-umbral`, `plan/captura-docencia`, `marco/menu-movil`.
- Pull request revisado por alguien de otro equipo cuando toque `core/`, `layout/`, `shared/`, `apps/core` o `apps/identidad` (lo comparten todos).

## Agregar una pantalla (frontend)

1. Crear `features/<modulo>/pages/<pantalla>/<pantalla>.page.ts` (+ `.html`).
2. En `<modulo>.routes.ts`, cambiar la entrada `PaginaPendiente` por `loadComponent: () => import(...)`.
3. Si la pantalla es nueva en el menú, agregar su `ElementoNav` en `core/modulos/modulos.registry.ts` (icono Tabler, etiqueta, ruta, roles).
4. Si usa datos: en `data-access/` crear el contrato `<x>.repository.ts` y sus dos implementaciones (`http` y `memoria`), y proveerlo en `providers` de las rutas del módulo. Copiar la forma de `administracion/data-access/periodos.*`.
5. Usar `<sigd-encabezado-pagina>` y las clases del prototipo (`.card`, `.tiles`, `.btn.primary`, `.tag`…) más las de `_sigd.scss`; no redefinir colores: todos salen de las variables de `marco.css`.

## Agregar un caso de uso (backend)

1. `models.py`: tabla(s) heredando de `ModeloBase` (y `ConVigencia` si aplica). `db_table` = nombre de `schema.json`.
2. `python manage.py makemigrations <app>`.
3. `repositorios.py`: Protocol + implementación Django + implementación en memoria.
4. `servicios.py`: reglas; lanzar errores de `apps.core.excepciones`.
5. `api/`: serializer, vista delgada con `permission_classes` (`acceso_a_modulo("...")`), url.
6. `tests/`: reglas con repositorio en memoria (`SimpleTestCase`) + una prueba de API (`TestCase`).

Copiar la forma de `apps/estructura/` (Periodo).

## Equipo de Administración

Trabaja en `modulos/administracion/` como siempre (`npm run dev`, `npm test`). Antes de subir: `npm run build:sigd` y sube también `frontend/public/modulos/administracion/administracion.js`. Si se agrega una pantalla nueva, además: su entrada en `core/modulos/modulos.registry.ts` y una línea `vista('<nombre>')` en `administracion.routes.ts`.

## Migrar desde el prototipo

`prototipo-referencia/` tiene el v17 separado por módulo. No se ejecuta: es para consultar textos, estructura de pantallas, reglas y estilos. Al migrar una pantalla, tomar de ahí el HTML y la lógica, pasar los datos simulados al repositorio `memoria` y los colores a tokens.
