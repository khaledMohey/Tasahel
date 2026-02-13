import uuid
from django.db import models
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager
from django.utils import timezone


class UserManager(BaseUserManager):
    def create_user(self, username, password=None, role='Employee', **extra_fields):
        if not username:
            raise ValueError('يجب إدخال اسم المستخدم')
        
        user = self.model(username=username, role=role, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, username, password=None, **extra_fields):
        extra_fields.setdefault('role', 'Admin')
        extra_fields.setdefault('is_active', True)
        
        return self.create_user(username, password, **extra_fields)


class User(AbstractBaseUser):
    ROLE_CHOICES = [
        ('Admin', 'مدير'),
        ('Employee', 'موظف'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    username = models.CharField(max_length=150, unique=True, verbose_name='اسم المستخدم')
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='Employee', verbose_name='الدور')
    is_active = models.BooleanField(default=True, verbose_name='نشط')
    sync_status = models.CharField(max_length=20, default='synced', verbose_name='حالة المزامنة', blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='تاريخ الإنشاء')
    updated_at = models.DateTimeField(auto_now=True, verbose_name='تاريخ التحديث')

    objects = UserManager()

    USERNAME_FIELD = 'username'
    REQUIRED_FIELDS = []

    class Meta:
        verbose_name = 'مستخدم'
        verbose_name_plural = 'المستخدمون'
        db_table = 'users'

    def __str__(self):
        return self.username

    @property
    def is_staff(self):
        return self.role == 'Admin'

    @property
    def is_admin(self):
        return self.role == 'Admin'
