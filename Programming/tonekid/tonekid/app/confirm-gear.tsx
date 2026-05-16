import { useMemo, useState } from 'react';
import { Alert, Pressable, ScrollView, Text, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Check, Plus, X } from 'lucide-react-native';

import { Button, GearIcon } from '@/components/ui';
import { colors } from '@/constants/tokens';
import { adaptToneForGear, AiAdaptError } from '@/lib/aiAdapt';
import { useApp } from '@/lib/store';
import type { Gear, GearType, PartType } from '@/lib/types';

type Params = {
  songId?: string;
  songTitle?: string;
  songArtist?: string;
  songArtwork?: string;
  partType?: string;
};

const NONE_ID = '__none__';

export default function ConfirmGearScreen() {
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<Params>();
  const songId = params.songId ?? 'hotel-california';
  const songTitle = params.songTitle ?? 'Unknown Song';
  const songArtist = params.songArtist ?? 'Unknown Artist';
  const songArtwork = params.songArtwork || undefined;
  const partType: PartType = params.partType === 'Solo' ? 'Solo' : 'Riff';

  const {
    gear,
    activeSetup,
    setActiveSetup,
    addAiTone,
    aiTones,
    adaptsLeft,
    isPro,
    consumeAdapt,
    setGenerating,
    trackSongView,
  } = useApp();

  const guitars = useMemo(
    () => gear.filter((g) => g.type === 'guitar' || g.type === 'bass'),
    [gear]
  );
  const amps = useMemo(
    () => gear.filter((g) => g.type === 'amp' || g.type === 'bassamp'),
    [gear]
  );
  const multifx = useMemo(() => gear.filter((g) => g.type === 'multifx'), [gear]);

  const initialRig = gear.find((g) => g.id === activeSetup.rigId);
  const initialGuitarId =
    activeSetup.guitarId && guitars.some((g) => g.id === activeSetup.guitarId)
      ? activeSetup.guitarId
      : (guitars[0]?.id ?? '');
  const [guitarId, setGuitarId] = useState<string>(initialGuitarId);
  const [ampId, setAmpId] = useState<string>(
    initialRig?.type === 'amp' || initialRig?.type === 'bassamp'
      ? initialRig.id
      : (amps[0]?.id ?? NONE_ID)
  );
  const [multifxId, setMultifxId] = useState<string>(
    initialRig?.type === 'multifx' ? initialRig.id : (multifx[0]?.id ?? NONE_ID)
  );

  const onConfirm = () => {
    const rigId = multifxId !== NONE_ID ? multifxId : ampId !== NONE_ID ? ampId : activeSetup.rigId;
    setActiveSetup({ guitarId, rigId });
    // Record this song view (with full metadata so it can render in For You
    // even though it's not in the community catalog).
    trackSongView({
      id: songId,
      song: songTitle,
      artist: songArtist,
      artwork: songArtwork,
    });

    const navigateToTone = () =>
      router.replace({
        pathname: '/tone/[id]',
        params: {
          id: songId,
          songTitle,
          songArtist,
          songArtwork: songArtwork ?? '',
        },
      });

    // Already cached — instant, no quota cost.
    if (aiTones[songId]) {
      navigateToTone();
      return;
    }

    // Free-tier gating: out of adapts and not subscribed → paywall.
    if (!isPro && adaptsLeft <= 0) {
      router.replace('/paywall');
      return;
    }

    const pickedGuitar = gear.find((g) => g.id === guitarId);
    const pickedAmp = ampId !== NONE_ID ? gear.find((g) => g.id === ampId) : undefined;
    const pickedMulti = multifxId !== NONE_ID ? gear.find((g) => g.id === multifxId) : undefined;
    const fmt = (g?: Gear) => (g ? `${g.brand} ${g.model}`.trim() : undefined);

    // Kick off the AI call in the background — do NOT await.
    setGenerating(songId, true);
    adaptToneForGear({
      songId,
      song: songTitle,
      artist: songArtist,
      partType,
      userGuitar: fmt(pickedGuitar) ?? 'Unknown guitar',
      userAmp: fmt(pickedAmp),
      userMultiFx: fmt(pickedMulti),
      artworkUrl: songArtwork,
    })
      .then((tone) => {
        addAiTone(tone);
        if (!isPro) consumeAdapt();
      })
      .catch((err) => {
        const message =
          err instanceof AiAdaptError ? err.message : 'Something went wrong generating the tone.';
        Alert.alert('Could not adapt tone', message);
      })
      .finally(() => {
        setGenerating(songId, false);
      });

    // Navigate immediately to the skeleton tone detail.
    navigateToTone();
  };

  const footerPadBottom = Math.max(insets.bottom, 16);
  // Reserve room in the scroll content equal to the absolutely-positioned
  // footer's height so the last gear item is never hidden behind it.
  const FOOTER_HEIGHT = 64; // Button height
  const scrollBottomPad = FOOTER_HEIGHT + footerPadBottom + 16;

  return (
    <View className="flex-1 bg-bg">
      <View className="flex-row items-center px-5 pt-3">
        <View className="w-9" />
        <Text className="text-ink flex-1 text-center text-base font-bold">Confirm your gear</Text>
        <Pressable
          onPress={() => router.back()}
          hitSlop={12}
          className="bg-surface h-9 w-9 items-center justify-center rounded-full">
          <X size={18} color={colors.ink} />
        </Pressable>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingTop: 10,
          paddingBottom: scrollBottomPad,
        }}
        showsVerticalScrollIndicator={false}>
        <GearSection
          title="Guitar"
          items={guitars}
          selectedId={guitarId}
          onSelect={setGuitarId}
          allowNone={false}
        />
        <GearSection
          title="Amp"
          items={amps}
          selectedId={ampId}
          onSelect={setAmpId}
          allowNone
          noneLabel="No amp — direct in"
        />
        <GearSection
          title="Multi-FX / Pedals"
          items={multifx}
          selectedId={multifxId}
          onSelect={setMultifxId}
          allowNone
          noneLabel="None — amp only"
        />
      </ScrollView>

      <View
        pointerEvents="box-none"
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 0,
          paddingHorizontal: 20,
          paddingTop: 10,
          paddingBottom: footerPadBottom,
          backgroundColor: '#FFFFFF',
          borderTopWidth: 1,
          borderTopColor: '#F4F4F5',
        }}>
        <Button label="Adapt to my gear" onPress={onConfirm} disabled={!guitarId} fullWidth />
      </View>
    </View>
  );
}

function GearSection({
  title,
  items,
  selectedId,
  onSelect,
  allowNone,
  noneLabel,
}: {
  title: string;
  items: Gear[];
  selectedId: string;
  onSelect: (id: string) => void;
  allowNone: boolean;
  noneLabel?: string;
}) {
  return (
    <View className="mt-3">
      <Text className="text-ink-muted mb-1.5 text-[11px] font-bold uppercase tracking-widest">
        {title}
      </Text>
      <View className="gap-1.5">
        {items.map((g) => (
          <GearOption
            key={g.id}
            gear={g}
            selected={selectedId === g.id}
            onPress={() => onSelect(g.id)}
          />
        ))}
        {allowNone ? (
          <NoneOption
            label={noneLabel ?? 'None'}
            selected={selectedId === NONE_ID}
            onPress={() => onSelect(NONE_ID)}
          />
        ) : null}
        {items.length === 0 && !allowNone ? (
          <Pressable
            onPress={() => router.push('/add-gear')}
            className="border-hairline rounded-2xl border-2 border-dashed px-4 py-5">
            <View className="flex-row items-center justify-center">
              <Plus size={18} color={colors.inkMuted} />
              <Text className="text-ink-muted ml-2 text-sm">No {title.toLowerCase()} yet. Add one.</Text>
            </View>
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}

function variantForGear(type: GearType) {
  if (type === 'amp' || type === 'bassamp') return 'amp' as const;
  if (type === 'multifx') return 'multifx' as const;
  return 'guitar' as const;
}

function GearOption({
  gear,
  selected,
  onPress,
}: {
  gear: Gear;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      className={`flex-row items-center rounded-xl px-3 py-2 ${selected ? 'bg-ink' : 'bg-surface'}`}>
      <GearIcon variant={variantForGear(gear.type)} size={40} />
      <View className="ml-2.5 flex-1">
        <Text
          numberOfLines={1}
          className={`text-sm font-bold ${selected ? 'text-white' : 'text-ink'}`}>
          {gear.model}
        </Text>
        {gear.brand ? (
          <Text className={`text-[11px] ${selected ? 'text-white/70' : 'text-ink-muted'}`}>
            {gear.brand}
          </Text>
        ) : null}
      </View>
      {selected ? (
        <View className="h-5 w-5 items-center justify-center rounded-full bg-white">
          <Check size={12} color={colors.ink} strokeWidth={3} />
        </View>
      ) : (
        <View className="h-5 w-5 rounded-full border-2 border-hairline" />
      )}
    </Pressable>
  );
}

function NoneOption({
  label,
  selected,
  onPress,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      className={`flex-row items-center rounded-xl px-3 py-2.5 ${selected ? 'bg-ink' : 'bg-surface'}`}>
      <Text className={`flex-1 text-sm font-semibold ${selected ? 'text-white' : 'text-ink'}`}>
        {label}
      </Text>
      {selected ? (
        <View className="h-5 w-5 items-center justify-center rounded-full bg-white">
          <Check size={12} color={colors.ink} strokeWidth={3} />
        </View>
      ) : (
        <View className="h-5 w-5 rounded-full border-2 border-hairline" />
      )}
    </Pressable>
  );
}
