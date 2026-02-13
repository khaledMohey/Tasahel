from rest_framework import serializers
from django.contrib.auth.password_validation import validate_password
from .models import User
from permissions.models import Permission, UserPermission


class UserSerializer(serializers.ModelSerializer):
    permissions = serializers.SerializerMethodField()
    
    class Meta:
        model = User
        fields = ('id', 'username', 'role', 'is_active', 'created_at', 'updated_at', 'permissions')
        read_only_fields = ('id', 'created_at', 'updated_at', 'permissions')

    def get_permissions(self, obj):
        user_permissions = UserPermission.objects.filter(user=obj)
        return [up.permission.code for up in user_permissions]


class UserCreateSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=6)
    password_confirm = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ('username', 'password', 'password_confirm', 'role', 'is_active')

    def validate_password(self, value):
        # Basic password validation
        if len(value) < 6:
            raise serializers.ValidationError('كلمة المرور يجب أن تكون 6 أحرف على الأقل')
        return value

    def validate(self, attrs):
        if attrs['password'] != attrs['password_confirm']:
            raise serializers.ValidationError({'password_confirm': 'كلمات المرور غير متطابقة'})
        return attrs

    def create(self, validated_data):
        validated_data.pop('password_confirm')
        password = validated_data.pop('password')
        # Ensure role is Employee
        validated_data['role'] = 'Employee'
        # Set sync_status to 'synced' for web-created employees
        validated_data['sync_status'] = 'synced'
        user = User.objects.create_user(password=password, **validated_data)
        return user


class UserListSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'username', 'role', 'is_active', 'created_at', 'updated_at')
        read_only_fields = ('id', 'created_at', 'updated_at')
