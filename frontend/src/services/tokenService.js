import api from './api';

export const tokenService = {
  async generateToken(data) {
    const res = await api.post('/tokens', data);
    return res.data;
  },

  async getMyTokens() {
    const res = await api.get('/tokens/my');
    return res.data;
  },

  async getTokenById(id) {
    const res = await api.get(`/tokens/${id}`);
    return res.data;
  },

  async cancelToken(id) {
    const res = await api.patch(`/tokens/${id}/cancel`);
    return res.data;
  },

  async verifyQr(qrToken) {
    const res = await api.get(`/tokens/verify-qr/${qrToken}`);
    return res.data;
  },
};
