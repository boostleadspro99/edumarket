import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type UserRole = 'CLIENT' | 'SELLER' | 'ADMIN';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  balancePoints: number;
}

interface AuthState {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, role: UserRole) => Promise<void>;
  logout: () => void;
  updateBalance: (points: number) => void;
}

export const useAuth = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isLoading: false,
      
      login: async (email: string, password: string) => {
        set({ isLoading: true });
        try {
          // Simulate API call - replace with actual auth logic
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          // Mock user data - replace with actual API response
          const mockUser: User = {
            id: '1',
            name: 'John Doe',
            email,
            role: email.includes('admin') ? 'ADMIN' : email.includes('seller') ? 'SELLER' : 'CLIENT',
            balancePoints: 150
          };
          
          set({ user: mockUser, isLoading: false });
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },
      
      register: async (name: string, email: string, password: string, role: UserRole) => {
        set({ isLoading: true });
        try {
          // Simulate API call
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          const newUser: User = {
            id: Date.now().toString(),
            name,
            email,
            role,
            balancePoints: 0
          };
          
          set({ user: newUser, isLoading: false });
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },
      
      logout: () => {
        set({ user: null });
      },
      
      updateBalance: (points: number) => {
        const user = get().user;
        if (user) {
          set({ user: { ...user, balancePoints: user.balancePoints + points } });
        }
      }
    }),
    {
      name: 'auth-storage',
    }
  )
);