from datetime import date

from django.test import SimpleTestCase, TestCase
from django.urls import reverse
from rest_framework.test import APIClient

from apps.core.excepciones import ReglaNegocio
from apps.identidad.models import AsignacionRol, Rol, Usuario

from ..models import Periodo
from ..repositorios import RepositorioPeriodosMemoria
from ..servicios import ServicioPeriodos


class ServicioPeriodosTest(SimpleTestCase):
    """Reglas de negocio con repositorio en memoria: sin base de datos."""

    def setUp(self):
        self.repo = RepositorioPeriodosMemoria([Periodo(id="p1", clave="2025-2026 B", inicio=date(2026, 2, 9), fin=date(2026, 6, 12))])
        self.servicio = ServicioPeriodos(self.repo)

    def test_rechaza_traslape(self):
        with self.assertRaises(ReglaNegocio):
            self.servicio.crear(clave="X", inicio=date(2026, 6, 1), fin=date(2026, 12, 1))

    def test_rechaza_clave_repetida(self):
        with self.assertRaises(ReglaNegocio):
            self.servicio.crear(clave="2025-2026 B", inicio=date(2027, 1, 1), fin=date(2027, 6, 1))

    def test_crea_y_encuentra_vigente(self):
        p = self.servicio.crear(clave="2026-2027 A", inicio=date(2026, 8, 10), fin=date(2026, 12, 4))
        self.assertEqual(self.servicio.vigente(date(2026, 11, 23)).clave, p.clave)


class PeriodosApiTest(TestCase):
    def setUp(self):
        self.cliente = APIClient()
        self.admin = Usuario.objects.create_user("admin@unistmo.example", "x", numero_empleado="001", nombres="Admin", primer_apellido="SIGD")
        rol = Rol.objects.create(codigo="ADMINISTRADOR", nombre="Administrador")
        AsignacionRol.objects.create(usuario=self.admin, rol=rol, inicio=date(2026, 1, 1))
        self.docente = Usuario.objects.create_user("ana@unistmo.example", "x", numero_empleado="209", nombres="Ana", primer_apellido="Ramírez")

    def test_docente_no_puede_crear(self):
        self.cliente.force_authenticate(self.docente)
        r = self.cliente.post(reverse("periodos"), {"clave": "A", "inicio": "2026-08-10", "fin": "2026-12-04"})
        self.assertEqual(r.status_code, 403)

    def test_admin_crea_y_traslape_da_422(self):
        self.cliente.force_authenticate(self.admin)
        r = self.cliente.post(reverse("periodos"), {"clave": "2026-2027 A", "inicio": "2026-08-10", "fin": "2026-12-04"})
        self.assertEqual(r.status_code, 201, r.content)
        r = self.cliente.post(reverse("periodos"), {"clave": "B", "inicio": "2026-12-01", "fin": "2027-03-01"})
        self.assertEqual(r.status_code, 422)
        self.assertEqual(r.json()["codigo"], "regla_negocio")
