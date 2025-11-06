import { useState, useEffect } from 'react';
import { 
  TrendingUp, TrendingDown, DollarSign, Calendar, 
  PieChart, Target, AlertCircle, ArrowUpRight, ArrowDownRight, Filter, Award 
} from 'lucide-react';
import ExpenseCalendar from './ExpenseCalendar';
import { BarChart, Bar, PieChart as RechartsPie, Pie, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import { expenseAPI } from '../api/expenses';
import { incomeAPI } from '../api/income';
import { formatCurrency, getCurrentCurrency, CURRENCIES } from '../utils/currency';

const COLORS = ['#0ea5e9', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#ef4444', '#6366f1', '#14b8a6'];

export default function Dashboard({ refreshTrigger }) {
  const [stats, setStats] = useState({
    totalIncome: 0,
    totalExpenses: 0,
    balance: 0,
    avgPerDay: 0,
    expenseCount: 0,
    categoryBreakdown: [],
    dailyTrend: []
  });
  const [loading, setLoading] = useState(true);
  const [currency, setCurrencyState] = useState(getCurrentCurrency());

  useEffect(() => {
    fetchDashboardData();
  }, [refreshTrigger, currency]);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // Get current month data
      const now = new Date();
      const firstDay = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
      const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];

      const [expenseRes, incomeRes] = await Promise.all([
        expenseAPI.getAnalytics({ startDate: firstDay, endDate: lastDay }),
        incomeAPI.getIncomeAnalytics({ startDate: firstDay, endDate: lastDay })
      ]);

      const totalIncome = incomeRes.data.totalIncome || 0;
      const totalExpenses = expenseRes.data.totalSpend || 0;
      const balance = totalIncome - totalExpenses;

      setStats({
        totalIncome,
        totalExpenses,
        balance,
        avgPerDay: expenseRes.data.averagePerDay || 0,
        expenseCount: expenseRes.data.totalExpenses || 0,
        categoryBreakdown: expenseRes.data.categoryBreakdown || [],
        dailyTrend: expenseRes.data.dailyTrend || []
      });
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-primary-600"></div>
      </div>
    );
  }

  if (!stats) return null;

  const topCategory = stats.categoryBreakdown[0];
  const daysInMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate();
  const projectedExpenses = stats.avgPerDay * daysInMonth;

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Main Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
        {/* Total Income */}
        <div className={`card ${currency === 'INR' ? 'bg-gradient-to-br from-green-500 via-green-600 to-emerald-600' : 'bg-gradient-to-br from-yellow-500 via-amber-500 to-orange-500'} text-white transform hover:scale-[1.02] sm:hover:scale-105 transition-transform duration-200 shadow-lg sm:shadow-xl rounded-xl p-4 sm:p-6`}>
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <p className="text-white text-opacity-90 text-xs sm:text-sm font-medium mb-1 truncate">Total Income {CURRENCIES[currency].flag}</p>
              <p className="text-2xl sm:text-3xl font-bold truncate">{formatCurrency(stats.totalIncome, currency)}</p>
            </div>
            <div className="bg-white bg-opacity-20 p-2 sm:p-3 rounded-lg sm:rounded-xl ml-3 flex-shrink-0">
              <TrendingUp className="w-6 h-6 sm:w-8 sm:h-8" />
            </div>
          </div>
          <div className="flex items-center gap-1.5 sm:gap-2 text-white text-opacity-90 text-xs sm:text-sm mt-3 sm:mt-4">
            <ArrowUpRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
            <span className="truncate">This month</span>
          </div>
        </div>

        {/* Total Expenses */}
        <div className={`card ${currency === 'INR' ? 'bg-gradient-to-br from-orange-500 via-red-500 to-pink-600' : 'bg-gradient-to-br from-red-500 via-rose-600 to-pink-600'} text-white transform hover:scale-105 transition-transform duration-200 shadow-xl`}>
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-white text-opacity-90 text-sm font-medium mb-1">Total Expenses</p>
              <p className="text-3xl font-bold">{formatCurrency(stats.totalExpenses, currency)}</p>
            </div>
            <div className="bg-white bg-opacity-20 p-3 rounded-xl">
              <TrendingDown className="w-8 h-8" />
            </div>
          </div>
          <div className="flex items-center gap-2 text-white text-opacity-90 text-sm">
            <ArrowDownRight className="w-4 h-4" />
            <span>{stats.expenseCount} transactions</span>
          </div>
        </div>

        {/* Balance */}
        <div className={`card ${
          stats.balance >= 0 
            ? currency === 'INR' 
              ? 'bg-gradient-to-br from-blue-500 via-indigo-600 to-purple-600' 
              : 'bg-gradient-to-br from-blue-500 via-sky-600 to-cyan-600'
            : 'bg-gradient-to-br from-orange-500 via-orange-600 to-red-600'
        } text-white transform hover:scale-[1.02] sm:hover:scale-105 transition-transform duration-200 shadow-lg sm:shadow-xl rounded-xl p-4 sm:p-6`}>
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <p className="text-white text-opacity-90 text-xs sm:text-sm font-medium mb-1 truncate">Balance</p>
              <p className="text-2xl sm:text-3xl font-bold truncate">{formatCurrency(stats.balance, currency)}</p>
            </div>
            <div className="bg-white bg-opacity-20 p-2 sm:p-3 rounded-lg sm:rounded-xl ml-3 flex-shrink-0">
              <DollarSign className="w-6 h-6 sm:w-8 sm:h-8" />
            </div>
          </div>
          <div className="flex items-center gap-1.5 sm:gap-2 text-white text-opacity-90 text-xs sm:text-sm mt-3 sm:mt-4">
            {stats.balance >= 0 ? (
              <>
                <Award className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span className="truncate">Great savings!</span>
              </>
            ) : (
              <>
                <AlertCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span className="truncate">Overspending</span>
              </>
            )}
          </div>
        </div>

{/* Top Category */}
        <div className="card bg-white border-2 border-gray-200 hover:border-primary-400 transition-all duration-200">
          <div className="flex items-center gap-4">
            <div className="bg-gradient-to-br from-pink-500 to-rose-500 p-4 rounded-xl">
              <Award className="w-8 h-8 text-white" />
            </div>
            <div>
              <p className="text-gray-500 text-sm font-medium">Top Category</p>
              <p className="text-xl font-bold text-gray-800">
                {topCategory ? topCategory.category : 'None'}
              </p>
              {topCategory && (
                <p className="text-sm text-gray-500">{formatCurrency(topCategory.total, currency)}</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Quick Insights */}
      <div className={`card ${currency === 'INR' ? 'bg-gradient-to-r from-orange-500 via-green-500 to-blue-500' : 'bg-gradient-to-r from-blue-500 via-yellow-500 to-red-500'} text-white`}>
        <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
          <Award className="w-6 h-6" />
          Quick Insights {CURRENCIES[currency].flag}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white bg-opacity-20 p-4 rounded-lg backdrop-blur-sm">
            <p className="text-sm text-white text-opacity-90 mb-1">Financial Health</p>
            <p className="text-2xl font-bold">
              {stats.balance >= 0 ? '😊 Good' : '⚠️ Alert'}
            </p>
          </div>
          <div className="bg-white bg-opacity-20 p-4 rounded-lg backdrop-blur-sm">
            <p className="text-sm text-white text-opacity-90 mb-1">Days Remaining</p>
            <p className="text-2xl font-bold">
              {daysInMonth - new Date().getDate()} days
            </p>
          </div>
          <div className="bg-white bg-opacity-20 p-4 rounded-lg backdrop-blur-sm">
            <p className="text-sm text-white text-opacity-90 mb-1">Budget Status</p>
            <p className="text-2xl font-bold">
              {stats.balance >= 0 ? '✅ On Track' : '❌ Over'}
            </p>
          </div>
        </div>
      </div>

      {/* Calendar Section */}
      <div className="mb-6">
        <ExpenseCalendar currency={currency} />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Category Breakdown - Pie Chart */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <PieChart className="w-5 h-5 text-primary-600" />
            Category Breakdown
          </h3>
          {stats.categoryBreakdown.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <RechartsPie>
                <Pie
                  data={stats.categoryBreakdown.map(item => ({
                    name: item.category,
                    value: parseFloat(item.total)
                  }))}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {stats.categoryBreakdown.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => formatCurrency(value, currency)} />
              </RechartsPie>
            </ResponsiveContainer>
          ) : (
            <p className="text-center text-gray-500 py-12">No data available</p>
          )}
        </div>

        {/* Spending by Category - Bar Chart */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <BarChart className="w-5 h-5 text-primary-600" />
            Spending by Category
          </h3>
          {stats.categoryBreakdown.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={stats.categoryBreakdown.map(item => ({
                name: item.category,
                value: parseFloat(item.total)
              }))}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                <YAxis />
                <Tooltip formatter={(value) => formatCurrency(value, currency)} />
                <Bar dataKey="value" fill={currency === 'INR' ? '#f97316' : '#3b82f6'} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-center text-gray-500 py-12">No data available</p>
          )}
        </div>
      </div>

      {/* Daily Trend - Line Chart */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-primary-600" />
          Daily Spending Trend
        </h3>
        {stats.dailyTrend.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={stats.dailyTrend.map(item => ({
              date: new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
              amount: parseFloat(item.total)
            }))}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip formatter={(value) => formatCurrency(value, currency)} />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="amount" 
                stroke={currency === 'INR' ? '#f97316' : '#3b82f6'} 
                strokeWidth={3} 
                name="Daily Spend" 
                dot={{ fill: currency === 'INR' ? '#f97316' : '#3b82f6', r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-center text-gray-500 py-12">No data available</p>
        )}
      </div>

      {/* Category Details Table */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <Award className="w-5 h-5 text-primary-600" />
          Category Details
        </h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Count
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Average
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {stats.categoryBreakdown.map((item, index) => (
                <tr key={item.category} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div
                        className="w-3 h-3 rounded-full mr-3"
                        style={{ backgroundColor: COLORS[index % COLORS.length] }}
                      ></div>
                      <span className="text-sm font-medium text-gray-900">{item.category}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-semibold">
                    {formatCurrency(parseFloat(item.total), currency)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {item.count}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatCurrency(parseFloat(item.total) / item.count, currency)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
