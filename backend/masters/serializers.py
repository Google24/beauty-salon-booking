from django.contrib.auth import get_user_model
from rest_framework import serializers

from catalog.models import Service

from .models import Master, MasterAbsence, MasterService, WorkSchedule

User = get_user_model()


class MasterServiceSerializer(serializers.ModelSerializer):
    service_name = serializers.CharField(
        source="service.name",
        read_only=True,
    )
    master_name = serializers.CharField(
        source="master.display_name",
        read_only=True,
    )

    class Meta:
        model = MasterService
        fields = (
            "id",
            "master",
            "master_name",
            "service",
            "service_name",
            "price_override",
            "duration_override",
        )
        read_only_fields = (
            "id",
            "master_name",
            "service_name",
        )


class MasterServiceShortSerializer(serializers.ModelSerializer):
    id = serializers.IntegerField(source="service.id", read_only=True)
    name = serializers.CharField(source="service.name", read_only=True)
    price = serializers.DecimalField(
        source="service.price",
        max_digits=10,
        decimal_places=2,
        read_only=True,
    )
    duration_min = serializers.IntegerField(
        source="service.duration_min",
        read_only=True,
    )

    class Meta:
        model = Service
        fields = (
            "id",
            "name",
            "price",
            "duration_min",
        )


class MasterSerializer(serializers.ModelSerializer):
    services = MasterServiceShortSerializer(
        many=True,
        read_only=True,
    )

    class Meta:
        model = Master
        fields = (
            "id",
            "display_name",
            "specialization",
            "is_active",
            "info",
            "services",
        )
        read_only_fields = (
            "id",
            "services",
        )


class WorkScheduleSerializer(serializers.ModelSerializer):
    weekday_name = serializers.CharField(
        source="get_weekday_display",
        read_only=True,
    )

    class Meta:
        model = WorkSchedule
        fields = (
            "id",
            "master",
            "weekday",
            "weekday_name",
            "start_time",
            "end_time",
            "is_day_off",
        )
        read_only_fields = (
            "id",
            "weekday_name",
        )


class MasterAbsenceSerializer(serializers.ModelSerializer):
    reason_name = serializers.CharField(
        source="get_reason_display",
        read_only=True,
    )

    class Meta:
        model = MasterAbsence
        fields = (
            "id",
            "master",
            "start_date",
            "end_date",
            "reason",
            "reason_name",
            "comment",
        )
        read_only_fields = (
            "id",
            "reason_name",
        )