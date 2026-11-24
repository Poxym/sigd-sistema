# Cómo probar lo que hay

Contraseña de todas las cuentas: `Unistmo#2026`

| Cuenta | Qué ve |
|---|---|
| `000` | Los 4 módulos (la mejor para revisar el marco) |
| `001` | Solo Administración (Carlos Mendoza): las seis pantallas del módulo ya funcionan |
| `118` | Plan, Informe y Reportes (docente + jefatura) |
| `209` | Plan e Informe (docente) |
| `100` | Solo Reportes (entra directo, sin selector) |

## Opción A · Todo con Docker (recomendada)

Requiere Docker Desktop abierto.

```bash
git clone -b esqueleto-django-angular https://github.com/Poxym/sigd-sistema.git
cd sigd-sistema
cp .env.example .env          # en PowerShell: copy .env.example .env
docker compose up --build     # la primera vez tarda varios minutos
```

En otra terminal, una sola vez, crea las cuentas de prueba:

```bash
docker compose exec backend python manage.py sembrar_demo
```

Abre http://localhost:4200 · la API responde en http://localhost:8000/api/salud/

Para apagar: `Ctrl+C` y luego `docker compose down` (agrega `-v` si quieres borrar la base de datos).

## Opción B · Solo el frontend, sin backend (para revisar diseño)

Requiere Node 24 (o 22.22+).

```bash
cd frontend
npm install
npm run start:demo
```

Abre http://localhost:4200. Usa datos en memoria con las mismas cuentas; lo que crees se pierde al recargar.

## Opción C · Sin Docker, todo local

Requiere Python 3.12+ y Node 24. Usa SQLite en lugar de PostgreSQL.

```bash
# Terminal 1 · backend
cd backend
python -m venv .venv
.venv\Scripts\activate            # Linux/Mac: source .venv/bin/activate
pip install -r requirements/dev.txt
set DB_ENGINE=sqlite              # PowerShell: $env:DB_ENGINE="sqlite"   Linux/Mac: export DB_ENGINE=sqlite
python manage.py migrate
python manage.py sembrar_demo
python manage.py runserver

# Terminal 2 · frontend
cd frontend
npm install
npm start
```

## Qué revisar

1. **Acceso**: entra con `209` y con una contraseña equivocada (debe mostrar el error).
2. **Selector de módulo**: con `000` o `118` aparece «Elija un módulo»; con `100` entra directo a Reportes.
3. **Marco**: cambia de módulo en la barra superior; el menú lateral cambia con él. Prueba «Ocultar menú» y recarga (recuerda la preferencia).
4. **Celular**: en el navegador, F12 → modo dispositivo (390 px). El menú se abre con el botón ☰.
5. **Roles en el menú**: en Plan, `209` ve «Mi plan» e «Historial»; `118` además ve «Bandeja de revisión».
6. **Administración**: con `001` recorre las seis pantallas del menú. En Inicio, «Accesos hoy» debe contar tu acceso; al dar clic en una cifra (p. ej. «Usuarios activos») te lleva a esa pantalla y el menú lateral la marca. Sus datos se guardan en el navegador.
6b. **Ejemplo con API**: entra a http://localhost:4200/admin/periodos-api. Crea un periodo; luego otro con fechas encimadas: Django lo rechaza con «Las fechas se traslapan con otro periodo».
7. **Permisos**: con `209` escribe a mano http://localhost:4200/admin/usuarios: te regresa al selector. Aunque se llame a la API directo, Django responde 403.

## Pruebas automáticas

```bash
# Backend (7 pruebas)
docker compose exec backend python manage.py test --settings=config.settings.test
# sin Docker: cd backend && python manage.py test --settings=config.settings.test

# Frontend (5 pruebas)
cd frontend && npx ng test --watch=false
```

Además, cada push a la rama ejecuta las dos suites en GitHub Actions (pestaña **Actions** del repo).
