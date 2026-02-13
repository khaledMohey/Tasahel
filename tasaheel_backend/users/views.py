from rest_framework import status, generics
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate
from .models import User
from .serializers import UserSerializer, UserCreateSerializer, UserListSerializer
from permissions.models import UserPermission
from permissions.decorators import require_permission


class LoginView(TokenObtainPairView):
    def post(self, request, *args, **kwargs):
        username = request.data.get('username')
        password = request.data.get('password')
        
        if not username or not password:
            return Response(
                {'error': 'اسم المستخدم وكلمة المرور مطلوبان'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        user = authenticate(username=username, password=password)
        
        if user is None or not user.is_active:
            return Response(
                {'error': 'بيانات الدخول غير صحيحة'},
                status=status.HTTP_401_UNAUTHORIZED
            )
        
        refresh = RefreshToken.for_user(user)
        user_serializer = UserSerializer(user)
        
        # Get user permissions
        user_permissions = UserPermission.objects.filter(user=user)
        permission_codes = [up.permission.code for up in user_permissions]
        
        return Response({
            'access': str(refresh.access_token),
            'refresh': str(refresh),
            'user': user_serializer.data,
            'permissions': permission_codes,
        }, status=status.HTTP_200_OK)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def refresh_token_view(request):
    refresh_token = request.data.get('refresh')
    
    if not refresh_token:
        return Response(
            {'error': 'رمز التحديث مطلوب'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    try:
        refresh = RefreshToken(refresh_token)
        access_token = refresh.access_token
        return Response({
            'access': str(access_token),
        }, status=status.HTTP_200_OK)
    except Exception as e:
        return Response(
            {'error': 'رمز التحديث غير صالح'},
            status=status.HTTP_401_UNAUTHORIZED
        )


class EmployeeCreateView(generics.CreateAPIView):
    queryset = User.objects.filter(role='Employee')
    serializer_class = UserCreateSerializer
    permission_classes = [IsAuthenticated]

    def create(self, request, *args, **kwargs):
        # Check if user is admin
        if not request.user.is_admin:
            return Response(
                {'error': 'غير مصرح لك بإنشاء موظفين'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        serializer = self.get_serializer(data=request.data)
        
        if not serializer.is_valid():
            return Response(
                serializer.errors,
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Ensure role is Employee (already handled in serializer, but double check)
        validated_data = serializer.validated_data
        validated_data['role'] = 'Employee'
        
        try:
            user = serializer.save()
            return Response(
                UserSerializer(user).data,
                status=status.HTTP_201_CREATED
            )
        except Exception as e:
            return Response(
                {'error': f'حدث خطأ أثناء إنشاء الموظف: {str(e)}'},
                status=status.HTTP_400_BAD_REQUEST
            )


class EmployeeListView(generics.ListAPIView):
    serializer_class = UserListSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        if not self.request.user.is_admin:
            return User.objects.none()
        
        return User.objects.filter(role='Employee').order_by('-created_at')
