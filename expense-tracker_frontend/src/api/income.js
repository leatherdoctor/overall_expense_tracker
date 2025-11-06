import axios from './axios';

export const incomeAPI = {
  // Get all income entries with filters
  getIncomes: (params = {}) => {
    return axios.get('/income', { params });
  },
  
  // Get income entries with filters (alias for getIncomes for backward compatibility)
  getIncome: (params = {}) => {
    return axios.get('/income', { params });
  },

  // Get single income entry
  getIncomeEntry: (id) => {
    return axios.get(`/income/${id}`);
  },

  // Create income entry
  createIncome: (data) => {
    return axios.post('/income', data);
  },

  // Update income entry
  updateIncome: (id, data) => {
    return axios.put(`/income/${id}`, data);
  },

  // Delete income entry
  deleteIncome: (id) => {
    return axios.delete(`/income/${id}`);
  },

  // Get income analytics
  getIncomeAnalytics: (params = {}) => {
    return axios.get('/income/analytics/summary', { params });
  },
};
