import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Share, Modal, StyleSheet } from 'react-native';
import { SafetyAPI } from '../services/api'; // Assuming you have this exported in api.ts
import { usePassengerRideStore } from '../store/usePassengerRideStore';
import { TOITOI_THEME } from '../theme';

export default function SafetyDashboard() {
  const { currentRide } = usePassengerRideStore(); // Fixed import & variable name
  const [isExpanded, setIsExpanded] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (countdown !== null && countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    } else if (countdown === 0) {
      triggerSOSAPI();
      setCountdown(null);
      setIsExpanded(false);
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  const handleShareLiveTrip = async () => {
    if (!currentRide?.share_tracking_token) return;
    try {
      await Share.share({
        message: `Track my TOITOI ride live! https://dial.guskara.com/track/${currentRide.share_tracking_token}`,
      });
    } catch (error) {
      console.error("Share error:", error);
    }
  };

  const initiateSOS = () => setCountdown(5);
  const cancelSOS = () => setCountdown(null);

  const triggerSOSAPI = async () => {
    try {
      if (!currentRide) return;
      await SafetyAPI.triggerSos({
        ride_id: currentRide.id.toString(),
        latitude: currentRide.pickup_lat,
        longitude: currentRide.pickup_lng,
        reason: 'Emergency SOS Triggered',
      });
    } catch (error) {
      console.error("SOS Trigger Failed", error);
    }
  };

  return (
    <View style={styles.container}>
      {!isExpanded && (
        <TouchableOpacity onPress={() => setIsExpanded(true)} style={styles.shieldBtn}>
          <Text style={styles.shieldText}>🛡️</Text>
        </TouchableOpacity>
      )}

      <Modal visible={isExpanded} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.bottomSheet}>
            <View style={styles.headerRow}>
              <Text style={styles.title}>SAFETY CENTER</Text>
              <TouchableOpacity onPress={() => setIsExpanded(false)}>
                <Text style={styles.closeText}>✕ CLOSE</Text>
              </TouchableOpacity>
            </View>

            {countdown !== null ? (
              <View style={styles.sosCountdownBox}>
                <Text style={styles.sosCountdownLabel}>TRIGGERING SOS IN</Text>
                <Text style={styles.sosCountdownNumber}>{countdown}</Text>
                <TouchableOpacity onPress={cancelSOS} style={styles.cancelSosBtn}>
                  <Text style={styles.cancelSosText}>CANCEL SOS</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.actionContainer}>
                <TouchableOpacity onPress={handleShareLiveTrip} style={styles.shareBtn}>
                  <Text style={styles.shareText}>📡 SHARE LIVE TRIP</Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={initiateSOS} style={styles.sosBtn}>
                  <Text style={styles.sosText}>🚨 SOS EMERGENCY</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { position: 'absolute', bottom: 40, right: 16, zIndex: 50 },
  shieldBtn: { backgroundColor: TOITOI_THEME.colors.primary, width: 64, height: 64, borderRadius: 32, borderWidth: TOITOI_THEME.borders.thick, borderColor: TOITOI_THEME.colors.black, alignItems: 'center', justifyContent: 'center', ...TOITOI_THEME.shadows.brutal },
  shieldText: { fontSize: 24, fontWeight: TOITOI_THEME.typography.fontBlack },
  modalOverlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.5)' },
  bottomSheet: { backgroundColor: TOITOI_THEME.colors.white, padding: 24, borderTopWidth: TOITOI_THEME.borders.thick, borderColor: TOITOI_THEME.colors.black, paddingBottom: 40 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  title: { fontSize: 24, fontWeight: TOITOI_THEME.typography.fontBlack, color: TOITOI_THEME.colors.black },
  closeText: { fontSize: 18, fontWeight: TOITOI_THEME.typography.fontBold, color: TOITOI_THEME.colors.black },
  sosCountdownBox: { backgroundColor: TOITOI_THEME.colors.danger, borderWidth: TOITOI_THEME.borders.thick, borderColor: TOITOI_THEME.colors.black, padding: 24, alignItems: 'center', ...TOITOI_THEME.shadows.brutal },
  sosCountdownLabel: { color: TOITOI_THEME.colors.white, fontWeight: TOITOI_THEME.typography.fontBlack, fontSize: 20, marginBottom: 8 },
  sosCountdownNumber: { color: TOITOI_THEME.colors.white, fontWeight: TOITOI_THEME.typography.fontBlack, fontSize: 64, marginBottom: 24 },
  cancelSosBtn: { backgroundColor: TOITOI_THEME.colors.white, borderWidth: TOITOI_THEME.borders.thick, borderColor: TOITOI_THEME.colors.black, paddingVertical: 16, width: '100%', alignItems: 'center', ...TOITOI_THEME.shadows.brutal },
  cancelSosText: { color: TOITOI_THEME.colors.black, fontWeight: TOITOI_THEME.typography.fontBlack, fontSize: 20 },
  actionContainer: { gap: 16 },
  shareBtn: { backgroundColor: TOITOI_THEME.colors.primary, borderWidth: TOITOI_THEME.borders.thick, borderColor: TOITOI_THEME.colors.black, paddingVertical: 16, alignItems: 'center', ...TOITOI_THEME.shadows.brutal },
  shareText: { color: TOITOI_THEME.colors.black, fontWeight: TOITOI_THEME.typography.fontBlack, fontSize: 18 },
  sosBtn: { backgroundColor: TOITOI_THEME.colors.danger, borderWidth: TOITOI_THEME.borders.thick, borderColor: TOITOI_THEME.colors.black, paddingVertical: 16, alignItems: 'center', ...TOITOI_THEME.shadows.brutal, marginTop: 15 },
  sosText: { color: TOITOI_THEME.colors.white, fontWeight: TOITOI_THEME.typography.fontBlack, fontSize: 18 },
});