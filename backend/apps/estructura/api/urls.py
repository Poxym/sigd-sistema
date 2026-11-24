from django.urls import path

from .views import PeriodosView, PeriodoVigenteView

urlpatterns = [
    path("periodos/", PeriodosView.as_view(), name="periodos"),
    path("periodos/vigente/", PeriodoVigenteView.as_view(), name="periodo-vigente"),
]
