import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

export interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  created_at: string;
}

interface AuthState {
  token: string | null;
  user: User | null;
  isHydrated: boolean;
  
  // Actions
  setCredentials: (user: User, token: string) => void;
  updateUser: (user: User) => void;
  logout: () => void;
  hydrate: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      isHydrated: false,
      
      setCredentials: (user, token) => set({ user, token }),
      updateUser: (user) => set({ user }),
      logout: () => set({ token: null, user: null }),
      hydrate: () => set({ isHydrated: true }),
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => localStorage),
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.hydrate()
        }
      },
    }
  )
)
