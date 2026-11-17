from django.urls import path
from rest_framework.routers import DefaultRouter

from .views import (
    AdminUserViewSet,
    ChangePasswordView,
    LoginView,
    MeView,
    RefreshTokenView,
    RegisterView,
)

app_name = "accounts"
router = DefaultRouter()
router.register("users", AdminUserViewSet, basename="admin-user")

urlpatterns = [
    path("register/", RegisterView.as_view(), name="register"),
    path("login/", LoginView.as_view(), name="login"),
    path(
        "token/refresh/",
        RefreshTokenView.as_view(),
        name="token_refresh",
    ),
    path("me/", MeView.as_view(), name="me"),
    path(
        "change-password/",
        ChangePasswordView.as_view(),
        name="change_password",
    ),
]
urlpatterns += router.urls