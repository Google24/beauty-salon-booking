from django.contrib import admin
from .models import Master, MasterAbsence, MasterService, WorkSchedule


class MasterServiceInline(admin.TabularInline):
    model = MasterService
    extra = 1


class WorkScheduleInline(admin.TabularInline):
    model = WorkSchedule
    extra = 0


class MasterAbsenceInline(admin.TabularInline):
    model = MasterAbsence
    extra = 0


@admin.register(Master)
class MasterAdmin(admin.ModelAdmin):
    list_display = (
        "display_name",
        "user",
        "specialization",
        "is_active",
    )
    list_filter = ("specialization", "is_active")
    search_fields = (
        "display_name",
        "user__email",
        "user__first_name",
        "user__last_name",
    )
    list_editable = ("is_active",)
    inlines = (
        MasterServiceInline,
        WorkScheduleInline,
        MasterAbsenceInline,
    )


@admin.register(MasterService)
class MasterServiceAdmin(admin.ModelAdmin):
    list_display = (
        "master",
        "service",
        "price_override",
        "duration_override",
    )
    list_filter = ("service",)
    search_fields = (
        "master__display_name",
        "service__name",
    )


@admin.register(WorkSchedule)
class WorkScheduleAdmin(admin.ModelAdmin):
    list_display = (
        "master",
        "weekday",
        "start_time",
        "end_time",
        "is_day_off",
    )
    list_filter = ("weekday", "is_day_off", "master")
    search_fields = ("master__display_name",)


@admin.register(MasterAbsence)
class MasterAbsenceAdmin(admin.ModelAdmin):
    list_display = (
        "master",
        "start_date",
        "end_date",
        "reason",
    )
    list_filter = ("reason", "master")
    search_fields = ("master__display_name", "comment")