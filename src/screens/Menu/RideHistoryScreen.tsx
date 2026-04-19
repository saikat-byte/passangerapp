import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { PassengerAPI } from '../../services/api';
import { TOITOI_THEME } from '../../theme';

export default function RideHistoryScreen() {
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation<any>();

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const response = await PassengerAPI.getRideHistory(); // Connect this in your API service
      setHistory(response.data.rides || []);
    } catch (error) {
      console.error("Failed to load history", error);
    } finally {
      setLoading(false);
    }
  };

  const renderItem = ({ item }: { item: any }) => (
    <TouchableOpacity 
      style={styles.card}
      onPress={() => navigation.navigate('RideInvoiceScreen', { rideData: item })}
      activeOpacity={0.9}
    >
      <View style={styles.cardHeader}>
        <Text style={styles.dateText}>{new Date(item.created_at).toDateString()}</Text>
        <Text style={styles.amountText}>₹{item.fare_amount}</Text>
      </View>
      <View style={styles.addressBox}>
        <Text style={styles.addressText} numberOfLines={1}>🟢 {item.pickup_address}</Text>
        <Text style={styles.addressText} numberOfLines={1}>📍 {item.drop_address}</Text>
      </View>
      <View style={[styles.statusBadge, item.status === 'completed' ? styles.statusSuccess : styles.statusDanger]}>
        <Text style={styles.statusText}>{item.status.toUpperCase()}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.headerTitle}>YOUR TRIPS</Text>
      {loading ? (
        <ActivityIndicator size="large" color={TOITOI_THEME.colors.black} />
      ) : (
        <FlatList
          data={history}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: TOITOI_THEME.colors.background, padding: 16 },
  headerTitle: { fontSize: 32, fontWeight: TOITOI_THEME.typography.fontBlack, marginBottom: 20, color: TOITOI_THEME.colors.black },
  listContainer: { paddingBottom: 40 },
  card: { backgroundColor: TOITOI_THEME.colors.white, borderWidth: 3, borderColor: TOITOI_THEME.colors.black, padding: 16, marginBottom: 16, ...TOITOI_THEME.shadows.brutal },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', borderBottomWidth: 2, borderStyle: 'dashed', borderColor: TOITOI_THEME.colors.black, paddingBottom: 10, marginBottom: 10 },
  dateText: { fontSize: 16, fontWeight: TOITOI_THEME.typography.fontBold },
  amountText: { fontSize: 24, fontWeight: TOITOI_THEME.typography.fontBlack },
  addressBox: { gap: 8, marginBottom: 12 },
  addressText: { fontSize: 14, fontWeight: 'bold', color: TOITOI_THEME.colors.gray.text },
  statusBadge: { alignSelf: 'flex-start', paddingHorizontal: 12, paddingVertical: 4, borderWidth: 2, borderColor: TOITOI_THEME.colors.black },
  statusSuccess: { backgroundColor: TOITOI_THEME.colors.primary },
  statusDanger: { backgroundColor: TOITOI_THEME.colors.danger },
  statusText: { fontWeight: TOITOI_THEME.typography.fontBlack, fontSize: 12, color: TOITOI_THEME.colors.black },
});