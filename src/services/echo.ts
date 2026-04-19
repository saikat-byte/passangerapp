import Echo from 'laravel-echo';
import Pusher from 'pusher-js';
import { usePassengerAuthStore } from '../store/usePassengerAuthStore';

// @ts-ignore
window.Pusher = Pusher;

export const setupEcho = () => {
  const token = usePassengerAuthStore.getState().token;
  
  return new Echo({
    broadcaster: 'reverb',
    key: 'toitoi_live_key_2026', // Reverb App Key
    wsHost: '192.168.29.11', // আপনার Local IP
    wsPort: 8080,
    wssPort: 8080,
    forceTLS: false, // Local-এর জন্য false
    enabledTransports: ['ws', 'wss'],
    authEndpoint: 'http://192.168.29.11:8000/api/v1/broadcasting/auth', // খেয়াল করুন, এখানে 'v1' যোগ করা হয়েছে
    auth: {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/json',
      },
    },
  });
};