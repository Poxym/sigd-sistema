"""Enumeraciones comunes del diagrama de clases general v3.

Las marcadas «por definir con el cliente» en el diagrama (EstadoPeriodo, CicloEscolar, TipoGrupo,
EjeSustantivo, AccionPermiso, AccionBitacora, ...) se agregan cuando se confirmen sus valores.
"""
from django.db import models


class EstadoRegistro(models.TextChoices):
    ACTIVO = "ACTIVO"
    INACTIVO = "INACTIVO"


class EstadoUsuario(models.TextChoices):
    ACTIVO = "ACTIVO"
    INACTIVO = "INACTIVO"
    BLOQUEADO = "BLOQUEADO"


class EstadoCaptura(models.TextChoices):
    PROGRAMADA = "PROGRAMADA"
    ABIERTA = "ABIERTA"
    BLOQUEADA = "BLOQUEADA"
    CERRADA = "CERRADA"


class EstadoDocumento(models.TextChoices):
    BORRADOR = "BORRADOR"
    ENVIADO = "ENVIADO"
    DEVUELTO = "DEVUELTO"
    APROBADO = "APROBADO"


class EstadoSeccion(models.TextChoices):
    PENDIENTE = "PENDIENTE"
    SIN_ACTIVIDAD = "SIN_ACTIVIDAD"
    CONFIRMADA = "CONFIRMADA"


class TipoDocumento(models.TextChoices):
    PLAN = "PLAN"
    INFORME = "INFORME"


class Alcance(models.TextChoices):
    INSTITUCIONAL = "INSTITUCIONAL"
    CAMPUS = "CAMPUS"
    CARRERA = "CARRERA"


class Modulo(models.TextChoices):
    ADMINISTRACION = "ADMINISTRACION"
    PLAN = "PLAN"
    INFORME = "INFORME"
    REPORTES = "REPORTES"


class FormatoExportacion(models.TextChoices):
    PDF = "PDF"
    EXCEL = "EXCEL"
