import { useState } from 'react';
import * as Location from 'expo-location';
import { Alert } from 'react-native';

export const useLocationPermission = () => {
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);

  const requestLocation = async () => {
    setIsLoadingLocation(true);
    try {
      // 1. Check if device GPS is physically ON
      const providerStatus = await Location.hasServicesEnabledAsync();
      if (!providerStatus) {
        setErrorMsg('Please turn on your device GPS/Location.');
        Alert.alert('GPS Disabled', 'Please enable location services to find nearby TOITOI rides.');
        setIsLoadingLocation(false);
        return null;
      }

      // 2. Request App Permission
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Permission to access location was denied');
        Alert.alert('Permission Denied', 'We need location access to book your ride smoothly.');
        setIsLoadingLocation(false);
        return null;
      }

      // 3. Fetch current location
      let loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      setLocation(loc);
      setIsLoadingLocation(false);
      return loc;
      
    } catch (error) {
      setErrorMsg('Failed to fetch location');
      setIsLoadingLocation(false);
      return null;
    }
  };

  return { location, errorMsg, isLoadingLocation, requestLocation };
};