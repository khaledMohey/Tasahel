from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.utils import timezone
from django.db import transaction
from .models import SyncLog
from .serializers import SyncPushSerializer, SyncPullSerializer, SyncLogSerializer
from users.models import User
from users.serializers import UserSerializer


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def sync_push(request):
    """
    Push local changes from desktop to server.
    Expected format:
    {
        "device_id": "device-uuid",
        "records": [
            {
                "id": "user-uuid",
                "username": "employee1",
                "role": "Employee",
                "updated_at": "2024-01-01T12:00:00Z"
            }
        ]
    }
    """
    serializer = SyncPushSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    device_id = serializer.validated_data['device_id']
    records = serializer.validated_data['records']
    
    updated_count = 0
    created_count = 0
    errors = []
    
    with transaction.atomic():
        for record in records:
            try:
                record_id = record.get('id')
                if not record_id:
                    errors.append({'record': record, 'error': 'معرف السجل مطلوب'})
                    continue
                
                # Try to get existing user
                try:
                    user = User.objects.get(id=record_id)
                    # Update if server version is older or same
                    record_updated_at = record.get('updated_at')
                    if record_updated_at:
                        from django.utils.dateparse import parse_datetime
                        record_dt = parse_datetime(record_updated_at)
                        if record_dt and record_dt >= user.updated_at:
                            user.username = record.get('username', user.username)
                            user.role = record.get('role', user.role)
                            user.is_active = record.get('is_active', user.is_active)
                            user.save()
                            updated_count += 1
                except User.DoesNotExist:
                    # Create new user
                    User.objects.create_user(
                        id=record_id,
                        username=record.get('username'),
                        password=record.get('password', 'temp123456'),  # Should be hashed
                        role=record.get('role', 'Employee'),
                        is_active=record.get('is_active', True)
                    )
                    created_count += 1
                    
            except Exception as e:
                errors.append({'record': record, 'error': str(e)})
        
        # Update sync log
        sync_log, created = SyncLog.objects.update_or_create(
            device_id=device_id,
            defaults={'last_sync_timestamp': timezone.now()}
        )
    
    return Response({
        'success': True,
        'created': created_count,
        'updated': updated_count,
        'errors': errors,
        'sync_timestamp': sync_log.last_sync_timestamp.isoformat()
    }, status=status.HTTP_200_OK)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def sync_pull(request):
    """
    Pull updated records from server based on timestamp.
    Expected format:
    {
        "device_id": "device-uuid",
        "last_sync_timestamp": "2024-01-01T12:00:00Z"
    }
    """
    serializer = SyncPullSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    device_id = serializer.validated_data['device_id']
    last_sync_timestamp = serializer.validated_data['last_sync_timestamp']
    
    # Get all users updated after last_sync_timestamp
    updated_users = User.objects.filter(updated_at__gt=last_sync_timestamp).order_by('updated_at')
    
    # Serialize users
    user_serializer = UserSerializer(updated_users, many=True)
    
    # Update sync log
    sync_log, created = SyncLog.objects.update_or_create(
        device_id=device_id,
        defaults={'last_sync_timestamp': timezone.now()}
    )
    
    return Response({
        'success': True,
        'records': user_serializer.data,
        'count': len(user_serializer.data),
        'sync_timestamp': sync_log.last_sync_timestamp.isoformat()
    }, status=status.HTTP_200_OK)
