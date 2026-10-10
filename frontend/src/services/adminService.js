import api from './api';

export const adminService = {
  // Analytics
  async getAnalytics() {
    const res = await api.get('/admin/analytics');
    return res.data;
  },

  async getLiveQueue() {
    const res = await api.get('/admin/live-queue');
    return res.data;
  },

  // Offices
  async createOffice(data) {
    const res = await api.post('/admin/offices', data);
    return res.data;
  },
  async updateOffice(id, data) {
    const res = await api.put(`/admin/offices/${id}`, data);
    return res.data;
  },
  async deleteOffice(id) {
    const res = await api.delete(`/admin/offices/${id}`);
    return res.data;
  },

  // Departments
  async getDepartments(officeId) {
    const res = await api.get('/admin/departments', { params: { officeId } });
    return res.data;
  },
  async createDepartment(data) {
    const res = await api.post('/admin/departments', data);
    return res.data;
  },
  async updateDepartment(id, data) {
    const res = await api.put(`/admin/departments/${id}`, data);
    return res.data;
  },
  async deleteDepartment(id) {
    const res = await api.delete(`/admin/departments/${id}`);
    return res.data;
  },

  // Services
  async createService(data) {
    const res = await api.post('/admin/services', data);
    return res.data;
  },
  async updateService(id, data) {
    const res = await api.put(`/admin/services/${id}`, data);
    return res.data;
  },
  async deleteService(id) {
    const res = await api.delete(`/admin/services/${id}`);
    return res.data;
  },

  // Counters
  async getCounters(officeId) {
    const res = await api.get('/admin/counters', { params: { officeId } });
    return res.data;
  },
  async createCounter(data) {
    const res = await api.post('/admin/counters', data);
    return res.data;
  },
  async updateCounter(id, data) {
    const res = await api.put(`/admin/counters/${id}`, data);
    return res.data;
  },
  async deleteCounter(id) {
    const res = await api.delete(`/admin/counters/${id}`);
    return res.data;
  },

  // Staff
  async getStaff() {
    const res = await api.get('/admin/staff');
    return res.data;
  },
  async createStaff(data) {
    const res = await api.post('/admin/staff', data);
    return res.data;
  },
  async updateStaff(id, data) {
    const res = await api.put(`/admin/staff/${id}`, data);
    return res.data;
  },
  async deleteStaff(id) {
    const res = await api.delete(`/admin/staff/${id}`);
    return res.data;
  },

  // Live Queue Token Controls
  async updateLiveToken(id, data) {
    const res = await api.patch(`/admin/live-queue/tokens/${id}`, data);
    return res.data;
  },
  async deleteLiveToken(id) {
    const res = await api.delete(`/admin/live-queue/tokens/${id}`);
    return res.data;
  },
  async clearLiveQueue(officeId) {
    const res = await api.delete(`/admin/live-queue/offices/${officeId}/clear`);
    return res.data;
  },

  // Citizens
  async getCitizens() {
    const res = await api.get('/admin/citizens');
    return res.data;
  },
  async updateCitizen(id, data) {
    const res = await api.put(`/admin/citizens/${id}`, data);
    return res.data;
  },
  async deleteCitizen(id) {
    const res = await api.delete(`/admin/citizens/${id}`);
    return res.data;
  },

  // Reports
  async getReports(period = 'daily') {
    const res = await api.get('/admin/reports', { params: { period } });
    return res.data;
  },
  async deleteReportToken(id) {
    const res = await api.delete(`/admin/reports/tokens/${id}`);
    return res.data;
  },
  getReportExportUrl(period = 'daily') {
    return `${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/admin/reports?period=${period}&format=csv`;
  },

  // Audit Logs
  async getAuditLogs() {
    const res = await api.get('/admin/audit-logs');
    return res.data;
  },

  // Settings
  async getSettings() {
    const res = await api.get('/admin/settings');
    return res.data;
  },
  async updateSettings(data) {
    const res = await api.put('/admin/settings', data);
    return res.data;
  },
};
