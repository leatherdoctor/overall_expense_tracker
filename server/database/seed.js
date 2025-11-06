import bcrypt from 'bcryptjs';
import pool from './mysql.js';

async function seedDatabase() {
  try {
    const connection = await pool.getConnection();

    // Check if user already exists
    const [existingUsers] = await connection.query(
      'SELECT id FROM users WHERE username = ?',
      [process.env.DEFAULT_USERNAME]
    );

    if (existingUsers.length === 0) {
      // Hash the password
      const hashedPassword = await bcrypt.hash(process.env.DEFAULT_PASSWORD, 10);

      // Insert default user
      await connection.query(
        'INSERT INTO users (username, password, full_name) VALUES (?, ?, ?)',
        [process.env.DEFAULT_USERNAME, hashedPassword, process.env.DEFAULT_FULL_NAME]
      );

      console.log('✅ Default user created:');
      console.log('   Username: Aayush');
      console.log('   Password: Aayush04!4#');
    } else {
      console.log('✅ Default user already exists');
    }

    connection.release();
  } catch (error) {
    console.error('❌ Seed error:', error.message);
  }
}

// Run seed
await seedDatabase();

export default seedDatabase;
