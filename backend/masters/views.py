from django.shortcuts import render
from django.db.models import Prefetch
from rest_framework import permissions, viewsets, serializers
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.filters import SearchFilter
from accounts.permissions import (
    IsAdminOrMasterForSchedule,
    IsAdminOrReadOnly,
)
from catalog.models import Service
from .models import Master, MasterAbsence, MasterService, WorkSchedule
from .serializers import (
    MasterAbsenceSerializer,
    MasterSerializer,
    MasterServiceSerializer,
    WorkScheduleSerializer,
)


class MasterViewSet(viewsets.ModelViewSet):
    serializer_class = MasterSerializer
    permission_classes = (IsAdminOrReadOnly,)
    filter_backends = (SearchFilter,)
    search_fields = (
        "display_name",
        "specialization",
        "info",
        "user__email",
        "user__first_name",
        "user__last_name",
    )

    def get_queryset(self):
        user = self.request.user
        is_admin = (
            user.is_authenticated
            and (user.role == "admin" or user.is_superuser)
        )

        master_services = MasterService.objects.select_related("service")

        if not is_admin:
            master_services = master_services.filter(service__is_active=True)

        queryset = (
            Master.objects
            .select_related("user")
            .prefetch_related(
                Prefetch(
                    "master_services",
                    queryset=master_services,
                )
            )
        )

        if not is_admin and self.request.method in permissions.SAFE_METHODS:
            queryset = queryset.filter(is_active=True)

        service_id = self.request.query_params.get("service")

        if service_id:
            queryset = queryset.filter(
                master_services__service_id=service_id,
                master_services__service__is_active=True,
            ).distinct()

        return queryset

    @action(
        detail=True,
        methods=("get",),
        url_path="schedule",
    )
    def schedule(self, request, pk=None):
        master = self.get_object()

        schedule = (
            WorkSchedule.objects
            .filter(master=master)
            .order_by("weekday", "start_time")
        )

        serializer = WorkScheduleSerializer(
            schedule,
            many=True,
        )

        return Response(serializer.data)


class MasterServiceViewSet(viewsets.ModelViewSet):
    queryset = MasterService.objects.select_related(
        "master",
        "service",
    )
    serializer_class = MasterServiceSerializer
    permission_classes = (IsAdminOrReadOnly,)

    def get_queryset(self):
        queryset = super().get_queryset()
        master_id = self.request.query_params.get("master")

        if master_id:
            queryset = queryset.filter(master_id=master_id)

        return queryset


class WorkScheduleViewSet(viewsets.ModelViewSet):
    queryset = WorkSchedule.objects.select_related("master", "master__user")
    serializer_class = WorkScheduleSerializer
    permission_classes = (IsAdminOrMasterForSchedule,)

    def get_queryset(self):
        queryset = super().get_queryset()
        user = self.request.user
        master_id = self.request.query_params.get("master")

        if user.is_authenticated and user.role == "master":
            queryset = queryset.filter(master__user=user)
        elif master_id:
            queryset = queryset.filter(master_id=master_id)

        return queryset
    def perform_create(self, serializer):
        user = self.request.user

        if user.role == "master":
            try:
                master = user.master_profile
            except Master.DoesNotExist:
                raise serializers.ValidationError(
                    {
                        "master": (
                            "Для пользователя не создан профиль мастера."
                        )
                    }
                )

            serializer.save(master=master)
            return

        serializer.save()


class MasterAbsenceViewSet(viewsets.ModelViewSet):
    queryset = MasterAbsence.objects.select_related("master")
    serializer_class = MasterAbsenceSerializer
    permission_classes = (IsAdminOrReadOnly,)

    def get_queryset(self):
        queryset = super().get_queryset()

        master_id = self.request.query_params.get("master")

        if master_id:
            queryset = queryset.filter(master_id=master_id)

        return queryset
