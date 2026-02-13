const { Pool } = require('pg')
const { app } = require('electron')
const Store = require('electron-store')
const { v4: uuidv4 } = require('uuid')

class DatabaseManager {
  constructor() {
    this.store = new Store()
    this.pool = null
    this.init()
  }

  async init() {
    // Get database config from store or use defaults
    const dbConfig = {
      host: this.store.get('db_host', 'localhost'),
      port: this.store.get('db_port', 5432),
      database: this.store.get('db_name', 'tasaheel'),
      user: this.store.get('db_user', 'postgres'),
      password: this.store.get('db_password', '85218523'),
    }

    this.pool = new Pool({
      ...dbConfig,
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
    })

    // Test connection
    try {
      await this.pool.query('SELECT 1')
      console.log('Connected to PostgreSQL successfully')
      
      // Create tables if they don't exist
      await this.createTables()
    } catch (error) {
      console.error('Failed to connect to PostgreSQL:', error.message)
      throw error
    }
  }

  async createTables() {
    // Use the same users table as Backend, but add sync_status column if it doesn't exist
    // Check if sync_status column exists
    try {
      const checkColumn = await this.pool.query(`
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name='users' AND column_name='sync_status'
      `)
      
      if (checkColumn.rows.length === 0) {
        // Add sync_status column to users table (allow NULL initially, then update existing rows)
        await this.pool.query(`
          ALTER TABLE users 
          ADD COLUMN sync_status VARCHAR(20) DEFAULT 'synced'
        `)
        // Update existing rows to have 'synced' status
        await this.pool.query(`
          UPDATE users SET sync_status = 'synced' WHERE sync_status IS NULL
        `)
      }
    } catch (error) {
      console.error('Error checking/adding sync_status column:', error.message)
      // Continue anyway - column might already exist
    }

    // Create sync_log table (separate from main users table)
    await this.pool.query(`
      CREATE TABLE IF NOT EXISTS desktop_sync_log (
        id SERIAL PRIMARY KEY,
        device_id VARCHAR(255) UNIQUE NOT NULL,
        last_sync_timestamp TIMESTAMP NOT NULL,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `)

    // Create indexes on users table for sync
    await this.pool.query(`
      CREATE INDEX IF NOT EXISTS idx_users_sync_status ON users(sync_status)
    `)
    await this.pool.query(`
      CREATE INDEX IF NOT EXISTS idx_users_updated_at ON users(updated_at)
    `)
  }

  async getEmployees() {
    // Read from main users table (same as Backend)
    const result = await this.pool.query(
      'SELECT * FROM users WHERE role = $1 ORDER BY created_at DESC',
      ['Employee']
    )
    return result.rows
  }

  async getEmployeeById(id) {
    const result = await this.pool.query(
      'SELECT * FROM users WHERE id = $1',
      [id]
    )
    return result.rows[0] || null
  }

  async createEmployee(employeeData) {
    const { id, username, password, role = 'Employee', is_active = true } = employeeData
    const now = new Date()

    try {
      // Check if username already exists
      const existingUser = await this.pool.query(
        'SELECT id FROM users WHERE username = $1',
        [username]
      )
      
      if (existingUser.rows.length > 0) {
        return { success: false, error: 'اسم المستخدم موجود بالفعل' }
      }

      // Insert into main users table with sync_status = 'pending'
      // Note: password should be hashed, but for now we'll store it as-is (Backend will hash it)
      await this.pool.query(
        `INSERT INTO users 
         (id, username, password, role, is_active, sync_status, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [id, username, password, role, is_active, 'pending', now, now]
      )
      return { success: true, id }
    } catch (error) {
      console.error('Error creating employee:', error)
      return { success: false, error: error.message }
    }
  }

  async updateEmployee(id, employeeData) {
    const { username, password, is_active } = employeeData
    const now = new Date()

    const updates = []
    const values = []
    let paramCount = 1

    if (username !== undefined) {
      updates.push(`username = $${paramCount++}`)
      values.push(username)
    }
    if (password !== undefined) {
      updates.push(`password = $${paramCount++}`)
      values.push(password)
    }
    if (is_active !== undefined) {
      updates.push(`is_active = $${paramCount++}`)
      values.push(is_active)
    }

    updates.push(`sync_status = $${paramCount++}`)
    values.push('pending')
    updates.push(`updated_at = $${paramCount++}`)
    values.push(now)
    values.push(id)

    const query = `UPDATE users SET ${updates.join(', ')} WHERE id = $${paramCount}`

    try {
      await this.pool.query(query, values)
      return { success: true }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }

  async getPendingSyncRecords() {
    const result = await this.pool.query(
      'SELECT * FROM users WHERE sync_status = $1',
      ['pending']
    )
    return result.rows
  }

  async markAsSynced(id) {
    await this.pool.query(
      'UPDATE users SET sync_status = $1 WHERE id = $2',
      ['synced', id]
    )
  }

  async upsertEmployee(employeeData) {
    const { id, username, password, role, is_active, created_at, updated_at } = employeeData

    const existing = await this.getEmployeeById(id)

    if (existing) {
      const existingDate = new Date(existing.updated_at)
      const newDate = new Date(updated_at)

      if (newDate > existingDate) {
        await this.pool.query(
          `UPDATE users 
           SET username = $1, password = $2, role = $3, is_active = $4, 
               sync_status = $5, updated_at = $6
           WHERE id = $7`,
          [username, password, role, is_active, 'synced', updated_at, id]
        )
      }
    } else {
      await this.pool.query(
        `INSERT INTO users 
         (id, username, password, role, is_active, sync_status, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
         ON CONFLICT (id) DO UPDATE SET
           username = EXCLUDED.username,
           password = EXCLUDED.password,
           role = EXCLUDED.role,
           is_active = EXCLUDED.is_active,
           sync_status = 'synced',
           updated_at = EXCLUDED.updated_at`,
        [id, username, password, role, is_active, 'synced', created_at, updated_at]
      )
    }
  }

  async getSyncStatus() {
    const result = await this.pool.query('SELECT * FROM desktop_sync_log LIMIT 1')
    return result.rows[0] || null
  }

  async updateSyncStatus(deviceId, timestamp) {
    const now = new Date()
    await this.pool.query(
      `INSERT INTO desktop_sync_log (device_id, last_sync_timestamp, created_at, updated_at)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (device_id) DO UPDATE SET
         last_sync_timestamp = $2,
         updated_at = $4`,
      [deviceId, timestamp, now, now]
    )
  }

  async getDeviceId() {
    const result = await this.pool.query('SELECT device_id FROM desktop_sync_log LIMIT 1')
    
    if (result.rows.length > 0) {
      return result.rows[0].device_id
    }

    // Generate new device ID
    const deviceId = uuidv4()
    const now = new Date()
    await this.pool.query(
      `INSERT INTO desktop_sync_log (device_id, last_sync_timestamp, created_at, updated_at)
       VALUES ($1, $2, $3, $4)`,
      [deviceId, now, now, now]
    )
    return deviceId
  }

  async close() {
    if (this.pool) {
      await this.pool.end()
    }
  }
}

module.exports = DatabaseManager
