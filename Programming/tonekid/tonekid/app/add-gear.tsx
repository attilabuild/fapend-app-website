import { useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { X } from 'lucide-react-native';

import { Button, SectionLabel, SegmentedControl, TextField } from '@/components/ui';
import { colors } from '@/constants/tokens';
import { useApp } from '@/lib/store';
import type { GearType } from '@/lib/types';

const CATEGORIES: { label: string; value: GearType }[] = [
  { label: 'Guitar', value: 'guitar' },
  { label: 'Bass', value: 'bass' },
  { label: 'Amp', value: 'amp' },
  { label: 'Multi-FX', value: 'multifx' },
];

export default function AddGearScreen() {
  const { addGear } = useApp();
  const [type, setType] = useState<GearType>('guitar');
  const [brand, setBrand] = useState('');
  const [model, setModel] = useState('');
  const [notes, setNotes] = useState('');

  const canSubmit = brand.trim() && model.trim();

  const onSubmit = () => {
    if (!canSubmit) return;
    addGear({ type, brand: brand.trim(), model: model.trim() });
    router.back();
  };

  return (
    <SafeAreaView className="flex-1 bg-bg" edges={['bottom']}>
      <View className="items-center pt-2.5">
        <View className="bg-hairline h-1 w-10 rounded-full" />
      </View>
      <View className="flex-row items-center px-5 pt-3">
        <View className="w-9" />
        <Text className="text-ink flex-1 text-center text-base font-bold">Add Gear</Text>
        <Pressable
          onPress={() => router.back()}
          hitSlop={12}
          className="bg-surface h-9 w-9 items-center justify-center rounded-full">
          <X size={18} color={colors.ink} />
        </Pressable>
      </View>
      <ScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 16, paddingBottom: 32 }}>
        <SegmentedControl options={CATEGORIES} value={type} onChange={setType} />
        <View className="mt-6 gap-2">
          <SectionLabel label="Brand" />
          <TextField placeholder="e.g. Fender" value={brand} onChangeText={setBrand} />
        </View>
        <View className="mt-4 gap-2">
          <SectionLabel label="Model" />
          <TextField placeholder="e.g. Stratocaster" value={model} onChangeText={setModel} />
        </View>
        <View className="mt-4 gap-2">
          <SectionLabel label="Notes" />
          <TextField
            placeholder="Pickups, mods, year..."
            value={notes}
            onChangeText={setNotes}
            multiline
            numberOfLines={4}
          />
        </View>
        <View className="mt-8">
          <Button label="Add to My Gear" onPress={onSubmit} fullWidth disabled={!canSubmit} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
