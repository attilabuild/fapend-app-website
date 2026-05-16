import { Text, View } from 'react-native';
import { type ReactNode } from 'react';

interface SectionLabelProps {
  label: string;
  right?: ReactNode;
  accent?: boolean; // tiny left vertical bar
  className?: string;
}

export function SectionLabel({ label, right, accent, className = '' }: SectionLabelProps) {
  return (
    <View className={`flex-row items-center ${className}`}>
      {accent ? <View className="bg-ink mr-2 h-3 w-0.5 rounded-full" /> : null}
      <Text className="text-ink-muted text-[11px] font-semibold uppercase tracking-wide">
        {label}
      </Text>
      <View className="flex-1" />
      {right}
    </View>
  );
}
