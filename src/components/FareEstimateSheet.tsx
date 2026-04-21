import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, FlatList, ScrollView, Image, TextInput, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useNavigation } from '@react-navigation/native';
import { usePassengerRideStore } from '../store/usePassengerRideStore';
import { useBookingStore } from '../store/useBookingStore';
import { usePassengerAuthStore } from '../store/usePassengerAuthStore';
import { TOITOI_THEME } from '../theme';

import { BookingAPI } from '../services/api';

export default function FareEstimateSheet({ onCancel }: { onCancel: () => void }) {
  const insets = useSafeAreaInsets();
  
  const { user } = usePassengerAuthStore();
  const isFemale = user?.gender?.toLowerCase() === 'female';

  const { 
    vehicleCategories, batchFares, selectedCategory, setSelectedCategory, 
    distanceKm, isShared, toggleShared, isWomenSpecial, toggleWomenSpecial,
    bookedSeats, setBookedSeats, scheduledAt, setScheduledAt, pickup, dropoff,
    serviceType
  } = useBookingStore();
  
  const [isRequesting, setIsRequesting] = useState(false);
  const [promoCode, setPromoCode] = useState('');
  
  const [showPicker, setShowPicker] = useState(false);
  const [pickerMode, setPickerMode] = useState<'date' | 'time'>('date');

  const safeCategories = vehicleCategories.length > 0 ? vehicleCategories : [
    { id: 1, name: 'Toto/Auto', icon_url: null },
    { id: 2, name: 'Mini Car', icon_url: null },
  ];

  const selectedVehicleInfo = safeCategories.find(c => c.id === selectedCategory);
  const selectedFareData = batchFares[selectedCategory];

  const getMaxSeats = () => {
    if (selectedVehicleInfo?.max_seats) return selectedVehicleInfo.max_seats;
    const name = selectedVehicleInfo?.name?.toLowerCase() || '';
    if (name.includes('bike') || name.includes('moto')) return 1; 
    if (name.includes('toto') || name.includes('auto')) return 5;
    if (name.includes('sedan') || name.includes('mini') || name.includes('car')) return 4;
    return 4; 
  };

  const maxSeats = getMaxSeats();

  useEffect(() => {
    if (bookedSeats > maxSeats) {
      setBookedSeats(maxSeats);
    }
  }, [selectedCategory, maxSeats]);

  const navigation = useNavigation<any>();
  const { setCurrentRide } = usePassengerRideStore();

  const handleConfirmRide = async () => {
    setIsRequesting(true);
    
    try {
      if (!pickup) {
        Alert.alert('Error', 'Pickup location is missing.');
        setIsRequesting(false);
        return;
      }


      const payload = {
        pickup_lat: pickup.latitude,
        pickup_lng: pickup.longitude,
        pickup_address: pickup.address || 'Selected Pickup',
        drop_lat: dropoff?.latitude || pickup.latitude,
        drop_lng: dropoff?.longitude || pickup.longitude,
        drop_address: dropoff?.address || 'Selected Dropoff',
        vehicle_category_id: selectedCategory,
        fare_amount: calculateFinalFare(selectedFareData) ?? 0,
        is_shared: isShared,
        booked_seats: isShared ? bookedSeats : 1,
        is_women_special: isWomenSpecial,
        scheduled_at: scheduledAt ? scheduledAt.toISOString() : null,
        payment_method: 'cash', 
        ride_type: isShared ? 'shared' : 'full', 
        trip_distance: distanceKm || 0,
      };

      const response = await BookingAPI.requestRide(payload);
      
      const newRide = response.data?.data || response.data;

      setCurrentRide(newRide);
      onCancel(); 
      navigation.navigate('RideMatchingScreen'); 

    } catch (error: any) {
      // 🔴 CTO FIX: Capture exact Laravel Backend Error
      const backendError = error.response?.data;
      const errorMessage = backendError?.message || error.message || 'Unknown error occurred';
      
      console.log('--- BACKEND ERROR DETAILS ---');
      console.log(backendError || error);
      console.log('-----------------------------');

      Alert.alert(
        'Booking Failed ❌', 
        `Backend says: ${errorMessage}\n\nCheck terminal for full payload issue.`
      );
    } finally {
      setIsRequesting(false);
    }
  };


  const handlePickerChange = (event: any, selectedDate?: Date) => {
    setShowPicker(Platform.OS === 'ios');
    if (event.type === 'dismissed' || !selectedDate) {
      setShowPicker(false);
      return;
    }
    
    if (pickerMode === 'date') {
      setScheduledAt(selectedDate);
      setPickerMode('time'); 
      if (Platform.OS === 'android') setShowPicker(true);
    } else {
      setScheduledAt(selectedDate);
      setShowPicker(false);
      setPickerMode('date'); 
    }
  };

  const openScheduler = () => {
    setPickerMode('date');
    setShowPicker(true);
  };

  const calculateFinalFare = (fareData: any) => {
    if (!fareData) return null;
    const base = parseFloat(fareData.total_fare || fareData.totalFare || 0);
    const final = isShared ? base * bookedSeats : base;
    return Math.round(final); 
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={[styles.container, { paddingBottom: Math.max(insets.bottom, 20) }]}>
      <View style={styles.dragHandle} />
      
      <View style={styles.header}>
        <Text style={styles.title}>Select a Ride</Text>
        <TouchableOpacity onPress={onCancel} style={styles.closeBtn}><Text style={styles.closeText}>✕</Text></TouchableOpacity>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipContainer}>
        <TouchableOpacity style={[styles.chip, scheduledAt && styles.chipActive]} onPress={openScheduler}>
          <Text style={[styles.chipText, scheduledAt && styles.chipTextActive]}>
            {scheduledAt ? `📅 ${scheduledAt.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}` : '📅 Schedule'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.chip, isShared && styles.chipActive]} onPress={toggleShared}>
          <Text style={[styles.chipText, isShared && styles.chipTextActive]}>🤝 Shared</Text>
        </TouchableOpacity>

        {isFemale && (
          <TouchableOpacity style={[styles.chip, isWomenSpecial && styles.chipActive]} onPress={toggleWomenSpecial}>
            <Text style={[styles.chipText, isWomenSpecial && styles.chipTextActive]}>👩 Women Only</Text>
          </TouchableOpacity>
        )}
      </ScrollView>

      {isShared && (
        <View style={styles.seatCounterContainer}>
          <Text style={styles.seatCounterLabel}>How many seats?</Text>
          <View style={styles.counterBox}>
            <TouchableOpacity 
              style={[styles.counterBtn, bookedSeats <= 1 && { opacity: 0.5 }]} 
              onPress={() => bookedSeats > 1 && setBookedSeats(bookedSeats - 1)}
              disabled={bookedSeats <= 1}
            >
              <Text style={styles.counterBtnText}>-</Text>
            </TouchableOpacity>
            
            <Text style={styles.counterNumber}>{bookedSeats}</Text>
            
            <TouchableOpacity 
              style={[styles.counterBtn, bookedSeats >= maxSeats && { opacity: 0.5 }]} 
              onPress={() => bookedSeats < maxSeats && setBookedSeats(bookedSeats + 1)} 
              disabled={bookedSeats >= maxSeats}
            >
              <Text style={styles.counterBtnText}>+</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {scheduledAt && (
         <TouchableOpacity onPress={() => setScheduledAt(null)} style={{ alignSelf: 'flex-start', marginBottom: 10 }}>
            <Text style={{ color: TOITOI_THEME.colors.danger, fontWeight: 'bold' }}>Cancel Schedule</Text>
         </TouchableOpacity>
      )}

      <View style={{ maxHeight: 200 }}>
        <FlatList
          data={safeCategories}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item: vehicle }) => {
            const isSelected = selectedCategory === vehicle.id;
            const fareData = batchFares[vehicle.id];
            const isLoadingSingleFare = !fareData && distanceKm > 0; 
            
            const finalFare = calculateFinalFare(fareData);
            const etaMin = distanceKm ? Math.ceil((distanceKm / 20) * 60) : 5;

            let iconChar = '🚕';
            if (vehicle.name?.toLowerCase().includes('bike')) iconChar = '🏍️';
            else if (vehicle.name?.toLowerCase().includes('toto')) iconChar = '🛺';

            return (
              <TouchableOpacity style={[styles.vehicleRow, isSelected && styles.vehicleRowActive]} activeOpacity={0.9} onPress={() => setSelectedCategory(vehicle.id)}>
                <View style={styles.vehicleIcon}>
                  {vehicle.icon_url ? ( <Image source={{ uri: vehicle.icon_url }} style={{ width: 40, height: 40 }} resizeMode="contain" /> ) : ( <Text style={{fontSize: 30}}>{iconChar}</Text> )}
                </View>
                <View style={styles.details}>
                  <Text style={styles.vName}>{vehicle.name}</Text>
                  <Text style={styles.vTime}>{etaMin} min away • {distanceKm.toFixed(1)} km</Text>
                </View>
                <View style={styles.priceCol}>
                  {isLoadingSingleFare ? ( <ActivityIndicator size="small" color={TOITOI_THEME.colors.black} /> ) : ( <Text style={[styles.priceText, isSelected && { color: TOITOI_THEME.colors.black }]}>{finalFare ? `₹${finalFare}` : '...'}</Text> )}
                </View>
              </TouchableOpacity>
            );
          }}
        />
      </View>

      {selectedFareData && (
        <View style={styles.breakdownContainer}>
          <View style={styles.promoRow}>
            <TextInput style={styles.promoInput} placeholder="Have a promo code?" value={promoCode} onChangeText={setPromoCode} autoCapitalize="characters" />
            <TouchableOpacity style={styles.applyBtn}><Text style={styles.applyBtnText}>APPLY</Text></TouchableOpacity>
          </View>
          <View style={styles.fareDetails}>
             <View style={styles.fareRow}>
                <Text style={styles.fareLabel}>{isShared ? `Base Fare (x${bookedSeats} Seats)` : 'Base Fare'}</Text>
                <Text style={styles.fareValue}>
                  ₹{Math.round(parseFloat(selectedFareData.base_fare || selectedFareData.total_fare || 0) * (isShared ? bookedSeats : 1))}
                </Text>
             </View>
             {selectedFareData.surge_charge > 0 && (<View style={styles.fareRow}><Text style={styles.fareLabel}>Surge Charge</Text><Text style={styles.fareValue}>+ ₹{Math.round(selectedFareData.surge_charge)}</Text></View>)}
             {selectedFareData.cancellation_due > 0 && (<View style={styles.fareRow}><Text style={[styles.fareLabel, { color: TOITOI_THEME.colors.danger }]}>Previous Due</Text><Text style={[styles.fareValue, { color: TOITOI_THEME.colors.danger }]}>+ ₹{Math.round(selectedFareData.cancellation_due)}</Text></View>)}
          </View>
        </View>
      )}

      <TouchableOpacity style={styles.confirmBtn} activeOpacity={0.8} onPress={handleConfirmRide} disabled={isRequesting}>
        {isRequesting ? <ActivityIndicator color={TOITOI_THEME.colors.white} /> : <Text style={styles.confirmText}>{scheduledAt ? 'Confirm Schedule' : 'Book TOITOI'}</Text>}
      </TouchableOpacity>

      {showPicker && (
        <DateTimePicker
          value={scheduledAt || new Date()}
          mode={pickerMode}
          is24Hour={false}
          display="default"
          minimumDate={new Date()} 
          onChange={handlePickerChange}
        />
      )}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { backgroundColor: TOITOI_THEME.colors.white, paddingHorizontal: 20, paddingTop: 10, borderTopWidth: TOITOI_THEME.borders.thick, borderColor: TOITOI_THEME.colors.black, borderTopLeftRadius: TOITOI_THEME.borders.radius.xl, borderTopRightRadius: TOITOI_THEME.borders.radius.xl, position: 'absolute', bottom: 0, width: '100%', elevation: 20 },
  dragHandle: { width: 40, height: 5, backgroundColor: TOITOI_THEME.colors.black, alignSelf: 'center', borderRadius: 3, marginBottom: 15 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  title: { fontSize: 24, fontWeight: TOITOI_THEME.typography.fontBlack, color: TOITOI_THEME.colors.black },
  closeBtn: { width: 32, height: 32, backgroundColor: TOITOI_THEME.colors.gray.light, borderRadius: 16, alignItems: 'center', justifyContent: 'center', borderWidth: 2 },
  closeText: { fontSize: 16, fontWeight: 'bold' },
  chipContainer: { flexDirection: 'row', marginBottom: 15, maxHeight: 40 },
  chip: { paddingHorizontal: 15, paddingVertical: 8, marginRight: 10, borderRadius: 20, backgroundColor: TOITOI_THEME.colors.white, borderWidth: TOITOI_THEME.borders.medium, borderColor: TOITOI_THEME.colors.black, justifyContent: 'center' },
  chipActive: { backgroundColor: TOITOI_THEME.colors.black },
  chipText: { fontSize: 13, fontWeight: TOITOI_THEME.typography.fontBold, color: TOITOI_THEME.colors.black },
  chipTextActive: { color: TOITOI_THEME.colors.primary },
  
  seatCounterContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: TOITOI_THEME.colors.primaryLight, padding: 10, borderRadius: TOITOI_THEME.borders.radius.sm, borderWidth: 2, borderColor: TOITOI_THEME.colors.black, marginBottom: 15, ...TOITOI_THEME.shadows.brutal },
  seatCounterLabel: { fontSize: 16, fontWeight: TOITOI_THEME.typography.fontBlack },
  counterBox: { flexDirection: 'row', alignItems: 'center' },
  counterBtn: { width: 35, height: 35, backgroundColor: TOITOI_THEME.colors.white, borderWidth: 2, borderColor: TOITOI_THEME.colors.black, alignItems: 'center', justifyContent: 'center', borderRadius: TOITOI_THEME.borders.radius.sm },
  counterBtnText: { fontSize: 20, fontWeight: 'bold', color: TOITOI_THEME.colors.black },
  counterNumber: { fontSize: 18, fontWeight: TOITOI_THEME.typography.fontBlack, marginHorizontal: 15 },

  vehicleRow: { flexDirection: 'row', alignItems: 'center', padding: 15, marginBottom: 10, backgroundColor: TOITOI_THEME.colors.white, borderRadius: TOITOI_THEME.borders.radius.md, borderWidth: TOITOI_THEME.borders.medium, borderColor: TOITOI_THEME.colors.gray.light },
  vehicleRowActive: { backgroundColor: TOITOI_THEME.colors.primaryLight, borderColor: TOITOI_THEME.colors.black, borderWidth: TOITOI_THEME.borders.thick, ...TOITOI_THEME.shadows.brutal },
  vehicleIcon: { width: 50, alignItems: 'center' },
  details: { flex: 1, paddingLeft: 10 },
  vName: { fontSize: 18, fontWeight: TOITOI_THEME.typography.fontBlack, color: TOITOI_THEME.colors.black },
  vTime: { fontSize: 13, color: TOITOI_THEME.colors.gray.text, fontWeight: TOITOI_THEME.typography.fontMedium, marginTop: 2 },
  priceCol: { alignItems: 'flex-end' },
  priceText: { fontSize: 20, fontWeight: TOITOI_THEME.typography.fontBlack, color: TOITOI_THEME.colors.gray.medium },
  breakdownContainer: { marginTop: 10, padding: 15, backgroundColor: TOITOI_THEME.colors.primaryLight, borderRadius: TOITOI_THEME.borders.radius.sm, borderWidth: 2, borderColor: TOITOI_THEME.colors.black, ...TOITOI_THEME.shadows.brutal },
  promoRow: { flexDirection: 'row', marginBottom: 15 },
  promoInput: { flex: 1, backgroundColor: TOITOI_THEME.colors.white, borderWidth: 2, borderColor: TOITOI_THEME.colors.black, paddingHorizontal: 10, height: 45, borderRadius: TOITOI_THEME.borders.radius.sm, fontWeight: 'bold' },
  applyBtn: { backgroundColor: TOITOI_THEME.colors.black, justifyContent: 'center', paddingHorizontal: 15, marginLeft: 10, borderRadius: TOITOI_THEME.borders.radius.sm, borderWidth: 2, borderColor: TOITOI_THEME.colors.black },
  applyBtnText: { color: TOITOI_THEME.colors.white, fontWeight: TOITOI_THEME.typography.fontBlack },
  fareDetails: { borderTopWidth: 1, borderTopColor: TOITOI_THEME.colors.gray.light, paddingTop: 10 },
  fareRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5 },
  fareLabel: { fontSize: 14, color: TOITOI_THEME.colors.gray.dark, fontWeight: TOITOI_THEME.typography.fontMedium },
  fareValue: { fontSize: 14, color: TOITOI_THEME.colors.black, fontWeight: TOITOI_THEME.typography.fontBold },
  confirmBtn: { backgroundColor: TOITOI_THEME.colors.black, paddingVertical: 18, borderRadius: TOITOI_THEME.borders.radius.md, alignItems: 'center', marginTop: 15, borderWidth: TOITOI_THEME.borders.thick, borderColor: TOITOI_THEME.colors.black, ...TOITOI_THEME.shadows.brutal },
  confirmText: { fontSize: 20, fontWeight: TOITOI_THEME.typography.fontBlack, color: TOITOI_THEME.colors.primary }
});