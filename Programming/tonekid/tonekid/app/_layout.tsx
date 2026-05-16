import '../global.css';

import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import * as Notifications from 'expo-notifications';

import { RevenueCatProvider } from '@/lib/revenuecat';
import { AppProvider } from '@/lib/store';

// Show trial-end / billing reminders even when the app is in the foreground.
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <RevenueCatProvider>
          <AppProvider>
            <Stack
              screenOptions={{ headerShown: false, contentStyle: { backgroundColor: '#FFFFFF' } }}>
              <Stack.Screen name="index" />
              <Stack.Screen name="welcome" />
              <Stack.Screen name="onboarding/[step]" options={{ animation: 'slide_from_right' }} />
              <Stack.Screen name="sign-up" />
              <Stack.Screen name="sign-in" />
              <Stack.Screen name="forgot-password" />
              <Stack.Screen name="(tabs)" />
              <Stack.Screen name="song/[id]" options={{ animation: 'slide_from_right' }} />
              <Stack.Screen name="tone/[id]" options={{ animation: 'slide_from_right' }} />
              <Stack.Screen name="settings/[kind]" options={{ animation: 'slide_from_right' }} />
              <Stack.Screen name="add-gear" options={{ presentation: 'modal' }} />
              <Stack.Screen
                name="confirm-gear"
                options={{
                  presentation: 'modal',
                  contentStyle: { backgroundColor: '#FFFFFF' },
                }}
              />
              <Stack.Screen name="paywall" options={{ gestureEnabled: false }} />
            </Stack>
            <StatusBar style="dark" />
          </AppProvider>
        </RevenueCatProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
