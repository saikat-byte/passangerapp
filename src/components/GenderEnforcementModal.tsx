import React, { useState } from 'react';
import { View, Text, Modal, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { usePassengerAuthStore } from '../store/usePassengerAuthStore';
import { ProfileAPI } from '../services/api';
import { TOITOI_THEME } from '../theme';

export default function GenderEnforcementModal() {
  const { user, setUser } = usePassengerAuthStore();
  const [loading, setLoading] = useState(false);

  if (user?.gender) return null;

const handleSelectGender = async (selectedGender: 'male' | 'female' | 'other') => {
    setLoading(true);
    try {
      // API Call
      await ProfileAPI.updateProfile({ gender: selectedGender });
      
      setUser({ ...user, gender: selectedGender });
    } catch (e: any) {
      console.log('Update Error Details:', e.response?.data || e.message);

      alert(`Error: ${e.response?.data?.message || 'Failed to update gender'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal visible={true} transparent={true} animationType="slide">
      <View style={styles.overlay}>
        <View style={styles.modalBox}>
          <Text style={styles.title}>Complete Profile</Text>
          <Text style={styles.subtitle}>
            Please select your gender. This is required for safety features like 'Female-Only' rides.
          </Text>

          {loading ? (
            <ActivityIndicator size="large" color={TOITOI_THEME.colors.black} style={{ marginVertical: 20 }} />
          ) : (
            <View style={styles.optionsContainer}>
              <TouchableOpacity style={styles.optionBtn} onPress={() => handleSelectGender('female')}>
                <Text style={styles.optionText}>👩 Female</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.optionBtn} onPress={() => handleSelectGender('male')}>
                <Text style={styles.optionText}>👨 Male</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.optionBtn} onPress={() => handleSelectGender('other')}>
                <Text style={styles.optionText}>⚧ Other</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', padding: 20,
  },
  modalBox: {
    backgroundColor: TOITOI_THEME.colors.primaryLight, padding: 25,
    borderWidth: TOITOI_THEME.borders.thick, borderColor: TOITOI_THEME.colors.black,
    borderRadius: 0, ...TOITOI_THEME.shadows.brutal,
  },
  title: { fontSize: 24, fontWeight: TOITOI_THEME.typography.fontBlack, color: TOITOI_THEME.colors.black, marginBottom: 10 },
  subtitle: { fontSize: 16, fontWeight: TOITOI_THEME.typography.fontBold, color: TOITOI_THEME.colors.gray.text, marginBottom: 25, lineHeight: 22 },
  optionsContainer: { gap: 15 },
  optionBtn: {
    backgroundColor: TOITOI_THEME.colors.white, padding: 18,
    borderWidth: TOITOI_THEME.borders.thick, borderColor: TOITOI_THEME.colors.black,
    borderRadius: 0, alignItems: 'center', ...TOITOI_THEME.shadows.brutal,
  },
  optionText: { fontSize: 18, fontWeight: TOITOI_THEME.typography.fontBlack, color: TOITOI_THEME.colors.black },
});