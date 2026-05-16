import { router } from "expo-router";
import { useEffect, useRef } from "react";
import { Image, Text, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

import { useApp } from "@/lib/store";

const MIN_SPLASH_MS = 900;

export default function SplashScreen() {
  const opacity = useSharedValue(0);
  const {
    authReady,
    isAuthenticated,
    hydrated,
    onboardingCompleted,
    onboardingStep,
    isPro,
  } = useApp();
  const startedAt = useRef(Date.now());
  const routed = useRef(false);

  useEffect(() => {
    opacity.value = withTiming(1, { duration: 300 });
  }, [opacity]);

  useEffect(() => {
    if (routed.current) return;
    if (!authReady) return;
    if (isAuthenticated && !hydrated) return;

    const elapsed = Date.now() - startedAt.current;
    const remaining = Math.max(0, MIN_SPLASH_MS - elapsed);
    const t = setTimeout(() => {
      routed.current = true;
      opacity.value = withTiming(0, { duration: 250 });
      setTimeout(() => {
        if (!isAuthenticated) {
          router.replace("/welcome");
          return;
        }
        if (!onboardingCompleted) {
          const step = Math.max(1, Math.min(10, onboardingStep || 1));
          router.replace(`/onboarding/${step}` as never);
          return;
        }
        // Hard paywall: onboarding is one-time, after that subscription is
        // required to use the app. Users who finished onboarding go straight
        // to the paywall on every cold start until they subscribe.
        if (!isPro) {
          router.replace("/paywall?gate=1");
          return;
        }
        router.replace("/(tabs)/explore");
      }, 230);
    }, remaining);
    return () => clearTimeout(t);
  }, [
    authReady,
    isAuthenticated,
    hydrated,
    onboardingCompleted,
    onboardingStep,
    isPro,
    opacity,
  ]);

  const style = useAnimatedStyle(() => ({ opacity: opacity.value }));

  return (
    <View className="flex-1 items-center justify-center bg-bg">
      <Animated.View style={style} className="items-center">
        <Image
          source={require("@/assets/images/iconlogo.png")}
          style={{ width: 160, height: 160 }}
          resizeMode="contain"
        />
        <Text className="text-ink-muted mt-4 text-sm">
          Match any guitar tone.
        </Text>
      </Animated.View>
    </View>
  );
}
