from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from .views import LoginView, refresh_token_view, EmployeeCreateView, EmployeeListView

urlpatterns = [
    path('login/', LoginView.as_view(), name='login'),
    path('refresh/', refresh_token_view, name='refresh'),
]

# Employee URLs - included separately in main urls.py
employee_urlpatterns = [
    path('create/', EmployeeCreateView.as_view(), name='employee-create'),
    path('', EmployeeListView.as_view(), name='employee-list'),
]
