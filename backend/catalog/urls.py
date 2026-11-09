from rest_framework.routers import DefaultRouter

from .views import (
    ServiceCategoryViewSet,
    ServiceViewSet,
    WorkplaceViewSet,
)

router = DefaultRouter()
router.register("categories", ServiceCategoryViewSet, basename="category")
router.register("services", ServiceViewSet, basename="service")
router.register("workplaces", WorkplaceViewSet, basename="workplace")

urlpatterns = router.urls