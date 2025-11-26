import { NextResponse } from "next/server"
import { query } from "@/lib/server/mysql"

export async function GET() {
  try {
    // Test basic connection
    const result = await query("SELECT 1 as test, NOW() as current_time")

    // Get table count
    const tables = await query(`
      SELECT COUNT(*) as count 
      FROM INFORMATION_SCHEMA.TABLES 
      WHERE TABLE_SCHEMA = DATABASE()
    `)

    // Get user count
    const users = await query("SELECT COUNT(*) as count FROM users")

    return NextResponse.json({
      success: true,
      message: "Database connection successful",
      data: {
        connected: true,
        currentTime: result[0].current_time,
        tablesCount: tables[0].count,
        usersCount: users[0].count,
      },
    })
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        message: "Database connection failed",
        error: error.message,
      },
      { status: 500 },
    )
  }
}
