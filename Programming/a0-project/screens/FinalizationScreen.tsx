import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  ImageBackground,
  Dimensions,
  Animated,
  Easing
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';

const { width, height } = Dimensions.get('window');

export default function FinalizationScreen({ route }) {
  const navigation = useNavigation();
  const { answers } = route.params || {};
  
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const spinAnim = useRef(new Animated.Value(0)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;
  
  // Spin interpolation for the loading circle
  const spin = spinAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg']
  });
  
  // Progress width interpolation
  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, width * 0.7]
  });

  useEffect(() => {
    // Initial fade in
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
      easing: Easing.out(Easing.cubic)
    }).start();
    
    // Scale up
    Animated.timing(scaleAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
      easing: Easing.out(Easing.cubic)
    }).start();
    
    // Continuous spinning animation
    Animated.loop(
      Animated.timing(spinAnim, {
        toValue: 1,
        duration: 2000,
        useNativeDriver: true,
        easing: Easing.linear
      })
    ).start();
    
    // Progress animation
    Animated.timing(progressAnim, {
      toValue: 1,
      duration: 4000,
      useNativeDriver: false,
      easing: Easing.inOut(Easing.cubic)
    }).start();
    
    // Navigate to Benefits screen after 5 seconds
    const timer = setTimeout(() => {
      navigation.navigate('Benefits', { answers });
    }, 5000);
    
    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      
      <ImageBackground 
        source={{ uri: 'https://i.postimg.cc/9fsvkTJb/Whats-App-Image-2025-07-14-at-8-17-02-AM.jpg' }}
        style={styles.backgroundImage}
        resizeMode="cover"
      >
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.overlay}>
            <Animated.View 
              style={[
                styles.content,
                { 
                  opacity: fadeAnim,
                  transform: [{ scale: scaleAnim }]
                }
              ]}
            >
              <Text style={styles.title}>Creating Your Personalized Routine</Text>
              
              <View style={styles.loadingContainer}>
                {/* Spinning circle */}
                <Animated.View 
                  style={[
                    styles.spinnerOuter,
                    { transform: [{ rotate: spin }] }
                  ]}
                >
                  <View style={styles.spinnerInner} />
                </Animated.View>
                
                {/* Progress bar */}
                <View style={styles.progressBarContainer}>
                  <Animated.View 
                    style={[
                      styles.progressBar,
                      { width: progressWidth }
                    ]} 
                  />
                </View>
                
                <Text style={styles.processingText}>
                  Analyzing your skin profile...
                </Text>
              </View>
            </Animated.View>
          </View>
        </SafeAreaView>
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  backgroundImage: {
    flex: 1,
    width: width,
    height: height,
  },
  safeArea: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    width: '100%',
    alignItems: 'center',
    padding: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '600',
    color: '#FFF3E0',
    marginBottom: 50,
    textAlign: 'center',
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  spinnerOuter: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 4,
    borderColor: '#A86A48',
    borderTopColor: 'rgba(255, 243, 224, 0.8)',
    marginBottom: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  spinnerInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(168, 106, 72, 0.3)',
  },
  progressBarContainer: {
    width: width * 0.7,
    height: 6,
    backgroundColor: 'rgba(255, 243, 224, 0.2)',
    borderRadius: 3,
    marginBottom: 20,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#A86A48',
    borderRadius: 3,
  },
  processingText: {
    fontSize: 16,
    color: '#FFF3E0',
    opacity: 0.8,
    textAlign: 'center',
  },
});