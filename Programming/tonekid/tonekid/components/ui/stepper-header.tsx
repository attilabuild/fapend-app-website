import { Text, View } from 'react-native';

interface StepperHeaderProps {
  steps: string[];
  current: number; // 1-indexed
}

export function StepperHeader({ steps, current }: StepperHeaderProps) {
  return (
    <View className="flex-row">
      {steps.map((label, idx) => {
        const active = idx + 1 <= current;
        return (
          <View key={label} className="flex-1 items-center">
            <Text
              className={`mb-2 text-xs font-semibold ${active ? 'text-ink' : 'text-ink-muted'}`}>
              {label}
            </Text>
            <View
              className={`h-0.5 w-full ${active ? 'bg-ink' : 'bg-hairline'}`}
            />
          </View>
        );
      })}
    </View>
  );
}
