from rest_framework import serializers

from ..models import Periodo


class PeriodoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Periodo
        fields = [
            "id", "clave", "inicio", "fin", "semanas_efectivas", "minutos_nominales_semana",
            "minutos_maximos_semana", "aplicar_maximo", "umbral_reprobacion", "estado",
        ]
        read_only_fields = ["id", "estado"]
        # La unicidad y el traslape los valida el servicio (una sola fuente de reglas).
        extra_kwargs = {"clave": {"validators": []}}
