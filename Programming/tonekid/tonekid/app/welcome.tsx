import { useState } from 'react';
import { Alert, ImageBackground, Pressable, Text, View } from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Mail } from 'lucide-react-native';

import { AppleLogo } from '@/components/brand';
import { Button } from '@/components/ui';
import { useApp } from '@/lib/store';

export default function WelcomeScreen() {
  const { signInWithApple } = useApp();
  const [busy, setBusy] = useState(false);

  const continueWithApple = async () => {
    if (busy) return;
    setBusy(true);
    const result = await signInWithApple();
    setBusy(false);
    if (!result.ok) {
      if (result.error !== 'cancelled') Alert.alert('Apple Sign In', result.error);
      return;
    }
    // Route through splash so we pick the right next screen based on profile state.
    router.replace('/');
  };

  return (
    <ImageBackground
      source={require('@/assets/images/bgwelcome.jpeg')}
      resizeMode="cover"
      className="flex-1">
      <LinearGradient
        colors={['transparent', '#FFFFFF']}
        locations={[0.1, 0.65]}
        style={{ position: 'absolute', left: 0, right: 0, top: 0, bottom: 0 }}
      />
      <SafeAreaView className="flex-1" edges={['top', 'bottom']}>
        <View className="flex-1 px-6 pb-8 pt-4">
          <View className="flex-1" />
          <View>
            <Text className="text-ink text-[36px] font-extrabold leading-tight tracking-tight">
              Match Any{'\n'}Guitar Tone.
            </Text>
            <Text className="text-ink-secondary mt-3 text-base leading-snug">
              Transform legendary tones to your exact gear in seconds.
            </Text>
            <View className="mt-7 gap-3">
              <Button
                label={busy ? 'Signing in…' : 'Continue with Apple'}
                variant="primary"
                onPress={continueWithApple}
                disabled={busy}
                leftIcon={<AppleLogo size={18} color="#fff" />}
                fullWidth
              />
              <Button
                label="Sign up with email"
                variant="secondary"
                onPress={() => router.push('/sign-up')}
                leftIcon={<Mail size={18} color="#0A0A0A" />}
                fullWidth
              />
            </View>
            <View className="mt-5 flex-row items-center justify-center gap-3">
              <Pressable
                onPress={() => router.push('/settings/terms')}
                hitSlop={8}>
                <Text className="text-ink-muted text-xs underline">Terms of Use</Text>
              </Pressable>
              <Text className="text-ink-muted text-xs">·</Text>
              <Pressable
                onPress={() => router.push('/settings/privacy')}
                hitSlop={8}>
                <Text className="text-ink-muted text-xs underline">Privacy Policy</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </SafeAreaView>
    </ImageBackground>
  );
}
