from django.urls import path
from .views import PermissionListView

urlpatterns = [
    path('', PermissionListView.as_view(), name='permission-list'),
]
