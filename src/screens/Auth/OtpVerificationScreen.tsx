import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert } from 'react-native';
import { useRoute } from '@react-navigation/native';
import { AuthAPI, ProfileAPI } from '../../services/api';
import { usePassengerAuthStore } from '../../store/usePassengerAuthStore';
import { styles } from './LoginScreen'; 
import { TOITOI_THEME } from '../../theme';

export default function OtpVerificationScreen() {
  const [otp, setOtp] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const route = useRoute<any>();
  const phone = route.params?.phone;
  const { setToken, setUser } = usePassengerAuthStore();

  const handleVerifyOtp = async () => {
    // ======== DEMO MODE BYPASS ========
    if (phone === '7063392296' && otp === '1234') {
      console.log('Demo Login Successful!');
      setToken('demo_dummy_token_123456789');
      setUser({
        id: '1',
        name: 'Demo Passenger',
        phone: '7063392296',
      });
      return;
    }
    // ==================================

    try {
      const response = await AuthAPI.login(phone, otp);
      if (response.data.token) {
        setToken(response.data.token);
        const profileRes = await ProfileAPI.getProfile();
        setUser(profileRes.data.data);
      }
    } catch (error) {
      Alert.alert('Error', 'Invalid OTP. For demo use: 1234');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Verify OTP</Text>
      <Text style={styles.subtitle}>Sent to {phone}</Text>
      
      <TextInput
        style={[
          styles.input, 
          isFocused && styles.inputFocused, 
          { fontSize: 32, textAlign: 'center', letterSpacing: 8 }
        ]}
        placeholder="----"
        placeholderTextColor={TOITOI_THEME.colors.gray.medium}
        keyboardType="number-pad"
        maxLength={4}
        value={otp}
        onChangeText={setOtp}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
      />

      <TouchableOpacity 
        style={styles.button} 
        activeOpacity={0.8}
        onPress={handleVerifyOtp}
      >
        <Text style={styles.buttonText}>VERIFY & LOGIN</Text>
      </TouchableOpacity>
    </View>
  );
}