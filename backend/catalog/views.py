from django.shortcuts import render
from rest_framework import permissions, viewsets
from rest_framework.filters import SearchFilter

from accounts.permissions import IsAdmin

from .models import Service, ServiceCategory, Workplace
from .serializers import (
    ServiceCategorySerializer,
    ServiceSerializer,
    WorkplaceSerializer,
)


class AdminWritePublicReadMixin:
    def get_permissions(self):
        if self.request.method in permissions.SAFE_METHODS:
            return [permissions.AllowAny()]

        return [IsAdmin()]

def user_is_admin(request):
    user = getattr(request, "user", None)
    return bool(
        user
        and user.is_authenticated
        and (user.role == "admin" or user.is_superuser)
    )
def parse_bool(value):
    if value is None:
        return None
    return str(value).strip().lower() in ("1", "true", "yes", "on")


class ServiceCategoryViewSet(
    AdminWritePublicReadMixin,
    viewsets.ModelViewSet,
):
    serializer_class = ServiceCategorySerializer
    filter_backends = (SearchFilter,)
    search_fields = ("name",)
    def get_queryset(self):
        queryset = ServiceCategory.objects.all()

        if not user_is_admin(self.request):
            return queryset.filter(services__is_active=True).distinct()

        return queryset


class ServiceViewSet(
    AdminWritePublicReadMixin,
    viewsets.ModelViewSet,
):
    serializer_class = ServiceSerializer
    filter_backends = (SearchFilter,)
    search_fields = ("name", "description")

    def get_queryset(self):
        queryset = Service.objects.select_related("category")

        if not user_is_admin(self.request):
            queryset = queryset.filter(is_active=True)

        category_id = self.request.query_params.get("category")

        if category_id:
            queryset = queryset.filter(category_id=category_id)

        is_active = parse_bool(self.request.query_params.get("is_active"))
        
        if is_active is not None:
            queryset = queryset.filter(is_active=is_active)

        return queryset


class WorkplaceViewSet(
    AdminWritePublicReadMixin,
    viewsets.ModelViewSet,
):
    serializer_class = WorkplaceSerializer
    filter_backends = (SearchFilter,)
    search_fields = ("name",)

    def get_queryset(self):
        queryset = Workplace.objects.all()

        if not user_is_admin(self.request):
            queryset = queryset.filter(is_active=True)
        
        is_active = parse_bool(self.request.query_params.get("is_active"))
        
        if is_active is not None:
            queryset = queryset.filter(is_active=is_active)



        return queryset