import { useState } from 'react';
import { Alert, Pressable, ScrollView, Text, View } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft } from 'lucide-react-native';

import { Button, TextField } from '@/components/ui';
import { colors } from '@/constants/tokens';
import { useApp } from '@/lib/store';

export default function ForgotPasswordScreen() {
  const { sendPasswordReset } = useApp();
  const [email, setEmail] = useState('');
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);

  const onSubmit = async () => {
    if (busy) return;
    const trimmed = email.trim();
    if (!trimmed) {
      Alert.alert('Reset password', 'Enter the email you signed up with.');
      return;
    }
    setBusy(true);
    const result = await sendPasswordReset(trimmed);
    setBusy(false);
    if (!result.ok) {
      Alert.alert('Could not send reset email', result.error);
      return;
    }
    setSent(true);
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
          Reset your password
        </Text>
        <Text className="text-ink-secondary mt-3 text-center text-sm leading-snug">
          Enter your email and we&apos;ll send you a link to set a new password.
        </Text>

        {sent ? (
          <View className="bg-surface mt-8 rounded-2xl p-5">
            <Text className="text-ink text-base font-bold">Check your inbox</Text>
            <Text className="text-ink-secondary mt-2 text-sm leading-snug">
              We sent a reset link to {email.trim()}. Tap it on this device and you&apos;ll be
              signed in automatically.
            </Text>
            <View className="mt-4">
              <Button
                label="Back to Sign In"
                variant="primary"
                onPress={() => router.replace('/sign-in')}
                fullWidth
              />
            </View>
          </View>
        ) : (
          <>
            <View className="mt-8 gap-3">
              <TextField
                placeholder="Email"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>
            <View className="mt-5">
              <Button
                label={busy ? 'Sending…' : 'Send reset link'}
                onPress={onSubmit}
                disabled={busy}
                fullWidth
              />
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
