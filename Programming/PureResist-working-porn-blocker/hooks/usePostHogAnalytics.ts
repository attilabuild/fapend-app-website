import { usePostHog } from 'posthog-react-native';
import { useEffect } from 'react';
import { useAuthStore } from './useStore';

export const usePostHogAnalytics = () => {
  const posthog = usePostHog();
  const { user } = useAuthStore();

  useEffect(() => {
    if (user?.id) {
      // Identify user when they log in
      posthog?.identify(user.id, {
        email: user.email,
        username: user.username,
        // Add any other user properties you want to track
      });
    }
  }, [user, posthog]);

  const trackEvent = (eventName: string, properties?: Record<string, any>) => {
    posthog?.capture(eventName, properties);
  };

  const trackScreen = (screenName: string, properties?: Record<string, any>) => {
    posthog?.screen(screenName, properties);
  };

  return {
    trackEvent,
    trackScreen,
  };
}; 