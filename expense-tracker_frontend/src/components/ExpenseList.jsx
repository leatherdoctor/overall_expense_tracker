import { useState, useEffect } from 'react';
import { Edit2, Trash2, ChevronLeft, ChevronRight, Search, Filter } from 'lucide-react';
import { expenseAPI } from '../api/expenses';

export default function ExpenseList({ refreshTrigger }) {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});
  
  // Filters and pagination
  const [filters, setFilters] = useState({
    category: '',
    sortBy: 'date',
    order: 'DESC',
    page: 1,
    limit: 10
  });
  const [pagination, setPagination] = useState({});
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    fetchExpenses();
    fetchCategories();
  }, [filters, refreshTrigger]);

  const fetchExpenses = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await expenseAPI.getExpenses(filters);
      setExpenses(response.data || []);
      setPagination(response.pagination || {});
    } catch (err) {
      setError(err.message || 'Failed to fetch expenses');
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

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this expense?')) {
      return;
    }

    try {
      await expenseAPI.deleteExpense(id);
      fetchExpenses();
    } catch (err) {
      alert(err.message || 'Failed to delete expense');
    }
  };

  const startEdit = (expense) => {
    setEditingId(expense.id);
    setEditForm({
      category: expense.category,
      amount: expense.amount,
      note: expense.note,
      date: expense.date
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditForm({});
  };

  const handleUpdate = async (id) => {
    try {
      await expenseAPI.updateExpense(id, {
        ...editForm,
        amount: parseFloat(editForm.amount)
      });
      setEditingId(null);
      setEditForm({});
      fetchExpenses();
    } catch (err) {
      alert(err.message || 'Failed to update expense');
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value, page: 1 }));
  };

  const handlePageChange = (newPage) => {
    setFilters(prev => ({ ...prev, page: newPage }));
  };

  if (loading && expenses.length === 0) {
    return (
      <div className="card">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading expenses...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Expense History</h2>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            <Filter className="w-4 h-4 inline mr-1" />
            Category
          </label>
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

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Sort By</label>
          <select
            value={filters.sortBy}
            onChange={(e) => handleFilterChange('sortBy', e.target.value)}
            className="input-field"
          >
            <option value="date">Date</option>
            <option value="amount">Amount</option>
            <option value="category">Category</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Order</label>
          <select
            value={filters.order}
            onChange={(e) => handleFilterChange('order', e.target.value)}
            className="input-field"
          >
            <option value="DESC">Descending</option>
            <option value="ASC">Ascending</option>
          </select>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      {expenses.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <p className="text-lg">No expenses found</p>
          <p className="text-sm mt-2">Add your first expense to get started!</p>
        </div>
      ) : (
        <>
          {/* Table */}
          <div className="overflow-x-auto -mx-4 sm:mx-0">
            <div className="inline-block min-w-full align-middle">
              <div className="overflow-hidden shadow-sm ring-1 ring-black ring-opacity-5 sm:rounded-lg">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50 hidden sm:table-header-group">
                    <tr>
                      <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                        Date
                      </th>
                      <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                        Category
                      </th>
                      <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                        Amount
                      </th>
                      <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">
                        Note
                      </th>
                      <th scope="col" className="px-3 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {expenses.map((expense) => (
                      <tr key={expense.id} className="hover:bg-gray-50 flex flex-col sm:table-row mb-4 sm:mb-0 border border-gray-200 sm:border-0 rounded-lg overflow-hidden sm:rounded-none">
                        {editingId === expense.id ? (
                          <>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <input
                                type="date"
                                value={editForm.date}
                                onChange={(e) => setEditForm({ ...editForm, date: e.target.value })}
                                className="input-field text-sm"
                              />
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <select
                                value={editForm.category}
                                onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
                                className="input-field text-sm"
                              >
                                {categories.map(cat => (
                                  <option key={cat} value={cat}>{cat}</option>
                                ))}
                              </select>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <input
                                type="number"
                                value={editForm.amount}
                                onChange={(e) => setEditForm({ ...editForm, amount: e.target.value })}
                                className="input-field text-sm"
                                step="0.01"
                              />
                            </td>
                            <td className="px-6 py-4">
                              <input
                                type="text"
                                value={editForm.note}
                                onChange={(e) => setEditForm({ ...editForm, note: e.target.value })}
                                className="input-field text-sm"
                              />
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                              <button
                                onClick={() => handleUpdate(expense.id)}
                                className="text-green-600 hover:text-green-900 mr-3"
                              >
                                Save
                              </button>
                              <button
                                onClick={cancelEdit}
                                className="text-gray-600 hover:text-gray-900"
                              >
                                Cancel
                              </button>
                            </td>
                          </>
                        ) : (
                          <>
                            <td className="px-4 py-3 sm:px-3 sm:py-4 whitespace-nowrap text-sm text-gray-900 flex items-center justify-between sm:table-cell">
                              <span className="sm:hidden font-medium text-gray-500">Date: </span>
                              <span>{new Date(expense.date).toLocaleDateString()}</span>
                            </td>
                            <td className="px-4 py-3 sm:px-3 sm:py-4 whitespace-nowrap flex items-center justify-between sm:table-cell">
                              <span className="sm:hidden font-medium text-gray-500">Category: </span>
                              <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-primary-100 text-primary-800">
                                {expense.category}
                              </span>
                            </td>
                            <td className="px-4 py-3 sm:px-3 sm:py-4 whitespace-nowrap text-sm font-medium text-gray-900 flex items-center justify-between sm:table-cell">
                              <span className="sm:hidden font-medium text-gray-500">Amount: </span>
                              <span>Rs.{(parseFloat(expense.amount) || 0).toFixed(2)}</span>
                            </td>
                            <td className="px-4 py-3 sm:px-3 sm:py-4 text-sm text-gray-500 hidden md:table-cell">
                              {expense.note || '-'}
                            </td>
                            <td className="px-4 py-3 sm:px-3 sm:py-4 whitespace-nowrap text-right text-sm font-medium">
                              <div className="flex justify-end space-x-2">
                                <button
                                  onClick={() => startEdit(expense)}
                                  className="text-primary-600 hover:text-primary-900 p-1 rounded-full hover:bg-primary-50"
                                  aria-label="Edit expense"
                                >
                                  <Edit2 className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleDelete(expense.id)}
                                  className="text-red-600 hover:text-red-900 p-1 rounded-full hover:bg-red-50"
                                  aria-label="Delete expense"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-200">
              <div className="text-sm text-gray-700">
                Showing page {pagination.page} of {pagination.totalPages} ({pagination.total} total)
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={pagination.page === 1}
                  className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={pagination.page === pagination.totalPages}
                  className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
