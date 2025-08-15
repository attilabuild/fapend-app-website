import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  Animated,
  Easing,
  Image,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');
const CARD_H_PADDING = 20;
const IMAGE_SIZE = Math.min(width - CARD_H_PADDING * 2 - 24, 360);

export default function AnalysisScreen({ route, navigation }) {
  const { imageUri } = route.params;

  // Keep only minimal animations
  const fadeAnim = useRef(new Animated.Value(0)).current; // enter
  const slideAnim = useRef(new Animated.Value(16)).current; // enter
  const progressAnim = useRef(new Animated.Value(0)).current; // progress
  // Scan animations
  const scanY = useRef(new Animated.Value(0)).current; // 0 -> 1 (maps to height)
  const shimmerX = useRef(new Animated.Value(0)).current; // 0 -> 1 (maps to width)

  const [phaseIndex, setPhaseIndex] = useState(0);

  const phases = [
    'Preparing scan...',
    'Detecting facial landmarks...',
    'Analyzing skin texture...',
    'Evaluating clarity & pores...',
    'Measuring tone & contrast...',
    'Finalizing your profile...'
  ];

  const progressWidth = progressAnim.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] });

  useEffect(() => {
    // Enter animation
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 500, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 500, easing: Easing.out(Easing.cubic), useNativeDriver: true })
    ]).start();

    // Smooth linear progress and phased copy
    const totalMs = 5000; // ~5s total
    Animated.timing(progressAnim, { toValue: 1, duration: totalMs, useNativeDriver: false, easing: Easing.inOut(Easing.cubic) }).start();

    const perStep = Math.floor(totalMs / phases.length);
    phases.forEach((_, idx) => setTimeout(() => setPhaseIndex(idx), idx * perStep));

    // Looping scan animations (calm)
    const runScan = () => {
      scanY.setValue(0);
      Animated.timing(scanY, { toValue: 1, duration: 1600, easing: Easing.inOut(Easing.quad), useNativeDriver: true }).start(runScan);
    };
    const runShimmer = () => {
      shimmerX.setValue(0);
      Animated.timing(shimmerX, { toValue: 1, duration: 2200, easing: Easing.inOut(Easing.cubic), useNativeDriver: true }).start(runShimmer);
    };
    runScan();
    runShimmer();

    const timer = setTimeout(() => navigation.replace('Results', { imageUri }), totalMs);
    return () => {
      clearTimeout(timer);
      // stop animations
      scanY.stopAnimation();
      shimmerX.stopAnimation();
    };
  }, [navigation, imageUri]);

  // Map animated values to transforms inside image frame
  const scanTranslateY = scanY.interpolate({ inputRange: [0, 1], outputRange: [0, IMAGE_SIZE - 4] });
  const shimmerTranslateX = shimmerX.interpolate({ inputRange: [0, 1], outputRange: [-IMAGE_SIZE, IMAGE_SIZE] });

  return (
    <View style={styles.root}> 
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
      <SafeAreaView style={styles.safeArea}>
        <Animated.View style={[styles.headerWrap, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}> 
          <Text style={styles.title}>Analyzing your skin</Text>
          <Text style={styles.subtitle}>This takes only a few seconds</Text>
        </Animated.View>

        {/* Minimal glass card */}
        <Animated.View style={[styles.card, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}> 
          <LinearGradient colors={["rgba(255,255,255,0.7)", "rgba(255,255,255,0)"]} start={{ x: 0, y: 0 }} end={{ x: 0, y: 1 }} style={styles.cardShine} />

          {/* Image frame with subtle scan overlays */}
          <View style={styles.imageZone}>
            <View style={styles.imageFrame}>
              <Image source={{ uri: imageUri }} style={styles.image} />
              {/* Soft static tint */}
              <LinearGradient
                colors={["rgba(209,177,145,0.0)", "rgba(209,177,145,0.14)", "rgba(209,177,145,0.0)"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={StyleSheet.absoluteFill}
              />

              {/* Vertical scan bar */}
              <Animated.View
                pointerEvents="none"
                style={[styles.scanBar, { transform: [{ translateY: scanTranslateY }] }]}
              >
                <LinearGradient
                  colors={["rgba(255,255,255,0)", "rgba(255,255,255,0.75)", "rgba(255,255,255,0)"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 0, y: 1 }}
                  style={StyleSheet.absoluteFill}
                />
              </Animated.View>

              {/* Diagonal shimmer sweep */}
              <Animated.View
                pointerEvents="none"
                style={[styles.shimmer, { transform: [{ translateX: shimmerTranslateX }] }]}
              >
                <LinearGradient
                  colors={["rgba(255,255,255,0)", "rgba(255,255,255,0.35)", "rgba(255,255,255,0)"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={StyleSheet.absoluteFill}
                />
              </Animated.View>

              {/* Corner notches */}
              <View style={[styles.corner, styles.cornerTL]} />
              <View style={[styles.corner, styles.cornerTR]} />
              <View style={[styles.corner, styles.cornerBL]} />
              <View style={[styles.corner, styles.cornerBR]} />
            </View>
          </View>

          {/* Phase row */}
          <View style={styles.phaseRow}>
            <View style={styles.phaseIconWrap}>
              <Ionicons name="scan-outline" size={18} color="#6B4A36" />
            </View>
            <Text style={styles.phaseText} numberOfLines={1}>{phases[phaseIndex]}</Text>
          </View>

          {/* Progress */}
          <View style={styles.progressTrack}>
            <Animated.View style={[styles.progressFill, { width: progressWidth }]} />
          </View>
        </Animated.View>

        <View style={{ height: 24 }} />
        <Text style={styles.tip}>Keep your face centered and steady for best results</Text>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#F3E3D2',
  },
  safeArea: { flex: 1, paddingHorizontal: 16 },
  headerWrap: { alignItems: 'center', marginTop: 8, marginBottom: 16 },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#3A2A1F',
    letterSpacing: 0.2,
  },
  subtitle: {
    marginTop: 6,
    fontSize: 14,
    color: '#7D5E49',
  },
  card: {
    alignSelf: 'center',
    width: '100%',
    maxWidth: 860,
    backgroundColor: 'rgba(255,255,255,0.72)',
    borderRadius: 24,
    padding: CARD_H_PADDING,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },
  cardShine: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    height: 20,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  imageZone: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  imageFrame: {
    width: IMAGE_SIZE,
    height: IMAGE_SIZE,
    borderRadius: 18,
    overflow: 'hidden',
    backgroundColor: '#EAD7C2',
    borderWidth: 1,
    borderColor: 'rgba(107,74,54,0.2)'
  },
  image: { width: '100%', height: '100%', resizeMode: 'cover' },
  // Scan overlays
  scanBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 4,
    opacity: 0.6,
  },
  shimmer: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: IMAGE_SIZE,
    transform: [{ rotate: '12deg' }],
    opacity: 0.25,
  },
  corner: {
    position: 'absolute',
    width: 26,
    height: 26,
    borderColor: '#B89073',
  },
  cornerTL: { top: 0, left: 0, borderTopWidth: 2, borderLeftWidth: 2, borderTopLeftRadius: 8 },
  cornerTR: { top: 0, right: 0, borderTopWidth: 2, borderRightWidth: 2, borderTopRightRadius: 8 },
  cornerBL: { bottom: 0, left: 0, borderBottomWidth: 2, borderLeftWidth: 2, borderBottomLeftRadius: 8 },
  cornerBR: { bottom: 0, right: 0, borderBottomWidth: 2, borderRightWidth: 2, borderBottomRightRadius: 8 },
  phaseRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(234,215,194,0.7)',
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  phaseIconWrap: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(107,74,54,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  phaseText: { color: '#3A2A1F', fontSize: 15, fontWeight: '500', flex: 1 },
  progressTrack: {
    marginTop: 12,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(107,74,54,0.16)',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#6B4A36',
  },
  tip: { textAlign: 'center', color: '#7D5E49', fontSize: 13 },
});