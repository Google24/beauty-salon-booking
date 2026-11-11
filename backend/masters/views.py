from django.shortcuts import render
from django.db.models import Prefetch
from rest_framework import permissions, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.filters import SearchFilter
from accounts.permissions import IsAdminOrReadOnly
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
    )

    def get_queryset(self):
        active_master_services  = MasterService.objects.filter(is_active=True)

        queryset = (
            Master.objects
            .select_related("user")
            .prefetch_related(
                Prefetch(
                    "master_services",
                    queryset=active_master_services,
                )
            )
        )

        if self.request.method in permissions.SAFE_METHODS:
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


class WorkScheduleViewSet(viewsets.ModelViewSet):
    queryset = WorkSchedule.objects.select_related("master")
    serializer_class = WorkScheduleSerializer
    permission_classes = (IsAdminOrReadOnly,)

    def get_queryset(self):
        queryset = super().get_queryset()

        master_id = self.request.query_params.get("master")

        if master_id:
            queryset = queryset.filter(master_id=master_id)

        return queryset


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
