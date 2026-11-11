from rest_framework import serializers

from catalog.models import Service
from masters.models import Master
from catalog.models import Workplace

from .models import Booking, BookingHistory,BookingService
from .services import create_booking


class BookingServiceReadSerializer(serializers.ModelSerializer):
    service_id = serializers.IntegerField(
        source="service.id",
        read_only=True,
    )
    service_name = serializers.CharField(
        source="service.name",
        read_only=True,
    )

    class Meta:
        model = BookingService
        fields = (
            "service_id",
            "service_name",
            "price",
            "duration_min",
        )


class BookingSerializer(serializers.ModelSerializer):
    service_ids = serializers.PrimaryKeyRelatedField(
        queryset=Service.objects.filter(is_active=True),
        many=True,
        write_only=True,
    )
    services = BookingServiceReadSerializer(
        source="booking_services",
        many=True,
        read_only=True,
    )

    class Meta:
        model = Booking
        fields = (
            "id",
            "client",
            "master",
            "workplace",
            "service_ids",
            "services",
            "start_at",
            "end_at",
            "status",
            "total_price",
            "comment",
            "created_at",
        )
        read_only_fields = (
            "id",
            "client",
            "end_at",
            "status",
            "total_price",
            "created_at",
            "services",
        )

    def validate(self, attrs):
        master = attrs["master"]
        workplace = attrs["workplace"]
        services = attrs["service_ids"]

        if not master.is_active:
            raise serializers.ValidationError(
                {"master": "Мастер сейчас недоступен."}
            )

        if not workplace.is_active:
            raise serializers.ValidationError(
                {"workplace": "Рабочее место сейчас недоступно."}
            )

        if not services:
            raise serializers.ValidationError(
                {"service_ids": "Добавьте хотя бы одну услугу."}
            )

        return attrs

    def create(self, validated_data):
        services = validated_data.pop("service_ids")
        client = self.context["request"].user

        return create_booking(
            client=client,
            services=services,
            **validated_data,
        )


class BookingHistorySerializer(serializers.ModelSerializer):
    changed_by_email = serializers.EmailField(
        source="changed_by.email",
        read_only=True,
    )

    class Meta:
        model = BookingHistory
        fields = (
            "id",
            "from_status",
            "to_status",
            "changed_by",
            "changed_by_email",
            "changed_at",
            "comment",
        )
        read_only_fields = fields


class BookingStatusSerializer(serializers.Serializer):
    status = serializers.ChoiceField(
        choices=Booking.Status.choices,
    )
    comment = serializers.CharField(
        required=False,
        allow_blank=True,
        default="",
    )