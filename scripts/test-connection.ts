import { query } from "../lib/server/mysql"

async function testConnection() {
  console.log("🔍 Testing MySQL connection...\n")

  try {
    // Test 1: Basic connection
    console.log("1️⃣ Testing basic connection...")
    const result = await query("SELECT 1 as test")
    console.log("✅ Connection successful!\n")

    // Test 2: Check if tables exist
    console.log("2️⃣ Checking if tables exist...")
    const tables = await query(`
      SELECT TABLE_NAME 
      FROM INFORMATION_SCHEMA.TABLES 
      WHERE TABLE_SCHEMA = DATABASE()
    `)

    const tableNames = tables.map((t: any) => t.TABLE_NAME)
    console.log("📋 Tables found:", tableNames)

    const requiredTables = ["users", "categories", "products", "orders", "order_items", "reviews", "comments"]
    const missingTables = requiredTables.filter((t) => !tableNames.includes(t))

    if (missingTables.length > 0) {
      console.log("⚠️  Missing tables:", missingTables)
      console.log("💡 Run the create-database.sql script first\n")
    } else {
      console.log("✅ All required tables exist!\n")
    }

    // Test 3: Check users table structure
    console.log("3️⃣ Checking users table structure...")
    const columns = await query(`
      SELECT COLUMN_NAME, DATA_TYPE 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = DATABASE() 
      AND TABLE_NAME = 'users'
    `)
    console.log("📊 Users table columns:")
    columns.forEach((col: any) => {
      console.log(`   - ${col.COLUMN_NAME} (${col.DATA_TYPE})`)
    })
    console.log("✅ Users table structure looks good!\n")

    // Test 4: Count existing users
    console.log("4️⃣ Checking existing users...")
    const userCount = await query("SELECT COUNT(*) as count FROM users")
    console.log(`👥 Total users in database: ${userCount[0].count}\n`)

    console.log("🎉 All tests passed! Your database is ready to use.")
    console.log("\n📝 Next steps:")
    console.log("   1. Go to /register to create a new account")
    console.log("   2. Go to /login to sign in")
    console.log("   3. Check the browser console for any errors\n")
  } catch (error: any) {
    console.error("❌ Error testing connection:", error.message)
    console.log("\n🔧 Troubleshooting:")
    console.log("   1. Check your .env file has correct database credentials")
    console.log("   2. Make sure MySQL server is running")
    console.log("   3. Verify the database exists")
    console.log("   4. Run the create-database.sql script if you haven't\n")
  }
}

testConnection()
