"""Configuración común. Los valores sensibles llegan por variables de entorno (ver .env.example)."""
import os
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parents[2]


def env(nombre, defecto=None):
    return os.environ.get(nombre, defecto)


def env_bool(nombre, defecto=False):
    return str(env(nombre, defecto)).lower() in {"1", "true", "yes", "si", "sí"}


SECRET_KEY = env("DJANGO_SECRET_KEY", "solo-para-desarrollo-cambiar")
DEBUG = env_bool("DJANGO_DEBUG", False)
ALLOWED_HOSTS = [h for h in env("DJANGO_ALLOWED_HOSTS", "localhost,127.0.0.1").split(",") if h]

DJANGO_APPS = [
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",
]
TERCEROS = ["rest_framework"]
# Un app de Django por contexto del dominio. El orden importa poco; las dependencias
# permitidas entre ellos están en docs/ARQUITECTURA.md.
SIGD_APPS = [
    "apps.core",
    "apps.identidad",
    "apps.estructura",
    "apps.docentes",
    "apps.catalogo",
    "apps.documentos",
    "apps.plan_trabajo",
    "apps.informe",
    "apps.reportes",
    "apps.administracion",
    "apps.bitacora",
    "apps.notificaciones",
]
INSTALLED_APPS = DJANGO_APPS + TERCEROS + SIGD_APPS

MIDDLEWARE = [
    "django.middleware.security.SecurityMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
]

ROOT_URLCONF = "config.urls"
WSGI_APPLICATION = "config.wsgi.application"
TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
            ]
        },
    }
]

# PostgreSQL por defecto (contenedor "db" de docker-compose).
if env("DB_ENGINE", "postgres") == "sqlite":
    DATABASES = {"default": {"ENGINE": "django.db.backends.sqlite3", "NAME": BASE_DIR / "db.sqlite3"}}
else:
    DATABASES = {
        "default": {
            "ENGINE": "django.db.backends.postgresql",
            "NAME": env("POSTGRES_DB", "sigd"),
            "USER": env("POSTGRES_USER", "sigd"),
            "PASSWORD": env("POSTGRES_PASSWORD", "sigd"),
            "HOST": env("POSTGRES_HOST", "db"),
            "PORT": env("POSTGRES_PORT", "5432"),
        }
    }

# Usuario propio desde el inicio: cambiarlo después de la primera migración es muy costoso.
AUTH_USER_MODEL = "identidad.Usuario"

LANGUAGE_CODE = "es-mx"
TIME_ZONE = "America/Mexico_City"
USE_I18N = True
USE_TZ = True

STATIC_URL = "static/"
STATIC_ROOT = BASE_DIR / "staticfiles"
DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"

# Sesión en cookie HttpOnly + CSRF, como en el sistema actual.
SESSION_COOKIE_HTTPONLY = True
SESSION_COOKIE_SAMESITE = "Strict"
CSRF_COOKIE_SAMESITE = "Strict"
CSRF_TRUSTED_ORIGINS = [o for o in env("CSRF_TRUSTED_ORIGINS", "http://localhost:4200").split(",") if o]

REST_FRAMEWORK = {
    "DEFAULT_AUTHENTICATION_CLASSES": ["rest_framework.authentication.SessionAuthentication"],
    "DEFAULT_PERMISSION_CLASSES": ["rest_framework.permissions.IsAuthenticated"],
    "EXCEPTION_HANDLER": "apps.core.api.errores.manejador_errores",
}
