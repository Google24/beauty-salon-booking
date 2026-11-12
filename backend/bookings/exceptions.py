from rest_framework.exceptions import APIException


class BookingConflictError(APIException):
    status_code = 409
    default_detail = (
        "Мастер или рабочее место уже заняты "
        "в выбранное время."
    )
    default_code = "booking_conflict"