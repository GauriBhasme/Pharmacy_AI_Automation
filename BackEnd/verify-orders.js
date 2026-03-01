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

async function verifyOrders() {
  try {
    console.log('📋 Fetching all orders from database...\n');
    
    const result = await pool.query(`
      SELECT 
        id, 
        user_id, 
        medicine_id,
        medicine_name,
        quantity,
        total_price,
        dosage,
        frequency,
        prescription_required,
        status,
        created_at,
        purchase_date
      FROM orders 
      ORDER BY created_at DESC
      LIMIT 10
    `);

    console.log(`✅ Found ${result.rows.length} orders:\n`);
    
    result.rows.forEach((order, idx) => {
      console.log(`${idx + 1}. Order #${order.id}`);
      console.log(`   User ID: ${order.user_id}`);
      console.log(`   Medicine: ${order.medicine_name} (ID: ${order.medicine_id})`);
      console.log(`   Quantity: ${order.quantity}`);
      console.log(`   Dosage: ${order.dosage}`);
      console.log(`   Frequency: ${order.frequency}`);
      console.log(`   Total Price: ₹${order.total_price}`);
      console.log(`   Status: ${order.status}`);
      console.log(`   Created: ${new Date(order.created_at).toLocaleString()}`);
      console.log();
    });

    await pool.end();
    console.log('✅ Database verification complete!');

  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
}

verifyOrders();
