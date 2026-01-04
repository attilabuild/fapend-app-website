import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import { updatePushToken } from '../api/auth';

// Safely get project ID from Constants (lazy loading to avoid native module errors)
function getProjectId(): string | undefined {
  try {
    const Constants = require('expo-constants');
    return Constants?.expoConfig?.extra?.eas?.projectId;
  } catch (e) {
    // Constants not available
    return undefined;
  }
}

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export const registerForPushNotifications = async (): Promise<string | null> => {
  if (!Device.isDevice) {
    console.log('Push notifications only work on physical devices');
    return null;
  }

  try {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      console.log('Failed to get push token for push notification!');
      return null;
    }

    const projectId = getProjectId();
    const token = (await Notifications.getExpoPushTokenAsync({ projectId })).data;
    
    return token;
  } catch (error) {
    console.error('Error getting push token:', error);
    return null;
  }
};

export const scheduleDailyNotification = async (userId: string): Promise<void> => {
  // Cancel existing notifications
  await Notifications.cancelAllScheduledNotificationsAsync();
  
  // Generate random time for tomorrow (between 9 AM and 11 PM)
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const hour = Math.floor(Math.random() * (23 - 9) + 9);
  const minute = Math.floor(Math.random() * 60);
  tomorrow.setHours(hour, minute, 0, 0);
  
  await Notifications.scheduleNotificationAsync({
    content: {
      title: '⏰ Time to BeReal.',
      body: 'Post your moment now!',
      sound: true,
      priority: Notifications.AndroidNotificationPriority.HIGH,
    },
    trigger: {
      type: 'date' as const,
      date: tomorrow,
    },
  });
  
  console.log(`Daily notification scheduled for: ${tomorrow}`);
};

export const sendLocalNotification = async (title: string, body: string): Promise<void> => {
  await Notifications.scheduleNotificationAsync({
    content: {
      title,
      body,
      sound: true,
    },
    trigger: null, // Send immediately
  });
};

export const setupNotificationListeners = (
  onNotificationReceived: (notification: Notifications.Notification) => void,
  onNotificationTapped: (response: Notifications.NotificationResponse) => void
) => {
  // Listener for when notification is received while app is foregrounded
  const receivedSubscription = Notifications.addNotificationReceivedListener(onNotificationReceived);
  
  // Listener for when user taps on notification
  const responseSubscription = Notifications.addNotificationResponseReceivedListener(onNotificationTapped);
  
  return () => {
    receivedSubscription.remove();
    responseSubscription.remove();
  };
};

