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

const medicines = [
  {
    name: 'Paracetamol',
    description: 'Painkiller and fever reducer',
    composition: 'Paracetamol 500mg',
    dosage: 'Adults: 1-2 tablets every 4-6 hours, max 3 tablets per day',
    side_effects: 'Nausea, vomiting, allergic reactions in rare cases',
    contraindications: 'Do not use if allergic to paracetamol or have severe liver disease',
    price: 50,
    stock: 100,
    category: 'Pain Relief'
  },
  {
    name: 'Aspirin',
    description: 'Anti-inflammatory painkiller and blood thinner',
    composition: 'Acetylsalicylic acid 500mg',
    dosage: 'Adults: 1-2 tablets every 4-6 hours, max 3 tablets per day',
    side_effects: 'Stomach upset, bleeding, allergic reactions',
    contraindications: 'Do not use if you have bleeding disorders or are pregnant',
    price: 40,
    stock: 80,
    category: 'Pain Relief'
  },
  {
    name: 'Ibuprofen',
    description: 'Anti-inflammatory painkiller',
    composition: 'Ibuprofen 400mg',
    dosage: 'Adults: 1 tablet every 6-8 hours with food, max 3 tablets per day',
    side_effects: 'Stomach pain, heartburn, headache',
    contraindications: 'Avoid if you have stomach ulcers or kidney problems',
    price: 60,
    stock: 120,
    category: 'Pain Relief'
  },
  {
    name: 'Cough Syrup',
    description: 'Relieves dry and productive cough',
    composition: 'Dextromethorphan 10mg/5ml',
    dosage: '1 teaspoon (5ml) every 4-6 hours, max 4 times daily',
    side_effects: 'Drowsiness, dizziness, constipation',
    contraindications: 'Do not use with MAOI inhibitors',
    price: 120,
    stock: 50,
    category: 'Cough & Cold'
  },
  {
    name: 'Cetirizine',
    description: 'Antihistamine for allergies',
    composition: 'Cetirizine HCl 10mg',
    dosage: '1 tablet once daily, preferably in the evening',
    side_effects: 'Drowsiness, dry mouth, headache',
    contraindications: 'Avoid if you have severe kidney problems',
    price: 75,
    stock: 60,
    category: 'Allergy'
  },
  {
    name: 'Amoxicillin',
    description: 'Antibiotic for bacterial infections',
    composition: 'Amoxicillin trihydrate 500mg',
    dosage: '1 capsule 3 times daily with meals',
    side_effects: 'Nausea, diarrhea, allergic reactions',
    contraindications: 'Do not use if you are allergic to penicillin',
    price: 150,
    stock: 40,
    category: 'Antibiotic'
  },
  {
    name: 'Antacid Gel',
    description: 'Relieves acidity and heartburn',
    composition: 'Aluminum Hydroxide + Magnesium Hydroxide',
    dosage: '2-3 teaspoons after meals and before bed',
    side_effects: 'Constipation or diarrhea, metallic taste',
    contraindications: 'Avoid if you have kidney disease',
    price: 90,
    stock: 70,
    category: 'Digestive'
  },
  {
    name: 'Vitamin D3',
    description: 'Vitamin supplement for bone health',
    composition: 'Cholecalciferol 1000 IU',
    dosage: '1 capsule daily with food',
    side_effects: 'Nausea, weakness, rare allergic reactions',
    contraindications: 'Avoid excessive intake if you have high calcium levels',
    price: 200,
    stock: 90,
    category: 'Supplement'
  },
  {
    name: 'Metformin',
    description: 'For type 2 diabetes management',
    composition: 'Metformin HCl 500mg',
    dosage: '1 tablet twice daily with meals',
    side_effects: 'Stomach upset, metallic taste, lactic acidosis (rare)',
    contraindications: 'Avoid if you have kidney problems or liver disease',
    price: 180,
    stock: 110,
    category: 'Diabetes'
  },
  {
    name: 'Losartan',
    description: 'For high blood pressure control',
    composition: 'Losartan Potassium 50mg',
    dosage: '1 tablet once daily',
    side_effects: 'Dizziness, fatigue, hyperkalemia',
    contraindications: 'Avoid if pregnant or have severe kidney disease',
    price: 250,
    stock: 55,
    category: 'Blood Pressure'
  }
];

async function seedDatabase() {
  try {
    console.log('📊 Starting database seeding...');
    
    // Create medicines table if it doesn't exist
    await pool.query(`
      CREATE TABLE IF NOT EXISTS medicines (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL UNIQUE,
        description TEXT,
        composition TEXT,
        dosage TEXT,
        side_effects TEXT,
        contraindications TEXT,
        price DECIMAL(10, 2) NOT NULL,
        stock INTEGER NOT NULL DEFAULT 0,
        category VARCHAR(100),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Medicines table ready');

    // Insert sample medicines
    let inserted = 0;
    for (const medicine of medicines) {
      try {
        await pool.query(
          `INSERT INTO medicines (name, description, composition, dosage, side_effects, contraindications, price, stock, category)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
           ON CONFLICT (name) DO UPDATE SET
           description = EXCLUDED.description,
           composition = EXCLUDED.composition,
           dosage = EXCLUDED.dosage,
           side_effects = EXCLUDED.side_effects,
           contraindications = EXCLUDED.contraindications,
           price = EXCLUDED.price,
           stock = EXCLUDED.stock,
           category = EXCLUDED.category`,
          [
            medicine.name,
            medicine.description,
            medicine.composition,
            medicine.dosage,
            medicine.side_effects,
            medicine.contraindications,
            medicine.price,
            medicine.stock,
            medicine.category
          ]
        );
        inserted++;
        console.log(`✅ ${medicine.name} (₹${medicine.price}, ${medicine.stock} units)`);
      } catch (err) {
        console.error(`❌ Error inserting ${medicine.name}:`, err.message);
      }
    }

    console.log(`\n✅ Database seeding complete! ${inserted}/${medicines.length} medicines added.`);
    
    // Show summary
    const result = await pool.query('SELECT COUNT(*) as count, SUM(stock) as total_stock FROM medicines');
    console.log(`\n📊 Summary:`);
    console.log(`   Total medicines: ${result.rows[0].count}`);
    console.log(`   Total stock: ${result.rows[0].total_stock || 0} units`);

  } catch (err) {
    console.error('❌ Seeding error:', err.message);
  } finally {
    await pool.end();
  }
}

seedDatabase();
