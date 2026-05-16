import { useEffect, useState } from 'react';
import { Alert, Linking, Pressable, ScrollView, Switch, Text, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft } from 'lucide-react-native';
import * as Notifications from 'expo-notifications';

import { Card, SectionLabel } from '@/components/ui';
import { colors } from '@/constants/tokens';
import { useApp } from '@/lib/store';

type Kind = 'notifications' | 'privacy' | 'terms' | 'help';

const TITLES: Record<Kind, string> = {
  notifications: 'Notifications',
  privacy: 'Privacy Policy',
  terms: 'Terms of Service',
  help: 'Help & Support',
};

export default function SettingsKindScreen() {
  const { kind: rawKind } = useLocalSearchParams<{ kind: string }>();
  const kind = (rawKind as Kind) || 'help';
  const title = TITLES[kind] ?? 'Settings';

  return (
    <SafeAreaView className="flex-1 bg-bg" edges={['top']}>
      <View className="flex-row items-center px-5 pb-3 pt-1">
        <Pressable
          onPress={() => router.back()}
          hitSlop={12}
          className="bg-surface h-9 w-9 items-center justify-center rounded-full">
          <ChevronLeft size={20} color={colors.ink} />
        </Pressable>
        <Text className="text-ink ml-3 text-[28px] font-extrabold tracking-tight">{title}</Text>
      </View>

      <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 120, paddingTop: 12 }}>
        {kind === 'notifications' ? <NotificationsBody /> : null}
        {kind === 'privacy' ? <PrivacyBody /> : null}
        {kind === 'terms' ? <TermsBody /> : null}
        {kind === 'help' ? <HelpBody /> : null}
      </ScrollView>
    </SafeAreaView>
  );
}

function NotificationsBody() {
  const { prefs, setNotificationsEnabled } = useApp();
  const [busy, setBusy] = useState(false);
  const [osGranted, setOsGranted] = useState<boolean | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { status } = await Notifications.getPermissionsAsync();
        if (!cancelled) setOsGranted(status === 'granted');
      } catch {
        if (!cancelled) setOsGranted(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const onToggle = async (next: boolean) => {
    if (busy) return;
    if (!next) {
      await setNotificationsEnabled(false);
      return;
    }
    setBusy(true);
    try {
      const existing = await Notifications.getPermissionsAsync();
      let status = existing.status;
      if (status === 'undetermined') {
        const res = await Notifications.requestPermissionsAsync({
          ios: { allowAlert: true, allowBadge: true, allowSound: true },
        });
        status = res.status;
      }
      setOsGranted(status === 'granted');
      if (status === 'granted') {
        await setNotificationsEnabled(true);
      } else {
        await setNotificationsEnabled(false);
        Alert.alert(
          'Notifications disabled',
          'Enable notifications for ToneKid in iOS Settings to receive tone alerts.',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Open Settings', onPress: () => Linking.openSettings() },
          ]
        );
      }
    } catch {
      await setNotificationsEnabled(false);
    } finally {
      setBusy(false);
    }
  };

  const switchValue = prefs.notificationsEnabled && osGranted !== false;

  return (
    <>
      <SectionLabel label="Preferences" />
      <Card className="mt-3" padding="none">
        <View className="flex-row items-center px-4 py-3.5">
          <View className="flex-1">
            <Text className="text-ink text-base font-medium">Push notifications</Text>
            <Text className="text-ink-muted mt-0.5 text-xs">
              Get notified when new community tones land and when your adapts finish.
            </Text>
          </View>
          <Switch
            value={switchValue}
            onValueChange={onToggle}
            disabled={busy}
            trackColor={{ true: '#0A0A0A', false: '#E5E5E7' }}
            thumbColor="#fff"
          />
        </View>
      </Card>
      <Text className="text-ink-muted mt-4 text-xs leading-snug">
        We&apos;ll never send marketing pushes. Toggle anytime.
      </Text>
    </>
  );
}

function PrivacyBody() {
  return (
    <>
      <Para>
        ToneKid stores your gear, saved tones, and onboarding preferences locally on your device.
        Nothing is sent to a ToneKid server.
      </Para>
      <Para>
        When you tap <Bold>Adapt to My Gear</Bold>, the song name, artist, and a description of
        your gear are sent to OpenAI to generate the adapted tone. We do not send your name or any
        account identifier with that request.
      </Para>
      <Para>
        Album artwork shown in Explore is loaded directly from Apple&apos;s iTunes search API. Your
        device fetches those images; we never see them.
      </Para>
      <Para>
        This MVP has no analytics, no crash reporting, and no advertising SDKs.
      </Para>
    </>
  );
}

function TermsBody() {
  return (
    <>
      <Para>
        ToneKid is provided &ldquo;as-is&rdquo;. The adapted tones are best-effort AI suggestions
        and do not guarantee an exact match to the original recording.
      </Para>
      <Para>
        Album artwork and metadata in Explore are sourced from Apple&apos;s public iTunes search
        API and remain the property of their respective copyright holders.
      </Para>
      <Para>
        Free users get a limited number of AI adaptations. Pro unlocks unlimited adaptations and
        priority processing. You can cancel anytime through your App Store subscriptions.
      </Para>
      <Para>
        By using ToneKid you agree not to abuse the AI generation endpoint or attempt to reverse
        engineer the app.
      </Para>
    </>
  );
}

function HelpBody() {
  return (
    <>
      <SectionLabel label="Common questions" />
      <View className="mt-3 gap-3">
        <Faq
          q="Why doesn't the adapted tone sound exactly like the record?"
          a="The AI gives you the closest match for your gear. Real recordings rely on specific amps, cabs, microphones, and producer EQ that no patch can fully replicate. Treat the result as a starting point — your ear is the final mix."
        />
        <Faq
          q="Can I use ToneKid with my pedalboard instead of a multi-FX?"
          a="Yes. Add your pedals as individual gear or list them as a single multi-FX entry. The signal-chain section shows you pedal order."
        />
        <Faq
          q="My favorite song isn't in Explore. What now?"
          a="Search any song from Apple's catalog in the Adapt tab — ToneKid will research it and adapt the tone live."
        />
        <Faq
          q="How do I switch gear before adapting?"
          a="Tap Adapt to My Gear on any song. The confirm-gear sheet lets you swap guitar / amp / multi-FX for that adaptation."
        />
      </View>
      <Text className="text-ink-muted mt-6 text-xs leading-snug">
        Still stuck? Email info@designaxe.com — we usually reply within a day.
      </Text>
    </>
  );
}

function Para({ children }: { children: React.ReactNode }) {
  return (
    <Text className="text-ink-secondary mt-3 text-sm leading-relaxed">
      {children}
    </Text>
  );
}

function Bold({ children }: { children: React.ReactNode }) {
  return <Text className="text-ink font-semibold">{children}</Text>;
}

function Faq({ q, a }: { q: string; a: string }) {
  return (
    <Card padding="md">
      <Text className="text-ink text-sm font-bold">{q}</Text>
      <Text className="text-ink-secondary mt-1.5 text-sm leading-snug">{a}</Text>
    </Card>
  );
}
