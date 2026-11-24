"""Patrón repositorio.

Capas de cada módulo:  api (vistas)  →  servicios  →  repositorios  →  models (ORM)

* Un **repositorio** es la única pieza que toca el ORM. Expone operaciones con nombre de negocio
  (``buscar_vigente``, ``guardar``), nunca QuerySets hacia fuera.
* Cada repositorio tiene una **interfaz** (Protocol) y al menos dos implementaciones: la de Django
  (producción) y una en memoria (pruebas rápidas de servicios sin base de datos).
* Los **servicios** reciben el repositorio por el constructor: no lo crean ellos.
"""
from typing import Generic, Iterable, Optional, Protocol, TypeVar

from django.db import models

from .excepciones import NoEncontrado

T = TypeVar("T")
M = TypeVar("M", bound=models.Model)


class Repositorio(Protocol[T]):
    def obtener(self, id: str) -> T: ...
    def buscar(self, id: str) -> Optional[T]: ...
    def listar(self) -> list[T]: ...
    def guardar(self, entidad: T) -> T: ...
    def eliminar(self, id: str) -> None: ...


class RepositorioDjango(Generic[M]):
    """Implementación base sobre el ORM. Las subclases fijan ``modelo`` y agregan consultas propias."""

    modelo: type[M]

    def _qs(self):
        return self.modelo.objects.all()

    def buscar(self, id: str) -> Optional[M]:
        return self._qs().filter(pk=id).first()

    def obtener(self, id: str) -> M:
        obj = self.buscar(id)
        if obj is None:
            raise NoEncontrado(f"{self.modelo._meta.verbose_name} no encontrado", id=id)
        return obj

    def listar(self) -> list[M]:
        return list(self._qs())

    def guardar(self, entidad: M) -> M:
        entidad.full_clean()
        entidad.save()
        return entidad

    def eliminar(self, id: str) -> None:
        self._qs().filter(pk=id).delete()


class RepositorioMemoria(Generic[T]):
    """Doble de pruebas: guarda objetos en un diccionario por ``id``."""

    def __init__(self, iniciales: Iterable[T] = ()):
        self._datos: dict[str, T] = {getattr(x, "id"): x for x in iniciales}

    def buscar(self, id: str) -> Optional[T]:
        return self._datos.get(id)

    def obtener(self, id: str) -> T:
        obj = self.buscar(id)
        if obj is None:
            raise NoEncontrado("Registro no encontrado", id=id)
        return obj

    def listar(self) -> list[T]:
        return list(self._datos.values())

    def guardar(self, entidad: T) -> T:
        self._datos[getattr(entidad, "id")] = entidad
        return entidad

    def eliminar(self, id: str) -> None:
        self._datos.pop(id, None)
