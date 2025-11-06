import axios from './axios';

export const authAPI = {
  // Login
  login: (credentials) => {
    return axios.post('/auth/login', credentials);
  },

  // Logout
  logout: () => {
    return axios.post('/auth/logout');
  },

  // Get current user
  getCurrentUser: () => {
    return axios.get('/auth/me');
  },
};
