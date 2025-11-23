// =============================================================================
// File: src/services/api.js
// API Service - Handles all backend API calls
// =============================================================================

import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'https://rohannso-django-job-scraper.hf.space/api';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle token refresh on 401
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired, logout
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// =============================================================================
// AUTH APIs
// =============================================================================

export const authAPI = {
  // Register new user
  register: async (userData) => {
    const response = await api.post('/auth/register/', userData);
    return response.data;
  },

  // Login
  login: async (credentials) => {
    const response = await api.post('/auth/login/', credentials);
    return response.data;
  },

  // Logout
  logout: async (refreshToken) => {
    const response = await api.post('/auth/logout/', {
      refresh_token: refreshToken,
    });
    return response.data;
  },

  // Get current user
  getCurrentUser: async () => {
    const response = await api.get('/auth/me/');
    return response.data;
  },
};

// =============================================================================
// JOB APIs (Job Seeker)
// =============================================================================

export const jobAPI = {
  // Get job list with filters
  getJobs: async (filters = {}) => {
    const params = new URLSearchParams();
    
    if (filters.date_filter) params.append('date_filter', filters.date_filter);
    if (filters.check_status) params.append('check_status', filters.check_status);
    if (filters.search) params.append('search', filters.search);
    if (filters.ordering) params.append('ordering', filters.ordering);
    if (filters.page) params.append('page', filters.page);

    const response = await api.get(`/jobs/list/?${params.toString()}`);
    return response.data;
  },

  // Get single job detail
  getJobDetail: async (jobId) => {
    const response = await api.get(`/jobs/detail/${jobId}/`);
    return response.data;
  },

  // Toggle job check status
  toggleCheck: async (jobId, isChecked, notes = '') => {
    const response = await api.post('/jobs/toggle-check/', {
      job_id: jobId,
      is_checked: isChecked,
      notes: notes,
    });
    return response.data;
  },

  // Get my applications
  getMyApplications: async (page = 1) => {
    const response = await api.get(`/jobs/my-applications/?page=${page}`);
    return response.data;
  },

  // Get job statistics
  getStats: async () => {
    const response = await api.get('/jobs/stats/');
    return response.data;
  },
};

// =============================================================================
// ADMIN APIs
// =============================================================================

export const adminAPI = {
  // Trigger scraper
  triggerScraper: async (data = {}) => {
    const response = await api.post('/jobs/trigger-scraper/', data);
    return response.data;
  },

  // Get scraper status
  getScraperStatus: async () => {
    const response = await api.get('/jobs/scraper-status/');
    return response.data;
  },

  // Get scraper logs
  getScraperLogs: async (page = 1) => {
    const response = await api.get(`/jobs/scraper-logs/?page=${page}`);
    return response.data;
  },
};

// =============================================================================
// Helper Functions
// =============================================================================

// Save auth data to localStorage
// Save auth data to localStorage
export const saveAuthData = (data) => {
  console.log('📥 Saving auth data:', data);
  
  // Your backend returns: { message, user: { tokens: {...}, ...other fields } }
  if (data.user && data.user.tokens) {
    localStorage.setItem('access_token', data.user.tokens.access);
    localStorage.setItem('refresh_token', data.user.tokens.refresh);
    localStorage.setItem('user', JSON.stringify(data.user));
    console.log('✅ Auth data saved successfully');
  } else {
    console.error('❌ Invalid auth data structure:', data);
    throw new Error('Invalid authentication response format');
  }
};
// Get user from localStorage
export const getUser = () => {
  const user = localStorage.getItem('user');
  return user ? JSON.parse(user) : null;
};

// Check if user is authenticated
export const isAuthenticated = () => {
  return !!localStorage.getItem('access_token');
};

// Check if user is admin
export const isAdmin = () => {
  const user = getUser();
  return user?.role === 'admin';
};

// Logout and clear data
export const logoutUser = () => {
  const refreshToken = localStorage.getItem('refresh_token');
  
  // Call logout API
  if (refreshToken) {
    authAPI.logout(refreshToken).catch(console.error);
  }
  
  // Clear localStorage
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
  localStorage.removeItem('user');
};

export default api;