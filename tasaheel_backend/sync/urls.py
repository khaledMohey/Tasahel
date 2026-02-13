from django.urls import path
from .views import sync_push, sync_pull

urlpatterns = [
    path('push/', sync_push, name='sync-push'),
    path('pull/', sync_pull, name='sync-pull'),
]
