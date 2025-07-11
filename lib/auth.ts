import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase, type Profile } from './supabase';
import type { User } from '@supabase/supabase-js';

export type UserRole = 'CLIENT' | 'SELLER' | 'ADMIN';

export interface AuthUser extends Profile {
  email: string;
}

interface AuthState {
  user: AuthUser | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, role: UserRole) => Promise<void>;
  logout: () => Promise<void>;
  updateBalance: (points: number) => Promise<void>;
  refreshUser: () => Promise<void>;
}

export const useAuth = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isLoading: false,
      
      login: async (email: string, password: string) => {
        set({ isLoading: true });
        try {
          const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
            email,
            password,
          });

          if (authError) throw authError;

          if (authData.user) {
            // Récupérer le profil utilisateur
            const { data: profile, error: profileError } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', authData.user.id)
              .single();

            if (profileError) throw profileError;

            const user: AuthUser = {
              ...profile,
              email: authData.user.email!,
            };

            set({ user, isLoading: false });
          }
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },
      
      register: async (name: string, email: string, password: string, role: UserRole) => {
        set({ isLoading: true });
        try {
          const { data: authData, error: authError } = await supabase.auth.signUp({
            email,
            password,
            options: {
              data: {
                name,
                role,
              },
            },
          });

          if (authError) throw authError;

          if (authData.user) {
            // Le profil sera créé automatiquement par le trigger
            // Attendre un peu puis récupérer le profil
            await new Promise(resolve => setTimeout(resolve, 1000));

            // Mettre à jour le rôle si nécessaire
            if (role !== 'CLIENT') {
              const { error: updateError } = await supabase
                .from('profiles')
                .update({ role })
                .eq('id', authData.user.id);

              if (updateError) throw updateError;
            }

            // Récupérer le profil complet
            const { data: profile, error: profileError } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', authData.user.id)
              .single();

            if (profileError) throw profileError;

            const user: AuthUser = {
              ...profile,
              email: authData.user.email!,
            };

            set({ user, isLoading: false });
          }
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },
      
      logout: async () => {
        await supabase.auth.signOut();
        set({ user: null });
      },
      
      updateBalance: async (points: number) => {
        const currentUser = get().user;
        if (!currentUser) return;

        try {
          const newBalance = currentUser.balance_points + points;
          
          const { error } = await supabase
            .from('profiles')
            .update({ balance_points: newBalance })
            .eq('id', currentUser.id);

          if (error) throw error;

          set({ 
            user: { 
              ...currentUser, 
              balance_points: newBalance 
            } 
          });
        } catch (error) {
          console.error('Erreur lors de la mise à jour du solde:', error);
          throw error;
        }
      },

      refreshUser: async () => {
        const { data: { user: authUser } } = await supabase.auth.getUser();
        
        if (authUser) {
          const { data: profile, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', authUser.id)
            .single();

          if (!error && profile) {
            const user: AuthUser = {
              ...profile,
              email: authUser.email!,
            };
            set({ user });
          }
        } else {
          set({ user: null });
        }
      }
    }),
    {
      name: 'auth-storage',
    }
  )
);

// Initialiser l'état d'authentification au chargement
supabase.auth.onAuthStateChange(async (event, session) => {
  const { refreshUser } = useAuth.getState();
  
  if (event === 'SIGNED_IN' && session?.user) {
    await refreshUser();
  } else if (event === 'SIGNED_OUT') {
    useAuth.setState({ user: null });
  }
});