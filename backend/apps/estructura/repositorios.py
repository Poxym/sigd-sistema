"""Ejemplo de referencia del patrón repositorio. Copiar esta forma en los demás módulos."""
from dataclasses import replace
from datetime import date
from typing import Optional, Protocol

from apps.core.repositorios import RepositorioDjango, RepositorioMemoria

from .models import Periodo


class RepositorioPeriodos(Protocol):
    """Interfaz: lo que el servicio necesita, con nombres de negocio."""

    def listar(self) -> list[Periodo]: ...
    def obtener(self, id: str) -> Periodo: ...
    def buscar_por_clave(self, clave: str) -> Optional[Periodo]: ...
    def vigente_en(self, fecha: date) -> Optional[Periodo]: ...
    def traslapados(self, inicio: date, fin: date, excluir_id: str | None = None) -> list[Periodo]: ...
    def guardar(self, periodo: Periodo) -> Periodo: ...


class RepositorioPeriodosDjango(RepositorioDjango[Periodo]):
    modelo = Periodo

    def buscar_por_clave(self, clave):
        return self._qs().filter(clave=clave).first()

    def vigente_en(self, fecha):
        return self._qs().filter(inicio__lte=fecha, fin__gte=fecha).first()

    def traslapados(self, inicio, fin, excluir_id=None):
        qs = self._qs().filter(inicio__lte=fin, fin__gte=inicio)
        if excluir_id:
            qs = qs.exclude(pk=excluir_id)
        return list(qs)


class RepositorioPeriodosMemoria(RepositorioMemoria[Periodo]):
    """Para pruebas de servicio sin base de datos."""

    def buscar_por_clave(self, clave):
        return next((p for p in self._datos.values() if p.clave == clave), None)

    def vigente_en(self, fecha):
        return next((p for p in self._datos.values() if p.inicio <= fecha <= p.fin), None)

    def traslapados(self, inicio, fin, excluir_id=None):
        return [p for p in self._datos.values() if p.inicio <= fin and inicio <= p.fin and p.id != excluir_id]
