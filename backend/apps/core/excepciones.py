"""Errores del dominio. Los servicios los lanzan; la API los traduce a HTTP (api/errores.py).
Así ningún servicio conoce HTTP ni DRF."""


class ErrorDominio(Exception):
    codigo = "error_dominio"
    estado_http = 400

    def __init__(self, mensaje: str, **detalle):
        super().__init__(mensaje)
        self.mensaje = mensaje
        self.detalle = detalle


class NoEncontrado(ErrorDominio):
    codigo = "no_encontrado"
    estado_http = 404


class ReglaNegocio(ErrorDominio):
    codigo = "regla_negocio"
    estado_http = 422


class ConflictoVersion(ErrorDominio):
    """Concurrencia optimista: alguien guardó antes (guardar(plan, versionEsperada))."""

    codigo = "conflicto_version"
    estado_http = 409


class SinPermiso(ErrorDominio):
    codigo = "sin_permiso"
    estado_http = 403
