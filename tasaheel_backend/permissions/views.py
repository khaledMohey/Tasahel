from rest_framework import generics
from rest_framework.permissions import IsAuthenticated
from .models import Permission
from .serializers import PermissionSerializer


class PermissionListView(generics.ListAPIView):
    queryset = Permission.objects.all()
    serializer_class = PermissionSerializer
    permission_classes = [IsAuthenticated]
