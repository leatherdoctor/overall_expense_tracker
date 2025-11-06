import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'root',
  database: process.env.DB_NAME || 'expense_tracker',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

// Create connection pool
const pool = mysql.createPool(dbConfig);

// Test connection and create database if it doesn't exist
async function initializeDatabase() {
  try {
    // First connect without database to create it if needed
    const tempConnection = await mysql.createConnection({
      host: dbConfig.host,
      port: dbConfig.port,
      user: dbConfig.user,
      password: dbConfig.password
    });

    // Create database if it doesn't exist
    await tempConnection.query(`CREATE DATABASE IF NOT EXISTS ${dbConfig.database}`);
    console.log(`✅ Database '${dbConfig.database}' ready`);
    await tempConnection.end();

    // Now connect to the database and create tables
    const connection = await pool.getConnection();

    // Create users table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(50) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        full_name VARCHAR(100),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    // Create expenses table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS expenses (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        category VARCHAR(100) NOT NULL,
        amount DECIMAL(10, 2) NOT NULL,
        note TEXT,
        date DATE NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        INDEX idx_user_date (user_id, date),
        INDEX idx_user_category (user_id, category)
      )
    `);

    // Create income table (for salary and other income)
    await connection.query(`
      CREATE TABLE IF NOT EXISTS income (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        source VARCHAR(100) NOT NULL,
        amount DECIMAL(10, 2) NOT NULL,
        note TEXT,
        date DATE NOT NULL,
        type ENUM('salary', 'bonus', 'investment', 'other') DEFAULT 'salary',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        INDEX idx_user_date (user_id, date),
        INDEX idx_user_type (user_id, type)
      )
    `);

    connection.release();
    console.log('✅ Database tables created successfully');

  } catch (error) {
    console.error('❌ Database initialization error:', error.message);
    throw error;
  }
}

// Initialize database on startup
await initializeDatabase();

export default pool;
