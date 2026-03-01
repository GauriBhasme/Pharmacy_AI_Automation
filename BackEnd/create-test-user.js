import pg from 'pg';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';

dotenv.config();

const pool = new pg.Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

async function createTestUser() {
  try {
    console.log('👤 Creating Test User for Dashboard Testing\n');
    
    // Test credentials
    const testEmail = 'dashboardtest@pharmacy.com';
    const testPassword = 'test12345';
    const testUsername = 'Dashboard Tester';
    const testPhone = '9999999999';

    // Hash the password
    const hashedPassword = await bcrypt.hash(testPassword, 10);

    // Check if user already exists
    console.log(`📝 Checking if user ${testEmail} already exists...`);
    const existingUser = await pool.query(
      'SELECT user_id FROM users WHERE email = $1',
      [testEmail]
    );

    if (existingUser.rows.length > 0) {
      console.log('ℹ️ User already exists\n');
      console.log('✅ Test Credentials:');
      console.log(`   Email: ${testEmail}`);
      console.log(`   Password: ${testPassword}`);
      await pool.end();
      return;
    }

    // Create the user
    console.log('Creating new test user...');
    const result = await pool.query(
      `INSERT INTO users (user_name, email, hashed_password, phone, user_role) 
       VALUES ($1, $2, $3, $4, $5) 
       RETURNING user_id`,
      [testUsername, testEmail, hashedPassword, testPhone, 'user']
    );

    const userId = result.rows[0].user_id;
    console.log(`✅ Test user created successfully!\n`);
    console.log('✅ Test Credentials:');
    console.log(`   Email: ${testEmail}`);
    console.log(`   Password: ${testPassword}`);
    console.log(`   User ID: ${userId}`);
    console.log(`   Role: user`);
    console.log('\n💡 Use these credentials to login and test the dashboard.');

    await pool.end();

  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
}

createTestUser();
