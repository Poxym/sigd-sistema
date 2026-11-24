from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.identidad.permisos import acceso_a_modulo

from ..repositorios import RepositorioPeriodosDjango
from ..servicios import ServicioPeriodos
from .serializers import PeriodoSerializer


def servicio() -> ServicioPeriodos:
    """Punto único donde se elige la implementación del repositorio."""
    return ServicioPeriodos(RepositorioPeriodosDjango())


class PeriodosView(APIView):
    def get_permissions(self):
        # Todos los módulos leen periodos; solo Administración los crea.
        if self.request.method == "POST":
            return [IsAuthenticated(), acceso_a_modulo("admin")()]
        return [IsAuthenticated()]

    def get(self, request):
        return Response(PeriodoSerializer(servicio().listar(), many=True).data)

    def post(self, request):
        entrada = PeriodoSerializer(data=request.data)
        entrada.is_valid(raise_exception=True)
        periodo = servicio().crear(**entrada.validated_data)
        return Response(PeriodoSerializer(periodo).data, status=201)


class PeriodoVigenteView(APIView):
    def get(self, request):
        return Response(PeriodoSerializer(servicio().vigente()).data)
