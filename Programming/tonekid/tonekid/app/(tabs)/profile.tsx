import { Alert, Linking, Pressable, ScrollView, Text, View } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  ChevronRight,
  CreditCard,
  Crown,
  FileText,
  HelpCircle,
  LogOut,
  ShieldCheck,
  Trash2,
  User as UserIcon,
  type LucideIcon,
} from 'lucide-react-native';

import { Card, Pill, SectionLabel } from '@/components/ui';
import { colors } from '@/constants/tokens';
import { useApp } from '@/lib/store';

function formatMemberSince(iso: string | null): string {
  if (!iso) return '—';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
}

type RowAction =
  | { kind: 'url'; url: string }
  | { kind: 'route'; path: string };

const ROWS: { icon: LucideIcon; label: string; action: RowAction }[] = [
  // Native iOS subscription management — opens directly to the user's subscription
  // list in the App Store. Required by App Store guideline 3.1.2(a).
  { icon: CreditCard, label: 'Manage Subscription', action: { kind: 'url', url: 'https://apps.apple.com/account/subscriptions' } },
  { icon: FileText, label: 'Terms of Use', action: { kind: 'url', url: 'https://tonekid.com/terms' } },
  { icon: ShieldCheck, label: 'Privacy Policy', action: { kind: 'url', url: 'https://tonekid.com/privacy' } },
  { icon: HelpCircle, label: 'Help & Support', action: { kind: 'route', path: '/settings/help' } },
];

export default function ProfileScreen() {
  const {
    isPro,
    signOut,
    deleteAccount,
    userName,
    userEmail,
    memberSince,
    devProOverride,
    setDevProOverride,
  } = useApp();
  const displayName = userName?.trim() || userEmail?.split('@')[0] || 'You';
  const displayMemberSince = formatMemberSince(memberSince);

  const handleLogout = () => {
    Alert.alert('Log Out', 'Are you sure you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Log Out',
        style: 'destructive',
        onPress: async () => {
          await signOut();
          router.replace('/welcome');
        },
      },
    ]);
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'This will permanently delete your account and all your data (gear, saved tones, preferences). This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            const result = await deleteAccount();
            if (!result.ok) {
              Alert.alert('Could not delete account', result.error);
              return;
            }
            router.replace('/welcome');
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-bg" edges={['top']}>
      <ScrollView contentContainerStyle={{ paddingBottom: 120 }}>
        <View className="px-5 pb-3 pt-2">
          <Text className="text-ink text-[36px] font-extrabold tracking-tight">Profile</Text>
        </View>

        {/* Profile card */}
        <View className="px-5">
          <View className="bg-surface items-center rounded-2xl px-5 py-6">
            <View className="bg-ink h-16 w-16 items-center justify-center rounded-full">
              <UserIcon size={28} color="#fff" />
            </View>
            <Text className="text-ink mt-3 text-lg font-bold">{displayName}</Text>
            {userEmail ? (
              <Text className="text-ink-muted mt-0.5 text-xs">{userEmail}</Text>
            ) : null}
            <Text className="text-ink-muted mt-0.5 text-xs">
              Member since {displayMemberSince}
            </Text>
            <View className="mt-3">
              <Pill
                label={isPro ? 'Pro' : 'Free'}
                variant={isPro ? 'success' : 'outline'}
                size="sm"
              />
            </View>
          </View>
        </View>

        {/* Subscription status (Pro users only — non-pro can't reach this screen) */}
        {isPro ? (
          <>
            <View className="px-5 pt-7">
              <SectionLabel label="Subscription" />
            </View>
            <View className="px-5 pt-3">
              <Card padding="md" className="flex-row items-center">
                <View className="bg-success-bg mr-3 h-10 w-10 items-center justify-center rounded-xl">
                  <Crown size={20} color={colors.successInk} fill={colors.successInk} />
                </View>
                <View className="flex-1">
                  <Text className="text-ink text-base font-bold">ToneKid Pro</Text>
                  <Text className="text-ink-muted mt-0.5 text-xs">All features unlocked</Text>
                </View>
              </Card>
            </View>
          </>
        ) : null}

        {/* Account / required rows */}
        <View className="px-5 pt-7">
          <SectionLabel label="Account" />
        </View>
        <View className="px-5 pt-3">
          <Card padding="none">
            {ROWS.map((row, idx) => {
              const Icon = row.icon;
              const onPress = () => {
                if (row.action.kind === 'route') {
                  router.push(row.action.path as never);
                } else {
                  Linking.openURL(row.action.url).catch(() => {});
                }
              };
              return (
                <Pressable key={row.label} onPress={onPress}>
                  {({ pressed }) => (
                    <View
                      className={`flex-row items-center px-4 py-3.5 ${pressed ? 'opacity-60' : ''} ${
                        idx < ROWS.length - 1 ? 'border-hairline border-b' : ''
                      }`}>
                      <Icon size={18} color={colors.ink} />
                      <Text className="text-ink ml-3 flex-1 text-base font-medium">{row.label}</Text>
                      <ChevronRight size={18} color={colors.inkMuted} />
                    </View>
                  )}
                </Pressable>
              );
            })}
          </Card>
        </View>

        {__DEV__ && devProOverride ? (
          <View className="px-5 pt-4">
            <Pressable
              onPress={() => {
                setDevProOverride(false);
                Alert.alert('Dev override cleared', 'isPro now reflects RevenueCat again.');
              }}>
              {({ pressed }) => (
                <Card
                  padding="md"
                  className="flex-row items-center"
                  style={{ opacity: pressed ? 0.7 : 1, borderWidth: 1, borderColor: '#F59E0B' }}>
                  <Text className="text-ink flex-1 text-sm font-semibold">
                    Reset dev Pro override
                  </Text>
                  <Text className="text-[11px] uppercase tracking-widest text-amber-600">
                    Dev
                  </Text>
                </Card>
              )}
            </Pressable>
          </View>
        ) : null}

        {/* Session */}
        <View className="px-5 pt-7">
          <Card padding="none">
            <Pressable onPress={handleLogout}>
              {({ pressed }) => (
                <View
                  className={`flex-row items-center px-4 py-3.5 ${pressed ? 'opacity-60' : ''} border-hairline border-b`}>
                  <LogOut size={18} color={colors.ink} />
                  <Text className="text-ink ml-3 flex-1 text-base font-medium">Log Out</Text>
                  <ChevronRight size={18} color={colors.inkMuted} />
                </View>
              )}
            </Pressable>
            <Pressable onPress={handleDeleteAccount}>
              {({ pressed }) => (
                <View
                  className={`flex-row items-center px-4 py-3.5 ${pressed ? 'opacity-60' : ''}`}>
                  <Trash2 size={18} color={colors.danger} />
                  <Text className="ml-3 flex-1 text-base font-medium" style={{ color: colors.danger }}>
                    Delete Account
                  </Text>
                  <ChevronRight size={18} color={colors.inkMuted} />
                </View>
              )}
            </Pressable>
          </Card>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
