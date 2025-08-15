import React, { useMemo } from 'react';
import { SafeAreaView, View, Text, StyleSheet, Image, ScrollView, TouchableOpacity } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';

// Theme tokens (warm aesthetic to match Scan screen)
const CANVAS = '#FCF9F2';
const SURFACE = '#FFFFFF';
const TEXT = '#2B1A12';
const TEXT_MUTED = 'rgba(43,26,18,0.7)';
const BORDER = 'rgba(43,26,18,0.08)';
const ACCENT = '#B66C2F';
const ACCENT_SOFT = '#F2D9C3';

export default function ScanResultScreen() {
  const navigation = useNavigation();
  const route = useRoute<any>();
  const imageUri: string | undefined = route.params?.imageUri;
  const result = route.params?.result as {
    score: number;
    benefits: string[];
    bestFor: string[];
    pros: string[];
    cons: string[];
    name?: string;
    brand?: string;
  } | undefined;

  const score = result?.score ?? 0;
  const scoreBadgeColor = useMemo(() => {
    if (score >= 85) return '#2F8F4E'; // great
    if (score >= 70) return '#B66C2F'; // good (accent)
    if (score >= 50) return '#C78A2A'; // average
    return '#B23B3B'; // poor
  }, [score]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.flex}>
        <ScrollView contentContainerStyle={styles.content}>
          {/* Hero card */}
          <View style={styles.heroCard}>
            <View style={styles.heroLeft}>
              <Text style={styles.heroKicker}>Scan result</Text>
              <Text style={styles.heroTitle}>{result?.name ?? 'Product analysis'}</Text>
              {result?.brand ? (
                <Text style={styles.heroBrand}>{result.brand}</Text>
              ) : null}
              <View style={styles.heroSubRow}>
                <Text style={styles.heroSub}>Match score</Text>
              </View>
            </View>
            <View style={styles.heroRight}>
              {imageUri ? (
                <Image source={{ uri: imageUri }} style={styles.heroImage} resizeMode="cover" />
              ) : null}
              <View style={[styles.scoreBadge, { borderColor: ACCENT_SOFT }]}> 
                <Text style={[styles.scoreNum, { color: scoreBadgeColor }]}>{score}</Text>
                <Text style={styles.scorePct}>%</Text>
              </View>
            </View>
          </View>

          {/* Benefits */}
          <SectionCard title="Main benefits">
            {result?.benefits?.length ? (
              <View style={{ gap: 10 }}>
                {result.benefits.map((b, i) => (
                  <Bullet key={i} text={b} />
                ))}
              </View>
            ) : (
              <EmptyLine text="No benefits available" />
            )}
          </SectionCard>

          {/* Best for */}
          <SectionCard title="Best for">
            <View style={styles.chipsWrap}>
              {result?.bestFor?.length ? (
                result.bestFor.map((b, i) => (
                  <View key={i} style={styles.chip}><Text style={styles.chipText}>{b}</Text></View>
                ))
              ) : (
                <Text style={styles.muted}>No tags</Text>
              )}
            </View>
          </SectionCard>

          {/* Pros / Cons side by side on large, stacked on small */}
          <View style={styles.rowWrap}>
            <SectionCard title="Pros" style={styles.rowItem}>
              {result?.pros?.length ? (
                <View style={{ gap: 10 }}>
                  {result.pros.map((p, i) => (
                    <PlusLine key={i} text={p} />
                  ))}
                </View>
              ) : (
                <EmptyLine text="No pros found" />
              )}
            </SectionCard>

            <SectionCard title="Cons" style={styles.rowItem}>
              {result?.cons?.length ? (
                <View style={{ gap: 10 }}>
                  {result.cons.map((c, i) => (
                    <MinusLine key={i} text={c} />
                  ))}
                </View>
              ) : (
                <EmptyLine text="No cons found" />
              )}
            </SectionCard>
          </View>
        </ScrollView>

        {/* Bottom action bar */}
        <View style={styles.bottomBar}>
          <TouchableOpacity style={styles.secondaryBtn} onPress={() => navigation.navigate('ScanProducts')}>
            <Text style={styles.secondaryText}>Scan another</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.primaryBtn} onPress={() => navigation.navigate('MainApp')}>
            <Text style={styles.primaryText}>Done</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

// Reusable section card
function SectionCard({ title, children, style }: { title: string; children: React.ReactNode; style?: any }) {
  return (
    <View style={[styles.card, style]}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={{ marginTop: 10 }}>{children}</View>
    </View>
  );
}

function Bullet({ text }: { text: string }) {
  return (
    <View style={styles.bulletRow}>
      <View style={styles.bulletDot} />
      <Text style={styles.body}>{text}</Text>
    </View>
  );
}

function PlusLine({ text }: { text: string }) {
  return (
    <View style={styles.iconRow}>
      <View style={[styles.iconCircle, { backgroundColor: '#E8F6EC' }]}>
        <Text style={{ color: '#2F8F4E', fontWeight: '900' }}>+</Text>
      </View>
      <Text style={styles.body}>{text}</Text>
    </View>
  );
}

function MinusLine({ text }: { text: string }) {
  return (
    <View style={styles.iconRow}>
      <View style={[styles.iconCircle, { backgroundColor: '#FBEAEA' }]}>
        <Text style={{ color: '#B23B3B', fontWeight: '900' }}>–</Text>
      </View>
      <Text style={styles.body}>{text}</Text>
    </View>
  );
}

function EmptyLine({ text }: { text: string }) {
  return <Text style={styles.muted}>{text}</Text>;
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: CANVAS },
  flex: { flex: 1 },
  content: { padding: 20, paddingBottom: 120 },

  // Hero
  heroCard: {
    backgroundColor: SURFACE,
    borderRadius: 24,
    padding: 16,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: BORDER,
  },
  heroLeft: { flex: 1, paddingRight: 12 },
  heroKicker: { color: TEXT_MUTED, fontSize: 11, fontWeight: '700' },
  heroTitle: { color: TEXT, fontSize: 20, fontWeight: '900', marginTop: 6 },
  heroBrand: { color: TEXT_MUTED, fontSize: 12, marginTop: 2 },
  heroSubRow: { marginTop: 10 },
  heroSub: { color: TEXT_MUTED, fontSize: 12 },
  heroRight: { alignItems: 'center', justifyContent: 'center' },
  heroImage: { width: 90, height: 90, borderRadius: 12, backgroundColor: '#eee', marginBottom: 8 },
  scoreBadge: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 6,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF',
  },
  scoreNum: { fontSize: 22, fontWeight: '900' },
  scorePct: { position: 'absolute', bottom: 10, right: 14, color: TEXT_MUTED, fontSize: 10, fontWeight: '700' },

  // Cards
  card: {
    backgroundColor: SURFACE,
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: BORDER,
  },
  sectionTitle: { color: TEXT, fontSize: 14, fontWeight: '800' },
  body: { color: TEXT, fontSize: 13, flex: 1 },
  muted: { color: TEXT_MUTED, fontSize: 12 },

  bulletRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  bulletDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: ACCENT },

  chipsWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { backgroundColor: '#F6EFE7', borderRadius: 16, paddingVertical: 6, paddingHorizontal: 10, borderWidth: 1, borderColor: BORDER },
  chipText: { color: TEXT, fontSize: 12, fontWeight: '700' },

  iconRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  iconCircle: { width: 24, height: 24, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },

  // Pros/Cons layout
  rowWrap: { gap: 16 },
  rowItem: {},

  // Bottom bar
  bottomBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    padding: 16,
    backgroundColor: CANVAS,
    borderTopWidth: 1,
    borderTopColor: BORDER,
    flexDirection: 'row',
    gap: 12,
  },
  secondaryBtn: { flex: 1, height: 48, borderRadius: 28, borderWidth: 1, borderColor: BORDER, alignItems: 'center', justifyContent: 'center', backgroundColor: SURFACE },
  secondaryText: { color: TEXT, fontWeight: '800' },
  primaryBtn: { flex: 1, height: 48, borderRadius: 28, alignItems: 'center', justifyContent: 'center', backgroundColor: ACCENT },
  primaryText: { color: '#FFF', fontWeight: '800' },
});