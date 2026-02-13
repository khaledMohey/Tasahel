import { useState } from 'react'

const Certificates = () => {
  const [loading, setLoading] = useState(false)

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-primary">شهادات</h1>
          </div>
          
          <div className="text-center py-12 text-gray-500">
            <p className="text-lg">هذه الصفحة قيد التطوير</p>
            <p className="text-sm mt-2">سيتم إضافة المحتوى قريباً</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Certificates
