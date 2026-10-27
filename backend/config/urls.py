from django.contrib import admin
from django.urls import path
from django.http import JsonResponse


def health_endpoint(request):
    return JsonResponse({"status": "ok"})


urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/health/', health_endpoint),
]