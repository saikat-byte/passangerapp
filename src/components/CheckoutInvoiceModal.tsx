import React from 'react';
import { View, Text, TouchableOpacity, Modal, StyleSheet } from 'react-native';
import { RideAPI } from '../services/api'; // Assuming you have this in api.ts
import { usePassengerRideStore } from '../store/usePassengerRideStore';
import { TOITOI_THEME } from '../theme';

interface Props {
  isVisible: boolean;
  onClose: () => void;
}

export default function CheckoutInvoiceModal({ isVisible, onClose }: Props) {
  const { currentRide } = usePassengerRideStore(); // Fixed import & variable name

  const handlePayment = async () => {
    try {
      if (!currentRide) return;
      // You can replace this with your actual payment API call
      // await RideAPI.payForRide(currentRide.id, currentRide.payment_method);
      onClose();
    } catch (error) {
      console.error("Payment Error", error);
    }
  };

  if (!currentRide) return null;

  const baseFare = currentRide.fare_amount || 0;
  const waitingCharge = 0; // Update when FareBreakdownDTO is integrated
  const finalTotal = baseFare + waitingCharge;

  return (
    <Modal visible={isVisible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.invoiceCard}>
          
          <Text style={styles.title}>INVOICE</Text>

          <View style={styles.breakdownBox}>
            <View style={styles.row}>
              <Text style={styles.label}>Base Fare</Text>
              <Text style={styles.amount}>₹{baseFare}</Text>
            </View>
            {waitingCharge > 0 && (
              <View style={styles.row}>
                <Text style={styles.label}>Waiting Time</Text>
                <Text style={styles.amount}>₹{waitingCharge}</Text>
              </View>
            )}
            <View style={styles.row}>
              <Text style={styles.label}>Tolls/Taxes</Text>
              <Text style={styles.amount}>₹0</Text>
            </View>
          </View>

          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>TOTAL</Text>
            <Text style={styles.totalAmount}>₹{finalTotal}</Text>
          </View>

          <View style={styles.paymentMethodBox}>
            <Text style={styles.paymentMethodText}>
              Paying via: {currentRide.payment_method?.toUpperCase()}
            </Text>
          </View>

          <TouchableOpacity onPress={handlePayment} style={styles.payBtn} activeOpacity={0.9}>
            <Text style={styles.payBtnText}>PAY NOW</Text>
          </TouchableOpacity>

        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.8)', padding: 16 },
  invoiceCard: { backgroundColor: TOITOI_THEME.colors.white, width: '100%', maxWidth: 400, borderWidth: 4, borderColor: TOITOI_THEME.colors.black, padding: 24, ...TOITOI_THEME.shadows.brutal },
  title: { fontSize: 32, fontWeight: TOITOI_THEME.typography.fontBlack, color: TOITOI_THEME.colors.black, borderBottomWidth: 3, borderColor: TOITOI_THEME.colors.black, paddingBottom: 16, marginBottom: 16, textAlign: 'center' },
  breakdownBox: { gap: 12, borderBottomWidth: 2, borderStyle: 'dashed', borderColor: TOITOI_THEME.colors.black, paddingBottom: 16, marginBottom: 24 },
  row: { flexDirection: 'row', justifyContent: 'space-between' },
  label: { fontSize: 18, fontWeight: TOITOI_THEME.typography.fontBold, color: TOITOI_THEME.colors.black },
  amount: { fontSize: 18, fontWeight: TOITOI_THEME.typography.fontBlack, color: TOITOI_THEME.colors.black },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 },
  totalLabel: { fontSize: 24, fontWeight: TOITOI_THEME.typography.fontBlack, color: TOITOI_THEME.colors.black },
  totalAmount: { fontSize: 36, fontWeight: TOITOI_THEME.typography.fontBlack, color: TOITOI_THEME.colors.black, backgroundColor: TOITOI_THEME.colors.primary, paddingHorizontal: 8, borderWidth: 2, borderColor: TOITOI_THEME.colors.black },
  paymentMethodBox: { backgroundColor: TOITOI_THEME.colors.gray.light, padding: 12, borderWidth: 2, borderColor: TOITOI_THEME.colors.black, marginBottom: 24 },
  paymentMethodText: { fontSize: 16, fontWeight: TOITOI_THEME.typography.fontBold, textAlign: 'center', color: TOITOI_THEME.colors.black },
  payBtn: { backgroundColor: TOITOI_THEME.colors.black, paddingVertical: 16, width: '100%', borderWidth: 3, borderColor: TOITOI_THEME.colors.black, alignItems: 'center', shadowColor: TOITOI_THEME.colors.primary, shadowOffset: { width: 4, height: 4 }, shadowOpacity: 1, shadowRadius: 0, elevation: 5 },
  payBtnText: { color: TOITOI_THEME.colors.primary, fontWeight: TOITOI_THEME.typography.fontBlack, fontSize: 20 },
});