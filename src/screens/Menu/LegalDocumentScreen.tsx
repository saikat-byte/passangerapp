import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { TOITOI_THEME } from '../../theme';

export default function LegalDocumentScreen() {
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>TERMS & POLICIES</Text>
      
      <ScrollView style={styles.contentBox}>
        <Text style={styles.text}>1. Acceptance of Terms</Text>
        <Text style={styles.text}>By using the TOITOI app, you agree to these terms.</Text>
        <Text style={styles.text}>2. User Responsibilities</Text>
        <Text style={styles.text}>Users must provide accurate information and respect drivers.</Text>
        <Text style={styles.text}>3. Payment & Cancellations</Text>
        <Text style={styles.text}>Cancellations after driver arrival may incur a fee.</Text>
        {/* Add more static or dynamic text here later */}
      </ScrollView>
      
      <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
        <Text style={styles.backBtnText}>BACK</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: TOITOI_THEME.colors.background, padding: 20, paddingTop: 60 },
  title: { fontSize: 28, fontWeight: TOITOI_THEME.typography.fontBlack, color: TOITOI_THEME.colors.black, marginBottom: 20, textAlign: 'center' },
  contentBox: { flex: 1, backgroundColor: TOITOI_THEME.colors.white, borderWidth: 4, borderColor: TOITOI_THEME.colors.black, padding: 20, marginBottom: 20, ...TOITOI_THEME.shadows.brutal },
  text: { fontSize: 16, fontWeight: 'bold', marginBottom: 15, color: TOITOI_THEME.colors.black },
  backBtn: { backgroundColor: TOITOI_THEME.colors.white, borderWidth: 4, borderColor: TOITOI_THEME.colors.black, padding: 20, alignItems: 'center', ...TOITOI_THEME.shadows.brutal },
  backBtnText: { fontSize: 18, fontWeight: TOITOI_THEME.typography.fontBlack, color: TOITOI_THEME.colors.black },
});