import { usePassengerAuthStore } from '../store/usePassengerAuthStore';

declare var global: any;
declare var window: any;

// 1. Require modules to bypass ESM strict type checking
const PusherModule = require('pusher-js');
const EchoModule = require('laravel-echo');

const Pusher = PusherModule.Pusher || PusherModule.default || PusherModule;
const EchoClient = EchoModule.default || EchoModule;

if (typeof global !== 'undefined') {
  global.Pusher = Pusher;
}
if (typeof window !== 'undefined') {
  window.Pusher = Pusher;
}

export const setupEcho = async () => {
  try {
    const token = usePassengerAuthStore.getState().token;

    if (!token) {
        console.warn("Echo Setup Warning: Token is missing!");
    }

    const echoInstance = new EchoClient({
      broadcaster: 'reverb',
      key: 'toitoi_live_key_2026',
      wsHost: 'staging.toitoi.co.in',
      wsPort: 443,
      wssPort: 443,
      forceTLS: true,
      disableStats: true,
      enabledTransports: ['ws', 'wss'],
      authEndpoint: 'https://staging.toitoi.co.in/api/v1/broadcasting/auth',
      auth: {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
        },
      },
    });

    return echoInstance;
  } catch (error) {
    console.error('Echo Constructor Error:', error);
    throw error;
  }
};