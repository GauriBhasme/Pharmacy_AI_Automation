import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const pool = new pg.Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

async function testUserDashboardMetrics() {
  console.log('🧪 Testing User Dashboard Metrics (Database)...\n');

  try {
    // Check if users exist
    const usersResult = await pool.query('SELECT user_id, user_name, email FROM users LIMIT 3');
    
    if (usersResult.rows.length === 0) {
      console.log('⚠️ No users in database. Creating test user...');
      await pool.end();
      process.exit(0);
    }

    const testUser = usersResult.rows[0];
    const userId = testUser.user_id;

    console.log(`✅ Found test user: ${testUser.user_name} (ID: ${userId})\n`);

    // Total orders for this user
    const totalOrdersResult = await pool.query(
      "SELECT COUNT(*) as totalorders FROM orders WHERE user_id = $1",
      [userId]
    );

    // Active medications (last 5 orders)
    const activeMedicationsResult = await pool.query(
      `SELECT DISTINCT ON (medicine_id) 
        medicine_id, medicine_name, quantity, total_price, created_at
       FROM orders 
       WHERE user_id = $1 
       ORDER BY medicine_id, created_at DESC 
       LIMIT 5`,
      [userId]
    );

    // Refill alerts (medicines ordered 30+ days ago)
    const refillAlertsResult = await pool.query(
      `SELECT medicine_id, medicine_name, quantity, created_at,
              CURRENT_DATE - DATE(created_at) as days_since_order
       FROM orders 
       WHERE user_id = $1 
       AND DATE(created_at) <= CURRENT_DATE - INTERVAL '30 days'
       ORDER BY created_at DESC
       LIMIT 10`,
      [userId]
    );

    console.log('📊 User Dashboard Metrics:');
    console.log(`   Total Orders: ${totalOrdersResult.rows[0].totalorders}`);
    console.log(`   Active Medications: ${activeMedicationsResult.rows.length}`);
    console.log(`   Refill Alerts (30+ days): ${refillAlertsResult.rows.length}`);
    console.log(`   Total Chats: 0 (chat_logs table not set up)`);

    if (activeMedicationsResult.rows.length > 0) {
      console.log('\n💊 Active Medications:');
      activeMedicationsResult.rows.forEach((med, idx) => {
        console.log(`   ${idx + 1}. ${med.medicine_name} (Qty: ${med.quantity}, Price: ₹${med.total_price})`);
      });
    } else {
      console.log('\n💊 No active medications for this user');
    }

    if (refillAlertsResult.rows.length > 0) {
      console.log('\n🚨 Refill Alerts:');
      refillAlertsResult.rows.forEach((alert, idx) => {
        console.log(`   ${idx + 1}. ${alert.medicine_name} (${alert.days_since_order} days since order)`);
      });
    } else {
      console.log('\n🚨 No refill alerts (no orders older than 30 days)');
    }

    await pool.end();
    console.log('\n✅ User dashboard metrics retrieved successfully!');

  } catch (err) {
    console.error('❌ Database Error:', err.message);
    process.exit(1);
  }
}

testUserDashboardMetrics();
