import uuid
from django.db import models
from django.conf import settings


class Permission(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=255, verbose_name='اسم الصلاحية')
    code = models.CharField(max_length=100, unique=True, verbose_name='رمز الصلاحية')
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='تاريخ الإنشاء')
    updated_at = models.DateTimeField(auto_now=True, verbose_name='تاريخ التحديث')

    class Meta:
        verbose_name = 'صلاحية'
        verbose_name_plural = 'الصلاحيات'
        db_table = 'permissions'
        ordering = ['name']

    def __str__(self):
        return self.name


class UserPermission(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='user_permissions',
        verbose_name='المستخدم'
    )
    permission = models.ForeignKey(
        Permission,
        on_delete=models.CASCADE,
        related_name='user_permissions',
        verbose_name='الصلاحية'
    )
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='تاريخ الإنشاء')

    class Meta:
        verbose_name = 'صلاحية مستخدم'
        verbose_name_plural = 'صلاحيات المستخدمين'
        db_table = 'user_permissions'
        unique_together = ['user', 'permission']

    def __str__(self):
        return f'{self.user.username} - {self.permission.name}'
