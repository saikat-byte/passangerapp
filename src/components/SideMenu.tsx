import React, { useEffect, useRef } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Modal, Animated, Dimensions, TouchableWithoutFeedback, ScrollView, Image } from "react-native";
import { useNavigation, CommonActions } from "@react-navigation/native";
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { TOITOI_THEME } from "../theme";
import { usePassengerAuthStore } from "../store/usePassengerAuthStore"; 

const { width, height } = Dimensions.get("window");
const MENU_WIDTH = width * 0.75; 
const API_BASE_URL = 'http://192.168.29.11:8000'; // Match with your IP

const getFullImageUrl = (imagePath: string | null) => {
  if (!imagePath) return null;
  if (imagePath.startsWith('http') || imagePath.startsWith('file://')) return imagePath;
  const cleanPath = imagePath.startsWith('/') ? imagePath.slice(1) : imagePath;
  return `${API_BASE_URL}/storage/${cleanPath}`;
};

export default function SideMenu({ isVisible, onClose }: { isVisible: boolean; onClose: () => void; }) {
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();
  const { user, logout } = usePassengerAuthStore(); 
  const slideAnim = useRef(new Animated.Value(-MENU_WIDTH)).current;

  useEffect(() => {
    Animated.timing(slideAnim, { toValue: isVisible ? 0 : -MENU_WIDTH, duration: 250, useNativeDriver: true }).start();
  }, [isVisible]);

  const handleNavigation = (routeName: string) => { onClose(); setTimeout(() => navigation.navigate(routeName), 200); };
  const handleLogout = async () => { onClose(); await logout(); navigation.dispatch(CommonActions.reset({ index: 0, routes: [{ name: "AuthStack" }] })); };

  if (!isVisible && slideAnim._value === -MENU_WIDTH) return null;

  const MenuItem = ({ icon, label, route, badge, isDanger = false }: any) => (
    <TouchableOpacity style={styles.menuItem} onPress={() => handleNavigation(route)} activeOpacity={0.7}>
      <View style={styles.menuItemLeft}>
        <View style={[styles.iconBox, isDanger && { backgroundColor: TOITOI_THEME.colors.danger + '20' }]}>
          <Text style={{ fontSize: 18 }}>{icon}</Text>
        </View>
        <Text style={[styles.menuText, isDanger && { color: TOITOI_THEME.colors.danger }]}>{label}</Text>
      </View>
      {badge ? <View style={styles.badge}><Text style={styles.badgeText}>{badge}</Text></View> : <Text style={styles.chevron}>›</Text>}
    </TouchableOpacity>
  );

  return (
    <Modal visible={isVisible} transparent animationType="none" onRequestClose={onClose}>
      <View style={styles.overlayContainer}>
        <TouchableWithoutFeedback onPress={onClose}>
          <Animated.View style={[styles.overlayBackground, { opacity: slideAnim.interpolate({ inputRange: [-MENU_WIDTH, 0], outputRange: [0, 1] }) }]} />
        </TouchableWithoutFeedback>

        <Animated.View style={[styles.menuContainer, { transform: [{ translateX: slideAnim }] }]}>
          <View style={[styles.header, { paddingTop: Math.max(insets.top, 20) }]}>
            <TouchableOpacity style={styles.profileSection} onPress={() => handleNavigation("Profile")} activeOpacity={0.8}>
              <View style={styles.avatar}>
                {/* 🔴 FIXED: Dynamic Image in Menu */}
                {user?.avatar ? (
                  <Image 
                    source={{ uri: getFullImageUrl(user.avatar) || undefined }} 
                    style={{ width: '100%', height: '100%', borderRadius: 30 }} 
                  />
                ) : (
                  <Text style={{fontSize: 32}}>👤</Text>
                )}
              </View>
              <View style={styles.profileInfo}>
                <Text style={styles.userNameText} numberOfLines={1}>{user?.name || "Guest User"}</Text>
                {user?.phone && <Text style={styles.userPhoneText}>{user.phone}</Text>}
              </View>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.scrollArea} showsVerticalScrollIndicator={false}>
            <View style={styles.section}>
              <MenuItem icon="💰" label="My Wallet" route="Wallet" />
              <MenuItem icon="📜" label="Ride History" route="RideHistoryScreen" />
              <MenuItem icon="📍" label="Saved Places" route="SavedPlaces" />
            </View>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>OFFERS</Text>
              <MenuItem icon="🎟️" label="TOITOI Pass" route="SubscriptionPassScreen" badge="NEW" />
              <MenuItem icon="🎁" label="Promos & Discounts" route="Promos" />
              <MenuItem icon="🤝" label="Refer & Earn" route="Referrals" />
            </View>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>SUPPORT</Text>
              <MenuItem icon="🚨" label="Safety & SOS" route="EmergencyContacts" isDanger={true} />
            </View>
          </ScrollView>
          <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 20) }]}>
            <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout} activeOpacity={0.6}>
              <Text style={styles.logoutIcon}>🚪</Text>
              <Text style={styles.logoutText}>Logout</Text>
            </TouchableOpacity>
            <Text style={styles.versionText}>v1.0.0</Text>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlayContainer: { flex: 1, flexDirection: "row" },
  overlayBackground: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(0,0,0,0.5)" },
  menuContainer: { width: MENU_WIDTH, height: '100%', backgroundColor: TOITOI_THEME.colors.white, borderTopRightRadius: 24, borderBottomRightRadius: 24, overflow: 'hidden', elevation: 20 },
  header: { backgroundColor: TOITOI_THEME.colors.primaryLight, paddingHorizontal: 20, paddingBottom: 25, borderBottomWidth: 1, borderColor: TOITOI_THEME.colors.gray.light },
  profileSection: { flexDirection: 'row', alignItems: 'center', marginTop: 10 },
  avatar: { width: 60, height: 60, borderRadius: 30, backgroundColor: TOITOI_THEME.colors.white, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: TOITOI_THEME.colors.black, overflow: 'hidden' }, // Added overflow: hidden here
  profileInfo: { flex: 1, marginLeft: 15 },
  userNameText: { fontSize: 20, fontWeight: TOITOI_THEME.typography.fontBlack, color: TOITOI_THEME.colors.black, marginBottom: 2 },
  userPhoneText: { fontSize: 13, fontWeight: TOITOI_THEME.typography.fontBold, color: TOITOI_THEME.colors.gray.dark },
  scrollArea: { flex: 1, paddingVertical: 10 },
  section: { borderBottomWidth: 1, borderColor: TOITOI_THEME.colors.gray.light, paddingBottom: 10, marginBottom: 10 },
  sectionTitle: { fontSize: 11, fontWeight: TOITOI_THEME.typography.fontBlack, color: TOITOI_THEME.colors.gray.medium, marginLeft: 20, marginBottom: 10, marginTop: 10, letterSpacing: 1 },
  menuItem: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingVertical: 12, paddingHorizontal: 20 },
  menuItemLeft: { flexDirection: "row", alignItems: "center" },
  iconBox: { width: 40, height: 40, borderRadius: 20, backgroundColor: TOITOI_THEME.colors.gray.light, alignItems: 'center', justifyContent: 'center', marginRight: 15 },
  menuText: { fontSize: 16, fontWeight: TOITOI_THEME.typography.fontBold, color: TOITOI_THEME.colors.black },
  chevron: { fontSize: 20, color: TOITOI_THEME.colors.gray.medium, fontWeight: '300' },
  badge: { backgroundColor: TOITOI_THEME.colors.danger, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 12 },
  badgeText: { color: TOITOI_THEME.colors.white, fontSize: 10, fontWeight: TOITOI_THEME.typography.fontBlack },
  footer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 15, borderTopWidth: 1, borderColor: TOITOI_THEME.colors.gray.light, backgroundColor: TOITOI_THEME.colors.white },
  logoutBtn: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10 },
  logoutIcon: { fontSize: 18, marginRight: 8 },
  logoutText: { fontSize: 16, fontWeight: TOITOI_THEME.typography.fontBlack, color: TOITOI_THEME.colors.gray.dark },
  versionText: { fontSize: 12, fontWeight: 'bold', color: TOITOI_THEME.colors.gray.medium }
});