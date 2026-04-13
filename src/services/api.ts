import axios from 'axios';
import { usePassengerAuthStore } from '../store/usePassengerAuthStore';
import { Platform } from 'react-native';

const BASE_URL = 'http://192.168.29.11:8000/api/v1'; // OpenAPI অনুযায়ী বেস ইউআরএল

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = usePassengerAuthStore.getState().token;
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const AuthAPI = {
  sendOtp: (phone: string) => api.post('/auth/send-otp', { phone }),
  login: (phone: string, otp: string) =>
    api.post('/auth/login', {
      auth_provider: 'msg91',
      phone,
      otp,
      device_os: Platform.OS === 'ios' ? 'ios' : 'android',
    }),
};

export const ProfileAPI = {
  getProfile: () => api.get('/profile'),
  getSavedPlaces: () => api.get('/passenger/saved-places'),
  addSavedPlace: (data: { title: string; address: string; latitude: number; longitude: number }) =>
    api.post('/passenger/saved-places', data),
};

export default api;