// src/lib/api.ts
import axios from 'axios';
import { useAuthStore } from '@/store/authstore';
import { toast } from 'sonner';

export const api = axios.create({
  baseURL: import.meta.env.VITE_BASE_URL,
  withCredentials: true, // This ensures cookies/sessions are always sent
});

// Interceptor to handle global responses and errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // If the backend returns 401 Unauthorized, the session expired
    if (error.response?.status === 401) {
      toast.error('Session expired. Please log in again.');
      useAuthStore.getState().logout();
      window.location.href = '/auth/login';
    }
    return Promise.reject(error);
  }
);