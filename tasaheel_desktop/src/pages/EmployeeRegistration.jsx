import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'

const EmployeeRegistration = () => {
  const { user, logout } = useAuth()
  const [employees, setEmployees] = useState([])
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    password_confirm: '',
    is_active: true,
  })

  useEffect(() => {
    fetchEmployees()
  }, [])

  const fetchEmployees = async () => {
    try {
      setFetching(true)
      if (window.electronAPI) {
        // Use local database
        const result = await window.electronAPI.dbGetEmployees()
        setEmployees(result || [])
      } else {
        // Fallback to API
        const axios = (await import('axios')).default
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000'
        const response = await axios.get(`${apiUrl}/api/employees/`)
        setEmployees(response.data.results || response.data)
      }
      setError('')
    } catch (err) {
      setError('فشل في جلب قائمة الموظفين')
    } finally {
      setFetching(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setLoading(true)

    if (formData.password !== formData.password_confirm) {
      setError('كلمات المرور غير متطابقة')
      setLoading(false)
      return
    }

    try {
      // Generate UUID (simple version for client-side)
      const generateUUID = () => {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
          const r = Math.random() * 16 | 0
          const v = c === 'x' ? r : (r & 0x3 | 0x8)
          return v.toString(16)
        })
      }

      const employeeData = {
        id: generateUUID(),
        username: formData.username,
        password: formData.password, // In production, hash this
        role: 'Employee',
        is_active: formData.is_active,
      }

      if (window.electronAPI) {
        // Save to local database
        const result = await window.electronAPI.dbCreateEmployee(employeeData)
        if (result.success) {
          setSuccess('تم إنشاء الموظف بنجاح')
          setFormData({
            username: '',
            password: '',
            password_confirm: '',
            is_active: true,
          })
          fetchEmployees()
          
          // Try to sync if online
          const isOnline = await window.electronAPI.syncIsOnline()
          if (isOnline) {
            await window.electronAPI.syncPush()
          }
        } else {
          setError(result.error || 'فشل في إنشاء الموظف')
        }
      } else {
        // Fallback to API
        const axios = (await import('axios')).default
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000'
        await axios.post(`${apiUrl}/api/employees/create/`, {
          username: formData.username,
          password: formData.password,
          password_confirm: formData.password_confirm,
          role: 'Employee',
          is_active: formData.is_active,
        })

        setSuccess('تم إنشاء الموظف بنجاح')
        setFormData({
          username: '',
          password: '',
          password_confirm: '',
          is_active: true,
        })
        fetchEmployees()
      }
    } catch (err) {
      if (err.response?.status === 401) {
        logout()
      } else {
        setError(
          err.response?.data?.error ||
          err.response?.data?.username?.[0] ||
          'فشل في إنشاء الموظف'
        )
      }
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }))
  }

  if (!user || user.role !== 'Admin') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-red-600">ليس لديك صلاحية للوصول إلى هذه الصفحة</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Registration Form */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-6">تسجيل موظف جديد</h2>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
                {error}
              </div>
            )}

            {success && (
              <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded mb-4">
                {success}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
                  اسم المستخدم
                </label>
                <input
                  id="username"
                  name="username"
                  type="text"
                  value={formData.username}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="أدخل اسم المستخدم"
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                  كلمة المرور
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="أدخل كلمة المرور"
                />
              </div>

              <div>
                <label
                  htmlFor="password_confirm"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  تأكيد كلمة المرور
                </label>
                <input
                  id="password_confirm"
                  name="password_confirm"
                  type="password"
                  value={formData.password_confirm}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="أعد إدخال كلمة المرور"
                />
              </div>

              <div className="flex items-center">
                <input
                  id="is_active"
                  name="is_active"
                  type="checkbox"
                  checked={formData.is_active}
                  onChange={handleChange}
                  className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                />
                <label htmlFor="is_active" className="mr-2 block text-sm text-gray-700">
                  حساب نشط
                </label>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-primary text-white py-2 px-4 rounded-lg hover:bg-primary-light transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              >
                {loading ? 'جاري الإنشاء...' : 'إنشاء موظف'}
              </button>
            </form>
          </div>

          {/* Employees List */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-6">قائمة الموظفين</h2>

            {fetching ? (
              <div className="text-center py-8 text-gray-500">جاري التحميل...</div>
            ) : employees.length === 0 ? (
              <div className="text-center py-8 text-gray-500">لا يوجد موظفين مسجلين</div>
            ) : (
              <div className="space-y-3">
                {employees.map((employee) => (
                  <div
                    key={employee.id}
                    className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="font-medium text-gray-800">{employee.username}</h3>
                        <p className="text-sm text-gray-500">
                          {employee.role === 'Admin' ? 'مدير' : 'موظف'}
                        </p>
                        {employee.sync_status && (
                          <p className="text-xs text-gray-400 mt-1">
                            حالة المزامنة: {employee.sync_status === 'pending' ? 'قيد الانتظار' : 'مزامن'}
                          </p>
                        )}
                      </div>
                      <div className="text-left">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${
                            employee.is_active === 1 || employee.is_active === true
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {employee.is_active === 1 || employee.is_active === true ? 'نشط' : 'غير نشط'}
                        </span>
                      </div>
                    </div>
                    <p className="text-xs text-gray-400 mt-2">
                      تم الإنشاء: {new Date(employee.created_at).toLocaleDateString('ar-SA')}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default EmployeeRegistration
