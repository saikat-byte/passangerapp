import { create } from 'zustand';
import { BookingAPI } from '../services/api';

export interface LocationPoint {
  latitude: number;
  longitude: number;
  address: string;
}

interface BookingState {
  serviceType: 'ride' | 'rental' | 'delivery';
  pickup: LocationPoint | null;
  dropoff: LocationPoint | null;
  stops: LocationPoint[];
  rentalHours: number;
  
  selectedCategory: number;
  distanceKm: number;
  durationMin: number;
  vehicleCategories: any[];
  batchFares: Record<number, any>;
  isSelectingDropoffOnMap: boolean;
  
  // 🔴 Sprint 3: New Customization States
  isShared: boolean;
  bookedSeats: number;
  isWomenSpecial: boolean;
  scheduledAt: Date | null; // For Advance Booking

  setServiceType: (type: 'ride' | 'rental' | 'delivery') => void;
  setPickup: (pickup: LocationPoint | null) => void;
  setDropoff: (dropoff: LocationPoint | null) => void;
  addStop: (stop: LocationPoint) => void;
  removeStop: (index: number) => void;
  setRentalHours: (hours: number) => void;
  
  setSelectedCategory: (categoryId: number) => void;
  setRideDetails: (distance: number, duration: number) => void;
  setSelectingDropoffOnMap: (val: boolean) => void;
  
  toggleShared: () => void;
  setBookedSeats: (seats: number) => void; // 🔴 For Shared Ride Counter
  toggleWomenSpecial: () => void;
  setScheduledAt: (date: Date | null) => void; // 🔴 For Date/Time Picker

  fetchVehicleCategories: () => Promise<void>;
  estimateAllFares: () => Promise<void>;
  resetBooking: () => void;
}

export const useBookingStore = create<BookingState>((set, get) => ({
  serviceType: 'ride',
  pickup: null,
  dropoff: null,
  stops: [],
  rentalHours: 2,
  
  selectedCategory: 1,
  distanceKm: 0,
  durationMin: 0,
  vehicleCategories: [],
  batchFares: {},
  isSelectingDropoffOnMap: false,

  isShared: false,
  bookedSeats: 1,
  isWomenSpecial: false,
  scheduledAt: null, 

  setServiceType: (serviceType) => set({ serviceType, dropoff: null, stops: [], batchFares: {} }),
  setPickup: (pickup) => set({ pickup }),
  setDropoff: (dropoff) => set({ dropoff, batchFares: {} }),
  addStop: (stop) => set((state) => ({ stops: [...state.stops, stop] })),
  removeStop: (index) => set((state) => ({ stops: state.stops.filter((_, i) => i !== index) })),
  setRentalHours: (rentalHours) => set({ rentalHours, batchFares: {} }),
  
  setSelectedCategory: (selectedCategory) => set({ selectedCategory }),
  setRideDetails: (distanceKm, durationMin) => set({ distanceKm, durationMin }),
  setSelectingDropoffOnMap: (isSelectingDropoffOnMap) => set({ isSelectingDropoffOnMap }),
  
  // 🔴 Sprint 3 Customization Actions
  toggleShared: () => set((state) => ({ isShared: !state.isShared, bookedSeats: !state.isShared ? 1 : state.bookedSeats })),
  setBookedSeats: (bookedSeats) => set({ bookedSeats }),
  toggleWomenSpecial: () => set((state) => ({ isWomenSpecial: !state.isWomenSpecial })),
  setScheduledAt: (scheduledAt) => set({ scheduledAt }),

  fetchVehicleCategories: async () => {
    try {
      const response = await BookingAPI.getVehicleCategories();
      set({ vehicleCategories: response.data?.data || [] });
    } catch (error) {
      console.error("Failed to fetch vehicle categories:", error);
    }
  },

  estimateAllFares: async () => {
    const { pickup, dropoff, distanceKm, durationMin, vehicleCategories, serviceType, rentalHours } = get();
    if (!pickup) return;
    if (serviceType === 'ride' && (!dropoff || !distanceKm)) return;

    try {
      const farePromises = vehicleCategories.map(cat => 
        BookingAPI.estimateFare({
          pickup_lat: pickup.latitude, 
          pickup_lng: pickup.longitude,
          drop_lat: dropoff?.latitude || pickup.latitude, 
          drop_lng: dropoff?.longitude || pickup.longitude,
          estimated_distance_km: distanceKm || 0,
          estimated_duration_min: durationMin || (rentalHours * 60),
          vehicle_category_id: cat.id,
          service_type: serviceType, 
          rental_hours: serviceType === 'rental' ? rentalHours : null
        } as any)
        .then(res => ({ id: cat.id, fare: res.data?.data }))
        .catch(() => ({ id: cat.id, fare: null }))
      );

      const results = await Promise.all(farePromises);
      const fareMap: Record<number, any> = {};
      results.forEach(res => { if (res.fare) fareMap[res.id] = res.fare; });
      set({ batchFares: fareMap });
    } catch (error) { console.error("Fare Error", error); }
  },

  resetBooking: () => set({ 
    pickup: null, dropoff: null, stops: [], batchFares: {}, 
    isShared: false, bookedSeats: 1, isWomenSpecial: false, 
    scheduledAt: null, isSelectingDropoffOnMap: false 
  }),
}));