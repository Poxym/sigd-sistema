"""Modelos base que heredan todos los módulos. Este app no define tablas propias
salvo idempotency_keys (pendiente: ver docs/MODULOS.md)."""
from datetime import date

from django.db import models

from .ids import nuevo_id


class ModeloBase(models.Model):
    """Llave primaria de texto con UUID v7."""

    id = models.CharField(primary_key=True, max_length=36, default=nuevo_id, editable=False)

    class Meta:
        abstract = True


class ConVigencia(models.Model):
    """Vigencia = fecha de inicio + fecha de fin opcional (datatype «Vigencia» del diagrama v3).

    {una vigente}: garantizarlo con restricción en BD (UniqueConstraint con condition), no solo en código.
    """

    inicio = models.DateField()
    fin = models.DateField(null=True, blank=True)

    class Meta:
        abstract = True

    def esta_vigente(self, fecha: date) -> bool:
        return self.inicio <= fecha and (self.fin is None or fecha <= self.fin)

    def se_traslapa_con(self, otra: "ConVigencia") -> bool:
        fin_a = self.fin or date.max
        fin_b = otra.fin or date.max
        return self.inicio <= fin_b and otra.inicio <= fin_a
