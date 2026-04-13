import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { usePassengerAuthStore } from '../store/usePassengerAuthStore';

// Screens
import SplashScreen from '../screens/Startup/SplashScreen';
import LoginScreen from '../screens/Auth/LoginScreen';
import OtpVerificationScreen from '../screens/Auth/OtpVerificationScreen';
import SavedPlacesScreen from '../screens/Profile/SavedPlacesScreen';

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  const token = usePassengerAuthStore((state) => state.token);
  const [isSplashVisible, setIsSplashVisible] = useState(true);

  useEffect(() => {
    // ২ সেকেন্ড পর স্প্ল্যাশ স্ক্রিন হাইড হয়ে যাবে
    const timer = setTimeout(() => {
      setIsSplashVisible(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  if (isSplashVisible) {
    return <SplashScreen />;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {token == null ? (
          // Auth Stack
          <>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="OtpVerification" component={OtpVerificationScreen} />
          </>
        ) : (
          // Main Stack
          <>
            <Stack.Screen name="SavedPlaces" component={SavedPlacesScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}