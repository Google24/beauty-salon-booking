from django.contrib import admin

from .models import Booking, BookingHistory, BookingService


class BookingServiceInline(admin.TabularInline):
    model = BookingService
    extra = 1


class BookingHistoryInline(admin.TabularInline):
    model = BookingHistory
    extra = 0
    readonly_fields = (
        "from_status",
        "to_status",
        "changed_by",
        "changed_at",
        "comment",
    )
    can_delete = False


@admin.register(Booking)
class BookingAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "client",
        "master",
        "workplace",
        "start_at",
        "end_at",
        "status",
        "total_price",
    )
    list_filter = (
        "status",
        "master",
        "workplace",
        "start_at",
    )
    search_fields = (
        "client__email",
        "client__first_name",
        "client__last_name",
        "master__display_name",
    )
    readonly_fields = (
        "created_at",
        "total_price",
    )
    inlines = (
        BookingServiceInline,
        BookingHistoryInline,
    )


@admin.register(BookingService)
class BookingServiceAdmin(admin.ModelAdmin):
    list_display = (
        "booking",
        "service",
        "price",
        "duration_min",
    )
    list_filter = ("service",)
    search_fields = (
        "booking__client__email",
        "service__name",
    )


@admin.register(BookingHistory)
class BookingHistoryAdmin(admin.ModelAdmin):
    list_display = (
        "booking",
        "from_status",
        "to_status",
        "changed_by",
        "changed_at",
    )
    list_filter = ("from_status", "to_status", "changed_at")
    search_fields = (
        "booking__client__email",
        "changed_by__email",
        "comment",
    )
    readonly_fields = (
        "booking",
        "from_status",
        "to_status",
        "changed_by",
        "changed_at",
        "comment",
    )

# Register your models here.
