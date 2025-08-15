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
  Image
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

export default function ManResultsScreen({ route }) {
  const navigation = useNavigation();
  const { answers } = route.params || {};
  
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const imageFade = useRef(new Animated.Value(0)).current;
  const imageScale = useRef(new Animated.Value(0.95)).current;
  
  // Button animation
  const buttonFade = useRef(new Animated.Value(0)).current;
  const buttonScale = useRef(new Animated.Value(0.9)).current;
  
  useEffect(() => {
    // Header animation
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      })
    ]).start();
    
    // Image animation
    Animated.sequence([
      Animated.delay(400),
      Animated.parallel([
        Animated.timing(imageFade, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(imageScale, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        })
      ])
    ]).start();
    
    // Button animation
    Animated.sequence([
      Animated.delay(1000),
      Animated.parallel([
        Animated.timing(buttonFade, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(buttonScale, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        })
      ])
    ]).start();
  }, []);

  const handleContinue = () => {
    navigation.navigate('Reviews', { answers });
  };

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
                styles.header,
                {
                  opacity: fadeAnim,
                  transform: [{ translateY: slideAnim }]
                }
              ]}
            >
              <Text style={styles.title}>Real Transformation</Text>
              <Text style={styles.subtitle}>
                See the amazing results our users achieve with Skinmax
              </Text>
            </Animated.View>
            
            <Animated.View 
              style={[
                styles.imageContainer,
                {
                  opacity: imageFade,
                  transform: [{ scale: imageScale }]
                }
              ]}
            >
              <Image 
                source={{ uri: 'https://i.postimg.cc/5Ntcjfsy/f5af2d49ef9a6525e0eb0b10d74193a2.jpg' }}
                style={styles.beforeAfterImage}
                resizeMode="contain"
              />
              
              <View style={styles.resultInfo}>
                <View style={styles.resultItem}>
                  <Text style={styles.resultLabel}>Texture Improvement</Text>
                  <Text style={styles.resultValue}>78%</Text>
                </View>
                <View style={styles.resultItem}>
                  <Text style={styles.resultLabel}>Hydration</Text>
                  <Text style={styles.resultValue}>85%</Text>
                </View>
                <View style={styles.resultItem}>
                  <Text style={styles.resultLabel}>Time Period</Text>
                  <Text style={styles.resultValue}>6 Weeks</Text>
                </View>
              </View>
              
              <Text style={styles.testimonial}>
                "My skin was always dry and rough. Skinmax's personalized routine helped me achieve smoother, more hydrated skin that I never thought was possible."
              </Text>
              <Text style={styles.userName}>— James, 21</Text>
            </Animated.View>
            
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
                activeOpacity={0.8}
              >
                <Ionicons name="arrow-forward" size={24} color="#FFF3E0" style={{ marginRight: 8 }} />
                <Text style={styles.continueText}>Next</Text>
              </TouchableOpacity>
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
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 30,
    justifyContent: 'space-between',
  },
  header: {
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: '600',
    color: '#FFF3E0',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#FFF3E0',
    opacity: 0.8,
    textAlign: 'center',
    marginTop: 8,
  },
  imageContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 20,
  },
  beforeAfterImage: {
    width: width * 0.9,
    height: width * 0.6,
    borderRadius: 12,
    marginBottom: 20,
    borderWidth: 2,
    borderColor: '#A86A48',
  },
  resultInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 20,
  },
  resultItem: {
    alignItems: 'center',
    backgroundColor: 'rgba(168, 106, 72, 0.2)',
    borderRadius: 12,
    padding: 12,
    flex: 1,
    marginHorizontal: 5,
    borderWidth: 1,
    borderColor: 'rgba(168, 106, 72, 0.3)',
  },
  resultLabel: {
    fontSize: 12,
    color: '#FFF3E0',
    opacity: 0.8,
    marginBottom: 4,
  },
  resultValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFF3E0',
  },
  testimonial: {
    fontSize: 16,
    fontStyle: 'italic',
    color: '#FFF3E0',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 8,
    paddingHorizontal: 20,
  },
  userName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFF3E0',
    textAlign: 'center',
  },
  buttonContainer: {
    alignItems: 'center',
    marginTop: 20,
  },
  continueButton: {
    backgroundColor: '#A86A48',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 30,
    width: width * 0.8,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  continueText: {
    color: '#FFF3E0',
    fontSize: 18,
    fontWeight: '500',
  },
});