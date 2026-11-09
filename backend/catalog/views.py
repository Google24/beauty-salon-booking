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


class ServiceCategoryViewSet(
    AdminWritePublicReadMixin,
    viewsets.ModelViewSet,
):
    serializer_class = ServiceCategorySerializer

    def get_queryset(self):
        queryset = ServiceCategory.objects.all()

        if self.request.method in permissions.SAFE_METHODS:
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

        if self.request.method in permissions.SAFE_METHODS:
            queryset = queryset.filter(is_active=True)

        category_id = self.request.query_params.get("category")

        if category_id:
            queryset = queryset.filter(category_id=category_id)

        return queryset


class WorkplaceViewSet(
    AdminWritePublicReadMixin,
    viewsets.ModelViewSet,
):
    serializer_class = WorkplaceSerializer

    def get_queryset(self):
        queryset = Workplace.objects.all()

        if self.request.method in permissions.SAFE_METHODS:
            return queryset.filter(is_active=True)

        return queryset