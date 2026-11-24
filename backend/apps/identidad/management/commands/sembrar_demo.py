"""Cuentas sintéticas del prototipo v17 para desarrollo. Nunca ejecutar en producción."""
from datetime import date

from django.conf import settings
from django.core.management.base import BaseCommand, CommandError

from apps.estructura.models import Periodo
from apps.identidad.models import AsignacionRol, Rol, Usuario

CLAVE = "Unistmo#2026"
CUENTAS = [
    ("209", "ana.ramirez@unistmo.example", "Ana", "Ramírez", ["DOCENTE"]),
    ("118", "luis.lopez@unistmo.example", "Luis", "López", ["DOCENTE", "JEFE_CARRERA"]),
    ("100", "vicerrectoria@unistmo.example", "Vicerrectoría", "", ["VICERRECTORIA"]),
    ("001", "administracion@unistmo.example", "Administración", "institucional", ["ADMINISTRADOR"]),
    ("000", "coordinacion.sigd@unistmo.example", "Coordinación", "SIGD", ["ADMINISTRADOR", "JEFE_CARRERA"]),
]


class Command(BaseCommand):
    help = "Crea cuentas y un periodo de demostración (idempotente)."

    def handle(self, *args, **opts):
        if not settings.DEBUG:
            raise CommandError("Solo disponible con DJANGO_DEBUG=1.")
        for num, correo, nombres, apellido, roles in CUENTAS:
            u, creado = Usuario.objects.get_or_create(
                numero_empleado=num, defaults={"correo": correo, "nombres": nombres, "primer_apellido": apellido}
            )
            if creado:
                u.set_password(CLAVE)
                u.save()
            for codigo in roles:
                rol, _ = Rol.objects.get_or_create(codigo=codigo, defaults={"nombre": codigo.replace("_", " ").title()})
                AsignacionRol.objects.get_or_create(usuario=u, rol=rol, defaults={"inicio": date(2026, 1, 1)})
        Periodo.objects.get_or_create(clave="2026-2027 A", defaults={"inicio": date(2026, 8, 10), "fin": date(2026, 12, 4)})
        self.stdout.write(self.style.SUCCESS(f"Listo. Contraseña de todas las cuentas: {CLAVE}"))
