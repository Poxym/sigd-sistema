from rest_framework.response import Response
from rest_framework.views import exception_handler

from ..excepciones import ErrorDominio


def manejador_errores(exc, context):
    """Traduce ErrorDominio a una respuesta JSON uniforme: {codigo, mensaje, detalle}."""
    if isinstance(exc, ErrorDominio):
        return Response(
            {"codigo": exc.codigo, "mensaje": exc.mensaje, "detalle": exc.detalle},
            status=exc.estado_http,
        )
    return exception_handler(exc, context)
