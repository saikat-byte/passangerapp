import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withSpring, withTiming, runOnJS } from 'react-native-reanimated';
import { create } from 'zustand';
import { TOITOI_THEME } from '../theme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

// 🔴 Zustand Store for Toast (Call this from any API or Screen)
interface ToastState {
  isVisible: boolean;
  message: string;
  type: 'error' | 'success' | 'info';
  showToast: (message: string, type?: 'error' | 'success' | 'info') => void;
  hideToast: () => void;
}

export const useToastStore = create<ToastState>((set) => ({
  isVisible: false,
  message: '',
  type: 'info',
  showToast: (message, type = 'error') => set({ isVisible: true, message, type }),
  hideToast: () => set({ isVisible: false, message: '' }),
}));

// 🔴 The UI Component
export default function GlobalErrorToast() {
  const { isVisible, message, type, hideToast } = useToastStore();
  const insets = useSafeAreaInsets();
  const translateY = useSharedValue(-150); // Start hidden above screen

  useEffect(() => {
    if (isVisible) {
      translateY.value = withSpring(Math.max(insets.top, 20), { damping: 12, stiffness: 100 });
      
      // Auto hide after 3 seconds
      const timeout = setTimeout(() => {
        closeToast();
      }, 3000);
      return () => clearTimeout(timeout);
    } else {
      translateY.value = withTiming(-150, { duration: 300 });
    }
  }, [isVisible]);

  const closeToast = () => {
    translateY.value = withTiming(-150, { duration: 300 }, () => {
      runOnJS(hideToast)();
    });
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  const getColors = () => {
    switch (type) {
      case 'error': return { bg: TOITOI_THEME.colors.danger, text: TOITOI_THEME.colors.white };
      case 'success': return { bg: TOITOI_THEME.colors.success, text: TOITOI_THEME.colors.black };
      default: return { bg: TOITOI_THEME.colors.white, text: TOITOI_THEME.colors.black };
    }
  };

  return (
    <Animated.View style={[styles.container, animatedStyle]} pointerEvents={isVisible ? 'auto' : 'none'}>
      <TouchableOpacity activeOpacity={0.9} onPress={closeToast} style={[styles.toastBox, { backgroundColor: getColors().bg }]}>
        <View style={styles.iconBox}>
          <Text style={{fontSize: 20}}>{type === 'error' ? '⚠️' : type === 'success' ? '✅' : 'ℹ️'}</Text>
        </View>
        <Text style={[styles.message, { color: getColors().text }]}>{message}</Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute', top: 0, left: 0, right: 0, zIndex: 9999, alignItems: 'center', paddingHorizontal: 20,
  },
  toastBox: {
    width: width - 40, flexDirection: 'row', alignItems: 'center', padding: 15,
    borderWidth: 4, borderColor: TOITOI_THEME.colors.black,
    ...TOITOI_THEME.shadows.brutal, // Signature Neobrutalism shadow
  },
  iconBox: { marginRight: 15 },
  message: { flex: 1, fontSize: 16, fontWeight: TOITOI_THEME.typography.fontBlack, letterSpacing: 0.5 },
});