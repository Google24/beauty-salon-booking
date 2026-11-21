from django.urls import path
from rest_framework.routers import DefaultRouter
from .views import (
    AvailableSlotsView,
    BookingViewSet,
    PublicReviewViewSet,
    ReviewViewSet,
)

router = DefaultRouter()
router.register("bookings", BookingViewSet, basename="booking")
router.register("reviews", ReviewViewSet, basename="review")
router.register("public-reviews", PublicReviewViewSet, basename="public-review")

urlpatterns = [
    path("slots/", AvailableSlotsView.as_view(), name="available-slots"),
]

urlpatterns += router.urls