import { useEffect } from 'react';
import { router, Tabs } from 'expo-router';

import { TabBar } from '@/components/ui';
import { useApp } from '@/lib/store';

export default function TabLayout() {
  const { authReady, hydrated, isAuthenticated, onboardingCompleted, isPro } = useApp();

  // Hard gate: tabs are reachable only when signed in, onboarded, and subscribed.
  // Wait for BOTH authReady (Supabase session restored) and hydrated (local
  // cache settled) before redirecting — otherwise on a hard reload that lands
  // directly on a tab route, we briefly see session=null and kick the user to
  // /welcome even though they're actually signed in.
  useEffect(() => {
    if (!authReady || !hydrated) return;
    if (!isAuthenticated) {
      router.replace('/welcome');
    } else if (!onboardingCompleted) {
      router.replace('/onboarding/1');
    } else if (!isPro) {
      router.replace('/paywall?gate=1');
    }
  }, [authReady, hydrated, isAuthenticated, onboardingCompleted, isPro]);

  return (
    <Tabs
      tabBar={(props) => <TabBar {...props} />}
      screenOptions={{ headerShown: false }}
      initialRouteName="explore">
      <Tabs.Screen name="explore" />
      <Tabs.Screen name="my-tones" />
      <Tabs.Screen name="adapt" />
      <Tabs.Screen name="my-gear" />
      <Tabs.Screen name="profile" />
    </Tabs>
  );
}
