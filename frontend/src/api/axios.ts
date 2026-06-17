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
      // Auto logout if token is expired/invalid
      useAuthStore.getState().logout()
      toast.error('Session expired. Please log in again.')
      // Optional: window.location.href = '/login' (if not handled by router)
    }
    
    // Extract error message from API if available
    const message = error.response?.data?.detail || error.message || 'An unexpected error occurred'
    
    // We don't want to show toasts for every 404, only specific errors
    if (error.response?.status !== 404 && error.response?.status !== 401) {
       toast.error(message)
    }

    return Promise.reject(error)
  }
)
