from rest_framework import serializers

from .models import Service, ServiceCategory, Workplace


class ServiceCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = ServiceCategory
        fields = (
            "id",
            "name",
        )


class ServiceSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(
        source="category.name",
        read_only=True,
    )

    class Meta:
        model = Service
        fields = (
            "id",
            "name",
            "description",
            "price",
            "duration_min",
            "buffer_min",
            "category",
            "category_name",
            "is_active",
            "created_at",
        )
        read_only_fields = (
            "id",
            "created_at",
        )


class WorkplaceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Workplace
        fields = (
            "id",
            "name",
            "workplace_type",
            "is_active",
        )