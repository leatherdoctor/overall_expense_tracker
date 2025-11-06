import bcrypt from 'bcryptjs';
import pool from './mysql.js';

async function seedDatabase() {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');

    // Check if user already exists
    const result = await client.query(
      'SELECT id FROM users WHERE username = $1',
      [process.env.DEFAULT_USERNAME || 'Aayush']
    );

    if (result.rows.length === 0) {
      // Hash the password
      const hashedPassword = await bcrypt.hash(process.env.DEFAULT_PASSWORD || 'Aayush04!4#', 10);

      // Insert default user
      await client.query(
        'INSERT INTO users (username, password, full_name) VALUES ($1, $2, $3) RETURNING id',
        [
          process.env.DEFAULT_USERNAME || 'Aayush',
          hashedPassword,
          process.env.DEFAULT_FULL_NAME || 'Aayush'
        ]
      );

      console.log('✅ Default user created:');
      console.log('   Username:', process.env.DEFAULT_USERNAME || 'Aayush');
      console.log('   Password:', process.env.DEFAULT_PASSWORD ? '********' : 'Aayush04!4#');
      
      await client.query('COMMIT');
    } else {
      console.log('✅ Default user already exists');
    }
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Seed error:', error.message);
    throw error;
  } finally {
    client.release();
  }
}

// Run seed
await seedDatabase();

export default seedDatabase;
