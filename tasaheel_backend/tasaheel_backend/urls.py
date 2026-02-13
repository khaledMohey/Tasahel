"""
URL configuration for tasaheel_backend project.
"""
from django.contrib import admin
from django.urls import path, include
from django.http import JsonResponse
from django.views.decorators.http import require_http_methods
from users.views import EmployeeCreateView, EmployeeListView

@require_http_methods(["GET"])
def api_root(request):
    """API Root endpoint"""
    return JsonResponse({
        'message': 'تساهيل API',
        'version': '1.0.0',
        'endpoints': {
            'auth': {
                'login': '/api/auth/login/',
                'refresh': '/api/auth/refresh/',
            },
            'employees': {
                'list': '/api/employees/',
                'create': '/api/employees/create/',
            },
            'permissions': '/api/permissions/',
            'sync': {
                'push': '/api/sync/push/',
                'pull': '/api/sync/pull/',
            },
        }
    })

urlpatterns = [
    path('', api_root, name='api-root'),
    path('admin/', admin.site.urls),
    path('api/auth/', include('users.urls')),
    path('api/employees/create/', EmployeeCreateView.as_view(), name='employee-create'),
    path('api/employees/', EmployeeListView.as_view(), name='employee-list'),
    path('api/permissions/', include('permissions.urls')),
    path('api/sync/', include('sync.urls')),
]
