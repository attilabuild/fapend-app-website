import { useEffect, useState } from 'react';
import { Alert, Linking, Pressable, ScrollView, Share, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Circle } from 'react-native-svg';
import {
  ArrowRight,
  BarChart3,
  Bookmark,
  Check,
  ChevronRight,
  Cpu,
  Guitar,
  Headphones,
  Lightbulb,
  Monitor,
  MoreHorizontal,
  Music,
  Pin,
  Save,
  Share2,
  Sliders,
  Speaker,
  TriangleAlert,
  Volume2,
  type LucideIcon,
} from 'lucide-react-native';

import { exploreTones, toneDetailById } from '@/lib/mockData';
import { useApp } from '@/lib/store';
import type { Effect, EffectColor, ToneDetail } from '@/lib/types';

const effectPillColors: Record<EffectColor, { bg: string; text: string }> = {
  green: { bg: '#D1FAE5', text: '#059669' },
  blue: { bg: '#DBEAFE', text: '#2563EB' },
  pink: { bg: '#FCE7F3', text: '#DB2777' },
  teal: { bg: '#CFFAFE', text: '#0891B2' },
  gray: { bg: '#E5E7EB', text: '#4B5563' },
  purple: { bg: '#EDE9FE', text: '#7C3AED' },
};

export default function ToneDetailScreen() {
  const params = useLocalSearchParams<{
    id: string;
    songTitle?: string;
    songArtist?: string;
    songArtwork?: string;
  }>();
  const id = params.id;
  const insets = useSafeAreaInsets();
  const {
    gear,
    activeSetup,
    addSavedTone,
    favorites,
    toggleFavorite,
    aiTones,
    generatingTones,
  } = useApp();
  const lookupId = id ?? '';
  const cached = aiTones[lookupId] ?? toneDetailById[lookupId];
  const isGenerating = !!generatingTones[lookupId] && !aiTones[lookupId];

  // If we're generating and have no cache yet, show the skeleton screen.
  if (isGenerating) {
    const explore = exploreTones.find((t) => t.id === lookupId);
    return (
      <GeneratingScreen
        songTitle={params.songTitle || explore?.song || 'Researching tone…'}
        songArtist={params.songArtist || explore?.artist || ''}
        artwork={params.songArtwork || explore?.artworkUrl}
        insetsTop={insets.top}
        onBack={() => router.replace('/(tabs)/explore')}
      />
    );
  }

  // No cached tone and not generating → AI failed or never ran. Show a clean
  // empty state instead of pretending Hotel California's data belongs here.
  if (!cached) {
    return (
      <View className="flex-1 bg-bg" style={{ paddingTop: insets.top }}>
        <View className="flex-row items-center px-5 pb-3 pt-1">
          <Pressable
            onPress={() => router.replace('/(tabs)/explore')}
            hitSlop={12}
            className="bg-surface mr-3 h-9 w-9 items-center justify-center rounded-full">
            <ChevronRight
              size={20}
              color="#0A0A0A"
              style={{ transform: [{ rotate: '180deg' }] }}
            />
          </Pressable>
          <Text className="text-ink text-[34px] font-extrabold tracking-tight">Adapt</Text>
        </View>
        <View className="flex-1 items-center justify-center px-8">
          <View className="bg-surface h-20 w-20 items-center justify-center rounded-3xl">
            <Music size={36} color="#0A0A0A" />
          </View>
          <Text className="text-ink mt-5 text-center text-xl font-extrabold tracking-tight">
            Tone not available yet
          </Text>
          <Text className="text-ink-muted mt-2 text-center text-sm leading-snug">
            We couldn&apos;t find an adaptation for this song on your gear. Open it from Explore
            or Adapt to generate a fresh one.
          </Text>
          <Pressable
            onPress={() => router.replace('/(tabs)/adapt')}
            className="bg-ink mt-6 rounded-full px-5 py-3">
            <Text className="text-white text-sm font-bold">Go to Adapt</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  const tone = cached;

  const activeGuitar = gear.find((g) => g.id === activeSetup.guitarId);
  const activeRig = gear.find((g) => g.id === activeSetup.rigId);
  const guitarLabel = activeGuitar
    ? `${activeGuitar.brand} ${activeGuitar.model}`.trim()
    : tone.userGuitarSettings?.guitarName ?? 'Your guitar';
  const rigLabel = activeRig ? `${activeRig.brand} ${activeRig.model}`.trim() : tone.rig;
  const isFavorited = !!favorites[tone.id];
  const explore = exploreTones.find((t) => t.id === tone.id);
  const artwork = tone.artworkUrl ?? explore?.artworkUrl;

  const onSave = () => {
    addSavedTone(
      {
        id: tone.id,
        song: tone.song,
        artist: tone.artist,
        partType: tone.partType,
        gearSummary: `${guitarLabel}, ${tone.rig}`,
      },
      { artwork }
    );
    toggleFavorite(tone.id);
  };

  return (
    <View className="flex-1 bg-bg">
      <SafeAreaView edges={['top']}>
        <View className="flex-row items-center px-5 pb-3 pt-1">
          <Pressable
            onPress={() => router.replace('/(tabs)/explore')}
            hitSlop={12}
            className="bg-surface mr-3 h-9 w-9 items-center justify-center rounded-full">
            <ChevronRight
              size={20}
              color="#0A0A0A"
              style={{ transform: [{ rotate: '180deg' }] }}
            />
          </Pressable>
          <Text className="text-ink flex-1 text-[34px] font-extrabold tracking-tight">Adapt</Text>
          <Pressable
            onPress={() => {
              Share.share({
                title: `${tone.song} — ToneKid`,
                message: `${tone.song} by ${tone.artist} — tone matched to my gear with ToneKid. https://tonekid.com`,
              }).catch(() => {});
            }}
            hitSlop={12}
            className="bg-surface h-9 w-9 items-center justify-center rounded-full">
            <Share2 size={18} color="#0A0A0A" />
          </Pressable>
        </View>
      </SafeAreaView>

      <ScrollView
        contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}
        showsVerticalScrollIndicator={false}>
        {/* Song card */}
        <View className="px-5 pt-1">
          <View className="flex-row items-center">
            <View className="bg-surface h-16 w-16 overflow-hidden rounded-xl">
              {artwork ? (
                <Image
                  source={{ uri: artwork }}
                  style={{ width: '100%', height: '100%' }}
                  contentFit="cover"
                  transition={150}
                />
              ) : null}
            </View>
            <View className="ml-3 flex-1">
              <Text className="text-ink text-xl font-extrabold leading-tight">{tone.song}</Text>
              <Text className="text-ink-muted mt-0.5 text-sm">{tone.artist}</Text>
              <View className="mt-2 flex-row flex-wrap gap-1.5">
                <ColoredPill label={tone.partType} bg="#FEF3C7" text="#B45309" />
                <ColoredPill label={`${tone.matchScore}% match`} bg="#D1FAE5" text="#059669" />
              </View>
            </View>
          </View>
        </View>

        {/* Adapted for your gear */}
        <View className="px-5 pt-4">
          <View
            className="rounded-2xl p-3"
            style={{ backgroundColor: '#F4F4F5' }}>
            <Text className="text-ink-muted text-[10px] font-bold uppercase tracking-widest">
              Adapted for your gear
            </Text>
            <View className="mt-2 flex-row items-center">
              <View className="bg-white flex-1 flex-row items-center rounded-xl px-3 py-2.5">
                <Guitar size={16} color="#0A0A0A" />
                <Text className="text-ink ml-2 flex-1 text-[13px] font-bold" numberOfLines={1}>
                  {guitarLabel}
                </Text>
              </View>
              <ArrowRight size={14} color="#0A0A0A" style={{ marginHorizontal: 6 }} />
              <View className="bg-white flex-1 flex-row items-center rounded-xl px-3 py-2.5">
                <Speaker size={16} color="#0A0A0A" />
                <Text className="text-ink ml-2 flex-1 text-[13px] font-bold" numberOfLines={1}>
                  {rigLabel}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Tone Match summary */}
        <View className="px-5 pt-4">
          <ShadowCard>
            <View className="flex-row items-start">
              <IconTile bg="#DBEAFE" Icon={Cpu} stroke="#2563EB" />
              <View className="ml-3 flex-1">
                <Text className="text-ink text-[15px] font-extrabold leading-snug">
                  {tone.song} - {tone.artist} Tone
                </Text>
                <Text className="text-ink-muted mt-1 text-[11px] leading-snug">
                  {tone.rig}
                  {tone.rigSubtitle ? ` · ${tone.rigSubtitle}` : ''}
                </Text>
              </View>
              <View className="bg-success-bg ml-2 h-14 w-14 items-center justify-center rounded-full">
                <Text className="text-success-ink text-base font-extrabold">
                  {tone.matchScore}%
                </Text>
                <Text className="text-success-ink text-[8px] font-bold uppercase">Match</Text>
              </View>
            </View>
            <Text className="text-ink-muted mt-4 text-[11px] font-bold uppercase tracking-widest">
              Key Tone Elements
            </Text>
            <View className="mt-2.5 gap-2">
              {tone.keyToneElements.map((t) => (
                <View key={t} className="bg-accent-purple-bg rounded-full px-3 py-2">
                  <Text className="text-accent-purple text-[12px] font-medium">{t}</Text>
                </View>
              ))}
            </View>
          </ShadowCard>
        </View>

        {/* EQ Guidance */}
        <View className="px-5 pt-4">
          <ShadowCard>
            <View className="flex-row items-center">
              <Sliders size={20} color="#0A0A0A" />
              <Text className="text-ink ml-2 text-base font-extrabold">EQ Guidance</Text>
            </View>
            <Text className="text-ink-secondary mt-3 text-sm leading-snug">
              {tone.eqGuidance}
            </Text>
            <View className="bg-amber-50 mt-3 flex-row rounded-xl p-3" style={{ backgroundColor: '#FFFBEB' }}>
              <Lightbulb size={16} color="#B45309" />
              <Text className="text-ink-secondary ml-2 flex-1 text-[12px] leading-snug">
                {tone.eqCallout}
              </Text>
            </View>
          </ShadowCard>
        </View>

        {/* Signal Flow */}
        <View className="px-5 pt-4">
          <ShadowCard>
            <View className="flex-row items-center">
              <View
                className="h-5 w-5 items-center justify-center rounded-full"
                style={{ backgroundColor: '#2563EB' }}>
                <Check size={12} color="#fff" strokeWidth={3} />
              </View>
              <Text className="text-ink ml-2 text-base font-extrabold">Signal Flow</Text>
            </View>
            <View className="mt-4 flex-row items-center">
              <View className="items-center">
                <View className="bg-amber-50 h-14 w-14 items-center justify-center rounded-xl" style={{ backgroundColor: '#FEF3C7' }}>
                  <Text className="text-base">🎸</Text>
                </View>
                <Text className="text-ink-muted mt-1 text-[10px] font-semibold">Guitar</Text>
              </View>
              <Text className="text-ink-muted mx-2 text-base">→</Text>
              <View className="bg-surface flex-1 rounded-xl px-3 py-2.5">
                <Text className="text-ink-muted text-[10px] font-semibold">
                  {tone.signalFlow.deviceLabel}
                </Text>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={{ gap: 4, alignItems: 'center', paddingTop: 4 }}>
                  {tone.signalFlow.effects.map((e, idx) => {
                    const palette = effectPillColors[e.color];
                    return (
                      <View key={e.name} className="flex-row items-center">
                        <View
                          className="rounded-full px-2 py-1"
                          style={{ backgroundColor: palette.bg }}>
                          <Text
                            className="text-[10px] font-bold"
                            style={{ color: palette.text }}
                            numberOfLines={1}>
                            {e.name}
                          </Text>
                        </View>
                        {idx < tone.signalFlow.effects.length - 1 ? (
                          <Text className="text-ink-muted mx-1 text-xs">→</Text>
                        ) : null}
                      </View>
                    );
                  })}
                </ScrollView>
              </View>
            </View>
          </ShadowCard>
        </View>

        {/* Effect Block Settings */}
        <View className="px-5 pt-4">
          <ShadowCard>
            <View className="flex-row items-center">
              <Monitor size={20} color="#0A0A0A" />
              <Text className="text-ink ml-2 text-base font-extrabold">Effect Block Settings</Text>
            </View>

            {tone.effectBlocks.beforeAmp.length > 0 ? (
              <View className="mt-3">
                <View className="flex-row items-center">
                  <View className="bg-ink h-3 w-1 rounded-full" />
                  <Text className="text-ink-muted ml-2 text-[10px] font-bold uppercase tracking-widest">
                    Before Amp Block
                  </Text>
                </View>
                <View className="mt-2.5 gap-3">
                  {tone.effectBlocks.beforeAmp.map((eff) => (
                    <EffectRow key={eff.id} effect={eff} />
                  ))}
                </View>
              </View>
            ) : null}

            {/* AMP BLOCK divider + modeled amp */}
            <View className="mt-4 items-center">
              <View className="bg-accent-purple-bg rounded-full px-4 py-1.5">
                <Text className="text-accent-purple text-[11px] font-extrabold tracking-widest">
                  AMP BLOCK
                </Text>
              </View>
            </View>
            <AmpModelCard tone={tone} />

            {tone.effectBlocks.afterAmp.length > 0 ? (
              <View className="mt-4">
                <View className="flex-row items-center">
                  <View className="bg-ink h-3 w-1 rounded-full" />
                  <Text className="text-ink-muted ml-2 text-[10px] font-bold uppercase tracking-widest">
                    After Amp Block
                  </Text>
                </View>
                <View className="mt-2.5 gap-3">
                  {tone.effectBlocks.afterAmp.map((eff) => (
                    <EffectRow key={eff.id} effect={eff} />
                  ))}
                </View>
              </View>
            ) : null}
          </ShadowCard>
        </View>

        {/* Your Physical Amp Settings */}
        {tone.physicalAmpSettings ? (
          <View className="px-5 pt-4">
            <ShadowCard>
              <View className="flex-row items-center">
                <Volume2 size={20} color="#EA580C" />
                <Text className="text-ink ml-2 text-base font-extrabold">
                  Your Physical Amp Settings
                </Text>
              </View>
              <Text className="text-ink-muted mt-1 text-[12px]">
                Set these on your actual amplifier (your Multi-FX is effects-only).
              </Text>
              <View className="bg-surface mt-3 rounded-xl p-3">
                <View className="flex-row items-center">
                  <Sliders size={14} color="#0A0A0A" />
                  <Text className="text-ink ml-1.5 text-sm font-bold">EQ Guidance</Text>
                </View>
                <Text className="text-ink-secondary mt-1.5 text-[12px] leading-snug">
                  {tone.physicalAmpSettings.eqGuidance}
                </Text>
              </View>
              <View className="mt-4 flex-row" style={{ gap: 12 }}>
                {tone.physicalAmpSettings.knobs.map((k) => (
                  <Knob key={k.label} label={k.label} value={k.value} />
                ))}
              </View>
            </ShadowCard>
          </View>
        ) : null}

        {/* Limitations */}
        {tone.limitations && tone.limitations.length > 0 ? (
          <View className="px-5 pt-4">
            <ShadowCard>
              <View className="flex-row items-center">
                <TriangleAlert size={20} color="#D97706" />
                <Text className="text-ink ml-2 text-base font-extrabold">Limitations</Text>
              </View>
              <View className="mt-3 gap-3">
                {tone.limitations.map((lim, idx) => (
                  <View key={idx}>
                    <View className="flex-row items-center">
                      <View className="bg-surface h-5 w-5 items-center justify-center rounded-full">
                        <View className="bg-ink-muted h-1.5 w-1.5 rounded-full" />
                      </View>
                      <Text className="text-ink ml-2 text-sm font-bold">{lim.label}</Text>
                      <View className="ml-auto">
                        <ColoredPill
                          label={lim.severity === 'nice' ? 'Nice to have' : 'Major'}
                          bg={lim.severity === 'nice' ? '#DBEAFE' : '#FEE2E2'}
                          text={lim.severity === 'nice' ? '#2563EB' : '#DC2626'}
                        />
                      </View>
                    </View>
                    <Text className="text-ink-secondary mt-2 text-[13px] leading-snug">
                      {lim.body}
                    </Text>
                    {lim.workaround ? (
                      <View className="mt-2 flex-row rounded-xl p-3" style={{ backgroundColor: '#FFFBEB' }}>
                        <Lightbulb size={14} color="#B45309" />
                        <Text className="text-ink-secondary ml-2 flex-1 text-[12px] leading-snug">
                          <Text className="font-semibold">Workaround: </Text>
                          {lim.workaround}
                        </Text>
                      </View>
                    ) : null}
                  </View>
                ))}
              </View>
            </ShadowCard>
          </View>
        ) : null}

        {/* Tone Match Analysis */}
        {tone.toneMatchAnalysis ? (
          <View className="px-5 pt-4">
            <ShadowCard>
              <View className="flex-row items-center">
                <BarChart3 size={20} color="#059669" />
                <Text className="text-ink ml-2 text-base font-extrabold">Tone Match Analysis</Text>
              </View>
              <View className="mt-3 flex-row">
                <Check size={14} color="#059669" strokeWidth={3} style={{ marginTop: 3 }} />
                <Text className="text-ink-secondary ml-2 flex-1 text-[13px] leading-snug">
                  {tone.toneMatchAnalysis}
                </Text>
              </View>
            </ShadowCard>
          </View>
        ) : null}

        {/* Setup Notes */}
        {tone.setupNotes && tone.setupNotes.length > 0 ? (
          <View className="px-5 pt-4">
            <ShadowCard>
              <View className="flex-row items-center">
                <Pin size={20} color="#2563EB" />
                <Text className="text-ink ml-2 text-base font-extrabold">Setup Notes</Text>
              </View>
              <View className="mt-3 gap-2">
                {tone.setupNotes.map((step, idx) => (
                  <View key={idx} className="flex-row items-start">
                    <View
                      className="mt-0.5 h-5 w-5 items-center justify-center rounded-full"
                      style={{ backgroundColor: '#DBEAFE' }}>
                      <Check size={11} color="#2563EB" strokeWidth={3} />
                    </View>
                    <Text className="text-ink ml-2 flex-1 text-[13px] leading-snug">
                      {idx + 1}. {step}
                    </Text>
                  </View>
                ))}
              </View>
            </ShadowCard>
          </View>
        ) : null}

        {/* Playing Tips */}
        {tone.playingTips && tone.playingTips.length > 0 ? (
          <View className="px-5 pt-4">
            <ShadowCard>
              <View className="flex-row items-center">
                <Music size={20} color="#7C3AED" />
                <Text className="text-ink ml-2 text-base font-extrabold">Playing Tips</Text>
              </View>
              <View className="mt-3 gap-2">
                {tone.playingTips.map((tip, idx) => (
                  <View key={idx} className="flex-row items-start">
                    <Check size={14} color="#059669" strokeWidth={3} style={{ marginTop: 2 }} />
                    <Text className="text-ink ml-2 flex-1 text-[13px] leading-snug">{tip}</Text>
                  </View>
                ))}
              </View>
            </ShadowCard>
          </View>
        ) : null}

        {/* User Guitar Settings */}
        {tone.userGuitarSettings ? (
          <View className="px-5 pt-4">
            <ShadowCard>
              <View className="flex-row items-center">
                <View className="bg-surface h-8 w-8 items-center justify-center rounded-lg">
                  <Text className="text-base">🎚️</Text>
                </View>
                <Text className="text-ink ml-2 flex-1 text-base font-extrabold">
                  Guitar Settings
                </Text>
                <ColoredPill
                  label={tone.userGuitarSettings.guitarName}
                  bg="#DBEAFE"
                  text="#2563EB"
                />
              </View>
              <View className="mt-3 flex-row" style={{ gap: 16 }}>
                <View>
                  <Text className="text-[28px] font-extrabold" style={{ color: '#2563EB' }}>
                    {tone.userGuitarSettings.tone}
                  </Text>
                  <Text className="text-ink-muted text-[11px] font-semibold">Tone</Text>
                </View>
                <View>
                  <Text className="text-[28px] font-extrabold" style={{ color: '#2563EB' }}>
                    {tone.userGuitarSettings.volume}
                  </Text>
                  <Text className="text-ink-muted text-[11px] font-semibold">Volume</Text>
                </View>
              </View>
              <View className="mt-3 gap-1.5">
                {tone.userGuitarSettings.bullets.map((b) => (
                  <View key={b} className="flex-row items-start">
                    <Text className="text-ink-muted mr-2 text-base">♪</Text>
                    <Text className="text-ink-secondary flex-1 text-[13px] leading-snug">{b}</Text>
                  </View>
                ))}
              </View>
            </ShadowCard>
          </View>
        ) : null}

        {/* Original Artist Gear row */}
        <View className="px-5 pt-4">
          <Pressable
            onPress={() =>
              router.push({ pathname: '/song/[id]', params: { id: tone.id } })
            }>
            {({ pressed }) => (
              <View
                className="flex-row items-center rounded-2xl bg-white px-4 py-4"
                style={{
                  opacity: pressed ? 0.85 : 1,
                  shadowColor: '#000',
                  shadowOpacity: 0.04,
                  shadowRadius: 6,
                  shadowOffset: { width: 0, height: 2 },
                }}>
                <Headphones size={18} color="#0A0A0A" />
                <Text className="text-ink ml-3 flex-1 text-sm font-bold">Original Artist Gear</Text>
                <ChevronRight size={18} color="#9CA3AF" />
              </View>
            )}
          </Pressable>
        </View>

        {/* Save + external links */}
        <View className="px-5 pt-5">
          <Pressable onPress={onSave}>
            {({ pressed }) => (
              <LinearGradient
                colors={isFavorited ? ['#059669', '#047857'] : ['#3B82F6', '#2563EB']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={{
                  borderRadius: 999,
                  paddingVertical: 16,
                  opacity: pressed ? 0.9 : 1,
                  shadowColor: isFavorited ? '#059669' : '#2563EB',
                  shadowOpacity: 0.35,
                  shadowRadius: 16,
                  shadowOffset: { width: 0, height: 6 },
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                {isFavorited ? (
                  <Bookmark size={18} color="#fff" fill="#fff" />
                ) : (
                  <Save size={18} color="#fff" />
                )}
                <Text className="text-white ml-2 text-base font-bold tracking-tight">
                  {isFavorited ? 'Saved' : 'Save This Tone'}
                </Text>
              </LinearGradient>
            )}
          </Pressable>
          <View className="mt-2 flex-row" style={{ gap: 8 }}>
            <Pressable
              onPress={() =>
                Linking.openURL(
                  `https://www.songsterr.com/a/wa/bestMatchForQueryString?s=${encodeURIComponent(
                    `${tone.song} ${tone.artist}`
                  )}`
                ).catch(() => Alert.alert('Could not open Songsterr'))
              }
              className="flex-1">
              {({ pressed }) => (
                <View
                  className="flex-row items-center justify-center rounded-full px-4 py-3"
                  style={{ backgroundColor: '#DBEAFE', opacity: pressed ? 0.85 : 1 }}>
                  <Text className="text-base" style={{ color: '#2563EB' }}>
                    ♪
                  </Text>
                  <Text className="ml-2 text-sm font-bold" style={{ color: '#2563EB' }}>
                    Songsterr
                  </Text>
                </View>
              )}
            </Pressable>
            <Pressable
              onPress={() =>
                Linking.openURL(
                  `https://www.youtube.com/results?search_query=${encodeURIComponent(
                    `${tone.song} ${tone.artist} backing track`
                  )}`
                ).catch(() => Alert.alert('Could not open YouTube'))
              }
              className="flex-1">
              {({ pressed }) => (
                <View
                  className="flex-row items-center justify-center rounded-full px-4 py-3"
                  style={{ backgroundColor: '#FED7AA', opacity: pressed ? 0.85 : 1 }}>
                  <View
                    className="h-3 w-3 items-center justify-center"
                    style={{ marginRight: 4 }}>
                    <Text style={{ color: '#EA580C', fontSize: 12 }}>▶</Text>
                  </View>
                  <Text className="text-sm font-bold" style={{ color: '#EA580C' }}>
                    Backing Track
                  </Text>
                </View>
              )}
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

// --- atoms ---

const ANALYSIS_STAGES = [
  'Analyzing tone characteristics',
  'Searching gear references',
  'Translating to your setup',
];

function GeneratingScreen({
  songTitle,
  songArtist,
  artwork,
  insetsTop,
  onBack,
}: {
  songTitle: string;
  songArtist: string;
  artwork?: string;
  insetsTop: number;
  onBack: () => void;
}) {
  const [stageIndex, setStageIndex] = useState(0);
  useEffect(() => {
    const t = setInterval(
      () => setStageIndex((v) => (v + 1) % ANALYSIS_STAGES.length),
      2200
    );
    return () => clearInterval(t);
  }, []);

  return (
    <View className="flex-1 bg-bg" style={{ paddingTop: insetsTop }}>
      <View className="flex-row items-center px-5 pb-3 pt-1">
        <Pressable
          onPress={onBack}
          hitSlop={12}
          className="bg-surface mr-3 h-9 w-9 items-center justify-center rounded-full">
          <ChevronRight
            size={20}
            color="#0A0A0A"
            style={{ transform: [{ rotate: '180deg' }] }}
          />
        </Pressable>
        <Text className="text-ink text-[34px] font-extrabold tracking-tight">Adapt</Text>
      </View>

      <ScrollView
        contentContainerStyle={{ paddingBottom: 80 }}
        showsVerticalScrollIndicator={false}>
        {/* Song header (real data — already known) */}
        <View className="px-5 pt-1">
          <View className="flex-row items-center">
            <View className="bg-surface h-16 w-16 overflow-hidden rounded-xl">
              {artwork ? (
                <Image
                  source={{ uri: artwork }}
                  style={{ width: '100%', height: '100%' }}
                  contentFit="cover"
                  transition={150}
                />
              ) : null}
            </View>
            <View className="ml-3 flex-1">
              <Text className="text-ink text-xl font-extrabold leading-tight" numberOfLines={1}>
                {songTitle}
              </Text>
              <Text className="text-ink-muted mt-0.5 text-sm" numberOfLines={1}>
                {songArtist}
              </Text>
            </View>
          </View>
        </View>

        {/* Status pill — pulsing dot + cycling stage label */}
        <View className="px-5 pt-4">
          <View className="bg-surface flex-row items-center self-start rounded-full px-3 py-2">
            <PulsingDot />
            <Text className="text-ink ml-2 text-[12px] font-semibold">
              {ANALYSIS_STAGES[stageIndex]}…
            </Text>
          </View>
          <FakeProgressBar />
        </View>

        {/* Score + key tone elements skeleton */}
        <View className="px-5 pt-4">
          <SkeletonCard>
            <View className="flex-row items-center justify-between">
              <View className="mr-3 flex-1 flex-row items-center">
                <View className="bg-surface h-10 w-10 rounded-xl" />
                <View className="ml-3 flex-1">
                  <Shimmer height={12} width="80%" radius={4} />
                  <View style={{ height: 8 }} />
                  <Shimmer height={9} width="55%" radius={4} />
                </View>
              </View>
              <View className="bg-surface h-14 w-14 rounded-full" />
            </View>
            <View style={{ height: 18 }} />
            <Shimmer height={9} width="35%" radius={4} />
            <View className="mt-3" style={{ gap: 8 }}>
              <Shimmer height={28} width="92%" radius={999} />
              <Shimmer height={28} width="78%" radius={999} />
              <Shimmer height={28} width="86%" radius={999} />
              <Shimmer height={28} width="70%" radius={999} />
            </View>
          </SkeletonCard>
        </View>

        {/* Signal flow skeleton */}
        <View className="px-5 pt-3">
          <SkeletonCard>
            <View className="mb-3 flex-row items-center">
              <View className="bg-surface h-9 w-9 rounded-xl" />
              <Shimmer style={{ marginLeft: 10 }} height={11} width={120} radius={4} />
            </View>
            <View className="flex-row items-center" style={{ gap: 8 }}>
              <View className="bg-surface h-14 w-14 rounded-2xl" />
              <ArrowRight size={14} color="#9CA3AF" />
              <View className="bg-surface flex-1 rounded-2xl px-3 py-2.5">
                <Shimmer height={9} width="60%" radius={4} />
                <View className="mt-2.5 flex-row" style={{ gap: 6 }}>
                  <Shimmer height={20} width={62} radius={999} />
                  <Shimmer height={20} width={70} radius={999} />
                  <Shimmer height={20} width={54} radius={999} />
                </View>
              </View>
            </View>
          </SkeletonCard>
        </View>

        {/* Amp model skeleton */}
        <View className="px-5 pt-3">
          <SkeletonCard>
            <View className="mb-3 flex-row items-center">
              <View className="bg-surface h-9 w-9 rounded-xl" />
              <Shimmer style={{ marginLeft: 10 }} height={11} width={140} radius={4} />
            </View>
            <Shimmer height={13} width="70%" radius={4} />
            <View style={{ height: 8 }} />
            <Shimmer height={9} width="92%" radius={4} />
            <View style={{ height: 6 }} />
            <Shimmer height={9} width="78%" radius={4} />
            <View className="mt-3 flex-row" style={{ gap: 6 }}>
              {[0, 1, 2].map((i) => (
                <View
                  key={i}
                  className="bg-surface flex-1 rounded-lg px-2.5 py-2"
                  style={{ borderWidth: 1, borderColor: '#F0F0F2' }}>
                  <Shimmer height={7} width="60%" radius={4} />
                  <View style={{ height: 6 }} />
                  <Shimmer height={11} width="80%" radius={4} />
                </View>
              ))}
            </View>
          </SkeletonCard>
        </View>

        {/* Effect block skeleton */}
        <View className="px-5 pt-3">
          <SkeletonCard>
            <View className="flex-row">
              <View className="bg-surface mr-3 h-7 w-7 rounded-full" />
              <View className="flex-1">
                <Shimmer height={12} width="60%" radius={4} />
                <View style={{ height: 8 }} />
                <Shimmer height={9} width="40%" radius={4} />
                <View className="mt-3 flex-row" style={{ gap: 6 }}>
                  <Shimmer height={20} width={86} radius={999} />
                  <Shimmer height={20} width={56} radius={999} />
                </View>
                <View style={{ height: 10 }} />
                <Shimmer height={9} width="92%" radius={4} />
                <View style={{ height: 6 }} />
                <Shimmer height={9} width="84%" radius={4} />
              </View>
            </View>
          </SkeletonCard>
        </View>
      </ScrollView>
    </View>
  );
}

function SkeletonCard({ children }: { children: React.ReactNode }) {
  return (
    <View
      className="rounded-2xl bg-white p-4"
      style={{
        shadowColor: '#000',
        shadowOpacity: 0.04,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 2 },
      }}>
      {children}
    </View>
  );
}

function FakeProgressBar() {
  const p = useSharedValue(0);
  useEffect(() => {
    // Quick jump to 25% so it feels responsive, then slow ease toward ~95%.
    // Never reaches 100% — the screen unmounts when the real result lands.
    p.value = withTiming(0.25, { duration: 600, easing: Easing.out(Easing.cubic) }, () => {
      p.value = withTiming(0.95, { duration: 14000, easing: Easing.out(Easing.cubic) });
    });
  }, [p]);
  const animStyle = useAnimatedStyle(() => ({
    width: `${p.value * 100}%`,
  }));
  return (
    <View
      className="mt-3"
      style={{
        height: 4,
        borderRadius: 999,
        backgroundColor: '#E5E5E7',
        overflow: 'hidden',
      }}>
      <Animated.View
        style={[{ height: '100%', borderRadius: 999, backgroundColor: '#0A0A0A' }, animStyle]}
      />
    </View>
  );
}

function PulsingDot() {
  const o = useSharedValue(0.3);
  useEffect(() => {
    o.value = withRepeat(
      withTiming(1, { duration: 700, easing: Easing.inOut(Easing.ease) }),
      -1,
      true
    );
  }, [o]);
  const animStyle = useAnimatedStyle(() => ({ opacity: o.value }));
  return (
    <Animated.View
      style={[
        { width: 7, height: 7, borderRadius: 999, backgroundColor: '#0A0A0A' },
        animStyle,
      ]}
    />
  );
}

function Shimmer({
  height = 12,
  width,
  radius = 999,
  style,
}: {
  height?: number;
  width?: number | string;
  radius?: number;
  style?: { marginTop?: number; marginLeft?: number };
}) {
  const [w, setW] = useState(0);
  const x = useSharedValue(-1);
  useEffect(() => {
    x.value = withRepeat(
      withTiming(1, { duration: 1400, easing: Easing.linear }),
      -1,
      false
    );
  }, [x]);
  const animStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: x.value * (w || 1) }],
  }));
  return (
    <View
      onLayout={(e) => setW(e.nativeEvent.layout.width)}
      style={[
        {
          height,
          width: width as number | undefined,
          borderRadius: radius,
          backgroundColor: '#EFEFF1',
          overflow: 'hidden',
        },
        style,
      ]}>
      {w > 0 ? (
        <Animated.View
          style={[
            { position: 'absolute', top: 0, bottom: 0, left: 0, width: '60%' },
            animStyle,
          ]}>
          <LinearGradient
            colors={['transparent', 'rgba(255,255,255,0.85)', 'transparent']}
            start={{ x: 0, y: 0.5 }}
            end={{ x: 1, y: 0.5 }}
            style={{ flex: 1 }}
          />
        </Animated.View>
      ) : null}
    </View>
  );
}

function ShadowCard({ children }: { children: React.ReactNode }) {
  return (
    <View
      className="rounded-2xl bg-white p-4"
      style={{
        shadowColor: '#000',
        shadowOpacity: 0.04,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 2 },
      }}>
      {children}
    </View>
  );
}

function ColoredPill({ label, bg, text }: { label: string; bg: string; text: string }) {
  return (
    <View className="rounded-full px-2.5 py-1" style={{ backgroundColor: bg }}>
      <Text className="text-[11px] font-bold" style={{ color: text }}>
        {label}
      </Text>
    </View>
  );
}

function IconTile({
  bg,
  Icon,
  stroke,
}: {
  bg: string;
  Icon: LucideIcon;
  stroke: string;
}) {
  return (
    <View
      className="h-9 w-9 items-center justify-center rounded-xl"
      style={{ backgroundColor: bg }}>
      <Icon size={18} color={stroke} strokeWidth={2} />
    </View>
  );
}

function AmpModelCard({ tone }: { tone: ToneDetail }) {
  return (
    <View
      className="mt-3 rounded-2xl p-3"
      style={{ backgroundColor: '#FAFAFA', borderWidth: 1, borderColor: '#F0F0F2' }}>
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center">
          <View
            className="h-7 w-7 items-center justify-center rounded-full"
            style={{ backgroundColor: '#EDE9FE' }}>
            <Speaker size={14} color="#7C3AED" />
          </View>
          <Text className="text-ink-muted ml-2 text-[10px] font-bold uppercase tracking-widest">
            Amp Model
          </Text>
        </View>
        <ColoredPill label="By Character" bg="#FDE68A" text="#B45309" />
      </View>
      <Text className="text-ink mt-2 text-[14px] font-extrabold">{tone.ampModel.name}</Text>
      <Text className="text-ink-secondary mt-1 text-[12px] leading-snug">
        {tone.ampModel.description}
      </Text>
      <View className="mt-3 flex-row" style={{ gap: 6 }}>
        {[
          { label: 'Channel', value: tone.ampModel.channel },
          { label: 'Cabinet/IR', value: tone.ampModel.cabinet },
          { label: 'Master', value: tone.ampModel.master },
        ].map((cell) => (
          <View
            key={cell.label}
            className="flex-1 rounded-lg bg-white px-2.5 py-2"
            style={{ borderWidth: 1, borderColor: '#F0F0F2' }}>
            <Text className="text-ink-muted text-[9px] font-bold uppercase tracking-wide">
              {cell.label}
            </Text>
            <Text className="text-ink mt-0.5 text-[13px] font-extrabold">{cell.value}</Text>
          </View>
        ))}
      </View>
      <View className="mt-3 flex-row rounded-xl p-2.5" style={{ backgroundColor: '#F3F4F6' }}>
        <Lightbulb size={13} color="#0A0A0A" />
        <Text className="text-ink-secondary ml-2 flex-1 text-[11px] leading-snug">
          <Text className="font-semibold">Amp EQ: </Text>
          {tone.ampModel.eqCallout}
        </Text>
      </View>
    </View>
  );
}

function EffectRow({ effect }: { effect: Effect }) {
  const palette = effectPillColors[effect.color];
  const isDisabled = effect.disabled;
  return (
    <View
      className="rounded-2xl p-3"
      style={{
        backgroundColor: '#FAFAFA',
        borderWidth: 1,
        borderColor: '#F0F0F2',
      }}>
      <View className="flex-row items-start">
        <View
          className="h-7 w-7 items-center justify-center rounded-full"
          style={{ backgroundColor: '#F4F4F5' }}>
          <Text className="text-ink text-[12px] font-extrabold">{effect.number}</Text>
        </View>
        <View className="ml-2.5 flex-1">
          <Text
            className={`text-[14px] font-extrabold ${isDisabled ? 'text-ink-muted line-through' : 'text-ink'}`}>
            {effect.name}
          </Text>
        </View>
        <View className="ml-2 flex-row items-center" style={{ gap: 4 }}>
          {isDisabled ? (
            <ColoredPill
              label={`DISABLED · ${effect.enableContext ?? 'Off'}`}
              bg="#FED7AA"
              text="#C2410C"
            />
          ) : null}
          <View className="rounded-full px-2 py-1" style={{ backgroundColor: palette.bg }}>
            <Text className="text-[10px] font-bold" style={{ color: palette.text }}>
              {effect.type}
            </Text>
          </View>
        </View>
      </View>
      <View className="mt-2 flex-row flex-wrap" style={{ gap: 4 }}>
        {effect.tags.map((tag) => {
          const tagPalette =
            tag.variant === 'critical'
              ? { bg: '#FDE68A', text: '#B45309', icon: '⭐ ' }
              : tag.variant === 'exact'
              ? { bg: '#D1FAE5', text: '#059669', icon: '' }
              : { bg: '#DBEAFE', text: '#2563EB', icon: '' };
          return (
            <View
              key={tag.label}
              className="rounded-full px-2 py-1"
              style={{ backgroundColor: tagPalette.bg }}>
              <Text className="text-[10px] font-bold" style={{ color: tagPalette.text }}>
                {tagPalette.icon}
                {tag.label}
              </Text>
            </View>
          );
        })}
      </View>
      <Text className="text-ink-secondary mt-2 text-[12px] leading-snug">
        {effect.description}
      </Text>
      {effect.params.length > 0 ? (
        <View className="mt-2 flex-row flex-wrap" style={{ gap: 4 }}>
          {effect.params.map((p) => (
            <View key={p.label} className="bg-surface rounded-full px-2.5 py-1">
              <Text className="text-ink text-[11px] font-semibold">
                <Text className="text-ink-secondary">{p.label}: </Text>
                <Text className="font-extrabold">{p.value}</Text>
              </Text>
            </View>
          ))}
        </View>
      ) : null}
      {effect.callout ? (
        <View
          className="mt-2 flex-row rounded-xl p-2.5"
          style={{ backgroundColor: isDisabled ? '#FFFBEB' : '#F3F4F6' }}>
          <Lightbulb size={13} color="#B45309" />
          <Text className="text-ink-secondary ml-2 flex-1 text-[11px] leading-snug">
            {effect.callout}
          </Text>
        </View>
      ) : null}
    </View>
  );
}

function Knob({ label, value }: { label: string; value: string }) {
  const num = parseFloat(value);
  const max = 10;
  const frac = Number.isFinite(num) ? Math.max(0, Math.min(1, num / max)) : 0.5;
  const size = 60;
  const stroke = 5;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const dash = frac * circumference;
  return (
    <View className="items-center" style={{ flex: 1 }}>
      <View style={{ width: size, height: size }}>
        <Svg width={size} height={size}>
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="#F4F4F5"
            strokeWidth={stroke}
            fill="none"
          />
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="#0A0A0A"
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={`${dash} ${circumference - dash}`}
            strokeDashoffset={circumference * 0.25}
            fill="none"
            transform={`rotate(-90 ${size / 2} ${size / 2})`}
          />
        </Svg>
        <View
          style={{
            position: 'absolute',
            inset: 0,
            alignItems: 'center',
            justifyContent: 'center',
          }}
          pointerEvents="none">
          <Text className="text-ink text-base font-extrabold">{value}</Text>
        </View>
      </View>
      <Text className="text-ink-muted mt-1.5 text-[11px] font-semibold">{label}</Text>
    </View>
  );
}
