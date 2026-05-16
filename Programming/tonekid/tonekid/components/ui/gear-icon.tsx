import { View } from 'react-native';
import {
  AudioWaveform,
  Cpu,
  Guitar,
  Lightbulb,
  Music,
  MoveRight,
  Sliders,
  Speaker,
  Volume2,
  type LucideIcon,
} from 'lucide-react-native';

import { colors } from '@/constants/tokens';

export type GearIconVariant =
  | 'guitar'
  | 'bass'
  | 'amp'
  | 'multifx'
  | 'cpu'
  | 'sliders'
  | 'speaker'
  | 'signalflow'
  | 'musicnote'
  | 'lightbulb'
  | 'waveform';

interface GearIconProps {
  variant: GearIconVariant;
  size?: 40 | 56 | 80 | 120;
  rounded?: 'lg' | 'xl' | '2xl';
  tone?: 'surface' | 'amber';
}

const iconMap: Record<GearIconVariant, LucideIcon> = {
  guitar: Guitar,
  bass: Guitar,
  amp: Speaker,
  multifx: Sliders,
  cpu: Cpu,
  sliders: Sliders,
  speaker: Speaker,
  signalflow: MoveRight,
  musicnote: Music,
  lightbulb: Lightbulb,
  waveform: AudioWaveform,
};

export function GearIcon({ variant, size = 40, rounded = 'xl', tone = 'surface' }: GearIconProps) {
  const Icon = iconMap[variant];
  const iconSize = size <= 40 ? 20 : size <= 56 ? 26 : size <= 80 ? 36 : 56;
  const bg = tone === 'amber' ? 'bg-warning-bg' : 'bg-surface';
  const iconColor = tone === 'amber' ? colors.warning : colors.ink;
  const r = rounded === 'lg' ? 'rounded-lg' : rounded === 'xl' ? 'rounded-xl' : 'rounded-2xl';
  return (
    <View
      style={{ width: size, height: size }}
      className={`items-center justify-center ${bg} ${r}`}>
      <Icon size={iconSize} color={iconColor} strokeWidth={2} />
    </View>
  );
}

// Re-export Volume2 for use elsewhere
export { Volume2 };
