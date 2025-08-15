import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, Platform, Image, Alert, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';

const CANVAS = '#FCF9F2';
const SURFACE = '#FFFFFF';
const BORDER = 'rgba(0,0,0,0.06)';
const TEXT = '#2B1A12';
const TEXT_MUTED = 'rgba(43,26,18,0.6)';
const ACCENT = '#B66C2F';
const ACCENT_SOFT = '#F2D9C3';
const ACCENT_DARK = '#2B1A12';

export default function ScanProductsScreen() {
  const navigation = useNavigation();
  const [imageUri, setImageUri] = useState<string | null>(null);

  const pickImage = async () => {
    try {
      if (Platform.OS !== 'web') {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('Permission required', 'We need access to your photos to upload images.');
          return;
        }
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.8,
        allowsEditing: true,
      });

      if (!result.cancelled) {
        setImageUri(result.uri);
        // Navigate to analyzing screen with the selected image
        // @ts-ignore - route exists in App stack
        navigation.navigate('ScanAnalyzing', { imageUri: result.uri, source: 'library' });
      }
    } catch (err) {
      console.warn(err);
      Alert.alert('Error', 'Unable to pick image. Please try again.');
    }
  };

  const takePhoto = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission required', 'We need camera permission to take a photo.');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        quality: 0.8,
        allowsEditing: true,
      });

      if (!result.cancelled) {
        setImageUri(result.uri);
        // Navigate to analyzing screen with the captured image
        // @ts-ignore - route exists in App stack
        navigation.navigate('ScanAnalyzing', { imageUri: result.uri, source: 'camera' });
      }
    } catch (err) {
      console.warn(err);
      Alert.alert('Error', 'Unable to open camera. Please try again.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.navigate('MainApp')} style={styles.backBtn} accessibilityLabel="Go Home">
          <Ionicons name="chevron-back" size={22} color={ACCENT_DARK} />
        </TouchableOpacity>
        <Image
          source={{ uri: 'https://i.postimg.cc/br31jLrs/Whats-App-Image-2025-08-10-at-6-20-55-PM-removebg-preview.png' }}
          style={styles.logo}
          resizeMode="contain"
        />
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={[styles.hero]}>
          <View style={styles.heroInner}>
            <View style={styles.heroTextWrap}>
              <Text style={styles.title}>Know what's good for your skin!</Text>
              <Text style={styles.sub}>Check safety, match and ingredients by uploading product image</Text>

              <View style={styles.pillRow}>
                <TouchableOpacity activeOpacity={0.9} onPress={pickImage} style={styles.pillBtn}>
                  <View style={styles.pillIcon}><Ionicons name="image-outline" size={18} color={ACCENT_DARK} /></View>
                  <Text style={styles.pillText}>Upload</Text>
                </TouchableOpacity>

                <TouchableOpacity activeOpacity={0.9} onPress={takePhoto} style={styles.pillBtn}>
                  <View style={styles.pillIcon}><Ionicons name="camera-outline" size={18} color={ACCENT_DARK} /></View>
                  <Text style={styles.pillText}>Take Photo</Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.heroAccentWrap} pointerEvents="none">
              <Text style={styles.accentStar}>✦</Text>
            </View>
          </View>
        </View>

        <View style={styles.howCard}>
          <Text style={styles.sectionTitle}>How it works</Text>
          <View style={styles.howRow}>
            <View style={styles.stepIcon}><Ionicons name="camera-outline" size={18} color={ACCENT_DARK} /></View>
            <Text style={styles.howText}>Open camera and upload product image</Text>
          </View>
          <View style={styles.howRow}>
            <View style={styles.stepIcon}><Ionicons name="search-outline" size={18} color={ACCENT_DARK} /></View>
            <Text style={styles.howText}>We'll analyze and match products to your profile</Text>
          </View>
          <View style={styles.howRow}>
            <View style={styles.stepIcon}><Ionicons name="checkmark-outline" size={18} color={ACCENT_DARK} /></View>
            <Text style={styles.howText}>See safety, ingredients, and best-fit alternatives</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: CANVAS },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: 6, paddingBottom: 12 },
  backBtn: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  logo: { width: 160, height: 56, alignSelf: 'center', marginTop: 8 },

  content: { paddingHorizontal: 20, paddingTop: 10, paddingBottom: 48 },

  /* HERO */
  hero: {
    marginTop: 10,
    borderRadius: 24,
    backgroundColor: ACCENT,
    padding: 22,
    overflow: 'hidden',
  },
  heroInner: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  heroTextWrap: { flex: 1, paddingRight: 12 },
  title: { color: SURFACE, fontSize: 20, fontWeight: '800', marginBottom: 8 },
  sub: { color: 'rgba(255,255,255,0.88)', fontSize: 14, lineHeight: 20 },

  pillRow: { flexDirection: 'row', marginTop: 18, gap: 12 },
  pillBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: ACCENT_SOFT, paddingVertical: 12, paddingHorizontal: 18, borderRadius: 28, minWidth: 140 },
  pillIcon: { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.32)', alignItems: 'center', justifyContent: 'center', marginRight: 10 },
  pillText: { color: ACCENT_DARK, fontWeight: '800', fontSize: 15 },

  heroAccentWrap: { width: 48, height: 48, alignItems: 'center', justifyContent: 'center' },
  accentStar: { fontSize: 30, color: SURFACE, opacity: 0.95 },

  /* How it works card */
  howCard: { marginTop: 26, backgroundColor: SURFACE, borderRadius: 12, padding: 18, ...Platform.select({ ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.06, shadowRadius: 14 }, android: { elevation: 2 } }) },
  sectionTitle: { color: TEXT, fontSize: 16, fontWeight: '800', marginBottom: 12 },
  howRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8 },
  stepIcon: { width: 36, height: 36, borderRadius: 18, backgroundColor: ACCENT_SOFT, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  howText: { flex: 1, color: TEXT, fontSize: 14 },
});