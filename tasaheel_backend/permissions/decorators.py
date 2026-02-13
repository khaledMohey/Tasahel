from functools import wraps
from rest_framework.response import Response
from rest_framework import status
from .models import UserPermission


def require_permission(permission_code):
    """
    Decorator to check if user has a specific permission.
    Usage: @require_permission('employee.create')
    """
    def decorator(view_func):
        @wraps(view_func)
        def wrapped_view(request, *args, **kwargs):
            if not request.user.is_authenticated:
                return Response(
                    {'error': 'يجب تسجيل الدخول'},
                    status=status.HTTP_401_UNAUTHORIZED
                )
            
            # Admin has all permissions
            if request.user.is_admin:
                return view_func(request, *args, **kwargs)
            
            # Check if user has the permission
            has_permission = UserPermission.objects.filter(
                user=request.user,
                permission__code=permission_code
            ).exists()
            
            if not has_permission:
                return Response(
                    {'error': 'ليس لديك صلاحية للوصول إلى هذا المورد'},
                    status=status.HTTP_403_FORBIDDEN
                )
            
            return view_func(request, *args, **kwargs)
        return wrapped_view
    return decorator
