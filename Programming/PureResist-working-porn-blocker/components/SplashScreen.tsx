import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Video, ResizeMode } from 'expo-av';

const SplashScreen = () => {
  return (
    <View style={styles.container}>
      {/* Centered animation */}
      <View style={styles.centerContent}>
        <Video
          source={require('../assets/animation.mp4')}
          style={styles.animation}
          resizeMode={ResizeMode.CONTAIN}
          isLooping
          shouldPlay
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  animation: {
    width: 320,
    height: 320,
  },
});

export default SplashScreen; 