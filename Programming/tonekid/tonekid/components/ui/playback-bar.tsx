import { Pressable, Text, View } from 'react-native';
import { useState } from 'react';
import { Pause, Play, Volume2, VolumeX } from 'lucide-react-native';

import { colors, shadow } from '@/constants/tokens';

import { ProgressBar } from './progress-bar';

interface PlaybackBarProps {
  current?: string;
  remaining?: string;
  percent?: number;
}

export function PlaybackBar({
  current = '02:19.58',
  remaining = '00:58',
  percent = 70,
}: PlaybackBarProps) {
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);
  return (
    <View
      style={shadow.float}
      className="bg-white h-14 flex-row items-center rounded-full pl-3 pr-4">
      <Pressable
        onPress={() => setPlaying((p) => !p)}
        className="h-9 w-9 items-center justify-center rounded-full bg-ink">
        {playing ? <Pause size={16} color="#fff" /> : <Play size={16} color="#fff" />}
      </Pressable>
      <Text className="text-ink ml-3 mr-2 text-xs font-semibold tabular-nums">{current}</Text>
      <View className="flex-1">
        <ProgressBar percent={percent} />
      </View>
      <Text className="text-ink ml-2 mr-2 text-xs font-semibold tabular-nums">{remaining}</Text>
      <Pressable onPress={() => setMuted((m) => !m)} className="p-1">
        {muted ? (
          <VolumeX size={18} color={colors.ink} />
        ) : (
          <Volume2 size={18} color={colors.ink} />
        )}
      </Pressable>
    </View>
  );
}
