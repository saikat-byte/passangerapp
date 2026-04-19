import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, TextInput, Alert, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { TOITOI_THEME } from '../../theme';

export default function WalletScreen() {
  const navigation = useNavigation();
  const [balance, setBalance] = useState('0.00');
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [rechargeAmount, setRechargeAmount] = useState('');

  useEffect(() => { fetchWalletData(); }, []);

  const fetchWalletData = async () => {
    try {
      // TODO: Fetch from WalletAPI
      setBalance('250.50');
      setTransactions([
        { id: 1, amount: 150, type: 'credit', title: 'Added via PhonePe', date: '16 Apr, 02:30 PM' },
        { id: 2, amount: -45, type: 'debit', title: 'Ride to Station', date: '15 Apr, 10:15 AM' },
      ]);
    } catch (error) { console.log(error); } finally { setLoading(false); }
  };

  const handleAddMoney = async () => {
    if (!rechargeAmount || isNaN(Number(rechargeAmount)) || Number(rechargeAmount) <= 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid amount.'); return;
    }
    Alert.alert('Processing', `Opening Razorpay for ₹${rechargeAmount}...`);
    // WalletAPI.addMoney() & PG Integration
  };

  const renderTransaction = ({ item }: { item: any }) => (
    <View style={styles.txnCard}>
      <View style={styles.txnIconBox}>
        <Text style={{fontSize: 20}}>{item.type === 'credit' ? '💰' : '🛺'}</Text>
      </View>
      <View style={{flex: 1, paddingLeft: 15}}>
        <Text style={styles.txnTitle}>{item.title}</Text>
        <Text style={styles.txnDate}>{item.date}</Text>
      </View>
      <Text style={[styles.txnAmount, { color: item.type === 'credit' ? TOITOI_THEME.colors.success : TOITOI_THEME.colors.danger }]}>
        {item.type === 'credit' ? '+' : '-'}₹{Math.abs(item.amount)}
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>TOITOI WALLET</Text>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backBtnText}>✕</Text>
        </TouchableOpacity>
      </View>
      
      <View style={styles.balanceCard}>
        <Text style={styles.balanceLabel}>AVAILABLE BALANCE</Text>
        <Text style={styles.balanceAmount}>₹ {balance}</Text>
      </View>

      <Text style={styles.sectionTitle}>TOP UP WALLET</Text>
      
      {/* 🔴 FIXED: Quick Add Chips */}
      <View style={styles.quickAddRow}>
        {['50', '100', '200', '500'].map(amt => (
          <TouchableOpacity key={amt} style={styles.chipBtn} onPress={() => setRechargeAmount(amt)}>
            <Text style={styles.chipText}>+₹{amt}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.addMoneySection}>
        <TextInput 
          style={styles.amountInput} placeholder="Custom Amount"
          placeholderTextColor={TOITOI_THEME.colors.gray.dark} keyboardType="numeric"
          value={rechargeAmount} onChangeText={setRechargeAmount}
        />
        <TouchableOpacity style={styles.addMoneyBtn} onPress={handleAddMoney} activeOpacity={0.8}>
          <Text style={styles.addMoneyText}>PROCEED</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.sectionTitle}>LEDGER</Text>
      {loading ? (
        <ActivityIndicator size="large" color={TOITOI_THEME.colors.black} />
      ) : (
        <FlatList
          data={transactions} keyExtractor={(item) => item.id.toString()}
          renderItem={renderTransaction} showsVerticalScrollIndicator={false}
          ListEmptyComponent={<Text style={styles.emptyText}>No transactions yet.</Text>}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: TOITOI_THEME.colors.background, padding: 20, paddingTop: 50 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  title: { fontSize: 30, fontWeight: TOITOI_THEME.typography.fontBlack, color: TOITOI_THEME.colors.black },
  backBtn: { backgroundColor: TOITOI_THEME.colors.white, width: 45, height: 45, borderWidth: 3, borderColor: TOITOI_THEME.colors.black, alignItems: 'center', justifyContent: 'center', ...TOITOI_THEME.shadows.brutal },
  backBtnText: { fontSize: 20, fontWeight: 'bold', color: TOITOI_THEME.colors.black },
  balanceCard: { backgroundColor: TOITOI_THEME.colors.primary, borderWidth: 4, borderColor: TOITOI_THEME.colors.black, padding: 25, alignItems: 'center', marginBottom: 25, ...TOITOI_THEME.shadows.brutal },
  balanceLabel: { fontSize: 14, fontWeight: TOITOI_THEME.typography.fontBlack, color: TOITOI_THEME.colors.black, marginBottom: 5, letterSpacing: 1 },
  balanceAmount: { fontSize: 50, fontWeight: TOITOI_THEME.typography.fontBlack, color: TOITOI_THEME.colors.white, textShadowColor: '#000', textShadowOffset: {width: 3, height: 3}, textShadowRadius: 0 },
  sectionTitle: { fontSize: 16, fontWeight: TOITOI_THEME.typography.fontBlack, marginBottom: 15, letterSpacing: 1 },
  quickAddRow: { flexDirection: 'row', gap: 10, marginBottom: 15 },
  chipBtn: { flex: 1, backgroundColor: TOITOI_THEME.colors.white, borderWidth: 2, borderColor: TOITOI_THEME.colors.black, paddingVertical: 10, alignItems: 'center', ...TOITOI_THEME.shadows.brutal },
  chipText: { fontWeight: TOITOI_THEME.typography.fontBlack, fontSize: 16 },
  addMoneySection: { flexDirection: 'row', gap: 10, marginBottom: 30 },
  amountInput: { flex: 1, backgroundColor: TOITOI_THEME.colors.white, borderWidth: 3, borderColor: TOITOI_THEME.colors.black, paddingHorizontal: 15, fontSize: 20, fontWeight: TOITOI_THEME.typography.fontBlack },
  addMoneyBtn: { backgroundColor: TOITOI_THEME.colors.black, paddingHorizontal: 25, justifyContent: 'center', ...TOITOI_THEME.shadows.brutal },
  addMoneyText: { fontSize: 18, fontWeight: TOITOI_THEME.typography.fontBlack, color: TOITOI_THEME.colors.primary },
  txnCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: TOITOI_THEME.colors.white, borderWidth: 3, borderColor: TOITOI_THEME.colors.black, padding: 15, marginBottom: 15, ...TOITOI_THEME.shadows.brutal },
  txnIconBox: { width: 40, height: 40, backgroundColor: TOITOI_THEME.colors.gray.light, borderWidth: 2, borderColor: TOITOI_THEME.colors.black, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  txnTitle: { fontSize: 16, fontWeight: TOITOI_THEME.typography.fontBlack },
  txnDate: { fontSize: 12, fontWeight: 'bold', color: TOITOI_THEME.colors.gray.text, marginTop: 2 },
  txnAmount: { fontSize: 22, fontWeight: TOITOI_THEME.typography.fontBlack },
  emptyText: { fontStyle: 'italic', fontWeight: 'bold', color: TOITOI_THEME.colors.gray.dark }
});