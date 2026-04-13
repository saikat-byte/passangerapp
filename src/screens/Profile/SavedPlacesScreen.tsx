import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Modal, TextInput } from 'react-native';
import { ProfileAPI } from '../../services/api';
import { usePassengerAuthStore } from '../../store/usePassengerAuthStore';
import { TOITOI_THEME } from '../../theme';

export default function SavedPlacesScreen() {
  const { savedPlaces, setSavedPlaces } = usePassengerAuthStore();
  const [modalVisible, setModalVisible] = useState(false);
  
  const [title, setTitle] = useState('');
  const [address, setAddress] = useState('');

  const fetchPlaces = async () => {
    try {
      const res = await ProfileAPI.getSavedPlaces();
      setSavedPlaces(res.data.data || []);
    } catch (error) {
      console.log('Failed to fetch places');
    }
  };

  useEffect(() => {
    fetchPlaces();
  }, []);

  const handleSavePlace = async () => {
    try {
      await ProfileAPI.addSavedPlace({
        title,
        address,
        latitude: 22.5726, 
        longitude: 88.3639,
      });
      setModalVisible(false);
      setTitle('');
      setAddress('');
      fetchPlaces();
    } catch (error) {
      console.log('Error saving place');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.headerTitle}>Saved Places</Text>
      
      <FlatList
        data={savedPlaces}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>{item.title}</Text>
            <Text style={styles.cardAddress}>{item.address}</Text>
          </View>
        )}
      />

      <TouchableOpacity 
        style={styles.fab} 
        activeOpacity={0.8}
        onPress={() => setModalVisible(true)}
      >
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>

      <Modal visible={modalVisible} transparent={true} animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalHeader}>Add New Place</Text>
            
            <TextInput
              style={styles.input}
              placeholder="Title (e.g. Home)"
              placeholderTextColor={TOITOI_THEME.colors.gray.medium}
              value={title}
              onChangeText={setTitle}
            />
            <TextInput
              style={styles.input}
              placeholder="Address"
              placeholderTextColor={TOITOI_THEME.colors.gray.medium}
              value={address}
              onChangeText={setAddress}
            />
            
            <TouchableOpacity style={styles.button} activeOpacity={0.8} onPress={handleSavePlace}>
              <Text style={styles.buttonText}>SAVE PLACE</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.button, styles.cancelButton]} 
              activeOpacity={0.8} 
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.buttonText}>CANCEL</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: TOITOI_THEME.colors.background, 
    padding: 20 
  },
  headerTitle: { 
    fontSize: 32, 
    fontWeight: TOITOI_THEME.typography.fontBlack, 
    marginBottom: 20, 
    color: TOITOI_THEME.colors.black 
  },
  card: {
    backgroundColor: TOITOI_THEME.colors.white, 
    borderWidth: TOITOI_THEME.borders.thick, 
    borderColor: TOITOI_THEME.colors.black, 
    borderRadius: TOITOI_THEME.borders.radius.md,
    padding: 15, 
    marginBottom: 15,
    ...TOITOI_THEME.shadows.brutal
  },
  cardTitle: { 
    fontSize: 20, 
    fontWeight: TOITOI_THEME.typography.fontBlack, 
    color: TOITOI_THEME.colors.black 
  },
  cardAddress: { 
    fontSize: 16, 
    fontWeight: TOITOI_THEME.typography.fontBold, 
    color: TOITOI_THEME.colors.gray.text, 
    marginTop: 5 
  },
  fab: {
    position: 'absolute', 
    bottom: 30, 
    right: 20, 
    backgroundColor: TOITOI_THEME.colors.primary,
    width: 60, 
    height: 60, 
    borderRadius: TOITOI_THEME.borders.radius.full, 
    borderWidth: TOITOI_THEME.borders.thick, 
    borderColor: TOITOI_THEME.colors.black,
    alignItems: 'center', 
    justifyContent: 'center',
    ...TOITOI_THEME.shadows.brutal
  },
  fabText: { 
    fontSize: 36, 
    fontWeight: TOITOI_THEME.typography.fontBlack, 
    color: TOITOI_THEME.colors.black, 
    lineHeight: 40 
  },
  modalOverlay: { 
    flex: 1, 
    backgroundColor: 'rgba(0,0,0,0.5)', 
    justifyContent: 'center', 
    padding: 20 
  },
  modalContent: {
    backgroundColor: TOITOI_THEME.colors.background, 
    borderWidth: TOITOI_THEME.borders.thick, 
    borderColor: TOITOI_THEME.colors.black, 
    borderRadius: TOITOI_THEME.borders.radius.lg,
    padding: 20,
    ...TOITOI_THEME.shadows.brutal
  },
  modalHeader: { 
    fontSize: 24, 
    fontWeight: TOITOI_THEME.typography.fontBlack, 
    marginBottom: 15, 
    color: TOITOI_THEME.colors.black 
  },
  input: { 
    borderWidth: TOITOI_THEME.borders.thick, 
    borderColor: TOITOI_THEME.colors.black, 
    backgroundColor: TOITOI_THEME.colors.white, 
    borderRadius: TOITOI_THEME.borders.radius.sm,
    padding: 12, 
    fontSize: 16, 
    fontWeight: TOITOI_THEME.typography.fontBold, 
    color: TOITOI_THEME.colors.black,
    marginBottom: 15 
  },
  button: { 
    backgroundColor: TOITOI_THEME.colors.primary, 
    borderWidth: TOITOI_THEME.borders.thick, 
    borderColor: TOITOI_THEME.colors.black, 
    borderRadius: TOITOI_THEME.borders.radius.sm,
    padding: 15, 
    alignItems: 'center', 
    marginBottom: 10, 
    ...TOITOI_THEME.shadows.brutal 
  },
  cancelButton: { 
    backgroundColor: TOITOI_THEME.colors.white 
  },
  buttonText: { 
    fontSize: 18, 
    fontWeight: TOITOI_THEME.typography.fontBlack, 
    color: TOITOI_THEME.colors.black 
  }
});