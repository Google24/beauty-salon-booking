from rest_framework import serializers
from catalog.models import Service
from .models import Booking, BookingHistory,BookingService, Review
from .services import create_booking

class AvailableSlotSerializer(serializers.Serializer):
    start_at = serializers.DateTimeField()
    end_at = serializers.DateTimeField()
    workplace_id = serializers.IntegerField()
    workplace_name = serializers.CharField()

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
    client_email = serializers.EmailField(
        source="client.email",
        read_only=True,
    )
    client_first_name = serializers.CharField(
        source="client.first_name",
        read_only=True,
    )
    client_last_name = serializers.CharField(
        source="client.last_name",
        read_only=True,
    )
    client_name = serializers.SerializerMethodField()
    master_name = serializers.CharField(
        source="master.display_name",
        read_only=True,
    )
    workplace_name = serializers.CharField(
        source="workplace.name",
        read_only=True,
    )
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
            "client_email",
            "client_first_name",
            "client_last_name",
            "client_name",            
            "master",
            "master_name",
            "workplace",
            "workplace_name",
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
    def get_client_name(self, obj) -> str:
        return obj.client.full_name

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
        master = validated_data.pop("master")
        workplace = validated_data.pop("workplace")
        client = self.context["request"].user

        return create_booking(
            client=client,
            master_id=master.id,
            workplace_id=workplace.id,
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


class ReviewSerializer(serializers.ModelSerializer):
    class Meta:
        model = Review
        fields = (
            "id",
            "booking",
            "rating",
            "text",
            "created_at",
        )
        read_only_fields = (
            "id",
            "booking",
            "created_at",
        )
    def validate_rating(self, value):
        if value < 1 or value > 5:
            raise serializers.ValidationError(
                "Оценка должна быть от 1 до 5."
            )
        return value
    
class BookingStatusSerializer(serializers.Serializer):
    status = serializers.ChoiceField(
        choices=Booking.Status.choices,
    )
    comment = serializers.CharField(
        required=False,
        allow_blank=True,
        default="",
    )