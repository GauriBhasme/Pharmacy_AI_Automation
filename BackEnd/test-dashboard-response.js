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

async function testGetDashboardEndpoint() {
  console.log('🧪 Testing User Dashboard Endpoint Logic...\n');

  try {
    // Simulate getDashboard for user_id = 1
    const userId = 1;

    // Total orders for this user
    const totalOrdersResult = await pool.query(
      "SELECT COUNT(*) as totalorders FROM orders WHERE user_id = $1",
      [userId]
    );

    // Active medications (last 5 orders with medicine details)
    const activeMedicationsResult = await pool.query(
      `SELECT DISTINCT ON (medicine_id) 
        medicine_id, medicine_name, quantity, total_price, created_at
       FROM orders 
       WHERE user_id = $1 
       ORDER BY medicine_id, created_at DESC 
       LIMIT 5`,
      [userId]
    );

    // Refill alerts (medicines where 30+ days have passed since order)
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

    const response = {
      totalOrders: parseInt(totalOrdersResult.rows[0].totalorders),
      activeMedications: activeMedicationsResult.rows.map(med => ({
        medicine_id: med.medicine_id,
        medicine_name: med.medicine_name,
        quantity: med.quantity,
        total_price: med.total_price,
        ordered_date: med.created_at
      })),
      refillAlerts: refillAlertsResult.rows.map(alert => ({
        medicine_id: alert.medicine_id,
        medicine_name: alert.medicine_name,
        quantity: alert.quantity,
        ordered_date: alert.created_at,
        days_since_order: alert.days_since_order
      })),
      totalChats: 0
    };

    console.log('✅ Dashboard endpoint response:\n');
    console.log(JSON.stringify(response, null, 2));

    console.log('\n📊 Summary:');
    console.log(`✅ Total Orders: ${response.totalOrders}`);
    console.log(`✅ Active Medications: ${response.activeMedications.length}`);
    console.log(`✅ Refill Alerts: ${response.refillAlerts.length}`);
    console.log(`✅ Total Chats: ${response.totalChats}`);

    await pool.end();
    console.log('\n✅ All user dashboard data ready for frontend!');

  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
}

testGetDashboardEndpoint();
