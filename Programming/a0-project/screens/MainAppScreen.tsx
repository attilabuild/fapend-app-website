import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  Image,
  Dimensions,
  ScrollView,
  TouchableOpacity,
  Animated,
  Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { BlurView } from 'expo-blur';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Svg, { Circle, Rect } from 'react-native-svg';
import { upsertSkinScore } from '../lib/supabase';

const { width } = Dimensions.get('window');
const isIOS = Platform.OS === 'ios';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

function AnimatedCircularProgress({ size = 108, strokeWidth = 12, progress = 0 }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  const animated = useRef(new Animated.Value(0)).current;
  const [display, setDisplay] = useState(0);

  // animate whenever progress updates
  useEffect(() => {
    Animated.timing(animated, { toValue: Math.max(0, Math.min(100, progress)), duration: 900, useNativeDriver: false }).start();
    const id = animated.addListener(({ value }) => setDisplay(Math.round(value)));
    return () => animated.removeListener(id);
  }, [progress, animated]);

  // stroke offset interpolation
  const strokeDashoffset = animated.interpolate({
    inputRange: [0, 100],
    outputRange: [circumference, 0],
  });

  // color by progress thresholds
  const color = progress <= 39 ? '#E04B4B' : progress <= 70 ? '#E4B74E' : '#54A24B';

  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      {/* ensure center has app canvas color (fixes black center on some platforms) */}
      <View style={{ position: 'absolute', width: size, height: size, borderRadius: size / 2, backgroundColor: '#FFF6EE' }} />
      <Svg width={size} height={size} style={{ backgroundColor: 'transparent' }}>
        {/* SVG background to ensure no black fill */}
        <Rect x={0} y={0} width={size} height={size} rx={size / 2} fill={'#FFF6EE'} />
        <Circle
          stroke={'#FFF6EE'}
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
          fill="none"
        />
        {/* inner fill to match app canvas and avoid a dark center */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius - strokeWidth / 2 - 1}
          fill={'#FFF6EE'}
        />
        <AnimatedCircle
          stroke={color}
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={`${circumference} ${circumference}`}
          strokeDashoffset={strokeDashoffset}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </Svg>
      <View style={[styles.scoreOverlay, { width: size, height: size }]} pointerEvents="none">
        <Text style={styles.scoreValueHero}>{display}</Text>
      </View>
    </View>
  );
}

export default function MainAppScreen() {
  const navigation = useNavigation();
  const userName = 'User';

  // Minimal entrance animation
  const fadeIn = useRef(new Animated.Value(0)).current;
  const slideUp = useRef(new Animated.Value(10)).current;
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeIn, { toValue: 1, duration: 450, useNativeDriver: true }),
      Animated.timing(slideUp, { toValue: 0, duration: 450, useNativeDriver: true })
    ]).start();
  }, [fadeIn, slideUp]);

  const routineProgress = 0.6;
  // skinscore state - replace with real data source if available
  const [skinScore, setSkinScore] = useState(23);

  // Save skinscore to Supabase via Convex action (secure server-side secret)
  // Function to save skin score using direct Supabase client
  const saveSkinScore = async (userId: string, score: number) => {
    try {
      await upsertSkinScore(userId, score);
      console.log('Skin score saved successfully');
    } catch (error) {
      console.error('Failed to save skin score:', error);
    }
  };
  useEffect(() => {
    (async () => {
      try {
        await saveSkinScore('demo-user', skinScore);
      } catch (e) {
        // No-op if Supabase env not configured yet
        console.log('upsertSkinScore skipped:', e);
      }
    })();
  }, [skinScore]);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Brand */}
        <View style={styles.header}>
          <Image
            source={{ uri: 'https://i.postimg.cc/br31jLrs/Whats-App-Image-2025-08-10-at-6-20-55-PM-removebg-preview.png' }}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>

        {/* Greeting + Primary CTA */}
        <Animated.View style={[styles.card, styles.hero, { opacity: fadeIn, transform: [{ translateY: slideUp }] }]}>
          <View style={{ flex: 1 }}>
            <Text style={[styles.kicker, styles.kickerHero]}>Hey {userName} !</Text>
            <Text style={[styles.title, styles.titleHero]}>Check in with a quick face scan.</Text>

            <TouchableOpacity
              activeOpacity={0.9}
              onPress={() => navigation.navigate('ScanFace')}
              style={styles.primaryBtnHero}
            >
              <Ionicons name="scan-outline" size={18} color={ACCENT_DARK} />
              <Text style={styles.primaryBtnTextHero}>Scan Face</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.scoreShellHero}>
            <AnimatedCircularProgress size={108} strokeWidth={14} progress={skinScore} />
            <Text style={styles.scoreLabelHero}>Skinscore</Text>
          </View>
        </Animated.View>

        {/* Quick actions */}
        <View style={styles.row}>
          <TouchableOpacity
            activeOpacity={0.9}
            onPress={() => navigation.navigate('ScanProducts')}
            style={[styles.card, styles.actionCard]}
          >
            <View style={styles.actionIconWrap}>
              <Ionicons name="barcode-outline" size={18} color={CANVAS} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.actionTitle}>Scan products</Text>
              <Text style={styles.actionSub}>Safety & match</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={TEXT_MUTED} />
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.9}
            onPress={() => navigation.navigate('Progress')}
            style={[styles.card, styles.actionCard]}
          >
            <View style={[styles.actionIconWrap, { backgroundColor: ACCENT_SOFT }]}>
              <MaterialCommunityIcons name="chart-line" size={18} color={ACCENT_DARK} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.actionTitle}>My progress</Text>
              <Text style={styles.actionSub}>Trends & insights</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={TEXT_MUTED} />
          </TouchableOpacity>
        </View>

        {/* Routine summary */}
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={() => navigation.navigate('Routine')}
          style={[styles.card, styles.routineCard]}
        >
          <View style={styles.routineLeft}>
            <View style={styles.routineIcon}><Ionicons name="sunny" size={16} color={ACCENT_DARK} /></View>
            <View style={{ flex: 1 }}>
              <Text style={styles.routineTitle}>Morning routine</Text>
              <Text style={styles.routineSub}>3 of 5 steps completed</Text>
              <View style={styles.progressTrack}>
                <View style={[styles.progressBar, { width: `${routineProgress * 100}%` }]} />
              </View>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={20} color={TEXT_MUTED} />
        </TouchableOpacity>

        {/* Products used by user */}
        <View style={{ paddingHorizontal: 20, marginTop: 28 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <Text style={{ fontSize: 14, fontWeight: '800', color: TEXT }}>Products you use</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Products') }>
              <Text style={{ color: ACCENT, fontWeight: '700' }}>See all</Text>
            </TouchableOpacity>
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 12 }}>
            {['Gentle Cleanser', 'Vitamin C Serum', 'Hydrating Moisturizer', 'Daily SPF 50'].map((p, i) => (
              <TouchableOpacity key={p} activeOpacity={0.85} onPress={() => navigation.navigate('Products') } style={{ backgroundColor: SURFACE, paddingVertical: 12, paddingHorizontal: 14, borderRadius: 12, borderWidth: StyleSheet.hairlineWidth, borderColor: BORDER }}>
                <Text style={{ fontSize: 13, fontWeight: '700', color: TEXT }}>{p}</Text>
                <Text style={{ fontSize: 11, color: TEXT_MUTED, marginTop: 4 }}>AM • PM</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <View style={{ height: 160 }} />
      </ScrollView>

      {/* Bottom Navigation - consistent with other screens */}
      {isIOS ? (
        <BlurView intensity={10} tint="light" style={styles.bottomNavBlur}>
          <View style={styles.bottomNav}>
            <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('MainApp')}>
              <Ionicons name="home-outline" size={24} color={ACCENT} />
              <Text style={[styles.navText, styles.activeNavText]}>Home</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('Progress')}>
              <MaterialCommunityIcons name="face-man" size={24} color={ACCENT} />
              <Text style={styles.navText}>Progress</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('Routine')}>
              <Ionicons name="calendar-outline" size={24} color={ACCENT} />
              <Text style={styles.navText}>Routine</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('Settings')}>
              <Ionicons name="settings-outline" size={24} color={ACCENT} />
              <Text style={styles.navText}>Settings</Text>
            </TouchableOpacity>
          </View>
        </BlurView>
      ) : (
        <View style={styles.bottomNavAndroid}>
          <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('MainApp')}>
            <Ionicons name="home-outline" size={24} color={ACCENT} />
            <Text style={[styles.navText, styles.activeNavText]}>Home</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('Progress')}>
            <MaterialCommunityIcons name="face-man" size={24} color={ACCENT} />
            <Text style={styles.navText}>Progress</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('Routine')}>
            <Ionicons name="calendar-outline" size={24} color={ACCENT} />
            <Text style={styles.navText}>Routine</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('Settings')}>
            <Ionicons name="settings-outline" size={24} color={ACCENT} />
            <Text style={styles.navText}>Settings</Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}

const CANVAS = '#FCF9F2';
const SURFACE = '#FFFFFF';
const BORDER = 'rgba(0,0,0,0.06)';
const TEXT = '#2B1A12';
const TEXT_MUTED = 'rgba(43,26,18,0.6)';
const ACCENT = '#B66C2F';
const ACCENT_SOFT = '#F2D9C3';
const ACCENT_DARK = '#2B1A12';

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: CANVAS },
  scrollContent: { paddingBottom: isIOS ? 28 : 20 },

  // Header / Logo
  header: { paddingTop: 0, paddingBottom: 20, alignItems: 'center' },
  logo: { width: width * 0.6, height: 100 },

  // Cards base
  card: {
    backgroundColor: SURFACE,
    borderRadius: 24,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: BORDER,
    padding: 20,
  },

  // Hero (dark / warm)
  hero: {
    marginHorizontal: 20,
    padding: 22,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 18,
    marginTop: 12,
    backgroundColor: ACCENT,
    borderColor: ACCENT,
  },
  kicker: { color: TEXT_MUTED, fontSize: 9, fontWeight: '600' },
  title: { color: TEXT, fontSize: 16, fontWeight: '800', marginTop: 6, letterSpacing: -0.2 },
  sub: { color: TEXT_MUTED, fontSize: 9, marginTop: 8 },

  kickerHero: { color: '#FFF4EA', fontSize: 14, fontWeight: '700', marginBottom: 6 },
  titleHero: { color: '#fff', fontSize: 20, fontWeight: '800', marginBottom: 6 },

  primaryBtnHero: {
    marginTop: 18,
    alignSelf: 'flex-start',
    backgroundColor: ACCENT_SOFT,
    borderRadius: 28,
    paddingVertical: 12,
    paddingHorizontal: 22,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.06, shadowRadius: 10 },
      android: { elevation: 2 },
    }),
  },
  primaryBtnTextHero: { color: ACCENT_DARK, fontWeight: '800', fontSize: 13 },

  scoreShellHero: { alignItems: 'center', justifyContent: 'center' },
  scoreOverlay: { position: 'absolute', alignItems: 'center', justifyContent: 'center' },
  scoreValueHero: { color: ACCENT_DARK, fontSize: 22, fontWeight: '800' },
  scoreLabelHero: { marginTop: 8, color: '#FFF4EA', fontWeight: '700', fontSize: 12 },

  // Row actions
  row: { flexDirection: 'row', gap: 16, paddingHorizontal: 20, marginTop: 32 },
  actionCard: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingVertical: 16,
    paddingHorizontal: 12,
    backgroundColor: '#F6EFE7',
  },
  actionIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 14,
    backgroundColor: ACCENT,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionTitle: { color: TEXT, fontSize: 12, fontWeight: '800' },
  actionSub: { color: TEXT_MUTED, fontSize: 9, marginTop: 2 },

  // Routine
  routineCard: { marginHorizontal: 20, marginTop: 32, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 18, paddingHorizontal: 16 },
  routineLeft: { flexDirection: 'row', alignItems: 'center', gap: 14, flex: 1 },
  routineIcon: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#F6EFE7', alignItems: 'center', justifyContent: 'center' },
  routineTitle: { color: TEXT, fontSize: 13, fontWeight: '800' },
  routineSub: { color: TEXT_MUTED, fontSize: 9, marginTop: 6 },
  progressTrack: { height: 8, backgroundColor: '#EFE7DD', borderRadius: 4, marginTop: 12, overflow: 'hidden' },
  progressBar: { height: '100%', backgroundColor: ACCENT_DARK, borderRadius: 4 },

  // Bottom Navigation
  bottomNavBlur: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: 'hidden',
  },
  bottomNav: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 12,
    paddingBottom: isIOS ? 24 : 12,
  },
  bottomNavAndroid: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 12,
    backgroundColor: '#F7EDE2',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  navItem: { alignItems: 'center' },
  navText: { fontSize: 9, color: ACCENT, marginTop: 6, fontWeight: '500' },
  activeNavText: { fontWeight: '700' },
});