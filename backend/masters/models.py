from django.db import models
from django.conf import settings
from django.core.validators import MaxValueValidator, MinValueValidator
from django.db.models import F, Q


class Master(models.Model):
    class Specialization(models.TextChoices):
        MANICURE = "master_manicure", "Мастер маникюра"
        PEDICURE = "master_pedicure", "Мастер педикюра"
        MANICURE_PEDICURE = (
            "master_manicure_pedicure",
            "Мастер маникюра и педикюра",
        )
        NAIL_DESIGN = "nail_design", "Мастер дизайна ногтей"

    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.PROTECT,
        related_name="master_profile",
        verbose_name="Пользователь",
    )
    display_name = models.CharField(
        max_length=60,
        verbose_name="Имя мастера",
    )
    specialization = models.CharField(
        max_length=40,
        choices=Specialization.choices,
        verbose_name="Специализация",
    )
    is_active = models.BooleanField(
        default=True,
        verbose_name="Работает в салоне",
    )
    info = models.TextField(
        blank=True,
        default="",
        verbose_name="Описание",
    )
    services = models.ManyToManyField(
        "catalog.Service",
        through="MasterService",
        related_name="masters",
        verbose_name="Услуги",
    )

    class Meta:
        verbose_name = "Мастер"
        verbose_name_plural = "Мастера"
        ordering = ("display_name",)

    def __str__(self):
        return self.display_name


class MasterService(models.Model):
    master = models.ForeignKey(
        Master,
        on_delete=models.CASCADE,
        related_name="master_services",
        verbose_name="Мастер",
    )
    service = models.ForeignKey(
        "catalog.Service",
        on_delete=models.PROTECT,
        related_name="master_services",
        verbose_name="Услуга",
    )
    price_override = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        null=True,
        blank=True,
        validators=[MinValueValidator(0)],
        verbose_name="Индивидуальная цена",
    )
    duration_override = models.PositiveIntegerField(
        null=True,
        blank=True,
        validators=[MinValueValidator(1)],
        verbose_name="Индивидуальная длительность, минут",
    )

    class Meta:
        verbose_name = "Услуга мастера"
        verbose_name_plural = "Услуги мастеров"
        constraints = [
            models.UniqueConstraint(
                fields=("master", "service"),
                name="unique_master_service",
            ),
        ]

    def __str__(self):
        return f"{self.master} — {self.service}"


class WorkSchedule(models.Model):
    class Weekday(models.IntegerChoices):
        MONDAY = 0, "Понедельник"
        TUESDAY = 1, "Вторник"
        WEDNESDAY = 2, "Среда"
        THURSDAY = 3, "Четверг"
        FRIDAY = 4, "Пятница"
        SATURDAY = 5, "Суббота"
        SUNDAY = 6, "Воскресенье"

    master = models.ForeignKey(
        Master,
        on_delete=models.CASCADE,
        related_name="work_schedules",
        verbose_name="Мастер",
    )
    weekday = models.PositiveSmallIntegerField(
        choices=Weekday.choices,
        validators=[
            MinValueValidator(0),
            MaxValueValidator(6),
        ],
        verbose_name="День недели",
    )
    start_time = models.TimeField(
        verbose_name="Начало смены",
    )
    end_time = models.TimeField(
        verbose_name="Конец смены",
    )
    is_day_off = models.BooleanField(
        default=False,
        verbose_name="Выходной",
    )

    class Meta:
        verbose_name = "Расписание мастера"
        verbose_name_plural = "Расписания мастеров"
        constraints = [
            models.UniqueConstraint(
                fields=("master", "weekday"),
                name="unique_master_weekday_schedule",
            ),
            models.CheckConstraint(
                condition=Q(is_day_off=True) | Q(end_time__gt=F("start_time")),
                name="valid_schedule_time",
            ),
        ]
        ordering = ("master", "weekday", "start_time")

    def __str__(self):
        return f"{self.master} — {self.get_weekday_display()}"


class MasterAbsence(models.Model):
    class Reason(models.TextChoices):
        VACATION = "vacation", "Отпуск"
        SICK_LEAVE = "sick_leave", "Больничный"
        OTHER = "other", "Другое"

    master = models.ForeignKey(
        Master,
        on_delete=models.CASCADE,
        related_name="absences",
        verbose_name="Мастер",
    )
    start_date = models.DateField(
        verbose_name="Дата начала",
    )
    end_date = models.DateField(
        verbose_name="Дата окончания",
    )
    reason = models.CharField(
        max_length=20,
        choices=Reason.choices,
        default=Reason.VACATION,
        verbose_name="Причина",
    )
    comment = models.CharField(
        max_length=255,
        blank=True,
        default="",
        verbose_name="Комментарий",
    )

    class Meta:
        verbose_name = "Отсутствие мастера"
        verbose_name_plural = "Отсутствия мастеров"
        constraints = [
            models.CheckConstraint(
                condition=Q(end_date__gte=F("start_date")),
                name="valid_absence_dates",
            ),
        ]
        ordering = ("start_date",)

    def __str__(self):
        return (
            f"{self.master}: "
            f"{self.start_date} — {self.end_date}"
        )
# Create your models here.
