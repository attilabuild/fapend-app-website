import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  StatusBar,
  ImageBackground,
  Dimensions 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';

const { width, height } = Dimensions.get('window');

export default function WelcomeScreen() {
  const navigation = useNavigation();

  const handleGetStarted = () => {
    navigation.navigate('Onboarding');
  };

  const handleLogin = () => {
    // Login navigation will be implemented later
    console.log('Login pressed');
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
            {/* Main Content */}
            <View style={styles.content}>
              {/* App Name */}
              <Text style={styles.appName}>Skinmax</Text>
              
              {/* Main Headlines */}
              <View style={styles.headlineContainer}>
                <Text style={styles.headline}>Scan</Text>
                <Text style={styles.headline}>Analyze</Text>
                <Text style={styles.headlineItalic}>Glow!</Text>
              </View>
            </View>

            {/* Bottom Section */}
            <View style={styles.bottomSection}>
              <TouchableOpacity 
                style={styles.getStartedButton}
                onPress={handleGetStarted}
                activeOpacity={0.8}
              >
                <Text style={styles.getStartedText}>Get Started</Text>
              </TouchableOpacity>
              
              <TouchableOpacity onPress={handleLogin} activeOpacity={0.7}>
                <Text style={styles.loginText}>
                  Already have an account ? <Text style={styles.loginLink}>Login</Text>
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </SafeAreaView>
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000', // Fallback color
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
    backgroundColor: 'rgba(0, 0, 0, 0.1)', // Subtle overlay to help text readability
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  appName: {
    fontSize: 24,
    fontWeight: '400',
    color: '#FFF3E0',
    marginBottom: 40,
    letterSpacing: 1,
  },
  headlineContainer: {
    alignItems: 'center',
  },
  headline: {
    fontSize: 64,
    fontWeight: '300',
    color: '#FFF3E0',
    lineHeight: 70,
    letterSpacing: -1,
    textAlign: 'center',
  },
  headlineItalic: {
    fontSize: 64,
    fontWeight: '300',
    fontStyle: 'italic',
    color: '#FFF3E0',
    lineHeight: 70,
    letterSpacing: -1,
    textAlign: 'center',
  },
  bottomSection: {
    paddingHorizontal: 32,
    paddingBottom: 50,
    alignItems: 'center',
  },
  getStartedButton: {
    backgroundColor: '#A86A48',
    paddingHorizontal: 48,
    paddingVertical: 16,
    borderRadius: 25,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  getStartedText: {
    color: '#FFF3E0',
    fontSize: 18,
    fontWeight: '500',
    letterSpacing: 0.5,
  },
  loginText: {
    fontSize: 14,
    color: '#FFF3E0',
    opacity: 0.8,
  },
  loginLink: {
    textDecorationLine: 'underline',
    fontWeight: '500',
  },
});