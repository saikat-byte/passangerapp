import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Share } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { TOITOI_THEME } from '../../theme';

export default function ReferralScreen() {
  const navigation = useNavigation();
  const referralCode = "TOITOI-GUSKARA26"; // Fetch from user profile store

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Tired of bargaining? Book a Toto easily with TOITOI! Use my referral code: ${referralCode} to get ₹50 off your first ride. Download now!`,
      });
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={{fontSize: 80, marginBottom: 20}}>🎁</Text>
      <Text style={styles.title}>REFER & EARN</Text>
      <Text style={styles.subtitle}>Invite friends to use TOITOI and earn ₹50 in your wallet for every successful first ride!</Text>
      
      <View style={styles.codeBox}>
        <Text style={styles.codeLabel}>YOUR REFERRAL CODE</Text>
        <Text style={styles.codeText}>{referralCode}</Text>
      </View>
      
      <TouchableOpacity style={styles.shareBtn} onPress={handleShare} activeOpacity={0.8}>
        <Text style={styles.shareBtnText}>📣 SHARE VIA WHATSAPP</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
        <Text style={styles.backBtnText}>BACK</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: TOITOI_THEME.colors.background, padding: 20, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 36, fontWeight: TOITOI_THEME.typography.fontBlack, color: TOITOI_THEME.colors.black, marginBottom: 10 },
  subtitle: { fontSize: 16, fontWeight: TOITOI_THEME.typography.fontBold, color: TOITOI_THEME.colors.gray.dark, marginBottom: 40, textAlign: 'center', lineHeight: 24 },
  codeBox: { backgroundColor: TOITOI_THEME.colors.primaryLight, borderWidth: 4, borderStyle: 'dashed', borderColor: TOITOI_THEME.colors.black, padding: 30, alignItems: 'center', width: '100%', marginBottom: 30 },
  codeLabel: { fontSize: 14, fontWeight: 'bold', color: TOITOI_THEME.colors.gray.medium, marginBottom: 10, letterSpacing: 2 },
  codeText: { fontSize: 36, fontWeight: TOITOI_THEME.typography.fontBlack, color: TOITOI_THEME.colors.black },
  shareBtn: { backgroundColor: TOITOI_THEME.colors.success, borderWidth: 4, borderColor: TOITOI_THEME.colors.black, padding: 20, width: '100%', alignItems: 'center', marginBottom: 20, ...TOITOI_THEME.shadows.brutal },
  shareBtnText: { fontSize: 18, fontWeight: TOITOI_THEME.typography.fontBlack, color: TOITOI_THEME.colors.black },
  backBtn: { backgroundColor: TOITOI_THEME.colors.white, borderWidth: 4, borderColor: TOITOI_THEME.colors.black, padding: 20, width: '100%', alignItems: 'center', ...TOITOI_THEME.shadows.brutal },
  backBtnText: { fontSize: 18, fontWeight: TOITOI_THEME.typography.fontBlack, color: TOITOI_THEME.colors.black },
});