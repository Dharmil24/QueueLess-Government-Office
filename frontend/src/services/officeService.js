import api from './api';

export const officeService = {
  async getOffices(params = {}) {
    const res = await api.get('/offices', { params });
    return res.data;
  },

  async getOfficeById(id) {
    const res = await api.get(`/offices/${id}`);
    return res.data;
  },

  async getOfficeQueueSummary(id) {
    const res = await api.get(`/offices/${id}/queue-summary`);
    return res.data;
  },

  async getServices(params = {}) {
    const res = await api.get('/services', { params });
    return res.data;
  },

  async getServiceById(id) {
    const res = await api.get(`/services/${id}`);
    return res.data;
  },
};
