import Svg, { Path, Rect } from 'react-native-svg';
import { View } from 'react-native';

interface MonogramProps {
  size?: number;
  color?: string;
}

export function TKMonogram({ size = 64, color = '#0A0A0A' }: MonogramProps) {
  return (
    <View style={{ width: size, height: size }}>
      <Svg viewBox="0 0 64 64" width={size} height={size}>
        {/* T */}
        <Rect x="6" y="14" width="22" height="5" rx="1.5" fill={color} />
        <Rect x="14.5" y="14" width="5" height="36" rx="1.5" fill={color} />
        {/* K */}
        <Rect x="34" y="14" width="5" height="36" rx="1.5" fill={color} />
        <Path d="M39 32 L56 14 L52 14 L39 28 Z" fill={color} />
        <Path d="M39 32 L56 50 L52 50 L39 36 Z" fill={color} />
      </Svg>
    </View>
  );
}

interface AppleLogoProps {
  size?: number;
  color?: string;
}

// Official Apple Inc. mark (bitten apple), MIT-licensed simple-icons path.
export function AppleLogo({ size = 18, color = '#fff' }: AppleLogoProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path
        d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"
        fill={color}
      />
    </Svg>
  );
}

interface GuitarLineProps {
  size?: number;
  color?: string;
}

export function GuitarLine({ size = 180, color = '#0A0A0A' }: GuitarLineProps) {
  return (
    <View style={{ width: size, height: size }}>
      <Svg viewBox="0 0 200 200" width={size} height={size}>
        {/* Headstock */}
        <Path
          d="M30 60 L42 56 L46 64 L44 70 Z"
          stroke={color}
          strokeWidth={2.5}
          fill="none"
          strokeLinejoin="round"
        />
        {/* Tuners */}
        <Path d="M32 56 L36 52 M38 62 L42 58" stroke={color} strokeWidth={2} strokeLinecap="round" />
        {/* Neck */}
        <Path
          d="M44 70 L120 132"
          stroke={color}
          strokeWidth={2.5}
          strokeLinecap="round"
        />
        <Path
          d="M50 64 L126 126"
          stroke={color}
          strokeWidth={2.5}
          strokeLinecap="round"
        />
        {/* Frets */}
        <Path d="M58 66 L62 70 M70 70 L74 74 M82 74 L86 78 M94 78 L98 82 M106 82 L110 86" stroke={color} strokeWidth={1.5} strokeLinecap="round" />
        {/* Body */}
        <Path
          d="M120 132 C145 110, 175 110, 175 145 C175 175, 145 175, 130 165 C115 160, 100 155, 110 140 Z"
          stroke={color}
          strokeWidth={2.5}
          fill="none"
          strokeLinejoin="round"
        />
        {/* Sound hole */}
        <Path d="M138 148 m-9 0 a9 9 0 1 0 18 0 a9 9 0 1 0 -18 0" stroke={color} strokeWidth={2} fill="none" />
        {/* Bridge */}
        <Path d="M155 162 L165 158" stroke={color} strokeWidth={2.5} strokeLinecap="round" />
      </Svg>
    </View>
  );
}
