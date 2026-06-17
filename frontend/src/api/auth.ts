import { api } from './axios'
import { User } from '../store/authStore'

export interface LoginResponse {
  success: boolean;
  message: string;
  token: {
    access_token: string;
    expires_in: number;
  };
  user: User;
}

export interface RegisterResponse {
  success: boolean;
  message: string;
  user: User;
}

export const authApi = {
  login: async (data: any): Promise<LoginResponse> => {
    const response = await api.post('/api/auth/login', data)
    return response.data
  },
  
  register: async (data: any): Promise<RegisterResponse> => {
    const response = await api.post('/api/auth/register', data)
    return response.data
  },

  verifyOtp: async (data: { email: string; otp: string }): Promise<LoginResponse> => {
    const response = await api.post('/api/auth/verify-otp', data)
    return response.data
  },

  getProfile: async (): Promise<User> => {
    const response = await api.get('/api/auth/profile')
    return response.data
  },

  updateProfile: async (data: { name: string }): Promise<User> => {
    const response = await api.put('/api/auth/profile', data)
    return response.data
  },

  changePassword: async (data: any): Promise<{ success: boolean; message: string }> => {
    const response = await api.put('/api/auth/change-password', data)
    return response.data
  }
}
