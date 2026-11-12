from django.shortcuts import render
from datetime import date
from django.db import transaction
from django.shortcuts import get_object_or_404
from rest_framework import permissions, status, viewsets
from rest_framework.decorators import action
from rest_framework.exceptions import PermissionDenied
from rest_framework.response import Response
from rest_framework.views import APIView
from accounts.permissions import IsAdmin
from .models import Booking, BookingHistory, BookingService
from .serializers import (
    BookingHistorySerializer,
    BookingSerializer,
    BookingStatusSerializer,
)
from .services import (get_available_slots,
    validate_status_transition,
)

class AvailableSlotsView(APIView):
    permission_classes = (permissions.AllowAny,)

    def get(self, request):
        master_id = request.query_params.get("master")
        service_values = request.query_params.getlist("service")
        date_value = request.query_params.get("date")

        if not master_id:
            return Response(
                {"master": "Укажите id мастера."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if not service_values:
            return Response(
                {"service": "Укажите хотя бы одну услугу."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if not date_value:
            return Response(
                {"date": "Укажите дату в формате YYYY-MM-DD."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            master_id = int(master_id)
            service_ids = [int(value) for value in service_values]
            selected_date = date.fromisoformat(date_value)
        except ValueError:
            return Response(
                {"detail": "Неверный формат параметров."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        slots = get_available_slots(
            master_id=master_id,
            service_ids=service_ids,
            selected_date=selected_date,
        )

        return Response(slots)


class BookingViewSet(viewsets.ModelViewSet):
    serializer_class = BookingSerializer
    permission_classes = (permissions.IsAuthenticated,)

    def get_queryset(self):
        queryset = (
            Booking.objects
            .select_related(
                "client",
                "master",
                "workplace",
            )
            .prefetch_related(
                "booking_services__service",
                "history__changed_by",
            )
        )

        user = self.request.user

        if user.is_superuser or user.role == "admin":
            return queryset

        return queryset.filter(client=user)

    def get_permissions(self):
        if self.action in (
            "update",
            "partial_update",
            "destroy",
            "set_status",
        ):
            return [IsAdmin()]

        return [permissions.IsAuthenticated()]

    def perform_create(self, serializer):
        if self.request.user.role != "client":
            raise PermissionDenied(
                "Создавать записи может только клиент."
        )

        serializer.save()

    @action(
        detail=True,
        methods=("post",),
        url_path="cancel",
    )
    def cancel(self, request, pk=None):
        with transaction.atomic():
            booking = get_object_or_404(
                Booking.objects.select_for_update(),
                pk=pk,
            )

            if (
                request.user.role != "admin"
                and not request.user.is_superuser
                and booking.client_id != request.user.id
            ):
                raise PermissionDenied(
                    "Можно отменить только свою запись."
                )

            if booking.status in (
                Booking.Status.DONE,
                Booking.Status.CANCELLED,
                Booking.Status.NO_SHOW,
            ):
                return Response(
                    {"detail": "Эту запись уже нельзя отменить."},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            old_status = booking.status
            booking.status = Booking.Status.CANCELLED
            booking.save(update_fields=("status",))

            BookingHistory.objects.create(
                booking=booking,
                from_status=old_status,
                to_status=Booking.Status.CANCELLED,
                changed_by=request.user,
                comment="Запись отменена.",
            )

        return Response(BookingSerializer(booking).data)

    @action(
        detail=True,
        methods=("patch",),
        url_path="status",
    )
    def set_status(self, request, pk=None):
        if (
            request.user.role != "admin"
            and not request.user.is_superuser
        ):
            raise PermissionDenied(
                "Изменять статус может только администратор."
            )

        serializer = BookingStatusSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        new_status = serializer.validated_data["status"]
        comment = serializer.validated_data["comment"]
        
        with transaction.atomic():
            booking = get_object_or_404(
                Booking.objects.select_for_update(),
                pk=pk,
            )
            validate_status_transition(
                booking.status,
                new_status,
            )
        
            old_status = booking.status
            booking.status = new_status
            booking.save(update_fields=("status",))

            BookingHistory.objects.create(
                booking=booking,
                from_status=old_status,
                to_status=new_status,
                changed_by=request.user,
                comment=comment,
            )

        return Response(BookingSerializer(booking).data)

    @action(
        detail=True,
        methods=("get",),
        url_path="history",
    )
    def history(self, request, pk=None):
        booking = self.get_object()

        history = booking.history.all()
        serializer = BookingHistorySerializer(
            history,
            many=True,
        )

        return Response(serializer.data)