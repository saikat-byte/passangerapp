import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, FlatList, ActivityIndicator, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { SafetyAPI } from '../../services/api'; 
import { TOITOI_THEME } from '../../theme';

export default function EmergencyContactsScreen() {
  const navigation = useNavigation();
  const [contacts, setContacts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');

  useEffect(() => { fetchContacts(); }, []);

  const fetchContacts = async () => {
    try {
      const response = await SafetyAPI.getContacts();
      setContacts(response.data?.data || []); 
    } catch (error) { } finally { setLoading(false); }
  };

  const handleAddContact = async () => {
    if (contacts.length >= 3) return Alert.alert('Limit Reached', 'Max 3 contacts allowed.');
    if (!name || !phone) return Alert.alert('Error', 'Name and Phone required!');
    try {
      await SafetyAPI.addContact({ name, phone, relation: 'Other' }); 
      setName(''); setPhone(''); fetchContacts();
    } catch (error) { Alert.alert('Error', 'Failed to add contact.'); }
  };

  const handleDeleteContact = async (id: number) => {
    try { await SafetyAPI.deleteContact(id); fetchContacts(); } catch (error) { }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}><Text style={styles.backText}>←</Text></TouchableOpacity>
        <Text style={styles.title}>EMERGENCY SOS</Text>
      </View>

      <Text style={styles.subtitle}>These trusted contacts will get your live location if you trigger SOS.</Text>

      <View style={styles.formCard}>
        <TextInput style={styles.input} placeholder="Contact Name" placeholderTextColor={TOITOI_THEME.colors.gray.dark} value={name} onChangeText={setName} />
        <View style={styles.phoneRow}>
            <TextInput style={[styles.input, { flex: 1, marginBottom: 0 }]} placeholder="Phone Number" placeholderTextColor={TOITOI_THEME.colors.gray.dark} keyboardType="phone-pad" value={phone} onChangeText={setPhone} />
            <TouchableOpacity style={styles.pickBtn} onPress={() => Alert.alert('Coming Soon', 'Native Phonebook integration will be added here.')}>
                <Text style={{fontSize: 24}}>📖</Text>
            </TouchableOpacity>
        </View>
        <TouchableOpacity style={styles.addBtn} onPress={handleAddContact} activeOpacity={0.8}>
          <Text style={styles.addBtnText}>+ ADD TO TRUSTED LIST</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.listTitle}>TRUSTED CONTACTS ({contacts.length}/3)</Text>
      {loading ? (
        <ActivityIndicator size="large" color={TOITOI_THEME.colors.black} />
      ) : (
        <FlatList
          data={contacts} keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <View style={styles.contactCard}>
              <View style={styles.iconBox}><Text style={{fontSize: 24}}>🛡️</Text></View>
              <View style={{flex: 1, paddingLeft: 15}}>
                <Text style={styles.contactName}>{item.name}</Text>
                <Text style={styles.contactPhone}>{item.phone}</Text>
              </View>
              <TouchableOpacity style={styles.deleteBtn} onPress={() => handleDeleteContact(item.id)}>
                <Text style={styles.deleteBtnText}>REMOVE</Text>
              </TouchableOpacity>
            </View>
          )}
          contentContainerStyle={{ paddingBottom: 40 }}
          ListEmptyComponent={<Text style={styles.emptyText}>No emergency contacts added yet. Add someone you trust.</Text>}
        />
      )}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: TOITOI_THEME.colors.background, padding: 20, paddingTop: 50 },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 15 },
  backBtn: { backgroundColor: TOITOI_THEME.colors.white, width: 40, height: 40, justifyContent: 'center', alignItems: 'center', borderWidth: TOITOI_THEME.borders.thick, borderColor: TOITOI_THEME.colors.black, marginRight: 15, ...TOITOI_THEME.shadows.brutal },
  backText: { fontSize: 20, fontWeight: 'bold', color: TOITOI_THEME.colors.black },
  title: { fontSize: 30, fontWeight: TOITOI_THEME.typography.fontBlack, color: TOITOI_THEME.colors.danger },
  subtitle: { fontSize: 16, fontWeight: TOITOI_THEME.typography.fontBold, color: TOITOI_THEME.colors.gray.text, marginBottom: 25, lineHeight: 22 },
  formCard: { backgroundColor: TOITOI_THEME.colors.primaryLight, borderWidth: 4, borderColor: TOITOI_THEME.colors.black, padding: 20, marginBottom: 30, ...TOITOI_THEME.shadows.brutal },
  input: { borderWidth: 3, borderColor: TOITOI_THEME.colors.black, padding: 15, fontSize: 18, fontWeight: TOITOI_THEME.typography.fontBold, backgroundColor: TOITOI_THEME.colors.white, marginBottom: 15 },
  phoneRow: { flexDirection: 'row', gap: 10, marginBottom: 20 },
  pickBtn: { backgroundColor: TOITOI_THEME.colors.white, borderWidth: 3, borderColor: TOITOI_THEME.colors.black, width: 60, alignItems: 'center', justifyContent: 'center' },
  addBtn: { backgroundColor: TOITOI_THEME.colors.black, padding: 18, alignItems: 'center', ...TOITOI_THEME.shadows.brutal },
  addBtnText: { color: TOITOI_THEME.colors.primary, fontSize: 16, fontWeight: TOITOI_THEME.typography.fontBlack, letterSpacing: 1 },
  listTitle: { fontSize: 16, fontWeight: TOITOI_THEME.typography.fontBlack, marginBottom: 15, color: TOITOI_THEME.colors.gray.dark },
  contactCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: TOITOI_THEME.colors.white, borderWidth: 3, borderColor: TOITOI_THEME.colors.black, padding: 15, marginBottom: 15, ...TOITOI_THEME.shadows.brutal },
  iconBox: { width: 50, height: 50, backgroundColor: TOITOI_THEME.colors.gray.light, borderRadius: 25, alignItems: 'center', justifyContent: 'center', borderWidth: 2 },
  contactName: { fontSize: 18, fontWeight: TOITOI_THEME.typography.fontBlack, color: TOITOI_THEME.colors.black },
  contactPhone: { fontSize: 16, fontWeight: TOITOI_THEME.typography.fontBold, color: TOITOI_THEME.colors.gray.text, marginTop: 2 },
  deleteBtn: { backgroundColor: TOITOI_THEME.colors.white, borderWidth: 2, borderColor: TOITOI_THEME.colors.danger, paddingHorizontal: 10, paddingVertical: 8 },
  deleteBtnText: { color: TOITOI_THEME.colors.danger, fontWeight: TOITOI_THEME.typography.fontBlack, fontSize: 12 },
  emptyText: { fontWeight: TOITOI_THEME.typography.fontBold, color: TOITOI_THEME.colors.gray.dark, lineHeight: 22 },
});