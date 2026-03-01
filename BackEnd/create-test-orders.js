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

async function createTestOrders() {
  try {
    console.log('📦 Creating Test Orders for Dashboard Test User\n');

    const userId = 4; // The test user we just created
    
    // Create a few matching orders
    const medicines = [
      { id: 1, name: 'Paracetamol', price: 50, quantity: 2, dosage: '500mg', frequency: 'twice daily' },
      { id: 2, name: 'Aspirin', price: 40, quantity: 2, dosage: '100mg', frequency: 'once daily' },
      { id: 4, name: 'Cough Syrup', price: 120, quantity: 3, dosage: '10ml', frequency: '3 times daily' }
    ];

    console.log(`📝 Inserting orders for user_id ${userId}...\n`);

    for (const med of medicines) {
      const totalPrice = med.price * med.quantity;
      const result = await pool.query(
        `INSERT INTO orders (user_id, medicine_id, medicine_name, quantity, total_price, dosage, frequency, prescription_required, status, created_at, purchase_date) 
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW(), NOW())
         RETURNING id`,
        [userId, med.id, med.name, med.quantity, totalPrice, med.dosage, med.frequency, false, 'delivered']
      );
      console.log(`✅ Order created: ${med.name} (Order ID: ${result.rows[0].id})`);
    }

    console.log(`\n✅ Test orders created successfully!`);
    console.log(`   User ID: ${userId}`);
    console.log(`   Email: dashboardtest@pharmacy.com`);
    console.log(`   Password: test12345`);
    console.log(`\n🧪 Login with these credentials to test the UserDashboard`);

    await pool.end();

  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
}

createTestOrders();
