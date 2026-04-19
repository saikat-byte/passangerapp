import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Localization from 'expo-localization';

import en from './en.json';
import bn from './bn.json';
import hi from './hi.json';

const initI18n = async () => {
  try {
    const savedLanguage = await AsyncStorage.getItem('user_language');
    const deviceLanguage = Localization.getLocales()[0]?.languageCode || 'en';

    i18n.use(initReactI18next).init({
      resources: {
        en: { translation: en },
        bn: { translation: bn },
        hi: { translation: hi },
      },
      lng: savedLanguage || deviceLanguage, 
      fallbackLng: 'en',
      interpolation: { escapeValue: false }
    });
  } catch (error) {
    console.error('Error initializing i18n:', error);
  }
};

initI18n();

export default i18n;