# تساهيل (Tasahel)

نظام إدارة متكامل شامل يتكون من:
- **Backend**: Django REST API
- **Web App**: React Web Application
- **Desktop App**: Electron Desktop Application

## المميزات

- ✅ نظام إدارة الموظفين
- ✅ نظام الأذونات (RBAC)
- ✅ مزامنة البيانات بين Desktop و Server
- ✅ يعمل Offline-First
- ✅ قاعدة بيانات PostgreSQL
- ✅ JWT Authentication
- ✅ واجهة مستخدم عربية حديثة

## البنية

```
tasahel/
├── tasaheel_backend/    # Django REST API
├── tasaheel_web/        # React Web App
└── tasaheel_desktop/    # Electron Desktop App
```

## 🚀 الإعداد السريع

### المتطلبات الأساسية
- Python 3.11+
- Node.js 18+
- PostgreSQL 12+
- Git

### 1. استنساخ المشروع
```bash
git clone https://github.com/khaledMohey/Tasahel.git
cd Tasahel
```

### 2. إعداد Backend

```bash
cd tasaheel_backend

# إنشاء بيئة افتراضية
python -m venv venv

# تفعيل البيئة الافتراضية
# Windows:
venv\Scripts\activate
# Linux/Mac:
source venv/bin/activate

# تثبيت المتطلبات
pip install -r requirements.txt

# إنشاء ملف .env من .env.example
copy .env.example .env  # Windows
# أو
cp .env.example .env    # Linux/Mac

# تعديل ملف .env بإدخال بيانات قاعدة البيانات الخاصة بك
# ثم إنشاء قاعدة البيانات في PostgreSQL:
# CREATE DATABASE tasaheel;

# تشغيل migrations
python manage.py migrate

# إنشاء الصلاحيات الأولية
python manage.py create_permissions

# إنشاء مستخدم مدير
python manage.py createsuperuser

# تشغيل الخادم
python manage.py runserver
```

### 3. إعداد Web App

```bash
cd tasaheel_web

# تثبيت المتطلبات
npm install

# إنشاء ملف .env من .env.example (اختياري)
copy .env.example .env  # Windows
# أو
cp .env.example .env    # Linux/Mac

# تشغيل التطبيق
npm run dev
```

### 4. إعداد Desktop App

```bash
cd tasaheel_desktop

# تثبيت المتطلبات
npm install

# إنشاء ملف .env من .env.example (اختياري)
copy .env.example .env  # Windows
# أو
cp .env.example .env    # Linux/Mac

# تشغيل التطبيق
npm run dev
```

## 📝 ملفات .env

كل تطبيق يحتاج ملف `.env` (يتم إنشاؤه من `.env.example`):

### Backend (.env)
```env
SECRET_KEY=your-secret-key-here
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1
DB_NAME=tasaheel
DB_USER=postgres
DB_PASSWORD=your-password
DB_HOST=localhost
DB_PORT=5432
```

### Web App (.env)
```env
VITE_API_URL=http://localhost:8000
```

### Desktop App (.env)
```env
VITE_API_URL=http://localhost:8000
```

## 🔧 استكشاف الأخطاء

### مشكلة الاتصال بقاعدة البيانات
- تأكد من أن PostgreSQL يعمل
- تحقق من بيانات الاتصال في ملف `.env`
- تأكد من إنشاء قاعدة البيانات `tasaheel`

### مشكلة في تثبيت المتطلبات
- تأكد من استخدام Python 3.11+ و Node.js 18+
- جرب حذف `node_modules` و `venv` وإعادة التثبيت

## 📚 المزيد من المعلومات

راجع ملفات README في كل مجلد:
- `tasaheel_backend/README.md`
- `tasaheel_web/README.md`
- `tasaheel_desktop/README.md`

## الترخيص

© 2024 Tasahel. All rights reserved.
