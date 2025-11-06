import { useState, useEffect } from 'react';
import { Wallet, PieChart, List, Plus, DollarSign, LogOut, LayoutDashboard, TrendingUp } from 'lucide-react';
import Login from './components/Login';
import AddExpense from './components/AddExpense';
import AddIncome from './components/AddIncome';
import ExpenseList from './components/ExpenseList';
import IncomeList from './components/IncomeList';
import Analytics from './components/Analytics';
import Dashboard from './components/Dashboard';
import ThemeToggle from './components/ThemeToggle';
import { ThemeProvider } from './contexts/ThemeContext';
import { authAPI } from './api/auth';

function App() {
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is already logged in
    const token = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    
    if (token && savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const handleLoginSuccess = (userData) => {
    setUser(userData);
  };

  const handleLogout = async () => {
    try {
      await authAPI.logout();
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setUser(null);
    }
  };

  const handleExpenseAdded = () => {
    setRefreshTrigger(prev => prev + 1);
    // Show a success message and redirect to dashboard after a short delay
    setTimeout(() => {
      setActiveTab('dashboard');
    }, 500);
  };

  const handleIncomeAdded = () => {
    setRefreshTrigger(prev => prev + 1);
    // Redirect to dashboard after a short delay to show success state
    setTimeout(() => {
      setActiveTab('dashboard');
    }, 500);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!user) {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'add-expense', label: 'Add Expense', icon: Plus },
    { id: 'add-income', label: 'Add Income', icon: DollarSign },
    { id: 'expenses', label: 'Expenses', icon: List },
    { id: 'incomes', label: 'Incomes', icon: TrendingUp },
  ];

  return (
    <ThemeProvider>
      <AppContent 
        user={user} 
        onLoginSuccess={handleLoginSuccess} 
        onLogout={handleLogout} 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        refreshTrigger={refreshTrigger} 
        handleExpenseAdded={handleExpenseAdded}
        handleIncomeAdded={handleIncomeAdded}
        tabs={tabs} 
      />
    </ThemeProvider>
  );
}

function AppContent({ 
  user, 
  onLoginSuccess, 
  onLogout, 
  activeTab, 
  setActiveTab, 
  refreshTrigger, 
  handleExpenseAdded, 
  handleIncomeAdded, 
  tabs 
}) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-900 transition-colors duration-200">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16">
            {/* Logo and App Name */}
            <div className="flex items-center">
              <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-gradient-to-br from-primary-500 to-primary-600 text-white shadow-sm">
                <Wallet className="h-5 w-5" />
              </div>
              <div className="ml-3">
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">Expense Tracker</h1>
              </div>
            </div>

            {/* User Controls */}
            <div className="flex items-center space-x-2 sm:space-x-4">
              {/* Welcome Message - Hidden on small screens */}
              <div className="hidden sm:flex items-center">
                <div className="text-right mr-3">
                  <p className="text-xs text-gray-500 dark:text-gray-400">Welcome back</p>
                  <p className="text-sm font-medium text-gray-800 dark:text-gray-100">{user.username}</p>
                </div>
                <div className="h-8 w-px bg-gray-200 dark:bg-gray-700"></div>
              </div>

              {/* Theme Toggle */}
              <ThemeToggle />

              {/* Logout Button */}
              <button
                onClick={onLogout}
                className="flex items-center justify-center h-9 w-9 sm:w-auto sm:px-4 rounded-lg border border-gray-200 bg-white dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/30 text-gray-700 dark:text-gray-200 transition-colors"
                title="Logout"
              >
                <LogOut className="w-4 h-4 sm:mr-2" />
                <span className="text-sm font-medium hidden sm:inline">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-20 shadow-sm overflow-hidden transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-6">
          <div className="relative overflow-x-auto">
            <nav className="flex space-x-1 sm:space-x-2 md:space-x-4 whitespace-nowrap py-2 sm:py-0" aria-label="Tabs">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`
                      flex flex-col sm:flex-row items-center justify-center py-3 px-3 sm:px-4 border-b-2 font-medium text-xs sm:text-sm transition-all duration-200
                      ${
                        isActive
                          ? 'border-primary-600 text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-gray-700/50 sm:bg-transparent sm:dark:bg-transparent rounded-lg sm:rounded-b-none'
                          : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700/30 rounded-lg sm:rounded-b-none'
                      }
                      w-1/4 sm:w-auto flex-shrink-0
                    `}
                    style={{
                      minWidth: 'fit-content',
                      margin: '0 2px',
                    }}
                  >
                    <Icon 
                      className={`w-4 h-4 sm:mr-2 ${
                        isActive 
                          ? 'text-primary-600 dark:text-primary-400' 
                          : 'text-gray-500 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-200'
                      }`} 
                    />
                    <span className="mt-1 sm:mt-0">{tab.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-6 py-4 sm:py-6">
        {activeTab === 'dashboard' && (
          <Dashboard refreshTrigger={refreshTrigger} />
        )}
        
        {activeTab === 'add-expense' && (
          <div className="max-w-2xl mx-auto px-2 sm:px-4">
            <AddExpense 
              onExpenseAdded={() => {
                handleExpenseAdded();
                setActiveTab('dashboard');
              }} 
              onClose={() => setActiveTab('dashboard')} 
            />
          </div>
        )}
        
        {activeTab === 'add-income' && (
          <div className="max-w-2xl mx-auto px-2 sm:px-4">
            <AddIncome 
              onIncomeAdded={() => {
                handleIncomeAdded();
                setActiveTab('dashboard');
              }} 
              onClose={() => setActiveTab('dashboard')} 
            />
          </div>
        )}
        
        {activeTab === 'expenses' && (
          <ExpenseList refreshTrigger={refreshTrigger} />
        )}
        
        {activeTab === 'incomes' && (
          <IncomeList refreshTrigger={refreshTrigger} />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <p className="text-center text-sm text-gray-500 dark:text-gray-400">
            Built with React + Vite + Express + MySQL | Secure & Private
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;
