import api from './axios'

// ─── Auth ──────────────────────────────────────────────
export const authAPI = {
  me: () => api.get('/auth/me'),
  login: (data) => api.post('/auth/login', data),
  register: (data) => api.post('/auth/register', data),
  googleAuth: (accessToken) => api.post('/auth/google', { accessToken }),
  logout: () => api.post('/auth/logout'),
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
  resetPassword: (token, password) => api.post('/auth/reset-password', { token, password }),
}

// ─── User ─────────────────────────────────────────────
export const userAPI = {
  getProfile: () => api.get('/user/profile'),
  updateProfile: (data) => api.put('/user/profile', data),
  changePassword: (data) => api.put('/user/change-password', data),
  getOrders: () => api.get('/user/orders'),
}

export const keyAPI = {
  create: (data) => api.post('/keys', data),
  getAll: () => api.get('/keys'),
  delete: (id) => api.delete(`/keys/${id}`),
  toggleStatus: (id) => api.patch(`/keys/${id}/toggle-status`),
}