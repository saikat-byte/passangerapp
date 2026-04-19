import React, { useState, useEffect, useRef, useCallback } from 'react';
import { View, StyleSheet, TouchableOpacity, Text, Dimensions } from 'react-native';
import MapView, { PROVIDER_GOOGLE, MarkerAnimated, AnimatedRegion } from 'react-native-maps';
import MapViewDirections from 'react-native-maps-directions';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import debounce from 'lodash/debounce';

import { useBookingStore } from '../../store/useBookingStore';
import { TOITOI_THEME } from '../../theme';
import LocationSearchModal from '../../components/LocationSearchModal';
import FareEstimateSheet from '../../components/FareEstimateSheet';
import SideMenu from '../../components/SideMenu';

// 🔴 Replace with your actual Google Maps API Key
const GOOGLE_MAPS_APIKEY = "AIzaSyAwKI25kj8Y0olyH9vrCSfuAr8Ez3Xi4fg";
const { height } = Dimensions.get('window');
const DEFAULT_REGION = { latitude: 23.4996, longitude: 87.7478, latitudeDelta: 0.01, longitudeDelta: 0.01 };

export default function BookingDashboardScreen() {
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();
  const mapRef = useRef<MapView>(null);
  
  // 🔴 Extracted serviceType and setServiceType directly from store to trigger re-renders
  const { 
    pickup, dropoff, setPickup, setDropoff, 
    fetchVehicleCategories, isSelectingDropoffOnMap, setSelectingDropoffOnMap,
    setRideDetails, estimateAllFares, serviceType, setServiceType
  } = useBookingStore();
  
  const [modalVisible, setModalVisible] = useState(false);
  const [isMapMoving, setIsMapMoving] = useState(false);
  const [isSideMenuVisible, setIsSideMenuVisible] = useState(false);
  const [activeDrivers, setActiveDrivers] = useState<any[]>([]);
  const [draggedAddress, setDraggedAddress] = useState<string>('');
  
  const pinTranslateY = useSharedValue(0);
  const pinShadowScale = useSharedValue(1);

  useEffect(() => {
    fetchVehicleCategories();
    simulateLiveDrivers();
  }, []);

  const simulateLiveDrivers = () => {
    const mockDriver = {
      id: 1, category: 'toto', heading: 90,
      coordinate: new AnimatedRegion({ latitude: 23.4980, longitude: 87.7480, latitudeDelta: 0, longitudeDelta: 0 }),
    };
    setActiveDrivers([mockDriver]);
  };

  const fetchAddressFromCoords = useCallback(
    debounce(async (lat: number, lng: number) => {
      try {
        const res = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${GOOGLE_MAPS_APIKEY}`);
        const data = await res.json();
        if (data.results && data.results.length > 0) {
          const address = data.results[0].formatted_address;
          setDraggedAddress(address);
          
          if (!isSelectingDropoffOnMap) {
            setPickup({ latitude: lat, longitude: lng, address });
          }
        }
      } catch (e) { console.log("Geocode error", e); }
    }, 800), [isSelectingDropoffOnMap]
  );

  const handleMapMove = () => {
    if (dropoff && !isSelectingDropoffOnMap) return;
    setIsMapMoving(true);
    pinTranslateY.value = withSpring(-20, { damping: 10, stiffness: 100 });
    pinShadowScale.value = withSpring(0.5);
  };

  const handleMapStop = (region: any) => {
    if (dropoff && !isSelectingDropoffOnMap) return;
    setIsMapMoving(false);
    pinTranslateY.value = withSpring(0, { damping: 12, stiffness: 120 });
    pinShadowScale.value = withSpring(1);
    fetchAddressFromCoords(region.latitude, region.longitude);
  };

  const animatedPinStyle = useAnimatedStyle(() => ({ transform: [{ translateY: pinTranslateY.value }] }));
  const animatedShadowStyle = useAnimatedStyle(() => ({ transform: [{ scale: pinShadowScale.value }], opacity: pinShadowScale.value }));

  // Helper condition to determine if we should show the polyline and hide ghost pin
  const isRideSet = dropoff && pickup && !isSelectingDropoffOnMap && serviceType !== 'rental';

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef} provider={PROVIDER_GOOGLE} style={styles.map} initialRegion={DEFAULT_REGION}
        onRegionChange={handleMapMove} onRegionChangeComplete={handleMapStop}
        showsUserLocation={true} showsMyLocationButton={false}
      >
        {/* Draw Polyline if Ride or Delivery and both points are set */}
        {isRideSet && (
          <MapViewDirections
            origin={{ latitude: pickup.latitude, longitude: pickup.longitude }}
            destination={{ latitude: dropoff.latitude, longitude: dropoff.longitude }}
            apikey={GOOGLE_MAPS_APIKEY}
            strokeWidth={4} strokeColor="#000"
            onReady={async (result) => {
              setRideDetails(result.distance, Math.ceil(result.duration));
              mapRef.current?.fitToCoordinates(result.coordinates, { edgePadding: { top: 50, right: 50, bottom: height * 0.45, left: 50 }, animated: true });
              await estimateAllFares();
            }}
          />
        )}

        {/* Live Drivers Mock */}
        {(!dropoff || serviceType === 'rental') && activeDrivers.map((driver) => (
          <MarkerAnimated key={driver.id} coordinate={driver.coordinate} anchor={{ x: 0.5, y: 0.5 }} rotation={driver.heading} flat={true}>
            <View style={styles.vehicleMarker}><Text style={{ fontSize: 24, transform: [{ rotate: '-90deg' }] }}>🛺</Text></View>
          </MarkerAnimated>
        ))}
      </MapView>

      {/* Dynamic Ghost Pin (Hides when a ride route is confirmed) */}
      {(!isRideSet) && (
        <View style={styles.centerPinContainer} pointerEvents="none">
          <View style={[styles.pinTooltip, isSelectingDropoffOnMap && { backgroundColor: TOITOI_THEME.colors.danger }]}>
            <Text style={[styles.tooltipText, isSelectingDropoffOnMap && { color: TOITOI_THEME.colors.white }]} numberOfLines={1}>
              {isMapMoving ? "Fetching..." : (draggedAddress || (isSelectingDropoffOnMap ? "Set Dropoff" : "Set Pickup"))}
            </Text>
          </View>
          <Animated.View style={[styles.pinBody, animatedPinStyle]}>
            <View style={[styles.pinDot, isSelectingDropoffOnMap && { borderColor: TOITOI_THEME.colors.danger }]} />
            <View style={styles.pinStick} />
          </Animated.View>
          <Animated.View style={[styles.pinShadow, animatedShadowStyle]} />
        </View>
      )}

      {/* Menu Button */}
      <TouchableOpacity style={[styles.menuBtn, { top: Math.max(insets.top, 20) }]} onPress={() => setIsSideMenuVisible(true)}>
        <Text style={styles.menuIcon}>☰</Text>
      </TouchableOpacity>

      {/* Bottom Interface */}
      {isSelectingDropoffOnMap ? (
        <View style={[styles.bottomCard, { paddingBottom: Math.max(insets.bottom, 25) }]}>
          <TouchableOpacity 
            style={[styles.confirmBtn, { backgroundColor: TOITOI_THEME.colors.black }]} 
            onPress={async () => {
              const center = await mapRef.current?.getCamera();
              if (center) {
                setDropoff({ latitude: center.center.latitude, longitude: center.center.longitude, address: draggedAddress || "Custom Location" });
                setSelectingDropoffOnMap(false);
              }
            }}
          >
            <Text style={{ fontSize: 18, fontWeight: 'bold', color: TOITOI_THEME.colors.primary }}>Confirm Dropoff</Text>
          </TouchableOpacity>
        </View>
      ) : (
        (!dropoff || serviceType === 'rental') && (
          <View style={[styles.bottomCard, { paddingBottom: Math.max(insets.bottom, 25) }]}>
            
            {/* 🔴 Dynamic Service Type Selector */}
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 }}>
               {['ride', 'rental', 'delivery'].map((type) => (
                 <TouchableOpacity 
                    key={type}
                    onPress={() => setServiceType(type as any)}
                    style={{
                      flex: 1, marginHorizontal: 5, paddingVertical: 12, alignItems: 'center', borderRadius: TOITOI_THEME.borders.radius.sm,
                      backgroundColor: serviceType === type ? TOITOI_THEME.colors.primary : TOITOI_THEME.colors.white,
                      borderWidth: 3, borderColor: TOITOI_THEME.colors.black,
                      ...(serviceType === type ? TOITOI_THEME.shadows.brutalActive : TOITOI_THEME.shadows.brutal),
                      transform: serviceType === type ? [{ translateX: 2 }, { translateY: 2 }] : []
                    }}
                 >
                   <Text style={{ fontWeight: TOITOI_THEME.typography.fontBlack, textTransform: 'uppercase' }}>{type}</Text>
                 </TouchableOpacity>
               ))}
            </View>

            <Text style={styles.greeting}>
              {serviceType === 'rental' ? 'Book a Rental' : 'Where to go?'}
            </Text>
            
            <TouchableOpacity style={styles.searchBox} activeOpacity={0.8} onPress={() => setModalVisible(true)}>
              <View style={styles.redSquare} />
              <Text style={styles.searchText}>
                 {serviceType === 'rental' ? 'Select Pickup & Hours...' : 'Search destination...'}
              </Text>
            </TouchableOpacity>
          </View>
        )
      )}

      {/* Show Fare Estimate only if Dropoff is set (or if it's Rental and Pickup is set) */}
      {(dropoff && !isSelectingDropoffOnMap && serviceType !== 'rental') && <FareEstimateSheet onCancel={() => setDropoff(null)} />}
      
      {/* 🔴 If rental, show estimate immediately after picking up */}
      {(serviceType === 'rental' && pickup && !isSelectingDropoffOnMap) && <FareEstimateSheet onCancel={() => {}} />}

      <LocationSearchModal visible={modalVisible} onClose={() => setModalVisible(false)} />
      <SideMenu isVisible={isSideMenuVisible} onClose={() => setIsSideMenuVisible(false)} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: TOITOI_THEME.colors.background },
  map: { flex: 1 },
  menuBtn: { position: 'absolute', left: 20, width: 50, height: 50, backgroundColor: TOITOI_THEME.colors.white, borderWidth: TOITOI_THEME.borders.thick, borderColor: TOITOI_THEME.colors.black, ...TOITOI_THEME.shadows.brutal, borderRadius: TOITOI_THEME.borders.radius.md, alignItems: 'center', justifyContent: 'center', zIndex: 999 },
  menuIcon: { fontSize: 24, fontWeight: TOITOI_THEME.typography.fontBlack, color: TOITOI_THEME.colors.black },
  centerPinContainer: { position: 'absolute', top: '50%', left: '50%', marginLeft: -100, marginTop: -80, width: 200, alignItems: 'center' },
  pinTooltip: { backgroundColor: TOITOI_THEME.colors.black, paddingHorizontal: 15, paddingVertical: 10, borderRadius: TOITOI_THEME.borders.radius.sm, marginBottom: 8, ...TOITOI_THEME.shadows.brutal, elevation: 5 },
  tooltipText: { color: TOITOI_THEME.colors.primary, fontSize: 13, fontWeight: TOITOI_THEME.typography.fontBold },
  pinBody: { alignItems: 'center' },
  pinDot: { width: 24, height: 24, backgroundColor: TOITOI_THEME.colors.black, borderRadius: 12, alignItems: 'center', justifyContent: 'center', borderWidth: 3, borderColor: TOITOI_THEME.colors.primary },
  pinStick: { width: 4, height: 18, backgroundColor: TOITOI_THEME.colors.black, marginTop: -2 },
  pinShadow: { width: 10, height: 6, backgroundColor: 'rgba(0,0,0,0.4)', borderRadius: 5, marginTop: 2 },
  vehicleMarker: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255,255,255,0.8)', borderRadius: 20, borderWidth: 2, borderColor: TOITOI_THEME.colors.black },
  bottomCard: { position: 'absolute', bottom: 0, width: '100%', backgroundColor: TOITOI_THEME.colors.white, paddingHorizontal: 20, paddingTop: 25, borderTopWidth: TOITOI_THEME.borders.thick, borderColor: TOITOI_THEME.colors.black },
  greeting: { fontSize: 24, fontWeight: TOITOI_THEME.typography.fontBlack, color: TOITOI_THEME.colors.black, marginBottom: 15 },
  searchBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: TOITOI_THEME.colors.white, padding: 16, borderRadius: TOITOI_THEME.borders.radius.md, borderWidth: TOITOI_THEME.borders.medium, borderColor: TOITOI_THEME.colors.black, ...TOITOI_THEME.shadows.brutal },
  redSquare: { width: 14, height: 14, backgroundColor: TOITOI_THEME.colors.danger, borderWidth: 2, borderColor: TOITOI_THEME.colors.black, marginRight: 15 },
  searchText: { fontSize: 16, color: TOITOI_THEME.colors.gray.medium, fontWeight: TOITOI_THEME.typography.fontBold },
  confirmBtn: { paddingVertical: 15, borderRadius: TOITOI_THEME.borders.radius.md, alignItems: 'center', borderWidth: TOITOI_THEME.borders.thick, borderColor: TOITOI_THEME.colors.black, ...TOITOI_THEME.shadows.brutal }
});