from django.contrib import admin

from .models import Service, ServiceCategory, Workplace


@admin.register(ServiceCategory)
class ServiceCategoryAdmin(admin.ModelAdmin):
    list_display = ("name",)
    search_fields = ("name",)


@admin.register(Service)
class ServiceAdmin(admin.ModelAdmin):
    list_display = (
        "name",
        "category",
        "price",
        "duration_min",
        "buffer_min",
        "is_active",
    )
    list_filter = ("category", "is_active")
    search_fields = ("name", "description")
    list_editable = ("price", "is_active")


@admin.register(Workplace)
class WorkplaceAdmin(admin.ModelAdmin):
    list_display = ("name", "workplace_type", "is_active")
    list_filter = ("workplace_type", "is_active")
    search_fields = ("name",)
    list_editable = ("is_active",)