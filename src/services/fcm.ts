import messaging from '@react-native-firebase/messaging';
import { Platform } from 'react-native';

// 1. Request Permission (Mainly for iOS & Android 13+)
export async function requestUserPermission() {
  if (Platform.OS === 'ios') {
    const authStatus = await messaging().requestPermission();
    return (
      authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
      authStatus === messaging.AuthorizationStatus.PROVISIONAL
    );
  }
  // For Android, standard permission is usually handled in manifest or via PermissionsAndroid
  return true; 
}

// 2. Get the unique Device Token to save in your `user_devices` DB
export async function getFCMToken() {
  try {
    if (!messaging().isDeviceRegisteredForRemoteMessages) {
      await messaging().registerDeviceForRemoteMessages();
    }
    const token = await messaging().getToken();
    console.log("🔥 FCM Token:", token);
    return token;
  } catch (error) {
    console.log("❌ FCM Token Error:", error);
    return null;
  }
}

// 3. Listen to notifications when the app is OPEN (Foreground)
export function setupPushNotifications() {
  const unsubscribe = messaging().onMessage(async remoteMessage => {
    console.log('🔔 A new FCM message arrived in foreground!', remoteMessage);
    
    // Ekhane amra amader notun GlobalErrorToast ba local Alert use korte pari
    if(remoteMessage.notification) {
       // useToastStore.getState().showToast(remoteMessage.notification.title, 'success');
    }
  });

  return unsubscribe;
}