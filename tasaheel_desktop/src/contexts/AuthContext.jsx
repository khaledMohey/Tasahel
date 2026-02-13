import { createContext, useContext, useState, useEffect } from 'react'
import axios from 'axios'

const AuthContext = createContext()

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [permissions, setPermissions] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check for stored auth data
    const token = localStorage.getItem('access_token')
    const storedUser = localStorage.getItem('user')
    const storedPermissions = localStorage.getItem('permissions')

    if (token && storedUser) {
      setUser(JSON.parse(storedUser))
      setPermissions(storedPermissions ? JSON.parse(storedPermissions) : [])
      
      // Set token in Electron if available
      if (window.electronAPI) {
        window.electronAPI.authSetToken(token)
      } else {
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
      }
    }
    setLoading(false)
  }, [])

  const login = async (username, password) => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000'
      const response = await axios.post(`${apiUrl}/api/auth/login/`, {
        username,
        password,
      })

      const { access, refresh, user: userData, permissions: userPermissions } = response.data

      localStorage.setItem('access_token', access)
      localStorage.setItem('refresh_token', refresh)
      localStorage.setItem('user', JSON.stringify(userData))
      localStorage.setItem('permissions', JSON.stringify(userPermissions))

      // Set token in Electron
      if (window.electronAPI) {
        window.electronAPI.authSetToken(access)
      } else {
        axios.defaults.headers.common['Authorization'] = `Bearer ${access}`
      }

      setUser(userData)
      setPermissions(userPermissions)

      return { success: true }
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'حدث خطأ أثناء تسجيل الدخول',
      }
    }
  }

  const logout = () => {
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
    localStorage.removeItem('user')
    localStorage.removeItem('permissions')
    
    if (window.electronAPI) {
      window.electronAPI.authSetToken(null)
    } else {
      delete axios.defaults.headers.common['Authorization']
    }
    
    setUser(null)
    setPermissions([])
  }

  const hasPermission = (permissionCode) => {
    if (user?.role === 'Admin') return true
    return permissions.includes(permissionCode)
  }

  const value = {
    user,
    permissions,
    login,
    logout,
    hasPermission,
    loading,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
