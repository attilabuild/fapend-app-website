import React, { useState, useRef, useEffect } from 'react';
import { View, Text, ScrollView, Image, StyleSheet, TouchableOpacity, StatusBar, Linking, TextInput, Animated, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialIcons, Feather } from '@expo/vector-icons';
import { CameraView, useCameraPermissions } from 'expo-camera';
import AsyncStorage from '@react-native-async-storage/async-storage';
// Lazy load Voice to avoid native module errors in Expo Go
let Voice: any = null;
function getVoice() {
  if (Voice === null) {
    try {
      Voice = require('@react-native-voice/voice').default;
    } catch (e) {
      console.warn('Voice module not available (running in Expo Go?)');
      // Return a mock object with no-op methods
      Voice = {
        start: () => Promise.resolve(),
        stop: () => Promise.resolve(),
        cancel: () => Promise.resolve(),
        destroy: () => Promise.resolve(),
        removeAllListeners: () => {},
        onSpeechStart: null,
        onSpeechEnd: null,
        onSpeechResults: null,
        onSpeechPartialResults: null,
        onSpeechError: null,
        isAvailable: () => Promise.resolve(false),
      };
    }
  }
  return Voice;
}
import * as Notifications from 'expo-notifications';
import { authAPI, postsAPI, friendsAPI, chatAPI, journalAPI, DEMO_MODE } from './src/api';

// Splash Screen
function SplashScreen() {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);
  
  return (
    <View style={styles.splashContainer}>
      <StatusBar barStyle="light-content" backgroundColor="#000" />
      <Animated.View 
        style={[
          styles.splashContent,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          }
        ]}
      >
        <View style={styles.splashLogoContainer}>
          <Text style={styles.splashLogo}>BeHigh</Text>
          <View style={styles.splashDot} />
        </View>
        <Text style={styles.splashTagline}>Your premium social community</Text>
        
        {/* Loading indicator */}
        <View style={styles.splashLoadingContainer}>
          <View style={styles.splashLoadingBar}>
            <Animated.View 
              style={[
                styles.splashLoadingFill,
                {
                  opacity: fadeAnim,
                }
              ]} 
            />
          </View>
        </View>
      </Animated.View>
    </View>
  );
}

// Login/Signup Screen
function LoginScreen({ onLogin }: { onLogin: () => void }) {
  const [isSignup, setIsSignup] = useState(false);
  const [emailOrUsername, setEmailOrUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [authLoading, setAuthLoading] = useState(false);
  
  // Email validation function
  const isValidEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email.trim());
  };
  
  const handleAuth = async () => {
    // Validation for signup
    if (isSignup) {
      if (!email || !email.trim()) {
        alert('Please enter your email address');
        return;
      }
      
      const trimmedEmail = email.trim();
      if (!isValidEmail(trimmedEmail)) {
        alert('Please enter a valid email address (e.g., name@example.com)');
        return;
      }
      
      if (password !== confirmPassword) {
        alert('Passwords do not match');
        return;
      }
      if (password.length < 6) {
        alert('Password must be at least 6 characters');
        return;
      }
    } else {
      if (!emailOrUsername || !password) {
        alert('Please fill in all fields');
        return;
      }
    }
    
    setAuthLoading(true);
    try {
      if (isSignup) {
        // Sign up - need username from onboarding
        // For now, use email as username
        const trimmedEmail = email.trim();
        const username = trimmedEmail.split('@')[0].toLowerCase().replace(/[^a-z0-9]/g, '');
        
        // Validate username is not empty after cleaning
        if (!username || username.length < 3) {
          alert('Email must contain at least 3 valid characters before @ symbol');
          setAuthLoading(false);
          return;
        }
        
        const { user, error } = await authAPI.signUp(trimmedEmail, password, username, username);
        
        if (error) {
          // Better error messages
          let errorMessage = 'Sign up failed';
          if (error.message) {
            if (error.message.includes('already registered') || error.message.includes('already exists') || error.message.includes('already been registered')) {
              errorMessage = 'This email is already registered. Please sign in instead.';
            } else if (error.message.includes('invalid') && error.message.includes('email')) {
              errorMessage = 'Email validation failed. Please:\n\n• Use a valid email format\n• Try a different email address\n• Check Supabase email settings if you\'re the admin';
              console.error('Full error:', error);
            } else if (error.message.includes('email')) {
              errorMessage = `Email error: ${error.message}`;
            } else {
              errorMessage = error.message;
            }
          }
          alert(errorMessage);
          setAuthLoading(false);
          return;
        }
        
        if (user) {
          // Store user ID temporarily in case session isn't available yet (email confirmation)
          if (user.id) {
            await AsyncStorage.setItem('pendingSignupUserId', user.id);
            console.log('💾 Stored pending signup user ID:', user.id);
          }
          
          // Try to get session, but proceed even if not available (email confirmation might be required)
          const { session } = await authAPI.getSession();
          if (session) {
            console.log('✅ Session available immediately after signup');
            onLogin();
          } else {
            console.log('⚠️ No session yet (email confirmation may be required), but allowing onboarding');
            // Still proceed to onboarding - session will be available after email confirmation
            // Call onLogin to set authenticated state
            onLogin();
            // Don't set onboarding/subscription yet - let them go through the flow
          }
        }
      } else {
        // Sign in - try email first, then username
        let signInError = null;
        let signInUser = null;
        
        // Try as email
        if (emailOrUsername.includes('@')) {
          const result = await authAPI.signIn(emailOrUsername, password);
          signInUser = result.user;
          signInError = result.error;
        } else {
          // Try as username - need to get user by username first
          const { user: foundUser, error: userError } = await friendsAPI.getUserByUsername(emailOrUsername);
          if (foundUser && !userError) {
            // Get email from user profile (if stored) or use a different approach
            // For now, show error that username login needs email
            alert('Please use your email to sign in');
            setAuthLoading(false);
            return;
          }
        }
        
        if (signInError) {
          alert(signInError.message || 'Login failed');
          setAuthLoading(false);
          return;
        }
        
        if (signInUser) {
          onLogin();
        }
      }
    } catch (error: any) {
      alert(error.message || 'Authentication failed');
    } finally {
      setAuthLoading(false);
    }
  };
  
  const handleAppleSignIn = async () => {
    setAuthLoading(true);
    try {
      const { user, error } = await authAPI.signInWithApple();
      
      if (error) {
        alert(error.message || 'Apple Sign In failed');
        setAuthLoading(false);
        return;
      }
      
      if (user) {
        onLogin();
      }
    } catch (error: any) {
      alert(error.message || 'Apple Sign In failed');
    } finally {
      setAuthLoading(false);
    }
  };
  
  return (
    <View style={styles.authContainer}>
      <StatusBar barStyle="light-content" />
      <ScrollView contentContainerStyle={styles.authContent}>
        <View style={styles.authHeader}>
          <Text style={styles.authLogo}>BeHigh</Text>
          <Text style={styles.authTagline}>Your premium social community</Text>
        </View>
        
        <View style={styles.authForm}>
          {isSignup ? (
            <>
              {/* Signup Form */}
              <View style={styles.authInputContainer}>
                <Ionicons name="mail-outline" size={20} color="#666" />
                  <TextInput
                  style={styles.authInput}
                  placeholder="Email"
                  placeholderTextColor="#666"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  textContentType="emailAddress"
                />
              </View>
              
              <View style={styles.authInputContainer}>
                <Ionicons name="lock-closed-outline" size={20} color="#666" />
                <TextInput
                  style={styles.authInput}
                  placeholder="Password"
                  placeholderTextColor="#666"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                />
              </View>
              
              <View style={styles.authInputContainer}>
                <Ionicons name="lock-closed-outline" size={20} color="#666" />
                <TextInput
                  style={styles.authInput}
                  placeholder="Confirm Password"
                  placeholderTextColor="#666"
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry
                />
              </View>
            </>
          ) : (
            <>
              {/* Login Form */}
              <View style={styles.authInputContainer}>
                <Ionicons name="person-outline" size={20} color="#666" />
                <TextInput
                  style={styles.authInput}
                  placeholder="Email or Username"
                  placeholderTextColor="#666"
                  value={emailOrUsername}
                  onChangeText={setEmailOrUsername}
                  autoCapitalize="none"
                />
              </View>
              
              <View style={styles.authInputContainer}>
                <Ionicons name="lock-closed-outline" size={20} color="#666" />
                <TextInput
                  style={styles.authInput}
                  placeholder="Password"
                  placeholderTextColor="#666"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                />
              </View>
            </>
          )}
          
          <TouchableOpacity 
            style={[styles.authButton, authLoading && styles.authButtonDisabled]} 
            onPress={handleAuth}
            disabled={authLoading}
          >
            {authLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.authButtonText}>{isSignup ? 'Sign Up' : 'Log In'}</Text>
            )}
          </TouchableOpacity>
          
          {/* Divider */}
          <View style={styles.authDivider}>
            <View style={styles.authDividerLine} />
            <Text style={styles.authDividerText}>OR</Text>
            <View style={styles.authDividerLine} />
          </View>
          
          {/* Sign in with Apple */}
          <TouchableOpacity 
            style={[styles.authAppleButton, authLoading && styles.authButtonDisabled]} 
            onPress={handleAppleSignIn}
            disabled={authLoading}
          >
            <Ionicons name="logo-apple" size={24} color="#fff" />
            <Text style={styles.authAppleButtonText}>Sign in with Apple</Text>
          </TouchableOpacity>
          
          <TouchableOpacity onPress={() => setIsSignup(!isSignup)}>
            <Text style={styles.authSwitchText}>
              {isSignup ? 'Already have an account? Log In' : "Don't have an account? Sign Up"}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

// Onboarding Screen
function OnboardingScreen({ onComplete }: { onComplete: (data?: { username?: string; fullName?: string; interests?: string[]; experience?: string }) => void }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [username, setUsername] = useState('');
  const [fullName, setFullName] = useState('');
  const [interests, setInterests] = useState<string[]>([]);
  const [experience, setExperience] = useState('');
  const [notifications, setNotifications] = useState<string[]>(['friends', 'journal']);
  const [hasPhoto, setHasPhoto] = useState(false);
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef<any>(null);
  const [cameraFacing, setCameraFacing] = useState<'front' | 'back'>('back');
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);
  
  const totalSteps = 5;
  
  const toggleInterest = (interest: string) => {
    setInterests(prev => 
      prev.includes(interest) 
        ? prev.filter(i => i !== interest)
        : [...prev, interest]
    );
  };
  
  const toggleNotification = (notif: string) => {
    setNotifications(prev => 
      prev.includes(notif) 
        ? prev.filter(n => n !== notif)
        : [...prev, notif]
    );
  };
  
  const handleNext = () => {
    if (currentStep < totalSteps - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // Pass onboarding data when completing
      onComplete({
        username: username.trim(),
        fullName: fullName.trim() || username.trim(), // Use username as fallback for full name
        interests,
        experience,
      });
    }
  };
  
  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };
  
  const canProceed = () => {
    switch(currentStep) {
      case 0: return username.trim().length > 2;
      case 1: return interests.length > 0;
      case 2: return experience !== '';
      case 4: return hasPhoto;
      default: return true;
    }
  };
  
  const takePicture = async () => {
    if (cameraRef.current) {
      const photo = await cameraRef.current.takePictureAsync();
      setCapturedPhoto(photo.uri);
      setHasPhoto(true);
    }
  };
  
  const retakePhoto = () => {
    setCapturedPhoto(null);
    setHasPhoto(false);
  };
  
  return (
    <View style={styles.onboardingContainer}>
      <StatusBar barStyle="light-content" />
      <SafeAreaView style={styles.onboardingContainer}>
        {/* Progress Bar */}
        <View style={styles.onboardingProgressContainer}>
          <View style={styles.onboardingProgressBar}>
            <View 
              style={[
                styles.onboardingProgressFill, 
                { width: `${((currentStep + 1) / totalSteps) * 100}%` }
              ]} 
            />
          </View>
          <Text style={styles.onboardingProgressText}>
            {currentStep + 1} of {totalSteps}
          </Text>
        </View>
        
        <ScrollView 
          style={styles.onboardingScrollView}
          contentContainerStyle={styles.onboardingScrollContent}
        >
          {/* Step 0: Username */}
          {currentStep === 0 && (
            <View style={styles.onboardingStep}>
              <Text style={styles.onboardingStepTitle}>Choose Your Username</Text>
              <Text style={styles.onboardingStepDescription}>
                Pick a unique username for your BeHigh profile
              </Text>
              
              <View style={styles.onboardingInputGroup}>
                <Text style={styles.onboardingInputLabel}>Username *</Text>
                <View style={styles.authInputContainer}>
                  <Ionicons name="person-outline" size={20} color="#666" />
                  <TextInput
                    style={styles.authInput}
                    placeholder="johndoe"
                    placeholderTextColor="#666"
                    value={username}
                    onChangeText={setUsername}
                    autoCapitalize="none"
                  />
                </View>
              </View>
            </View>
          )}
          
          {/* Step 1: Interests */}
          {currentStep === 1 && (
            <View style={styles.onboardingStep}>
              <Text style={styles.onboardingStepTitle}>What brings you to BeHigh?</Text>
              <Text style={styles.onboardingStepDescription}>
                Select all that apply
              </Text>
              
              <View style={styles.onboardingOptions}>
                {[
                  { id: 'moments', icon: 'camera', label: 'Share daily moments' },
                  { id: 'community', icon: 'people', label: 'Connect with community' },
                  { id: 'journal', icon: 'book', label: 'Keep a personal journal' },
                  { id: 'discover', icon: 'flame', label: 'Discover trending content' },
                ].map(item => (
                  <TouchableOpacity
                    key={item.id}
                    style={[
                      styles.onboardingOption,
                      interests.includes(item.id) && styles.onboardingOptionActive
                    ]}
                    onPress={() => toggleInterest(item.id)}
                  >
                    <Ionicons 
                      name={item.icon as any} 
                      size={24} 
                      color={interests.includes(item.id) ? '#00ff88' : '#666'} 
                    />
                    <Text style={[
                      styles.onboardingOptionText,
                      interests.includes(item.id) && styles.onboardingOptionTextActive
                    ]}>
                      {item.label}
                    </Text>
                    {interests.includes(item.id) && (
                      <Ionicons name="checkmark-circle" size={20} color="#00ff88" />
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}
          
          {/* Step 2: Experience */}
          {currentStep === 2 && (
            <View style={styles.onboardingStep}>
              <Text style={styles.onboardingStepTitle}>How would you describe yourself?</Text>
              <Text style={styles.onboardingStepDescription}>
                Choose the option that best fits you
              </Text>
              
              <View style={styles.onboardingOptions}>
                {[
                  { id: 'new', icon: '🆕', label: 'New to the community', desc: 'Just getting started' },
                  { id: 'curious', icon: '🌱', label: 'Curious explorer', desc: 'Learning and discovering' },
                  { id: 'experienced', icon: '🌟', label: 'Experienced enthusiast', desc: 'Regular participant' },
                  { id: 'advocate', icon: '👑', label: 'Long-time advocate', desc: 'Deeply involved' },
                ].map(item => (
                  <TouchableOpacity
                    key={item.id}
                    style={[
                      styles.onboardingOption,
                      experience === item.id && styles.onboardingOptionActive
                    ]}
                    onPress={() => setExperience(item.id)}
                  >
                    <Text style={styles.onboardingOptionEmoji}>{item.icon}</Text>
                    <View style={styles.onboardingOptionTextContainer}>
                      <Text style={[
                        styles.onboardingOptionText,
                        experience === item.id && styles.onboardingOptionTextActive
                      ]}>
                        {item.label}
                      </Text>
                      <Text style={styles.onboardingOptionDesc}>{item.desc}</Text>
                    </View>
                    {experience === item.id && (
                      <Ionicons name="checkmark-circle" size={20} color="#00ff88" />
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}
          
          {/* Step 3: Notifications */}
          {currentStep === 3 && (
            <View style={styles.onboardingStep}>
              <Text style={styles.onboardingStepTitle}>Stay connected with</Text>
              <Text style={styles.onboardingStepDescription}>
                Choose what you'd like to be notified about
              </Text>
              
              <View style={styles.onboardingOptions}>
                {[
                  { id: 'friends', icon: 'people', label: 'Friend activity', desc: 'Recommended' },
                  { id: 'journal', icon: 'book', label: 'Daily journal prompts', desc: 'Recommended' },
                  { id: 'highlights', icon: 'star', label: 'Community highlights', desc: 'Optional' },
                  { id: 'digest', icon: 'mail', label: 'Weekly digest', desc: 'Optional' },
                ].map(item => (
                  <TouchableOpacity
                    key={item.id}
                    style={[
                      styles.onboardingOption,
                      notifications.includes(item.id) && styles.onboardingOptionActive
                    ]}
                    onPress={() => toggleNotification(item.id)}
                  >
                    <Ionicons 
                      name={item.icon as any} 
                      size={24} 
                      color={notifications.includes(item.id) ? '#00ff88' : '#666'} 
                    />
                    <View style={styles.onboardingOptionTextContainer}>
                      <Text style={[
                        styles.onboardingOptionText,
                        notifications.includes(item.id) && styles.onboardingOptionTextActive
                      ]}>
                        {item.label}
                      </Text>
                      <Text style={styles.onboardingOptionDesc}>{item.desc}</Text>
                    </View>
                    {notifications.includes(item.id) && (
                      <Ionicons name="checkmark-circle" size={20} color="#00ff88" />
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}
          
          {/* Step 4: Take Your First Memory */}
          {currentStep === 4 && (
            <View style={styles.onboardingStep}>
              {!capturedPhoto ? (
                <>
                  <Text style={styles.onboardingStepTitle}>Capture your first memory</Text>
                  <Text style={styles.onboardingStepDescription}>
                    Take a photo to get started on BeHigh
                  </Text>
                  
                  {!permission?.granted ? (
                    <View style={styles.onboardingCameraPermissionContainer}>
                      <Ionicons name="camera-outline" size={80} color="#666" />
                      <Text style={styles.onboardingCameraPermissionText}>Camera access required</Text>
                      <TouchableOpacity 
                        style={styles.onboardingCameraButton}
                        onPress={requestPermission}
                      >
                        <Text style={styles.onboardingCameraButtonText}>Enable Camera</Text>
                      </TouchableOpacity>
                    </View>
                  ) : (
                    <View style={styles.onboardingCameraContainer}>
                      <CameraView 
                        ref={cameraRef}
                        style={styles.onboardingCamera}
                        facing={cameraFacing}
                      />
                      <View style={styles.onboardingCameraControls}>
                        <TouchableOpacity 
                          style={styles.cameraFlipButton}
                          onPress={() => setCameraFacing(cameraFacing === 'back' ? 'front' : 'back')}
                        >
                          <Ionicons name="camera-reverse" size={28} color="#fff" />
                        </TouchableOpacity>
                        <TouchableOpacity 
                          style={styles.onboardingCaptureButton}
                          onPress={takePicture}
                        >
                          <View style={styles.onboardingCaptureButtonInner} />
                        </TouchableOpacity>
                        <View style={{ width: 56 }} />
                      </View>
                    </View>
                  )}
                </>
              ) : (
                <>
                  <Text style={styles.onboardingStepTitle}>Great shot! 📸</Text>
                  <Text style={styles.onboardingStepDescription}>
                    This is what your memories will look like
                  </Text>
                  
                  <View style={styles.onboardingPhotoPreview}>
                    <Image source={{ uri: capturedPhoto }} style={styles.onboardingPhotoImage} />
                    <TouchableOpacity 
                      style={styles.onboardingRetakeButton}
                      onPress={retakePhoto}
                    >
                      <Ionicons name="refresh" size={20} color="#fff" />
                      <Text style={styles.onboardingRetakeText}>Retake</Text>
                    </TouchableOpacity>
                  </View>
                </>
              )}
            </View>
          )}
        </ScrollView>
        
        {/* Navigation Buttons */}
        {currentStep < 4 && (
          <View style={styles.onboardingNavigation}>
            {currentStep > 0 && (
              <TouchableOpacity 
                style={styles.onboardingBackButton}
                onPress={handleBack}
              >
                <Ionicons name="chevron-back" size={24} color="#fff" />
                <Text style={styles.onboardingBackText}>Back</Text>
              </TouchableOpacity>
            )}
            
            <TouchableOpacity
              style={[
                styles.onboardingNextButton,
                !canProceed() && styles.onboardingNextButtonDisabled,
                currentStep === 0 && styles.onboardingNextButtonFull
              ]}
              onPress={handleNext}
              disabled={!canProceed()}
            >
              <Text style={styles.onboardingNextText}>
                {currentStep === 3 ? 'Continue' : 'Next'}
              </Text>
            </TouchableOpacity>
          </View>
        )}
        
        {/* Special Continue Button for Camera Step */}
        {currentStep === 4 && hasPhoto && (
          <View style={styles.onboardingNavigation}>
            <TouchableOpacity
              style={[styles.onboardingNextButton, styles.onboardingNextButtonFull]}
              onPress={handleNext}
            >
              <Text style={styles.onboardingNextText}>Continue to Premium</Text>
            </TouchableOpacity>
          </View>
        )}
      </SafeAreaView>
    </View>
  );
}

// Paywall Screen
function PaywallScreen({ onSubscribe }: { onSubscribe: () => void }) {
  return (
    <View style={styles.paywallContainer}>
      <StatusBar barStyle="light-content" />
      <ScrollView contentContainerStyle={styles.paywallContent}>
        <View style={styles.paywallHeader}>
          <Text style={styles.paywallTitle}>Unlock BeHigh Premium</Text>
          <Text style={styles.paywallSubtitle}>Get access to all features</Text>
        </View>
        
        <View style={styles.paywallFeatures}>
          {[
            'Unlimited posts and photos',
            'Priority friend requests',
            'Exclusive shop discounts',
            'Ad-free experience',
            'Premium support',
          ].map((feature, index) => (
            <View key={index} style={styles.paywallFeature}>
              <Ionicons name="checkmark-circle" size={24} color="#00ff88" />
              <Text style={styles.paywallFeatureText}>{feature}</Text>
            </View>
          ))}
        </View>
        
        <View style={styles.paywallPricing}>
          <View style={styles.paywallPriceCard}>
            <Text style={styles.paywallPrice}>$9.99</Text>
            <Text style={styles.paywallPricePeriod}>per month</Text>
          </View>
        </View>
        
        <TouchableOpacity style={styles.paywallSubscribeButton} onPress={onSubscribe}>
          <Text style={styles.paywallSubscribeText}>Start Free Trial</Text>
          <Text style={styles.paywallSubscribeSubtext}>7 days free, then $9.99/month</Text>
        </TouchableOpacity>
        
        <Text style={styles.paywallTerms}>
          Cancel anytime. By subscribing, you agree to our Terms of Service and Privacy Policy.
        </Text>
      </ScrollView>
    </View>
  );
}

// Camera Screen
function CameraScreen({ onClose, onPost }: { onClose: () => void; onPost: (frontPhoto: string, backPhoto: string, isLate?: boolean) => void }) {
  const [permission, requestPermission] = useCameraPermissions();
  const [facing, setFacing] = useState<'back' | 'front'>('back');
  const [frontPhoto, setFrontPhoto] = useState<string | null>(null);
  const [backPhoto, setBackPhoto] = useState<string | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(120); // 2 minutes = 120 seconds
  const [isLate, setIsLate] = useState(false);
  const cameraRef = useRef<CameraView>(null);
  
  useEffect(() => {
    if (!permission) {
      requestPermission();
    }
  }, [permission]);
  
  // 2-minute countdown timer
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 0) {
          setIsLate(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    return () => clearInterval(timer);
  }, []);
  
  const takePicture = async () => {
    if (cameraRef.current && !isCapturing) {
      setIsCapturing(true);
      try {
        const photo = await cameraRef.current.takePictureAsync({
          quality: 0.8,
        });
        
        if (photo) {
          if (facing === 'back') {
            setBackPhoto(photo.uri);
            // Automatically switch to front camera after taking back photo
            setFacing('front');
          } else {
            setFrontPhoto(photo.uri);
          }
        }
      } catch (error) {
        console.error('Error taking picture:', error);
      } finally {
        setIsCapturing(false);
      }
    }
  };
  
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };
  
  const toggleCameraType = () => {
    setFacing(current => current === 'back' ? 'front' : 'back');
  };
  
  const retake = () => {
    setFrontPhoto(null);
    setBackPhoto(null);
    setFacing('back');
  };
  
  const post = () => {
    if (frontPhoto && backPhoto) {
      onPost(frontPhoto, backPhoto, isLate);
      onClose();
    }
  };
  
  if (!permission) {
    return (
      <View style={styles.cameraContainer}>
        <Text style={styles.cameraPermissionText}>Requesting camera permission...</Text>
      </View>
    );
  }
  
  if (!permission.granted) {
    return (
      <View style={styles.cameraContainer}>
        <Text style={styles.cameraPermissionText}>No access to camera</Text>
        <TouchableOpacity style={styles.cameraPermissionButton} onPress={requestPermission}>
          <Text style={styles.cameraPermissionButtonText}>Grant Permission</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.cameraPermissionButton} onPress={onClose}>
          <Text style={styles.cameraPermissionButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }
  
  // Preview screen when both photos are taken
  if (frontPhoto && backPhoto) {
    return (
      <View style={styles.cameraContainer}>
        <View style={styles.cameraPreviewHeader}>
          <TouchableOpacity onPress={retake} style={styles.cameraHeaderButton}>
            <Ionicons name="close" size={32} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.cameraHeaderTitle}>Preview</Text>
          <View style={{ width: 40 }} />
        </View>
        
        <View style={styles.cameraPreviewContainer}>
          <Image source={{ uri: backPhoto }} style={styles.cameraPreviewMain} />
          <View style={styles.cameraPreviewOverlay}>
            <Image source={{ uri: frontPhoto }} style={styles.cameraPreviewSelfie} />
          </View>
        </View>
        
        <View style={styles.cameraPreviewActions}>
          <TouchableOpacity style={styles.cameraRetakeButton} onPress={retake}>
            <Text style={styles.cameraRetakeText}>Retake</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.cameraPostButton} onPress={post}>
            <Text style={styles.cameraPostText}>Post BeHigh</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }
  
  return (
    <View style={styles.cameraContainer}>
      <CameraView 
        style={styles.camera} 
        facing={facing}
        ref={cameraRef}
      >
        <View style={styles.cameraOverlay}>
          <View style={styles.cameraHeader}>
            <TouchableOpacity onPress={onClose} style={styles.cameraHeaderButton}>
              <Ionicons name="close" size={32} color="#fff" />
            </TouchableOpacity>
            
            {/* Timer Display */}
            <View style={[styles.timerDisplay, isLate && styles.timerDisplayLate]}>
              <Ionicons name="time-outline" size={20} color={isLate ? '#ff4444' : '#00ff88'} />
              <Text style={[styles.timerText, isLate && styles.timerTextLate]}>
                {isLate ? 'LATE' : formatTime(timeRemaining)}
              </Text>
            </View>
            
            <TouchableOpacity onPress={toggleCameraType} style={styles.cameraFlipButton}>
              <Ionicons name="camera-reverse" size={32} color="#fff" />
            </TouchableOpacity>
          </View>
          
          <View style={styles.cameraStatus}>
            {backPhoto ? (
              <View style={styles.cameraStatusBadge}>
                <Ionicons name="checkmark-circle" size={20} color="#00ff88" />
                <Text style={styles.cameraStatusText}>Back camera ✓</Text>
              </View>
            ) : (
              <Text style={styles.cameraStatusText}>
                {facing === 'back' ? 'Take back camera photo' : 'Take front camera photo'}
              </Text>
            )}
          </View>
          
          <View style={styles.cameraControls}>
            {backPhoto && (
              <View style={styles.cameraThumbnail}>
                <Image source={{ uri: backPhoto }} style={styles.cameraThumbnailImage} />
              </View>
            )}
            <TouchableOpacity 
              style={styles.cameraCaptureButton}
              onPress={takePicture}
              disabled={isCapturing}
            >
              <View style={styles.cameraCaptureButtonInner} />
            </TouchableOpacity>
            <View style={{ width: 60 }} />
          </View>
        </View>
      </CameraView>
    </View>
  );
}

// Demo data directly in App
// Configure notifications to show alerts
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

const DEMO_USER = {
  id: 'demo-user-1',
  username: 'demouser',
  full_name: 'Demo User',
};

const DEMO_POSTS = [
  {
    id: 'post-1',
    user_id: 'friend-1',
    front_camera_url: 'https://picsum.photos/400/600?random=1',
    back_camera_url: 'https://picsum.photos/1080/1440?random=2',
    posted_late: false,
    user: { username: 'johndoe', full_name: 'John Doe' },
    reactions: {
      '🔥': 12,
      '😂': 8,
      '❤️': 15,
      '👍': 5,
    },
  },
  {
    id: 'post-2',
    user_id: 'friend-2',
    front_camera_url: 'https://picsum.photos/400/600?random=3',
    back_camera_url: 'https://picsum.photos/1080/1440?random=4',
    posted_late: true,
    user: { username: 'janedoe', full_name: 'Jane Doe' },
    reactions: {
      '🔥': 24,
      '💚': 18,
      '😍': 10,
    },
  },
];

const DEMO_FRIENDS = [
  { id: 'friend-1', username: 'johndoe', full_name: 'John Doe' },
  { id: 'friend-2', username: 'janedoe', full_name: 'Jane Doe' },
];

const DEMO_HISTORY = Array.from({ length: 6 }, (_, i) => ({
  id: `history-${i}`,
  back_camera_url: `https://picsum.photos/300/400?random=${i + 10}`,
  posted_late: i % 3 === 0,
}));

const DEMO_JOURNAL_ENTRIES = [
  {
    id: '1',
    text: 'Today was an amazing day! I went hiking with friends and the view from the top was breathtaking. Feeling grateful for these moments.',
    date: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
    duration: '2:34',
  },
  {
    id: '2',
    text: 'Just finished a great workout session. Feeling energized and ready to tackle the rest of the day. Progress is slow but steady.',
    date: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
    duration: '1:45',
  },
  {
    id: '3',
    text: 'Trying out a new recipe tonight. Hope it turns out well. Cooking has become such a therapeutic activity for me lately.',
    date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(), // 3 days ago
    duration: '1:12',
  },
];

const SHOP_PRODUCTS = [
  {
    id: '1',
    name: 'Premium Bong',
    price: 49.99,
    image: require('./assets/bongs.jpg'),
    description: 'High quality glass',
    inStock: true,
  },
  {
    id: '2',
    name: 'Premium Bong',
    price: 79.99,
    image: require('./assets/bongs.jpg'),
    description: 'Premium glass piece',
    inStock: true,
  },
  {
    id: '3',
    name: 'Premium Bong',
    price: 89.99,
    image: require('./assets/bongs.jpg'),
    description: 'Hand-crafted glass',
    inStock: true,
  },
  {
    id: '4',
    name: 'Premium Bong',
    price: 99.99,
    image: require('./assets/bongs.jpg'),
    description: 'Artisan glass bong',
    inStock: true,
  },
];

// Simple Feed Screen
function FeedScreen({ 
  onNavigate, 
  posts, 
  onAddReaction 
}: { 
  onNavigate: (screen: string) => void;
  posts: any[];
  onAddReaction: (postId: string, emoji: string) => void;
}) {
  const [activeSubTab, setActiveSubTab] = useState('friends');
  const [showEmojiPicker, setShowEmojiPicker] = useState<string | null>(null);
  
  const availableEmojis = ['🔥', '😂', '❤️', '💚', '👍', '😍', '🎉', '💯', '🌿', '😭', '😡'];
  
  return (
    <View style={styles.screenContainer}>
      <View style={styles.beHighHeader}>
        <Text style={styles.beHighLogo}>BeHigh.</Text>
        <TouchableOpacity 
          style={styles.notificationButton}
          onPress={() => onNavigate('notifications')}
        >
          <Ionicons name="notifications-outline" size={24} color="#fff" />
        </TouchableOpacity>
      </View>
      
      <View style={styles.subTabContainer}>
        <TouchableOpacity 
          style={styles.subTab} 
          onPress={() => setActiveSubTab('friends')}
        >
          <Text style={[styles.subTabText, activeSubTab === 'friends' && styles.subTabTextActive]}>
            My Friends
          </Text>
          {activeSubTab === 'friends' && <View style={styles.subTabIndicator} />}
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.subTab} 
          onPress={() => setActiveSubTab('discovery')}
        >
          <Text style={[styles.subTabText, activeSubTab === 'discovery' && styles.subTabTextActive]}>
            Discovery
          </Text>
          {activeSubTab === 'discovery' && <View style={styles.subTabIndicator} />}
        </TouchableOpacity>
      </View>
      
      <ScrollView style={styles.scrollView}>
        {posts.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="camera-outline" size={64} color="#666" />
            <Text style={styles.emptyStateTitle}>No posts yet</Text>
            <Text style={styles.emptyStateText}>Take your first BeHigh to see it here!</Text>
            <TouchableOpacity style={styles.emptyStateButton} onPress={() => {}}>
              <Text style={styles.emptyStateButtonText}>Take Photo</Text>
            </TouchableOpacity>
          </View>
        ) : (
          posts.map((post) => (
          <View key={post.id} style={styles.postCard}>
            <View style={styles.postHeader}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{post.user?.username?.[0]?.toUpperCase()}</Text>
              </View>
              <View style={styles.postHeaderInfo}>
                <Text style={styles.username}>{post.user?.username}</Text>
                <Text style={styles.time}>2 hr late · Zürich</Text>
              </View>
              <TouchableOpacity style={styles.moreButton}>
                <Text style={styles.moreButtonText}>⋯</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.imageContainer}>
              <Image source={{ uri: post.back_camera_url }} style={styles.mainImage} />
              <View style={styles.selfieOverlay}>
                <Image source={{ uri: post.front_camera_url }} style={styles.selfieImage} />
              </View>
            </View>
            
            {/* Emoji Reactions */}
            <View style={styles.reactionsContainer}>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.reactionsScroll}>
                {Object.entries(post.reactions || {}).map(([emoji, count]) => (
                  <TouchableOpacity key={emoji} style={styles.reactionBubble}>
                    <Text style={styles.reactionEmoji}>{emoji}</Text>
                    <Text style={styles.reactionCount}>{count as number}</Text>
                  </TouchableOpacity>
                ))}
                <TouchableOpacity 
                  style={styles.addReactionButton}
                  onPress={() => setShowEmojiPicker(showEmojiPicker === post.id ? null : post.id)}
                >
                  <Ionicons name="add-circle-outline" size={20} color="#00ff88" />
                </TouchableOpacity>
              </ScrollView>
              
              {showEmojiPicker === post.id && (
                <View style={styles.emojiPicker}>
                  {availableEmojis.map((emoji) => (
                    <TouchableOpacity 
                      key={emoji} 
                      style={styles.emojiOption}
                      onPress={() => {
                        onAddReaction(post.id, emoji);
                        setShowEmojiPicker(null);
                      }}
                    >
                      <Text style={styles.emojiOptionText}>{emoji}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>
          </View>
          ))
        )}
      </ScrollView>
    </View>
  );
}

// Simple Friends Screen
function FriendsScreen({ 
  onOpenChat, 
  onNavigate, 
  myFriends, 
  friendRequests, 
  sentRequests,
  onSendRequest,
  onAcceptRequest,
  onDeclineRequest 
}: { 
  onOpenChat: (friend: any) => void; 
  onNavigate: (screen: string) => void;
  myFriends: any[];
  friendRequests: any[];
  sentRequests: string[];
  onSendRequest: (userId: string) => void;
  onAcceptRequest: (userId: string) => void;
  onDeclineRequest: (userId: string) => void;
}) {
  const [activeFilter, setActiveFilter] = useState('friends');
  const [searchQuery, setSearchQuery] = useState('');
  
  const popularUsers = [
    { id: '1', username: 'james_wilson', verified: true, followers: 'Gefolgt von 104.395 Personen' },
    { id: '2', username: 'marie.lopez', verified: true, followers: 'Gefolgt von 10.930 Personen' },
    { id: '3', username: 'clara.ile', verified: true, followers: 'Gefolgt von 2883 Personen' },
    { id: '4', username: 'kayla.nemour', verified: true, followers: 'Gefolgt von 9833 Personen' },
    { id: '5', username: 'anna_river', verified: true, followers: 'Gefolgt von 2084 Personen' },
  ];
  
  // Filter users based on search query
  const filteredFriends = myFriends.filter(friend =>
    friend.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
    friend.full_name.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const filteredPopular = popularUsers.filter(user =>
    user.username.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const displayFriends = searchQuery ? filteredFriends : (activeFilter === 'friends' ? myFriends : filteredPopular);
  const displayPopular = searchQuery ? filteredPopular : (activeFilter === 'global' ? popularUsers : []);
  
  return (
    <View style={styles.screenContainer}>
      <View style={styles.beHighHeader}>
        <Text style={styles.beHighLogo}>BeHigh.</Text>
        <TouchableOpacity 
          style={styles.notificationButton}
          onPress={() => onNavigate('addFriends')}
        >
          <Ionicons name="person-add-outline" size={24} color="#fff" />
        </TouchableOpacity>
      </View>
      
      <ScrollView style={styles.scrollView}>
        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color="#666" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search or add friends"
            placeholderTextColor="#666"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
        
        {/* Invite Friends Card */}
        <TouchableOpacity style={styles.inviteCard}>
          <View style={styles.inviteCardLeft}>
            <View style={styles.inviteAvatar}>
              <Text style={styles.inviteAvatarText}>YK</Text>
            </View>
            <View>
              <Text style={styles.inviteTitle}>Invite Friends to BeHigh</Text>
              <Text style={styles.inviteSubtitle}>bera.atyanik.kmal</Text>
            </View>
          </View>
          <Ionicons name="share-outline" size={24} color="#fff" />
        </TouchableOpacity>
        
        {/* Filter Tabs */}
        <View style={styles.filterContainer}>
          <View style={styles.filterTabs}>
            <TouchableOpacity 
              style={[
                styles.filterTab,
                activeFilter === 'global' && styles.filterTabActive
              ]}
              onPress={() => setActiveFilter('global')}
            >
              <Text style={[
                styles.filterTabText,
                activeFilter === 'global' && styles.filterTabTextActive
              ]}>
                GLOBAL
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[
                styles.filterTab,
                activeFilter === 'friends' && styles.filterTabActive
              ]}
              onPress={() => setActiveFilter('friends')}
            >
              <Text style={[
                styles.filterTabText,
                activeFilter === 'friends' && styles.filterTabTextActive
              ]}>
                FRIENDS
              </Text>
            </TouchableOpacity>
          </View>
          
          <TouchableOpacity style={styles.invitePeopleButton}>
            <Ionicons name="arrow-up" size={18} color="#fff" />
            <Text style={styles.invitePeopleText}>Invite People</Text>
          </TouchableOpacity>
        </View>
        
        {/* Show Friends when FRIENDS filter is active */}
        {activeFilter === 'friends' && (
          <View style={styles.popularSection}>
            <Text style={styles.popularSectionTitle}>MY FRIENDS ({displayFriends.length})</Text>
            {displayFriends.map((friend) => (
              <TouchableOpacity 
                key={friend.id} 
                style={styles.myFriendCard}
                onPress={() => onOpenChat(friend)}
              >
                <View style={styles.popularUserLeft}>
                  <View style={[styles.avatar, styles.popularAvatar]}>
                    <Text style={styles.avatarText}>{friend.username[0].toUpperCase()}</Text>
                  </View>
                  <View style={styles.popularUserInfo}>
                    <Text style={styles.popularUsername}>{friend.username}</Text>
                    <Text style={styles.popularFollowers}>{friend.full_name}</Text>
                  </View>
                </View>
                <TouchableOpacity 
                  style={styles.moreIconButton}
                  onPress={(e) => {
                    e.stopPropagation();
                  }}
                >
                  <Ionicons name="ellipsis-horizontal" size={20} color="#fff" />
                </TouchableOpacity>
              </TouchableOpacity>
            ))}
          </View>
        )}
        
        {/* Show Popular Accounts when GLOBAL filter is active */}
        {activeFilter === 'global' && (
          <View style={styles.popularSection}>
            <Text style={styles.popularSectionTitle}>POPULAR ACCOUNTS</Text>
            {displayPopular.map((user) => (
              <TouchableOpacity 
                key={user.id} 
                style={styles.popularUserCard}
                onPress={() => onOpenChat(user)}
              >
                <View style={styles.popularUserLeft}>
                  <View style={[styles.avatar, styles.popularAvatar]}>
                    <Text style={styles.avatarText}>{user.username[0].toUpperCase()}</Text>
                  </View>
                  <View style={styles.popularUserInfo}>
                    <View style={styles.usernameRow}>
                      <Text style={styles.popularUsername}>{user.username}</Text>
                      {user.verified && (
                        <Ionicons name="checkmark-circle" size={16} color="#4A90E2" />
                      )}
                    </View>
                    <Text style={styles.popularFollowers}>{user.followers}</Text>
                  </View>
                </View>
                <View style={styles.popularUserActions}>
                  <TouchableOpacity 
                    style={[
                      styles.followButton,
                      sentRequests.includes(user.id) && styles.followButtonSent
                    ]}
                    onPress={(e) => {
                      e.stopPropagation();
                      onSendRequest(user.id);
                    }}
                  >
                    <Text style={styles.followButtonText}>
                      {sentRequests.includes(user.id) ? 'Requested' : 'Follow'}
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={styles.closeButton}
                    onPress={(e) => {
                      e.stopPropagation();
                    }}
                  >
                    <Ionicons name="close" size={20} color="#fff" />
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            ))}
            
            <TouchableOpacity style={styles.showMoreButton}>
              <Text style={styles.showMoreText}>Show More</Text>
            </TouchableOpacity>
          </View>
        )}
        
        {/* Find More Friends Footer */}
        <View style={styles.findMoreSection}>
          <Ionicons name="people" size={24} color="#fff" />
          <Text style={styles.findMoreTitle}>Find More Friends</Text>
          <Text style={styles.findMoreSubtitle}>Allow contacts access in Settings</Text>
        </View>
      </ScrollView>
    </View>
  );
}

// Simple Profile Screen
function ProfileScreen({ onNavigate, onLogout }: { onNavigate: (screen: string) => void; onLogout: () => void }) {
  const [user, setUser] = useState<any>(DEMO_USER);
  const [currentProductIndex, setCurrentProductIndex] = useState(0);
  const [uploading, setUploading] = useState(false);
  const products = SHOP_PRODUCTS;
  const currentProduct = products[currentProductIndex];
  
  // Load current user
  useEffect(() => {
    loadCurrentUser();
  }, []);
  
  const loadCurrentUser = async () => {
    if (DEMO_MODE) {
      setUser(DEMO_USER);
      return;
    }
    
    try {
      const { user: currentUser, error } = await authAPI.getCurrentUser();
      if (currentUser && !error) {
        setUser(currentUser);
      }
    } catch (error) {
      console.error('Error loading user:', error);
    }
  };
  
  const handleProfilePictureUpload = async () => {
    try {
      // Import image picker dynamically
      const ImagePicker = await import('expo-image-picker');
      
      // Request permissions
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (permissionResult.granted === false) {
        alert('Permission to access camera roll is required!');
        return;
      }
      
      // Pick image
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });
      
      if (result.canceled || !result.assets || result.assets.length === 0) {
        return;
      }
      
      const imageUri = result.assets[0].uri;
      setUploading(true);
      
      if (DEMO_MODE) {
        // Demo mode: just update local state
        setUser({ ...user, profile_picture_url: imageUri });
        setUploading(false);
        return;
      }
      
      // Upload to Supabase
      const filename = `profile_${user.id}_${Date.now()}.jpg`;
      const { url, error: uploadError } = await postsAPI.uploadPhoto(imageUri, 'profiles', filename);
      
      if (uploadError || !url) {
        alert('Failed to upload profile picture. Please try again.');
        setUploading(false);
        return;
      }
      
      // Update user profile
      const { error: updateError } = await authAPI.updateProfile({
        profile_picture_url: url,
      });
      
      if (updateError) {
        alert('Failed to update profile picture. Please try again.');
        setUploading(false);
        return;
      }
      
      // Update local state
      setUser({ ...user, profile_picture_url: url });
      setUploading(false);
      alert('Profile picture updated!');
    } catch (error: any) {
      console.error('Error uploading profile picture:', error);
      alert('Failed to upload profile picture. Please try again.');
      setUploading(false);
    }
  };
  
  const nextProduct = () => {
    setCurrentProductIndex((prev) => (prev + 1) % products.length);
  };
  
  const prevProduct = () => {
    setCurrentProductIndex((prev) => (prev - 1 + products.length) % products.length);
  };
  
  const menuItems = [
    { id: 1, icon: 'settings-outline', label: 'Settings', color: '#999', screen: 'settings' },
    { id: 2, icon: 'help-circle-outline', label: 'Help & Support', color: '#999', screen: 'contact' },
    { id: 3, icon: 'shield-checkmark-outline', label: 'Privacy Policy', color: '#999', screen: 'privacy' },
    { id: 4, icon: 'document-text-outline', label: 'Terms and Conditions', color: '#999', screen: 'terms' },
    { id: 5, icon: 'person-outline', label: 'Account', color: '#999', screen: null },
    { id: 6, icon: 'logo-instagram', label: 'Instagram', color: '#999', url: 'https://www.instagram.com/zenpuff_co/?hl=en' },
    { id: 7, icon: 'logo-facebook', label: 'Facebook', color: '#999', url: 'https://www.facebook.com/people/ZenPuff-Co/61575735332565/' },
    { id: 8, icon: 'log-out-outline', label: 'Log Out', color: '#ff4444', action: 'logout' },
  ];
  
  return (
    <View style={styles.screenContainer}>
      <View style={styles.beHighHeader}>
        <Text style={styles.beHighLogo}>BeHigh.</Text>
        <TouchableOpacity style={styles.notificationButton}>
          <Ionicons name="settings-outline" size={24} color="#fff" />
        </TouchableOpacity>
      </View>
      
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Profile Info */}
        <View style={styles.profileInfoSection}>
          <TouchableOpacity 
            onPress={handleProfilePictureUpload}
            disabled={uploading}
            style={styles.profileAvatarContainer}
          >
            {user?.profile_picture_url ? (
              <Image 
                source={{ uri: user.profile_picture_url }} 
                style={styles.profileAvatarImage}
              />
            ) : (
              <View style={styles.profileAvatar}>
                <Text style={styles.profileAvatarText}>
                  {user?.username?.[0]?.toUpperCase() || 'U'}
                </Text>
              </View>
            )}
            {uploading && (
              <View style={styles.profileAvatarOverlay}>
                <ActivityIndicator color="#fff" />
              </View>
            )}
            {!uploading && (
              <View style={styles.profileAvatarEditBadge}>
                <Ionicons name="camera" size={16} color="#fff" />
              </View>
            )}
          </TouchableOpacity>
          <Text style={styles.profileUsername}>{user?.username || 'Username'}</Text>
          <Text style={styles.profileHandle}>@{user?.username || 'username'}</Text>
          {user?.full_name && (
            <Text style={styles.profileFullName}>{user.full_name}</Text>
          )}
        </View>
        
        {/* Product Display Area */}
        <View style={styles.productSection}>
          <View style={styles.productDisplayArea}>
            <TouchableOpacity style={styles.productArrow} onPress={prevProduct}>
              <Ionicons name="chevron-back" size={36} color="#fff" />
            </TouchableOpacity>
            
            <View style={styles.productDisplayCenter}>
              <View style={styles.productCard}>
                <Image source={currentProduct.image} style={styles.productImage} />
              </View>
            </View>
            
            <TouchableOpacity style={styles.productArrow} onPress={nextProduct}>
              <Ionicons name="chevron-forward" size={36} color="#fff" />
            </TouchableOpacity>
          </View>
          
          {/* Shop Link */}
          <TouchableOpacity 
            style={styles.shopLinkButton}
            onPress={() => {
              Linking.openURL('https://zenpuff.co');
            }}
          >
            <Ionicons name="cart-outline" size={20} color="#00ff88" />
            <View style={styles.shopLinkTextContainer}>
              <Text style={styles.shopLinkTitle}>Visit Our Shop</Text>
              <Text style={styles.shopLinkSubtitle}>Buy our water bottles</Text>
            </View>
            <Ionicons name="open-outline" size={18} color="#666" />
          </TouchableOpacity>
        </View>
        
        {/* Menu Items */}
        <View style={styles.profileMenuSection}>
          {menuItems.map((item: any) => (
            <TouchableOpacity 
              key={item.id} 
              style={[
                styles.profileMenuItem,
                item.action === 'logout' && styles.profileMenuItemLogout
              ]}
              onPress={() => {
                if (item.action === 'logout') {
                  onLogout();
                } else if (item.screen) {
                  onNavigate(item.screen);
                } else if (item.url) {
                  Linking.openURL(item.url);
                }
              }}
            >
              <View style={styles.profileMenuItemLeft}>
                <View style={[
                  styles.profileMenuIcon,
                  item.action === 'logout' && styles.profileMenuIconLogout
                ]}>
                  <Ionicons 
                    name={item.icon as any} 
                    size={22} 
                    color={item.color} 
                  />
                </View>
                <Text style={[
                  styles.profileMenuLabel,
                  item.action === 'logout' && styles.profileMenuLabelLogout
                ]}>{item.label}</Text>
              </View>
              {item.action !== 'logout' && (
                <Ionicons name="chevron-forward" size={20} color="#666" />
              )}
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

// Journal Entry Detail Screen
function JournalEntryDetailScreen({ entry, onBack }: { entry: any; onBack: () => void }) {
  const formatFullDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  return (
    <View style={styles.screenContainer}>
      <View style={styles.beHighHeader}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Ionicons name="chevron-back" size={28} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.beHighLogo}>Journal Entry</Text>
        <TouchableOpacity style={styles.notificationButton}>
          <Ionicons name="ellipsis-horizontal" size={24} color="#fff" />
        </TouchableOpacity>
      </View>
      
      <ScrollView style={styles.scrollView}>
        <View style={styles.journalDetailContainer}>
          <View style={styles.journalDetailHeader}>
            <Text style={styles.journalDetailDate}>{formatFullDate(entry.date)}</Text>
            <View style={styles.journalDetailMeta}>
              <View style={styles.journalEntryDuration}>
                <Ionicons name="mic" size={16} color="#00ff88" />
                <Text style={styles.journalDetailDuration}>{entry.duration}</Text>
              </View>
            </View>
          </View>
          
          <View style={styles.journalDetailContent}>
            <Text style={styles.journalDetailText}>{entry.text}</Text>
          </View>
          
          <View style={styles.journalDetailActions}>
            <TouchableOpacity style={styles.journalActionButton}>
              <Ionicons name="share-outline" size={20} color="#fff" />
              <Text style={styles.journalActionText}>Share</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.journalActionButton}>
              <Ionicons name="create-outline" size={20} color="#fff" />
              <Text style={styles.journalActionText}>Edit</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.journalActionButton}>
              <Ionicons name="trash-outline" size={20} color="#FF3B30" />
              <Text style={[styles.journalActionText, { color: '#FF3B30' }]}>Delete</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

// Journal Screen
function JournalScreen({ 
  onViewEntry, 
  journalEntries, 
  onAddEntry 
}: { 
  onViewEntry: (entry: any) => void;
  journalEntries: any[];
  onAddEntry: (text: string, duration: string) => void;
}) {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [recognizedText, setRecognizedText] = useState('');
  const [partialResults, setPartialResults] = useState('');
  const startTimeRef = useRef<number>(0);
  
  useEffect(() => {
    // Set up Voice event listeners
    const voice = getVoice();
    voice.onSpeechStart = onSpeechStart;
    voice.onSpeechEnd = onSpeechEnd;
    voice.onSpeechResults = onSpeechResults;
    voice.onSpeechPartialResults = onSpeechPartialResults;
    voice.onSpeechError = onSpeechError;
    
    return () => {
      voice.destroy().then(voice.removeAllListeners);
    };
  }, []);
  
  useEffect(() => {
    // Timer for recording
    let interval: any;
    if (isRecording) {
      interval = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRecording]);
  
  const onSpeechStart = () => {
    console.log('Speech started');
  };
  
  const onSpeechEnd = () => {
    console.log('Speech ended');
  };
  
  const onSpeechResults = (event: any) => {
    const text = event.value[0];
    setRecognizedText(text);
    console.log('Speech results:', text);
  };
  
  const onSpeechPartialResults = (event: any) => {
    const text = event.value[0];
    setPartialResults(text);
  };
  
  const onSpeechError = (event: any) => {
    console.error('Speech error:', event.error);
  };
  
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffHours < 24) {
      return `${diffHours}h ago`;
    } else if (diffDays === 1) {
      return 'Yesterday';
    } else {
      return `${diffDays} days ago`;
    }
  };
  
  const startRecording = async () => {
    try {
      setRecognizedText('');
      setPartialResults('');
      setRecordingTime(0);
      startTimeRef.current = Date.now();
      
      await getVoice().start('en-US'); // Use 'en-US' or user's locale
      setIsRecording(true);
    } catch (err) {
      console.error('Failed to start recording', err);
      alert('Failed to start voice recognition. Please check microphone permissions.');
    }
  };

  const stopRecording = async () => {
    try {
      await getVoice().stop();
      setIsRecording(false);
      
      const duration = formatTime(recordingTime);
      const finalText = recognizedText || partialResults;
      
      if (finalText && finalText.trim()) {
        // Save the transcribed text
        onAddEntry(finalText, duration);
        setRecognizedText('');
        setPartialResults('');
      } else {
        alert('No speech detected. Please try again.');
      }
      
      setRecordingTime(0);
    } catch (err) {
      console.error('Failed to stop recording', err);
    }
  };
  
  return (
    <View style={styles.screenContainer}>
      <View style={styles.beHighHeader}>
        <Text style={styles.beHighLogo}>Journal</Text>
        <TouchableOpacity style={styles.notificationButton}>
          <Ionicons name="ellipsis-horizontal" size={24} color="#fff" />
        </TouchableOpacity>
      </View>
      
      <ScrollView style={styles.scrollView}>
        {/* Recording Section */}
        <View style={styles.recordingSection}>
          <Text style={styles.recordingSectionTitle}>Record Your Thoughts</Text>
          <Text style={styles.recordingSectionSubtitle}>
            Tap the microphone and start speaking
          </Text>
          
          <TouchableOpacity
            style={[styles.recordButton, isRecording && styles.recordButtonActive]}
            onPress={isRecording ? stopRecording : startRecording}
          >
            <View style={styles.recordButtonInner}>
              {isRecording ? (
                <View style={styles.recordingPulse}>
                  <Ionicons name="stop" size={40} color="#fff" />
                </View>
              ) : (
                <Ionicons name="mic" size={40} color="#fff" />
              )}
            </View>
          </TouchableOpacity>
          
          {isRecording && (
            <>
              <View style={styles.recordingIndicator}>
                <View style={styles.recordingDot} />
                <Text style={styles.recordingText}>Recording... {formatTime(recordingTime)}</Text>
              </View>
              
              {/* Live Transcription Preview */}
              <View style={styles.transcriptionPreview}>
                <Text style={styles.transcriptionLabel}>Live Transcription:</Text>
                <Text style={styles.transcriptionText}>
                  {partialResults || recognizedText || 'Start speaking...'}
                </Text>
              </View>
            </>
          )}
          
          {!isRecording && (
            <Text style={styles.recordingHint}>
              Your voice will be converted to text automatically (FREE)
            </Text>
          )}
        </View>
        
        {/* Journal Entries */}
        <View style={styles.journalEntriesSection}>
          <Text style={styles.journalEntriesTitle}>Previous Entries</Text>
          {journalEntries.map((entry) => (
            <View key={entry.id} style={styles.journalEntryCard}>
              <View style={styles.journalEntryHeader}>
                <Text style={styles.journalEntryDate}>{formatDate(entry.date)}</Text>
                <View style={styles.journalEntryDuration}>
                  <Ionicons name="mic" size={14} color="#00ff88" />
                  <Text style={styles.journalEntryDurationText}>{entry.duration}</Text>
                </View>
              </View>
              <Text style={styles.journalEntryText} numberOfLines={3}>
                {entry.text}
              </Text>
              <TouchableOpacity 
                style={styles.readMoreButton}
                onPress={() => onViewEntry(entry)}
              >
                <Text style={styles.readMoreText}>Read more</Text>
                <Ionicons name="chevron-forward" size={16} color="#00ff88" />
              </TouchableOpacity>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

// Chat Screen
function ChatScreen({ 
  friend, 
  onBack, 
  messages, 
  onSendMessage 
}: { 
  friend: any; 
  onBack: () => void;
  messages: any[];
  onSendMessage: (message: string) => void;
}) {
  const [message, setMessage] = useState('');
  
  return (
    <View style={styles.chatContainer}>
      {/* Chat Header */}
      <View style={styles.chatHeader}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Ionicons name="chevron-back" size={28} color="#fff" />
        </TouchableOpacity>
        <View style={styles.chatHeaderCenter}>
          <View style={[styles.avatar, styles.chatAvatar]}>
            <Text style={styles.avatarText}>{friend.username[0].toUpperCase()}</Text>
          </View>
          <Text style={styles.chatHeaderName}>{friend.username}</Text>
        </View>
        <View style={styles.chatHeaderRight}>
          <TouchableOpacity style={styles.chatHeaderIcon}>
            <Ionicons name="call-outline" size={24} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.chatHeaderIcon}>
            <Ionicons name="videocam-outline" size={24} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>
      
      {/* Messages */}
      <ScrollView style={styles.messagesContainer}>
        {messages.map((msg) => (
          <View
            key={msg.id}
            style={[
              styles.messageBubble,
              msg.sent ? styles.messageSent : styles.messageReceived,
            ]}
          >
            <Text style={styles.messageText}>{msg.text}</Text>
          </View>
        ))}
      </ScrollView>
      
      {/* Input Bar */}
      <View style={styles.chatInputContainer}>
        <TouchableOpacity style={styles.chatInputButton}>
          <Ionicons name="camera" size={24} color="#00ff88" />
        </TouchableOpacity>
        <TextInput
          style={styles.chatTextInput}
          placeholder="Message"
          placeholderTextColor="#666"
          value={message}
          onChangeText={setMessage}
        />
        {message.trim() ? (
          <TouchableOpacity 
            style={styles.chatInputButton}
            onPress={() => {
              if (message.trim()) {
                onSendMessage(message.trim());
                setMessage('');
              }
            }}
          >
            <Ionicons name="send" size={24} color="#00ff88" />
          </TouchableOpacity>
        ) : (
          <>
            <TouchableOpacity style={styles.chatInputButton}>
              <Ionicons name="mic-outline" size={24} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.chatInputButton}>
              <Ionicons name="image-outline" size={24} color="#fff" />
            </TouchableOpacity>
          </>
        )}
      </View>
    </View>
  );
}

// Terms of Service Screen
function TermsScreen({ onBack }: { onBack: () => void }) {
  return (
    <View style={styles.screenContainer}>
      <View style={styles.beHighHeader}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Ionicons name="chevron-back" size={28} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.beHighLogo}>Terms of Service</Text>
        <View style={{ width: 40 }} />
      </View>
      <ScrollView style={styles.scrollView}>
        <View style={styles.webLinkContainer}>
          <Text style={styles.webLinkText}>View our complete Terms of Service</Text>
          <TouchableOpacity 
            style={styles.webLinkButton}
            onPress={() => Linking.openURL('https://zenpuff.co/policies/terms-of-service')}
          >
            <Text style={styles.webLinkButtonText}>Open in Browser</Text>
            <Ionicons name="open-outline" size={18} color="#000" />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

// Privacy Policy Screen
function PrivacyScreen({ onBack }: { onBack: () => void }) {
  return (
    <View style={styles.screenContainer}>
      <View style={styles.beHighHeader}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Ionicons name="chevron-back" size={28} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.beHighLogo}>Privacy Policy</Text>
        <View style={{ width: 40 }} />
      </View>
      <ScrollView style={styles.scrollView}>
        <View style={styles.webLinkContainer}>
          <Text style={styles.webLinkText}>View our complete Privacy Policy</Text>
          <TouchableOpacity 
            style={styles.webLinkButton}
            onPress={() => Linking.openURL('https://zenpuff.co/policies/privacy-policy')}
          >
            <Text style={styles.webLinkButtonText}>Open in Browser</Text>
            <Ionicons name="open-outline" size={18} color="#000" />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

// Contact Screen
function ContactScreen({ onBack }: { onBack: () => void }) {
  return (
    <View style={styles.screenContainer}>
      <View style={styles.beHighHeader}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Ionicons name="chevron-back" size={28} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.beHighLogo}>Contact Us</Text>
        <View style={{ width: 40 }} />
      </View>
      <ScrollView style={styles.scrollView}>
        <View style={styles.contactContainer}>
          <Text style={styles.contactTitle}>Get in Touch</Text>
          <TouchableOpacity 
            style={styles.contactCard}
            onPress={() => Linking.openURL('mailto:Support@zenpuff.co')}
          >
            <Ionicons name="mail-outline" size={24} color="#00ff88" />
            <View style={styles.contactCardText}>
              <Text style={styles.contactCardTitle}>Email</Text>
              <Text style={styles.contactCardSubtitle}>Support@zenpuff.co</Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.contactCard}
            onPress={() => Linking.openURL('tel:+13853145121')}
          >
            <Ionicons name="call-outline" size={24} color="#00ff88" />
            <View style={styles.contactCardText}>
              <Text style={styles.contactCardTitle}>Phone</Text>
              <Text style={styles.contactCardSubtitle}>(385) 314-5121</Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.contactCard}
            onPress={() => Linking.openURL('https://zenpuff.co/pages/contact')}
          >
            <Ionicons name="globe-outline" size={24} color="#00ff88" />
            <View style={styles.contactCardText}>
              <Text style={styles.contactCardTitle}>Website</Text>
              <Text style={styles.contactCardSubtitle}>Visit Contact Page</Text>
            </View>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

// Add Friends Screen
function AddFriendsScreen({ onBack }: { onBack: () => void }) {
  const [searchQuery, setSearchQuery] = useState('');
  
  return (
    <View style={styles.screenContainer}>
      <View style={styles.beHighHeader}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Ionicons name="chevron-back" size={28} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.beHighLogo}>Add Friends</Text>
        <View style={{ width: 40 }} />
      </View>
      <ScrollView style={styles.scrollView}>
        <View style={styles.addFriendsContainer}>
          <View style={styles.searchInputContainer}>
            <Ionicons name="search" size={20} color="#666" />
            <Text style={styles.searchInputPlaceholder}>Search by username...</Text>
          </View>
          <Text style={styles.addFriendsHint}>Enter a username to find and add friends</Text>
        </View>
      </ScrollView>
    </View>
  );
}

// Settings Screen
function SettingsScreen({ onBack }: { onBack: () => void }) {
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [pushEnabled, setPushEnabled] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [vibrationEnabled, setVibrationEnabled] = useState(true);
  const [darkModeEnabled, setDarkModeEnabled] = useState(true);
  
  return (
    <View style={styles.screenContainer}>
      <View style={styles.beHighHeader}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Ionicons name="chevron-back" size={28} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.beHighLogo}>Settings</Text>
        <View style={{ width: 40 }} />
      </View>
      
      <ScrollView style={styles.scrollView}>
        {/* Notifications Section */}
        <View style={styles.settingsSection}>
          <Text style={styles.settingsSectionTitle}>NOTIFICATIONS</Text>
          
          <View style={styles.settingItem}>
            <View style={styles.settingItemLeft}>
              <Ionicons name="notifications-outline" size={22} color="#00ff88" />
              <View style={styles.settingItemText}>
                <Text style={styles.settingItemTitle}>Push Notifications</Text>
                <Text style={styles.settingItemDescription}>Receive notifications about new posts</Text>
              </View>
            </View>
            <TouchableOpacity 
              style={[styles.toggle, pushEnabled && styles.toggleActive]}
              onPress={() => setPushEnabled(!pushEnabled)}
            >
              <View style={[styles.toggleThumb, pushEnabled && styles.toggleThumbActive]} />
            </TouchableOpacity>
          </View>
          
          <View style={styles.settingItem}>
            <View style={styles.settingItemLeft}>
              <Ionicons name="volume-medium-outline" size={22} color="#00ff88" />
              <View style={styles.settingItemText}>
                <Text style={styles.settingItemTitle}>Sound</Text>
                <Text style={styles.settingItemDescription}>Play sound for notifications</Text>
              </View>
            </View>
            <TouchableOpacity 
              style={[styles.toggle, soundEnabled && styles.toggleActive]}
              onPress={() => setSoundEnabled(!soundEnabled)}
            >
              <View style={[styles.toggleThumb, soundEnabled && styles.toggleThumbActive]} />
            </TouchableOpacity>
          </View>
          
          <View style={styles.settingItem}>
            <View style={styles.settingItemLeft}>
              <Ionicons name="phone-portrait-outline" size={22} color="#00ff88" />
              <View style={styles.settingItemText}>
                <Text style={styles.settingItemTitle}>Vibration</Text>
                <Text style={styles.settingItemDescription}>Vibrate on notifications</Text>
              </View>
            </View>
            <TouchableOpacity 
              style={[styles.toggle, vibrationEnabled && styles.toggleActive]}
              onPress={() => setVibrationEnabled(!vibrationEnabled)}
            >
              <View style={[styles.toggleThumb, vibrationEnabled && styles.toggleThumbActive]} />
            </TouchableOpacity>
          </View>
        </View>
        
        {/* Appearance Section */}
        <View style={styles.settingsSection}>
          <Text style={styles.settingsSectionTitle}>APPEARANCE</Text>
          
          <View style={styles.settingItem}>
            <View style={styles.settingItemLeft}>
              <Ionicons name="moon-outline" size={22} color="#00ff88" />
              <View style={styles.settingItemText}>
                <Text style={styles.settingItemTitle}>Dark Mode</Text>
                <Text style={styles.settingItemDescription}>Always on for BeHigh experience</Text>
              </View>
            </View>
            <TouchableOpacity 
              style={[styles.toggle, darkModeEnabled && styles.toggleActive]}
              onPress={() => setDarkModeEnabled(!darkModeEnabled)}
            >
              <View style={[styles.toggleThumb, darkModeEnabled && styles.toggleThumbActive]} />
            </TouchableOpacity>
          </View>
        </View>
        
        {/* Privacy Section */}
        <View style={styles.settingsSection}>
          <Text style={styles.settingsSectionTitle}>PRIVACY</Text>
          
          <TouchableOpacity style={styles.settingItem}>
            <View style={styles.settingItemLeft}>
              <Ionicons name="lock-closed-outline" size={22} color="#00ff88" />
              <View style={styles.settingItemText}>
                <Text style={styles.settingItemTitle}>Privacy Settings</Text>
                <Text style={styles.settingItemDescription}>Manage who can see your posts</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#666" />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.settingItem}>
            <View style={styles.settingItemLeft}>
              <Ionicons name="eye-off-outline" size={22} color="#00ff88" />
              <View style={styles.settingItemText}>
                <Text style={styles.settingItemTitle}>Blocked Users</Text>
                <Text style={styles.settingItemDescription}>Manage blocked accounts</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#666" />
          </TouchableOpacity>
        </View>
        
        {/* About Section */}
        <View style={styles.settingsSection}>
          <Text style={styles.settingsSectionTitle}>ABOUT</Text>
          
          <View style={styles.settingItem}>
            <View style={styles.settingItemLeft}>
              <Ionicons name="information-circle-outline" size={22} color="#00ff88" />
              <View style={styles.settingItemText}>
                <Text style={styles.settingItemTitle}>Version</Text>
                <Text style={styles.settingItemDescription}>1.0.0</Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

// Notifications Screen
function NotificationsScreen({ 
  onBack, 
  friendRequests, 
  onAcceptRequest, 
  onDeclineRequest 
}: { 
  onBack: () => void;
  friendRequests: any[];
  onAcceptRequest: (userId: string) => void;
  onDeclineRequest: (userId: string) => void;
}) {
  const notifications = [
    { id: 1, type: 'like', user: 'johndoe', text: 'reacted to your post with 🔥', time: '2h ago' },
    { id: 2, type: 'friend', user: 'janedoe', text: 'started following you', time: '5h ago' },
    { id: 3, type: 'comment', user: 'mike_jones', text: 'reacted to your post with ❤️', time: '1d ago' },
  ];
  
  return (
    <View style={styles.screenContainer}>
      <View style={styles.beHighHeader}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Ionicons name="chevron-back" size={28} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.beHighLogo}>Notifications</Text>
        <View style={{ width: 40 }} />
      </View>
      <ScrollView style={styles.scrollView}>
        <View style={styles.notificationsContainer}>
          {/* Friend Requests */}
          {friendRequests.length > 0 && (
            <View style={styles.notificationSection}>
              <Text style={styles.notificationSectionTitle}>Friend Requests</Text>
              {friendRequests.map((request) => (
                <View key={request.id} style={styles.notificationCard}>
                  <View style={styles.notificationAvatar}>
                    <Text style={styles.notificationAvatarText}>{request.username[0].toUpperCase()}</Text>
                  </View>
                  <View style={styles.notificationContent}>
                    <Text style={styles.notificationText}>
                      <Text style={styles.notificationUsername}>{request.username}</Text> sent you a friend request
                    </Text>
                    <View style={styles.notificationActions}>
                      <TouchableOpacity 
                        style={styles.notificationAcceptButton}
                        onPress={() => onAcceptRequest(request.id)}
                      >
                        <Text style={styles.notificationAcceptText}>Accept</Text>
                      </TouchableOpacity>
                      <TouchableOpacity 
                        style={styles.notificationDeclineButton}
                        onPress={() => onDeclineRequest(request.id)}
                      >
                        <Text style={styles.notificationDeclineText}>Decline</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              ))}
            </View>
          )}
          
          {/* Other Notifications */}
          {notifications.length > 0 && (
            <View style={styles.notificationSection}>
              <Text style={styles.notificationSectionTitle}>Recent Activity</Text>
              {notifications.map((notif) => (
                <View key={notif.id} style={styles.notificationCard}>
                  <View style={styles.notificationAvatar}>
                    <Text style={styles.notificationAvatarText}>{notif.user[0].toUpperCase()}</Text>
                  </View>
                  <View style={styles.notificationContent}>
                    <Text style={styles.notificationText}>
                      <Text style={styles.notificationUsername}>{notif.user}</Text> {notif.text}
                    </Text>
                    <Text style={styles.notificationTime}>{notif.time}</Text>
                  </View>
                </View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

export default function App() {
  const [activeTab, setActiveTab] = useState('Feed');
  const [selectedFriend, setSelectedFriend] = useState<any>(null);
  const [selectedJournalEntry, setSelectedJournalEntry] = useState<any>(null);
  const [showCamera, setShowCamera] = useState(false);
  const [currentScreen, setCurrentScreen] = useState<string | null>(null);
  
  // Auth & Onboarding states
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false);
  const [hasSubscription, setHasSubscription] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showSplash, setShowSplash] = useState(true);
  
  // App Data states
  const [posts, setPosts] = useState(DEMO_POSTS);
  const [myFriends, setMyFriends] = useState(DEMO_FRIENDS);
  const [friendRequests, setFriendRequests] = useState<any[]>([]);
  const [sentRequests, setSentRequests] = useState<string[]>([]);
  const [chatMessages, setChatMessages] = useState<{ [key: string]: any[] }>({});
  const [journalEntries, setJournalEntries] = useState(DEMO_JOURNAL_ENTRIES);
  const [isPosting, setIsPosting] = useState(false);
  const [dailyNotificationTime, setDailyNotificationTime] = useState<Date | null>(null);
  
  useEffect(() => {
    // Show splash screen for minimum 2 seconds
    const splashTimer = setTimeout(() => {
      setShowSplash(false);
    }, 2000);
    
    // Check auth and onboarding status
    checkAuthStatus();
    
    // Set up auth state listener for Supabase (to detect when session becomes available)
    if (!DEMO_MODE) {
      const setupAuthListener = async () => {
        try {
          const { supabase } = await import('./src/services/supabase');
          if (supabase) {
            const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
              console.log('🔄 Auth state changed:', event, session ? 'session available' : 'no session');
              
              if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
                if (session) {
                  console.log('✅ Session established, updating auth state');
                  setIsAuthenticated(true);
                  
                  // Clear pending signup flag now that session is available
                  await AsyncStorage.removeItem('pendingSignupUserId');
                  
                  // Try to save any pending onboarding data
                  await retryPendingOnboardingData();
                  
                  // Re-check onboarding/subscription status
                  checkAuthStatus();
                }
              } else if (event === 'SIGNED_OUT') {
                console.log('👋 User signed out');
                setIsAuthenticated(false);
                setHasCompletedOnboarding(false);
                setHasSubscription(false);
              }
            });
            
            return () => {
              subscription.unsubscribe();
            };
          }
        } catch (error) {
          console.error('Error setting up auth listener:', error);
        }
      };
      
      setupAuthListener();
    }
    
    return () => clearTimeout(splashTimer);
  }, []);
  
  // Set up daily notifications
  useEffect(() => {
    if (isAuthenticated && hasCompletedOnboarding && hasSubscription) {
      setupDailyNotification();
    }
  }, [isAuthenticated, hasCompletedOnboarding, hasSubscription]);
  
  const checkAuthStatus = async () => {
    try {
      if (DEMO_MODE) {
        // Demo mode: use AsyncStorage
        const authStatus = await AsyncStorage.getItem('isAuthenticated');
        const onboardingStatus = await AsyncStorage.getItem('hasCompletedOnboarding');
        const subscriptionStatus = await AsyncStorage.getItem('hasSubscription');
        
        setIsAuthenticated(authStatus === 'true');
        setHasCompletedOnboarding(onboardingStatus === 'true');
        setHasSubscription(subscriptionStatus === 'true');
        
        // Load saved journal entries
        const savedEntries = await AsyncStorage.getItem('journalEntries');
        if (savedEntries) {
          setJournalEntries(JSON.parse(savedEntries));
        }
      } else {
        // Real mode: check Supabase session (Supabase automatically persists session)
        // FIRST check for pending signup (user just signed up but email not confirmed)
        console.log('🔍 Checking for pending signup...');
        const pendingUserId = await AsyncStorage.getItem('pendingSignupUserId');
        console.log('🔍 Pending signup user ID:', pendingUserId || 'none');
        
        if (pendingUserId) {
          console.log('⏳ Pending signup detected for user:', pendingUserId);
          console.log('   ✅ Allowing user to continue onboarding');
          setIsAuthenticated(true);
          
          // Check onboarding and subscription status for this pending user
          const onboardingKey = `hasCompletedOnboarding_${pendingUserId}`;
          const subscriptionKey = `hasSubscription_${pendingUserId}`;
          
          const onboardingStatus = await AsyncStorage.getItem(onboardingKey);
          const subscriptionStatus = await AsyncStorage.getItem(subscriptionKey);
          
          console.log('📋 Onboarding status for pending user:', onboardingStatus === 'true');
          console.log('💳 Subscription status for pending user:', subscriptionStatus === 'true');
          
          setHasCompletedOnboarding(onboardingStatus === 'true');
          setHasSubscription(subscriptionStatus === 'true');
          
          // Try to get session in case it's now available
          const { session } = await authAPI.getSession();
          if (session) {
            console.log('✅ Session now available, clearing pending flag');
            await AsyncStorage.removeItem('pendingSignupUserId');
            // Load user data now that session is available
            await loadUserData();
            // Try to save any pending onboarding data
            await retryPendingOnboardingData();
          } else {
            console.log('⏳ Still no session, but user can continue with pending signup');
          }
        } else {
          console.log('🔍 No pending signup, checking for active session...');
          // No pending signup, check for active session
          const { session, error } = await authAPI.getSession();
          
          if (session && !error) {
            console.log('✅ User session found, user is logged in');
            setIsAuthenticated(true);
            
            // Get user profile
            const { user } = await authAPI.getCurrentUser();
            if (user) {
              console.log('✅ User profile loaded:', user.username);
              // Load user data
              await loadUserData();
              
              // Check onboarding and subscription status (per user)
              // Use user ID as key to ensure it's per-user
              const userId = user.id;
              const onboardingKey = `hasCompletedOnboarding_${userId}`;
              const subscriptionKey = `hasSubscription_${userId}`;
              
              const onboardingStatus = await AsyncStorage.getItem(onboardingKey);
              const subscriptionStatus = await AsyncStorage.getItem(subscriptionKey);
              
              console.log('📋 Onboarding status:', onboardingStatus === 'true');
              console.log('💳 Subscription status:', subscriptionStatus === 'true');
              
              setHasCompletedOnboarding(onboardingStatus === 'true');
              setHasSubscription(subscriptionStatus === 'true');
            } else {
              console.warn('⚠️ User session exists but profile not found');
            }
          } else {
            console.log('❌ No active session, user needs to log in');
            setIsAuthenticated(false);
            // Clear onboarding/subscription when logged out
            setHasCompletedOnboarding(false);
            setHasSubscription(false);
          }
        }
      }
    } catch (error) {
      console.error('Error checking auth status:', error);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  };
  
  const loadUserData = async () => {
    try {
      // Load posts
      const { posts: feedPosts, error: postsError } = await postsAPI.getFeedPosts();
      if (!postsError && feedPosts) {
        // Transform posts to match app format
        const transformedPosts = feedPosts.map((post: any) => ({
          ...post,
          user: post.user || { username: 'unknown', full_name: 'Unknown User' },
          reactions: post.reactions?.reduce((acc: any, r: any) => {
            acc[r.emoji] = (acc[r.emoji] || 0) + 1;
            return acc;
          }, {}) || {},
        }));
        setPosts(transformedPosts);
      }
      
      // Load friends
      const { friends, error: friendsError } = await friendsAPI.getFriends();
      if (!friendsError && friends) {
        setMyFriends(friends);
      }
      
      // Load friend requests
      const { requests, error: requestsError } = await friendsAPI.getFriendRequests();
      if (!requestsError && requests) {
        setFriendRequests(requests);
      }
      
      // Load journal entries
      const { entries, error: journalError } = await journalAPI.getEntries();
      if (!journalError && entries) {
        // Transform entries to match app format (date -> created_at)
        const transformedEntries = entries.map((entry: any) => ({
          id: entry.id,
          text: entry.text,
          date: entry.created_at || entry.date,
          duration: entry.duration,
        }));
        setJournalEntries(transformedEntries);
        // Also save locally for offline access
        await AsyncStorage.setItem('journalEntries', JSON.stringify(transformedEntries));
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };
  
  const handleLogin = async () => {
    if (DEMO_MODE) {
      await AsyncStorage.setItem('isAuthenticated', 'true');
      setIsAuthenticated(true);
    } else {
      // Real auth is handled in LoginScreen component
      // Session is automatically persisted by Supabase
      setIsAuthenticated(true);
      
      // Check if we have a session before clearing pending signup
      const { session } = await authAPI.getSession();
      if (session) {
        // Only clear pending signup if we have a real session
        await AsyncStorage.removeItem('pendingSignupUserId');
        console.log('✅ Session available, cleared pending signup flag');
        
        // Get user to set up per-user onboarding/subscription keys
        const { user } = await authAPI.getCurrentUser();
        if (user) {
          await loadUserData();
          // Check onboarding/subscription for this specific user
          const userId = user.id;
          const onboardingKey = `hasCompletedOnboarding_${userId}`;
          const subscriptionKey = `hasSubscription_${userId}`;
          
          const onboardingStatus = await AsyncStorage.getItem(onboardingKey);
          const subscriptionStatus = await AsyncStorage.getItem(subscriptionKey);
          
          setHasCompletedOnboarding(onboardingStatus === 'true');
          setHasSubscription(subscriptionStatus === 'true');
        }
      } else {
        // No session yet, keep pending signup flag
        const pendingUserId = await AsyncStorage.getItem('pendingSignupUserId');
        if (pendingUserId) {
          console.log('⏳ No session yet, keeping pending signup flag for user:', pendingUserId);
          // Check onboarding/subscription for pending user
          const onboardingKey = `hasCompletedOnboarding_${pendingUserId}`;
          const subscriptionKey = `hasSubscription_${pendingUserId}`;
          
          const onboardingStatus = await AsyncStorage.getItem(onboardingKey);
          const subscriptionStatus = await AsyncStorage.getItem(subscriptionKey);
          
          setHasCompletedOnboarding(onboardingStatus === 'true');
          setHasSubscription(subscriptionStatus === 'true');
        }
      }
    }
  };
  
  const handleOnboardingComplete = async (onboardingData?: { username?: string; fullName?: string; interests?: string[]; experience?: string }) => {
    // Save onboarding data to user profile
    if (onboardingData && !DEMO_MODE) {
      try {
        // Wait a bit to ensure session is fully established
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Get current user ID for per-user storage (check both session and pending signup)
        let userId: string | null = null;
        const { user } = await authAPI.getCurrentUser();
        userId = user?.id || null;
        
        // If no user from session, check pending signup
        if (!userId) {
          const pendingUserId = await AsyncStorage.getItem('pendingSignupUserId');
          if (pendingUserId) {
            userId = pendingUserId;
            console.log('📝 Using pending signup user ID for onboarding completion');
          }
        }
        
        const updates: any = {};
        if (onboardingData.username && onboardingData.username.trim()) {
          updates.username = onboardingData.username.trim();
        }
        if (onboardingData.fullName && onboardingData.fullName.trim()) {
          updates.full_name = onboardingData.fullName.trim();
        } else if (onboardingData.username && onboardingData.username.trim()) {
          // Use username as full_name if no full name provided
          updates.full_name = onboardingData.username.trim();
        }
        
        if (Object.keys(updates).length > 0) {
          console.log('💾 Saving onboarding data to profile:', updates);
          
          // Try to update profile - but if no session, store for later
          const { session } = await authAPI.getSession();
          if (session) {
            const { error } = await authAPI.updateProfile(updates);
            if (error) {
              console.error('❌ Error updating profile with onboarding data:', error);
              // Store for later retry
              await AsyncStorage.setItem('pendingOnboardingData', JSON.stringify(onboardingData));
            } else {
              console.log('✅ Profile updated successfully with onboarding data');
            }
          } else {
            console.log('⏳ No session yet, storing onboarding data for later update');
            // Store onboarding data to save later when session is available
            await AsyncStorage.setItem('pendingOnboardingData', JSON.stringify(onboardingData));
          }
        }
        
        // Save onboarding status per user (always save this, even without session)
        if (userId) {
          await AsyncStorage.setItem(`hasCompletedOnboarding_${userId}`, 'true');
          console.log('✅ Onboarding marked as complete for user:', userId);
        } else {
          // Fallback to global if no user ID
          await AsyncStorage.setItem('hasCompletedOnboarding', 'true');
        }
      } catch (error) {
        console.error('❌ Error saving onboarding data:', error);
        // Still mark as completed even if update fails
        const pendingUserId = await AsyncStorage.getItem('pendingSignupUserId');
        const userId = pendingUserId;
        if (userId) {
          await AsyncStorage.setItem(`hasCompletedOnboarding_${userId}`, 'true');
        } else {
          await AsyncStorage.setItem('hasCompletedOnboarding', 'true');
        }
      }
    } else {
      // Demo mode
      await AsyncStorage.setItem('hasCompletedOnboarding', 'true');
    }
    
    setHasCompletedOnboarding(true);
  };
  
  // Function to retry saving pending onboarding data when session becomes available
  const retryPendingOnboardingData = async () => {
    try {
      const pendingData = await AsyncStorage.getItem('pendingOnboardingData');
      if (!pendingData) return;
      
      const { session } = await authAPI.getSession();
      if (!session) return; // Still no session, wait
      
      const onboardingData = JSON.parse(pendingData);
      const updates: any = {};
      if (onboardingData.username && onboardingData.username.trim()) {
        updates.username = onboardingData.username.trim();
      }
      if (onboardingData.fullName && onboardingData.fullName.trim()) {
        updates.full_name = onboardingData.fullName.trim();
      } else if (onboardingData.username && onboardingData.username.trim()) {
        updates.full_name = onboardingData.username.trim();
      }
      
      if (Object.keys(updates).length > 0) {
        const { error } = await authAPI.updateProfile(updates);
        if (!error) {
          console.log('✅ Successfully saved pending onboarding data');
          await AsyncStorage.removeItem('pendingOnboardingData');
        }
      }
    } catch (error) {
      console.error('Error retrying pending onboarding data:', error);
    }
  };
  
  const handleSubscribe = async () => {
    // Here you would integrate with RevenueCat, Stripe, or Apple/Google In-App Purchases
    try {
      let userId: string | null = null;
      
      if (!DEMO_MODE) {
        // Try to get user ID from active session first
        const { user } = await authAPI.getCurrentUser();
        userId = user?.id || null;
        
        // If no user from session, check for pending signup user
        if (!userId) {
          const pendingUserId = await AsyncStorage.getItem('pendingSignupUserId');
          if (pendingUserId) {
            userId = pendingUserId;
            console.log('💳 Using pending user ID for subscription:', userId);
          }
        }
        
        if (userId) {
          const subscriptionKey = `hasSubscription_${userId}`;
          await AsyncStorage.setItem(subscriptionKey, 'true');
          console.log('✅ Subscription saved for user:', userId);
        } else {
          // Fallback to global if no user ID (shouldn't happen in normal flow)
          console.warn('⚠️ No user ID available, using global subscription key');
          await AsyncStorage.setItem('hasSubscription', 'true');
        }
      } else {
        await AsyncStorage.setItem('hasSubscription', 'true');
      }
      
      // Update state immediately so user can proceed
      setHasSubscription(true);
      console.log('✅ Subscription activated, user can now access app');
    } catch (error) {
      console.error('Error saving subscription:', error);
      // Still set state to true so user can proceed
      setHasSubscription(true);
    }
  };
  
  // Setup daily notification at random time
  const setupDailyNotification = async () => {
    try {
      // Request notification permissions
      const { status } = await Notifications.requestPermissionsAsync();
      if (status !== 'granted') {
        console.log('Notification permissions not granted');
        return;
      }
      
      // Get and store push token
      try {
        const tokenData = await Notifications.getExpoPushTokenAsync();
        if (tokenData?.data) {
          await authAPI.updatePushToken(tokenData.data);
          console.log('✅ Push token stored:', tokenData.data);
        }
      } catch (tokenError) {
        console.warn('Could not get push token:', tokenError);
      }
      
      // Cancel any existing notifications
      await Notifications.cancelAllScheduledNotificationsAsync();
      
      // Generate random time between 9 AM and 11 PM
      const randomHour = Math.floor(Math.random() * (23 - 9 + 1)) + 9;
      const randomMinute = Math.floor(Math.random() * 60);
      
      const now = new Date();
      const notificationTime = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate(),
        randomHour,
        randomMinute
      );
      
      // If time has passed today, schedule for tomorrow
      if (notificationTime < now) {
        notificationTime.setDate(notificationTime.getDate() + 1);
      }
      
      setDailyNotificationTime(notificationTime);
      
      // Schedule the notification (daily at specific time)
      await Notifications.scheduleNotificationAsync({
        content: {
          title: '⏰ Time to BeHigh!',
          body: 'Capture your moment now! You have 2 minutes ⚡',
          sound: true,
          priority: Notifications.AndroidNotificationPriority.HIGH,
        },
        trigger: {
          hour: randomHour,
          minute: randomMinute,
          repeats: true,
          type: Notifications.SchedulableTriggerInputTypes.CALENDAR,
        } as any,
      });
      
      console.log(`Daily notification scheduled for ${notificationTime.toLocaleTimeString()}`);
    } catch (error) {
      console.error('Error setting up daily notification:', error);
    }
  };
  
  // Handler for posting from camera
  const handlePostFromCamera = async (frontPhoto: string, backPhoto: string, isLate: boolean = false) => {
    setIsPosting(true);
    
    try {
      if (DEMO_MODE) {
        // Demo mode: just add to local state
        const newPost = {
          id: `post-${Date.now()}`,
          user_id: 'demo-user-1',
          front_camera_url: frontPhoto,
          back_camera_url: backPhoto,
          posted_late: isLate,
          user: { username: 'you', full_name: 'You' },
          reactions: {
            '🔥': 0,
            '😂': 0,
            '❤️': 0,
            '👍': 0,
          },
        };
        setPosts(prev => [newPost as any, ...prev]);
      } else {
        // Real mode: upload photos and create post
        const timestamp = Date.now();
        const frontFilename = `front_${timestamp}.jpg`;
        const backFilename = `back_${timestamp}.jpg`;
        
        // Upload both photos
        const [frontUpload, backUpload] = await Promise.all([
          postsAPI.uploadPhoto(frontPhoto, 'posts', frontFilename),
          postsAPI.uploadPhoto(backPhoto, 'posts', backFilename),
        ]);
        
        if (frontUpload.error || backUpload.error) {
          alert('Failed to upload photos. Please try again.');
          setIsPosting(false);
          return;
        }
        
        if (!frontUpload.url || !backUpload.url) {
          alert('Failed to get photo URLs. Please try again.');
          setIsPosting(false);
          return;
        }
        
        // Create post
        const { post, error } = await postsAPI.createPost(
          frontUpload.url,
          backUpload.url,
          isLate
        );
        
        if (error) {
          alert('Failed to create post. Please try again.');
          setIsPosting(false);
          return;
        }
        
        if (post) {
          // Transform post to match app format
          const transformedPost = {
            ...post,
            user: post.user || { username: 'you', full_name: 'You' },
            reactions: {},
          };
          setPosts(prev => [transformedPost as any, ...prev]);
        }
      }
    } catch (error: any) {
      console.error('Error posting:', error);
      alert('Failed to post. Please try again.');
    } finally {
      setIsPosting(false);
    }
  };
  
  // Emoji reaction handler
  const handleAddReaction = async (postId: string, emoji: string) => {
    // Optimistically update UI
    setPosts(prev => prev.map(post => {
      if (post.id === postId) {
        const reactions = post.reactions as Record<string, number>;
        const currentCount = reactions[emoji] || 0;
        return {
          ...post,
          reactions: {
            ...reactions,
            [emoji]: currentCount + 1
          } as any
        };
      }
      return post;
    }));
    
    // Save to backend
    if (!DEMO_MODE) {
      try {
        const { error } = await postsAPI.addReaction(postId, emoji);
        if (error) {
          console.error('Error adding reaction:', error);
          // Revert optimistic update on error
          setPosts(prev => prev.map(post => {
            if (post.id === postId) {
              const reactions = post.reactions as Record<string, number>;
              const currentCount = reactions[emoji] || 0;
              return {
                ...post,
                reactions: {
                  ...reactions,
                  [emoji]: Math.max(0, currentCount - 1)
                } as any
              };
            }
            return post;
          }));
        }
      } catch (error) {
        console.error('Error adding reaction:', error);
      }
    }
  };
  
  // Friend request handlers
  const handleSendFriendRequest = async (userId: string) => {
    if (DEMO_MODE) {
      setSentRequests(prev => [...prev, userId]);
    } else {
      try {
        const { error } = await friendsAPI.sendFriendRequest(userId);
        if (error) {
          alert('Failed to send friend request');
          return;
        }
        setSentRequests(prev => [...prev, userId]);
      } catch (error) {
        console.error('Error sending friend request:', error);
        alert('Failed to send friend request');
      }
    }
  };
  
  const handleAcceptFriendRequest = async (friendshipId: string) => {
    if (DEMO_MODE) {
      const request = friendRequests.find(r => r.id === friendshipId);
      if (request) {
        setMyFriends(prev => [...prev, request.user || request]);
        setFriendRequests(prev => prev.filter(r => r.id !== friendshipId));
      }
    } else {
      try {
        const { error } = await friendsAPI.acceptFriendRequest(friendshipId);
        if (error) {
          alert('Failed to accept friend request');
          return;
        }
        // Reload friends and requests
        const { friends } = await friendsAPI.getFriends();
        const { requests } = await friendsAPI.getFriendRequests();
        if (friends) setMyFriends(friends);
        if (requests) setFriendRequests(requests);
      } catch (error) {
        console.error('Error accepting friend request:', error);
        alert('Failed to accept friend request');
      }
    }
  };
  
  const handleDeclineFriendRequest = async (friendshipId: string) => {
    if (DEMO_MODE) {
      setFriendRequests(prev => prev.filter(r => r.id !== friendshipId));
    } else {
      try {
        const { error } = await friendsAPI.declineFriendRequest(friendshipId);
        if (error) {
          alert('Failed to decline friend request');
          return;
        }
        const { requests } = await friendsAPI.getFriendRequests();
        if (requests) setFriendRequests(requests);
      } catch (error) {
        console.error('Error declining friend request:', error);
        alert('Failed to decline friend request');
      }
    }
  };
  
  // Chat message handler
  const handleSendMessage = async (friendId: string, message: string) => {
    if (DEMO_MODE) {
      const newMessage = {
        id: `msg-${Date.now()}`,
        text: message,
        sender: 'me',
        timestamp: new Date().toISOString(),
      };
      
      setChatMessages(prev => ({
        ...prev,
        [friendId]: [...(prev[friendId] || []), newMessage]
      }));
    } else {
      try {
        const { message: newMessage, error } = await chatAPI.sendMessage(friendId, message);
        
        if (error) {
          alert('Failed to send message');
          return;
        }
        
        if (newMessage) {
          // Transform message to match app format
          const transformedMessage = {
            id: newMessage.id,
            text: newMessage.message,
            sender: newMessage.sender_id,
            timestamp: newMessage.created_at,
            senderData: newMessage.sender,
          };
          
          setChatMessages(prev => ({
            ...prev,
            [friendId]: [...(prev[friendId] || []), transformedMessage]
          }));
        }
      } catch (error) {
        console.error('Error sending message:', error);
        alert('Failed to send message');
      }
    }
  };
  
  // Load chat messages for a friend
  const loadChatMessages = async (friendId: string) => {
    if (DEMO_MODE) return;
    
    try {
      const { messages, error } = await chatAPI.getMessages(friendId);
      
      if (error) {
        console.error('Error loading messages:', error);
        return;
      }
      
      if (messages) {
        const transformedMessages = messages.map((msg: any) => ({
          id: msg.id,
          text: msg.message,
          sender: msg.sender_id,
          timestamp: msg.created_at,
          senderData: msg.sender,
        }));
        
        setChatMessages(prev => ({
          ...prev,
          [friendId]: transformedMessages
        }));
      }
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  };
  
  // Journal entry handler
  const handleAddJournalEntry = async (text: string, duration: string) => {
    if (DEMO_MODE) {
      const newEntry = {
        id: `entry-${Date.now()}`,
        text,
        date: new Date().toISOString(),
        duration,
      };
      
      const updatedEntries = [newEntry, ...journalEntries];
      setJournalEntries(updatedEntries);
      
      // Save to AsyncStorage
      try {
        await AsyncStorage.setItem('journalEntries', JSON.stringify(updatedEntries));
      } catch (error) {
        console.error('Error saving journal entry:', error);
      }
    } else {
      try {
        const { entry, error } = await journalAPI.createEntry(text, duration);
        
        if (error) {
          alert('Failed to save journal entry');
          return;
        }
        
        if (entry) {
          // Transform entry to match app format
          const transformedEntry = {
            id: entry.id,
            text: entry.text,
            date: entry.created_at || new Date().toISOString(),
            duration: entry.duration,
          };
          const updatedEntries = [transformedEntry, ...journalEntries];
          setJournalEntries(updatedEntries);
          
          // Also save locally for offline access
          await AsyncStorage.setItem('journalEntries', JSON.stringify(updatedEntries));
        }
      } catch (error) {
        console.error('Error saving journal entry:', error);
        alert('Failed to save journal entry');
      }
    }
  };
  
  
  const handleLogout = async () => {
    try {
      if (!DEMO_MODE) {
        // Get user ID before signing out to clear per-user data
        const { user } = await authAPI.getCurrentUser();
        const userId = user?.id;
        
        await authAPI.signOut();
        
        // Clear per-user data
        if (userId) {
          await AsyncStorage.removeItem(`hasCompletedOnboarding_${userId}`);
          await AsyncStorage.removeItem(`hasSubscription_${userId}`);
        }
        
        // Clear pending signup flag
        await AsyncStorage.removeItem('pendingSignupUserId');
      } else {
        await AsyncStorage.removeItem('isAuthenticated');
        await AsyncStorage.removeItem('hasCompletedOnboarding');
        await AsyncStorage.removeItem('hasSubscription');
      }
      
      setIsAuthenticated(false);
      setHasCompletedOnboarding(false);
      setHasSubscription(false);
      // Clear app data
      setPosts([]);
      setMyFriends([]);
      setFriendRequests([]);
      setChatMessages({});
      setJournalEntries([]);
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };
  
  // Show splash screen
  if (showSplash || isLoading) {
    return <SplashScreen />;
  }
  
  // Show login if not authenticated
  if (!isAuthenticated) {
    return <LoginScreen onLogin={handleLogin} />;
  }
  
  // Show onboarding if not completed
  if (!hasCompletedOnboarding) {
    return <OnboardingScreen onComplete={handleOnboardingComplete} />;
  }
  
  // Show paywall ONLY if user has completed onboarding but doesn't have an active subscription
  // If subscription is active, skip paywall and go directly to app
  if (!hasSubscription) {
    return <PaywallScreen onSubscribe={handleSubscribe} />;
  }
  
  // User is authenticated, completed onboarding, and has active subscription
  // Show the main app
  
  if (currentScreen === 'terms') {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#000" />
        <TermsScreen onBack={() => setCurrentScreen(null)} />
      </SafeAreaView>
    );
  }
  
  if (currentScreen === 'privacy') {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#000" />
        <PrivacyScreen onBack={() => setCurrentScreen(null)} />
      </SafeAreaView>
    );
  }
  
  if (currentScreen === 'settings') {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#000" />
        <SettingsScreen onBack={() => setCurrentScreen(null)} />
      </SafeAreaView>
    );
  }
  
  if (currentScreen === 'contact') {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#000" />
        <ContactScreen onBack={() => setCurrentScreen(null)} />
      </SafeAreaView>
    );
  }
  
  if (currentScreen === 'addFriends') {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#000" />
        <AddFriendsScreen onBack={() => setCurrentScreen(null)} />
      </SafeAreaView>
    );
  }
  
  if (currentScreen === 'notifications') {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#000" />
        <NotificationsScreen 
          onBack={() => setCurrentScreen(null)}
          friendRequests={friendRequests}
          onAcceptRequest={handleAcceptFriendRequest}
          onDeclineRequest={handleDeclineFriendRequest}
        />
      </SafeAreaView>
    );
  }
  
  if (showCamera) {
  return (
    <View style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#000" />
        <CameraScreen 
          onClose={() => setShowCamera(false)} 
          onPost={handlePostFromCamera}
        />
    </View>
    );
  }
  
  if (selectedJournalEntry) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#000" />
        <JournalEntryDetailScreen 
          entry={selectedJournalEntry} 
          onBack={() => setSelectedJournalEntry(null)} 
        />
      </SafeAreaView>
    );
  }
  
  if (selectedFriend) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#000" />
        <ChatScreen 
          friend={selectedFriend} 
          onBack={() => setSelectedFriend(null)}
          messages={chatMessages[selectedFriend.id] || []}
          onSendMessage={(msg) => handleSendMessage(selectedFriend.id, msg)}
        />
      </SafeAreaView>
    );
  }
  
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000" />
      {activeTab === 'Feed' && (
        <FeedScreen 
          onNavigate={setCurrentScreen}
          posts={posts}
          onAddReaction={handleAddReaction}
        />
      )}
      {activeTab === 'Friends' && (
        <FriendsScreen 
          onOpenChat={(friend) => {
            setSelectedFriend(friend);
            loadChatMessages(friend.id);
          }} 
          onNavigate={setCurrentScreen}
          myFriends={myFriends}
          friendRequests={friendRequests}
          sentRequests={sentRequests}
          onSendRequest={handleSendFriendRequest}
          onAcceptRequest={handleAcceptFriendRequest}
          onDeclineRequest={handleDeclineFriendRequest}
        />
      )}
      {activeTab === 'Journal' && (
        <JournalScreen 
          onViewEntry={setSelectedJournalEntry}
          journalEntries={journalEntries}
          onAddEntry={handleAddJournalEntry}
        />
      )}
      {activeTab === 'Profile' && <ProfileScreen onNavigate={setCurrentScreen} onLogout={handleLogout} />}
      
      <View style={styles.tabBar}>
        <TouchableOpacity 
          style={styles.tabButton} 
          onPress={() => setActiveTab('Feed')}
        >
          <Ionicons 
            name={activeTab === 'Feed' ? 'home' : 'home-outline'} 
            size={22} 
            color={activeTab === 'Feed' ? '#00ff88' : '#666'} 
          />
          <Text style={[styles.tabLabel, activeTab === 'Feed' && styles.tabLabelActive]}>
            Feed
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.tabButton} 
          onPress={() => setActiveTab('Friends')}
        >
          <View style={styles.friendsBadgeContainer}>
            <Ionicons 
              name={activeTab === 'Friends' ? 'people' : 'people-outline'} 
              size={22} 
              color={activeTab === 'Friends' ? '#00ff88' : '#666'} 
            />
            <View style={styles.redBadge} />
          </View>
          <Text style={[styles.tabLabel, activeTab === 'Friends' && styles.tabLabelActive]}>
            Friends
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.cameraButton}
          onPress={() => setShowCamera(true)}
        >
          <View style={styles.cameraButtonInner}>
            <Ionicons name="camera" size={28} color="#000" />
          </View>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.tabButton} 
          onPress={() => setActiveTab('Journal')}
        >
          <Ionicons 
            name={activeTab === 'Journal' ? 'book' : 'book-outline'} 
            size={22} 
            color={activeTab === 'Journal' ? '#00ff88' : '#666'} 
          />
          <Text style={[styles.tabLabel, activeTab === 'Journal' && styles.tabLabelActive]}>
            Journal
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.tabButton} 
          onPress={() => setActiveTab('Profile')}
        >
          <Ionicons 
            name={activeTab === 'Profile' ? 'person' : 'person-outline'} 
            size={22} 
            color={activeTab === 'Profile' ? '#00ff88' : '#666'} 
          />
          <Text style={[styles.tabLabel, activeTab === 'Profile' && styles.tabLabelActive]}>
            Profile
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  screenContainer: {
    flex: 1,
    backgroundColor: '#000',
  },
  beHighHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#000',
  },
  beHighLogo: {
    fontSize: 22,
    fontWeight: '700',
    color: '#fff',
  },
  notificationButton: {
    padding: 4,
  },
  addFriendsButton: {
    padding: 4,
  },
  subTabContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    backgroundColor: '#000',
    marginBottom: 8,
  },
  subTab: {
    marginRight: 32,
    paddingBottom: 8,
  },
  subTabText: {
    fontSize: 15,
    color: '#666',
    fontWeight: '500',
  },
  subTabTextActive: {
    color: '#fff',
  },
  subTabIndicator: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: '#fff',
  },
  filterContainer: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#000',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  filterTabs: {
    flexDirection: 'row',
    backgroundColor: '#1a1a1a',
    borderRadius: 24,
    padding: 4,
  },
  filterTab: {
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 20,
  },
  filterTabActive: {
    backgroundColor: '#fff',
  },
  filterTabText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#666',
    letterSpacing: 0.5,
  },
  filterTabTextActive: {
    color: '#000',
  },
  invitePeopleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  invitePeopleText: {
    fontSize: 14,
    color: '#fff',
    fontWeight: '500',
  },
  scrollView: {
    flex: 1,
    backgroundColor: '#000',
  },
  postCard: {
    backgroundColor: '#000',
    marginBottom: 24,
  },
  postHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  postHeaderInfo: {
    flex: 1,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#00ff88',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  avatarText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  username: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 2,
  },
  time: {
    fontSize: 12,
    color: '#999',
  },
  moreButton: {
    padding: 8,
  },
  moreButtonText: {
    fontSize: 24,
    color: '#fff',
  },
  imageContainer: {
    position: 'relative',
    width: '100%',
    aspectRatio: 3/4,
    backgroundColor: '#1a1a1a',
  },
  mainImage: {
    width: '100%',
    height: '100%',
  },
  selfieOverlay: {
    position: 'absolute',
    top: 12,
    left: 12,
    width: 122,
    height: 163,
    borderRadius: 12,
    borderWidth: 3,
    borderColor: '#000',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
  },
  selfieImage: {
    width: '100%',
    height: '100%',
  },
  reactionsContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  reactionsScroll: {
    flexDirection: 'row',
  },
  reactionBubble: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#2a2a2a',
  },
  reactionEmoji: {
    fontSize: 18,
    marginRight: 6,
  },
  reactionCount: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  addReactionButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#1a1a1a',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#00ff88',
  },
  emojiPicker: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    backgroundColor: '#1a1a1a',
    padding: 12,
    borderRadius: 12,
    marginTop: 12,
    gap: 8,
  },
  emojiOption: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0f0f0f',
    borderRadius: 22,
    borderWidth: 1,
    borderColor: '#2a2a2a',
  },
  emojiOptionText: {
    fontSize: 24,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    marginHorizontal: 16,
    marginTop: 8,
    marginBottom: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchPlaceholder: {
    color: '#666',
    fontSize: 15,
  },
  searchInput: {
    flex: 1,
    color: '#fff',
    fontSize: 15,
  },
  inviteCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#1a1a1a',
    marginHorizontal: 16,
    marginBottom: 24,
    padding: 16,
    borderRadius: 12,
  },
  inviteCardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  inviteAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#00ff88',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  inviteAvatarText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  inviteTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 2,
  },
  inviteSubtitle: {
    fontSize: 12,
    color: '#999',
  },
  popularSection: {
    paddingHorizontal: 16,
    marginTop: 8,
  },
  popularSectionTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: '#666',
    letterSpacing: 1,
    marginBottom: 16,
    marginTop: 8,
  },
  myFriendCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: '#1a1a1a',
  },
  moreIconButton: {
    padding: 8,
  },
  popularUserCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: '#1a1a1a',
  },
  popularUserLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  popularAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 12,
  },
  popularUserInfo: {
    flex: 1,
  },
  usernameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  popularUsername: {
    fontSize: 15,
    fontWeight: '600',
    color: '#fff',
  },
  popularFollowers: {
    fontSize: 12,
    color: '#999',
  },
  popularUserActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  followButton: {
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 8,
  },
  followButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#000',
  },
  closeButton: {
    padding: 4,
  },
  showMoreButton: {
    backgroundColor: '#1a1a1a',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 32,
  },
  showMoreText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#fff',
  },
  findMoreSection: {
    alignItems: 'center',
    paddingVertical: 32,
    paddingHorizontal: 16,
    marginBottom: 32,
  },
  findMoreTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginTop: 12,
    marginBottom: 4,
  },
  findMoreSubtitle: {
    fontSize: 13,
    color: '#999',
  },
  profileInfoSection: {
    alignItems: 'center',
    paddingVertical: 32,
    borderBottomWidth: 1,
    borderBottomColor: '#1a1a1a',
  },
  profileAvatarContainer: {
    position: 'relative',
    marginBottom: 16,
    alignSelf: 'center',
  },
  profileAvatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#00ff88',
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileAvatarImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  profileAvatarText: {
    fontSize: 40,
    fontWeight: '700',
    color: '#000',
  },
  profileAvatarOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 50,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileAvatarEditBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#00ff88',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#000',
  },
  profileUsername: {
    fontSize: 24,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 4,
    textAlign: 'center',
  },
  profileHandle: {
    fontSize: 16,
    color: '#999',
    marginBottom: 4,
    textAlign: 'center',
  },
  profileFullName: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
    textAlign: 'center',
  },
  productSection: {
    paddingVertical: 24,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#1a1a1a',
  },
  productDisplayArea: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  productArrow: {
    padding: 8,
  },
  productDisplayCenter: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: 12,
  },
  productCard: {
    width: 140,
    height: 180,
    backgroundColor: '#0f0f0f',
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#1a1a1a',
  },
  productImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  shopLinkButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0f0f0f',
    marginHorizontal: 16,
    marginTop: 16,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#1a1a1a',
    gap: 12,
  },
  shopLinkTextContainer: {
    flex: 1,
  },
  shopLinkTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 2,
  },
  shopLinkSubtitle: {
    fontSize: 13,
    color: '#999',
  },
  headerButtons: {
    flexDirection: 'row',
    gap: 16,
  },
  webLinkContainer: {
    padding: 24,
    alignItems: 'center',
  },
  webLinkText: {
    fontSize: 16,
    color: '#fff',
    marginBottom: 24,
    textAlign: 'center',
  },
  webLinkButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#00ff88',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  webLinkButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
  contactContainer: {
    padding: 16,
  },
  contactTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 24,
    textAlign: 'center',
  },
  contactCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0f0f0f',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#1a1a1a',
    gap: 16,
  },
  contactCardText: {
    flex: 1,
  },
  contactCardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 4,
  },
  contactCardSubtitle: {
    fontSize: 14,
    color: '#999',
  },
  addFriendsContainer: {
    padding: 16,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0f0f0f',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#1a1a1a',
    gap: 12,
    marginBottom: 12,
  },
  searchInputPlaceholder: {
    fontSize: 16,
    color: '#666',
    flex: 1,
  },
  addFriendsHint: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    marginTop: 8,
  },
  notificationsContainer: {
    padding: 16,
  },
  notificationCard: {
    flexDirection: 'row',
    backgroundColor: '#0f0f0f',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#1a1a1a',
  },
  notificationAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#00ff88',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  notificationAvatarText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
  },
  notificationContent: {
    flex: 1,
  },
  notificationText: {
    fontSize: 14,
    color: '#fff',
    marginBottom: 4,
  },
  notificationUsername: {
    fontWeight: '600',
  },
  notificationTime: {
    fontSize: 12,
    color: '#666',
  },
  notificationSection: {
    marginBottom: 24,
  },
  notificationSectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  notificationActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 12,
  },
  notificationAcceptButton: {
    backgroundColor: '#00ff88',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
  },
  notificationAcceptText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
  },
  notificationDeclineButton: {
    backgroundColor: '#333',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
  },
  notificationDeclineText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  profileMenuSection: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 100,
  },
  profileMenuItem: {
    backgroundColor: '#0f0f0f',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#1a1a1a',
  },
  profileMenuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileMenuIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#1a1a1a',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  profileMenuLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#fff',
  },
  profileMenuItemLogout: {
    borderTopWidth: 1,
    borderTopColor: '#1a1a1a',
    marginTop: 8,
    paddingTop: 20,
  },
  profileMenuIconLogout: {
    backgroundColor: 'transparent',
  },
  profileMenuLabelLogout: {
    color: '#ff4444',
    fontWeight: '600',
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#000',
    borderTopWidth: 0.5,
    borderTopColor: '#2a2a2a',
    paddingTop: 8,
    paddingBottom: 4,
    height: 80,
    alignItems: 'center',
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  friendsBadgeContainer: {
    position: 'relative',
    marginBottom: 4,
  },
  redBadge: {
    position: 'absolute',
    top: 0,
    right: -4,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FF3B30',
  },
  cameraButton: {
    width: 64,
    height: 64,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -32,
  },
  cameraButtonInner: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 4,
    borderColor: '#000',
  },
  tabLabel: {
    fontSize: 10,
    color: '#666',
    marginTop: 2,
  },
  tabLabelActive: {
    color: '#00ff88',
    fontWeight: '600',
  },
  // Chat Styles
  chatContainer: {
    flex: 1,
    backgroundColor: '#000',
  },
  chatHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
    paddingVertical: 12,
    backgroundColor: '#000',
    borderBottomWidth: 0.5,
    borderBottomColor: '#1a1a1a',
  },
  backButton: {
    padding: 8,
  },
  chatHeaderCenter: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 8,
  },
  chatAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: 10,
  },
  chatHeaderName: {
    fontSize: 17,
    fontWeight: '600',
    color: '#fff',
  },
  chatHeaderRight: {
    flexDirection: 'row',
    gap: 16,
  },
  chatHeaderIcon: {
    padding: 4,
  },
  messagesContainer: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  messageBubble: {
    maxWidth: '75%',
    padding: 12,
    borderRadius: 18,
    marginBottom: 12,
  },
  messageSent: {
    alignSelf: 'flex-end',
    backgroundColor: '#5B7FDB',
  },
  messageReceived: {
    alignSelf: 'flex-start',
    backgroundColor: '#2a2a2a',
  },
  messageText: {
    color: '#fff',
    fontSize: 15,
    lineHeight: 20,
  },
  chatInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#000',
    borderTopWidth: 0.5,
    borderTopColor: '#1a1a1a',
    gap: 8,
  },
  chatTextInput: {
    flex: 1,
    backgroundColor: '#2a2a2a',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    color: '#fff',
    fontSize: 15,
  },
  chatInputButton: {
    padding: 8,
  },
  // Journal Styles
  recordingSection: {
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
    backgroundColor: '#0a0a0a',
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 24,
    borderRadius: 16,
  },
  recordingSectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 8,
  },
  recordingSectionSubtitle: {
    fontSize: 14,
    color: '#999',
    marginBottom: 32,
    textAlign: 'center',
  },
  recordButton: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#1a1a1a',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  recordButtonActive: {
    backgroundColor: '#00ff88',
  },
  recordButtonInner: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  recordingPulse: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  recordingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  recordingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FF3B30',
  },
  recordingText: {
    fontSize: 14,
    color: '#FF3B30',
    fontWeight: '600',
  },
  recordingHint: {
    fontSize: 13,
    color: '#666',
    textAlign: 'center',
    marginTop: 8,
  },
  transcriptionPreview: {
    marginTop: 16,
    padding: 16,
    backgroundColor: '#0f0f0f',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#00ff88',
    minHeight: 80,
  },
  transcriptionLabel: {
    fontSize: 12,
    color: '#00ff88',
    fontWeight: '600',
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  transcriptionText: {
    fontSize: 15,
    color: '#fff',
    lineHeight: 22,
  },
  journalEntriesSection: {
    paddingHorizontal: 16,
    paddingBottom: 32,
  },
  journalEntriesTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 16,
  },
  journalEntryCard: {
    backgroundColor: '#0f0f0f',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#1a1a1a',
  },
  journalEntryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  journalEntryDate: {
    fontSize: 13,
    color: '#999',
    fontWeight: '600',
  },
  journalEntryDuration: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  journalEntryDurationText: {
    fontSize: 12,
    color: '#00ff88',
    fontWeight: '600',
  },
  journalEntryText: {
    fontSize: 15,
    color: '#fff',
    lineHeight: 22,
    marginBottom: 12,
  },
  readMoreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  readMoreText: {
    fontSize: 14,
    color: '#00ff88',
    fontWeight: '600',
  },
  // Journal Detail Styles
  journalDetailContainer: {
    padding: 16,
  },
  journalDetailHeader: {
    marginBottom: 24,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#1a1a1a',
  },
  journalDetailDate: {
    fontSize: 14,
    color: '#999',
    marginBottom: 12,
  },
  journalDetailMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  journalDetailDuration: {
    fontSize: 13,
    color: '#00ff88',
    fontWeight: '600',
    marginLeft: 4,
  },
  journalDetailContent: {
    marginBottom: 32,
  },
  journalDetailText: {
    fontSize: 17,
    color: '#fff',
    lineHeight: 28,
  },
  journalDetailActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 20,
    borderTopWidth: 1,
    borderTopColor: '#1a1a1a',
  },
  journalActionButton: {
    alignItems: 'center',
    gap: 8,
  },
  journalActionText: {
    fontSize: 13,
    color: '#fff',
    fontWeight: '500',
  },
  // Settings Styles
  settingsSection: {
    marginBottom: 24,
  },
  settingsSectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#666',
    marginBottom: 12,
    marginLeft: 4,
    letterSpacing: 0.5,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#0f0f0f',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  settingItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  settingItemText: {
    flex: 1,
  },
  settingItemTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#fff',
    marginBottom: 2,
  },
  settingItemDescription: {
    fontSize: 13,
    color: '#666',
  },
  toggle: {
    width: 50,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#333',
    padding: 2,
    justifyContent: 'center',
  },
  toggleActive: {
    backgroundColor: '#00ff88',
  },
  toggleThumb: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#fff',
  },
  toggleThumbActive: {
    alignSelf: 'flex-end',
  },
  // Camera Styles
  cameraContainer: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  camera: {
    flex: 1,
  },
  cameraOverlay: {
    flex: 1,
    backgroundColor: 'transparent',
    justifyContent: 'space-between',
  },
  cameraHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
  },
  cameraHeaderButton: {
    padding: 8,
  },
  cameraFlipButton: {
    padding: 8,
  },
  timerDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(0, 255, 136, 0.2)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#00ff88',
  },
  timerDisplayLate: {
    backgroundColor: 'rgba(255, 68, 68, 0.2)',
    borderColor: '#ff4444',
  },
  timerText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#00ff88',
    fontVariant: ['tabular-nums'],
  },
  timerTextLate: {
    color: '#ff4444',
  },
  cameraStatus: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  cameraStatusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 8,
  },
  cameraStatusText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  cameraControls: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingBottom: 50,
    paddingHorizontal: 20,
  },
  cameraThumbnail: {
    width: 60,
    height: 80,
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#00ff88',
  },
  cameraThumbnailImage: {
    width: '100%',
    height: '100%',
  },
  cameraCaptureButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'transparent',
    borderWidth: 6,
    borderColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cameraCaptureButtonInner: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#fff',
  },
  cameraPermissionText: {
    color: '#fff',
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 10,
  },
  cameraPermissionButton: {
    marginTop: 10,
    backgroundColor: '#00ff88',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    alignSelf: 'center',
  },
  cameraPermissionButtonText: {
    color: '#000',
    fontSize: 16,
    fontWeight: '600',
  },
  cameraPreviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  cameraHeaderTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '600',
  },
  cameraPreviewContainer: {
    flex: 1,
    position: 'relative',
  },
  cameraPreviewMain: {
    width: '100%',
    height: '100%',
  },
  cameraPreviewOverlay: {
    position: 'absolute',
    top: 20,
    left: 20,
    width: 122,
    height: 163,
    borderRadius: 12,
    borderWidth: 3,
    borderColor: '#00ff88',
    overflow: 'hidden',
  },
  cameraPreviewSelfie: {
    width: '100%',
    height: '100%',
  },
  cameraPreviewActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 30,
    paddingHorizontal: 20,
  },
  cameraRetakeButton: {
    flex: 1,
    marginRight: 10,
    backgroundColor: '#1a1a1a',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  cameraRetakeText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  cameraPostButton: {
    flex: 1,
    marginLeft: 10,
    backgroundColor: '#00ff88',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  cameraPostText: {
    color: '#000',
    fontSize: 16,
    fontWeight: '700',
  },
  splashContainer: {
    flex: 1,
    backgroundColor: '#000',
    alignItems: 'center',
    justifyContent: 'center',
  },
  splashContent: {
    alignItems: 'center',
  },
  splashLogoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  splashLogo: {
    fontSize: 64,
    fontWeight: '900',
    color: '#fff',
    letterSpacing: -2,
  },
  splashDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#00ff88',
    marginLeft: 4,
    marginBottom: 20,
  },
  splashTagline: {
    fontSize: 16,
    color: '#666',
    marginBottom: 60,
  },
  splashLoadingContainer: {
    width: 200,
  },
  splashLoadingBar: {
    height: 3,
    backgroundColor: '#1a1a1a',
    borderRadius: 2,
    overflow: 'hidden',
  },
  splashLoadingFill: {
    height: '100%',
    width: '100%',
    backgroundColor: '#00ff88',
  },
  // Auth Screens
  authContainer: {
    flex: 1,
    backgroundColor: '#000',
  },
  authContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  authHeader: {
    alignItems: 'center',
    marginBottom: 48,
  },
  authLogo: {
    fontSize: 48,
    fontWeight: '900',
    color: '#00ff88',
    marginBottom: 8,
  },
  authTagline: {
    fontSize: 16,
    color: '#999',
  },
  authForm: {
    gap: 16,
  },
  authInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0f0f0f',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#1a1a1a',
    paddingHorizontal: 16,
    gap: 12,
  },
  authInput: {
    flex: 1,
    color: '#fff',
    fontSize: 16,
    paddingVertical: 12,
  },
  authButton: {
    backgroundColor: '#00ff88',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  authButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000',
  },
  authButtonDisabled: {
    opacity: 0.5,
  },
  authSwitchText: {
    fontSize: 14,
    color: '#00ff88',
    textAlign: 'center',
    marginTop: 8,
  },
  authDivider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
  },
  authDividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#1a1a1a',
  },
  authDividerText: {
    fontSize: 14,
    color: '#666',
    marginHorizontal: 16,
  },
  authAppleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#000',
    borderWidth: 1,
    borderColor: '#fff',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 12,
    marginBottom: 8,
  },
  authAppleButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  // Onboarding
  onboardingContainer: {
    flex: 1,
    backgroundColor: '#000',
  },
  onboardingProgressContainer: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 24,
  },
  onboardingProgressBar: {
    height: 4,
    backgroundColor: '#1a1a1a',
    borderRadius: 2,
    marginBottom: 8,
  },
  onboardingProgressFill: {
    height: '100%',
    backgroundColor: '#00ff88',
    borderRadius: 2,
  },
  onboardingProgressText: {
    fontSize: 12,
    color: '#666',
    textAlign: 'right',
  },
  onboardingScrollView: {
    flex: 1,
  },
  onboardingScrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 120,
  },
  onboardingStep: {
    paddingTop: 24,
  },
  onboardingStepTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 12,
  },
  onboardingStepDescription: {
    fontSize: 16,
    color: '#999',
    marginBottom: 32,
    lineHeight: 22,
  },
  onboardingInputGroup: {
    marginBottom: 24,
  },
  onboardingInputLabel: {
    fontSize: 13,
    color: '#999',
    marginBottom: 8,
    fontWeight: '500',
  },
  onboardingTextArea: {
    alignItems: 'flex-start',
    minHeight: 100,
  },
  onboardingTextAreaInput: {
    paddingTop: 12,
    textAlignVertical: 'top',
  },
  onboardingOptions: {
    gap: 12,
  },
  onboardingOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0f0f0f',
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#1a1a1a',
    gap: 12,
  },
  onboardingOptionActive: {
    borderColor: '#00ff88',
    backgroundColor: '#001a0d',
  },
  onboardingOptionEmoji: {
    fontSize: 28,
  },
  onboardingOptionTextContainer: {
    flex: 1,
  },
  onboardingOptionText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '500',
  },
  onboardingOptionTextActive: {
    color: '#00ff88',
  },
  onboardingOptionDesc: {
    fontSize: 13,
    color: '#666',
    marginTop: 2,
  },
  onboardingFindFriends: {
    gap: 20,
  },
  onboardingOrText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  onboardingInviteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0f0f0f',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#00ff88',
    gap: 8,
  },
  onboardingInviteText: {
    fontSize: 16,
    color: '#00ff88',
    fontWeight: '600',
  },
  onboardingSkipFriendsText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginTop: 8,
  },
  onboardingCameraPermissionContainer: {
    alignItems: 'center',
    paddingVertical: 60,
    gap: 20,
  },
  onboardingCameraPermissionText: {
    fontSize: 16,
    color: '#999',
  },
  onboardingCameraButton: {
    backgroundColor: '#00ff88',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
  },
  onboardingCameraButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000',
  },
  onboardingCameraContainer: {
    marginTop: 20,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#0f0f0f',
  },
  onboardingCamera: {
    width: '100%',
    aspectRatio: 3/4,
  },
  onboardingCameraControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 24,
    paddingHorizontal: 32,
    backgroundColor: '#000',
  },
  onboardingCaptureButton: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#fff',
    padding: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  onboardingCaptureButtonInner: {
    width: '100%',
    height: '100%',
    borderRadius: 32,
    backgroundColor: '#fff',
    borderWidth: 3,
    borderColor: '#000',
  },
  onboardingPhotoPreview: {
    marginTop: 20,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#0f0f0f',
  },
  onboardingPhotoImage: {
    width: '100%',
    aspectRatio: 3/4,
  },
  onboardingRetakeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
    backgroundColor: '#0f0f0f',
  },
  onboardingRetakeText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '600',
  },
  onboardingNavigation: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    paddingHorizontal: 24,
    paddingVertical: 24,
    backgroundColor: '#000',
    borderTopWidth: 1,
    borderTopColor: '#1a1a1a',
    gap: 12,
  },
  onboardingBackButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    backgroundColor: '#0f0f0f',
    gap: 8,
  },
  onboardingBackText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '600',
  },
  onboardingNextButton: {
    flex: 1,
    backgroundColor: '#00ff88',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  onboardingNextButtonFull: {
    flex: 1,
  },
  onboardingNextButtonDisabled: {
    backgroundColor: '#1a1a1a',
  },
  onboardingNextText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000',
  },
  // Paywall
  paywallContainer: {
    flex: 1,
    backgroundColor: '#000',
  },
  paywallContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 32,
  },
  paywallHeader: {
    alignItems: 'center',
    marginBottom: 40,
  },
  paywallTitle: {
    fontSize: 32,
    fontWeight: '900',
    color: '#fff',
    marginBottom: 8,
  },
  paywallSubtitle: {
    fontSize: 16,
    color: '#999',
  },
  paywallFeatures: {
    marginBottom: 40,
    gap: 16,
  },
  paywallFeature: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  paywallFeatureText: {
    fontSize: 16,
    color: '#fff',
  },
  paywallPricing: {
    alignItems: 'center',
    marginBottom: 32,
  },
  paywallPriceCard: {
    backgroundColor: '#0f0f0f',
    paddingVertical: 24,
    paddingHorizontal: 48,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#00ff88',
    alignItems: 'center',
  },
  paywallPrice: {
    fontSize: 48,
    fontWeight: '900',
    color: '#00ff88',
  },
  paywallPricePeriod: {
    fontSize: 16,
    color: '#999',
  },
  paywallSubscribeButton: {
    backgroundColor: '#00ff88',
    paddingVertical: 18,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 16,
  },
  paywallSubscribeText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000',
  },
  paywallSubscribeSubtext: {
    fontSize: 12,
    color: '#000',
    opacity: 0.7,
    marginTop: 4,
  },
  paywallTerms: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    lineHeight: 18,
  },
  // Empty States
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
    paddingHorizontal: 40,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
    marginTop: 20,
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 15,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
  },
  emptyStateButton: {
    backgroundColor: '#00ff88',
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 24,
  },
  emptyStateButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
  // Loading State
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
    marginTop: 16,
  },
  // Friend request button states
  followButtonSent: {
    backgroundColor: '#333',
  },
});

