import axios from './axios';

export const expenseAPI = {
  // Get all expenses with filters
  getExpenses: (params = {}) => {
    return axios.get('/expenses', { params });
  },

  // Get single expense
  getExpense: (id) => {
    return axios.get(`/expenses/${id}`);
  },

  // Create expense
  createExpense: (data) => {
    return axios.post('/expenses', data);
  },

  // Update expense
  updateExpense: (id, data) => {
    return axios.put(`/expenses/${id}`, data);
  },

  // Delete expense
  deleteExpense: (id) => {
    return axios.delete(`/expenses/${id}`);
  },

  // Get analytics
  getAnalytics: (params = {}) => {
    return axios.get('/expenses/analytics/summary', { params });
  },

  // Get categories
  getCategories: () => {
    return axios.get('/expenses/meta/categories');
  },
};
