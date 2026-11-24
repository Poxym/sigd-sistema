from datetime import date

from apps.core.excepciones import NoEncontrado, ReglaNegocio

from .models import Periodo
from .repositorios import RepositorioPeriodos


class ServicioPeriodos:
    def __init__(self, periodos: RepositorioPeriodos):
        self.periodos = periodos

    def listar(self) -> list[Periodo]:
        return self.periodos.listar()

    def vigente(self, fecha: date | None = None) -> Periodo:
        periodo = self.periodos.vigente_en(fecha or date.today())
        if periodo is None:
            raise NoEncontrado("No hay un periodo vigente para la fecha indicada.")
        return periodo

    def crear(self, *, clave: str, inicio: date, fin: date, **opcionales) -> Periodo:
        if fin <= inicio:
            raise ReglaNegocio("La fecha de fin debe ser posterior a la de inicio.")
        if self.periodos.buscar_por_clave(clave):
            raise ReglaNegocio("Ya existe un periodo con esa clave.", clave=clave)
        choques = self.periodos.traslapados(inicio, fin)
        if choques:
            raise ReglaNegocio("Las fechas se traslapan con otro periodo.", con=[p.clave for p in choques])
        return self.periodos.guardar(Periodo(clave=clave, inicio=inicio, fin=fin, **opcionales))
