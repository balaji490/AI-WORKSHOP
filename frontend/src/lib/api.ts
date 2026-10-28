import axios from 'axios';

const API_BASE = '/api';

const api = axios.create({
  baseURL: API_BASE,
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
});

// Request interceptor — add token from localStorage as fallback
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token && !config.headers.Authorization) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor — handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (
      error.response?.status === 401 &&
      error.response?.data?.code === 'TOKEN_EXPIRED' &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true;
      try {
        const { data } = await axios.post(`${API_BASE}/auth/refresh`, {}, { withCredentials: true });
        if (data.accessToken) {
          localStorage.setItem('accessToken', data.accessToken);
          originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
        }
        return api(originalRequest);
      } catch {
        localStorage.removeItem('accessToken');
        window.location.href = '/login';
        return Promise.reject(error);
      }
    }
    return Promise.reject(error);
  }
);

// ===== AUTH =====
export const authAPI = {
  signup: (data: any) => api.post('/auth/signup', data),
  login: (data: any) => api.post('/auth/login', data),
  logout: () => api.post('/auth/logout'),
  me: () => api.get('/auth/me'),
  refresh: () => api.post('/auth/refresh'),
  verifyEmail: (token: string) => api.post('/auth/verify-email', { token }),
  forgotPassword: (email: string) => api.post('/auth/forgot-password', { email }),
  resetPassword: (token: string, password: string) => api.post('/auth/reset-password', { token, password }),
};

// ===== USER =====
export const userAPI = {
  getProfile: () => api.get('/user/profile'),
  updateProfile: (data: any) => api.put('/user/profile', data),
};

// ===== WORKSHOPS =====
export const workshopAPI = {
  getAll: () => api.get('/workshops'),
  getById: (id: string) => api.get(`/workshops/${id}`),
  create: (data: any) => api.post('/workshops', data),
  update: (id: string, data: any) => api.put(`/workshops/${id}`, data),
};

// ===== REGISTRATIONS =====
export const registrationAPI = {
  register: (data: any) => api.post('/registrations', data),
  getMyRegistrations: () => api.get('/registrations/my'),
  getMyStatus: () => api.get('/registrations/my/status'),
};

// ===== REFERRALS =====
export const referralAPI = {
  validate: (code: string) => api.get(`/referrals/validate/${code}`),
  getMyReferrals: () => api.get('/referrals/my'),
  getLeaderboard: () => api.get('/referrals/leaderboard'),
};

// ===== ADMIN =====
export const adminAPI = {
  getStats: () => api.get('/admin/stats'),
  getRegistrations: (params?: any) => api.get('/admin/registrations', { params }),
  exportCSV: (params?: any) => api.get('/admin/registrations/export', { params, responseType: 'blob' }),
  getDailyAnalytics: (days?: number) => api.get('/admin/analytics/daily', { params: { days } }),
  getChannelAnalytics: () => api.get('/admin/analytics/channels'),
  getReferralAnalytics: () => api.get('/admin/analytics/referrals'),
  getWorkshops: () => api.get('/admin/workshops'),
  // Campaigns
  getCampaigns: () => api.get('/admin/campaigns'),
  createCampaign: (data: any) => api.post('/admin/campaigns', data),
  updateCampaign: (id: string, data: any) => api.put(`/admin/campaigns/${id}`, data),
  getChannels: (campaignId: string) => api.get(`/admin/campaigns/${campaignId}/channels`),
  createChannel: (campaignId: string, data: any) => api.post(`/admin/campaigns/${campaignId}/channels`, data),
  updateChannel: (id: string, data: any) => api.put(`/admin/channels/${id}`, data),
  getCampaignEvents: (campaignId: string) => api.get(`/admin/campaigns/${campaignId}/events`),
  createCampaignEvent: (campaignId: string, data: any) => api.post(`/admin/campaigns/${campaignId}/events`, data),
  // Ambassadors
  getAmbassadors: () => api.get('/admin/ambassadors'),
  createAmbassador: (data: any) => api.post('/admin/ambassadors', data),
  updateAmbassador: (id: string, data: any) => api.put(`/admin/ambassadors/${id}`, data),
  deleteAmbassador: (id: string) => api.delete(`/admin/ambassadors/${id}`),
};

export default api;
