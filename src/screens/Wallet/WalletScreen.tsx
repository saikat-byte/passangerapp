import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, TextInput, Alert, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import RazorpayCheckout from 'react-native-razorpay';
import { TOITOI_THEME } from '../../theme';
import api from '../../services/api';

export default function WalletScreen() {
  const navigation = useNavigation();
  const [balance, setBalance] = useState('0.00');
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [rechargeAmount, setRechargeAmount] = useState('');

  useEffect(() => { fetchWalletData(); }, []);

  const fetchWalletData = async () => {
    try {
      const balanceRes = await api.get('/wallet/balance');
      const txnRes = await api.get('/wallet/transactions');
      
      setBalance(balanceRes.data?.data?.wallet_balance?.toString() || '0.00');
      setTransactions(txnRes.data?.data?.data || []);
    } catch (error) { 
      console.log(error); 
    } finally { 
      setLoading(false); 
    }
  };

  const handleAddMoney = async () => {
    if (!rechargeAmount || isNaN(Number(rechargeAmount)) || Number(rechargeAmount) <= 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid amount.'); 
      return;
    }

    try {
      setIsProcessing(true);

      // 1. 🟢 ব্যাকএন্ড থেকে Order ID তৈরি করো
      const orderRes = await api.post('/wallet/create-razorpay-order', {
        amount: Number(rechargeAmount)
      });

      const { order_id, amount, currency, key } = orderRes.data.data;

      // 2. 🟢 Razorpay Checkout অপশন সেটআপ
      var options = {
        description: 'Wallet Recharge',
        image: 'https://staging.toitoi.co.in/images/logo.png', // তোমার লোগো URL
        currency: currency,
        key: key, 
        amount: amount, 
        name: 'TOITOI',
        order_id: order_id,
        theme: { color: TOITOI_THEME.colors.primary }
      };

      // 3. 🟢 Checkout ওপেন করো
      RazorpayCheckout.open(options).then((data) => {
        // Payment Success! 
        // ⚠️ Webhook ব্যাকএন্ডে টাকা অ্যাড করবে, আমরা শুধু UI রিফ্রেশ করব।
        Alert.alert('Success', `Payment Successful! Transaction ID: ${data.razorpay_payment_id}`);
        setRechargeAmount('');
        
        // 2 সেকেন্ড পর ব্যালেন্স রিফ্রেশ (Webhook প্রসেস হওয়ার সময় দিতে)
        setTimeout(() => {
          fetchWalletData();
        }, 4000);

      }).catch((error) => {
        // Payment Failed or Cancelled
        Alert.alert('Error', `Payment failed. Please try again.`);
        console.log("Razorpay Error:", error.description);
      });

    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.message || 'Could not initiate payment.');
      console.log("Order Create Error:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  const renderTransaction = ({ item }: { item: any }) => (
    <View style={styles.txnCard}>
      <View style={styles.txnIconBox}>
        <Text style={{fontSize: 20}}>{item.type === 'credit' ? '💰' : '🛺'}</Text>
      </View>
      <View style={{flex: 1, paddingLeft: 15}}>
        <Text style={styles.txnTitle}>{item.transaction_purpose}</Text>
        <Text style={styles.txnDate}>{new Date(item.created_at).toLocaleString()}</Text>
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
          editable={!isProcessing}
        />
        <TouchableOpacity 
          style={[styles.addMoneyBtn, isProcessing && { opacity: 0.7 }]} 
          onPress={handleAddMoney} 
          activeOpacity={0.8}
          disabled={isProcessing}
        >
          {isProcessing ? (
            <ActivityIndicator color={TOITOI_THEME.colors.primary} />
          ) : (
            <Text style={styles.addMoneyText}>PROCEED</Text>
          )}
        </TouchableOpacity>
      </View>

      <Text style={styles.sectionTitle}>LEDGER</Text>
      {loading ? (
        <ActivityIndicator size="large" color={TOITOI_THEME.colors.black} />
      ) : (
        <FlatList
          data={transactions} 
          keyExtractor={(item, index) => item.id?.toString() || index.toString()}
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
  title: { fontSize: 30, fontWeight: TOITOI_THEME.typography.fontBlack as any, color: TOITOI_THEME.colors.black },
  backBtn: { backgroundColor: TOITOI_THEME.colors.white, width: 45, height: 45, borderWidth: 3, borderColor: TOITOI_THEME.colors.black, alignItems: 'center', justifyContent: 'center', ...TOITOI_THEME.shadows.brutal },
  backBtnText: { fontSize: 20, fontWeight: 'bold', color: TOITOI_THEME.colors.black },
  balanceCard: { backgroundColor: TOITOI_THEME.colors.primary, borderWidth: 4, borderColor: TOITOI_THEME.colors.black, padding: 25, alignItems: 'center', marginBottom: 25, ...TOITOI_THEME.shadows.brutal },
  balanceLabel: { fontSize: 14, fontWeight: TOITOI_THEME.typography.fontBlack as any, color: TOITOI_THEME.colors.black, marginBottom: 5, letterSpacing: 1 },
  balanceAmount: { fontSize: 50, fontWeight: TOITOI_THEME.typography.fontBlack as any, color: TOITOI_THEME.colors.white, textShadowColor: '#000', textShadowOffset: {width: 3, height: 3}, textShadowRadius: 0 },
  sectionTitle: { fontSize: 16, fontWeight: TOITOI_THEME.typography.fontBlack as any, marginBottom: 15, letterSpacing: 1 },
  quickAddRow: { flexDirection: 'row', gap: 10, marginBottom: 15 },
  chipBtn: { flex: 1, backgroundColor: TOITOI_THEME.colors.white, borderWidth: 2, borderColor: TOITOI_THEME.colors.black, paddingVertical: 10, alignItems: 'center', ...TOITOI_THEME.shadows.brutal },
  chipText: { fontWeight: TOITOI_THEME.typography.fontBlack as any, fontSize: 16 },
  addMoneySection: { flexDirection: 'row', gap: 10, marginBottom: 30 },
  amountInput: { flex: 1, backgroundColor: TOITOI_THEME.colors.white, borderWidth: 3, borderColor: TOITOI_THEME.colors.black, paddingHorizontal: 15, fontSize: 20, fontWeight: TOITOI_THEME.typography.fontBlack as any },
  addMoneyBtn: { backgroundColor: TOITOI_THEME.colors.black, paddingHorizontal: 25, justifyContent: 'center', ...TOITOI_THEME.shadows.brutal },
  addMoneyText: { fontSize: 18, fontWeight: TOITOI_THEME.typography.fontBlack as any, color: TOITOI_THEME.colors.primary },
  txnCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: TOITOI_THEME.colors.white, borderWidth: 3, borderColor: TOITOI_THEME.colors.black, padding: 15, marginBottom: 15, ...TOITOI_THEME.shadows.brutal },
  txnIconBox: { width: 40, height: 40, backgroundColor: TOITOI_THEME.colors.gray.light, borderWidth: 2, borderColor: TOITOI_THEME.colors.black, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  txnTitle: { fontSize: 16, fontWeight: TOITOI_THEME.typography.fontBlack as any, textTransform: 'capitalize' },
  txnDate: { fontSize: 12, fontWeight: 'bold', color: TOITOI_THEME.colors.gray.text, marginTop: 2 },
  txnAmount: { fontSize: 22, fontWeight: TOITOI_THEME.typography.fontBlack as any },
  emptyText: { fontStyle: 'italic', fontWeight: 'bold', color: TOITOI_THEME.colors.gray.dark }
});