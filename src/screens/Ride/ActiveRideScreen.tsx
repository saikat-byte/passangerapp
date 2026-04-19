import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Dimensions } from 'react-native';
import MapView, { MarkerAnimated, PROVIDER_GOOGLE } from 'react-native-maps';
import MapViewDirections from 'react-native-maps-directions';
import Animated, { useSharedValue, useAnimatedStyle, withRepeat, withTiming, Easing, interpolate } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, CommonActions } from '@react-navigation/native';

import { TOITOI_THEME } from '../../theme';
import { usePassengerRideStore } from '../../store/usePassengerRideStore';
import { RideAPI } from '../../services/api';
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

  // Radar Animation Values
  const pulseScale = useSharedValue(1);

  useEffect(() => {
    // Radar Pulse Loop
    if (currentRide?.status === 'pending') {
      pulseScale.value = withRepeat(
        withTiming(2.5, { duration: 1500, easing: Easing.out(Easing.ease) }),
        -1, false
      );
    }
  }, [currentRide?.status]);

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
      { text: 'No' },
      { text: 'Yes, Cancel', onPress: () => {
          RideAPI.cancelRide(currentRide?.id || '', 'Changed my mind');
          navigation.dispatch(CommonActions.reset({ index: 0, routes: [{ name: 'BookingDashboard' }] }));
      }}
    ]);
  };

  const handlePaymentComplete = () => {
    setCheckoutVisible(false);
    navigation.dispatch(CommonActions.reset({ index: 0, routes: [{ name: 'BookingDashboard' }] })); 
  };

  if (!currentRide) return null;

  // Radar Animation Style
  const animatedRadarStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseScale.value }],
    opacity: interpolate(pulseScale.value, [1, 2.5], [0.8, 0]),
  }));

  return (
    <View style={styles.container}>
      {/* 🔴 PENDING STATE: Dynamic Reanimated Radar */}
      {currentRide.status === 'pending' ? (
        <View style={styles.searchingContainer}>
          <Text style={styles.searchingTitle}>Searching for TOITOI...</Text>
          
          <View style={styles.radarWrapper}>
            <Animated.View style={[styles.radarPulse, animatedRadarStyle]} />
            <View style={styles.radarBox}>
              <Text style={{fontSize: 50}}>🛺</Text>
            </View>
          </View>
          <Text style={styles.radarSubText}>Broadcasting Request to Nearby Drivers</Text>

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
            {/* Smooth Moving Driver Marker */}
            {driverLocation && (
              <MarkerAnimated 
                coordinate={animatedDriverLocation} anchor={{ x: 0.5, y: 0.5 }}
                rotation={driverLocation.heading || 0} flat={true}
              >
                <View style={styles.vehicleMarker}><Text style={{ fontSize: 24, transform: [{ rotate: '-90deg' }] }}>🛺</Text></View>
              </MarkerAnimated>
            )}
            
            <Marker coordinate={{ latitude: currentRide.pickup_lat, longitude: currentRide.pickup_lng }} pinColor="green" title="Pickup" />
            <Marker coordinate={{ latitude: currentRide.drop_lat, longitude: currentRide.drop_lng }} pinColor="black" title="Dropoff" />

            {/* Smart Polyline: Shows Driver->Pickup BEFORE arriving, and Pickup->Dropoff AFTER starting */}
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

          {(currentRide.status === 'in_progress' || currentRide.status === 'accepted') && <SafetyDashboard />}

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

            {currentRide.status === 'arrived' && (
              <View style={styles.pinBox}>
                <Text style={styles.pinLabel}>START RIDE PIN</Text>
                <Text style={styles.pinText}>{currentRide.security_pin || '----'}</Text>
              </View>
            )}

            <View style={styles.driverInfo}>
              <View>
                 <Text style={styles.driverName}>{currentRide.driver?.name || 'Loading Driver...'}</Text>
                 <Text style={styles.vehicleNo}>{currentRide.driver?.vehicle_number || 'WB XX XXXX'}</Text>
              </View>
              <View style={styles.iconBox}><Text style={{fontSize:24}}>📞</Text></View>
            </View>

            <View style={styles.actionRow}>
              {(currentRide.status === 'accepted' || currentRide.status === 'arrived') && (
                <TouchableOpacity style={styles.cancelBtn} onPress={handleCancel}>
                  <Text style={styles.actionText}>CANCEL RIDE</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </>
      )}

      <RideChatModal visible={chatVisible} onClose={() => setChatVisible(false)} rideId={currentRide.id} />
      <CheckoutInvoiceModal isVisible={checkoutVisible} onClose={handlePaymentComplete} />
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
  pinBox: { backgroundColor: TOITOI_THEME.colors.primary, borderWidth: TOITOI_THEME.borders.thick, borderColor: TOITOI_THEME.colors.black, padding: 20, alignItems: 'center', marginBottom: 15, ...TOITOI_THEME.shadows.brutal },
  pinLabel: { fontSize: 16, fontWeight: TOITOI_THEME.typography.fontBold },
  pinText: { fontSize: 48, fontWeight: TOITOI_THEME.typography.fontBlack, letterSpacing: 10 },
  driverInfo: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: TOITOI_THEME.colors.gray.light, borderWidth: TOITOI_THEME.borders.medium, borderColor: TOITOI_THEME.colors.black, padding: 15, marginBottom: 10 },
  driverName: { fontSize: 20, fontWeight: TOITOI_THEME.typography.fontBlack },
  vehicleNo: { fontSize: 16, color: TOITOI_THEME.colors.gray.text, fontWeight: 'bold' },
  iconBox: { width: 40, height: 40, backgroundColor: TOITOI_THEME.colors.white, borderRadius: 20, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  actionRow: { marginTop: 5 },
  cancelBtn: { backgroundColor: TOITOI_THEME.colors.white, borderWidth: TOITOI_THEME.borders.thick, borderColor: TOITOI_THEME.colors.black, padding: 15, alignItems: 'center', ...TOITOI_THEME.shadows.brutal },
  actionText: { fontSize: 18, fontWeight: TOITOI_THEME.typography.fontBlack, color: TOITOI_THEME.colors.danger },
  vehicleMarker: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255,255,255,0.9)', borderRadius: 20, borderWidth: 2, borderColor: TOITOI_THEME.colors.black },
  searchingContainer: { flex: 1, backgroundColor: TOITOI_THEME.colors.primaryLight, justifyContent: 'center', alignItems: 'center', padding: 20 },
  searchingTitle: { fontSize: 28, fontWeight: TOITOI_THEME.typography.fontBlack, textAlign: 'center', marginBottom: 60, color: TOITOI_THEME.colors.black },
  radarWrapper: { width: 200, height: 200, justifyContent: 'center', alignItems: 'center', marginBottom: 60 },
  radarPulse: { position: 'absolute', width: 100, height: 100, borderRadius: 50, backgroundColor: TOITOI_THEME.colors.primary, borderWidth: 4, borderColor: TOITOI_THEME.colors.black },
  radarBox: { width: 100, height: 100, borderRadius: 50, backgroundColor: TOITOI_THEME.colors.white, borderWidth: 4, borderColor: TOITOI_THEME.colors.black, justifyContent: 'center', alignItems: 'center', ...TOITOI_THEME.shadows.brutal },
  radarSubText: { fontSize: 14, fontWeight: TOITOI_THEME.typography.fontBold, color: TOITOI_THEME.colors.gray.text, marginBottom: 40 },
  cancelSearchBtn: { position: 'absolute', bottom: 40, backgroundColor: TOITOI_THEME.colors.white, width: '100%', paddingVertical: 18, borderWidth: TOITOI_THEME.borders.thick, borderColor: TOITOI_THEME.colors.black, alignItems: 'center', ...TOITOI_THEME.shadows.brutal },
  cancelSearchText: { fontSize: 20, fontWeight: TOITOI_THEME.typography.fontBlack, color: TOITOI_THEME.colors.danger },
});