import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { AuthAPI } from '../../services/api';
import { TOITOI_THEME } from '../../theme';
import { useTranslation } from 'react-i18next';

export default function LoginScreen() {
  const [phone, setPhone] = useState('');
  const navigation = useNavigation<any>();
  const { t } = useTranslation();

  const handleSendOtp = async () => {
    if (phone.length !== 10) return Alert.alert('Wait!', 'Enter a valid 10-digit number.');
    
    try {
      // 🟢 API Call (Backend bypasses MSG91 if number is 7063392296)
      const response = await AuthAPI.sendOtp(phone, 'msg91');
      
      // 🟢 Correctly parsing Laravel's nested JSON response
      const reqId = response.data?.data?.req_id; 

      if (reqId) {
        navigation.navigate('OtpVerification', { phone, req_id: reqId, auth_provider: 'msg91' });
      } else {
        throw new Error("req_id missing in response");
      }
    } catch (error: any) {
      console.log("Send OTP Error:", error.response?.data || error);
      Alert.alert('Error', error.response?.data?.message || 'Failed to send OTP. Use demo number 7063392296');
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
      <Text style={styles.emoji}>👋</Text>
      <Text style={styles.title}>{t('login.title') || 'Hello There!'}</Text>
      <Text style={styles.subtitle}>{t('login.subtitle') || "Let's get you a ride."}</Text>
      
      <View style={styles.inputWrapper}>
        <View style={styles.countryCodeBox}>
          <Text style={styles.countryCode}>+91</Text>
        </View>
        <TextInput
          style={styles.input}
          placeholder="Phone Number"
          placeholderTextColor={TOITOI_THEME.colors.gray.medium}
          keyboardType="numeric" 
          maxLength={10}
          value={phone}
          onChangeText={setPhone}
          autoCorrect={false}
        />
      </View>

      <TouchableOpacity style={styles.button} activeOpacity={0.8} onPress={handleSendOtp}>
        <Text style={styles.buttonText}>{t('login.send_otp') || 'SEND OTP'}</Text>
      </TouchableOpacity>
    </KeyboardAvoidingView>
  );
}

export const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: TOITOI_THEME.colors.background, padding: 20, justifyContent: 'center' },
  emoji: { fontSize: 60, marginBottom: 10 },
  title: { fontSize: 48, fontWeight: TOITOI_THEME.typography.fontBlack, color: TOITOI_THEME.colors.black, letterSpacing: -1 },
  subtitle: { fontSize: 18, fontWeight: TOITOI_THEME.typography.fontBold, marginBottom: 40, color: TOITOI_THEME.colors.gray.text },
  inputWrapper: { flexDirection: 'row', alignItems: 'center', marginBottom: 30, ...TOITOI_THEME.shadows.brutal },
  countryCodeBox: { backgroundColor: TOITOI_THEME.colors.primary, paddingHorizontal: 15, height: 65, justifyContent: 'center', borderTopLeftRadius: TOITOI_THEME.borders.radius.sm, borderBottomLeftRadius: TOITOI_THEME.borders.radius.sm, borderWidth: TOITOI_THEME.borders.thick, borderColor: TOITOI_THEME.colors.black, borderRightWidth: 0 },
  countryCode: { fontSize: 22, fontWeight: TOITOI_THEME.typography.fontBlack, color: TOITOI_THEME.colors.black },
  input: { flex: 1, height: 65, backgroundColor: TOITOI_THEME.colors.white, borderWidth: TOITOI_THEME.borders.thick, borderColor: TOITOI_THEME.colors.black, borderTopRightRadius: TOITOI_THEME.borders.radius.sm, borderBottomRightRadius: TOITOI_THEME.borders.radius.sm, fontSize: 24, fontWeight: TOITOI_THEME.typography.fontBold, color: TOITOI_THEME.colors.black, paddingHorizontal: 15 },
  button: { backgroundColor: TOITOI_THEME.colors.black, padding: 20, borderWidth: TOITOI_THEME.borders.thick, borderColor: TOITOI_THEME.colors.black, borderRadius: TOITOI_THEME.borders.radius.sm, alignItems: 'center', ...TOITOI_THEME.shadows.brutal },
  buttonText: { fontSize: 20, fontWeight: TOITOI_THEME.typography.fontBlack, color: TOITOI_THEME.colors.white, letterSpacing: 1 },
});