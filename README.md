# SIGD · Sistema Integral de Gestión Docente

Angular 22 (frontend) · Django 6.1 + DRF (backend) · PostgreSQL 17 · Docker Compose.
Arquitectura por módulos con **patrón repositorio** en ambos lados.

## Arrancar

```bash
cp .env.example .env
docker compose up --build
docker compose exec backend python manage.py sembrar_demo   # cuentas del prototipo
```

| Servicio | URL |
|---|---|
| Frontend | http://localhost:4200 |
| API (salud) | http://localhost:8000/api/salud/ |
| Admin de Django | http://localhost:8000/django-admin/ |

Cuentas de demostración (contraseña `Unistmo#2026`): `209` docente · `118` docente y jefatura · `100` Vicerrectoría · `001` Administración · `000` todos los módulos.

**Sin backend** (solo diseño de pantallas): `cd frontend && npm install && npm run start:demo` usa repositorios en memoria con los mismos datos.

## Estructura

```
sigd/
├── backend/                 Django: un app por contexto del dominio
│   ├── config/              settings (base/dev/test/prod), urls
│   └── apps/
│       ├── core/            núcleo compartido: ModeloBase (UUID v7), Vigencia, enums, repositorio base, errores, exportación
│       ├── identidad/       usuarios, roles, sesión, permisos por módulo        ← implementado
│       ├── estructura/      campus, carreras, periodos, grupos, asignaciones    ← Periodo implementado (ejemplo)
│       ├── docentes/  catalogo/  documentos/  plan_trabajo/  informe/
│       └── reportes/  administracion/  bitacora/  notificaciones/
├── frontend/src/app/
│   ├── core/                sesión, guards, registro de módulos, http, repositorios
│   ├── layout/              MARCO COMPARTIDO: shell, barra superior, menú lateral, selector de módulo, marca
│   ├── shared/ui/           componentes reutilizables (encabezado de página, página pendiente…)
│   └── features/            acceso · administracion · plan-trabajo · informe-actividades · reportes
├── modulos/
│   └── administracion/      proyecto del módulo Administración (su equipo trabaja aquí; ver abajo)
├── prototipo-referencia/    el v17 separado por módulo (solo consulta, no se ejecuta)
├── modelo/                  (del repo actual) esquema, diccionario y diagramas de BD
└── docs/                    CONTEXTO · ARQUITECTURA · MODULOS · FLUJO_TRABAJO · DECISIONES
```

Empieza por [docs/PROBAR.md](docs/PROBAR.md), luego [docs/CONTEXTO.md](docs/CONTEXTO.md) y [docs/FLUJO_TRABAJO.md](docs/FLUJO_TRABAJO.md).

> Rama de prueba. La implementación anterior en Node.js sigue intacta en `main`.

## Módulo Administración

Administración ya no es «pendiente»: es el proyecto de su equipo, en `modulos/administracion/` (JS con MVC por pantalla y su propio repositorio, ADR-006). Angular lo monta dentro del marco común en las seis rutas `/admin/...`.

```bash
cd modulos/administracion
npm install
npm run dev          # trabajar el módulo solo, como siempre (http://localhost:4201)
npm test             # sus pruebas de Playwright
npm run build:sigd   # actualiza frontend/public/modulos/administracion/administracion.js
```

Después de cambiar el módulo hay que correr `npm run build:sigd` y subir también ese archivo; CI lo comprueba.

## Pruebas

```bash
docker compose exec backend python manage.py test --settings=config.settings.test
cd frontend && npx ng test --watch=false
```
