import { useState, useEffect } from 'react';
import { BarChart, Bar, PieChart, Pie, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import { TrendingUp, DollarSign, Calendar, Filter } from 'lucide-react';
import { expenseAPI } from '../api/expenses';
import { formatCurrency, getCurrentCurrency } from '../utils/currency';

const COLORS = ['#0ea5e9', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#ef4444', '#6366f1', '#14b8a6'];

export default function Analytics({ refreshTrigger }) {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    category: ''
  });
  const [categories, setCategories] = useState([]);
  const [currency, setCurrencyState] = useState(getCurrentCurrency());

  useEffect(() => {
    fetchAnalytics();
    fetchCategories();
  }, [filters, refreshTrigger]);

  const fetchAnalytics = async () => {
    setLoading(true);
    setError('');
    try {
      const params = {};
      if (filters.startDate) params.startDate = filters.startDate;
      if (filters.endDate) params.endDate = filters.endDate;
      if (filters.category) params.category = filters.category;

      const response = await expenseAPI.getAnalytics(params);
      setAnalytics(response.data);
    } catch (err) {
      setError(err.message || 'Failed to fetch analytics');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await expenseAPI.getCategories();
      setCategories(response.data || []);
    } catch (err) {
      console.error('Failed to fetch categories:', err);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  if (loading) {
    return (
      <div className="card">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading analytics...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card">
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
          {error}
        </div>
      </div>
    );
  }

  if (!analytics) {
    return null;
  }

  const categoryData = analytics.categoryBreakdown.map(item => ({
    name: item.category,
    value: parseFloat(item.total),
    count: item.count
  }));

  const trendData = analytics.dailyTrend.map(item => ({
    date: new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    amount: parseFloat(item.total)
  }));

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <Filter className="w-5 h-5" />
          Filter Analytics
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
            <input
              type="date"
              value={filters.startDate}
              onChange={(e) => handleFilterChange('startDate', e.target.value)}
              className="input-field"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
            <input
              type="date"
              value={filters.endDate}
              onChange={(e) => handleFilterChange('endDate', e.target.value)}
              className="input-field"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <select
              value={filters.category}
              onChange={(e) => handleFilterChange('category', e.target.value)}
              className="input-field"
            >
              <option value="">All Categories</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card bg-gradient-to-br from-green-500 to-green-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm font-medium">Total Income</p>
              <p className="text-3xl font-bold mt-2">{formatCurrency(analytics.totalIncome || 0, currency)}</p>
            </div>
            <DollarSign className="w-12 h-12 text-green-200" />
          </div>
        </div>

        <div className="card bg-gradient-to-br from-red-500 to-red-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-red-100 text-sm font-medium">Total Expenses</p>
              <p className="text-3xl font-bold mt-2">{formatCurrency(analytics.totalSpend, currency)}</p>
            </div>
            <DollarSign className="w-12 h-12 text-red-200" />
          </div>
        </div>

        <div className={`card bg-gradient-to-br ${(analytics.balance || 0) >= 0 ? 'from-blue-500 to-blue-600' : 'from-orange-500 to-orange-600'} text-white`}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white text-opacity-90 text-sm font-medium">Balance</p>
              <p className="text-3xl font-bold mt-2">{formatCurrency(analytics.balance || 0, currency)}</p>
            </div>
            <TrendingUp className="w-12 h-12 text-white text-opacity-70" />
          </div>
        </div>

        <div className="card bg-gradient-to-br from-purple-500 to-purple-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm font-medium">Avg/Day</p>
              <p className="text-3xl font-bold mt-2">{formatCurrency(analytics.averagePerDay, currency)}</p>
            </div>
            <Calendar className="w-12 h-12 text-purple-200" />
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Breakdown - Pie Chart */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Category Breakdown</h3>
          {categoryData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `$${value.toFixed(2)}`} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-center text-gray-500 py-12">No data available</p>
          )}
        </div>

        {/* Category Breakdown - Bar Chart */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Spending by Category</h3>
          {categoryData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={categoryData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                <YAxis />
                <Tooltip formatter={(value) => `$${value.toFixed(2)}`} />
                <Bar dataKey="value" fill="#0ea5e9" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-center text-gray-500 py-12">No data available</p>
          )}
        </div>
      </div>

      {/* Daily Trend - Line Chart */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Daily Spending Trend</h3>
        {trendData.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip formatter={(value) => `$${value.toFixed(2)}`} />
              <Legend />
              <Line type="monotone" dataKey="amount" stroke="#0ea5e9" strokeWidth={2} name="Daily Spend" />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-center text-gray-500 py-12">No data available</p>
        )}
      </div>

      {/* Category Details Table */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Category Details</h3>
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
              {analytics.categoryBreakdown.map((item, index) => (
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
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    ${parseFloat(item.total).toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {item.count}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    ${(parseFloat(item.total) / item.count).toFixed(2)}
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
