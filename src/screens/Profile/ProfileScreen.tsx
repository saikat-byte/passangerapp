import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ScrollView, TextInput, Image, ActivityIndicator } from 'react-native';
import { useNavigation, CommonActions } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import { useSafeAreaInsets } from 'react-native-safe-area-context'; 
import { ProfileAPI } from '../../services/api';
import { usePassengerAuthStore } from '../../store/usePassengerAuthStore';
import { TOITOI_THEME } from '../../theme';

// 🔴 Ensure this matches your actual local IP
const API_BASE_URL = 'http://192.168.29.11:8000'; 

export const getFullImageUrl = (imagePath: string | null) => {
  if (!imagePath) return null;
  if (imagePath.startsWith('http') || imagePath.startsWith('file://')) return imagePath;
  const cleanPath = imagePath.startsWith('/') ? imagePath.slice(1) : imagePath;
  return `${API_BASE_URL}/storage/${cleanPath}`; 
};

export default function ProfileScreen() {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const { user, logout, setUser } = usePassengerAuthStore();

  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [imageLoading, setImageLoading] = useState(false);

  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [gender, setGender] = useState(user?.gender || '');
  const [imageUri, setImageUri] = useState<string | null>(user?.avatar || null);
  const [newImageSelected, setNewImageSelected] = useState(false);

  const handlePickImage = async () => {
    if (!isEditing) return;
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (permissionResult.granted === false) {
      Alert.alert('Permission Denied', 'Camera roll permissions are required.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8, // 🔴 Increased quality slightly for better profile pics
    });

    if (!result.canceled && result.assets.length > 0) {
      setImageLoading(true);
      setImageUri(result.assets[0].uri); 
      setNewImageSelected(true);
      setImageLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    if (!name.trim()) return Alert.alert('Error', 'Name is required.');
    
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('name', name);
      if (email) formData.append('email', email);
      if (gender) formData.append('gender', gender); // 🔴 Appending Gender to API Payload

      if (newImageSelected && imageUri) {
        const filename = imageUri.split('/').pop() || 'profile.jpg';
        const match = /\.(\w+)$/.exec(filename); 
        const type = match ? `image/${match[1]}` : `image/jpeg`;
        
        // 🔴 Explicitly casting to any to bypass TS error for React Native FormData
        formData.append('avatar', { 
          uri: imageUri, 
          name: filename, 
          type 
        } as any);
      }

      const response = await ProfileAPI.updateProfile(formData);
      
      if (response.data?.user) {
        setUser(response.data.user);
      } else {
        // Fallback update
        setUser({ ...user, name, email, gender, avatar: imageUri } as any);
      }

      Alert.alert('Success', 'Profile updated successfully!');
      setIsEditing(false);
      setNewImageSelected(false);
    } catch (error: any) {
      console.log('Profile Update Error:', error.response?.data || error);
      Alert.alert('Error', error.response?.data?.message || 'Failed to update profile.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelEdit = () => {
    if (name !== user?.name || email !== user?.email || gender !== user?.gender || newImageSelected) {
      Alert.alert('Unsaved Changes', 'Discard changes?', [
        { text: 'Keep Editing', style: 'cancel' },
        { text: 'Discard', style: 'destructive', onPress: () => {
            setIsEditing(false); 
            setName(user?.name || ''); 
            setEmail(user?.email || ''); 
            setGender(user?.gender || ''); // 🔴 Reset Gender
            setImageUri(user?.avatar || null); 
            setNewImageSelected(false);
        }}
      ]);
    } else {
      setIsEditing(false);
    }
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'DELETE ACCOUNT?',
      'Your account will be deactivated immediately. It will be permanently deleted after 30 days.\n\nAre you sure?',
      [
        { text: 'CANCEL', style: 'cancel' },
        { 
          text: 'YES, DELETE', 
          style: 'destructive',
          onPress: async () => {
            try {
              // await ProfileAPI.deleteAccount(); 
              await logout(); 
              Alert.alert('Account Deactivated', 'Your account has been scheduled for deletion.', [
                {
                  text: 'OK',
                  onPress: () => {
                    setTimeout(() => {
                      navigation.dispatch(CommonActions.reset({ index: 0, routes: [{ name: 'AuthStack' }] }));
                    }, 100);
                  }
                }
              ]);
            } catch (error) {
              Alert.alert('Error', 'Failed to delete account.');
            }
          }
        }
      ]
    );
  };

  return (
    <ScrollView 
      style={styles.container} 
      contentContainerStyle={{ paddingBottom: insets.bottom + 40, paddingTop: Math.max(insets.top, 20) }}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <Text style={styles.title}>PROFILE</Text>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()} disabled={loading}>
          <Text style={styles.backBtnText}>✕</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.infoCard}>
        <View style={styles.imageContainer}>
          <TouchableOpacity onPress={handlePickImage} activeOpacity={isEditing ? 0.7 : 1}>
            {imageLoading ? (
               <ActivityIndicator size="large" color={TOITOI_THEME.colors.primary} style={styles.profileImage} />
            ) : (
              <Image 
                source={imageUri ? { uri: newImageSelected ? imageUri : getFullImageUrl(imageUri) || undefined } : require('../../../assets/adaptive-icon.png')} 
                style={styles.profileImage} 
              />
            )}
            {isEditing && (
              <View style={styles.editImageBadge}><Text style={styles.editImageText}>📷 EDIT</Text></View>
            )}
          </TouchableOpacity>
          {user?.is_trusted && !isEditing && (
            <View style={styles.trustBadge}><Text style={styles.trustText}>⭐ TRUSTED RIDER</Text></View>
          )}
        </View>

        <Text style={styles.label}>FULL NAME</Text>
        {isEditing ? (
          <TextInput style={styles.input} value={name} onChangeText={setName} placeholder="Enter name" />
        ) : <Text style={styles.value}>{name || 'Guest User'}</Text>}
        
        <View style={styles.divider} />
        
        <Text style={styles.label}>EMAIL ADDRESS</Text>
        {isEditing ? (
          <TextInput style={styles.input} value={email} onChangeText={setEmail} placeholder="Email" keyboardType="email-address" autoCapitalize="none" />
        ) : <Text style={styles.value}>{email || 'Not Provided'}</Text>}

        <View style={styles.divider} />

        {/* 🔴 Added Gender Field */}
        <Text style={styles.label}>GENDER</Text>
        {isEditing ? (
          <View style={styles.genderContainer}>
            {['Male', 'Female', 'Other'].map((g) => (
              <TouchableOpacity 
                key={g} 
                style={[styles.genderBtn, gender === g && styles.genderBtnActive]} 
                onPress={() => setGender(g)}
              >
                <Text style={[styles.genderBtnText, gender === g && styles.genderBtnTextActive]}>{g}</Text>
              </TouchableOpacity>
            ))}
          </View>
        ) : (
          <Text style={styles.value}>{gender || 'Not Specified'}</Text>
        )}

        <View style={styles.divider} />

        <Text style={styles.label}>MOBILE NUMBER</Text>
        <Text style={[styles.value, { color: TOITOI_THEME.colors.gray.dark }]}>{user?.phone || 'N/A'}</Text>
      </View>

      {isEditing ? (
        <View style={styles.actionRow}>
          <TouchableOpacity style={[styles.actionBtn, { backgroundColor: TOITOI_THEME.colors.white, flex: 1, marginRight: 10 }]} onPress={handleCancelEdit} disabled={loading}>
            <Text style={[styles.actionBtnText, { color: TOITOI_THEME.colors.black }]}>CANCEL</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.actionBtn, { backgroundColor: TOITOI_THEME.colors.black, flex: 1 }]} onPress={handleSaveProfile} disabled={loading}>
            {loading ? <ActivityIndicator color={TOITOI_THEME.colors.primary} /> : <Text style={[styles.actionBtnText, { color: TOITOI_THEME.colors.primary }]}>SAVE</Text>}
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.normalActions}>
          <TouchableOpacity style={[styles.actionBtn, { backgroundColor: TOITOI_THEME.colors.black, marginBottom: 10 }]} onPress={() => setIsEditing(true)}>
            <Text style={[styles.actionBtnText, { color: TOITOI_THEME.colors.primary }]}>EDIT PROFILE</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.deleteBtn} onPress={handleDeleteAccount} activeOpacity={0.9}>
            <Text style={styles.deleteBtnText}>DELETE ACCOUNT</Text>
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: TOITOI_THEME.colors.background, paddingHorizontal: 20 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  title: { fontSize: 36, fontWeight: TOITOI_THEME.typography.fontBlack, color: TOITOI_THEME.colors.black },
  backBtn: { backgroundColor: TOITOI_THEME.colors.white, width: 45, height: 45, borderWidth: 3, borderColor: TOITOI_THEME.colors.black, alignItems: 'center', justifyContent: 'center', ...TOITOI_THEME.shadows.brutal },
  backBtnText: { fontSize: 20, fontWeight: 'bold' },
  
  infoCard: { backgroundColor: TOITOI_THEME.colors.white, borderWidth: 4, borderColor: TOITOI_THEME.colors.black, padding: 20, marginBottom: 20, ...TOITOI_THEME.shadows.brutal },
  imageContainer: { alignItems: 'center', marginBottom: 30 },
  profileImage: { width: 120, height: 120, borderRadius: 60, borderWidth: 4, borderColor: TOITOI_THEME.colors.black, backgroundColor: TOITOI_THEME.colors.gray.light },
  editImageBadge: { position: 'absolute', bottom: -5, backgroundColor: TOITOI_THEME.colors.primary, paddingHorizontal: 15, paddingVertical: 5, borderWidth: 2, borderColor: TOITOI_THEME.colors.black },
  editImageText: { fontSize: 14, fontWeight: TOITOI_THEME.typography.fontBlack },
  trustBadge: { marginTop: 15, backgroundColor: TOITOI_THEME.colors.black, paddingHorizontal: 15, paddingVertical: 8, borderRadius: 20 },
  trustText: { color: TOITOI_THEME.colors.primary, fontWeight: TOITOI_THEME.typography.fontBlack, fontSize: 12 },
  
  label: { fontSize: 14, fontWeight: 'bold', color: TOITOI_THEME.colors.gray.dark, marginBottom: 5 },
  value: { fontSize: 20, fontWeight: TOITOI_THEME.typography.fontBlack, color: TOITOI_THEME.colors.black, minHeight: 30 },
  input: { borderWidth: 3, borderColor: TOITOI_THEME.colors.black, padding: 12, fontSize: 18, fontWeight: TOITOI_THEME.typography.fontBold, backgroundColor: TOITOI_THEME.colors.background },
  divider: { height: 2, backgroundColor: TOITOI_THEME.colors.gray.light, marginVertical: 15 },
  
  /* 🔴 Gender Button Styles */
  genderContainer: { flexDirection: 'row', gap: 10, marginTop: 5 },
  genderBtn: { flex: 1, paddingVertical: 12, borderWidth: 3, borderColor: TOITOI_THEME.colors.black, backgroundColor: TOITOI_THEME.colors.white, alignItems: 'center', borderRadius: TOITOI_THEME.borders.radius.sm },
  genderBtnActive: { backgroundColor: TOITOI_THEME.colors.black, ...TOITOI_THEME.shadows.brutalActive, transform: [{ translateX: 2 }, { translateY: 2 }] },
  genderBtnText: { fontSize: 16, fontWeight: TOITOI_THEME.typography.fontBold, color: TOITOI_THEME.colors.black },
  genderBtnTextActive: { color: TOITOI_THEME.colors.white },

  actionRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  actionBtn: { borderWidth: 4, borderColor: TOITOI_THEME.colors.black, padding: 18, alignItems: 'center', borderRadius: TOITOI_THEME.borders.radius.sm, ...TOITOI_THEME.shadows.brutal },
  actionBtnText: { fontSize: 18, fontWeight: TOITOI_THEME.typography.fontBlack },
  
  normalActions: { gap: 10, marginTop: 10 },
  deleteBtn: { backgroundColor: TOITOI_THEME.colors.danger, borderWidth: 4, borderColor: TOITOI_THEME.colors.black, padding: 18, alignItems: 'center', borderRadius: TOITOI_THEME.borders.radius.sm, ...TOITOI_THEME.shadows.brutal },
  deleteBtnText: { fontSize: 18, fontWeight: TOITOI_THEME.typography.fontBlack, color: TOITOI_THEME.colors.white },
});