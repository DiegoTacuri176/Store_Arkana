"use server"

import mysql from "mysql2/promise"

let pool: mysql.Pool | null = null

// Inicializa el pool
function getPool() {
  if (!pool) {
    pool = mysql.createPool({
      host: process.env.DATABASE_HOST || "localhost",
      port: Number.parseInt(process.env.DATABASE_PORT || "3306"),
      user: process.env.DATABASE_USER || "root",
      password: process.env.DATABASE_PASSWORD || "root",
      database: process.env.DATABASE_NAME || "student_marketplace",
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
      enableKeepAlive: true,
      keepAliveInitialDelay: 0,
    })
  }
  return pool
}

// Ejecucion de query
export async function query<T = any>(sql: string, params?: any[]): Promise<T[]> {
  try {
    const pool = getPool()
    const [results] = await pool.execute(sql, params)
    return results as T[]
  } catch (error) {
    console.error("[Database] Query error:", error)
    throw error
  }
}

export async function queryOne<T = any>(sql: string, params?: any[]): Promise<T | null> {
  try {
    const pool = getPool()
    const [results] = await pool.execute(sql, params)
    const rows = results as T[]
    return rows.length > 0 ? rows[0] : null
  } catch (error) {
    console.error("[Database] QueryOne error:", error)
    throw error
  }
}

//Verificar la conexión con la base de datos
export async function testConnection(): Promise<boolean> {
  try {
    const pool = getPool()
    await pool.query("SELECT 1")
    console.log("[Database] Connection successful ✅")
    return true
  } catch (error) {
    console.error("[Database] Connection failed ❌:", error)
    return false
  }
}

if (require.main === module) {
  ;(async () => {
    console.log("🔍 Testing MySQL connection...")
    await testConnection()
    process.exit(0)
  })()
}
