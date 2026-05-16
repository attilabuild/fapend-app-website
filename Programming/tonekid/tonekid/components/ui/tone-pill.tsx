import { Text, View } from 'react-native';

interface TonePillProps {
  label: string;
}

export function TonePill({ label }: TonePillProps) {
  return (
    <View className="bg-accent-purple-bg self-start rounded-full px-3 py-2">
      <Text className="text-accent-purple text-sm font-medium leading-snug">{label}</Text>
    </View>
  );
}
