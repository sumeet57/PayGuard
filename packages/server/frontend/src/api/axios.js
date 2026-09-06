import axios from 'axios'
import { toast } from 'react-toastify'

const api = axios.create({
  // baseURL : 'https://payguard-server-460009295734.asia-south1.run.app/api',
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
})

// ─── Request Interceptor ───────────────────────────────
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// ─── Response Interceptor ─────────────────────────────
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status

    if (status === 401) {
      localStorage.removeItem('token')
      window.dispatchEvent(new CustomEvent('auth:unauthorized'))
    } else if (status === 403) {
      toast.error('You don\'t have permission to do that.')
    } else if (status === 429) {
      toast.warn('Too many requests. Slow down a bit!')
    } else if (status >= 500) {
      toast.error('Server error. Please try again later.')
    }

    return Promise.reject(error)
  }
)

export default api