import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { TOITOI_THEME } from '../../theme';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTranslation } from 'react-i18next';

const LANGUAGES = [
  { code: 'en', label: 'English', icon: '🇺🇸' },
  { code: 'bn', label: 'বাংলা', icon: '🇮🇳' },
  { code: 'hi', label: 'हिन्दी', icon: '🇮🇳' },
];

export default function LanguageSelectionScreen() {
  const navigation = useNavigation<any>();
  const [selected, setSelected] = useState('en');
  const { i18n } = useTranslation();

  const handleContinue = async () => {
    await AsyncStorage.setItem('user_language', selected);
    i18n.changeLanguage(selected);
    navigation.navigate('Login'); // Proceed to login
  };

  return (
    <View style={styles.container}>
      <Text style={styles.emoji}>🌍</Text>
      <Text style={styles.title}>Choose Language</Text>
      <Text style={styles.subtitle}>You can change this later in settings.</Text>

      <View style={styles.languageList}>
        {LANGUAGES.map((lang) => (
          <TouchableOpacity
            key={lang.code}
            activeOpacity={0.8}
            onPress={() => setSelected(lang.code)}
            style={[
              styles.langCard,
              selected === lang.code && styles.langCardActive,
            ]}
          >
            <Text style={styles.langIcon}>{lang.icon}</Text>
            <Text style={styles.langLabel}>{lang.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity style={styles.button} activeOpacity={0.8} onPress={handleContinue}>
        <Text style={styles.buttonText}>CONTINUE</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: TOITOI_THEME.colors.background, padding: 20, justifyContent: 'center' },
  emoji: { fontSize: 60, marginBottom: 20 },
  title: { fontSize: 40, fontWeight: TOITOI_THEME.typography.fontBlack, color: TOITOI_THEME.colors.black, marginBottom: 5 },
  subtitle: { fontSize: 18, fontWeight: TOITOI_THEME.typography.fontBold, color: TOITOI_THEME.colors.gray.text, marginBottom: 40 },
  languageList: { gap: 15, marginBottom: 40 },
  langCard: { flexDirection: 'row', alignItems: 'center', padding: 20, backgroundColor: TOITOI_THEME.colors.white, borderWidth: TOITOI_THEME.borders.thick, borderColor: TOITOI_THEME.colors.black, borderRadius: TOITOI_THEME.borders.radius.sm, ...TOITOI_THEME.shadows.brutal },
  langCardActive: { backgroundColor: TOITOI_THEME.colors.primaryLight, borderColor: TOITOI_THEME.colors.primary, transform: [{ translateX: 2 }, { translateY: 2 }], ...TOITOI_THEME.shadows.brutalActive },
  langIcon: { fontSize: 24, marginRight: 15 },
  langLabel: { fontSize: 20, fontWeight: TOITOI_THEME.typography.fontBlack, color: TOITOI_THEME.colors.black },
  button: { backgroundColor: TOITOI_THEME.colors.primary, padding: 20, borderWidth: TOITOI_THEME.borders.thick, borderColor: TOITOI_THEME.colors.black, borderRadius: TOITOI_THEME.borders.radius.sm, alignItems: 'center', ...TOITOI_THEME.shadows.brutal },
  buttonText: { fontSize: 20, fontWeight: TOITOI_THEME.typography.fontBlack, color: TOITOI_THEME.colors.black },
});