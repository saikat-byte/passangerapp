import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { AuthAPI } from '../../services/api';
import { TOITOI_THEME } from '../../theme';

export default function LoginScreen() {
  const [phone, setPhone] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const navigation = useNavigation<any>();

  const handleSendOtp = async () => {
    if (phone.length < 10) return Alert.alert('Error', 'Invalid Phone Number');
    
    // ======== DEMO MODE BYPASS ========
    if (phone === '7063392296') {
      console.log('Demo number detected. Bypassing OTP API.');
      navigation.navigate('OtpVerification', { phone });
      return;
    }
    // ==================================

    try {
      await AuthAPI.sendOtp(phone);
      navigation.navigate('OtpVerification', { phone });
    } catch (error) {
      Alert.alert('Error', 'Failed to send OTP. Try Demo Number: 7063392296');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>TOITOI</Text>
      <Text style={styles.subtitle}>Enter your phone number</Text>
      
      <TextInput
        style={[styles.input, isFocused && styles.inputFocused]}
        placeholder="e.g. 7063392296"
        placeholderTextColor={TOITOI_THEME.colors.gray.medium}
        keyboardType="phone-pad"
        value={phone}
        onChangeText={setPhone}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
      />

      <TouchableOpacity 
        style={styles.button} 
        activeOpacity={0.8}
        onPress={handleSendOtp}
      >
        <Text style={styles.buttonText}>SEND OTP</Text>
      </TouchableOpacity>
    </View>
  );
}

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: TOITOI_THEME.colors.background,
    padding: 20,
    justifyContent: 'center',
  },
  title: {
    fontSize: 48,
    fontWeight: TOITOI_THEME.typography.fontBlack,
    color: TOITOI_THEME.colors.black,
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: TOITOI_THEME.typography.fontBold,
    marginBottom: 30,
    color: TOITOI_THEME.colors.black,
  },
  input: {
    borderWidth: TOITOI_THEME.borders.thick,
    borderColor: TOITOI_THEME.colors.black,
    backgroundColor: TOITOI_THEME.colors.white,
    borderRadius: TOITOI_THEME.borders.radius.sm,
    padding: 15,
    fontSize: 20,
    fontWeight: TOITOI_THEME.typography.fontBold,
    color: TOITOI_THEME.colors.black,
    marginBottom: 20,
  },
  inputFocused: {
    ...TOITOI_THEME.shadows.brutal,
  },
  button: {
    backgroundColor: TOITOI_THEME.colors.primary,
    borderWidth: TOITOI_THEME.borders.thick,
    borderColor: TOITOI_THEME.colors.black,
    borderRadius: TOITOI_THEME.borders.radius.sm,
    padding: 18,
    alignItems: 'center',
    ...TOITOI_THEME.shadows.brutal,
  },
  buttonText: {
    fontSize: 20,
    fontWeight: TOITOI_THEME.typography.fontBlack,
    color: TOITOI_THEME.colors.black,
  },
});