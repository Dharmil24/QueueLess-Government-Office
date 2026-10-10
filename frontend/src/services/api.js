import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor to append Authorization JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('ql_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor to handle global errors (e.g. 401 unauthorized)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      if (error.response.status === 401) {
        // Clear token if invalid session
        if (localStorage.getItem('ql_token')) {
          localStorage.removeItem('ql_token');
          localStorage.removeItem('ql_user');
        }
      }
      // Extract backend's user-friendly message from response body
      const backendMessage =
        error.response.data?.message ||
        error.response.data?.error ||
        error.message;
      const enhancedError = new Error(backendMessage);
      enhancedError.status = error.response.status;
      enhancedError.data = error.response.data;
      return Promise.reject(enhancedError);
    }
    // Network error or no response
    return Promise.reject(new Error('Network error. Please check your connection.'));
  }
);

export default api;
