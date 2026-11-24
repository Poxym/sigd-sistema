"""Sesión del usuario y módulos a los que tiene acceso."""
from dataclasses import dataclass
from datetime import date

from .repositorios import RepositorioUsuarios

# Qué módulos ve cada rol. Tomado de las cuentas del prototipo v17 (USERS/mods).
# PENDIENTE: confirmar códigos de rol con el cliente (enum AccionPermiso «por definir»).
MODULOS_POR_ROL = {
    "DOCENTE": ["plan", "informe"],
    "JEFE_CARRERA": ["plan", "informe", "reportes"],
    "VICERRECTORIA": ["reportes"],
    "RECTORIA": ["reportes"],
    "SECRETARIA_ACADEMICA": ["reportes"],
    "REPRESENTANTE_INSTITUCIONAL": ["reportes"],
    "ADMINISTRADOR": ["admin"],
}
ORDEN_MODULOS = ["admin", "plan", "informe", "reportes"]


@dataclass
class PerfilSesion:
    id: str
    nombre: str
    correo: str
    numero_empleado: str
    roles: list[str]
    modulos: list[str]


class ServicioSesion:
    def __init__(self, usuarios: RepositorioUsuarios):
        self.usuarios = usuarios

    def perfil(self, usuario, hoy: date | None = None) -> PerfilSesion:
        roles = self.usuarios.codigos_de_rol_vigentes(usuario.id, hoy or date.today())
        modulos = {m for r in roles for m in MODULOS_POR_ROL.get(r, [])}
        return PerfilSesion(
            id=usuario.id,
            nombre=usuario.nombre_completo(),
            correo=usuario.correo,
            numero_empleado=usuario.numero_empleado,
            roles=roles,
            modulos=[m for m in ORDEN_MODULOS if m in modulos],
        )
