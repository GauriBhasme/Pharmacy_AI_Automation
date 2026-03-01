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

async function testDashboardMetrics() {
  console.log('🧪 Testing Admin Dashboard Metrics...\n');

  try {
    // Total medicines count
    const medicinesResult = await pool.query(
      "SELECT COUNT(*) AS totalmedicines FROM medicines"
    );

    // Low stock alerts (stock < 20)
    const lowStockResult = await pool.query(
      "SELECT COUNT(*) AS lowstockalerts FROM medicines WHERE stock < 20"
    );

    // Total orders
    const ordersResult = await pool.query(
      "SELECT COUNT(*) AS totalorders FROM orders"
    );

    // Orders today
    const ordersToday = await pool.query(
      "SELECT COUNT(*) AS orderstoday FROM orders WHERE DATE(created_at) = CURRENT_DATE"
    );

    console.log('✅ Dashboard metrics retrieved from database!\n');
    console.log('📊 Metrics:');
    console.log(`   Total Medicines: ${medicinesResult.rows[0].totalmedicines}`);
    console.log(`   Low Stock Alerts (stock < 20): ${lowStockResult.rows[0].lowstockalerts}`);
    console.log(`   Orders Today: ${ordersToday.rows[0].orderstoday}`);
    console.log(`   Total Orders: ${ordersResult.rows[0].totalorders}`);
    
    await pool.end();
    console.log('\n✅ All metrics loaded successfully!');

  } catch (err) {
    console.error('❌ Database Error:', err.message);
    process.exit(1);
  }
}

testDashboardMetrics();
