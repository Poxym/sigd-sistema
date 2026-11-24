"""Exportación común (propuesta del diagrama v3): ServicioExportacion delega según formato.

Cada módulo que exporta implementa ``Exportable``; los exportadores concretos (PDF, Excel)
se registran una vez. Aún sin implementación: elegir librerías cuando se definan los formatos.
"""
from dataclasses import dataclass, field
from typing import Protocol

from ..enums import FormatoExportacion


@dataclass
class Archivo:
    nombre: str
    tipo_mime: str
    contenido: bytes


@dataclass
class DatosExportacion:
    titulo: str
    secciones: list[dict] = field(default_factory=list)
    tablas: list[dict] = field(default_factory=list)


class Exportable(Protocol):
    def datos_exportacion(self) -> DatosExportacion: ...


class Exportador(Protocol):
    def formato(self) -> FormatoExportacion: ...
    def exportar(self, origen: Exportable) -> Archivo: ...


class ServicioExportacion:
    def __init__(self):
        self._exportadores: dict[str, Exportador] = {}

    def registrar(self, exportador: Exportador) -> None:
        self._exportadores[exportador.formato()] = exportador

    def exportar(self, origen: Exportable, formato: FormatoExportacion) -> Archivo:
        return self._exportadores[formato].exportar(origen)
