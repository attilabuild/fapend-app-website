import React, { useEffect, useMemo } from 'react';
import { View, StyleSheet, Animated, Dimensions } from 'react-native';

const NUM_STARS = 70; // Increased from 40 to 60 stars
const { width, height } = Dimensions.get('window');

// Seeded random number generator for consistency
class SeededRandom {
  private seed: number;

  constructor(seed: number = 12345) { // Fixed seed for consistency
    this.seed = seed;
  }

  // Returns a random number between 0 and 1
  random(): number {
    const x = Math.sin(this.seed++) * 10000;
    return x - Math.floor(x);
  }

  // Returns a random number between min and max
  range(min: number, max: number): number {
    return min + this.random() * (max - min);
  }
}

const seededRandom = new SeededRandom();

export const AnimatedStars = () => {
  const stars = useMemo(() => {
    return Array.from({ length: NUM_STARS }).map(() => ({
      left: seededRandom.range(0, width),
      top: seededRandom.range(0, height),
      size: seededRandom.range(1, 3), // 1-3px stars
      opacity: new Animated.Value(seededRandom.range(0.2, 0.5)), // Base opacity 0.2-0.5
      animationDuration: seededRandom.range(2000, 4000), // 2-4s animation
    }));
  }, []); // Empty dependency array ensures stars are only generated once

  useEffect(() => {
    stars.forEach(star => {
      const animate = () => {
        Animated.sequence([
          Animated.timing(star.opacity, {
            toValue: seededRandom.range(0.6, 1.0), // Peak opacity 0.6-1.0
            duration: star.animationDuration,
            useNativeDriver: true,
          }),
          Animated.timing(star.opacity, {
            toValue: seededRandom.range(0.2, 0.5), // Back to base opacity
            duration: star.animationDuration,
            useNativeDriver: true,
          }),
        ]).start(animate);
      };
      animate();
    });
  }, []);

  return (
    <View style={styles.container}>
      {stars.map((star, index) => (
        <Animated.View
          key={index}
          style={[
            styles.star,
            {
              left: star.left,
              top: star.top,
              width: star.size,
              height: star.size,
              opacity: star.opacity,
              shadowColor: '#fff',
              shadowOffset: { width: 0, height: 0 },
              shadowOpacity: 0.8,
              shadowRadius: 4,
              elevation: 5,
            },
          ]}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'transparent',
  },
  star: {
    position: 'absolute',
    backgroundColor: '#ffffff',
    borderRadius: 4,
  },
}); 