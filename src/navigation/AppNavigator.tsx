import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import LanguageSelectionScreen from '../screens/Auth/LanguageSelectionScreen';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import GlobalErrorToast from '../components/GlobalErrorToast';
// Screens
import SplashScreen from '../screens/Startup/SplashScreen';
import LoginScreen from '../screens/Auth/LoginScreen';
import OtpVerificationScreen from '../screens/Auth/OtpVerificationScreen';
import SavedPlacesScreen from '../screens/Profile/SavedPlacesScreen';
import ActiveRideScreen from '../screens/Ride/ActiveRideScreen';
import BookingDashboardScreen from '../screens/Dashboard/BookingDashboardScreen';
import '../locales/i18n';

// 🔴 Phase 6 New Screens (Make sure these files exist or create empty placeholders for now)
import ProfileScreen from '../screens/Profile/ProfileScreen'; // Placeholder
import WalletScreen from '../screens/Wallet/WalletScreen'; // Placeholder
import SubscriptionPassScreen from '../screens/Menu/SubscriptionPassScreen';
import RideHistoryScreen from '../screens/Menu/RideHistoryScreen';
import RideInvoiceScreen from '../screens/Menu/RideInvoiceScreen';
import ReferralScreen from '../screens/Menu/ReferralScreen'; // Placeholder
import EmergencyContactsScreen from '../screens/Safety/EmergencyContactsScreen';
import LegalDocumentScreen from '../screens/Menu/LegalDocumentScreen'; // Placeholder

const RootStack = createNativeStackNavigator();
const AuthStack = createNativeStackNavigator();
const MainStack = createNativeStackNavigator();

function AuthNavigator() {
  return (
    <AuthStack.Navigator screenOptions={{ headerShown: false }}>
      <AuthStack.Screen name="LanguageSelection" component={LanguageSelectionScreen} />
      <AuthStack.Screen name="Login" component={LoginScreen} />
      <AuthStack.Screen name="OtpVerification" component={OtpVerificationScreen} />
    </AuthStack.Navigator>
  );
}

function MainNavigator() {
  return (
    <MainStack.Navigator screenOptions={{ headerShown: false }}>
      {/* Dashboard & Core Ride */}
      <MainStack.Screen name="BookingDashboard" component={BookingDashboardScreen} />
      <MainStack.Screen name="ActiveRide" component={ActiveRideScreen} />
      
      {/* Side Menu Screens */}
      <MainStack.Screen name="Profile" component={ProfileScreen} />
      <MainStack.Screen name="Wallet" component={WalletScreen} />
      <MainStack.Screen name="SubscriptionPassScreen" component={SubscriptionPassScreen} />
      <MainStack.Screen name="RideHistoryScreen" component={RideHistoryScreen} />
      <MainStack.Screen name="RideInvoiceScreen" component={RideInvoiceScreen} />
      <MainStack.Screen name="SavedPlaces" component={SavedPlacesScreen} />
      <MainStack.Screen name="Referrals" component={ReferralScreen} />
      <MainStack.Screen name="EmergencyContacts" component={EmergencyContactsScreen} />
      <MainStack.Screen name="LegalDocuments" component={LegalDocumentScreen} />
    </MainStack.Navigator>
  );
}

export default function AppNavigator() {
  return (
    <>
      <NavigationContainer>
        <RootStack.Navigator initialRouteName="Splash" screenOptions={{ headerShown: false }}>
          <RootStack.Screen name="Splash" component={SplashScreen} />
          <RootStack.Screen name="AuthStack" component={AuthNavigator} />
          <RootStack.Screen name="MainStack" component={MainNavigator} />
        </RootStack.Navigator>
      </NavigationContainer>
      
      <GlobalErrorToast />
    </>
  );
}