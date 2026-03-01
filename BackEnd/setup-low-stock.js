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

async function setupLowStockAlerts() {
  try {
    console.log('📦 Setting up Low Stock Alerts Demo\n');
    console.log('====================================\n');

    // Get test user's medicines (user_id: 4)
    console.log('📝 Step 1: Finding medicines ordered by test user...');
    const userMedicinesResult = await pool.query(
      `SELECT DISTINCT medicine_id, medicine_name 
       FROM orders 
       WHERE user_id = 4`
    );

    console.log(`✅ Found ${userMedicinesResult.rows.length} medicines ordered:\n`);
    userMedicinesResult.rows.forEach((med, i) => {
      console.log(`   ${i + 1}. ${med.medicine_name} (ID: ${med.medicine_id})`);
    });

    // Set some of these medicines to low stock (< 20)
    console.log('\n📝 Step 2: Setting some medicines to low stock (<20 units)...');
    
    // Set first medicine to 15 units
    if (userMedicinesResult.rows[0]) {
      const medId = userMedicinesResult.rows[0].medicine_id;
      await pool.query(
        'UPDATE medicines SET stock = 15 WHERE medicine_id = $1',
        [medId]
      );
      console.log(`   ✅ ${userMedicinesResult.rows[0].medicine_name}: Set to 15 units`);
    }

    // Set second medicine to 8 units
    if (userMedicinesResult.rows[1]) {
      const medId = userMedicinesResult.rows[1].medicine_id;
      await pool.query(
        'UPDATE medicines SET stock = 8 WHERE medicine_id = $1',
        [medId]
      );
      console.log(`   ✅ ${userMedicinesResult.rows[1].medicine_name}: Set to 8 units`);
    }

    // Verify changes
    console.log('\n📝 Step 3: Verifying low stock medicines...');
    const lowStockResult = await pool.query(
      `SELECT medicine_id, medicine_name, stock, price 
       FROM medicines 
       WHERE medicine_id IN (SELECT DISTINCT medicine_id FROM orders WHERE user_id = 4)
       AND stock < 20
       ORDER BY stock ASC`
    );

    console.log(`✅ Found ${lowStockResult.rows.length} medicines with low stock:\n`);
    lowStockResult.rows.forEach((med, i) => {
      console.log(`   ${i + 1}. ${med.medicine_name}`);
      console.log(`      Current Stock: ${med.stock} units`);
      console.log(`      Price: ₹${med.price}`);
    });

    console.log('\n====================================');
    console.log('✅ Low stock alerts setup complete!\n');
    console.log('🎯 Next steps:');
    console.log('1. Run the backend test: node test-login-dashboard.js');
    console.log('2. You should see "lowStockAlerts" in the response');
    console.log('3. Login on frontend with:');
    console.log('   Email: dashboardtest@pharmacy.com');
    console.log('   Password: test12345');
    console.log('4. Navigate to Dashboard');
    console.log('5. You should see low stock alerts displayed!');

    await pool.end();

  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
}

setupLowStockAlerts();
