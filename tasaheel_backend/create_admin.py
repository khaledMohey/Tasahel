#!/usr/bin/env python
# -*- coding: utf-8 -*-
import os
import django
import sys

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'tasaheel_backend.settings')
django.setup()

from users.models import User

username = 'admin'
password = 'admin123'

if User.objects.filter(username=username).exists():
    user = User.objects.get(username=username)
    user.set_password(password)
    user.role = 'Admin'
    user.is_active = True
    user.save()
    print(f"Updated user: {username}")
else:
    user = User.objects.create_user(
        username=username,
        password=password,
        role='Admin',
        is_active=True
    )
    print(f"Created superuser: {username}")

print(f"\nLogin credentials:")
print(f"Username: {username}")
print(f"Password: {password}")
