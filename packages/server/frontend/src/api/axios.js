import axios from 'axios'
import { toast } from 'react-toastify'

const api = axios.create({
  baseURL: 'http://localhost:3000/api',
  withCredentials: true, // sends session cookie automatically
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
})

// ─── Request Interceptor ───────────────────────────────
api.interceptors.request.use(
  (config) => {
    // No token needed — session cookie is sent automatically via withCredentials
    // You can attach any custom headers here if needed in the future
    return config
  },
  (error) => Promise.reject(error)
)

// ─── Response Interceptor ─────────────────────────────
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status
    const message = error.response?.data?.message || error.message

    if (status === 401) {
      // Session expired or not logged in
      // Let the AuthContext handle redirection
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