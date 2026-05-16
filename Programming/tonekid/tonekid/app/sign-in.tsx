import { useState } from 'react';
import { Alert, Pressable, ScrollView, Text, View } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft } from 'lucide-react-native';

import { AppleLogo } from '@/components/brand';
import { Button, TextField } from '@/components/ui';
import { colors } from '@/constants/tokens';
import { useApp } from '@/lib/store';

export default function SignInScreen() {
  const { signInWithEmail, signInWithApple } = useApp();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);

  const onSubmit = async () => {
    if (busy) return;
    if (!email.trim() || !password) {
      Alert.alert('Sign in', 'Please enter your email and password.');
      return;
    }
    setBusy(true);
    const result = await signInWithEmail(email.trim(), password);
    setBusy(false);
    if (!result.ok) {
      Alert.alert('Could not sign in', result.error);
      return;
    }
    router.replace('/');
  };

  const onApple = async () => {
    if (busy) return;
    setBusy(true);
    const result = await signInWithApple();
    setBusy(false);
    if (!result.ok) {
      if (result.error !== 'cancelled') Alert.alert('Apple Sign In', result.error);
      return;
    }
    router.replace('/');
  };

  return (
    <SafeAreaView className="flex-1 bg-bg" edges={['top']}>
      <ScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 32 }}>
        <View className="pt-2">
          <Pressable onPress={() => router.back()} hitSlop={12} className="p-1">
            <ChevronLeft size={26} color={colors.ink} />
          </Pressable>
        </View>
        <Text className="text-ink mt-6 text-center text-[28px] font-extrabold tracking-tight">
          Welcome back
        </Text>
        <View className="mt-8 gap-3">
          <TextField
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <TextField
            placeholder="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
        </View>
        <View className="mt-5">
          <Button label={busy ? 'Signing in…' : 'Sign In'} onPress={onSubmit} disabled={busy} fullWidth />
        </View>
        <View className="mt-3 items-end">
          <Pressable onPress={() => router.push('/forgot-password')} hitSlop={8}>
            <Text className="text-ink-muted text-sm underline">Forgot password?</Text>
          </Pressable>
        </View>
        <View className="mt-7 flex-row items-center">
          <View className="bg-hairline h-px flex-1" />
          <Text className="text-ink-muted mx-3 text-sm">Or continue with</Text>
          <View className="bg-hairline h-px flex-1" />
        </View>
        <View className="mt-5">
          <Button
            label="Continue with Apple"
            variant="primary"
            onPress={onApple}
            disabled={busy}
            leftIcon={<AppleLogo size={18} color="#fff" />}
            fullWidth
          />
        </View>
        <View className="mt-6 flex-row justify-center">
          <Text className="text-ink-muted text-sm">Don't have an account? </Text>
          <Pressable onPress={() => router.replace('/sign-up')} hitSlop={8}>
            <Text className="text-ink text-sm font-semibold underline">Sign Up</Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
