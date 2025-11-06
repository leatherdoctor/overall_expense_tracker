import Database from 'better-sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { existsSync, mkdirSync } from 'fs';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Ensure database directory exists
const dbDir = join(__dirname);
if (!existsSync(dbDir)) {
  mkdirSync(dbDir, { recursive: true });
}

const dbPath = process.env.DB_PATH || join(__dirname, 'expenses.db');

// Initialize database
const db = new Database(dbPath);

// Enable foreign keys
db.pragma('foreign_keys = ON');

// Create expenses table
const createTableQuery = `
  CREATE TABLE IF NOT EXISTS expenses (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    category TEXT NOT NULL,
    amount REAL NOT NULL,
    note TEXT,
    date TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`;

db.exec(createTableQuery);

// Create index for faster queries
db.exec('CREATE INDEX IF NOT EXISTS idx_date ON expenses(date)');
db.exec('CREATE INDEX IF NOT EXISTS idx_category ON expenses(category)');

console.log('✅ Database initialized successfully');

export default db;
