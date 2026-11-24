"""Permisos DRF reutilizables por los demás módulos. El frontend nunca decide la autorización."""
from rest_framework.permissions import BasePermission

from .repositorios import RepositorioUsuariosDjango
from .servicios import ServicioSesion


def acceso_a_modulo(modulo: str) -> type[BasePermission]:
    """Uso: permission_classes = [acceso_a_modulo("admin")]"""

    class AccesoModulo(BasePermission):
        message = "No tienes acceso a este módulo."

        def has_permission(self, request, view):
            if not request.user or not request.user.is_authenticated:
                return False
            perfil = ServicioSesion(RepositorioUsuariosDjango()).perfil(request.user)
            return modulo in perfil.modulos

    AccesoModulo.__name__ = f"AccesoModulo_{modulo}"
    return AccesoModulo
