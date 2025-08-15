import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Dimensions,
  Animated,
  Easing,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

export default function PaywallScreen({ navigation }) {
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const shimmerAnim = useRef(new Animated.Value(0)).current;

  // Selected plan state
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'yearly'>('yearly');

  // Start shimmer + fade
  useEffect(() => {
    Animated.loop(
      Animated.timing(shimmerAnim, {
        toValue: 1,
        duration: 2200,
        useNativeDriver: true,
        easing: Easing.linear,
      })
    ).start();

    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
      easing: Easing.out(Easing.cubic),
    }).start();
  }, []);

  const translateX = shimmerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-width, width * 2],
  });

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />

      {/* Background */}
      <LinearGradient
        colors={["#F4E6D9", "#F7EFE7"]}
        style={styles.background}
      >
        {/* Decorative colorful blobs (subtle) */}
        <LinearGradient
          colors={["rgba(214, 163, 124, 0.25)", "rgba(214, 163, 124, 0)"]}
          style={[styles.blob, { top: -40, left: -60, width: 220, height: 220 }]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        />
        <LinearGradient
          colors={["rgba(168, 106, 72, 0.22)", "rgba(168, 106, 72, 0)"]}
          style={[styles.blob, { bottom: -60, right: -70, width: 260, height: 260 }]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        />

        <SafeAreaView style={styles.safeArea}>
          <Animated.View style={[styles.content, { opacity: fadeAnim }] }>
            {/* Close */}
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => navigation.goBack()}
              activeOpacity={0.8}
            >
              <Ionicons name="close" size={22} color="#6E4D3B" />
            </TouchableOpacity>

            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.title}>Start your free trial</Text>
              <Text style={styles.subtitle}>
                Unlock your tailored routine, detailed analysis, and progress tracking.
              </Text>
            </View>

            {/* Benefits */}
            <View style={styles.benefitsCard}>
              <BenefitItem icon="analytics-outline" text="Personalized skin analysis" />
              <BenefitItem icon="sparkles-outline" text="Smart product recommendations" />
              <BenefitItem icon="trending-up-outline" text="Progress tracking and tips" />
              <BenefitItem icon="barcode-outline" text="Product scanning — check match & benefits" />
            </View>

            {/* Plans */}
            <View style={styles.planRow}>
              <PlanCard
                title="Monthly"
                price="$6.99"
                period="/month"
                selected={selectedPlan === 'monthly'}
                onPress={() => setSelectedPlan('monthly')}
              />
              <PlanCard
                title="Yearly"
                price="$49.99"
                period="/year"
                badge="Best value"
                note="Save 40%"
                selected={selectedPlan === 'yearly'}
                onPress={() => setSelectedPlan('yearly')}
              />
            </View>

            {/* CTA */}
            <View style={styles.ctaContainer}>
              <TouchableOpacity
                style={styles.ctaButton}
                onPress={() => {
                  navigation.reset({ index: 0, routes: [{ name: 'MainApp' }] });
                }}
                activeOpacity={0.9}
              >
                <LinearGradient
                  colors={["#C99266", "#B17854", "#9B5E3F"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.buttonGradient}
                >
                  <Animated.View style={[styles.shimmer, { transform: [{ translateX }] }]} />
                  <Text style={styles.buttonText}>Start 7‑day free trial</Text>
                </LinearGradient>
              </TouchableOpacity>

              <Text style={styles.helperText}>Cancel anytime • No charge today</Text>
              <View style={styles.secureRow}>
                <Ionicons name="lock-closed" size={12} color="#7C5A45" style={{ marginRight: 6 }} />
                <Text style={styles.secureText}>Secure checkout • 30‑day guarantee</Text>
              </View>

              <TouchableOpacity onPress={() => navigation.navigate('Settings')} activeOpacity={0.7}>
                <Text style={styles.restoreText}>Restore purchases</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </SafeAreaView>
      </LinearGradient>
    </View>
  );
}

function BenefitItem({ icon, text }: { icon: any; text: string }) {
  return (
    <View style={styles.benefitRow}>
      <View style={styles.iconPill}>
        <Ionicons name={icon} size={18} color="#6E4D3B" />
      </View>
      <Text style={styles.benefitText}>{text}</Text>
    </View>
  );
}

function PlanCard({
  title,
  price,
  period,
  selected,
  onPress,
  badge,
  note,
}: {
  title: string;
  price: string;
  period: string;
  selected: boolean;
  onPress: () => void;
  badge?: string;
  note?: string;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.9}
      style={[styles.planCard, selected && styles.planSelected]}
    >
      {badge ? (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{badge}</Text>
        </View>
      ) : null}
      <Text style={styles.planTitle}>{title}</Text>
      <View style={styles.priceRow}>
        <Text style={styles.planPrice}>{price}</Text>
        <Text style={styles.planPeriod}>{period}</Text>
      </View>
      {note ? <Text style={styles.planNote}>{note}</Text> : null}
      <View style={[styles.radio, selected && styles.radioActive]}>
        {selected ? <View style={styles.radioInner} /> : null}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F4E6D9' },
  background: { flex: 1 },
  blob: {
    position: 'absolute',
    borderRadius: 999,
    opacity: 1,
  },
  safeArea: { flex: 1 },
  content: { flex: 1, paddingHorizontal: 20, paddingTop: 8, paddingBottom: 16 },

  closeButton: {
    position: 'absolute',
    top: 8,
    right: 12,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0,0,0,0.06)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  header: { marginTop: 36, marginBottom: 16, alignItems: 'center' },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#3E2B20',
    textAlign: 'center',
    letterSpacing: 0.2,
  },
  subtitle: {
    marginTop: 10,
    fontSize: 16,
    color: '#6E4D3B',
    opacity: 0.9,
    textAlign: 'center',
    maxWidth: 320,
  },

  benefitsCard: {
    marginTop: 18,
    backgroundColor: 'rgba(255,255,255,0.6)',
    borderRadius: 20,
    paddingVertical: 16,
    paddingHorizontal: 14,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(158, 118, 93, 0.35)',
  },
  benefitRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8 },
  iconPill: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(206, 161, 126, 0.25)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  benefitText: { fontSize: 16, color: '#3E2B20', flex: 1 },

  planRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 18 },
  planCard: {
    width: '48%',
    paddingVertical: 16,
    paddingHorizontal: 14,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.75)',
    borderWidth: 1,
    borderColor: 'rgba(158, 118, 93, 0.35)',
  },
  planSelected: {
    borderColor: '#B17854',
    shadowColor: '#B17854',
    shadowOpacity: Platform.OS === 'ios' ? 0.2 : 0.3,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  badge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(177, 120, 84, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    marginBottom: 8,
  },
  badgeText: { fontSize: 11, color: '#8D5F43', fontWeight: '600' },
  planTitle: { fontSize: 16, color: '#3E2B20', fontWeight: '600' },
  priceRow: { flexDirection: 'row', alignItems: 'flex-end', marginTop: 6 },
  planPrice: { fontSize: 22, color: '#3E2B20', fontWeight: '700', marginRight: 4 },
  planPeriod: { fontSize: 13, color: '#6E4D3B' },
  planNote: { marginTop: 6, fontSize: 12, color: '#8D5F43' },
  radio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: 'rgba(158, 118, 93, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'flex-end',
    marginTop: 10,
  },
  radioActive: { borderColor: '#B17854' },
  radioInner: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#B17854' },

  ctaContainer: { marginTop: 22, alignItems: 'center' },
  ctaButton: {
    width: '100%',
    height: 56,
    borderRadius: 30,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },
  buttonGradient: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  shimmer: {
    position: 'absolute',
    width: '30%',
    height: '120%',
    top: '-10%',
    backgroundColor: 'rgba(255,255,255,0.35)',
    transform: [{ skewX: '-20deg' }],
  },
  buttonText: { color: '#FFF8F1', fontSize: 18, fontWeight: '700', letterSpacing: 0.3 },
  helperText: { marginTop: 10, color: '#6E4D3B', fontSize: 13 },
  secureRow: { flexDirection: 'row', alignItems: 'center', marginTop: 6 },
  secureText: { color: '#7C5A45', fontSize: 12 },
  restoreText: { marginTop: 14, color: '#8D5F43', fontSize: 14, fontWeight: '600' },
});