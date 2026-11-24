from rest_framework import serializers


class CredencialesSerializer(serializers.Serializer):
    identificador = serializers.CharField(help_text="Número de empleado o correo institucional")
    password = serializers.CharField(trim_whitespace=False)
