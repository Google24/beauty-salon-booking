from django.db import models

# Create your models here.
from django.core.validators import MinValueValidator
from django.db import models


class ServiceCategory(models.Model):
    name = models.CharField(
        max_length=60,
        unique=True,
        verbose_name="Название",
    )

    class Meta:
        verbose_name = "Категория услуг"
        verbose_name_plural = "Категории услуг"
        ordering = ("name",)

    def __str__(self):
        return self.name


class Service(models.Model):
    class WorkplaceRequirement(models.TextChoices):
        ANY = "any", "Любое рабочее место"
        MANICURE_TABLE = "manicure_table", "Маникюрный стол"
        PEDICURE_CHAIR = "pedicure_chair", "Педикюрное кресло"

    name = models.CharField(
        max_length=100,
        unique=True,
        verbose_name="Название",
    )
    description = models.TextField(
        blank=True,
        default="",
        verbose_name="Описание",
    )
    price = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        validators=[MinValueValidator(0)],
        verbose_name="Цена",
    )
    duration_min = models.PositiveIntegerField(
        validators=[MinValueValidator(1)],
        verbose_name="Длительность в минутах",
    )
    buffer_min = models.PositiveIntegerField(
        default=0,
        verbose_name="Буфер после услуги, минут",
    )
    category = models.ForeignKey(
        ServiceCategory,
        on_delete=models.PROTECT,
        related_name="services",
        verbose_name="Категория",
    )
    is_active = models.BooleanField(
        default=True,
        verbose_name="Активна",
    )
    required_workplace_type = models.CharField(
        max_length=30,
        choices=WorkplaceRequirement.choices,
        default=WorkplaceRequirement.ANY,
        verbose_name="Требуемое рабочее место",
    )
    created_at = models.DateTimeField(
        auto_now_add=True,
        verbose_name="Дата создания",
    )
    

    class Meta:
        verbose_name = "Услуга"
        verbose_name_plural = "Услуги"
        ordering = ("category", "name")

    def __str__(self):
        return self.name


class Workplace(models.Model):
    class WorkplaceType(models.TextChoices):
        MANICURE_TABLE = "manicure_table", "Маникюрный стол"
        PEDICURE_CHAIR = "pedicure_chair", "Педикюрное кресло"

    name = models.CharField(
        max_length=60,
        unique=True,
        verbose_name="Название",
    )
    workplace_type = models.CharField(
        max_length=30,
        choices=WorkplaceType.choices,
        default=WorkplaceType.MANICURE_TABLE,
        verbose_name="Тип рабочего места",
    )
    is_active = models.BooleanField(
        default=True,
        verbose_name="Активно",
    )

    class Meta:
        verbose_name = "Рабочее место"
        verbose_name_plural = "Рабочие места"
        ordering = ("workplace_type", "name")

    def __str__(self):
        return self.name