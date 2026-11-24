from django.http import JsonResponse
from django.urls import path
from django.views.decorators.http import require_GET


@require_GET
def salud(_request):
    return JsonResponse({"estado": "ok"})


urlpatterns = [path("salud/", salud, name="salud")]
