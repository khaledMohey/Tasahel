import uuid
from django.db import models
from django.conf import settings


class SyncLog(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    device_id = models.CharField(max_length=255, unique=True, verbose_name='معرف الجهاز')
    last_sync_timestamp = models.DateTimeField(verbose_name='آخر وقت مزامنة')
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='تاريخ الإنشاء')
    updated_at = models.DateTimeField(auto_now=True, verbose_name='تاريخ التحديث')

    class Meta:
        verbose_name = 'سجل المزامنة'
        verbose_name_plural = 'سجلات المزامنة'
        db_table = 'sync_logs'
        ordering = ['-last_sync_timestamp']

    def __str__(self):
        return f'{self.device_id} - {self.last_sync_timestamp}'
