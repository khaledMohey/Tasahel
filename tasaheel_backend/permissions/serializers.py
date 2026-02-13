from rest_framework import serializers
from .models import Permission, UserPermission


class PermissionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Permission
        fields = ('id', 'name', 'code', 'created_at', 'updated_at')
        read_only_fields = ('id', 'created_at', 'updated_at')


class UserPermissionSerializer(serializers.ModelSerializer):
    permission = PermissionSerializer(read_only=True)
    permission_code = serializers.CharField(write_only=True, required=False)

    class Meta:
        model = UserPermission
        fields = ('id', 'user', 'permission', 'permission_code', 'created_at')
        read_only_fields = ('id', 'created_at')
