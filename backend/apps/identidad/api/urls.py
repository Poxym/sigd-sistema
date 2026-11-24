from django.urls import path

from .views import SesionView

urlpatterns = [path("sesion/", SesionView.as_view(), name="sesion")]
