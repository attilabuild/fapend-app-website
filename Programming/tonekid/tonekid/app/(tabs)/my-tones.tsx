import { useCallback, useMemo, useState } from 'react';
import { ActionSheetIOS, Alert, Pressable, RefreshControl, ScrollView, Text, View, Platform } from 'react-native';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowDownUp, Compass, Heart, Music } from 'lucide-react-native';

import { Pill, SearchInput, SectionLabel } from '@/components/ui';
import { colors } from '@/constants/tokens';
import { exploreTones } from '@/lib/mockData';
import { useApp, type SortKey } from '@/lib/store';
import type { SavedTone } from '@/lib/types';

const SORT_LABELS: Record<SortKey, string> = {
  recent: 'Recent',
  artist: 'Artist',
  song: 'Song',
};

const exploreArtworkById = Object.fromEntries(exploreTones.map((t) => [t.id, t.artworkUrl]));

export default function MyTonesScreen() {
  const {
    savedTones,
    removeSavedTone,
    aiTones,
    savedSort,
    setSavedSort,
    refreshUserData,
    recentSearches,
  } = useApp();
  const [query, setQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refreshUserData();
    setRefreshing(false);
  }, [refreshUserData]);

  const sorted = useMemo<SavedTone[]>(() => {
    const list = [...savedTones];
    if (savedSort === 'artist') list.sort((a, b) => a.artist.localeCompare(b.artist));
    else if (savedSort === 'song') list.sort((a, b) => a.song.localeCompare(b.song));
    // 'recent' = insertion order (newest first already)
    return list;
  }, [savedTones, savedSort]);

  const filtered = useMemo(() => {
    if (!query.trim()) return sorted;
    const q = query.toLowerCase();
    return sorted.filter(
      (t) => t.song.toLowerCase().includes(q) || t.artist.toLowerCase().includes(q)
    );
  }, [sorted, query]);

  const searchArtworkById = useMemo(
    () => Object.fromEntries(recentSearches.map((r) => [r.id, r.artwork])),
    [recentSearches]
  );

  const artworkFor = (id: string): string | undefined =>
    aiTones[id]?.artworkUrl || searchArtworkById[id] || exploreArtworkById[id];

  const onSortPress = () => {
    const options: SortKey[] = ['recent', 'artist', 'song'];
    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          title: 'Sort tones',
          options: [...options.map((k) => SORT_LABELS[k]), 'Cancel'],
          cancelButtonIndex: options.length,
        },
        (idx) => {
          if (idx < options.length) setSavedSort(options[idx]);
        }
      );
    } else {
      Alert.alert(
        'Sort tones',
        undefined,
        options.map((k) => ({ text: SORT_LABELS[k], onPress: () => setSavedSort(k) }))
      );
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-bg" edges={['top']}>
      <ScrollView
        contentContainerStyle={{ paddingBottom: 120 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.ink} />
        }>
        <View className="flex-row items-center justify-between px-5 pb-3 pt-2">
          <Text className="text-ink text-[36px] font-extrabold tracking-tight">My Tones</Text>
          <Pressable onPress={onSortPress} hitSlop={12} className="p-2">
            <ArrowDownUp size={20} color={colors.ink} />
          </Pressable>
        </View>

        {savedTones.length === 0 ? (
          <EmptyState />
        ) : (
          <>
            <View className="flex-row gap-2 px-5">
              <Pill
                label={`${savedTones.length} Liked`}
                variant="filled"
                leftIcon={
                  <Heart size={14} color={colors.ink} fill={colors.ink} />
                }
              />
            </View>
            <View className="px-5 pt-4">
              <SearchInput placeholder="Search your tones..." value={query} onChangeText={setQuery} />
            </View>
            <View className="px-5 pt-5">
              <SectionLabel label="All Tones" />
            </View>
            <View className="gap-2.5 px-5 pt-3">
              {filtered.map((t) => {
                const art = artworkFor(t.id);
                return (
                  <Pressable
                    key={t.id}
                    onPress={() => router.push(`/tone/${t.id}` as never)}
                    className="bg-surface flex-row items-center rounded-2xl p-3">
                    <View className="bg-surface-elevated mr-3 h-[60px] w-[60px] overflow-hidden rounded-xl">
                      {art ? (
                        <Image
                          source={{ uri: art }}
                          style={{ width: '100%', height: '100%' }}
                          contentFit="cover"
                          transition={150}
                        />
                      ) : null}
                    </View>
                    <View className="flex-1">
                      <Text className="text-ink text-base font-bold">{t.song}</Text>
                      <Text className="text-ink-muted text-xs">
                        {t.artist}, {t.partType}
                      </Text>
                      <Text className="text-ink-muted mt-0.5 text-xs" numberOfLines={1}>
                        {t.gearSummary}
                      </Text>
                    </View>
                    <Pressable onPress={() => removeSavedTone(t.id)} hitSlop={12} className="p-2">
                      <Heart size={22} color={colors.ink} fill={colors.ink} />
                    </Pressable>
                  </Pressable>
                );
              })}
              {filtered.length === 0 ? (
                <Text className="text-ink-muted pt-6 text-center text-sm">
                  No matches for &ldquo;{query.trim()}&rdquo;.
                </Text>
              ) : null}
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function EmptyState() {
  return (
    <View className="items-center px-8 pt-16">
      <View
        className="bg-surface h-20 w-20 items-center justify-center rounded-3xl"
        style={{ marginBottom: 20 }}>
        <Music size={36} color={colors.ink} />
      </View>
      <Text className="text-ink text-center text-xl font-extrabold tracking-tight">
        No tones saved yet
      </Text>
      <Text className="text-ink-muted mt-2 text-center text-sm leading-snug">
        Tap <Text className="text-ink font-semibold">Save This Tone</Text> on any adapted song to
        keep it here for later.
      </Text>
      <Pressable
        onPress={() => router.push('/(tabs)/explore')}
        className="bg-ink mt-6 flex-row items-center rounded-full px-5 py-3">
        <Compass size={16} color="#fff" />
        <Text className="text-white ml-2 text-sm font-bold">Browse Explore</Text>
      </Pressable>
    </View>
  );
}
