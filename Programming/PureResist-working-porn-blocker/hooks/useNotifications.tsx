import { createContext, useContext, useEffect, useState } from "react";
import * as Notifications from "expo-notifications";
import { useAuthStore } from "./useStore";
import { getRandomQuote } from "utils/motivationalQuotes";
import { AppState, Linking, Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface NotificationContextType {
  scheduleEveningQuoteNotification: () => Promise<void>;
  scheduleCheckInNotification: (checkInTime: Date) => Promise<void>;
  sendWelcomeNotification: () => Promise<void>;
  sendAchievementNotification: (title: string, description: string) => Promise<void>;
  hasNotificationsPermission: boolean;
  requestNotificationsPermission: () => Promise<void>;
  declineNotificationsPermission: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType>({
  scheduleEveningQuoteNotification: async () => {},
  scheduleCheckInNotification: async () => {},
  sendWelcomeNotification: async () => {},
  sendAchievementNotification: async () => {},
  hasNotificationsPermission: false,
  requestNotificationsPermission: async () => {},
  declineNotificationsPermission: async () => {},
});

export const NotificationProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const { user } = useAuthStore();
  const [hasNotificationsPermission, setHasNotificationsPermission] =
    useState(false);

  const checkPermissions = async () => {
    const { status } = await Notifications.getPermissionsAsync();
    setHasNotificationsPermission(status === "granted");
  };

  const requestNotificationsPermission = async () => {
    const { status } = await Notifications.requestPermissionsAsync();
    if (status === "granted") {
      setHasNotificationsPermission(true);
    } else {
      Linking.openSettings();
    }
  };
  const declineNotificationsPermission = async () => {
    Linking.openSettings();
  };

  const scheduleEveningQuoteNotification = async () => {
    if (!user) return;

    const notification = await Notifications.scheduleNotificationAsync({
      content: {
        title: "🌙 Evening Motivation",
        body: getRandomQuote(),
        sound: true,
        ...(Platform.OS === "android" && { channelId: "default" }),
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
        hour: 21,
        minute: 0,
      },
    });

    if (notification) {
      const previousNotification = await AsyncStorage.getItem(
        "evening-quote-notification",
      );

      if (previousNotification) {
        await Notifications.cancelScheduledNotificationAsync(
          previousNotification,
        );
      }
      AsyncStorage.setItem("evening-quote-notification", notification);
    }
  };

  const getAllScheduledNotifications = async () => {
    const scheduledNotifications =
      await Notifications.getAllScheduledNotificationsAsync();

    const eveningQuoteNotification = await AsyncStorage.getItem(
      "evening-quote-notification",
    );
    const checkInNotification = await AsyncStorage.getItem(
      "check-in-notification",
    );

    scheduledNotifications
      .filter(
        (notification) =>
          notification.identifier !== eveningQuoteNotification &&
          notification.identifier !== checkInNotification,
      )
      .forEach(async (notification) => {
        await Notifications.cancelScheduledNotificationAsync(
          notification.identifier,
        );
      });
  };

  const scheduleCheckInNotification = async (checkInTime: Date) => {
    if (!user) return;

    const notification = await Notifications.scheduleNotificationAsync({
      content: {
        title: "✅ Check-in Available!",
        body: "Your daily check-in is now available. Keep your streak going strong!",
        sound: true,
        ...(Platform.OS === "android" && { channelId: "default" }),
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
        hour: checkInTime.getHours(),
        minute: checkInTime.getMinutes(),
      },
    });

    if (notification) {
      const previousNotification = await AsyncStorage.getItem(
        "check-in-notification",
      );

      if (previousNotification) {
        await Notifications.cancelScheduledNotificationAsync(
          previousNotification,
        );
      }
      AsyncStorage.setItem("check-in-notification", notification);
    }
  };

  const sendWelcomeNotification = async () => {
    if (!user) return;

    await Notifications.scheduleNotificationAsync({
      content: {
        title: "🚀 Journey Started!",
        body: "Let's start your journey towards a better life. We're here to support you every step of the way.",
        sound: true,
        ...(Platform.OS === "android" && { channelId: "default" }),
      },
      // Using null trigger will send immediately
      trigger: null,
    });
  };

  const sendAchievementNotification = async (title: string, description: string) => {
    if (!user) return;

    await Notifications.scheduleNotificationAsync({
      content: {
        title: "🏆 Achievement Unlocked!",
        body: `${title} - ${description}`,
        sound: true,
        ...(Platform.OS === "android" && { channelId: "default" }),
      },
      trigger: null,
    });
  };

  useEffect(() => {
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldPlaySound: true,
        shouldSetBadge: true,
        shouldShowBanner: true,
        shouldShowList: true,
      }),
    });

    getAllScheduledNotifications();
    scheduleEveningQuoteNotification();
  }, []);

  useEffect(() => {
    const subscription = AppState.addEventListener("change", (nextAppState) => {
      if (nextAppState === "active") {
        checkPermissions(); // Re-check when app comes to foreground
      }
    });

    return () => {
      subscription.remove(); // Clean up
    };
  }, []);

  return (
    <NotificationContext.Provider
      value={{
        scheduleEveningQuoteNotification,
        scheduleCheckInNotification,
        sendWelcomeNotification,
        sendAchievementNotification,
        hasNotificationsPermission,
        requestNotificationsPermission,
        declineNotificationsPermission,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error("useRevenueCat must be used within a RevenueCatProvider");
  }
  return context;
};

export default useNotifications;
