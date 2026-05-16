import { Pressable, Text, View } from 'react-native';

interface SegmentedControlProps<T extends string> {
  options: { label: string; value: T }[];
  value: T;
  onChange: (value: T) => void;
}

export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
}: SegmentedControlProps<T>) {
  return (
    <View className="bg-surface flex-row rounded-full p-1">
      {options.map((opt) => {
        const selected = opt.value === value;
        return (
          <Pressable
            key={opt.value}
            onPress={() => onChange(opt.value)}
            className={`flex-1 items-center justify-center rounded-full py-2 ${
              selected ? 'bg-ink' : 'bg-transparent'
            }`}>
            <Text className={`text-sm font-semibold ${selected ? 'text-white' : 'text-ink'}`}>
              {opt.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
