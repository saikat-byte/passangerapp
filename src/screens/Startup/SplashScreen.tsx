import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity, Linking, Platform } from 'react-native';
import { useNavigation, CommonActions } from '@react-navigation/native';
import Animated, { useSharedValue, useAnimatedStyle, withSpring, withSequence, withTiming, withRepeat } from 'react-native-reanimated';
import { TOITOI_THEME } from '../../theme';
import { usePassengerAuthStore } from '../../store/usePassengerAuthStore';
import { usePassengerRideStore } from '../../store/usePassengerRideStore';
import { InitAPI, UserAPI } from '../../services/api';

const APP_VERSION = '1.0.0';

export default function SplashScreen() {
  const navigation = useNavigation<any>();
  const { token } = usePassengerAuthStore();
  const { fetchCurrentRide } = usePassengerRideStore();
  
  const [isCriticalUpdate, setIsCriticalUpdate] = useState(false);
  const [actionUrl, setActionUrl] = useState('');

  // 🪄 Animation Values
  const scale = useSharedValue(0.5);
  const rotate = useSharedValue('0deg');

  useEffect(() => {
    // 🚀 Start Neobrutalism Bounce Animation
    scale.value = withSpring(1, { damping: 4, stiffness: 100 });
    rotate.value = withRepeat(
      withSequence(
        withTiming('-5deg', { duration: 100 }),
        withTiming('5deg', { duration: 100 }),
        withTiming('0deg', { duration: 100 })
      ), 3, false // Wiggles 3 times then stops
    );

    const initApp = async () => {
      // try {
      //   const statusResponse = await InitAPI.getAppStatus(Platform.OS, APP_VERSION);
      //   if (statusResponse.data?.is_critical_update) {
      //     setIsCriticalUpdate(true);
      //     setActionUrl(statusResponse.data?.action_url || '');
      //     return; // Stop execution if critical update needed
      //   }
      // } catch (error) { console.log('App Status check failed', error); }

      await new Promise(resolve => setTimeout(resolve, 2000)); // Hold for 2 seconds to show off the animation 😎

      if (!token) {
        navigation.dispatch(CommonActions.reset({ index: 0, routes: [{ name: 'AuthStack' }] }));
      } else {
        try {
           await UserAPI.deviceSync({
             fcm_token: "mock_fcm_token_until_firebase_setup",
             device_os: Platform.OS,
             app_version: APP_VERSION
           });
        } catch(e) { console.log("Device sync failed", e); }

        await fetchCurrentRide();
        const activeRide = usePassengerRideStore.getState().currentRide;
        if (activeRide) {
          navigation.dispatch(CommonActions.reset({ index: 0, routes: [{ name: 'MainStack', state: { routes: [{ name: 'ActiveRide' }] } }] }));
        } else {
          navigation.dispatch(CommonActions.reset({ index: 0, routes: [{ name: 'MainStack', state: { routes: [{ name: 'BookingDashboard' }] } }] }));
        }
      }
    };

    initApp();
  }, [token]);

  const animatedLogoStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }, { rotate: rotate.value }],
  }));

  if (isCriticalUpdate) {
    return (
      <View style={styles.updateContainer}>
        <Text style={styles.updateTitle}>UPDATE REQUIRED</Text>
        <Text style={styles.updateText}>We have added new features. You must update the app to continue.</Text>
        <TouchableOpacity style={styles.updateBtn} activeOpacity={0.8} onPress={() => Linking.openURL(actionUrl)}>
          <Text style={styles.updateBtnText}>UPDATE NOW</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.logoBox, animatedLogoStyle]}>
        <Text style={styles.logoText}>TOITOI</Text>
      </Animated.View>
      <Text style={styles.loadingText}>Starting Engine...</Text>
      <ActivityIndicator size="large" color={TOITOI_THEME.colors.black} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: TOITOI_THEME.colors.background, justifyContent: 'center', alignItems: 'center' },
  updateContainer: { flex: 1, backgroundColor: TOITOI_THEME.colors.primary, justifyContent: 'center', padding: 30 },
  updateTitle: { fontSize: 32, fontWeight: TOITOI_THEME.typography.fontBlack, color: TOITOI_THEME.colors.black, marginBottom: 15 },
  updateText: { fontSize: 18, fontWeight: TOITOI_THEME.typography.fontBold, color: TOITOI_THEME.colors.black, marginBottom: 40 },
  updateBtn: { backgroundColor: TOITOI_THEME.colors.white, padding: 20, borderWidth: TOITOI_THEME.borders.thick, borderColor: TOITOI_THEME.colors.black, alignItems: 'center' },
  updateBtnText: { fontSize: 20, fontWeight: TOITOI_THEME.typography.fontBlack, color: TOITOI_THEME.colors.black },
  logoBox: { backgroundColor: TOITOI_THEME.colors.primary, paddingHorizontal: 30, paddingVertical: 15, borderWidth: TOITOI_THEME.borders.thick, borderColor: TOITOI_THEME.colors.black, ...TOITOI_THEME.shadows.brutal, marginBottom: 40 },
  logoText: { fontSize: 48, fontWeight: TOITOI_THEME.typography.fontBlack, color: TOITOI_THEME.colors.black, letterSpacing: 4 },
  loadingText: { fontSize: 18, fontWeight: TOITOI_THEME.typography.fontBold, color: TOITOI_THEME.colors.gray.text, marginBottom: 20 }
});