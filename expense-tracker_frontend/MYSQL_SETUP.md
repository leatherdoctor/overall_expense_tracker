# 🗄️ MySQL Setup Guide

## Prerequisites

Make sure you have MySQL installed on your system.

## Step 1: Update server/.env File

Open `server/.env` and update it with these values:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# MySQL Database Configuration
DB_HOST=localhost
DB_PORT=3306
DB_NAME=expense_tracker
DB_USER=root
DB_PASSWORD=root

# API Configuration
API_PREFIX=/api
CORS_ORIGIN=http://localhost:5173

# Security
JWT_SECRET=my_secret_jwt_key_for_development
SESSION_SECRET=my_session_secret_for_development
```

## Step 2: Install Backend Dependencies

```bash
cd server
npm install
```

This will install:
- `mysql2` - MySQL client
- `bcryptjs` - Password hashing
- `jsonwebtoken` - JWT authentication
- `express-session` - Session management

## Step 3: Start MySQL Server

Make sure your MySQL server is running:

**Windows:**
- Open Services and start "MySQL" service
- Or use MySQL Workbench

**Command Line:**
```bash
# Check if MySQL is running
mysql --version

# Start MySQL (if not running)
net start MySQL
```

## Step 4: Database Will Be Created Automatically

The application will automatically:
1. Create the `expense_tracker` database
2. Create all required tables (users, expenses, income)
3. Seed the default user

## Step 5: Start the Backend

```bash
cd server
npm start
```

You should see:
```
✅ Database 'expense_tracker' ready
✅ Database tables created successfully
✅ Default user created:
   Username: Aayush
   Password: Aayush04!4#
🚀 Server running on http://localhost:5000
```

## Step 6: Start the Frontend

In a new terminal:
```bash
npm run dev
```

## Step 7: Login

Open http://localhost:5173 and login with:
- **Username:** `Aayush`
- **Password:** `Aayush04!4#`

## Database Schema

### users table
```sql
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  full_name VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

### expenses table
```sql
CREATE TABLE expenses (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  category VARCHAR(100) NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  note TEXT,
  date DATE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

### income table
```sql
CREATE TABLE income (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  source VARCHAR(100) NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  note TEXT,
  date DATE NOT NULL,
  type ENUM('salary', 'bonus', 'investment', 'other') DEFAULT 'salary',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

## Troubleshooting

### Error: Access denied for user 'root'@'localhost'

Your MySQL password is different. Update `server/.env`:
```env
DB_PASSWORD=your_actual_mysql_password
```

### Error: Can't connect to MySQL server

1. Make sure MySQL is running
2. Check if the port is correct (default: 3306)
3. Verify `DB_HOST` in `.env` (should be `localhost` or `127.0.0.1`)

### Error: Database 'expense_tracker' doesn't exist

The app should create it automatically. If not, create it manually:

```sql
CREATE DATABASE expense_tracker;
```

### Reset Database

To start fresh:

```sql
DROP DATABASE expense_tracker;
```

Then restart the backend - it will recreate everything.

## Viewing Data in MySQL

### Using MySQL Command Line:

```bash
mysql -u root -p
```

```sql
USE expense_tracker;

-- View all users
SELECT * FROM users;

-- View all expenses
SELECT * FROM expenses;

-- View all income
SELECT * FROM income;

-- View user's expenses with total
SELECT u.username, e.*, 
       (SELECT SUM(amount) FROM expenses WHERE user_id = u.id) as total_expenses
FROM users u
LEFT JOIN expenses e ON u.id = e.user_id;
```

### Using MySQL Workbench:

1. Open MySQL Workbench
2. Connect to your local MySQL server
3. Navigate to `expense_tracker` database
4. Browse tables: users, expenses, income

## Features

✅ **Authentication**
- Login with username/password
- JWT token-based authentication
- Secure password hashing with bcrypt
- Session management

✅ **Income Tracking**
- Add salary, bonus, investment, or other income
- Track income sources and dates
- View income history

✅ **Expense Tracking**
- Add expenses by category
- Edit and delete expenses
- Filter and sort expenses

✅ **Analytics**
- Total Income vs Total Expenses
- Balance calculation
- Category-wise breakdown
- Daily spending trends
- Visual charts

✅ **User-Specific Data**
- Each user sees only their own data
- Secure data isolation
- Multi-user support ready

## Default Login Credentials

**Username:** Aayush  
**Password:** Aayush04!4#

These are set in `server/database/seed.js` and created automatically on first run.

## Next Steps

1. Add more users through the database
2. Customize income types
3. Add budget limits
4. Create monthly reports
5. Export data to CSV

---

**All set! Your expense tracker is now using MySQL with authentication and income tracking!** 🎉
