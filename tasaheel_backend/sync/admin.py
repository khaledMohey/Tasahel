from django.contrib import admin
from .models import SyncLog


@admin.register(SyncLog)
class SyncLogAdmin(admin.ModelAdmin):
    list_display = ('device_id', 'last_sync_timestamp', 'updated_at')
    search_fields = ('device_id',)
    ordering = ('-last_sync_timestamp',)
    readonly_fields = ('created_at', 'updated_at')
