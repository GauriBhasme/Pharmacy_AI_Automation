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

async function checkUsers() {
  try {
    console.log('🔍 Checking existing users in database...\n');
    
    const result = await pool.query(
      'SELECT user_id, user_name, email, user_role FROM users LIMIT 10'
    );

    if (result.rows.length === 0) {
      console.log('❌ No users found in database');
      console.log('\nℹ️ You need to create a test user first');
    } else {
      console.log(`✅ Found ${result.rows.length} users:\n`);
      result.rows.forEach((user, idx) => {
        console.log(`${idx + 1}. ${user.user_name} (ID: ${user.user_id})`);
        console.log(`   Email: ${user.email}`);
        console.log(`   Role: ${user.user_role}\n`);
      });
    }

    await pool.end();

  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
}

checkUsers();
