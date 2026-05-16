import { View } from 'react-native';

interface ProgressBarProps {
  percent: number; // 0..100
  height?: number;
}

export function ProgressBar({ percent, height = 4 }: ProgressBarProps) {
  const pct = Math.max(0, Math.min(100, percent));
  return (
    <View className="bg-hairline w-full overflow-hidden rounded-full" style={{ height }}>
      <View className="bg-ink h-full rounded-full" style={{ width: `${pct}%` }} />
    </View>
  );
}
