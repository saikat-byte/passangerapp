import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, ActivityIndicator, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import * as Clipboard from 'expo-clipboard'; // Requires: npx expo install expo-clipboard
import { PassengerAPI } from '../../services/api';
import { TOITOI_THEME } from '../../theme';

export default function PromoScreen() {
  const navigation = useNavigation();
  const [promos, setPromos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchPromos(); }, []);

  const fetchPromos = async () => {
    try {
      setPromos([
        { id: 1, code: 'TOITOI50', description: 'Flat ₹50 off on your first ride!', min_ride_amount: 100 },
        { id: 2, code: 'GUSKARA20', description: '20% off on rides within Guskara.', min_ride_amount: 50 },
      ]);
    } catch (error) { } finally { setLoading(false); }
  };

  const copyToClipboard = async (code: string) => {
    await Clipboard.setStringAsync(code);
    Alert.alert('Copied!', `Promo code ${code} copied to clipboard.`);
  };

  const renderPromo = ({ item }: { item: any }) => (
    <View style={styles.promoCard}>
      <View style={styles.promoHeader}>
        <View style={styles.codeBox}><Text style={styles.codeText}>{item.code}</Text></View>
        <TouchableOpacity style={styles.copyBtn} onPress={() => copyToClipboard(item.code)}>
          <Text style={styles.copyText}>COPY</Text>
        </TouchableOpacity>
      </View>
      <Text style={styles.descText}>{item.description}</Text>
      <Text style={styles.minAmount}>Min. Ride Value: ₹{item.min_ride_amount}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backBtnText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>OFFERS</Text>
      </View>

      {loading ? <ActivityIndicator size="large" color="#000" /> : (
        <FlatList
          data={promos} keyExtractor={(item) => item.id.toString()}
          renderItem={renderPromo}
          ListEmptyComponent={<Text style={styles.emptyText}>No active offers right now.</Text>}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: TOITOI_THEME.colors.background, padding: 20, paddingTop: 50 },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 30 },
  title: { fontSize: 32, fontWeight: TOITOI_THEME.typography.fontBlack, color: TOITOI_THEME.colors.black, marginLeft: 15 },
  backBtn: { backgroundColor: TOITOI_THEME.colors.white, width: 45, height: 45, borderWidth: 3, borderColor: TOITOI_THEME.colors.black, alignItems: 'center', justifyContent: 'center', ...TOITOI_THEME.shadows.brutal },
  backBtnText: { fontSize: 24, fontWeight: 'bold' },
  promoCard: { backgroundColor: TOITOI_THEME.colors.white, borderWidth: 4, borderColor: TOITOI_THEME.colors.black, padding: 20, marginBottom: 20, ...TOITOI_THEME.shadows.brutal },
  promoHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  codeBox: { backgroundColor: TOITOI_THEME.colors.primaryLight, paddingHorizontal: 15, paddingVertical: 8, borderWidth: 3, borderStyle: 'dashed', borderColor: TOITOI_THEME.colors.black },
  codeText: { fontSize: 22, fontWeight: TOITOI_THEME.typography.fontBlack, letterSpacing: 2 },
  copyBtn: { backgroundColor: TOITOI_THEME.colors.black, paddingHorizontal: 15, paddingVertical: 8, ...TOITOI_THEME.shadows.brutal },
  copyText: { color: TOITOI_THEME.colors.primary, fontWeight: TOITOI_THEME.typography.fontBlack },
  descText: { fontSize: 16, fontWeight: TOITOI_THEME.typography.fontBold, color: TOITOI_THEME.colors.black, marginBottom: 10, lineHeight: 22 },
  minAmount: { fontSize: 12, fontWeight: TOITOI_THEME.typography.fontBlack, color: TOITOI_THEME.colors.gray.dark },
  emptyText: { fontStyle: 'italic', fontWeight: 'bold', color: TOITOI_THEME.colors.gray.dark, textAlign: 'center', marginTop: 20 }
});