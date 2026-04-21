import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Easing, Alert, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { usePassengerRideStore } from '../../store/usePassengerRideStore';
import { RideAPI } from '../../services/api';
import { TOITOI_THEME } from '../../theme';

export default function RideMatchingScreen() {
  const navigation = useNavigation<any>();
  const { currentRide, disconnectSockets } = usePassengerRideStore(); 
  
  const [searchRadius, setSearchRadius] = useState(1);
  const [timeElapsed, setTimeElapsed] = useState(0);

  // 🔴 3 Waves for Industry Standard Radar Animation
  const wave1 = useRef(new Animated.Value(0)).current;
  const wave2 = useRef(new Animated.Value(0)).current;
  const wave3 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const createWave = (anim: Animated.Value, delay: number) => {
      return Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(anim, {
            toValue: 1,
            duration: 3000,
            easing: Easing.out(Easing.ease),
            useNativeDriver: true,
          })
        ])
      );
    };

    createWave(wave1, 0).start();
    createWave(wave2, 1000).start();
    createWave(wave3, 2000).start();

    // Cleanup
    return () => { wave1.stopAnimation(); wave2.stopAnimation(); wave3.stopAnimation(); };
  }, []);

  // 🔴 Wave Expansion Logic & Safety Timeout
  useEffect(() => {
    if (currentRide?.status === 'accepted') {
      navigation.replace('ActiveRideScreen'); 
      return;
    } 
    if (currentRide?.status === 'cancelled') {
      Alert.alert("Ride Cancelled", "No driver accepted the ride.");
      disconnectSockets();
      navigation.goBack();
      return;
    }

    const timer = setInterval(() => {
      setTimeElapsed((prev) => {
        const newTime = prev + 1;
        // 15 seconds -> 3km, 30 seconds -> 6km
        if (newTime === 15) setSearchRadius(3);
        if (newTime === 30) setSearchRadius(6);
        
        // 45 seconds -> Timeout (No driver found in 6km)
        if (newTime >= 45 && currentRide?.status === 'pending') {
          handleCancelSearch();
          Alert.alert("Time Out", "No TOITOI found nearby. Please try again.");
        }
        return newTime;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [currentRide?.status]);

  const handleCancelSearch = async () => {
    try {
      if (currentRide?.id) await RideAPI.cancelRide(currentRide.id, 'Passenger cancelled searching');
    } catch (e) { console.log('Cancel failed', e); }
    
    disconnectSockets();
    navigation.goBack();
  };

  const getWaveStyle = (anim: Animated.Value) => ({
    transform: [{ scale: anim.interpolate({ inputRange: [0, 1], outputRange: [1, 6] }) }],
    opacity: anim.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0.8, 0.3, 0] }),
  });

  return (
    <View style={styles.container}>
      <View style={styles.radarContainer}>
        <Animated.View style={[styles.wave, getWaveStyle(wave1)]} />
        <Animated.View style={[styles.wave, getWaveStyle(wave2)]} />
        <Animated.View style={[styles.wave, getWaveStyle(wave3)]} />
        <View style={styles.centerDot}><Text style={styles.emoji}>🛺</Text></View>
      </View>
      
      <View style={styles.textContainer}>
        <Text style={styles.title}>Finding your TOITOI...</Text>
        <Text style={styles.subtitle}>Searching within {searchRadius} km radius</Text>
        <Text style={styles.timerText}>00:{timeElapsed < 10 ? `0${timeElapsed}` : timeElapsed}</Text>
      </View>

      <TouchableOpacity style={styles.cancelBtn} onPress={handleCancelSearch} activeOpacity={0.8}>
        <Text style={styles.cancelBtnText}>CANCEL REQUEST</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: TOITOI_THEME.colors.primaryLight, justifyContent: 'space-between', alignItems: 'center', paddingVertical: 50 },
  radarContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 50 },
  wave: { position: 'absolute', width: 60, height: 60, borderRadius: 30, backgroundColor: TOITOI_THEME.colors.primary, borderWidth: 2, borderColor: TOITOI_THEME.colors.black },
  centerDot: { width: 80, height: 80, borderRadius: 40, backgroundColor: TOITOI_THEME.colors.black, justifyContent: 'center', alignItems: 'center', zIndex: 10, ...TOITOI_THEME.shadows.brutal },
  emoji: { fontSize: 40 },
  textContainer: { alignItems: 'center', marginBottom: 40 },
  title: { fontSize: 28, fontWeight: TOITOI_THEME.typography.fontBlack as any, color: TOITOI_THEME.colors.black },
  subtitle: { fontSize: 18, fontWeight: TOITOI_THEME.typography.fontBold as any, color: TOITOI_THEME.colors.gray.dark, marginTop: 10 },
  timerText: { fontSize: 22, fontWeight: TOITOI_THEME.typography.fontBlack as any, color: TOITOI_THEME.colors.danger, marginTop: 15 },
  cancelBtn: { backgroundColor: TOITOI_THEME.colors.white, paddingVertical: 18, paddingHorizontal: 40, borderRadius: TOITOI_THEME.borders.radius.md, borderWidth: TOITOI_THEME.borders.thick, borderColor: TOITOI_THEME.colors.black, ...TOITOI_THEME.shadows.brutal, marginBottom: 20 },
  cancelBtnText: { fontSize: 18, fontWeight: TOITOI_THEME.typography.fontBlack as any, color: TOITOI_THEME.colors.danger }
});