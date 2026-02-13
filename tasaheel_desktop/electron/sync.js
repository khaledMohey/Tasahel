const axios = require('axios')
const { v4: uuidv4 } = require('uuid')
const Store = require('electron-store')

class SyncEngine {
  constructor(db) {
    this.db = db
    this.store = new Store()
    this.apiUrl = process.env.API_URL || 'http://localhost:8000'
    this.authToken = this.store.get('auth_token', null)
    
    // Set default axios config
    if (this.authToken) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${this.authToken}`
    }
  }

  setAuthToken(token) {
    this.authToken = token
    this.store.set('auth_token', token)
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
  }

  getAuthToken() {
    return this.authToken
  }

  async checkOnline() {
    // Check if we can reach the API server
    try {
      const https = require('https')
      const http = require('http')
      const url = require('url')
      
      const apiUrl = new URL(this.apiUrl)
      const protocol = apiUrl.protocol === 'https:' ? https : http
      
      return new Promise((resolve) => {
        const req = protocol.request({
          hostname: apiUrl.hostname,
          port: apiUrl.port || (apiUrl.protocol === 'https:' ? 443 : 80),
          path: '/api/auth/login/',
          method: 'HEAD',
          timeout: 3000
        }, () => {
          resolve(true)
        })
        req.on('error', () => resolve(false))
        req.on('timeout', () => {
          req.destroy()
          resolve(false)
        })
        req.end()
      })
    } catch {
      // If check fails, assume offline to be safe
      return false
    }
  }

  async push() {
    if (!this.authToken) {
      return { success: false, error: 'لم يتم تسجيل الدخول' }
    }

    try {
      const pendingRecords = await this.db.getPendingSyncRecords()
      if (pendingRecords.length === 0) {
        return { success: true, message: 'لا توجد سجلات للمزامنة' }
      }

      const deviceId = await this.db.getDeviceId()
      
      // Format records for API
      const records = pendingRecords.map(record => ({
        id: record.id,
        username: record.username,
        password: record.password, // In production, this should be hashed
        role: record.role,
        is_active: record.is_active === true || record.is_active === 1,
        updated_at: record.updated_at,
      }))

      const response = await axios.post(`${this.apiUrl}/api/sync/push/`, {
        device_id: deviceId,
        records: records,
      })

      // Mark records as synced
      if (response.data.success) {
        for (const record of pendingRecords) {
          await this.db.markAsSynced(record.id)
        }
      }

      // Update sync log
      if (response.data.sync_timestamp) {
        await this.db.updateSyncStatus(deviceId, response.data.sync_timestamp)
      }

      return {
        success: true,
        created: response.data.created || 0,
        updated: response.data.updated || 0,
      }
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || error.message || 'فشلت عملية المزامنة',
      }
    }
  }

  async pull() {
    if (!this.authToken) {
      return { success: false, error: 'لم يتم تسجيل الدخول' }
    }

    try {
      const deviceId = await this.db.getDeviceId()
      const syncStatus = await this.db.getSyncStatus()
      
      const lastSyncTimestamp = syncStatus?.last_sync_timestamp || 
        new Date(0).toISOString()

      const response = await axios.post(`${this.apiUrl}/api/sync/pull/`, {
        device_id: deviceId,
        last_sync_timestamp: lastSyncTimestamp,
      })

      if (response.data.success && response.data.records) {
        // Update local database with pulled records
        for (const record of response.data.records) {
          await this.db.upsertEmployee({
            id: record.id,
            username: record.username,
            password: '', // Password not returned from server
            role: record.role,
            is_active: record.is_active,
            created_at: record.created_at,
            updated_at: record.updated_at,
          })
        }
      }

      // Update sync log
      if (response.data.sync_timestamp) {
        await this.db.updateSyncStatus(deviceId, response.data.sync_timestamp)
      }

      return {
        success: true,
        count: response.data.count || 0,
      }
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || error.message || 'فشلت عملية المزامنة',
      }
    }
  }

  async sync() {
    // Push first, then pull
    const pushResult = await this.push()
    const pullResult = await this.pull()
    
    return {
      push: pushResult,
      pull: pullResult,
    }
  }
}

module.exports = SyncEngine
