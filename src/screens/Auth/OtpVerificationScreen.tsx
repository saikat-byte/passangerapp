import React, { useState, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet, Platform, KeyboardAvoidingView } from 'react-native';
import { useRoute, useNavigation, CommonActions } from '@react-navigation/native';
import { AuthAPI } from '../../services/api';
import { usePassengerAuthStore } from '../../store/usePassengerAuthStore';
import { TOITOI_THEME } from '../../theme';
import { styles as loginStyles } from './LoginScreen'; 

const APP_VERSION = '1.0.0';

export default function OtpVerificationScreen() {
  const [otp, setOtp] = useState(['', '', '', '']);
  const [focusedIndex, setFocusedIndex] = useState<number | null>(null);
  const inputRefs = useRef<Array<TextInput | null>>([]);
  
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  
  const phone = route.params?.phone || '';
  const req_id = route.params?.req_id || '';
  const auth_provider = route.params?.auth_provider || 'msg91';

  const { setToken, setUser } = usePassengerAuthStore();

  const handleOtpChange = (text: string, index: number) => {
    const numericText = text.replace(/[^0-9]/g, '');
    if (numericText.length === 4) {
      setOtp(numericText.split(''));
      inputRefs.current[3]?.focus();
      return;
    }
    const newOtp = [...otp];
    newOtp[index] = numericText;
    setOtp(newOtp);

    if (numericText && index < 3) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleBackspace = (text: string, index: number) => {
    if (text === '' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerifyOtp = async () => {
    const finalOtp = otp.join('');
    if (finalOtp.length < 4) return Alert.alert('Wait!', 'Enter valid 4-digit OTP');

    try {
      const payload = {
        auth_provider: auth_provider, 
        phone: phone,
        otp: finalOtp,
        req_id: req_id,
        fcm_token: "dummy_fcm_token", 
        device_os: Platform.OS,
        app_version: APP_VERSION
      };

      const response = await AuthAPI.verifyOtp(payload); 
      
      // 🟢 Correctly parse Laravel's nested JSON
      const token = response.data?.data?.token;
      const user = response.data?.data?.user;
      
      if (token && user) {
        setToken(token);
        setUser(user);
        navigation.dispatch(CommonActions.reset({ index: 0, routes: [{ name: 'Splash' }] }));
      } else {
        throw new Error("Invalid response format from server");
      }
    } catch (error: any) {
      console.log('Login Error Details:', error.response?.data);
      const errorMsg = error.response?.data?.message || 'Invalid OTP. Try again.';
      Alert.alert('Authentication Failed', errorMsg);
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={loginStyles.container}>
      <Text style={loginStyles.emoji}>🔐</Text>
      <Text style={loginStyles.title}>Verify OTP</Text>
      <Text style={loginStyles.subtitle}>Sent to +91 {phone}</Text>
      
      <View style={localStyles.otpContainer}>
        {otp.map((digit, index) => (
          <TextInput
            key={index}
            ref={(ref) => (inputRefs.current[index] = ref)}
            style={[localStyles.otpBox, focusedIndex === index && localStyles.otpBoxFocused]}
            keyboardType="number-pad"
            maxLength={4}
            textContentType="oneTimeCode"
            autoComplete="sms-otp"
            value={digit}
            onChangeText={(text) => handleOtpChange(text, index)}
            onKeyPress={({ nativeEvent }) => {
              if (nativeEvent.key === 'Backspace') handleBackspace(digit, index);
            }}
            onFocus={() => setFocusedIndex(index)}
            onBlur={() => setFocusedIndex(null)}
          />
        ))}
      </View>

      <TouchableOpacity style={loginStyles.button} activeOpacity={0.8} onPress={handleVerifyOtp}>
        <Text style={loginStyles.buttonText}>VERIFY & LOGIN</Text>
      </TouchableOpacity>
    </KeyboardAvoidingView>
  );
}

const localStyles = StyleSheet.create({
  otpContainer: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 40, width: '100%' },
  otpBox: { width: 70, height: 75, borderWidth: TOITOI_THEME.borders.thick, borderColor: TOITOI_THEME.colors.black, backgroundColor: TOITOI_THEME.colors.white, textAlign: 'center', fontSize: 32, fontWeight: TOITOI_THEME.typography.fontBlack, color: TOITOI_THEME.colors.black, borderRadius: TOITOI_THEME.borders.radius.sm, ...TOITOI_THEME.shadows.brutal },
  otpBoxFocused: { backgroundColor: TOITOI_THEME.colors.primaryLight, borderColor: TOITOI_THEME.colors.primary, transform: [{ translateX: 2 }, { translateY: 2 }], ...TOITOI_THEME.shadows.brutalActive }
});