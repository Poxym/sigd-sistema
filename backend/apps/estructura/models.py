"""Estructura académica. Ejemplo implementado: Periodo (tabla periods).

Pendiente: universities, campuses, careers, study_plans, curriculum_semesters, subjects,
curriculum_subjects, capture_windows, groups, course_offerings, teaching_assignments.
"""
from django.db import models

from apps.core.enums import EstadoRegistro
from apps.core.models import ModeloBase


class Periodo(ModeloBase):
    """Periodo académico compartido por todos los módulos (p. ej. «2026-2027 A»)."""

    clave = models.CharField(max_length=20, unique=True)
    inicio = models.DateField()
    fin = models.DateField()
    semanas_efectivas = models.PositiveSmallIntegerField(default=14)
    minutos_nominales_semana = models.PositiveIntegerField(default=2400)  # 40 h
    minutos_maximos_semana = models.PositiveIntegerField(null=True, blank=True)
    aplicar_maximo = models.BooleanField(default=False)
    umbral_reprobacion = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    estado = models.CharField(max_length=20, choices=EstadoRegistro.choices, default=EstadoRegistro.ACTIVO)

    class Meta:
        db_table = "periods"
        ordering = ["-inicio"]
        constraints = [
            models.CheckConstraint(condition=models.Q(fin__gt=models.F("inicio")), name="periodo_fin_despues_de_inicio"),
        ]

    def __str__(self):
        return self.clave
