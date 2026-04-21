import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Dimensions, Share } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import MapViewDirections from 'react-native-maps-directions';
import Animated, { useSharedValue, useAnimatedStyle, withRepeat, withTiming, Easing, interpolate, withDelay } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, CommonActions } from '@react-navigation/native';

import { TOITOI_THEME } from '../../theme';
import { usePassengerRideStore } from '../../store/usePassengerRideStore';
import { RideAPI } from '../../services/api';
// Ensure these paths match your folder structure
import RideChatModal from '../../components/RideChatModal';
import SafetyDashboard from '../../components/SafetyDashboard';
import CheckoutInvoiceModal from '../../components/CheckoutInvoiceModal';

const GOOGLE_MAPS_APIKEY = "AIzaSyAwKI25kj8Y0olyH9vrCSfuAr8Ez3Xi4fg";
const { width, height } = Dimensions.get('window');

export default function ActiveRideScreen() {
  const { currentRide, driverLocation, animatedDriverLocation, disconnectSockets } = usePassengerRideStore();
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();
  const mapRef = useRef<MapView>(null);
  
  const [chatVisible, setChatVisible] = useState(false);
  const [checkoutVisible, setCheckoutVisible] = useState(false);
  const [safetyVisible, setSafetyVisible] = useState(false);

  // 🔴 OLA Style 3-Wave Animation Values
  const pulse1 = useSharedValue(0);
  const pulse2 = useSharedValue(0);
  const pulse3 = useSharedValue(0);

  useEffect(() => {
    // Wave Pulsing Loops
    if (currentRide?.status === 'pending') {
      const config = { duration: 3000, easing: Easing.out(Easing.ease) };
      pulse1.value = withRepeat(withTiming(1, config), -1, false);
      pulse2.value = withRepeat(withDelay(1000, withTiming(1, config)), -1, false);
      pulse3.value = withRepeat(withDelay(2000, withTiming(1, config)), -1, false);
    }
  }, [currentRide?.status]);

  // 🔴 FIXED: Top-level Animated Styles (No Rule of Hooks violation)
  const wave1Style = useAnimatedStyle(() => ({
    transform: [{ scale: interpolate(pulse1.value, [0, 1], [1, 4]) }],
    opacity: interpolate(pulse1.value, [0, 0.5, 1], [0.8, 0.3, 0]),
  }));
  const wave2Style = useAnimatedStyle(() => ({
    transform: [{ scale: interpolate(pulse2.value, [0, 1], [1, 4]) }],
    opacity: interpolate(pulse2.value, [0, 0.5, 1], [0.8, 0.3, 0]),
  }));
  const wave3Style = useAnimatedStyle(() => ({
    transform: [{ scale: interpolate(pulse3.value, [0, 1], [1, 4]) }],
    opacity: interpolate(pulse3.value, [0, 0.5, 1], [0.8, 0.3, 0]),
  }));

  useEffect(() => {
    if (currentRide?.status === 'completed') {
      disconnectSockets();
      setCheckoutVisible(true);
    } else if (currentRide?.status === 'cancelled') {
      Alert.alert('Ride Ended', 'Your ride was cancelled.');
      disconnectSockets();
      navigation.dispatch(CommonActions.reset({ index: 0, routes: [{ name: 'BookingDashboard' }] }));
    }
  }, [currentRide?.status]);

  const handleCancel = () => {
    Alert.alert('Cancel Ride', 'Are you sure?', [
      { text: 'No', style: 'cancel' },
      { text: 'Yes, Cancel', style: 'destructive', onPress: async () => {
          try {
            await RideAPI.cancelRide(currentRide?.id || '', 'Changed my mind');
            disconnectSockets();
            navigation.dispatch(CommonActions.reset({ index: 0, routes: [{ name: 'BookingDashboard' }] }));
          } catch (e) {
            Alert.alert('Error', 'Failed to cancel the ride. Try again.');
          }
      }}
    ]);
  };

  const handlePaymentComplete = () => {
    setCheckoutVisible(false);
    navigation.dispatch(CommonActions.reset({ index: 0, routes: [{ name: 'BookingDashboard' }] })); 
  };

  const shareTracking = async () => {
    try {
      const url = `https://toitoi.in/track/${currentRide?.share_tracking_token || currentRide?.id}`;
      await Share.share({
        message: `I'm on a TOITOI ride! Track my live location here: ${url}`,
      });
    } catch (e) { console.log(e); }
  };

  if (!currentRide) return null;

  return (
    <View style={styles.container}>
      {/* 🔴 PENDING STATE: Ola Style Waves */}
      {currentRide.status === 'pending' ? (
        <View style={styles.searchingContainer}>
          <Text style={styles.searchingTitle}>Finding your TOITOI...</Text>
          
          <View style={styles.radarWrapper}>
            <Animated.View style={[styles.radarPulse, wave3Style]} />
            <Animated.View style={[styles.radarPulse, wave2Style]} />
            <Animated.View style={[styles.radarPulse, wave1Style]} />
            <View style={styles.radarBox}>
              <Text style={{fontSize: 50}}>🛺</Text>
            </View>
          </View>
          <Text style={styles.radarSubText}>Connecting to nearby drivers...</Text>

          <TouchableOpacity style={[styles.cancelSearchBtn, { marginBottom: Math.max(insets.bottom, 20) }]} onPress={handleCancel} activeOpacity={0.8}>
            <Text style={styles.cancelSearchText}>CANCEL SEARCH</Text>
          </TouchableOpacity>
        </View>
      ) : (
        /* 🔴 ACTIVE RIDE STATE: Map & Sheet */
        <>
          <MapView
            ref={mapRef} provider={PROVIDER_GOOGLE} style={styles.map}
            initialRegion={{ latitude: currentRide.pickup_lat, longitude: currentRide.pickup_lng, latitudeDelta: 0.02, longitudeDelta: 0.02 }}
          >
            {driverLocation && animatedDriverLocation && (
              <Marker.Animated 
                coordinate={animatedDriverLocation} anchor={{ x: 0.5, y: 0.5 }}
                rotation={driverLocation.heading || 0} flat={true}
              >
                <View style={styles.vehicleMarker}><Text style={{ fontSize: 24, transform: [{ rotate: '-90deg' }] }}>🛺</Text></View>
              </Marker.Animated>
            )}
            
            <Marker coordinate={{ latitude: currentRide.pickup_lat, longitude: currentRide.pickup_lng }} pinColor="green" title="Pickup" />
            <Marker coordinate={{ latitude: currentRide.drop_lat, longitude: currentRide.drop_lng }} pinColor="black" title="Dropoff" />

            {currentRide.status === 'accepted' && driverLocation ? (
              <MapViewDirections
                origin={driverLocation} destination={{ latitude: currentRide.pickup_lat, longitude: currentRide.pickup_lng }}
                apikey={GOOGLE_MAPS_APIKEY} strokeWidth={4} strokeColor={TOITOI_THEME.colors.primary}
                onReady={(res) => mapRef.current?.fitToCoordinates(res.coordinates, { edgePadding: { top: 50, right: 50, bottom: height * 0.4, left: 50 }, animated: true })}
              />
            ) : (currentRide.status === 'in_progress' ? (
              <MapViewDirections
                origin={{ latitude: currentRide.pickup_lat, longitude: currentRide.pickup_lng }} destination={{ latitude: currentRide.drop_lat, longitude: currentRide.drop_lng }}
                apikey={GOOGLE_MAPS_APIKEY} strokeWidth={5} strokeColor={TOITOI_THEME.colors.black}
                onReady={(res) => mapRef.current?.fitToCoordinates(res.coordinates, { edgePadding: { top: 50, right: 50, bottom: height * 0.4, left: 50 }, animated: true })}
              />
            ) : null)}
          </MapView>

          {/* 🔴 Top SOS Button */}
          <TouchableOpacity style={[styles.sosBtnTop, { top: Math.max(insets.top, 20) }]} onPress={() => setSafetyVisible(true)}>
            <Text style={styles.sosTextTop}>SOS</Text>
          </TouchableOpacity>

          <SafetyDashboard visible={safetyVisible} onClose={() => setSafetyVisible(false)} />

          <View style={[styles.bottomSheet, { paddingBottom: Math.max(insets.bottom, 20) }]}>
            <View style={styles.headerRow}>
              <Text style={styles.statusText}>
                {currentRide.status === 'accepted' ? 'Driver is on the way' : 
                 currentRide.status === 'arrived' ? 'Driver has arrived' : 'Heading to destination'}
              </Text>
              <TouchableOpacity style={styles.chatBtn} onPress={() => setChatVisible(true)}>
                <Text style={styles.chatBtnText}>💬 CHAT</Text>
              </TouchableOpacity>
            </View>

            {/* 🔴 Security PIN */}
            {(currentRide.status === 'accepted' || currentRide.status === 'arrived') && (
              <View style={styles.pinBox}>
                <Text style={styles.pinLabel}>Security PIN for Driver</Text>
                <Text style={styles.pinText}>{currentRide.security_pin || '----'}</Text>
              </View>
            )}

            <View style={styles.driverInfo}>
              <View>
                 <Text style={styles.driverName}>{currentRide.driver?.name || 'Searching...'}</Text>
                 <Text style={styles.vehicleNo}>{currentRide.driver?.vehicle_number || 'WB XX XXXX'}</Text>
              </View>
              <View style={styles.iconBox}><Text style={{fontSize:24}}>📞</Text></View>
            </View>

            <View style={styles.actionRow}>
              <TouchableOpacity style={styles.shareBtnBottom} onPress={shareTracking}>
                <Text style={styles.shareBtnText}>🔗 Share Tracking</Text>
              </TouchableOpacity>

              {(currentRide.status === 'accepted' || currentRide.status === 'arrived') && (
                <TouchableOpacity style={styles.cancelBtn} onPress={handleCancel}>
                  <Text style={styles.actionText}>✕</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </>
      )}

      {/* Modals */}
      <RideChatModal visible={chatVisible} onClose={() => setChatVisible(false)} rideId={currentRide.id} />
      <CheckoutInvoiceModal visible={checkoutVisible} onClose={handlePaymentComplete} amount={currentRide.fare_amount || 0} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: TOITOI_THEME.colors.background }, map: { flex: 1 },
  bottomSheet: { position: 'absolute', bottom: 0, width: '100%', backgroundColor: TOITOI_THEME.colors.white, padding: 20, borderTopWidth: TOITOI_THEME.borders.thick, borderColor: TOITOI_THEME.colors.black, ...TOITOI_THEME.shadows.brutal },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  statusText: { fontSize: 20, fontWeight: TOITOI_THEME.typography.fontBlack, color: TOITOI_THEME.colors.black, flex: 1 },
  chatBtn: { backgroundColor: TOITOI_THEME.colors.primary, padding: 10, borderWidth: TOITOI_THEME.borders.medium, borderColor: TOITOI_THEME.colors.black, borderRadius: TOITOI_THEME.borders.radius.sm, ...TOITOI_THEME.shadows.brutal },
  chatBtnText: { fontWeight: TOITOI_THEME.typography.fontBlack },
  pinBox: { backgroundColor: TOITOI_THEME.colors.white, borderWidth: TOITOI_THEME.borders.thick, borderColor: TOITOI_THEME.colors.black, padding: 15, alignItems: 'center', marginBottom: 15, borderRadius: TOITOI_THEME.borders.radius.md, borderStyle: 'dashed' },
  pinLabel: { fontSize: 14, fontWeight: 'bold', color: TOITOI_THEME.colors.gray.dark, marginBottom: 5 },
  pinText: { fontSize: 40, fontWeight: TOITOI_THEME.typography.fontBlack, letterSpacing: 10, color: TOITOI_THEME.colors.black },
  driverInfo: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: TOITOI_THEME.colors.gray.light, borderWidth: TOITOI_THEME.borders.medium, borderColor: TOITOI_THEME.colors.black, padding: 15, marginBottom: 10, borderRadius: TOITOI_THEME.borders.radius.sm },
  driverName: { fontSize: 20, fontWeight: TOITOI_THEME.typography.fontBlack },
  vehicleNo: { fontSize: 16, color: TOITOI_THEME.colors.gray.text, fontWeight: 'bold' },
  iconBox: { width: 40, height: 40, backgroundColor: TOITOI_THEME.colors.white, borderRadius: 20, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  actionRow: { flexDirection: 'row', gap: 10, marginTop: 5 },
  shareBtnBottom: { flex: 1, backgroundColor: TOITOI_THEME.colors.black, padding: 15, alignItems: 'center', borderRadius: TOITOI_THEME.borders.radius.sm, borderWidth: 2, borderColor: TOITOI_THEME.colors.black, ...TOITOI_THEME.shadows.brutal },
  shareBtnText: { color: TOITOI_THEME.colors.primary, fontWeight: TOITOI_THEME.typography.fontBlack, fontSize: 16 },
  cancelBtn: { backgroundColor: TOITOI_THEME.colors.danger, borderWidth: 2, borderColor: TOITOI_THEME.colors.black, paddingHorizontal: 20, justifyContent: 'center', borderRadius: TOITOI_THEME.borders.radius.sm, ...TOITOI_THEME.shadows.brutal },
  actionText: { fontSize: 20, fontWeight: TOITOI_THEME.typography.fontBlack, color: TOITOI_THEME.colors.white },
  vehicleMarker: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255,255,255,0.9)', borderRadius: 20, borderWidth: 2, borderColor: TOITOI_THEME.colors.black },
  searchingContainer: { flex: 1, backgroundColor: TOITOI_THEME.colors.primaryLight, justifyContent: 'center', alignItems: 'center', padding: 20 },
  searchingTitle: { fontSize: 28, fontWeight: TOITOI_THEME.typography.fontBlack, textAlign: 'center', marginBottom: 60, color: TOITOI_THEME.colors.black },
  radarWrapper: { width: 200, height: 200, justifyContent: 'center', alignItems: 'center', marginBottom: 60 },
  radarPulse: { position: 'absolute', width: 80, height: 80, borderRadius: 40, backgroundColor: TOITOI_THEME.colors.primary, borderWidth: 2, borderColor: TOITOI_THEME.colors.black },
  radarBox: { width: 80, height: 80, borderRadius: 40, backgroundColor: TOITOI_THEME.colors.white, borderWidth: 4, borderColor: TOITOI_THEME.colors.black, justifyContent: 'center', alignItems: 'center', ...TOITOI_THEME.shadows.brutal },
  radarSubText: { fontSize: 14, fontWeight: TOITOI_THEME.typography.fontBold, color: TOITOI_THEME.colors.gray.text, marginBottom: 40 },
  cancelSearchBtn: { position: 'absolute', bottom: 40, backgroundColor: TOITOI_THEME.colors.white, width: '100%', paddingVertical: 18, borderWidth: TOITOI_THEME.borders.thick, borderColor: TOITOI_THEME.colors.black, alignItems: 'center', ...TOITOI_THEME.shadows.brutal, borderRadius: TOITOI_THEME.borders.radius.sm },
  cancelSearchText: { fontSize: 20, fontWeight: TOITOI_THEME.typography.fontBlack, color: TOITOI_THEME.colors.danger },
  sosBtnTop: { position: 'absolute', right: 20, backgroundColor: TOITOI_THEME.colors.danger, width: 60, height: 60, borderRadius: 30, justifyContent: 'center', alignItems: 'center', borderWidth: 3, borderColor: TOITOI_THEME.colors.black, ...TOITOI_THEME.shadows.brutal },
  sosTextTop: { color: TOITOI_THEME.colors.white, fontWeight: TOITOI_THEME.typography.fontBlack, fontSize: 18 }
});