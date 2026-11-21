from rest_framework.routers import DefaultRouter
from .views import (
    MasterAbsenceViewSet,
    MasterServiceViewSet,
    MasterViewSet,
    WorkScheduleViewSet,
)

router = DefaultRouter()

# Важно: пустой префикс MasterViewSet должен быть последним,
# иначе он перехватывает /master-services/, /schedules/ и /absences/
# как детальный маршрут мастера.
router.register(
    "master-services",
    MasterServiceViewSet,
    basename="master-service",
)
router.register(
    "schedules",
    WorkScheduleViewSet,
    basename="schedule",
)
router.register(
    "absences",
    MasterAbsenceViewSet,
    basename="absence",
)
router.register("", MasterViewSet, basename="master")

urlpatterns = router.urls