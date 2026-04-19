import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

// 🔴 Added proper TypeScript Interface for User
export interface Passenger {
  id: number;
  name: string | null;
  phone: string;
  email: string | null;
  avatar: string | null;
  is_trusted?: boolean;
  [key: string]: any; // To allow additional dynamic fields from API
}

interface AuthState {
  token: string | null;
  user: Passenger | null;
  savedPlaces: any[];
  setToken: (token: string) => void;
  setUser: (user: Passenger) => void;
  updateUser: (data: Partial<Passenger>) => void; // 🔴 Added for easy profile edits
  setSavedPlaces: (places: any[]) => void;
  logout: () => void;
}

export const usePassengerAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      savedPlaces: [], 
      
      setToken: (token) => set({ token }),
      
      setUser: (user) => set({ user }),
      
      // 🔴 Easily update specific fields (e.g., only update image and name)
      updateUser: (data) => set((state) => ({ 
        user: state.user ? { ...state.user, ...data } : null 
      })),
      
      setSavedPlaces: (savedPlaces) => set({ savedPlaces }),
      
      // Clear everything on logout
      logout: () => set({ token: null, user: null, savedPlaces: [] }),
    }),
    {
      name: 'passenger-auth-storage', // unique name for local storage key
      storage: createJSONStorage(() => AsyncStorage), // 🔴 Persist data across app restarts
    }
  )
);