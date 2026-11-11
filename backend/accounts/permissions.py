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