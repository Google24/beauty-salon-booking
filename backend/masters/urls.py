from rest_framework.routers import DefaultRouter
from .views import (
    MasterAbsenceViewSet,
    MasterServiceViewSet,
    MasterViewSet,
    WorkScheduleViewSet,
)

router = DefaultRouter()

router.register("masters", MasterViewSet, basename="master")
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

urlpatterns = router.urls