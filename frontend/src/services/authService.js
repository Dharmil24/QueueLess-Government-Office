import api from './api';

export const authService = {
  async register(data) {
    const res = await api.post('/auth/register', data);
    return res.data;
  },

  async demoRegister(data = {}) {
    const res = await api.post('/auth/demo-register', data);
    return res.data;
  },

  async demoLogin(data = {}) {
    const res = await api.post('/auth/demo-login', data);
    return res.data;
  },

  async login(credentials) {
    const res = await api.post('/auth/login', credentials);
    return res.data;
  },

  async getMe() {
    const res = await api.get('/auth/me');
    return res.data;
  },

  async logout() {
    try {
      await api.post('/auth/logout');
    } finally {
      localStorage.removeItem('ql_token');
      localStorage.removeItem('ql_user');
    }
  },
};
