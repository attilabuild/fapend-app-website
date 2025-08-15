import React, { useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Dimensions, 
  TouchableOpacity, 
  Animated, 
  SafeAreaView, 
  StatusBar, 
  Image,
  ScrollView
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Platform } from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

export default function ResultsScreen({ navigation, route }) {
  const { imageUri } = route.params || {};
  
  // Animation refs
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const imageAnim = useRef(new Animated.Value(0)).current;
  const scoreAnim = useRef(new Animated.Value(0)).current;
  const buttonAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.parallel([
        Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
        Animated.timing(slideAnim, { toValue: 0, duration: 600, useNativeDriver: true })
      ]),
      Animated.timing(imageAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
      Animated.timing(scoreAnim, { toValue: 1, duration: 700, useNativeDriver: true }),
      Animated.timing(buttonAnim, { toValue: 1, duration: 500, useNativeDriver: true })
    ]).start();
  }, []);

  // Mock data for metrics
  const mockScores = {
    overall: 87,
    acne: 92,
    smoothness: 78,
    glow: 85,
    pores: 80,
    texture: 90
  };

  // Render a metric with blurred value
  const renderMetric = (label, value) => (
    <View style={styles.metricContainer}>
      <Text style={styles.metricLabel}>{label}</Text>
      <View style={styles.blurPillWrapper}>
        {Platform.OS !== 'web' ? (
          <BlurView intensity={50} tint="light" style={styles.blurPill}>
            {/* hidden value text for structure */}
            <Text style={styles.hiddenText}>{value}</Text>
            {/* lock icon overlay */}
            <View style={styles.lockOverlay}>
              <Ionicons name="lock-closed" size={18} color="#6B4A36" />
            </View>
          </BlurView>
        ) : (
          <LinearGradient 
            colors={["rgba(230,220,210,0.9)", "rgba(210,200,190,0.7)"]} 
            start={{x:0,y:0}} 
            end={{x:1,y:1}} 
            style={styles.blurPill}>
            <Text style={styles.hiddenText}>{value}</Text>
            <View style={styles.lockOverlay}>
              <Ionicons name="lock-closed" size={18} color="#6B4A36" />
            </View>
          </LinearGradient>
        )}
      </View>
      <View style={styles.progressBarContainer}>
        <View style={[styles.progressBar, { width: `${value}%` }]} />
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#F3E3D2" />
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.container}>
          {/* Header */}
          <Animated.View style={[styles.headerContainer, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
            <Text style={styles.title}>Reveal your results</Text>
          </Animated.View>

          {/* User Image */}
          <Animated.View style={[styles.userImageContainer, { opacity: imageAnim }]}>
            {imageUri ? (
              <Image source={{ uri: imageUri }} style={styles.userImage} />
            ) : (
              <View style={styles.userImage}>
                <Image 
                  source={{ uri: 'https://via.placeholder.com/150' }} 
                  style={styles.userImage} 
                />
              </View>
            )}
          </Animated.View>

          {/* Results Card */}
          <Animated.View 
            style={[
              styles.resultsCard, 
              { 
                opacity: scoreAnim, 
                transform: [{ translateY: scoreAnim.interpolate({ inputRange: [0,1], outputRange: [20,0] }) }] 
              }
            ]}
          >
            {/* Row 1 */}
            <View style={styles.row}>
              {renderMetric("Overall", mockScores.overall)}
              {renderMetric("Acne", mockScores.acne)}
            </View>
            
            {/* Row 2 */}
            <View style={styles.row}>
              {renderMetric("Smoothness", mockScores.smoothness)}
              {renderMetric("Glow", mockScores.glow)}
            </View>
            
            {/* Row 3 */}
            <View style={styles.row}>
              {renderMetric("Pores", mockScores.pores)}
              {renderMetric("Texture", mockScores.texture)}
            </View>
          </Animated.View>

          {/* CTA Button */}
          <Animated.View style={[styles.ctaContainer, { opacity: buttonAnim }]}>
            <TouchableOpacity 
              style={styles.ctaButton}
              onPress={() => navigation.navigate('Paywall')}
              activeOpacity={0.9}
            >
              <LinearGradient 
                colors={["#B07A57", "#E5C6A8"]}
                start={{ x: 0, y: 0 }} 
                end={{ x: 1, y: 0 }} 
                style={styles.ctaGradient}
              >
                <Text style={styles.ctaText}>Get Skinmax Pro</Text>
              </LinearGradient>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F3E3D2',
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 40,
  },
  container: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 16,
    backgroundColor: '#F3E3D2',
  },
  headerContainer: {
    marginTop: 20,
    marginBottom: 10,
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#3D2A1F',
    textAlign: 'center',
  },
  userImageContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 2,
    borderColor: '#3D2A1F',
    overflow: 'hidden',
    marginVertical: 20,
  },
  userImage: {
    width: '100%',
    height: '100%',
  },
  resultsCard: {
    width: width - 32,
    maxWidth: 500,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    borderRadius: 24,
    padding: 20,
    marginTop: 10,
    borderWidth: 1,
    borderColor: 'rgba(176,122,87,0.35)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  metricContainer: {
    width: '48%',
    alignItems: 'center',
  },
  metricLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#3D2A1F',
    marginBottom: 10,
  },
  blurPillWrapper: {
    width: '90%',
    height: 36,
    borderRadius: 18,
    overflow: 'hidden',
    marginBottom: 10,
    backgroundColor: 'rgba(255,255,255,0.4)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  blurPill: {
    width: '100%',
    height: '100%',
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  hiddenText: {
    fontSize: 16,
    fontWeight: '700',
    color: 'transparent',
  },
  lockOverlay: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressBarContainer: {
    width: '100%',
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(61,42,31,0.15)',
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: 'rgba(176,122,87,0.5)',
    borderRadius: 3,
  },
  ctaContainer: {
    width: '100%',
    alignItems: 'center',
    marginTop: 30,
  },
  ctaButton: {
    width: width - 32,
    maxWidth: 500,
    height: 60,
    borderRadius: 30,
    overflow: 'hidden',
  },
  ctaGradient: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctaText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1C120C',
  }
});