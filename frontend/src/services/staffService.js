import api from './api';

export const staffService = {
  async getStaffQueue() {
    const res = await api.get('/staff/queue');
    return res.data;
  },

  async callNext(counterId) {
    const res = await api.post('/staff/token/next', { counterId });
    return res.data;
  },

  async recall(tokenId) {
    const res = await api.post(`/staff/token/${tokenId}/recall`);
    return res.data;
  },

  async startService(tokenId) {
    const res = await api.post(`/staff/token/${tokenId}/start`);
    return res.data;
  },

  async completeService(tokenId) {
    const res = await api.post(`/staff/token/${tokenId}/complete`);
    return res.data;
  },

  async skip(tokenId) {
    const res = await api.post(`/staff/token/${tokenId}/skip`);
    return res.data;
  },
};
