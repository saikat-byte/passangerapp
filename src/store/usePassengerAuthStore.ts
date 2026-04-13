import { create } from 'zustand';

interface User {
  id: string;
  name?: string;
  phone: string;
}

interface SavedPlace {
  id: string;
  title: string;
  address: string;
  latitude: number;
  longitude: number;
}

interface AuthState {
  token: string | null;
  user: User | null;
  savedPlaces: SavedPlace[];
  setToken: (token: string) => void;
  setUser: (user: User) => void;
  setSavedPlaces: (places: SavedPlace[]) => void;
  logout: () => void;
}

export const usePassengerAuthStore = create<AuthState>((set) => ({
  token: null,
  user: null,
  savedPlaces: [],
  setToken: (token) => set({ token }),
  setUser: (user) => set({ user }),
  setSavedPlaces: (places) => set({ savedPlaces: places }),
  logout: () => set({ token: null, user: null, savedPlaces: [] }),
}));