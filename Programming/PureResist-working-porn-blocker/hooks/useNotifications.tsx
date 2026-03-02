import { createContext, useContext } from "react";

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
  return (
    <NotificationContext.Provider value={{
      scheduleEveningQuoteNotification: async () => {},
      scheduleCheckInNotification: async () => {},
      sendWelcomeNotification: async () => {},
      sendAchievementNotification: async () => {},
      hasNotificationsPermission: false,
      requestNotificationsPermission: async () => {},
      declineNotificationsPermission: async () => {},
    }}>
      {children}
    </NotificationContext.Provider>
  );
};

const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error("useNotifications must be used within a NotificationProvider");
  }
  return context;
};

export default useNotifications;
