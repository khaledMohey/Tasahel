from django.core.management.base import BaseCommand
from permissions.models import Permission


class Command(BaseCommand):
    help = 'إنشاء الصلاحيات الأساسية'

    def handle(self, *args, **options):
        permissions = [
            {'name': 'إنشاء موظف', 'code': 'employee.create'},
            {'name': 'عرض الموظفين', 'code': 'employee.view'},
            {'name': 'تعديل موظف', 'code': 'employee.edit'},
            {'name': 'حذف موظف', 'code': 'employee.delete'},
        ]

        created_count = 0
        for perm_data in permissions:
            permission, created = Permission.objects.get_or_create(
                code=perm_data['code'],
                defaults={'name': perm_data['name']}
            )
            if created:
                created_count += 1
                self.stdout.write(
                    self.style.SUCCESS(f'تم إنشاء الصلاحية: {permission.name}')
                )
            else:
                self.stdout.write(
                    self.style.WARNING(f'الصلاحية موجودة: {permission.name}')
                )

        self.stdout.write(
            self.style.SUCCESS(f'تم إنشاء {created_count} صلاحية جديدة')
        )
