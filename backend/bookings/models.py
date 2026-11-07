from django.db import models
from django.conf import settings
from django.core.validators import MinValueValidator


class Booking(models.Model):
    class Status(models.TextChoices):
        NEW = "new", "Новая"
        CONFIRMED = "confirmed", "Подтверждена"
        IN_PROGRESS = "in_progress", "В процессе"
        DONE = "done", "Выполнена"
        CANCELLED = "cancelled", "Отменена"
        NO_SHOW = "no_show", "Клиент не пришёл"

    client = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.PROTECT,
        related_name="bookings",
        verbose_name="Клиент",
    )
    master = models.ForeignKey(
        "masters.Master",
        on_delete=models.PROTECT,
        related_name="bookings",
        verbose_name="Мастер",
    )
    workplace = models.ForeignKey(
        "catalog.Workplace",
        on_delete=models.PROTECT,
        related_name="bookings",
        verbose_name="Рабочее место",
    )
    start_at = models.DateTimeField(
        verbose_name="Начало записи",
    )
    end_at = models.DateTimeField(
        verbose_name="Окончание записи",
    )
    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.NEW,
        verbose_name="Статус",
    )
    total_price = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=0,
        validators=[MinValueValidator(0)],
        verbose_name="Итоговая цена",
    )
    comment = models.TextField(
        blank=True,
        default="",
        verbose_name="Комментарий клиента",
    )
    created_at = models.DateTimeField(
        auto_now_add=True,
        verbose_name="Дата создания",
    )

    class Meta:
        verbose_name = "Запись"
        verbose_name_plural = "Записи"
        ordering = ("-start_at",)

    def __str__(self):
        return (
            f"{self.client} — {self.master} — "
            f"{self.start_at:%d.%m.%Y %H:%M}"
        )


class BookingService(models.Model):
    booking = models.ForeignKey(
        Booking,
        on_delete=models.CASCADE,
        related_name="booking_services",
        verbose_name="Запись",
    )
    service = models.ForeignKey(
        "catalog.Service",
        on_delete=models.PROTECT,
        related_name="booking_services",
        verbose_name="Услуга",
    )
    price = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        validators=[MinValueValidator(0)],
        verbose_name="Цена на момент записи",
    )
    duration_min = models.PositiveIntegerField(
        validators=[MinValueValidator(1)],
        verbose_name="Длительность на момент записи, минут",
    )

    class Meta:
        verbose_name = "Услуга в записи"
        verbose_name_plural = "Услуги в записи"
        constraints = [
            models.UniqueConstraint(
                fields=("booking", "service"),
                name="unique_service_in_booking",
            ),
        ]

    def __str__(self):
        return f"{self.booking} — {self.service}"


class BookingHistory(models.Model):
    booking = models.ForeignKey(
        Booking,
        on_delete=models.CASCADE,
        related_name="history",
        verbose_name="Запись",
    )
    from_status = models.CharField(
        max_length=20,
        choices=Booking.Status.choices,
        blank=True,
        default="",
        verbose_name="Предыдущий статус",
    )
    to_status = models.CharField(
        max_length=20,
        choices=Booking.Status.choices,
        verbose_name="Новый статус",
    )
    changed_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.PROTECT,
        related_name="changed_booking_history",
        verbose_name="Кто изменил",
    )
    changed_at = models.DateTimeField(
        auto_now_add=True,
        verbose_name="Дата изменения",
    )
    comment = models.CharField(
        max_length=255,
        blank=True,
        default="",
        verbose_name="Комментарий",
    )

    class Meta:
        verbose_name = "История записи"
        verbose_name_plural = "История записей"
        ordering = ("-changed_at",)

    def __str__(self):
        return (
            f"{self.booking} — "
            f"{self.from_status or '—'} → {self.to_status}"
        )

