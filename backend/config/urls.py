"""Rutas raíz. Cada módulo publica sus rutas bajo /api/<modulo>/."""
from django.contrib import admin
from django.urls import include, path

urlpatterns = [
    path("django-admin/", admin.site.urls),  # no usar /admin: es la ruta del módulo en Angular
    path("api/", include("apps.core.api.urls")),
    path("api/identidad/", include("apps.identidad.api.urls")),
    path("api/estructura/", include("apps.estructura.api.urls")),
    path("api/docentes/", include("apps.docentes.api.urls")),
    path("api/catalogo/", include("apps.catalogo.api.urls")),
    path("api/documentos/", include("apps.documentos.api.urls")),
    path("api/plan-trabajo/", include("apps.plan_trabajo.api.urls")),
    path("api/informe/", include("apps.informe.api.urls")),
    path("api/reportes/", include("apps.reportes.api.urls")),
    path("api/administracion/", include("apps.administracion.api.urls")),
    path("api/bitacora/", include("apps.bitacora.api.urls")),
    path("api/notificaciones/", include("apps.notificaciones.api.urls")),
]
