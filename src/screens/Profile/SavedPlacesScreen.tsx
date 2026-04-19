import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, FlatList, TextInput, Keyboard, ActivityIndicator } from 'react-native';
import { ProfileAPI } from '../../services/api';
import { usePassengerAuthStore } from '../../store/usePassengerAuthStore';
import { TOITOI_THEME } from '../../theme';
import { useNavigation } from '@react-navigation/native';

const GOOGLE_API_KEY = 'AIzaSyAwKI25kj8Y0olyH9vrCSfuAr8Ez3Xi4fg';

export default function SavedPlacesScreen() {
  const navigation = useNavigation<any>();
  const { savedPlaces, setSavedPlaces } = usePassengerAuthStore();
  
  const [searchText, setSearchText] = useState('');
  const [predictions, setPredictions] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<any>(null);

  useEffect(() => { fetchSavedPlaces(); }, []);

  const fetchSavedPlaces = async () => {
    try {
      const res = await ProfileAPI.getSavedPlaces();
      if (res.data?.data) setSavedPlaces(res.data.data);
    } catch (e) {}
  };

  const handleSearch = async (text: string) => {
    setSearchText(text);
    if (text.length < 3) { setPredictions([]); return; }

    setIsSearching(true);
    try {
      const response = await fetch(`https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${text}&components=country:in&key=${GOOGLE_API_KEY}`);
      const data = await response.json();
      setPredictions(data.status === 'OK' ? data.predictions : []);
    } catch (error) { } finally { setIsSearching(false); }
  };

  const handleSelectPlace = async (placeId: string, description: string) => {
    Keyboard.dismiss();
    setPredictions([]); 
    setIsSearching(true);

    try {
      const response = await fetch(`https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=geometry,formatted_address&key=${GOOGLE_API_KEY}`);
      const data = await response.json();
      
      if (data.status === 'OK') {
        setSelectedLocation({
          address: data.result.formatted_address || description,
          lat: data.result.geometry.location.lat,
          lng: data.result.geometry.location.lng,
        });
      }
    } catch (error) { Alert.alert("Error", "Failed to get details."); } finally { setIsSearching(false); }
  };

  const saveNewPlace = async (title: string) => {
    if (!selectedLocation) return;
    try {
      const payload = { title, address: selectedLocation.address, latitude: selectedLocation.lat, longitude: selectedLocation.lng };
      await ProfileAPI.addSavedPlace(payload);
      setSelectedLocation(null);
      setSearchText('');
      fetchSavedPlaces(); 
    } catch (e) { Alert.alert("Error", "Could not save place"); }
  };

  const deletePlace = async (id: number) => {
    try { await ProfileAPI.deleteSavedPlace(id); fetchSavedPlaces(); } catch (e) { }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}><Text style={styles.backText}>←</Text></TouchableOpacity>
        <Text style={styles.headerTitle}>FAVOURITES</Text>
      </View>

      <View style={styles.content}>
        {!selectedLocation ? (
          <View style={styles.searchContainer}>
            <TextInput
              style={styles.input} placeholder="Search for a place..."
              placeholderTextColor={TOITOI_THEME.colors.gray.medium} value={searchText} onChangeText={handleSearch}
            />
            {isSearching && <ActivityIndicator style={styles.loader} color={TOITOI_THEME.colors.black} />}
          </View>
        ) : (
          <View style={styles.tagContainer}>
            <TouchableOpacity style={styles.cancelSearchBtn} onPress={() => setSelectedLocation(null)}>
              <Text style={{fontWeight:'bold'}}>✕ Cancel Selection</Text>
            </TouchableOpacity>
            <Text style={styles.tagTitle}>Save as:</Text>
            <Text style={styles.selectedAddress} numberOfLines={2}>{selectedLocation.address}</Text>

            <View style={styles.tagButtons}>
              <TouchableOpacity style={styles.tagBtn} onPress={() => saveNewPlace('Home')}><Text style={styles.tagBtnText}>🏠 Home</Text></TouchableOpacity>
              <TouchableOpacity style={styles.tagBtn} onPress={() => saveNewPlace('Work')}><Text style={styles.tagBtnText}>💼 Work</Text></TouchableOpacity>
              <TouchableOpacity style={styles.tagBtn} onPress={() => saveNewPlace('Other')}><Text style={styles.tagBtnText}>📍 Other</Text></TouchableOpacity>
            </View>
          </View>
        )}

        {predictions.length > 0 && !selectedLocation && (
          <View style={styles.predictionsCard}>
            {predictions.map((item) => (
              <TouchableOpacity key={item.place_id} style={styles.predictionRow} onPress={() => handleSelectPlace(item.place_id, item.description)}>
                <Text style={styles.predictionText}>📍 {item.description}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {!selectedLocation && predictions.length === 0 && (
          <View style={{ flex: 1, marginTop: 20 }}>
            <Text style={styles.listHeader}>SAVED PLACES</Text>
            <FlatList
              data={savedPlaces} keyExtractor={(item) => item.id?.toString() || Math.random().toString()}
              renderItem={({ item }) => (
                <View style={styles.placeCard}>
                  <View style={styles.placeInfo}>
                    <Text style={styles.placeTitle}>{item.title}</Text>
                    <Text style={styles.placeAddress} numberOfLines={2}>{item.address}</Text>
                  </View>
                  <TouchableOpacity style={styles.deleteBtn} onPress={() => deletePlace(item.id)}><Text style={styles.deleteText}>✕</Text></TouchableOpacity>
                </View>
              )}
              ListEmptyComponent={<Text style={{ fontStyle: 'italic', marginTop: 20, color: TOITOI_THEME.colors.gray.dark }}>No saved places yet. Search above to add one.</Text>}
            />
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: TOITOI_THEME.colors.background },
  header: { flexDirection: 'row', alignItems: 'center', padding: 20, paddingTop: 50, borderBottomWidth: TOITOI_THEME.borders.thick, borderColor: TOITOI_THEME.colors.black },
  backBtn: { backgroundColor: TOITOI_THEME.colors.white, width: 40, height: 40, justifyContent: 'center', alignItems: 'center', borderWidth: TOITOI_THEME.borders.thick, borderColor: TOITOI_THEME.colors.black, marginRight: 15, ...TOITOI_THEME.shadows.brutal },
  backText: { fontSize: 20, fontWeight: 'bold', color: TOITOI_THEME.colors.black },
  headerTitle: { fontSize: 30, fontWeight: TOITOI_THEME.typography.fontBlack, color: TOITOI_THEME.colors.black },
  content: { flex: 1, padding: 20 },
  searchContainer: { position: 'relative', marginBottom: 10 },
  input: { height: 60, borderWidth: TOITOI_THEME.borders.thick, borderColor: TOITOI_THEME.colors.black, backgroundColor: TOITOI_THEME.colors.white, color: TOITOI_THEME.colors.black, fontSize: 18, fontWeight: TOITOI_THEME.typography.fontBold, paddingHorizontal: 15, ...TOITOI_THEME.shadows.brutal },
  loader: { position: 'absolute', right: 15, top: 20 },
  predictionsCard: { backgroundColor: TOITOI_THEME.colors.white, borderWidth: TOITOI_THEME.borders.thick, borderColor: TOITOI_THEME.colors.black, ...TOITOI_THEME.shadows.brutal, marginBottom: 20, padding: 10 },
  predictionRow: { paddingVertical: 15, borderBottomWidth: 2, borderBottomColor: TOITOI_THEME.colors.gray.light, borderStyle: 'dashed' },
  predictionText: { fontSize: 16, color: TOITOI_THEME.colors.black, fontWeight: TOITOI_THEME.typography.fontBold },
  tagContainer: { padding: 25, backgroundColor: TOITOI_THEME.colors.primaryLight, borderWidth: TOITOI_THEME.borders.thick, borderColor: TOITOI_THEME.colors.black, ...TOITOI_THEME.shadows.brutal, marginBottom: 20 },
  cancelSearchBtn: { alignSelf: 'flex-end', marginBottom: 10, padding: 5, backgroundColor: TOITOI_THEME.colors.gray.light, borderWidth: 2 },
  tagTitle: { fontSize: 20, fontWeight: TOITOI_THEME.typography.fontBlack, marginBottom: 10, color: TOITOI_THEME.colors.black },
  selectedAddress: { fontSize: 16, color: TOITOI_THEME.colors.gray.text, marginBottom: 25, fontWeight: TOITOI_THEME.typography.fontMedium, lineHeight: 22 },
  tagButtons: { flexDirection: 'row', justifyContent: 'space-between' },
  tagBtn: { backgroundColor: TOITOI_THEME.colors.white, padding: 15, flex: 1, marginHorizontal: 5, borderWidth: TOITOI_THEME.borders.thick, borderColor: TOITOI_THEME.colors.black, alignItems: 'center', ...TOITOI_THEME.shadows.brutal },
  tagBtnText: { fontWeight: TOITOI_THEME.typography.fontBlack, color: TOITOI_THEME.colors.black, fontSize: 14 },
  listHeader: { fontSize: 20, fontWeight: TOITOI_THEME.typography.fontBlack, marginBottom: 15, color: TOITOI_THEME.colors.gray.dark, letterSpacing: 1 },
  placeCard: { flexDirection: 'row', backgroundColor: TOITOI_THEME.colors.white, padding: 20, marginBottom: 15, borderWidth: TOITOI_THEME.borders.thick, borderColor: TOITOI_THEME.colors.black, ...TOITOI_THEME.shadows.brutal, alignItems: 'center' },
  placeInfo: { flex: 1 },
  placeTitle: { fontSize: 20, fontWeight: TOITOI_THEME.typography.fontBlack, color: TOITOI_THEME.colors.black },
  placeAddress: { fontSize: 14, color: TOITOI_THEME.colors.gray.text, marginTop: 5, fontWeight: TOITOI_THEME.typography.fontBold },
  deleteBtn: { backgroundColor: TOITOI_THEME.colors.white, padding: 10, borderWidth: 3, borderColor: TOITOI_THEME.colors.black, ...TOITOI_THEME.shadows.brutal },
  deleteText: { fontWeight: TOITOI_THEME.typography.fontBlack, color: TOITOI_THEME.colors.danger, fontSize: 18 }
});