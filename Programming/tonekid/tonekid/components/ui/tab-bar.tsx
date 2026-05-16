import { Platform, Pressable, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';
import { AudioWaveform, Compass, Guitar, Heart, User, type LucideIcon } from 'lucide-react-native';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';

import { colors } from '@/constants/tokens';

const iconForRoute: Record<string, LucideIcon> = {
  explore: Compass,
  'my-tones': Heart,
  adapt: AudioWaveform,
  'my-gear': Guitar,
  profile: User,
};

const ORDER = ['explore', 'my-tones', 'my-gear', 'profile'];

export function TabBar({ state, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const orderedRoutes = ORDER.map((name) => state.routes.find((r) => r.name === name)).filter(
    Boolean
  ) as typeof state.routes;

  return (
    <View
      pointerEvents="box-none"
      style={{
        position: 'absolute',
        left: 40,
        right: 40,
        bottom: Math.max(insets.bottom, 10),
      }}>
      <View
        style={{
          borderRadius: 9999,
          overflow: 'hidden',
          shadowColor: '#000',
          shadowOpacity: 0.08,
          shadowRadius: 20,
          shadowOffset: { width: 0, height: 8 },
          elevation: 8,
          borderWidth: Platform.OS === 'ios' ? 0.5 : 0,
          borderColor: 'rgba(255,255,255,0.6)',
        }}>
        <BlurView
          intensity={60}
          tint="light"
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingHorizontal: 6,
            height: 52,
            backgroundColor: 'rgba(255,255,255,0.55)',
          }}>
          {orderedRoutes.map((route) => {
            const Icon = iconForRoute[route.name];
            const isFocused = state.routes[state.index]?.key === route.key;
            const onPress = () => {
              const event = navigation.emit({
                type: 'tabPress',
                target: route.key,
                canPreventDefault: true,
              });
              if (!isFocused && !event.defaultPrevented) {
                navigation.navigate(route.name);
              }
            };
            return (
              <Pressable
                key={route.key}
                onPress={onPress}
                accessibilityRole="button"
                accessibilityState={isFocused ? { selected: true } : {}}
                className="flex-1 items-center justify-center">
                <View className="h-9 w-9 items-center justify-center">
                  <Icon
                    size={22}
                    color={colors.ink}
                    strokeWidth={isFocused ? 2.6 : 1.8}
                    opacity={isFocused ? 1 : 0.5}
                  />
                </View>
              </Pressable>
            );
          })}
        </BlurView>
      </View>
    </View>
  );
}
