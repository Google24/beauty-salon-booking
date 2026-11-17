from rest_framework.permissions import SAFE_METHODS, BasePermission


class IsAdmin(BasePermission):
    message = "Доступ разрешён только администратору."

    def has_permission(self, request, view):
        user = request.user

        return bool(
            user
            and user.is_authenticated
            and (
                user.role == "admin"
                or user.is_superuser
            )
        )


class IsAdminOrReadOnly(BasePermission):
    message = "Изменять данные может только администратор."

    def has_permission(self, request, view):
        if request.method in SAFE_METHODS:
            return True

        return IsAdmin().has_permission(request, view)
    
class IsAdminOrMasterForSchedule(BasePermission):
    message = (
        "Изменять расписание может только администратор "
        "или сам мастер."
    )

    def has_permission(self, request, view):
        if request.method in SAFE_METHODS:
            return True

        user = request.user

        return bool(
            user
            and user.is_authenticated
            and (
                user.role == "admin"
                or user.is_superuser
                or user.role == "master"
            )
        )

    def has_object_permission(self, request, view, obj):
        if request.method in SAFE_METHODS:
            return True

        user = request.user

        if user.is_superuser or user.role == "admin":
            return True

        return (
            user.role == "master"
            and obj.master.user_id == user.id
        )