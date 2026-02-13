# Generated migration to add sync_status field

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('users', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='user',
            name='sync_status',
            field=models.CharField(default='synced', max_length=20, verbose_name='حالة المزامنة'),
        ),
    ]
