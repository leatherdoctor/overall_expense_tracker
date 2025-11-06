# 🚀 Quick Setup Guide

Follow these steps to get your Expense Tracker up and running:

## Step 1: Install Backend Dependencies

Open a terminal and run:

```bash
cd server
npm install
```

This will install:
- express
- cors
- dotenv
- better-sqlite3

## Step 2: Verify Environment Files

Both `.env` files have been created for you:

### Frontend `.env` (root directory)
```
VITE_API_URL=http://localhost:5000/api
```

### Backend `server/.env`
```
PORT=5000
NODE_ENV=development
DB_PATH=./database/expenses.db
DB_NAME=expenses_db
DB_USER=expense_admin
DB_PASSWORD=secure_password_123
API_PREFIX=/api
CORS_ORIGIN=http://localhost:5173
JWT_SECRET=my_secret_jwt_key_for_development
```

## Step 3: Start the Backend Server

In the `server` directory:

```bash
npm start
```

You should see:
```
✅ Database initialized successfully
🚀 Server running on http://localhost:5000
📊 API available at http://localhost:5000/api
🌍 Environment: development
```

## Step 4: Start the Frontend (New Terminal)

In a new terminal, from the root directory:

```bash
npm run dev
```

You should see:
```
VITE v7.x.x  ready in xxx ms

➜  Local:   http://localhost:5173/
➜  Network: use --host to expose
```

## Step 5: Open the Application

Open your browser and navigate to:
```
http://localhost:5173
```

## 🎉 You're All Set!

The application is now running with:
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:5000/api
- **Database**: `server/database/expenses.db` (auto-created)

## 📝 Quick Test

1. Click on "Add Expense" tab
2. Fill in the form:
   - Category: Food & Dining
   - Amount: 25.50
   - Date: Today
   - Note: Lunch at cafe
3. Click "Add Expense"
4. Navigate to "Expenses" tab to see your entry
5. Check "Analytics" tab for visualizations

## 🔧 Troubleshooting

### Port Already in Use
If port 5000 or 5173 is already in use, you can change them:

**Backend**: Edit `server/.env` and change `PORT=5000` to another port
**Frontend**: Vite will automatically use the next available port

### Database Issues
If you encounter database errors, delete `server/database/expenses.db` and restart the backend. It will recreate the database automatically.

### Module Not Found
Make sure you've installed dependencies in both directories:
```bash
# Root directory
npm install

# Server directory
cd server
npm install
```

## 📚 Next Steps

- Read the full [README.md](README.md) for detailed documentation
- Explore the API endpoints
- Customize categories in `src/components/AddExpense.jsx`
- Modify the color scheme in `tailwind.config.js`

Happy expense tracking! 💰
