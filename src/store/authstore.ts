import { create } from "zustand";
import { persist } from "zustand/middleware";
import axios from "axios";
import { api } from "@/lib/api";
import { disconnectSocket } from '@/sockets/socket';

interface User {
  id: string;
  name: string;
  email: string;
  profilePicture: string;
  role: string;
  refreshToken: string;
}

interface AuthState {
  user: User | null;
  isLoading: boolean;
  setUser: (user: User) => void;
  logout: () => void;
  login: (email: string, password: string) => Promise<void>;
  checkAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isLoading: true,
      setUser: (user) => set({ user }),
      logout: () => {
        set({ user: null }),
        disconnectSocket(),
        localStorage.removeItem('auth-storage');
      },
      login: async (email: string, password: string) => {
        set({ isLoading: true });
        try {
          const res = await api.post("/user/login", {
            data: email,
            password,
          });

          if (res.data.success) {
            const userData: User = {
              id: res.data.data.id,
              name: res.data.data.name,
              email: res.data.data.email,
              profilePicture: res.data.data.profilePicture,
              role: res.data.data.role,
              refreshToken: res.data.data.refreshToken,
            };
            set({ user: userData, isLoading: false });
            return;
          }
          throw new Error("Login failed");
        } catch (err) {
          set({ isLoading: false });
          if (axios.isAxiosError(err) && err.response) {
            throw new Error(err.response.data?.message || "Login failed");
          }
          throw new Error("Unknown error occurred");
        }
      },
      checkAuth: async () => {
        // With Zustand persist, the user is already rehydrated from localStorage synchronously.
        // We just mark loading as complete. If a backend check is needed later, add API call here.
        set({ isLoading: false });
      },
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({ user: state.user }),
    },
  ),
);
