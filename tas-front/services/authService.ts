import Cookies from 'js-cookie';
import { api } from './api';

export interface RegisterDto {
  firstName: string;
  lastName: string;
  email: string;
  password?: string;
  role?: string;
}

export interface LoginDto {
  email: string;
  password?: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken?: string;
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
    kycStatus: string;
  };
}

export const authService = {
  async register(data: RegisterDto): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/auth/register', data);
    return response.data;
  },

  async login(data: LoginDto): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/auth/login', data);
    return response.data;
  },

  async verifyIdentity(formData: FormData): Promise<void> {
    // Requires multipart/form-data
    await api.post('/auth/verify-identity', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  logout() {
    // 1. Eliminar accessToken y refreshToken
    Cookies.remove('accessToken');
    Cookies.remove('refreshToken');

    // 2. Limpiar estados y redirigir
    // (Al usar window.location.href, se recarga la app y se limpia todo estado en memoria como Zustand o Context de forma natural)
    if (typeof window !== 'undefined') {
      window.location.href = '/auth/login';
    }
  }
};
