import { useCallback, useMemo, useState } from 'react';
import { ActionSheetIOS, Alert, Platform, Pressable, RefreshControl, ScrollView, Text, View } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MoveRight, Plus, Star } from 'lucide-react-native';

import {
  ActiveTileSkeleton,
  GearIcon,
  GearRowSkeleton,
  Pill,
  SectionLabel,
} from '@/components/ui';
import { colors } from '@/constants/tokens';
import { gearCountByType, useApp } from '@/lib/store';
import type { Gear, GearType } from '@/lib/types';

type Filter = 'All' | GearType;

const FILTERS: { key: Filter; label: string }[] = [
  { key: 'All', label: 'All' },
  { key: 'guitar', label: 'Guitars' },
  { key: 'bass', label: 'Bass' },
  { key: 'amp', label: 'Amps' },
  { key: 'multifx', label: 'Multi-FX' },
];

const SECTIONS: { type: GearType; title: string; emptyCopy: string }[] = [
  { type: 'guitar', title: 'Guitars', emptyCopy: 'No guitars yet, Tap to add.' },
  { type: 'bass', title: 'Bass Guitars', emptyCopy: 'No bass guitars yet, Tap to add.' },
  { type: 'amp', title: 'Amps', emptyCopy: 'No amps yet, Tap to add.' },
  { type: 'bassamp', title: 'Bass Amps', emptyCopy: 'No bass amps yet, Tap to add.' },
  { type: 'multifx', title: 'Multi-FX', emptyCopy: 'No multi-FX units yet, Tap to add.' },
];

export default function MyGearScreen() {
  const { gear, activeSetup, setActiveSetup, removeGear, refreshUserData, hydrated } = useApp();
  const [filter, setFilter] = useState<Filter>('All');
  const gearLoading = !hydrated;
  const [refreshing, setRefreshing] = useState(false);
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refreshUserData();
    setRefreshing(false);
  }, [refreshUserData]);

  const onLongPressGear = (item: Gear) => {
    const isGuitar = item.type === 'guitar' || item.type === 'bass';
    const isRig = item.type === 'amp' || item.type === 'bassamp' || item.type === 'multifx';
    const currentlyActive =
      (isGuitar && activeSetup.guitarId === item.id) ||
      (isRig && activeSetup.rigId === item.id);

    const setActive = () => {
      if (isGuitar) setActiveSetup({ ...activeSetup, guitarId: item.id });
      else if (isRig) setActiveSetup({ ...activeSetup, rigId: item.id });
    };
    const confirmDelete = () => {
      Alert.alert(
        `Delete ${item.model}?`,
        'This removes the gear from your library.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Delete', style: 'destructive', onPress: () => removeGear(item.id) },
        ]
      );
    };

    if (Platform.OS === 'ios') {
      const options = currentlyActive
        ? ['Delete', 'Cancel']
        : ['Make active', 'Delete', 'Cancel'];
      const cancelButtonIndex = options.length - 1;
      const destructiveButtonIndex = options.indexOf('Delete');
      ActionSheetIOS.showActionSheetWithOptions(
        {
          title: item.model,
          options,
          cancelButtonIndex,
          destructiveButtonIndex,
        },
        (idx) => {
          const choice = options[idx];
          if (choice === 'Make active') setActive();
          else if (choice === 'Delete') confirmDelete();
        }
      );
    } else {
      Alert.alert(item.model, undefined, [
        ...(currentlyActive ? [] : [{ text: 'Make active', onPress: setActive }]),
        { text: 'Delete', style: 'destructive' as const, onPress: confirmDelete },
        { text: 'Cancel', style: 'cancel' as const },
      ]);
    }
  };

  const activeGuitar = useMemo(() => gear.find((g) => g.id === activeSetup.guitarId), [gear, activeSetup]);
  const activeRig = useMemo(() => gear.find((g) => g.id === activeSetup.rigId), [gear, activeSetup]);

  const visibleSections = SECTIONS.filter((s) => filter === 'All' || filter === s.type);

  return (
    <SafeAreaView className="flex-1 bg-bg" edges={['top']}>
      <ScrollView
        contentContainerStyle={{ paddingBottom: 120 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.ink} />
        }>
        <View className="flex-row items-center justify-between px-5 pb-3 pt-2">
          <Text className="text-ink text-[36px] font-extrabold tracking-tight">My Gear</Text>
          <Pressable
            onPress={() => router.push('/add-gear')}
            hitSlop={8}
            className="bg-ink h-11 w-11 items-center justify-center rounded-full">
            <Plus size={22} color="#fff" />
          </Pressable>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 20, paddingVertical: 4, gap: 8 }}>
          {FILTERS.map((f) => {
            const selected = f.key === filter;
            const count = f.key === 'All' ? gear.length : gearCountByType(gear, f.key);
            return (
              <Pill
                key={f.key}
                label={count > 0 && f.key !== 'All' ? `${f.label} ${count}` : f.label}
                variant={selected ? 'selected' : 'filled'}
                onPress={() => setFilter(f.key)}
              />
            );
          })}
        </ScrollView>

        {/* Active Setup */}
        <View className="px-5 pt-5">
          <View className="bg-surface rounded-3xl px-5 py-5">
            <Text className="text-ink-muted text-center text-[11px] font-semibold uppercase tracking-wide">
              Active Setup
            </Text>
            <View className="mt-4 flex-row items-center justify-center">
              {gearLoading ? (
                <>
                  <ActiveTileSkeleton />
                  <MoveRight size={20} color={colors.ink} style={{ marginHorizontal: 12 }} />
                  <ActiveTileSkeleton />
                </>
              ) : (
                <>
                  <ActiveTile gear={activeGuitar} />
                  <MoveRight size={20} color={colors.ink} style={{ marginHorizontal: 12 }} />
                  <ActiveTile gear={activeRig} />
                </>
              )}
            </View>
          </View>
        </View>

        {/* Sections */}
        <View className="gap-5 px-5 pt-7">
          {visibleSections.map((s) => {
            const items = gear.filter((g) => g.type === s.type);
            return (
              <View key={s.type}>
                <SectionLabel
                  label={s.title}
                  right={
                    gearLoading ? null : (
                      <Text className="text-ink-muted text-xs font-semibold">{items.length}</Text>
                    )
                  }
                />
                <View className="gap-2 pt-3">
                  {gearLoading ? (
                    <>
                      <GearRowSkeleton />
                      <GearRowSkeleton />
                    </>
                  ) : items.length === 0 ? (
                    <Pressable
                      onPress={() => router.push('/add-gear')}
                      className="border-hairline rounded-2xl border-2 border-dashed px-4 py-5">
                      <View className="flex-row items-center justify-center">
                        <Plus size={18} color={colors.inkMuted} />
                        <Text className="text-ink-muted ml-2 text-sm">{s.emptyCopy}</Text>
                      </View>
                    </Pressable>
                  ) : (
                    items.map((g) => (
                      <GearRow key={g.id} gear={g} onLongPress={() => onLongPressGear(g)} />
                    ))
                  )}
                </View>
              </View>
            );
          })}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function ActiveTile({ gear }: { gear?: Gear }) {
  return (
    <View className="items-center" style={{ width: 96 }}>
      <View className="bg-white h-20 w-20 items-center justify-center rounded-2xl">
        <GearIcon variant={gear?.type === 'amp' ? 'amp' : gear?.type === 'multifx' ? 'multifx' : 'guitar'} size={56} rounded="2xl" />
      </View>
      <Text
        numberOfLines={2}
        className="text-ink mt-2 text-center text-xs font-bold leading-tight">
        {gear?.model ?? 'None'}
      </Text>
    </View>
  );
}

function variantForGear(type: GearType) {
  if (type === 'amp' || type === 'bassamp') return 'amp' as const;
  if (type === 'multifx') return 'multifx' as const;
  return 'guitar' as const;
}

function GearRow({ gear, onLongPress }: { gear: Gear; onLongPress?: () => void }) {
  return (
    <Pressable onLongPress={onLongPress} delayLongPress={250}>
      {({ pressed }) => (
        <View
          className="bg-surface flex-row items-center rounded-2xl p-3"
          style={{ opacity: pressed ? 0.85 : 1 }}>
          <GearIcon variant={variantForGear(gear.type)} size={40} />
          <View className="ml-3 flex-1">
            <View className="flex-row items-center">
              <Text className="text-ink text-base font-bold">{gear.model}</Text>
              {gear.isActive ? (
                <Star size={13} color={colors.ink} fill={colors.ink} style={{ marginLeft: 6 }} />
              ) : null}
            </View>
            <Text className="text-ink-muted mt-0.5 text-xs">
              {gear.brand}, {labelForType(gear.type)}
            </Text>
          </View>
        </View>
      )}
    </Pressable>
  );
}

function labelForType(t: GearType): string {
  switch (t) {
    case 'guitar': return 'Guitar';
    case 'bass': return 'Bass';
    case 'amp': return 'Amp';
    case 'bassamp': return 'Bass Amp';
    case 'multifx': return 'Multi-FX';
  }
}
