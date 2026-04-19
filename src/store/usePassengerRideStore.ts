import { create } from 'zustand';
import { RideAPI } from '../services/api';
import { setupEcho } from '../services/echo';
import { AnimatedRegion } from 'react-native-maps'; // Needed for smooth map car movement

export interface Ride {
  id: string | number;
  status: 'pending' | 'accepted' | 'arrived' | 'in_progress' | 'completed' | 'cancelled';
  security_pin?: string;
  pickup_lat: number; pickup_lng: number;
  drop_lat: number; drop_lng: number;
  fare_amount?: number; payment_method?: string; share_tracking_token?: string;
  driver?: { name: string; vehicle_number: string; phone: string };
}

interface Location { latitude: number; longitude: number; heading?: number }

interface PassengerRideState {
  currentRide: Ride | null;
  driverLocation: Location | null;
  animatedDriverLocation: any; // 🔴 Added for smooth movement
  isLoadingRide: boolean;
  echoInstance: any;
  fetchCurrentRide: () => Promise<void>;
  setCurrentRide: (ride: Ride) => void;
  initRideSockets: (rideId: string | number) => void;
  disconnectSockets: () => void;
}

export const usePassengerRideStore = create<PassengerRideState>((set, get) => ({
  currentRide: null,
  driverLocation: null,
  animatedDriverLocation: new AnimatedRegion({ latitude: 0, longitude: 0, latitudeDelta: 0, longitudeDelta: 0 }),
  isLoadingRide: false,
  echoInstance: null,

  setCurrentRide: (ride) => {
    set({ currentRide: ride });
    get().initRideSockets(ride.id);
  },

  fetchCurrentRide: async () => {
    set({ isLoadingRide: true });
    try {
      const response = await RideAPI.getCurrentRide();
      const ride = response.data?.data;
      set({ currentRide: ride || null, isLoadingRide: false });
      if (ride) get().initRideSockets(ride.id);
    } catch (error) {
      set({ currentRide: null, isLoadingRide: false });
    }
  },

  initRideSockets: (rideId) => {
    const { echoInstance, animatedDriverLocation } = get();
    if (echoInstance) return; 

    const echo = setupEcho();
    set({ echoInstance: echo });
    console.log(`📡 Passenger listening to private-ride.${rideId}`);

    // 🔴 FIXED: Listening to exact Laravel Events
    echo.private(`ride.${rideId}`)
      .listen('.RideAccepted', (e: any) => {
         set((state) => ({ currentRide: { ...state.currentRide, ...e.ride } as Ride }));
      })
      .listen('.RideArrived', (e: any) => {
         set((state) => ({ currentRide: { ...state.currentRide, ...e.ride, status: 'arrived' } as Ride }));
      })
      .listen('.RideStarted', (e: any) => {
         set((state) => ({ currentRide: { ...state.currentRide, ...e.ride, status: 'in_progress' } as Ride }));
      })
      .listen('.RideCompleted', (e: any) => {
         set((state) => ({ currentRide: { ...state.currentRide, ...e.ride, status: 'completed' } as Ride }));
      })
      .listen('.RideCancelled', (e: any) => {
         set((state) => ({ currentRide: { ...state.currentRide, ...e.ride, status: 'cancelled' } as Ride }));
      })
      .listen('.DriverLocationUpdated', (e: any) => {
        // 🔴 Smooth Animation Logic
        animatedDriverLocation.timing({
          latitude: e.latitude, longitude: e.longitude, duration: 2500, useNativeDriver: false
        }).start();
        set({ driverLocation: { latitude: e.latitude, longitude: e.longitude, heading: e.heading } });
      });
  },

  disconnectSockets: () => {
    const { echoInstance, currentRide } = get();
    if (echoInstance && currentRide) {
      echoInstance.leave(`ride.${currentRide.id}`);
      set({ echoInstance: null, currentRide: null, driverLocation: null }); 
    }
  }
}));