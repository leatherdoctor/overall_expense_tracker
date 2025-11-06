import { Pool } from 'pg';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Initialize PostgreSQL connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://localhost:5432/expense_tracker',
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Test the connection
pool.on('connect', () => {
  console.log('✅ Connected to PostgreSQL database');
});

pool.on('error', (err) => {
  console.error('❌ Unexpected error on idle client', err);
  process.exit(-1);
});

// Initialize database tables
const initializeDatabase = async () => {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    // Create expenses table
    await client.query(`
      CREATE TABLE IF NOT EXISTS expenses (
        id SERIAL PRIMARY KEY,
        category VARCHAR(255) NOT NULL,
        amount DECIMAL(10, 2) NOT NULL,
        note TEXT,
        date DATE NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create index for faster queries
    await client.query('CREATE INDEX IF NOT EXISTS idx_expenses_date ON expenses(date)');
    await client.query('CREATE INDEX IF NOT EXISTS idx_expenses_category ON expenses(category)');
    
    await client.query('COMMIT');
    console.log('✅ Database tables initialized successfully');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Error initializing database:', error);
    throw error;
  } finally {
    client.release();
  }
};

// Run initialization
initializeDatabase().catch(console.error);

export default pool;
