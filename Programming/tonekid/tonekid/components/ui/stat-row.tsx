import { Pressable, Text, View } from 'react-native';
import { ChevronRight } from 'lucide-react-native';
import { type ReactNode } from 'react';

import { colors } from '@/constants/tokens';

interface StatRowProps {
  icon: ReactNode;
  label: string;
  value?: string;
  onPress?: () => void;
  showDivider?: boolean;
}

export function StatRow({ icon, label, value, onPress, showDivider }: StatRowProps) {
  return (
    <Pressable onPress={onPress}>
      {({ pressed }) => (
        <View
          className={`flex-row items-center py-3.5 ${pressed ? 'opacity-60' : ''} ${
            showDivider ? 'border-hairline border-b' : ''
          }`}>
          <View className="mr-3">{icon}</View>
          <Text className="text-ink flex-1 text-base font-medium">{label}</Text>
          {value ? <Text className="text-ink-secondary mr-2 text-sm">{value}</Text> : null}
          <ChevronRight size={20} color={colors.inkMuted} />
        </View>
      )}
    </Pressable>
  );
}
