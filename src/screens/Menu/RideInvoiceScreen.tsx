import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, Modal, Dimensions } from 'react-native';
import MapView, { Polyline, Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { TOITOI_THEME } from '../../theme';
import { useRoute, useNavigation } from '@react-navigation/native';

const { width, height } = Dimensions.get('window');

export default function RideInvoiceScreen() {
  const route = useRoute<any>();
  const navigation = useNavigation();
  const { rideData } = route.params; 
  const [isTollModalVisible, setIsTollModalVisible] = useState(false);

  if (!rideData) return null;

  // 🔴 SAFE PARSING: Prevent crash if polyline is missing or malformed
  let decodedPolyline = [];
  try {
    if (rideData.actual_route_polyline) {
      decodedPolyline = typeof rideData.actual_route_polyline === 'string' 
        ? JSON.parse(rideData.actual_route_polyline) 
        : rideData.actual_route_polyline;
    }
  } catch (e) { console.log("Polyline parse error", e); }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backBtnText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>RECEIPT</Text>
      </View>

      <View style={styles.mapContainer}>
        <MapView
          provider={PROVIDER_GOOGLE} style={styles.map} scrollEnabled={false} zoomEnabled={false}
          initialRegion={{
            latitude: (rideData.pickup_lat + rideData.drop_lat) / 2,
            longitude: (rideData.pickup_lng + rideData.drop_lng) / 2,
            latitudeDelta: Math.max(Math.abs(rideData.pickup_lat - rideData.drop_lat) * 2.5, 0.02),
            longitudeDelta: Math.max(Math.abs(rideData.pickup_lng - rideData.drop_lng) * 2.5, 0.02),
          }}
        >
          <Marker coordinate={{ latitude: rideData.pickup_lat, longitude: rideData.pickup_lng }} pinColor="green" />
          <Marker coordinate={{ latitude: rideData.drop_lat, longitude: rideData.drop_lng }} pinColor="black" />
          {decodedPolyline.length > 0 && <Polyline coordinates={decodedPolyline} strokeColor={TOITOI_THEME.colors.primary} strokeWidth={5} />}
        </MapView>
      </View>

      <View style={styles.invoiceCard}>
        <View style={styles.row}>
          <Text style={styles.label}>Base Fare</Text>
          <Text style={styles.value}>₹{rideData.base_fare || 0}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Distance Fare</Text>
          <Text style={styles.value}>₹{rideData.distance_fare || 0}</Text>
        </View>
        <View style={[styles.row, styles.dashedRow]}>
          <Text style={styles.label}>Taxes</Text>
          <Text style={styles.value}>₹{rideData.tax_amount || 0}</Text>
        </View>

        <View style={styles.totalContainer}>
          <Text style={styles.totalLabel}>TOTAL</Text>
          <Text style={styles.totalValue}>₹{rideData.fare_amount}</Text>
        </View>
        <Text style={styles.paymentStatus}>Paid via {rideData.payment_method?.toUpperCase()}</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: TOITOI_THEME.colors.background },
  content: { padding: 20, paddingTop: 50, paddingBottom: 60 },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 30 },
  headerTitle: { fontSize: 32, fontWeight: TOITOI_THEME.typography.fontBlack, color: TOITOI_THEME.colors.black, marginLeft: 15 },
  backBtn: { backgroundColor: TOITOI_THEME.colors.white, width: 45, height: 45, borderWidth: 3, borderColor: TOITOI_THEME.colors.black, alignItems: 'center', justifyContent: 'center', ...TOITOI_THEME.shadows.brutal },
  backBtnText: { fontSize: 24, fontWeight: 'bold' },
  mapContainer: { height: 220, borderWidth: 4, borderColor: TOITOI_THEME.colors.black, ...TOITOI_THEME.shadows.brutal, marginBottom: 30, backgroundColor: TOITOI_THEME.colors.gray.light },
  map: { flex: 1 },
  invoiceCard: { backgroundColor: TOITOI_THEME.colors.white, borderWidth: 4, borderColor: TOITOI_THEME.colors.black, padding: 25, ...TOITOI_THEME.shadows.brutal, marginBottom: 30 },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 15 },
  label: { fontSize: 16, fontWeight: TOITOI_THEME.typography.fontBold, color: TOITOI_THEME.colors.gray.text },
  value: { fontSize: 18, fontWeight: TOITOI_THEME.typography.fontBlack, color: TOITOI_THEME.colors.black },
  dashedRow: { borderBottomWidth: 2, borderStyle: 'dashed', borderColor: TOITOI_THEME.colors.gray.light, paddingBottom: 15 },
  totalContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 15, backgroundColor: TOITOI_THEME.colors.black, padding: 20 },
  totalLabel: { color: TOITOI_THEME.colors.white, fontSize: 20, fontWeight: TOITOI_THEME.typography.fontBlack },
  totalValue: { color: TOITOI_THEME.colors.primary, fontSize: 32, fontWeight: TOITOI_THEME.typography.fontBlack },
  paymentStatus: { textAlign: 'center', marginTop: 20, fontSize: 14, fontWeight: TOITOI_THEME.typography.fontBold, color: TOITOI_THEME.colors.gray.dark },
});