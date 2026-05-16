import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Circle } from 'react-native-svg';
import {
  AudioWaveform,
  Cable,
  Flag,
  Gauge,
  Guitar,
  Headphones,
  Lightbulb,
  Star,
  StickyNote,
  Volume2,
  X,
  Zap,
  type LucideIcon,
} from 'lucide-react-native';

import { AiSongDetailError, researchSongDetail } from '@/lib/aiSongDetail';
import { fetchSongDetailFromCache } from '@/lib/db';
import { exploreTones, songDetailById } from '@/lib/mockData';
import { useApp } from '@/lib/store';
import type { Difficulty, OriginalSongDetail, PartType, ToneType } from '@/lib/types';

type SongParams = {
  id?: string;
  title?: string;
  artist?: string;
  album?: string;
  year?: string;
  artwork?: string;
};

const partColors: Record<PartType, { bg: string; text: string }> = {
  Riff: { bg: '#FEF3C7', text: '#B45309' },
  Solo: { bg: '#E0E7FF', text: '#4338CA' },
};

const toneColors: Record<ToneType, { bg: string; text: string; Icon: LucideIcon }> = {
  Clean: { bg: '#D1FAE5', text: '#059669', Icon: AudioWaveform },
  Distorted: { bg: '#FEE2E2', text: '#DC2626', Icon: Zap },
};

const difficultyMeta: Record<Difficulty, { stars: number; label: string; color: string }> = {
  Beginner: { stars: 2.5, label: 'Beginner', color: '#10B981' },
  Intermediate: { stars: 3.5, label: 'Intermediate', color: '#F59E0B' },
  Advanced: { stars: 4.5, label: 'Expert', color: '#EF4444' },
};

export default function SongDetailScreen() {
  const params = useLocalSearchParams<SongParams>();
  const id = params.id ?? '';
  const insets = useSafeAreaInsets();
  const explore = exploreTones.find((t) => t.id === id);
  const mock = songDetailById[id];
  const { trackSongView } = useApp();

  useEffect(() => {
    if (!id) return;
    trackSongView({
      id,
      song: params.title || mock?.song || explore?.song,
      artist: params.artist || mock?.artist || explore?.artist,
      artwork: params.artwork || explore?.artworkUrl,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const songMeta = {
    id,
    title: params.title || mock?.song || explore?.song || 'Unknown Song',
    artist: params.artist || mock?.artist || explore?.artist || 'Unknown Artist',
    album: params.album || mock?.album,
    year: params.year || mock?.year,
    artwork: params.artwork || explore?.artworkUrl,
  };

  const [detail, setDetail] = useState<OriginalSongDetail | null>(mock ?? null);
  const [loading, setLoading] = useState(!mock);
  const [error, setError] = useState<string | null>(null);
  const [retryNonce, setRetryNonce] = useState(0);

  useEffect(() => {
    if (mock || !id) return;
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const cached = await fetchSongDetailFromCache(id);
        if (cancelled) return;
        if (cached) {
          setDetail(cached);
          setLoading(false);
          return;
        }
        const generated = await researchSongDetail({
          songId: id,
          song: songMeta.title,
          artist: songMeta.artist,
          album: songMeta.album,
          year: songMeta.year,
        });
        if (cancelled) return;
        setDetail(generated);
        setLoading(false);
        // Cache write happens server-side inside the research-song edge
        // function (using its service-role key), so no client write needed.
      } catch (e) {
        if (cancelled) return;
        const msg =
          e instanceof AiSongDetailError
            ? e.message
            : 'Could not research this song. Please try again.';
        setError(msg);
        setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
    // We only want to re-fetch when the song id changes or the user taps Retry.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, retryNonce]);

  const song = {
    id,
    title: detail?.song || songMeta.title,
    artist: detail?.artist || songMeta.artist,
    album: detail?.album || songMeta.album,
    year: detail?.year || songMeta.year,
    artwork: songMeta.artwork,
  };

  const genrePrimary = explore?.genres?.[0];
  const partType = detail?.partType ?? 'Riff';
  const toneType = detail?.toneType ?? 'Distorted';
  const partPalette = partColors[partType];
  const tonePalette = toneColors[toneType];
  const ToneIcon = tonePalette.Icon;
  const gradient = gradientFromColor(explore?.artworkDominantColor);

  return (
    <View className="flex-1 bg-bg">
      <LinearGradient
        colors={gradient}
        locations={[0, 0.45, 1]}
        style={{ position: 'absolute', left: 0, right: 0, top: 0, height: 380 }}
      />
      <SafeAreaView edges={['top']}>
        <View className="flex-row items-center justify-end px-5 pt-1">
          <Pressable
            onPress={() => router.back()}
            hitSlop={12}
            className="bg-white/70 h-9 w-9 items-center justify-center rounded-full">
            <X size={18} color="#0A0A0A" />
          </Pressable>
        </View>
      </SafeAreaView>

      <ScrollView
        contentContainerStyle={{ paddingBottom: insets.bottom + 120 }}
        showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View className="items-center px-6 pt-3">
          <View
            className="overflow-hidden rounded-full bg-white"
            style={{
              width: 132,
              height: 132,
              shadowColor: '#000',
              shadowOpacity: 0.08,
              shadowRadius: 14,
              shadowOffset: { width: 0, height: 4 },
            }}>
            {song.artwork ? (
              <Image
                source={{ uri: song.artwork }}
                style={{ width: '100%', height: '100%' }}
                contentFit="cover"
                transition={150}
              />
            ) : (
              <View className="bg-surface flex-1 items-center justify-center">
                <Guitar size={42} color="#0A0A0A" />
              </View>
            )}
          </View>
          <Text className="text-ink mt-5 text-center text-[28px] font-extrabold leading-tight tracking-tight">
            {song.title}
          </Text>
          <Text className="text-ink-muted mt-1 text-sm">{song.artist}</Text>
          {song.album ? (
            <Text className="text-ink-muted mt-0.5 text-xs">{song.album}</Text>
          ) : null}

          <View className="mt-4 flex-row flex-wrap items-center justify-center gap-2">
            <ColoredPill label={partType} bg={partPalette.bg} text={partPalette.text} />
            <ColoredPill
              label={toneType}
              bg={tonePalette.bg}
              text={tonePalette.text}
              icon={<ToneIcon size={12} color={tonePalette.text} strokeWidth={2.5} />}
            />
            {genrePrimary ? (
              <ColoredPill label={genrePrimary} bg="#F4F4F5" text="#0A0A0A" />
            ) : null}
          </View>
        </View>

        {detail ? (
          <CuratedBody song={detail} />
        ) : loading ? (
          <LoadingBody />
        ) : (
          <UnknownBody error={error} onRetry={() => setRetryNonce((n) => n + 1)} />
        )}
      </ScrollView>

      {/* Floating Adapt CTA */}
      <View
        pointerEvents="box-none"
        style={{ position: 'absolute', left: 16, right: 16, bottom: insets.bottom + 12 }}>
        <Pressable
          onPress={() =>
            router.push({
              pathname: '/confirm-gear',
              params: {
                songId: song.id,
                songTitle: song.title,
                songArtist: song.artist,
                songArtwork: song.artwork ?? '',
                partType: detail?.partType ?? 'Riff',
              },
            })
          }
          accessibilityRole="button">
          {({ pressed }) => (
            <LinearGradient
              colors={['#3B82F6', '#2563EB']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={{
                borderRadius: 999,
                paddingVertical: 16,
                opacity: pressed ? 0.9 : 1,
                shadowColor: '#2563EB',
                shadowOpacity: 0.35,
                shadowRadius: 16,
                shadowOffset: { width: 0, height: 6 },
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
              <AudioWaveform size={20} color="#fff" />
              <Text className="text-white ml-2.5 text-base font-bold tracking-tight">
                Adapt to My Gear
              </Text>
            </LinearGradient>
          )}
        </Pressable>
      </View>
    </View>
  );
}

function CuratedBody({ song }: { song: OriginalSongDetail }) {
  return (
    <View className="px-5 pt-7">
      {/* Gear summary rows */}
      <View className="gap-2.5">
        <IconRow
          tile={<IconTile bg="#FEF3C7" Icon={Guitar} stroke="#B45309" />}
          label="Original Guitar"
          value={song.originalGuitar}
        />
        <IconRow
          tile={<IconTile bg="#DBEAFE" Icon={Volume2} stroke="#2563EB" />}
          label="Original Amp"
          value={song.originalAmp}
        />
        <IconRow
          tile={<IconTile bg="#EDE9FE" Icon={AudioWaveform} stroke="#7C3AED" />}
          label="Pickups"
          value={
            song.pickupSelector
              ? `${song.originalPickups} — ${song.pickupSelector}`
              : song.originalPickups
          }
        />
      </View>

      {/* Amp settings — knobs */}
      {song.ampSettings.length > 0 ? (
        <View className="mt-7">
          <Text className="text-ink-muted text-[11px] font-bold uppercase tracking-widest">
            Original Amp Settings
          </Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingTop: 14, paddingRight: 16, gap: 14 }}
            style={{ marginHorizontal: -20, paddingLeft: 20 }}>
            {song.ampSettings.map((s) => (
              <Knob key={s.label} label={s.label} value={s.value} />
            ))}
          </ScrollView>
        </View>
      ) : null}

      {/* Tone character */}
      {song.toneCharacter && song.toneCharacter.length > 0 ? (
        <View className="mt-7">
          <View className="flex-row items-end justify-between">
            <Text className="text-ink-muted text-[11px] font-bold uppercase tracking-widest">
              Tone Character
            </Text>
            <Text className="text-ink-muted text-[11px]">
              {song.toneCharacter.length} tags
            </Text>
          </View>
          <View className="mt-3 flex-row flex-wrap gap-2">
            {song.toneCharacter.map((t) => (
              <View
                key={t}
                className="bg-white rounded-full px-3 py-1.5"
                style={{
                  shadowColor: '#000',
                  shadowOpacity: 0.05,
                  shadowRadius: 4,
                  shadowOffset: { width: 0, height: 1 },
                }}>
                <Text className="text-ink text-[12px] font-medium">{t}</Text>
              </View>
            ))}
          </View>
        </View>
      ) : null}

      {/* Performance */}
      {song.tuning || song.tempoBpm || song.songKey || song.capo || song.stringGauge || song.pickingTechnique || song.version ? (
        <View className="mt-7">
          <View className="flex-row items-end justify-between">
            <Text className="text-ink-muted text-[11px] font-bold uppercase tracking-widest">
              Performance
            </Text>
            {song.version ? (
              <Text className="text-ink-muted text-[11px]">{song.version} version</Text>
            ) : null}
          </View>
          <View
            className="mt-3 rounded-2xl bg-white p-4"
            style={{
              shadowColor: '#000',
              shadowOpacity: 0.04,
              shadowRadius: 6,
              shadowOffset: { width: 0, height: 2 },
            }}>
            <View className="flex-row items-center">
              <IconTile bg="#FCE7F3" Icon={Gauge} stroke="#DB2777" />
              <Text className="text-ink ml-3 text-base font-bold">How it&apos;s played</Text>
            </View>
            <View className="mt-3 flex-row flex-wrap" style={{ marginHorizontal: -4 }}>
              {song.tuning ? <PerfCell label="Tuning" value={song.tuning} /> : null}
              {song.tempoBpm ? (
                <PerfCell label="Tempo" value={`${song.tempoBpm} BPM`} />
              ) : null}
              {song.songKey ? <PerfCell label="Key" value={song.songKey} /> : null}
              {song.capo ? <PerfCell label="Capo" value={song.capo} /> : null}
              {song.stringGauge ? <PerfCell label="Strings" value={song.stringGauge} /> : null}
            </View>
            {song.pickingTechnique ? (
              <View className="bg-surface mt-3 flex-row rounded-xl p-3">
                <Lightbulb size={16} color="#0A0A0A" />
                <Text className="text-ink ml-2 flex-1 text-sm leading-snug">
                  <Text className="font-semibold">Technique: </Text>
                  {song.pickingTechnique}
                </Text>
              </View>
            ) : null}
          </View>
        </View>
      ) : null}

      {/* Guitar settings — separated rows */}
      {song.guitarSettings.length > 0 || song.pickupSelector ? (
        <View className="mt-7">
          <Text className="text-ink-muted text-[11px] font-bold uppercase tracking-widest">
            Guitar Settings
          </Text>
          <View
            className="mt-3 overflow-hidden rounded-2xl bg-white"
            style={{
              shadowColor: '#000',
              shadowOpacity: 0.04,
              shadowRadius: 6,
              shadowOffset: { width: 0, height: 2 },
            }}>
            {song.pickupSelector ? (
              <SettingsRow
                icon={<AudioWaveform size={16} color="#F59E0B" />}
                label="Pickup Position"
                value={song.pickupSelector}
                first
              />
            ) : null}
            {song.guitarSettings.map((s, i) => (
              <SettingsRow
                key={s.label}
                icon={<Sun />}
                label={s.label}
                value={s.value}
                first={!song.pickupSelector && i === 0}
              />
            ))}
          </View>
        </View>
      ) : null}

      {/* Signal chain — vertical */}
      <View className="mt-7">
        <Text className="text-ink-muted text-[11px] font-bold uppercase tracking-widest">
          Signal Chain
        </Text>
        <View
          className="mt-3 rounded-2xl bg-white p-4"
          style={{
            shadowColor: '#000',
            shadowOpacity: 0.04,
            shadowRadius: 6,
            shadowOffset: { width: 0, height: 2 },
          }}>
          <ChainNode
            tile={<IconTile bg="#FEF3C7" Icon={Guitar} stroke="#B45309" size={36} />}
            label="Source"
            value={song.originalGuitar}
            connector
          />
          {song.signalChain.map((e, idx) => (
            <ChainNode
              key={e.name}
              tile={<IconTile bg="#EDE9FE" Icon={Cable} stroke="#7C3AED" size={36} />}
              label={`Stage ${idx + 1}`}
              value={e.name}
              connector
            />
          ))}
          <ChainNode
            tile={<IconTile bg="#DBEAFE" Icon={Volume2} stroke="#2563EB" size={36} />}
            label={`Stage ${song.signalChain.length + 1}`}
            value={song.originalAmp}
            connector={!!song.cabinet}
          />
          {song.cabinet ? (
            <ChainNode
              tile={<IconTile bg="#D1FAE5" Icon={Headphones} stroke="#059669" size={36} />}
              label="Output"
              value={song.cabinet}
            />
          ) : null}
        </View>
      </View>

      {/* Player notes */}
      {song.notes ? (
        <View className="mt-7">
          <Text className="text-ink-muted text-[11px] font-bold uppercase tracking-widest">
            Player Notes
          </Text>
          <View
            className="mt-3 rounded-2xl bg-white p-4"
            style={{
              shadowColor: '#000',
              shadowOpacity: 0.04,
              shadowRadius: 6,
              shadowOffset: { width: 0, height: 2 },
            }}>
            <View className="flex-row items-center">
              <IconTile bg="#FEF3C7" Icon={StickyNote} stroke="#B45309" />
              <Text className="text-ink ml-3 text-base font-bold">From the artist&apos;s playbook</Text>
            </View>
            <Text className="text-ink-secondary mt-3 text-sm leading-snug">{song.notes}</Text>
          </View>
        </View>
      ) : null}

      {/* Difficulty */}
      <View className="mt-7">
        <Text className="text-ink-muted text-[11px] font-bold uppercase tracking-widest">
          Difficulty
        </Text>
        <View
          className="mt-3 rounded-2xl bg-white p-4"
          style={{
            shadowColor: '#000',
            shadowOpacity: 0.04,
            shadowRadius: 6,
            shadowOffset: { width: 0, height: 2 },
          }}>
          <DifficultyStars difficulty={song.difficulty} />
          {song.difficultyReasons && song.difficultyReasons.length > 0 ? (
            <View className="mt-3 gap-2">
              {song.difficultyReasons.map((r) => (
                <View key={r} className="flex-row">
                  <Text
                    className="mr-2 text-base"
                    style={{ color: difficultyMeta[song.difficulty].color }}>
                    •
                  </Text>
                  <Text className="text-ink flex-1 text-sm leading-snug">{r}</Text>
                </View>
              ))}
            </View>
          ) : (
            <Text className="text-ink-secondary mt-3 text-sm leading-snug">
              {song.difficulty === 'Beginner' && 'Easy chord shapes, simple rhythm.'}
              {song.difficulty === 'Intermediate' &&
                'Solid technique required, no virtuoso tricks.'}
              {song.difficulty === 'Advanced' &&
                'Demands phrasing, bends, and tight rhythm chops.'}
            </Text>
          )}
        </View>
      </View>

      {/* Report */}
      <Pressable className="mt-6 flex-row items-center justify-center py-3">
        <Flag size={14} color="#9CA3AF" />
        <Text className="text-ink-muted ml-2 text-sm">Report this tone</Text>
      </Pressable>
    </View>
  );
}

function LoadingBody() {
  return (
    <View className="px-5 pt-7">
      <View
        className="items-center rounded-2xl bg-white p-6"
        style={{
          shadowColor: '#000',
          shadowOpacity: 0.04,
          shadowRadius: 6,
          shadowOffset: { width: 0, height: 2 },
        }}>
        <ActivityIndicator color="#0A0A0A" />
        <Text className="text-ink mt-4 text-base font-bold">Researching this tone…</Text>
        <Text className="text-ink-muted mt-1 text-center text-sm leading-snug">
          ToneKid is reading the liner notes — the original rig, tuning, and signal chain.
        </Text>
      </View>
      <View className="mt-3 gap-2.5">
        <SkeletonRow />
        <SkeletonRow />
        <SkeletonRow />
      </View>
    </View>
  );
}

function SkeletonRow() {
  return (
    <View className="bg-surface rounded-2xl p-3">
      <View className="flex-row items-center">
        <View className="bg-hairline h-10 w-10 rounded-xl" />
        <View className="ml-3 flex-1">
          <View className="bg-hairline h-2 w-20 rounded-full" />
          <View className="bg-hairline mt-2 h-3 w-40 rounded-full" />
        </View>
      </View>
    </View>
  );
}

function UnknownBody({ error, onRetry }: { error?: string | null; onRetry?: () => void }) {
  return (
    <View className="px-5 pt-7">
      <View
        className="rounded-2xl bg-white p-5"
        style={{
          shadowColor: '#000',
          shadowOpacity: 0.04,
          shadowRadius: 6,
          shadowOffset: { width: 0, height: 2 },
        }}>
        <Text className="text-ink text-base font-bold">
          {error ? 'Could not research this track' : 'Not analyzed yet'}
        </Text>
        <Text className="text-ink-secondary mt-2 text-sm leading-snug">
          {error ??
            "ToneKid hasn't researched this track yet. Tap Adapt to My Gear to generate it."}
        </Text>
        {onRetry && error ? (
          <Pressable
            onPress={onRetry}
            className="bg-ink mt-4 self-start rounded-full px-4 py-2">
            <Text className="text-white text-sm font-bold">Retry</Text>
          </Pressable>
        ) : (
          <View className="bg-surface mt-4 flex-row rounded-xl p-3">
            <Lightbulb size={18} color="#0A0A0A" />
            <Text className="text-ink ml-2.5 flex-1 text-sm leading-snug">
              Tip: back out and tap the song again to retry.
            </Text>
          </View>
        )}
      </View>
    </View>
  );
}

// --- atoms ---

function ColoredPill({
  label,
  bg,
  text,
  icon,
}: {
  label: string;
  bg: string;
  text: string;
  icon?: React.ReactNode;
}) {
  return (
    <View
      className="flex-row items-center rounded-full px-3 py-1.5"
      style={{ backgroundColor: bg }}>
      {icon ? <View style={{ marginRight: 4 }}>{icon}</View> : null}
      <Text style={{ color: text }} className="text-[12px] font-bold">
        {label}
      </Text>
    </View>
  );
}

function IconTile({
  bg,
  Icon,
  stroke,
  size = 40,
}: {
  bg: string;
  Icon: LucideIcon;
  stroke: string;
  size?: number;
}) {
  return (
    <View
      className="items-center justify-center rounded-xl"
      style={{ width: size, height: size, backgroundColor: bg }}>
      <Icon size={Math.round(size * 0.5)} color={stroke} strokeWidth={2} />
    </View>
  );
}

function IconRow({
  tile,
  label,
  value,
}: {
  tile: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <View
      className="flex-row items-center rounded-2xl bg-white p-3"
      style={{
        shadowColor: '#000',
        shadowOpacity: 0.04,
        shadowRadius: 6,
        shadowOffset: { width: 0, height: 2 },
      }}>
      {tile}
      <View className="ml-3 flex-1">
        <Text className="text-ink-muted text-[10px] font-bold uppercase tracking-widest">
          {label}
        </Text>
        <Text className="text-ink mt-0.5 text-sm font-bold" numberOfLines={2}>
          {value}
        </Text>
      </View>
    </View>
  );
}

function Knob({ label, value }: { label: string; value: string }) {
  // map numeric values (0–10) to an arc fraction; non-numeric values default to 0.5
  const num = parseFloat(value);
  const max = 10;
  const frac = Number.isFinite(num) ? Math.max(0, Math.min(1, num / max)) : 0.5;
  const size = 64;
  const stroke = 5;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const dash = frac * circumference;
  return (
    <View className="items-center" style={{ width: size + 4 }}>
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
            stroke="#F59E0B"
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

function SettingsRow({
  icon,
  label,
  value,
  first,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  first?: boolean;
}) {
  return (
    <View
      className={`flex-row items-center px-4 py-3.5 ${first ? '' : 'border-hairline border-t'}`}>
      {icon}
      <Text className="text-ink-secondary ml-3 flex-1 text-sm">{label}</Text>
      <Text className="text-ink text-sm font-bold">{value}</Text>
    </View>
  );
}

function ChainNode({
  tile,
  label,
  value,
  connector,
}: {
  tile: React.ReactNode;
  label: string;
  value: string;
  connector?: boolean;
}) {
  return (
    <View className="flex-row">
      <View className="items-center" style={{ width: 44 }}>
        {tile}
        {connector ? <View className="bg-hairline mt-1 w-px flex-1" /> : null}
      </View>
      <View className="ml-3 flex-1 pb-3">
        <Text className="text-ink-muted text-[10px] font-bold uppercase tracking-widest">
          {label}
        </Text>
        <Text className="text-ink mt-0.5 text-sm font-bold" numberOfLines={2}>
          {value}
        </Text>
      </View>
    </View>
  );
}

function DifficultyStars({ difficulty }: { difficulty: Difficulty }) {
  const meta = difficultyMeta[difficulty];
  return (
    <View className="flex-row items-center">
      <View className="flex-row">
        {[0, 1, 2, 3, 4].map((i) => {
          const filled = meta.stars - i;
          const fillRatio = filled >= 1 ? 1 : filled > 0 ? filled : 0;
          return (
            <View key={i} style={{ marginRight: 2 }}>
              {fillRatio === 1 ? (
                <Star size={22} color={meta.color} fill={meta.color} />
              ) : fillRatio > 0 ? (
                <HalfStar color={meta.color} />
              ) : (
                <Star size={22} color={meta.color} />
              )}
            </View>
          );
        })}
      </View>
      <View className="ml-3 flex-1">
        <Text className="text-ink text-lg font-extrabold">{meta.stars.toFixed(1)} / 5</Text>
        <Text style={{ color: meta.color }} className="text-sm font-bold">
          {meta.label}
        </Text>
      </View>
    </View>
  );
}

function HalfStar({ color }: { color: string }) {
  return (
    <View style={{ width: 22, height: 22 }}>
      <Star size={22} color={color} />
      <View
        style={{
          position: 'absolute',
          width: 11,
          height: 22,
          overflow: 'hidden',
        }}>
        <Star size={22} color={color} fill={color} />
      </View>
    </View>
  );
}

function PerfCell({ label, value }: { label: string; value: string }) {
  return (
    <View style={{ width: '50%', padding: 4 }}>
      <View className="bg-surface rounded-xl px-3 py-2.5">
        <Text className="text-ink-muted text-[10px] font-bold uppercase tracking-widest">
          {label}
        </Text>
        <Text className="text-ink mt-0.5 text-sm font-bold">{value}</Text>
      </View>
    </View>
  );
}

const FALLBACK_DOMINANT = '#F59E0B';

function gradientFromColor(hex?: string): [string, string, string] {
  const base = hex ?? FALLBACK_DOMINANT;
  return [tint(base, 0.45), tint(base, 0.85), '#FFFFFF'];
}

// Mix a color toward white by `amount` (0 = original, 1 = pure white).
function tint(hex: string, amount: number): string {
  const rgb = parseHex(hex);
  if (!rgb) return hex;
  const a = Math.max(0, Math.min(1, amount));
  const r = Math.round(rgb.r + (255 - rgb.r) * a);
  const g = Math.round(rgb.g + (255 - rgb.g) * a);
  const b = Math.round(rgb.b + (255 - rgb.b) * a);
  return `#${[r, g, b].map((n) => n.toString(16).padStart(2, '0')).join('')}`;
}

function parseHex(input: string): { r: number; g: number; b: number } | null {
  let s = input.trim();
  if (s.startsWith('#')) s = s.slice(1);
  if (s.length === 3) s = s.split('').map((c) => c + c).join('');
  if (s.length === 8) s = s.slice(0, 6); // strip alpha if #RRGGBBAA
  if (s.length !== 6) return null;
  const n = parseInt(s, 16);
  if (Number.isNaN(n)) return null;
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
}

// Inline lightweight "sun" glyph for settings rows (volume/tone dots)
function Sun({ size = 16, color = '#9CA3AF' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 16 16">
      <Circle cx={8} cy={8} r={3} fill={color} />
    </Svg>
  );
}
