from rest_framework import serializers
from django.conf import settings
from .models import SyncLog
from users.serializers import UserSerializer


class SyncLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = SyncLog
        fields = ('id', 'device_id', 'last_sync_timestamp', 'created_at', 'updated_at')
        read_only_fields = ('id', 'created_at', 'updated_at')


class SyncPushSerializer(serializers.Serializer):
    device_id = serializers.CharField(required=True)
    records = serializers.ListField(
        child=serializers.DictField(),
        required=True
    )


class SyncPullSerializer(serializers.Serializer):
    device_id = serializers.CharField(required=True)
    last_sync_timestamp = serializers.DateTimeField(required=True)
