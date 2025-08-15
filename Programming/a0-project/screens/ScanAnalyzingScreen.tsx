import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  Image,
  Animated,
  Easing,
  LayoutChangeEvent,
  Platform,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

// Theme tokens aligned with MainAppScreen
const CANVAS = '#FCF9F2';
const SURFACE = '#FFFFFF';
const BORDER = 'rgba(0,0,0,0.06)';
const TEXT = '#2B1A12';
const TEXT_MUTED = 'rgba(43,26,18,0.6)';
const ACCENT = '#B66C2F';
const ACCENT_SOFT = '#F2D9C3';

export default function ScanAnalyzingScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const imageUri: string | undefined = route.params?.imageUri;

  const steps = useMemo(
    () => [
      'Extracting text from label',
      'Detecting brand & product type',
      'Checking ingredient safety',
      'Matching to your skin profile',
      'Computing benefit scores',
    ],
    []
  );

  const totalDuration = 2600; // ms
  const [activeIndex, setActiveIndex] = useState(0);
  const progress = useRef(new Animated.Value(0)).current;
  const [barWidth, setBarWidth] = useState(0);

  useEffect(() => {
    // Animate progress smoothly
    Animated.timing(progress, {
      toValue: 1,
      duration: totalDuration,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();

    const stepInterval = Math.max(200, Math.floor(totalDuration / (steps.length * 1.05)));
    const interval = setInterval(() => {
      setActiveIndex((i) => Math.min(i + 1, steps.length - 1));
    }, stepInterval);

    const t = setTimeout(() => {
      // Mock analysis result - keep small and structured
      const result = {
        score: 82,
        benefits: ['Hydration', 'Barrier support', 'Calming'],
        bestFor: ['Dry', 'Sensitive'],
        pros: ['Fragrance-free', 'Derm-tested', 'Non-comedogenic'],
        cons: ['Contains silicones', 'Not fungal-acne safe for all'],
      };

      navigation.replace('ScanResult', { imageUri, result });
    }, totalDuration + 240);

    return () => {
      clearInterval(interval);
      clearTimeout(t);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [imageUri]);

  const animatedBarWidth = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [0, barWidth || 1],
  });

  function onBarLayout(e: LayoutChangeEvent) {
    setBarWidth(e.nativeEvent.layout.width);
  }

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        {/* App header to match theme */}
        <View style={styles.header}>
          <Ionicons name="chevron-back" size={22} color={TEXT_MUTED} onPress={() => { /* disabled during analysis */ }} />
          <Image
            source={{ uri: 'https://i.postimg.cc/br31jLrs/Whats-App-Image-2025-08-10-at-6-20-55-PM-removebg-preview.png' }}
            style={styles.logo}
            resizeMode="contain"
          />
          <View style={{ width: 22 }} />
        </View>

        {/* Centered analysis card */}
        <View style={styles.cardWrap}>
          <View style={styles.card}>
            <View style={styles.topRow}>
              <View style={styles.titleBlock}>
                <Text style={styles.kicker}>Analyzing</Text>
                <Text style={styles.title}>We're checking this product</Text>
                <Text style={styles.subtitle}>This helps us compute match score and main benefits.</Text>
              </View>
              {imageUri ? (
                <Image source={{ uri: imageUri }} style={styles.thumb} />
              ) : (
                <View style={styles.thumbPlaceholder} />
              )}
            </View>

            {/* Progress */}
            <View style={styles.progressSection} onLayout={onBarLayout}>
              <View style={styles.progressRow}>
                <View style={styles.progressBg}>
                  <Animated.View style={[styles.progressFill, { width: animatedBarWidth }]} />
                </View>
                <Text style={styles.percentLabel}>{/* Derived percent */}
                  {Math.round((progress as any)._value * 100) || ''}%
                </Text>
              </View>

              <Text style={styles.smallHint}>Analyzing details · this may take a few seconds</Text>
            </View>

            {/* Steps */}
            <View style={styles.steps}>
              {steps.map((s, i) => {
                const completed = i < activeIndex;
                const active = i === activeIndex;
                return (
                  <View key={s} style={styles.stepRow}>
                    <View style={[styles.stepDot, completed && styles.stepDotDone, active && styles.stepDotActive]}>
                      {completed ? <Text style={styles.check}>✓</Text> : null}
                    </View>
                    <Text style={[styles.stepText, active && styles.stepTextActive]} numberOfLines={1}>{s}</Text>
                  </View>
                );
              })}
            </View>

            <Text style={styles.footerHint}>Keep the app open while we finish analysis.</Text>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: CANVAS },
  container: { flex: 1, paddingHorizontal: 20 },

  header: {
    height: 72,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
  },
  logo: { width: 140, height: 36 },

  cardWrap: { flex: 1, justifyContent: 'center' },
  card: {
    backgroundColor: SURFACE,
    borderRadius: 20,
    padding: 20,
    borderWidth: Platform.OS === 'web' ? 0 : StyleSheet.hairlineWidth,
    borderColor: BORDER,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 20,
    elevation: 6,
  },

  topRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 16 },
  titleBlock: { flex: 1, paddingRight: 12 },
  kicker: { color: TEXT_MUTED, fontSize: 11, fontWeight: '700' },
  title: { color: TEXT, fontSize: 18, fontWeight: '800', marginTop: 6 },
  subtitle: { color: TEXT_MUTED, fontSize: 12, marginTop: 6 },

  thumb: { width: 96, height: 96, borderRadius: 12, backgroundColor: '#F3F1EF' },
  thumbPlaceholder: { width: 96, height: 96, borderRadius: 12, backgroundColor: '#FAF6F1' },

  progressSection: { marginTop: 18 },
  progressRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  progressBg: { height: 8, flex: 1, backgroundColor: ACCENT_SOFT, borderRadius: 8, overflow: 'hidden', marginRight: 12 },
  progressFill: { height: 8, backgroundColor: ACCENT, borderRadius: 8 },
  percentLabel: { width: 48, textAlign: 'right', color: TEXT_MUTED, fontWeight: '700' },
  smallHint: { marginTop: 8, color: TEXT_MUTED, fontSize: 12 },

  steps: { marginTop: 16 },
  stepRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 8 },
  stepDot: { width: 16, height: 16, borderRadius: 8, backgroundColor: '#EFE9E4', alignItems: 'center', justifyContent: 'center' },
  stepDotActive: { backgroundColor: ACCENT },
  stepDotDone: { backgroundColor: ACCENT },
  check: { color: '#fff', fontSize: 11, fontWeight: '800' },
  stepText: { color: TEXT_MUTED, fontSize: 13, flex: 1 },
  stepTextActive: { color: TEXT, fontWeight: '700' },

  footerHint: { marginTop: 16, color: 'rgba(43,26,18,0.45)', fontSize: 12 },
});