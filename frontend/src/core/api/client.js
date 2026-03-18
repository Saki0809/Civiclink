import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If 401 and not already retried, try to refresh token
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      const refreshToken = localStorage.getItem('refresh_token');
      if (refreshToken) {
        try {
          const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
            refresh_token: refreshToken,
          });

          const { access_token, refresh_token: newRefreshToken } = response.data;
          
          localStorage.setItem('access_token', access_token);
          localStorage.setItem('refresh_token', newRefreshToken);

          originalRequest.headers.Authorization = `Bearer ${access_token}`;
          return api(originalRequest);
        } catch (refreshError) {
          // Refresh failed, clear tokens and redirect to login
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          localStorage.removeItem('user');
          window.location.href = '/login';
          return Promise.reject(refreshError);
        }
      }
    }

    return Promise.reject(error);
  }
);

// Auth API
export const authApi = {
  login: (email, password, domain) =>
    api.post('/auth/login', { email, password, domain }),
  
  signup: (userData) =>
    api.post('/auth/signup', userData),
  
  logout: () =>
    api.post('/auth/logout'),
  
  getProfile: () =>
    api.get('/auth/me'),
  
  refreshToken: (refreshToken) =>
    api.post('/auth/refresh', { refresh_token: refreshToken }),
};

// Notifications API
export const notificationsApi = {
  getNotifications: (params = {}) =>
    api.get('/notifications', { params }),
  
  markAsRead: (notificationId) =>
    api.post(`/notifications/${notificationId}/read`),
  
  markAllAsRead: (domain = null) =>
    api.post('/notifications/read-all', null, { params: { domain } }),
};

// Chat API
export const chatApi = {
  getRoom: (domain) =>
    api.get(`/chat/rooms/${domain}`),
  
  getMessages: (domain, params = {}) =>
    api.get(`/chat/rooms/${domain}/messages`, { params }),
  
  sendMessage: (domain, content, messageType = 'text') =>
    api.post(`/chat/rooms/${domain}/messages`, {
      content,
      message_type: messageType,
      room_id: '', // Will be set by backend
    }),
  
  moderateMessage: (messageId) =>
    api.post(`/chat/messages/${messageId}/moderate`),
};

// Healthcare API
export const healthcareApi = {
  getCamps: (params = {}) =>
    api.get('/healthcare/camps', { params }),
  
  getMyCamps: (params = {}) =>
    api.get('/healthcare/camps/my', { params }),
  
  getCamp: (campId) =>
    api.get(`/healthcare/camps/${campId}`),
  
  createCamp: (campData) =>
    api.post('/healthcare/camps', campData),
  
  registerForCamp: (campId, data) =>
    api.post(`/healthcare/camps/${campId}/register`, data),
  
  volunteerForCamp: (campId, data) =>
    api.post(`/healthcare/camps/${campId}/volunteer`, data),
};

// Municipal API
export const municipalApi = {
  getIssues: (params = {}) =>
    api.get('/municipal/issues', { params }),
  
  getMyIssues: (params = {}) =>
    api.get('/municipal/issues/my', { params }),
  
  getAssignedIssues: (params = {}) =>
    api.get('/municipal/issues/assigned', { params }),
  
  getIssue: (issueId) =>
    api.get(`/municipal/issues/${issueId}`),
  
  createIssue: (issueData) =>
    api.post('/municipal/issues', issueData),
  
  updateIssue: (issueId, data) =>
    api.patch(`/municipal/issues/${issueId}`, data),
  
  getIssueTimeline: (issueId) =>
    api.get(`/municipal/issues/${issueId}/timeline`),
  
  addComment: (issueId, message, newStatus = null) =>
    api.post(`/municipal/issues/${issueId}/comments`, { message, new_status: newStatus }),
};

// Education API
export const educationApi = {
  getJobs: (params = {}) =>
    api.get('/education/jobs', { params }),
  
  getMyJobs: (params = {}) =>
    api.get('/education/jobs/my', { params }),
  
  getJob: (jobId) =>
    api.get(`/education/jobs/${jobId}`),
  
  createJob: (jobData) =>
    api.post('/education/jobs', jobData),
  
  applyForJob: (jobId, data) =>
    api.post(`/education/jobs/${jobId}/apply`, data),
  
  getMyApplications: (params = {}) =>
    api.get('/education/applications/my', { params }),
  
  getJobApplications: (jobId, params = {}) =>
    api.get(`/education/jobs/${jobId}/applications`, { params }),
  
  updateApplicationStatus: (applicationId, status, notes = null) =>
    api.patch(`/education/applications/${applicationId}/status`, { status, notes }),
};

// Civilian API
export const civilianApi = {
  getOpportunities: (params = {}) =>
    api.get('/civilian/opportunities', { params }),
  
  getApplications: (params = {}) =>
    api.get('/civilian/applications', { params }),
  
  getPreferences: () =>
    api.get('/civilian/preferences'),
  
  updatePreferences: (preferences) =>
    api.patch('/civilian/preferences', preferences),
};

export default api;
