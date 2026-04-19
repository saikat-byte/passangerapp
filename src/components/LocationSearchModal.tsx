import React, { useState, useEffect } from 'react';
import { View, Modal, TouchableOpacity, Text, StyleSheet, TextInput, FlatList, KeyboardAvoidingView, Platform, Keyboard, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useBookingStore, LocationPoint } from '../store/useBookingStore';
import { TOITOI_THEME } from '../theme';

const GOOGLE_API_KEY = "AIzaSyAwKI25kj8Y0olyH9vrCSfuAr8Ez3Xi4fg";

const SAVED_PLACES = [
  { id: '1', title: 'Home', address: 'Netaji Pally, Guskara', lat: 23.4985, lng: 87.7470, icon: '🏠' },
  { id: '2', title: 'Work', address: 'Guskara College Road', lat: 23.5020, lng: 87.7510, icon: '💼' }
];

const POPULAR_PLACES = [
  { id: 'p1', title: 'Guskara Railway Station', address: 'Station Road, Guskara', lat: 23.4950, lng: 87.7460, icon: '🚆' },
  { id: 'p2', title: 'Guskara Bus Stand', address: 'Bus Stand Area, Guskara', lat: 23.4990, lng: 87.7490, icon: '🚌' }
];

export default function LocationSearchModal({ visible, onClose }: any) {
  const insets = useSafeAreaInsets();
  const { 
    pickup, dropoff, stops, setPickup, setDropoff, addStop, removeStop, 
    setSelectingDropoffOnMap, serviceType, rentalHours, setRentalHours 
  } = useBookingStore();
  
  const [activeInput, setActiveInput] = useState<string>('dropoff');
  const [pickupText, setPickupText] = useState('');
  const [dropoffText, setDropoffText] = useState('');
  const [stopTexts, setStopTexts] = useState<string[]>([]);
  const [predictions, setPredictions] = useState<any[]>([]);

  useEffect(() => {
    if (visible) {
      setPickupText(pickup?.address || '');
      setDropoffText(dropoff?.address || '');
      setStopTexts(stops.map(s => s.address));
      setActiveInput(serviceType === 'rental' ? 'pickup' : 'dropoff');
      setPredictions([]);
    }
  }, [visible, pickup, dropoff, stops, serviceType]);

  const handleSearch = async (text: string, type: string) => {
    if (type === 'pickup') setPickupText(text);
    else if (type === 'dropoff') setDropoffText(text);
    else if (type.startsWith('stop_')) {
      const index = parseInt(type.split('_')[1]);
      const newStops = [...stopTexts];
      newStops[index] = text;
      setStopTexts(newStops);
    }

    if (text.length < 3) return setPredictions([]);

    try {
      const res = await fetch(`https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${text}&components=country:in&key=${GOOGLE_API_KEY}`);
      const data = await res.json();
      if (data.status === 'OK') setPredictions(data.predictions);
    } catch (e) { console.log(e); }
  };

  const onSelect = async (place: any, isPredefined = false) => {
    Keyboard.dismiss();
    let coords: LocationPoint;

    if (isPredefined) {
      coords = { latitude: place.lat, longitude: place.lng, address: place.title };
    } else {
      const res = await fetch(`https://maps.googleapis.com/maps/api/place/details/json?place_id=${place.place_id}&fields=geometry&key=${GOOGLE_API_KEY}`);
      const data = await res.json();
      coords = { latitude: data.result.geometry.location.lat, longitude: data.result.geometry.location.lng, address: place.description };
    }
    
    if (activeInput === 'pickup') { 
      setPickup(coords); setPickupText(coords.address);
      if (serviceType === 'rental') onClose(); else setActiveInput('dropoff');
    } else if (activeInput === 'dropoff') { 
      setDropoff(coords); setDropoffText(coords.address);
      if (stops.length === stopTexts.length) onClose(); 
    } else if (activeInput.startsWith('stop_')) {
      const index = parseInt(activeInput.split('_')[1]);
      addStop(coords); 
      const newStops = [...stopTexts];
      newStops[index] = coords.address;
      setStopTexts(newStops);
      setActiveInput('dropoff');
    }
    setPredictions([]);
  };

  const handleUseCurrentLocation = () => {
    Keyboard.dismiss();
    if (!pickup) return;

    if (activeInput === 'pickup') {
      setPickupText(pickup.address);
      if (serviceType === 'rental') onClose(); else setActiveInput('dropoff');
    } else if (activeInput === 'dropoff') {
      setDropoff(pickup); onClose();
    } else if (activeInput.startsWith('stop_')) {
      const index = parseInt(activeInput.split('_')[1]);
      addStop(pickup);
      const newStops = [...stopTexts];
      newStops[index] = pickup.address;
      setStopTexts(newStops);
      setActiveInput('dropoff');
    }
  };

  const handleSelectOnMap = () => {
    Keyboard.dismiss();
    if (serviceType === 'rental') {
      onClose();
    } else {
      setSelectingDropoffOnMap(true);
      onClose();
    }
  };

  const handleAddStopField = () => {
    if (stopTexts.length >= 2) return; 
    setStopTexts([...stopTexts, '']);
    setActiveInput(`stop_${stopTexts.length}`);
  };

  const handleRemoveStopField = (index: number) => {
    removeStop(index);
    setStopTexts(stopTexts.filter((_, i) => i !== index));
  };

  // 🔴 Restored UI: Quick Actions, Favourites, and Popular Places
  const renderEmptyState = () => (
    <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ padding: 20 }}>
      <View style={styles.quickActions}>
        <TouchableOpacity style={styles.actionBtn} onPress={handleUseCurrentLocation}>
          <Text style={styles.actionIcon}>📍</Text>
          <Text style={styles.actionText}>Current Location</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionBtn} onPress={handleSelectOnMap}>
          <Text style={styles.actionIcon}>🗺️</Text>
          <Text style={styles.actionText}>Choose on Map</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.sectionTitle}>FAVOURITES</Text>
      {SAVED_PLACES.map(place => (
        <TouchableOpacity key={place.id} style={styles.row} onPress={() => onSelect(place, true)}>
          <View style={styles.iconBox}><Text>{place.icon}</Text></View>
          <View style={{ flex: 1, marginLeft: 10 }}>
            <Text style={styles.rowText}>{place.title}</Text>
            <Text style={styles.rowSubText}>{place.address}</Text>
          </View>
        </TouchableOpacity>
      ))}

      <Text style={[styles.sectionTitle, { marginTop: 15 }]}>POPULAR IN GUSKARA</Text>
      {POPULAR_PLACES.map(place => (
        <TouchableOpacity key={place.id} style={styles.row} onPress={() => onSelect(place, true)}>
          <View style={styles.iconBox}><Text>{place.icon}</Text></View>
          <View style={{ flex: 1, marginLeft: 10 }}>
            <Text style={styles.rowText}>{place.title}</Text>
            <Text style={styles.rowSubText}>{place.address}</Text>
          </View>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
        <View style={[styles.searchCard, { paddingTop: Math.max(insets.top, 20) }]}>
          <TouchableOpacity onPress={onClose} style={styles.backBtn}><Text style={styles.backText}>← Back</Text></TouchableOpacity>
          
          <View style={styles.inputWrapper}>
            <View style={{ flex: 1 }}>
              <TextInput
                style={[styles.input, activeInput === 'pickup' && styles.activeInput]}
                placeholder="Pickup Location" value={pickupText}
                onFocus={() => { setActiveInput('pickup'); setPredictions([]); }} 
                onChangeText={(text) => handleSearch(text, 'pickup')}
              />
              
              {serviceType !== 'rental' && stopTexts.map((text, index) => (
                <View key={`stop_${index}`} style={{ flexDirection: 'row', alignItems: 'center', marginTop: 10 }}>
                  <TextInput
                    style={[styles.input, { flex: 1 }, activeInput === `stop_${index}` && styles.activeInput]}
                    placeholder={`Stop ${index + 1}`} value={text}
                    onFocus={() => { setActiveInput(`stop_${index}`); setPredictions([]); }} 
                    onChangeText={(t) => handleSearch(t, `stop_${index}`)}
                  />
                  <TouchableOpacity onPress={() => handleRemoveStopField(index)} style={styles.removeStopBtn}>
                    <Text style={{color: TOITOI_THEME.colors.white, fontWeight: 'bold'}}>✕</Text>
                  </TouchableOpacity>
                </View>
              ))}

              {serviceType !== 'rental' && (
                <TextInput
                  style={[styles.input, activeInput === 'dropoff' && styles.activeInput, { marginTop: 10 }]}
                  placeholder="Where to?" value={dropoffText}
                  onFocus={() => { setActiveInput('dropoff'); setPredictions([]); }} 
                  onChangeText={(text) => handleSearch(text, 'dropoff')} 
                  autoFocus={serviceType !== 'rental'}
                />
              )}

              {serviceType !== 'rental' && stopTexts.length < 2 && (
                <TouchableOpacity onPress={handleAddStopField} style={styles.addStopBtn}>
                  <Text style={styles.addStopText}>+ Add Stop</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>

          {serviceType === 'rental' && (
            <View style={styles.rentalOptionsContainer}>
              <Text style={styles.rentalTitle}>Select Package:</Text>
              <View style={styles.rentalHoursWrapper}>
                {[2, 4, 8].map(hours => (
                  <TouchableOpacity key={hours} onPress={() => setRentalHours(hours)} style={[styles.rentalHourBtn, rentalHours === hours && styles.rentalHourBtnActive]}>
                    <Text style={[styles.rentalHourText, rentalHours === hours && {color: TOITOI_THEME.colors.white}]}>{hours} Hours</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}
        </View>

        <View style={styles.listContainer}>
          {predictions.length > 0 ? (
            <FlatList
              data={predictions} keyboardShouldPersistTaps="handled" contentContainerStyle={{ padding: 20 }}
              keyExtractor={(item) => item.place_id}
              renderItem={({ item }) => (
                <TouchableOpacity style={styles.row} onPress={() => onSelect(item)}>
                  <View style={styles.iconBox}><Text>📍</Text></View>
                  <View style={{ flex: 1, marginLeft: 10 }}>
                    <Text style={styles.rowText} numberOfLines={1}>{item.structured_formatting?.main_text || item.description}</Text>
                    <Text style={styles.rowSubText} numberOfLines={1}>{item.structured_formatting?.secondary_text}</Text>
                  </View>
                </TouchableOpacity>
              )}
            />
          ) : renderEmptyState()}
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: TOITOI_THEME.colors.primaryLight },
  searchCard: { backgroundColor: TOITOI_THEME.colors.primary, paddingHorizontal: 20, paddingBottom: 25, borderBottomWidth: TOITOI_THEME.borders.thick, borderColor: TOITOI_THEME.colors.black, ...TOITOI_THEME.shadows.brutal, zIndex: 10 },
  backBtn: { marginBottom: 15, paddingVertical: 5 },
  backText: { fontSize: 18, fontWeight: TOITOI_THEME.typography.fontBlack, color: TOITOI_THEME.colors.black },
  inputWrapper: { flexDirection: 'row', alignItems: 'center' },
  input: { height: 50, backgroundColor: TOITOI_THEME.colors.white, paddingHorizontal: 15, borderWidth: TOITOI_THEME.borders.medium, borderColor: TOITOI_THEME.colors.black, borderRadius: TOITOI_THEME.borders.radius.sm, fontSize: 16, color: TOITOI_THEME.colors.black },
  activeInput: { borderColor: TOITOI_THEME.colors.black, borderWidth: TOITOI_THEME.borders.thick, ...TOITOI_THEME.shadows.brutal },
  addStopBtn: { alignSelf: 'flex-start', marginTop: 10, paddingVertical: 5, paddingHorizontal: 10, backgroundColor: TOITOI_THEME.colors.white, borderWidth: 2, borderColor: TOITOI_THEME.colors.black, borderRadius: TOITOI_THEME.borders.radius.sm, ...TOITOI_THEME.shadows.brutal },
  addStopText: { fontWeight: TOITOI_THEME.typography.fontBold, fontSize: 13 },
  removeStopBtn: { marginLeft: 10, width: 40, height: 40, backgroundColor: TOITOI_THEME.colors.danger, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: TOITOI_THEME.colors.black, borderRadius: TOITOI_THEME.borders.radius.sm, ...TOITOI_THEME.shadows.brutal },
  listContainer: { flex: 1, backgroundColor: TOITOI_THEME.colors.background },
  rentalOptionsContainer: { marginTop: 20, backgroundColor: TOITOI_THEME.colors.white, padding: 15, borderRadius: TOITOI_THEME.borders.radius.sm, borderWidth: TOITOI_THEME.borders.thick, borderColor: TOITOI_THEME.colors.black, ...TOITOI_THEME.shadows.brutal },
  rentalTitle: { fontSize: 16, fontWeight: TOITOI_THEME.typography.fontBlack, marginBottom: 10 },
  rentalHoursWrapper: { flexDirection: 'row', gap: 10 },
  rentalHourBtn: { flex: 1, paddingVertical: 10, borderWidth: 2, borderColor: TOITOI_THEME.colors.black, alignItems: 'center', borderRadius: TOITOI_THEME.borders.radius.sm },
  rentalHourBtnActive: { backgroundColor: TOITOI_THEME.colors.black, transform: [{ translateX: 2 }, { translateY: 2 }] },
  rentalHourText: { fontSize: 14, fontWeight: TOITOI_THEME.typography.fontBold, color: TOITOI_THEME.colors.black },
  
  // 🔴 Restored Styles
  quickActions: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  actionBtn: { 
    flex: 1, backgroundColor: TOITOI_THEME.colors.white, padding: 12, borderRadius: TOITOI_THEME.borders.radius.md,
    borderWidth: TOITOI_THEME.borders.medium, borderColor: TOITOI_THEME.colors.black, ...TOITOI_THEME.shadows.brutal,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginHorizontal: 5
  },
  actionIcon: { fontSize: 16, marginRight: 5 },
  actionText: { fontSize: 12, fontWeight: TOITOI_THEME.typography.fontBold, color: TOITOI_THEME.colors.black },
  sectionTitle: { fontSize: 12, fontWeight: TOITOI_THEME.typography.fontBlack, color: TOITOI_THEME.colors.gray.medium, marginBottom: 10, letterSpacing: 1 },
  row: { flexDirection: 'row', alignItems: 'center', backgroundColor: TOITOI_THEME.colors.white, padding: 15, marginBottom: 10, borderRadius: TOITOI_THEME.borders.radius.md, borderWidth: TOITOI_THEME.borders.medium, borderColor: TOITOI_THEME.colors.black, ...TOITOI_THEME.shadows.brutal },
  iconBox: { width: 40, height: 40, backgroundColor: TOITOI_THEME.colors.primaryLight, borderRadius: 20, alignItems: 'center', justifyContent: 'center', borderWidth: 1 },
  rowText: { fontSize: 16, fontWeight: TOITOI_THEME.typography.fontBold, color: TOITOI_THEME.colors.black },
  rowSubText: { fontSize: 12, color: TOITOI_THEME.colors.gray.text, marginTop: 2 }
});