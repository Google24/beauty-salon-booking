from datetime import date, datetime, timedelta
from decimal import Decimal

from django.conf import settings
from django.db import transaction
from django.db.models import Q
from django.utils import timezone
from rest_framework.exceptions import ValidationError

from catalog.models import Service, Workplace
from masters.models import Master, MasterAbsence, MasterService, WorkSchedule

from .models import Booking, BookingHistory, BookingService


ACTIVE_BOOKING_STATUSES = (
    Booking.Status.NEW,
    Booking.Status.CONFIRMED,
    Booking.Status.IN_PROGRESS,
)


def make_datetime(day, current_time):
    value = datetime.combine(day, current_time)

    if settings.USE_TZ:
        return timezone.make_aware(value)

    return value


def calculate_services(master, services):
    service_ids = [service.id for service in services]

    if len(service_ids) != len(set(service_ids)):
        raise ValidationError(
            {"service_ids": "Одну и ту же услугу нельзя добавить дважды."}
        )

    master_services = {
        item.service_id: item
        for item in MasterService.objects.select_related("service").filter(
            master=master,
            service_id__in=service_ids,
        )
    }

    missing_ids = set(service_ids) - set(master_services)

    if missing_ids:
        raise ValidationError(
            {
                "service_ids": (
                    "Мастер не оказывает одну или несколько выбранных услуг."
                )
            }
        )

    total_duration = 0
    total_price = Decimal("0.00")

    for service in services:
        master_service = master_services[service.id]

        duration = (
            master_service.duration_override
            or service.duration_min
        )
        price = (
            master_service.price_override
            if master_service.price_override is not None
            else service.price
        )

        total_duration += duration + service.buffer_min
        total_price += price

    return total_duration, total_price, master_services


def validate_master_schedule(master, start_at, end_at):
    local_start = (
        timezone.localtime(start_at)
        if timezone.is_aware(start_at)
        else start_at
    )
    local_end = (
        timezone.localtime(end_at)
        if timezone.is_aware(end_at)
        else end_at
    )

    absence_exists = MasterAbsence.objects.filter(
        master=master,
        start_date__lte=local_start.date(),
        end_date__gte=local_start.date(),
    ).exists()

    if absence_exists:
        raise ValidationError(
            "Мастер отсутствует в выбранную дату."
        )

    schedule = WorkSchedule.objects.filter(
        master=master,
        weekday=local_start.weekday(),
        is_day_off=False,
    ).first()

    if schedule is None:
        raise ValidationError(
            "У мастера нет рабочей смены в выбранный день."
        )

    if (
        local_start.time() < schedule.start_time
        or local_end.time() > schedule.end_time
    ):
        raise ValidationError(
            "Выбранное время находится за пределами рабочего графика."
        )


def has_booking_conflict(
    *,
    master_id,
    workplace_id,
    start_at,
    end_at,
    exclude_booking_id=None,
):
    queryset = Booking.objects.filter(
        status__in=ACTIVE_BOOKING_STATUSES,
        start_at__lt=end_at,
        end_at__gt=start_at,
    ).filter(
        Q(master_id=master_id) | Q(workplace_id=workplace_id)
    )

    if exclude_booking_id is not None:
        queryset = queryset.exclude(id=exclude_booking_id)

    return queryset.exists()


@transaction.atomic
def create_booking(
    *,
    client,
    master_id,
    workplace_id,
    services,
    start_at,
    comment="",
):
    try:
        master = (
            Master.objects
            .select_for_update()
            .get(pk=master_id)
        )
    except Master.DoesNotExist:
        raise ValidationError({"master": "Мастер не найден."})

    try:
        workplace = (
            Workplace.objects
            .select_for_update()
            .get(pk=workplace_id)
        )
    except Workplace.DoesNotExist:
        raise ValidationError(
            {"workplace": "Рабочее место не найдено."}
        )

    if not master.is_active:
        raise ValidationError(
            {"master": "Мастер сейчас недоступен."}
        )

    if not workplace.is_active:
        raise ValidationError(
            {"workplace": "Рабочее место сейчас недоступно."}
        )

    total_duration, total_price, master_services = (
        calculate_services(master, services)
    )

    end_at = start_at + timedelta(minutes=total_duration)

    validate_master_schedule(
        master=master,
        start_at=start_at,
        end_at=end_at,
    )

    if has_booking_conflict(
        master_id=master.id,
        workplace_id=workplace.id,
        start_at=start_at,
        end_at=end_at,
    ):
        raise ValidationError(
            "Мастер или рабочее место уже заняты в выбранное время."
        )

    booking = Booking.objects.create(
        client=client,
        master=master,
        workplace=workplace,
        start_at=start_at,
        end_at=end_at,
        total_price=total_price,
        comment=comment,
        status=Booking.Status.NEW,
    )

    booking_services = []

    for service in services:
        master_service = master_services[service.id]

        price = (
            master_service.price_override
            if master_service.price_override is not None
            else service.price
        )
        duration = (
            master_service.duration_override
            or service.duration_min
        )

        booking_services.append(
            BookingService(
                booking=booking,
                service=service,
                price=price,
                duration_min=duration,
            )
        )

    BookingService.objects.bulk_create(booking_services)

    BookingHistory.objects.create(
        booking=booking,
        from_status="",
        to_status=Booking.Status.NEW,
        changed_by=client,
        comment="Запись создана.",
    )

    return booking


def get_available_slots(*, master_id, service_ids, selected_date):
    try:
        master = Master.objects.get(pk=master_id)
    except Master.DoesNotExist:
        raise ValidationError({"master": "Мастер не найден."})

    if not master.is_active:
        return []

    services = list(
        Service.objects.filter(
            id__in=service_ids,
            is_active=True,
        )
    )

    if len(services) != len(set(service_ids)):
        raise ValidationError(
            {"service_ids": "Одна или несколько услуг не найдены."}
        )

    total_duration, _, _ = calculate_services(master, services)

    absence_exists = MasterAbsence.objects.filter(
        master=master,
        start_date__lte=selected_date,
        end_date__gte=selected_date,
    ).exists()

    if absence_exists:
        return []

    schedule = WorkSchedule.objects.filter(
        master=master,
        weekday=selected_date.weekday(),
        is_day_off=False,
    ).first()

    if schedule is None:
        return []

    active_workplaces = list(
        Workplace.objects.filter(is_active=True)
    )

    if not active_workplaces:
        return []

    shift_start = make_datetime(
        selected_date,
        schedule.start_time,
    )
    shift_end = make_datetime(
        selected_date,
        schedule.end_time,
    )

    existing_bookings = list(
        Booking.objects.filter(
            status__in=ACTIVE_BOOKING_STATUSES,
            start_at__lt=shift_end,
            end_at__gt=shift_start,
        )
    )

    slots = []
    current = shift_start
    step = timedelta(minutes=15)
    duration = timedelta(minutes=total_duration)

    while current + duration <= shift_end:
        slot_end = current + duration

        master_busy = any(
            booking.master_id == master.id
            and booking.start_at < slot_end
            and booking.end_at > current
            for booking in existing_bookings
        )

        if not master_busy:
            free_workplace = next(
                (
                    workplace
                    for workplace in active_workplaces
                    if not any(
                        booking.workplace_id == workplace.id
                        and booking.start_at < slot_end
                        and booking.end_at > current
                        for booking in existing_bookings
                    )
                ),
                None,
            )

            if free_workplace is not None:
                slots.append(
                    {
                        "start_at": current,
                        "end_at": slot_end,
                        "workplace_id": free_workplace.id,
                        "workplace_name": free_workplace.name,
                    }
                )

        current += step

    return slots