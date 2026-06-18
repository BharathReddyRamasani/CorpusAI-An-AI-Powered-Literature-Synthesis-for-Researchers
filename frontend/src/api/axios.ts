import axios from 'axios'
import { useAuthStore } from '../store/authStore'
import toast from 'react-hot-toast'

// Default to API proxy via Vite
const API_URL = import.meta.env.VITE_API_URL || ''

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request Interceptor: Attach JWT token
api.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().token
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Response Interceptor: Handle auth errors globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Auto logout if token is expired/invalid, but NOT if they are just typing the wrong password/OTP on an auth form
      const isAuthRequest = error.config?.url?.includes('/api/auth/login') || 
                            error.config?.url?.includes('/api/auth/verify-otp') ||
                            error.config?.url?.includes('/api/auth/reset-password');
      
      if (!isAuthRequest) {
        useAuthStore.getState().logout()
        toast.error('Session expired. Please log in again.')
      }
    }
    
    // Extract error message from API if available
    let message: string = 'An unexpected error occurred'
    try {
      if (error.response?.data?.detail) {
        const detail = error.response.data.detail
        if (typeof detail === 'string') {
          message = detail
        } else if (Array.isArray(detail)) {
          message = detail.map((err: any) => err.msg || JSON.stringify(err)).join(', ')
        } else {
          message = JSON.stringify(detail)
        }
      } else if (error.response?.data?.message) {
        message = error.response.data.message
      } else if (error.message) {
        message = error.message
      }
      
      // Absolute safety net to prevent React crash
      if (typeof message !== 'string') {
        message = JSON.stringify(message)
      }
    } catch (e) {
      message = 'An unexpected error occurred'
    }
    
    // Show toasts for errors, but suppress 404s and global 401s (auth 401s should still show!)
    const isAuthRequest = error.config?.url?.includes('/api/auth/login') || 
                          error.config?.url?.includes('/api/auth/verify-otp') ||
                          error.config?.url?.includes('/api/auth/reset-password');

    if (error.response?.status !== 404) {
      if (error.response?.status !== 401 || isAuthRequest) {
        toast.error(message)
      }
    }

    return Promise.reject(error)
  }
)
