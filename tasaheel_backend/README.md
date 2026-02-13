# تساهيل - Backend API

## المتطلبات

- Python 3.11+
- PostgreSQL
- pip

## التثبيت

1. إنشاء بيئة افتراضية:
```bash
python -m venv venv
source venv/bin/activate  # Linux/Mac
# أو
venv\Scripts\activate  # Windows
```

2. تثبيت المتطلبات:
```bash
pip install -r requirements.txt
```

3. إنشاء ملف `.env` من `.env.example`:
```bash
cp .env.example .env
```

4. تعديل ملف `.env` بإدخال بيانات قاعدة البيانات الخاصة بك.

5. تشغيل migrations:
```bash
python manage.py makemigrations
python manage.py migrate
```

6. إنشاء مستخدم مدير:
```bash
python manage.py createsuperuser
```

7. تشغيل الخادم:
```bash
python manage.py runserver
```

## API Endpoints

### Authentication
- `POST /api/auth/login/` - تسجيل الدخول
- `POST /api/auth/refresh/` - تحديث الرمز المميز

### Employees (Admin Only)
- `POST /api/employees/create/` - إنشاء موظف جديد
- `GET /api/employees/` - قائمة الموظفين

### Permissions
- `GET /api/permissions/` - قائمة الصلاحيات

### Sync
- `POST /api/sync/push/` - دفع التغييرات من سطح المكتب
- `POST /api/sync/pull/` - سحب التحديثات من الخادم

## هيكل المشروع

```
tasaheel_backend/
├── tasaheel_backend/     # إعدادات المشروع الرئيسية
├── users/                # تطبيق المستخدمين
├── permissions/          # تطبيق الصلاحيات
├── sync/                 # تطبيق المزامنة
└── manage.py
```
