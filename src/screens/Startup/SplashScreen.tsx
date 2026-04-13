import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function SplashScreen() {
  return (
    <View style={styles.container}>
      {/* Neubrutalist Logo/Text Box */}
      <View style={styles.logoBox}>
        <Text style={styles.logoText}>TOITOI</Text>
      </View>
      <Text style={styles.tagline}>Passenger App</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FACC15', // Primary Taxi Yellow
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoBox: {
    backgroundColor: '#FFF',
    borderWidth: 6,
    borderColor: '#000',
    paddingVertical: 20,
    paddingHorizontal: 40,
    shadowOffset: { width: 8, height: 8 },
    shadowOpacity: 1,
    shadowColor: '#000',
    marginBottom: 20,
  },
  logoText: {
    fontSize: 48,
    fontWeight: '900',
    color: '#000',
    letterSpacing: 2,
  },
  tagline: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
    textTransform: 'uppercase',
  },
});