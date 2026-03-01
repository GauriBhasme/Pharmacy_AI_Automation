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

async function createTablesIfNotExists() {
  try {
    console.log('📊 Creating orders table...');
    
    // Create orders table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS orders (
        order_id SERIAL PRIMARY KEY,
        user_id INTEGER,
        medicine_id INTEGER,
        quantity INTEGER NOT NULL,
        total_amount DECIMAL(10, 2) NOT NULL,
        status VARCHAR(50) DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Orders table created/verified');

    // Add foreign key constraint if it doesn't exist
    try {
      await pool.query(`
        ALTER TABLE orders
        ADD CONSTRAINT fk_orders_medicines
        FOREIGN KEY (medicine_id) REFERENCES medicines(id) ON DELETE CASCADE
      `);
      console.log('✅ Foreign key constraint added to orders');
    } catch (err) {
      // Constraint might already exist
      if (!err.message.includes('already exists')) {
        console.log('ℹ️ Foreign key constraint already exists or skipped');
      }
    }

    await pool.end();
    console.log('✅ Database migration complete!');

  } catch (err) {
    console.error('❌ Migration failed:', err.message);
    process.exit(1);
  }
}

createTablesIfNotExists();
