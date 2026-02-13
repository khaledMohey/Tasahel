import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

const Dashboard = () => {
  const navigate = useNavigate()
  const { user, logout } = useAuth()

  const pages = [
    {
      id: 'employees',
      title: 'تسجيل الموظفين',
      icon: '👥',
      path: '/employees',
      description: 'إدارة وتسجيل الموظفين',
      color: 'bg-blue-500'
    },
    {
      id: 'customers',
      title: 'قوائم العملاء',
      icon: '👤',
      path: '/customers',
      description: 'إدارة قوائم العملاء',
      color: 'bg-blue-400'
    },
    {
      id: 'establishments',
      title: 'قوائم المنشآت',
      icon: '🏢',
      path: '/establishments',
      description: 'إدارة قوائم المنشآت',
      color: 'bg-blue-500'
    },
    {
      id: 'pharmacy-licenses',
      title: 'تراخيص الصيدليات',
      icon: '💊',
      path: '/pharmacy-licenses',
      description: 'إدارة تراخيص الصيدليات',
      color: 'bg-blue-400'
    },
    {
      id: 'store-licenses',
      title: 'تراخيص المخازن',
      icon: '📦',
      path: '/store-licenses',
      description: 'إدارة تراخيص المخازن',
      color: 'bg-blue-500'
    },
    {
      id: 'marketing-orders',
      title: 'تساهيل تسويق طلبات',
      icon: '🛒',
      path: '/marketing-orders',
      description: 'إدارة طلبات التسويق',
      color: 'bg-blue-400'
    },
    {
      id: 'marketing-offers',
      title: 'تساهيل تسويق عروض',
      icon: '🎁',
      path: '/marketing-offers',
      description: 'إدارة عروض التسويق',
      color: 'bg-blue-500'
    },
    {
      id: 'pharmacists',
      title: 'تساهيل الصيادلة',
      icon: '👨‍⚕️',
      path: '/pharmacists',
      description: 'إدارة بيانات الصيادلة',
      color: 'bg-blue-400'
    },
    {
      id: 'facilities',
      title: 'تسهيل المنشآت',
      icon: '🏥',
      path: '/facilities',
      description: 'إدارة تسهيلات المنشآت',
      color: 'bg-blue-500'
    },
    {
      id: 'certificates',
      title: 'شهادات',
      icon: '📜',
      path: '/certificates',
      description: 'إدارة الشهادات',
      color: 'bg-blue-400'
    },
    {
      id: 'invoices',
      title: 'فواتير',
      icon: '🧾',
      path: '/invoices',
      description: 'إدارة الفواتير',
      color: 'bg-blue-500'
    },
    {
      id: 'legal-consultations',
      title: 'استشارات قانونية',
      icon: '⚖️',
      path: '/legal-consultations',
      description: 'إدارة الاستشارات القانونية',
      color: 'bg-blue-400'
    },
    {
      id: 'reports',
      title: 'تقارير',
      icon: '📊',
      path: '/reports',
      description: 'عرض التقارير',
      color: 'bg-blue-500'
    },
    {
      id: 'finances',
      title: 'الماليات',
      icon: '💰',
      path: '/finances',
      description: 'إدارة الماليات',
      color: 'bg-blue-400'
    },
    {
      id: 'activity-data',
      title: 'بيانات النشاط',
      icon: '📈',
      path: '/activity-data',
      description: 'عرض بيانات النشاط',
      color: 'bg-blue-500'
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100">

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">لوحة التحكم</h2>
          <p className="text-gray-600">اختر الصفحة التي تريد الوصول إليها</p>
        </div>

        {/* Pages Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {pages.map((page) => (
            <div
              key={page.id}
              onClick={() => navigate(page.path)}
              className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer transform hover:-translate-y-2 border border-blue-100"
            >
              <div className={`${page.color} rounded-t-xl p-6 text-center`}>
                <div className="text-5xl mb-2">{page.icon}</div>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-800 mb-2">{page.title}</h3>
                <p className="text-gray-600 text-sm">{page.description}</p>
                <div className="mt-4 flex items-center text-blue-600 text-sm font-medium">
                  <span>افتح الصفحة</span>
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default Dashboard
