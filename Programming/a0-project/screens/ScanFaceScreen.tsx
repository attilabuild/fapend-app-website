import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  ImageBackground,
  Dimensions,
  TouchableOpacity,
  Animated,
  Easing,
  Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import { Alert } from 'react-native';

const { width, height } = Dimensions.get('window');

const tips = [
  "Face the camera directly with neutral expression",
  "Use good lighting (natural light is best)",
  "Remove glasses, hats, or hair covering your face",
  "Avoid heavy makeup for most accurate results",
  "Ensure your entire face is visible in the frame"
];

export default function ScanFaceScreen({ route }) {
  const navigation = useNavigation();
  const { answers } = route.params || {};
  
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const tipFadeAnim = useRef(new Animated.Value(0)).current;
  const tipIndexAnim = useRef(new Animated.Value(0)).current;
  
  // State for current tip
  const [currentTipIndex, setCurrentTipIndex] = useState(0);
  
  // Rotate interpolation for the scanning effect
  const rotate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg']
  });

  // Pulse interpolation for the scan button
  const pulse = pulseAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [1, 1.05, 1]
  });

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    // Initial animations
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
        easing: Easing.out(Easing.cubic)
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
        easing: Easing.out(Easing.cubic)
      })
    ]).start();
    
    // Start rotating animation for scan effect
    Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 4000,
        useNativeDriver: true,
        easing: Easing.linear
      })
    ).start();
    
    // Start pulsing animation for buttons
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
          easing: Easing.inOut(Easing.cubic)
        }),
        Animated.timing(pulseAnim, {
          toValue: 0,
          duration: 1500,
          useNativeDriver: true,
          easing: Easing.inOut(Easing.cubic)
        })
      ])
    ).start();
    
    // Tip cycling animation
    Animated.timing(tipFadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true
    }).start();
    
    // Cycle through tips every 4 seconds
    const tipInterval = setInterval(() => {
      Animated.sequence([
        Animated.timing(tipFadeAnim, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true
        }),
        Animated.timing(tipIndexAnim, {
          toValue: 1,
          duration: 0,
          useNativeDriver: true
        }),
        Animated.timing(tipFadeAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true
        })
      ]).start();
      
      setCurrentTipIndex((prevIndex) => (prevIndex + 1) % tips.length);
      tipIndexAnim.setValue(0);
    }, 4000);
    
    return () => clearInterval(tipInterval);
  }, []);

  const handleUploadPhoto = async () => {
    // Request media library permissions
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission required', 'Permission to access photo library is required!');
      return;
    }
    // Launch image library
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
    });
    if (!result.cancelled) {
      navigation.replace('Analysis', { imageUri: result.uri });
    }
  };

  const handleTakePhoto = async () => {
    // Request camera permissions
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission required', 'Permission to access camera is required!');
      return;
    }
    // Launch camera
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
    });
    if (!result.cancelled) {
      navigation.replace('Analysis', { imageUri: result.uri });
    }
  };

  const handleBack = () => {
    navigation.goBack();
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
            {/* Back button */}
            <TouchableOpacity 
              style={styles.backButton}
              onPress={handleBack}
              activeOpacity={0.7}
            >
              <Ionicons name="arrow-back" size={24} color="#FFF3E0" />
            </TouchableOpacity>
            
            <Animated.View 
              style={[
                styles.content,
                {
                  opacity: fadeAnim,
                  transform: [{ translateY: slideAnim }]
                }
              ]}
            >
              <Text style={styles.title}>Scan Your Face</Text>
              <Text style={styles.subtitle}>
                Let our AI analyze your skin and create a personalized routine
              </Text>
              
              {/* Scanning frame animation */}
              <View style={styles.scanFrameContainer}>
                <View style={styles.scanFrame}>
                  <Animated.View 
                    style={[
                      styles.scanningEffect,
                      { transform: [{ rotate }] }
                    ]}
                  >
                    <LinearGradient
                      colors={['rgba(168, 106, 72, 0)', 'rgba(168, 106, 72, 0.8)', 'rgba(168, 106, 72, 0)']}
                      style={styles.scanGradient}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                    />
                  </Animated.View>
                  <View style={styles.cornerTL} />
                  <View style={styles.cornerTR} />
                  <View style={styles.cornerBL} />
                  <View style={styles.cornerBR} />
                  <Ionicons name="scan-outline" size={40} color="rgba(255, 243, 224, 0.6)" style={styles.scanIcon} />
                </View>
              </View>
              
              {/* Cycling tips */}
              <View style={styles.tipContainer}>
                <Ionicons name="bulb-outline" size={20} color="#A86A48" style={styles.tipIcon} />
                <Animated.Text 
                  style={[
                    styles.tipText,
                    { opacity: tipFadeAnim }
                  ]}
                >
                  {tips[currentTipIndex]}
                </Animated.Text>
              </View>
              
              {/* Action buttons */}
              <View style={styles.buttonContainer}>
                <Animated.View style={{ transform: [{ scale: pulse }] }}>
                  <TouchableOpacity 
                    style={styles.uploadButton}
                    onPress={handleUploadPhoto}
                    activeOpacity={0.8}
                  >
                    <Ionicons name="image-outline" size={24} color="#FFF3E0" style={styles.buttonIcon} />
                    <Text style={styles.buttonText}>Upload Photo</Text>
                  </TouchableOpacity>
                </Animated.View>
                
                <Animated.View style={{ transform: [{ scale: pulse }] }}>
                  <TouchableOpacity 
                    style={styles.cameraButton}
                    onPress={handleTakePhoto}
                    activeOpacity={0.8}
                  >
                    <Ionicons name="camera-outline" size={24} color="#FFF3E0" style={styles.buttonIcon} />
                    <Text style={styles.buttonText}>Take Photo</Text>
                  </TouchableOpacity>
                </Animated.View>
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
    paddingHorizontal: 20,
  },
  backButton: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 50 : 40,
    left: 20,
    zIndex: 10,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 50,
  },
  title: {
    fontSize: 32,
    fontWeight: '600',
    color: '#FFF3E0',
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#FFF3E0',
    opacity: 0.8,
    textAlign: 'center',
    marginBottom: 40,
    paddingHorizontal: 20,
  },
  scanFrameContainer: {
    width: width * 0.8,
    aspectRatio: 3/4,
    marginBottom: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scanFrame: {
    width: '100%',
    height: '100%',
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(168, 106, 72, 0.5)',
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  scanningEffect: {
    position: 'absolute',
    width: '200%',
    height: '200%',
    top: '-50%',
    left: '-50%',
  },
  scanGradient: {
    width: '100%',
    height: '100%',
  },
  cornerTL: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: 30,
    height: 30,
    borderTopWidth: 2,
    borderLeftWidth: 2,
    borderColor: '#A86A48',
    borderTopLeftRadius: 10,
  },
  cornerTR: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 30,
    height: 30,
    borderTopWidth: 2,
    borderRightWidth: 2,
    borderColor: '#A86A48',
    borderTopRightRadius: 10,
  },
  cornerBL: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    width: 30,
    height: 30,
    borderBottomWidth: 2,
    borderLeftWidth: 2,
    borderColor: '#A86A48',
    borderBottomLeftRadius: 10,
  },
  cornerBR: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 30,
    height: 30,
    borderBottomWidth: 2,
    borderRightWidth: 2,
    borderColor: '#A86A48',
    borderBottomRightRadius: 10,
  },
  scanIcon: {
    opacity: 0.7,
  },
  tipContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    borderRadius: 12,
    padding: 12,
    marginBottom: 30,
    width: '90%',
    minHeight: 60,
  },
  tipIcon: {
    marginRight: 10,
  },
  tipText: {
    color: '#FFF3E0',
    fontSize: 14,
    flex: 1,
    lineHeight: 20,
  },
  buttonContainer: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 10,
  },
  uploadButton: {
    backgroundColor: 'rgba(168, 106, 72, 0.8)',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 25,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: width * 0.4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  cameraButton: {
    backgroundColor: 'rgba(168, 106, 72, 0.8)',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 25,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: width * 0.4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  buttonIcon: {
    marginRight: 8,
  },
  buttonText: {
    color: '#FFF3E0',
    fontSize: 14,
    fontWeight: '500',
  },
});