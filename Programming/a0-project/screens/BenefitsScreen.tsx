import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  ImageBackground,
  Dimensions,
  TouchableOpacity,
  Animated,
  ScrollView
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

// Refined benefits data - focused on the most impactful features
const benefits = [
  {
    title: "Personalized Routine",
    description: "Tailored skincare regimen based on your unique skin profile.",
    icon: "sparkles-outline"
  },
  {
    title: "AI Skin Analysis", 
    description: "Advanced technology that understands your skin's specific needs.",
    icon: "scan-outline"
  },
  {
    title: "Product Scanning",
    description: "Scan products to check match and benefits for your unique skin profile.",
    icon: "barcode-outline"
  },
  {
    title: "Progress Tracking",
    description: "Visualize your skin's transformation journey over time.",
    icon: "trending-up-outline"
  }
];

export default function BenefitsScreen({ route }) {
  const navigation = useNavigation();
  const { answers } = route.params || {};
  
  // Animation values for each benefit item
  const fadeAnims = useRef(benefits.map(() => new Animated.Value(0))).current;
  const slideAnims = useRef(benefits.map(() => new Animated.Value(40))).current;
  
  // Button animation
  const buttonFade = useRef(new Animated.Value(0)).current;
  const buttonScale = useRef(new Animated.Value(0.9)).current;
  
  // Header animations
  const headerFade = useRef(new Animated.Value(0)).current;
  const headerSlide = useRef(new Animated.Value(-20)).current;
  
  useEffect(() => {
    // Header animation first
    Animated.parallel([
      Animated.timing(headerFade, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(headerSlide, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      })
    ]).start();
    
    // Staggered animations for benefits
    benefits.forEach((_, index) => {
      Animated.sequence([
        Animated.delay(400 + index * 250),
        Animated.parallel([
          Animated.timing(fadeAnims[index], {
            toValue: 1,
            duration: 700,
            useNativeDriver: true,
          }),
          Animated.timing(slideAnims[index], {
            toValue: 0,
            duration: 700,
            useNativeDriver: true,
          })
        ])
      ]).start();
    });
    
    // Button animation after all benefits
    Animated.sequence([
      Animated.delay(400 + benefits.length * 250 + 400),
      Animated.parallel([
        Animated.timing(buttonFade, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(buttonScale, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        })
      ])
    ]).start();
  }, [fadeAnims, slideAnims, buttonFade, buttonScale, headerFade, headerSlide]);

  const handleContinue = () => {
    navigation.navigate('WomanResults', { answers });
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      
      <ImageBackground 
        source={{ uri: 'https://i.postimg.cc/9fsvkTJb/Whats-App-Image-2025-07-14-at-8-17-02-AM.jpg' }}
        style={styles.backgroundImage}
        resizeMode="cover"
      >
        <LinearGradient
          colors={['rgba(0,0,0,0.3)', 'rgba(0,0,0,0.7)', 'rgba(0,0,0,0.85)']}
          style={styles.gradient}
        >
          <SafeAreaView style={styles.safeArea}>
            <View style={styles.content}>
              <Animated.View 
                style={[
                  styles.header,
                  {
                    opacity: headerFade,
                    transform: [{ translateY: headerSlide }]
                  }
                ]}
              >
                <Text style={styles.title}>Elevate Your Skincare</Text>
                <Text style={styles.subtitle}>
                  Experience the future of personalized beauty
                </Text>
              </Animated.View>
              
              <View style={styles.benefitsContainer}>
                {benefits.map((benefit, index) => (
                  <Animated.View 
                    key={index}
                    style={[
                      styles.benefitCard,
                      {
                        opacity: fadeAnims[index],
                        transform: [{ translateY: slideAnims[index] }]
                      }
                    ]}
                  >
                    <View style={styles.iconContainer}>
                      <Ionicons name={benefit.icon} size={24} color="#FFF3E0" />
                    </View>
                    <View style={styles.benefitContent}>
                      <Text style={styles.benefitTitle}>{benefit.title}</Text>
                      <Text style={styles.benefitDescription}>{benefit.description}</Text>
                    </View>
                  </Animated.View>
                ))}
              </View>
              
              <Animated.View 
                style={[
                  styles.buttonContainer,
                  {
                    opacity: buttonFade,
                    transform: [{ scale: buttonScale }]
                  }
                ]}
              >
                <TouchableOpacity 
                  style={styles.continueButton}
                  onPress={handleContinue}
                  activeOpacity={0.7}
                >
                  <Text style={styles.continueText}>View Results</Text>
                  <Ionicons 
                    name="arrow-forward" 
                    size={20} 
                    color="#FFF3E0" 
                    style={styles.buttonIcon} 
                  />
                </TouchableOpacity>
              </Animated.View>
            </View>
          </SafeAreaView>
        </LinearGradient>
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
  gradient: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 40,
    paddingBottom: 40,
    justifyContent: 'space-between',
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 36,
    fontWeight: '700',
    color: '#FFF3E0',
    textAlign: 'center',
    letterSpacing: 0.5,
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 17,
    color: '#FFF3E0',
    opacity: 0.8,
    textAlign: 'center',
    maxWidth: width * 0.8,
    letterSpacing: 0.3,
    lineHeight: 24,
  },
  benefitsContainer: {
    flex: 1,
    justifyContent: 'center',
    marginVertical: 20,
  },
  benefitCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 28,
    paddingHorizontal: 5,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(168, 106, 72, 0.25)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 18,
    borderWidth: 1,
    borderColor: 'rgba(255, 243, 224, 0.15)',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  benefitContent: {
    flex: 1,
  },
  benefitTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#FFF3E0',
    marginBottom: 6,
    letterSpacing: 0.3,
  },
  benefitDescription: {
    fontSize: 15,
    color: '#FFF3E0',
    opacity: 0.7,
    lineHeight: 22,
    letterSpacing: 0.2,
  },
  buttonContainer: {
    alignItems: 'center',
    marginTop: 20,
  },
  continueButton: {
    backgroundColor: 'rgba(168, 106, 72, 0.9)',
    paddingVertical: 18,
    borderRadius: 30,
    width: width * 0.7,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 6,
    borderWidth: 1,
    borderColor: 'rgba(255, 243, 224, 0.2)',
  },
  continueText: {
    color: '#FFF3E0',
    fontSize: 18,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  buttonIcon: {
    marginLeft: 8,
  }
});