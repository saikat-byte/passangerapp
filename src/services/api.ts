import axios from 'axios';
import { usePassengerAuthStore } from '../store/usePassengerAuthStore';
import { Platform } from 'react-native';

const BASE_URL = 'http://192.168.29.11:8000/api/v1'; 
const MOBILE_APP_SECRET = 'toitoi-secret'; 

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'X-App-Secret': MOBILE_APP_SECRET,
  },
});

api.interceptors.request.use((config) => {
  const token = usePassengerAuthStore.getState().token;
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const InitAPI = {
  getAppStatus: (platform: string, current_version: string) => 
    api.get('/init/app-status', { params: { platform, current_version } }),
};

export const AuthAPI = {
  sendOtp: (phone: string, provider: string = 'msg91') => 
    api.post('/auth/send-otp', { phone, auth_provider: provider }),
  
  verifyOtp: (payload: {
    auth_provider: string;
    phone: string;
    otp: string;
    req_id: string;
    fcm_token?: string;
    device_token?: string;
    device_os?: string;
    app_version?: string;
  }) => api.post('/auth/verify-otp', payload),
};

export const UserAPI = {
  deviceSync: (data: { fcm_token: string; device_os: string; app_version: string }) => 
    api.post('/user/device-sync', data),
};

export const ProfileAPI = {
  getProfile: () => api.get('/profile'),
  
  updateProfile: (formData: FormData) => api.post('/profile/update', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  }),

  deleteAccount: () => api.post('/profile/delete-account'),

  getSavedPlaces: () => api.get('/passenger/saved-places'),
  addSavedPlace: (data: any) => api.post('/passenger/saved-places', data),
  deleteSavedPlace: (id: number) => api.delete(`/passenger/saved-places/${id}`),
};

export const BookingAPI = {
  getNearbyDrivers: (lat: number, lng: number) => 
    api.get(`/passenger/nearby-drivers?lat=${lat}&lng=${lng}`),
  estimateFare: (data: {
    pickup_lat: number;
    pickup_lng: number;
    drop_lat: number;
    drop_lng: number;
    estimated_distance_km: number;
    estimated_duration_min: number;
    vehicle_category_id: number;
    promo_code?: string;
  }) => api.post('/passenger/estimate-fare', data),
  requestRide: (data: any) => api.post('/passenger/ride/request', data),
  getVehicleCategories: () => api.get('/passenger/vehicles/categories'),
};

export const SafetyAPI = {
  getContacts: () => api.get('/safety/emergency-contacts'),
  // 🔴 Updated to match EmergencyContactsScreen logic
  addContact: (data: { name: string; phone: string; relation?: string }) => 
    api.post('/safety/emergency-contacts', data),
  deleteContact: (id: number) => api.delete(`/safety/emergency-contacts/${id}`),
  triggerSos: (data: { latitude: number; longitude: number; ride_id?: string | number; reason?: string }) => 
    api.post('/safety/sos/trigger', data),
};

export const RideAPI = {
  getCurrentRide: () => api.get('/ride/current'),
  getRideHistory: () => api.get('/ride/history'),
  cancelRide: (id: string | number, reason?: string) => 
    api.post(`/ride/${id}/cancel`, { reason }),

  getChat: (rideId: string | number) => api.get(`/ride/${rideId}/chat`),
  sendChat: (rideId: string | number, message: string) => 
    api.post(`/ride/${rideId}/chat/send`, { message }),

  // 🔴 Phase 6: Post-Ride & Tracking APIs
  rateRide: (id: string | number, data: { rating: number, review_text?: string }) => 
    api.post(`/ride/${id}/rate`, data),
  disputeRide: (id: string | number, data: { issue_type: string, description?: string }) => 
    api.post(`/ride/${id}/dispute`, data),
  payForRide: (id: string | number, payment_method: string) => 
    api.post(`/passenger/ride/${id}/pay`, { payment_method }),
  getLiveTracking: (id: string | number) => 
    api.get(`/passenger/ride/${id}/live-tracking`),
};

// 🔴 Added PassengerAPI specifically for Phase 6 Screens (Subscriptions & History)
export const PassengerAPI = {
  getSubscriptionPlans: () => api.get('/subscriptions/plans'),
  purchaseSubscription: (data: { plan_id: string | number }) => api.post('/subscriptions/purchase', data),
  getRideHistory: () => api.get('/ride/history'), // Used by RideHistoryScreen
  getActivePromos: () => api.get('/passenger/promos/active'),
};

export const WalletAPI = {
  getBalance: () => api.get('/wallet/balance'),
  getTransactions: () => api.get('/wallet/transactions'),
  addMoney: (amount: number) => api.post('/wallet/add-money', { amount }),
};

export const NotificationAPI = {
  getNotifications: () => api.get('/notifications'),
};



export default api;