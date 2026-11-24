from dataclasses import asdict

from django.contrib.auth import authenticate, login, logout
from django.middleware.csrf import get_token
from rest_framework import status
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView

from ..repositorios import RepositorioUsuariosDjango
from ..servicios import ServicioSesion
from .serializers import CredencialesSerializer


def _servicio():
    return ServicioSesion(RepositorioUsuariosDjango())


class SesionView(APIView):
    """GET: perfil de quien inició sesión. POST: iniciar sesión. DELETE: cerrar sesión."""

    def get_permissions(self):
        return [AllowAny()] if self.request.method in ("POST", "GET") else super().get_permissions()

    def get(self, request):
        get_token(request)  # asegura la cookie csrftoken para el front
        if not request.user.is_authenticated:
            return Response(status=status.HTTP_204_NO_CONTENT)
        return Response(asdict(_servicio().perfil(request.user)))

    def post(self, request):
        datos = CredencialesSerializer(data=request.data)
        datos.is_valid(raise_exception=True)
        repo = RepositorioUsuariosDjango()
        usuario = repo.buscar_por_identificador(datos.validated_data["identificador"])
        if usuario:
            usuario = authenticate(request, correo=usuario.correo, password=datos.validated_data["password"])
        if not usuario:
            # Mensaje único: no revela si el usuario existe.
            return Response({"codigo": "credenciales", "mensaje": "Usuario o contraseña incorrectos."}, status=400)
        login(request, usuario)
        return Response(asdict(_servicio().perfil(usuario)))

    def delete(self, request):
        logout(request)
        return Response(status=status.HTTP_204_NO_CONTENT)
