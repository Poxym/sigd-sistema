from datetime import date

from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APIClient

from ..models import AsignacionRol, Rol, Usuario


class SesionTest(TestCase):
    def setUp(self):
        u = Usuario.objects.create_user("luis@unistmo.example", "Unistmo#2026", numero_empleado="118", nombres="Luis", primer_apellido="López")
        for codigo in ("DOCENTE", "JEFE_CARRERA"):
            AsignacionRol.objects.create(usuario=u, rol=Rol.objects.create(codigo=codigo, nombre=codigo), inicio=date(2026, 1, 1))
        self.c = APIClient()

    def test_login_por_numero_de_empleado_y_modulos(self):
        r = self.c.post(reverse("sesion"), {"identificador": "118", "password": "Unistmo#2026"}, format="json")
        self.assertEqual(r.status_code, 200, r.content)
        self.assertEqual(r.json()["modulos"], ["plan", "informe", "reportes"])
        self.assertEqual(self.c.get(reverse("sesion")).json()["nombre"], "Luis López")

    def test_credenciales_invalidas(self):
        r = self.c.post(reverse("sesion"), {"identificador": "118", "password": "mal"}, format="json")
        self.assertEqual(r.status_code, 400)
