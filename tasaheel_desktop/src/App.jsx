import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { AuthProvider } from './contexts/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import Navbar from './components/Navbar'
import Login from './pages/Login'
import EmployeeRegistration from './pages/EmployeeRegistration'
import SyncStatus from './components/SyncStatus'
import CustomersList from './pages/CustomersList'
import EstablishmentsList from './pages/EstablishmentsList'
import PharmacyLicenses from './pages/PharmacyLicenses'
import StoreLicenses from './pages/StoreLicenses'
import MarketingOrders from './pages/MarketingOrders'
import MarketingOffers from './pages/MarketingOffers'
import Pharmacists from './pages/Pharmacists'
import Facilities from './pages/Facilities'
import Certificates from './pages/Certificates'
import Invoices from './pages/Invoices'
import LegalConsultations from './pages/LegalConsultations'
import Reports from './pages/Reports'
import Finances from './pages/Finances'
import ActivityData from './pages/ActivityData'
import Dashboard from './pages/Dashboard'

function App() {
  const [dbReady, setDbReady] = useState(false)

  useEffect(() => {
    // Initialize database
    if (window.electronAPI) {
      window.electronAPI.dbInit().then((result) => {
        if (result && result.success) {
          setDbReady(true)
        } else {
          console.error('Database initialization failed:', result?.error)
          setDbReady(true) // Continue anyway
        }
      }).catch((error) => {
        console.error('Database initialization error:', error)
        setDbReady(true) // Continue anyway
      })
    } else {
      setDbReady(true) // For web fallback
    }
  }, [])

  if (!dbReady) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-primary">جاري تهيئة قاعدة البيانات...</div>
      </div>
    )
  }

  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100">
          {window.electronAPI && <SyncStatus />}
          <Navbar />
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route
              path="/employees"
              element={
                <ProtectedRoute>
                  <EmployeeRegistration />
                </ProtectedRoute>
              }
            />
            <Route
              path="/customers"
              element={
                <ProtectedRoute>
                  <CustomersList />
                </ProtectedRoute>
              }
            />
            <Route
              path="/establishments"
              element={
                <ProtectedRoute>
                  <EstablishmentsList />
                </ProtectedRoute>
              }
            />
            <Route
              path="/pharmacy-licenses"
              element={
                <ProtectedRoute>
                  <PharmacyLicenses />
                </ProtectedRoute>
              }
            />
            <Route
              path="/store-licenses"
              element={
                <ProtectedRoute>
                  <StoreLicenses />
                </ProtectedRoute>
              }
            />
            <Route
              path="/marketing-orders"
              element={
                <ProtectedRoute>
                  <MarketingOrders />
                </ProtectedRoute>
              }
            />
            <Route
              path="/marketing-offers"
              element={
                <ProtectedRoute>
                  <MarketingOffers />
                </ProtectedRoute>
              }
            />
            <Route
              path="/pharmacists"
              element={
                <ProtectedRoute>
                  <Pharmacists />
                </ProtectedRoute>
              }
            />
            <Route
              path="/facilities"
              element={
                <ProtectedRoute>
                  <Facilities />
                </ProtectedRoute>
              }
            />
            <Route
              path="/certificates"
              element={
                <ProtectedRoute>
                  <Certificates />
                </ProtectedRoute>
              }
            />
            <Route
              path="/invoices"
              element={
                <ProtectedRoute>
                  <Invoices />
                </ProtectedRoute>
              }
            />
            <Route
              path="/legal-consultations"
              element={
                <ProtectedRoute>
                  <LegalConsultations />
                </ProtectedRoute>
              }
            />
            <Route
              path="/reports"
              element={
                <ProtectedRoute>
                  <Reports />
                </ProtectedRoute>
              }
            />
            <Route
              path="/finances"
              element={
                <ProtectedRoute>
                  <Finances />
                </ProtectedRoute>
              }
            />
            <Route
              path="/activity-data"
              element={
                <ProtectedRoute>
                  <ActivityData />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  )
}

export default App
