# 💰 Expense Tracker

A beautiful and feature-rich expense tracking web application built with React (Vite) frontend and Node.js + Express + SQLite backend. Track, analyze, and manage your daily expenses completely locally with secure environment variables.

## ✨ Features

### 📝 Expense Management
- **Add Expenses**: Record expenses with category, amount, note, and date
- **View Expenses**: Clean table view with pagination and sorting
- **Edit/Delete**: Modify or remove any expense record with confirmation
- **Smart Validation**: Automatic validation for amounts and dates

### 📊 Analytics Dashboard
- **Total Spend**: Track your overall spending
- **Average per Day**: See your daily spending patterns
- **Category Breakdown**: Visual pie and bar charts
- **Daily Trends**: Line chart showing spending over time
- **Detailed Reports**: Category-wise analysis with counts and averages

### 🎨 Modern UI/UX
- Beautiful gradient design with TailwindCSS
- Responsive layout for all devices
- Smooth animations and transitions
- Lucide icons for visual clarity
- Interactive charts with Recharts

### 🔒 Security & Privacy
- All data stored locally in SQLite database
- Environment variables for configuration
- No external data transmission
- Secure backend API

## 🚀 Tech Stack

### Frontend
- **React 19** - UI library
- **Vite** - Build tool and dev server
- **TailwindCSS** - Styling
- **Recharts** - Data visualization
- **Lucide React** - Icons
- **Axios** - HTTP client

### Backend
- **Node.js** - Runtime
- **Express** - Web framework
- **SQLite** (better-sqlite3) - Database
- **CORS** - Cross-origin resource sharing
- **dotenv** - Environment variables

## 📦 Installation

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn

### Setup Instructions

1. **Clone the repository**
```bash
cd expense-tracker
```

2. **Install Frontend Dependencies**
```bash
npm install
```

3. **Install Backend Dependencies**
```bash
cd server
npm install
cd ..
```

4. **Configure Environment Variables**

Frontend `.env`:
```env
VITE_API_URL=http://localhost:5000/api
```

Backend `server/.env`:
```env
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

5. **Start the Application**

Open two terminal windows:

**Terminal 1 - Backend:**
```bash
cd server
npm start
```

**Terminal 2 - Frontend:**
```bash
npm run dev
```

6. **Access the Application**
- Frontend: http://localhost:5173
- Backend API: http://localhost:5000/api

## 📁 Project Structure

```
expense-tracker/
├── src/                      # Frontend source
│   ├── api/                  # API client
│   │   ├── axios.js         # Axios instance
│   │   └── expenses.js      # Expense API calls
│   ├── components/          # React components
│   │   ├── AddExpense.jsx   # Add expense form
│   │   ├── ExpenseList.jsx  # Expense table
│   │   └── Analytics.jsx    # Analytics dashboard
│   ├── App.jsx              # Main app component
│   ├── main.jsx             # Entry point
│   └── index.css            # Global styles
├── server/                   # Backend source
│   ├── database/            # Database files
│   │   └── db.js           # Database setup
│   ├── routes/              # API routes
│   │   └── expenses.js     # Expense endpoints
│   ├── server.js           # Express server
│   ├── .env                # Backend config
│   └── package.json        # Backend dependencies
├── .env                     # Frontend config
├── .env.example            # Frontend config template
├── tailwind.config.js      # Tailwind configuration
├── postcss.config.js       # PostCSS configuration
└── package.json            # Frontend dependencies
```

## 🔌 API Endpoints

### Expenses
- `GET /api/expenses` - Get all expenses (with filters, sorting, pagination)
- `GET /api/expenses/:id` - Get single expense
- `POST /api/expenses` - Create new expense
- `PUT /api/expenses/:id` - Update expense
- `DELETE /api/expenses/:id` - Delete expense

### Analytics
- `GET /api/expenses/analytics/summary` - Get analytics summary

### Metadata
- `GET /api/expenses/meta/categories` - Get all unique categories

## 🎯 Usage

### Adding an Expense
1. Navigate to "Add Expense" tab
2. Select a category from the dropdown
3. Enter the amount (must be positive)
4. Choose a date (defaults to today)
5. Add an optional note
6. Click "Add Expense"

### Viewing Expenses
1. Navigate to "Expenses" tab
2. Use filters to narrow down results
3. Sort by date, amount, or category
4. Edit expenses by clicking the edit icon
5. Delete expenses with confirmation

### Analyzing Expenses
1. Navigate to "Analytics" tab
2. View summary cards for total, average, and count
3. Explore category breakdown in pie and bar charts
4. Check daily spending trends
5. Use filters to analyze specific periods or categories

## 🛠️ Development

### Frontend Development
```bash
npm run dev          # Start dev server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
```

### Backend Development
```bash
cd server
npm start            # Start server
npm run dev          # Start with auto-reload (if configured)
```

## 🔐 Environment Variables

### Frontend (.env)
- `VITE_API_URL` - Backend API URL

### Backend (server/.env)
- `PORT` - Server port
- `NODE_ENV` - Environment (development/production)
- `DB_PATH` - SQLite database file path
- `DB_NAME` - Database name
- `DB_USER` - Database user (for future use)
- `DB_PASSWORD` - Database password (for future use)
- `API_PREFIX` - API route prefix
- `CORS_ORIGIN` - Allowed CORS origin
- `JWT_SECRET` - JWT secret key (for future auth)

## 📝 Database Schema

### expenses table
```sql
CREATE TABLE expenses (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  category TEXT NOT NULL,
  amount REAL NOT NULL,
  note TEXT,
  date TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

MIT License - feel free to use this project for personal or commercial purposes.

## 🙏 Acknowledgments

- React team for the amazing library
- Vite for the blazing fast build tool
- TailwindCSS for the utility-first CSS framework
- Recharts for beautiful charts
- Lucide for the icon library
