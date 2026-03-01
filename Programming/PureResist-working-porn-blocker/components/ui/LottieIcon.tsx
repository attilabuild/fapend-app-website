import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import LottieView from 'lottie-react-native';

interface LottieIconProps {
  source: any;
  size?: number;
  backgroundColor?: string;
}

const LottieIcon = ({ source, size = 200 }: LottieIconProps) => {
  const animationRef = useRef<LottieView>(null);
  const { width: screenWidth } = Dimensions.get('window');
  
  // Calculate responsive size (not larger than 60% of screen width)
  const finalSize = Math.min(size, screenWidth * 0.6);

  useEffect(() => {
    // Reset animation when source changes
    if (animationRef.current) {
      try {
        animationRef.current.reset();
        animationRef.current.play();
      } catch (error) {

      }
    }
  }, [source]);

  return (
    <View style={[styles.container, { width: finalSize, height: finalSize }]}>
      <LottieView
        ref={animationRef}
        source={source}
        style={[styles.animation, { width: finalSize, height: finalSize }]}
        autoPlay
        loop
        speed={0.5}
        renderMode="HARDWARE"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  animation: {
    alignSelf: 'center',
  }
});

export default LottieIcon; 