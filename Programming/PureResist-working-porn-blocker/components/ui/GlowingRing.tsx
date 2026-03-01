import React, { useEffect } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Svg, { Defs, LinearGradient, Stop, Circle } from 'react-native-svg';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
  withDelay,
  Easing,
} from 'react-native-reanimated';

const { width } = Dimensions.get('window');
const SIZE = width * 0.35;
const STROKE_WIDTH = 20;

export default function GlowingRing() {
  const scale = useSharedValue(1);
  const rotation = useSharedValue(0);
  const opacity = useSharedValue(0.7);
  const translateY = useSharedValue(0);

  useEffect(() => {
    // Scale animation - continuous smooth pulse
    scale.value = withRepeat(
      withTiming(1.1, {
        duration: 2000,
        easing: Easing.inOut(Easing.ease),
      }),
      -1,
      true
    );

    // Rotation animation - continuous smooth rotation
    rotation.value = withRepeat(
      withTiming(1, {
        duration: 12000,
        easing: Easing.linear,
      }),
      -1,
      false
    );

    // Opacity animation - continuous smooth fade
    opacity.value = withRepeat(
      withTiming(1, {
        duration: 2000,
        easing: Easing.inOut(Easing.ease),
      }),
      -1,
      true
    );

    // Floating animation - continuous smooth float
    translateY.value = withRepeat(
      withTiming(-5, {
        duration: 2000,
        easing: Easing.inOut(Easing.ease),
      }),
      -1,
      true
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: scale.value },
      { rotate: `${rotation.value * 360}deg` },
      { translateY: translateY.value }
    ],
    opacity: opacity.value,
  }));

  return (
    <View style={styles.container}>
      <Animated.View style={[animatedStyle]}>
        <Svg width={SIZE} height={SIZE}>
          <Defs>
            <LinearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
              <Stop offset="0%" stopColor="#00c6ff" />
              <Stop offset="25%" stopColor="#6e00ff" />
              <Stop offset="50%" stopColor="#ff00aa" />
              <Stop offset="75%" stopColor="#ff6a00" />
              <Stop offset="100%" stopColor="#ff9900" />
            </LinearGradient>
          </Defs>
          <Circle
            cx={SIZE / 2}
            cy={SIZE / 2}
            r={(SIZE - STROKE_WIDTH) / 2}
            stroke="url(#grad)"
            strokeWidth={STROKE_WIDTH}
            fill="none"
            strokeLinecap="round"
          />
        </Svg>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
}); 