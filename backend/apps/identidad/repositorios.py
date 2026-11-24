from datetime import date
from typing import Optional, Protocol

from django.db.models import Q

from apps.core.repositorios import RepositorioDjango

from .models import AsignacionRol, Usuario


class RepositorioUsuarios(Protocol):
    def buscar_por_identificador(self, identificador: str) -> Optional[Usuario]: ...
    def codigos_de_rol_vigentes(self, usuario_id: str, fecha: date) -> list[str]: ...


class RepositorioUsuariosDjango(RepositorioDjango[Usuario]):
    modelo = Usuario

    def buscar_por_identificador(self, identificador: str) -> Optional[Usuario]:
        """Número de empleado o correo institucional (como en la pantalla de acceso)."""
        ident = identificador.strip()
        return self._qs().filter(Q(numero_empleado=ident) | Q(correo__iexact=ident)).first()

    def codigos_de_rol_vigentes(self, usuario_id: str, fecha: date) -> list[str]:
        qs = AsignacionRol.objects.filter(usuario_id=usuario_id, inicio__lte=fecha, rol__activo=True)
        qs = qs.filter(Q(fin__isnull=True) | Q(fin__gte=fecha))
        return sorted(set(qs.values_list("rol__codigo", flat=True)))
