import { useState, useEffect } from 'react'

const SyncStatus = () => {
  const [isOnline, setIsOnline] = useState(true)
  const [lastSync, setLastSync] = useState(null)
  const [syncing, setSyncing] = useState(false)

  useEffect(() => {
    checkOnlineStatus()
    const interval = setInterval(checkOnlineStatus, 5000)
    return () => clearInterval(interval)
  }, [])

  const checkOnlineStatus = async () => {
    if (window.electronAPI) {
      const online = await window.electronAPI.syncIsOnline()
      setIsOnline(online)
    }
  }

  const handleSync = async () => {
    if (!window.electronAPI || syncing) return

    setSyncing(true)
    try {
      const pushResult = await window.electronAPI.syncPush()
      const pullResult = await window.electronAPI.syncPull()
      
      if (pushResult.success || pullResult.success) {
        setLastSync(new Date().toLocaleTimeString('ar-SA'))
      }
    } catch (error) {
      console.error('Sync error:', error)
    } finally {
      setSyncing(false)
    }
  }

  return (
    <div className="fixed bottom-4 left-4 bg-white rounded-lg shadow-lg p-3 flex items-center gap-3 z-50">
      <div className="flex items-center gap-2">
        <div
          className={`w-3 h-3 rounded-full ${
            isOnline ? 'bg-green-500' : 'bg-red-500'
          }`}
        />
        <span className="text-sm text-gray-600">
          {isOnline ? 'متصل' : 'غير متصل'}
        </span>
      </div>
      {isOnline && (
        <button
          onClick={handleSync}
          disabled={syncing}
          className="text-xs bg-primary text-white px-3 py-1 rounded hover:bg-primary-light disabled:opacity-50"
        >
          {syncing ? 'جاري المزامنة...' : 'مزامنة'}
        </button>
      )}
      {lastSync && (
        <span className="text-xs text-gray-500">آخر مزامنة: {lastSync}</span>
      )}
    </div>
  )
}

export default SyncStatus
