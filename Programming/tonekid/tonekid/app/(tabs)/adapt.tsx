import { useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { router, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AudioWaveform, Sparkles } from 'lucide-react-native';

import { Pill, SearchInput, SectionLabel } from '@/components/ui';
import { colors } from '@/constants/tokens';
import type { ITunesTrack } from '@/lib/musicSearch';
import { useApp } from '@/lib/store';
import { useSongSearch } from '@/lib/useSongSearch';

export default function AdaptScreen() {
  const { adaptsLeft, isPro, gear } = useApp();
  const params = useLocalSearchParams<{ q?: string }>();
  const [query, setQuery] = useState(params.q ?? '');
  const hasGuitar = gear.some((g) => g.type === 'guitar' || g.type === 'bass');

  const searching = query.trim().length >= 2;
  const { loading, results, error } = useSongSearch(query);

  const onPick = (t: ITunesTrack) => {
    router.push({
      pathname: '/confirm-gear',
      params: {
        songId: t.id,
        songTitle: t.song,
        songArtist: t.artist,
        songArtwork: t.artworkUrl ?? '',
        partType: 'Riff',
      },
    });
  };

  return (
    <SafeAreaView className="flex-1 bg-bg" edges={['top']}>
      <View className="flex-row items-center justify-between px-5 pb-3 pt-2">
        <Text className="text-ink text-[36px] font-extrabold tracking-tight">Adapt</Text>
        {isPro ? (
          <Pill label="Pro" variant="success" leftIcon={<Sparkles size={13} color="#059669" />} />
        ) : (
          <Pill
            label={`${adaptsLeft} left`}
            variant={adaptsLeft === 0 ? 'error' : 'filled'}
            leftIcon={
              <AudioWaveform
                size={14}
                color={adaptsLeft === 0 ? colors.danger : colors.ink}
              />
            }
          />
        )}
      </View>

      <View className="px-5">
        <SearchInput
          placeholder="Search any song to adapt..."
          value={query}
          onChangeText={setQuery}
          autoCorrect={false}
          returnKeyType="search"
        />
      </View>

      <ScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{
          flexGrow: 1,
          paddingHorizontal: 20,
          paddingTop: searching ? 14 : 0,
          paddingBottom: 140,
        }}>
        {!searching ? (
          <View className="flex-1 items-center justify-center px-3">
            <View
              className="bg-surface h-20 w-20 items-center justify-center rounded-3xl"
              style={{ marginBottom: 20 }}>
              <AudioWaveform size={36} color={colors.ink} />
            </View>
            <Text className="text-ink text-center text-xl font-extrabold tracking-tight">
              {hasGuitar ? 'Adapt any song to your gear' : 'Add a guitar first'}
            </Text>
            <Text className="text-ink-muted mt-2 text-center text-sm leading-snug">
              {hasGuitar
                ? "Search for any song and we'll research the original tone, then translate it to your guitar, amp, and pedals."
                : 'You need at least one guitar in My Gear before we can adapt a tone for you.'}
            </Text>
            {!hasGuitar ? (
              <Pressable
                onPress={() => router.push('/add-gear')}
                className="bg-ink mt-6 rounded-full px-5 py-3">
                <Text className="text-white text-sm font-bold">Add Gear</Text>
              </Pressable>
            ) : null}
          </View>
        ) : (
          <View>
            <SectionLabel label={`Results for "${query.trim()}"`} />
            <View className="mt-3 gap-2">
              {loading ? (
                <View className="flex-row items-center py-2">
                  <ActivityIndicator size="small" color={colors.ink} />
                  <Text className="text-ink-muted ml-2 text-xs">Searching iTunes...</Text>
                </View>
              ) : null}
              {error ? <Text className="text-danger text-xs">{error}</Text> : null}
              {results.map((t) => (
                <Pressable
                  key={t.id}
                  onPress={() => onPick(t)}
                  className="bg-surface flex-row items-center rounded-2xl p-2.5">
                  <View className="bg-surface-elevated mr-3 h-12 w-12 overflow-hidden rounded-lg">
                    {t.artworkUrl ? (
                      <Image
                        source={{ uri: t.artworkUrl }}
                        style={{ width: '100%', height: '100%' }}
                        contentFit="cover"
                      />
                    ) : null}
                  </View>
                  <View className="flex-1">
                    <Text className="text-ink text-sm font-bold" numberOfLines={1}>
                      {t.song}
                    </Text>
                    <Text className="text-ink-muted text-xs" numberOfLines={1}>
                      {t.artist}
                      {t.year ? ` · ${t.year}` : ''}
                    </Text>
                  </View>
                </Pressable>
              ))}
              {!loading && !error && results.length === 0 ? (
                <Text className="text-ink-muted text-xs">No matches yet.</Text>
              ) : null}
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
