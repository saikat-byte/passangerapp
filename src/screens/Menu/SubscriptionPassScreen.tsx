import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Dimensions, Alert } from 'react-native';
import { PassengerAPI } from '../../services/api';
import { TOITOI_THEME } from '../../theme';

const { width } = Dimensions.get('window');

export default function SubscriptionPassScreen() {
  const [plans, setPlans] = useState<any[]>([]);

  useEffect(() => {
    // Dummy Data for UI layout checking
    setPlans([
      { id: 1, name: 'Daily Pass', price: 29, duration_days: 1, discount_percentage: 10, is_recommended: false },
      { id: 2, name: 'Weekly Pro', price: 149, duration_days: 7, discount_percentage: 20, is_recommended: true },
    ]);
  }, []);

  const handlePurchase = (plan: any) => {
    Alert.alert('Buy Subscription', `Buy ${plan.name} for ₹${plan.price}?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Pay via Wallet', onPress: () => Alert.alert('SUCCESS! 🎉', 'Pass activated.') }
    ]);
  };

  const renderPlanCard = ({ item }: { item: any }) => (
    <View style={styles.cardContainer}>
      <View style={[styles.card, item.is_recommended && { backgroundColor: TOITOI_THEME.colors.primary }]}>
        
        {item.is_recommended && (
          <View style={styles.recommendedBadge}><Text style={styles.recommendedText}>BEST VALUE</Text></View>
        )}

        <View style={styles.planHeader}>
          <Text style={styles.planName}>{item.name.toUpperCase()}</Text>
          <Text style={styles.planPrice}>₹{item.price}</Text>
        </View>

        <View style={styles.benefitsBox}>
          <Text style={styles.benefitItem}>✓ {item.duration_days} DAYS VALIDITY</Text>
          <Text style={styles.benefitItem}>✓ {item.discount_percentage}% OFF RIDES</Text>
          <Text style={styles.benefitItem}>✓ PRIORITY BOOKING</Text>
        </View>

        <TouchableOpacity style={styles.buyBtn} onPress={() => handlePurchase(item)} activeOpacity={0.9}>
          <Text style={styles.buyBtnText}>BUY PASS</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.headerTitle}>TOITOI PASS</Text>
      <Text style={styles.subTitle}>Save more on daily Toto rides in Guskara!</Text>

      <FlatList
        data={plans} keyExtractor={(item) => item.id.toString()}
        renderItem={renderPlanCard} horizontal showsHorizontalScrollIndicator={false}
        snapToInterval={width * 0.85 + 20} decelerationRate="fast"
        contentContainerStyle={styles.listContainer}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: TOITOI_THEME.colors.background, paddingTop: 60 },
  headerTitle: { fontSize: 40, fontWeight: TOITOI_THEME.typography.fontBlack, color: TOITOI_THEME.colors.black, textAlign: 'center' },
  subTitle: { fontSize: 16, fontWeight: TOITOI_THEME.typography.fontBold, textAlign: 'center', marginBottom: 40, color: TOITOI_THEME.colors.gray.text },
  listContainer: { paddingHorizontal: 20, alignItems: 'center' },
  cardContainer: { width: width * 0.85, marginRight: 20 },
  card: { backgroundColor: TOITOI_THEME.colors.white, borderWidth: 4, borderColor: TOITOI_THEME.colors.black, padding: 24, ...TOITOI_THEME.shadows.brutal, minHeight: 450, justifyContent: 'space-between' },
  recommendedBadge: { position: 'absolute', top: -15, right: 20, backgroundColor: TOITOI_THEME.colors.danger, paddingHorizontal: 15, paddingVertical: 5, borderWidth: 2, borderColor: TOITOI_THEME.colors.black },
  recommendedText: { color: TOITOI_THEME.colors.white, fontWeight: TOITOI_THEME.typography.fontBlack, fontSize: 12 },
  planHeader: { borderBottomWidth: 4, borderColor: TOITOI_THEME.colors.black, paddingBottom: 20 },
  planName: { fontSize: 32, fontWeight: TOITOI_THEME.typography.fontBlack, color: TOITOI_THEME.colors.black, marginBottom: 10 },
  planPrice: { fontSize: 60, fontWeight: TOITOI_THEME.typography.fontBlack, color: TOITOI_THEME.colors.black },
  benefitsBox: { marginVertical: 20, gap: 15 },
  benefitItem: { fontSize: 16, fontWeight: TOITOI_THEME.typography.fontBlack, color: TOITOI_THEME.colors.black, backgroundColor: TOITOI_THEME.colors.white, borderWidth: 3, borderColor: TOITOI_THEME.colors.black, padding: 12, ...TOITOI_THEME.shadows.brutal },
  buyBtn: { backgroundColor: TOITOI_THEME.colors.black, paddingVertical: 20, borderWidth: 4, borderColor: TOITOI_THEME.colors.black, alignItems: 'center', ...TOITOI_THEME.shadows.brutal },
  buyBtnText: { color: TOITOI_THEME.colors.white, fontSize: 24, fontWeight: TOITOI_THEME.typography.fontBlack },
});