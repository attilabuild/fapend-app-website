import { useEffect } from 'react';
import { View, type ViewStyle } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
  Easing,
} from 'react-native-reanimated';

type SkeletonProps = {
  width?: number | string;
  height?: number | string;
  radius?: number;
  className?: string;
  style?: ViewStyle;
};

// Soft pulsing surface block used everywhere a real value would render.
export function Skeleton({ width, height = 14, radius = 8, className, style }: SkeletonProps) {
  const opacity = useSharedValue(0.55);

  useEffect(() => {
    opacity.value = withRepeat(
      withTiming(1, { duration: 850, easing: Easing.inOut(Easing.ease) }),
      -1,
      true
    );
  }, [opacity]);

  const animated = useAnimatedStyle(() => ({ opacity: opacity.value }));

  return (
    <Animated.View
      className={className}
      style={[
        {
          width: width as ViewStyle['width'],
          height: height as ViewStyle['height'],
          borderRadius: radius,
          backgroundColor: '#E5E5E7',
        },
        animated,
        style,
      ]}
    />
  );
}

// 2-column tone card placeholder used in the Explore grid.
export function ToneCardSkeleton() {
  return (
    <View className="bg-surface flex-1 overflow-hidden rounded-2xl">
      <Skeleton width="100%" height={undefined} radius={0} style={{ aspectRatio: 1 }} />
      <View className="p-3">
        <Skeleton width="80%" height={14} />
        <View style={{ height: 6 }} />
        <Skeleton width="55%" height={12} />
      </View>
    </View>
  );
}

// Single-row gear placeholder used in the My Gear list.
export function GearRowSkeleton() {
  return (
    <View className="bg-surface flex-row items-center rounded-2xl p-3">
      <Skeleton width={40} height={40} radius={10} />
      <View className="ml-3 flex-1">
        <Skeleton width="60%" height={14} />
        <View style={{ height: 6 }} />
        <Skeleton width="40%" height={11} />
      </View>
    </View>
  );
}

// Tile placeholder used inside the Active Setup card.
export function ActiveTileSkeleton() {
  return (
    <View className="items-center" style={{ width: 96 }}>
      <Skeleton width={80} height={80} radius={16} style={{ backgroundColor: '#FFFFFF' }} />
      <View style={{ height: 8 }} />
      <Skeleton width={72} height={11} />
    </View>
  );
}
