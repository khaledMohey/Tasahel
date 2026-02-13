from django.contrib import admin
from .models import Permission, UserPermission


@admin.register(Permission)
class PermissionAdmin(admin.ModelAdmin):
    list_display = ('name', 'code', 'created_at')
    search_fields = ('name', 'code')
    ordering = ('name',)


@admin.register(UserPermission)
class UserPermissionAdmin(admin.ModelAdmin):
    list_display = ('user', 'permission', 'created_at')
    list_filter = ('permission', 'created_at')
    search_fields = ('user__username', 'permission__name')
    ordering = ('-created_at',)
