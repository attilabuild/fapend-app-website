import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
  StatusBar,
  ImageBackground,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width, height } = Dimensions.get('window');

// Progress indicator component
const ProgressBar = ({ currentStep, totalSteps }) => {
  return (
    <View style={styles.progressContainer}>
      {Array.from({ length: totalSteps }).map((_, index) => (
        <View 
          key={index} 
          style={[
            styles.progressDot, 
            index <= currentStep ? styles.progressDotActive : {}
          ]} 
        />
      ))}
    </View>
  );
};

// Option button component with animation
const AnimatedOption = ({ label, onPress, delay = 0 }) => {
  const animatedValue = useRef(new Animated.Value(0)).current;
  
  React.useEffect(() => {
    Animated.timing(animatedValue, {
      toValue: 1,
      duration: 400,
      delay: delay,
      useNativeDriver: true,
    }).start();
  }, []);
  
  const animatedStyle = {
    opacity: animatedValue,
    transform: [
      {
        translateY: animatedValue.interpolate({
          inputRange: [0, 1],
          outputRange: [20, 0],
        }),
      },
    ],
  };
  
  return (
    <Animated.View style={animatedStyle}>
      <TouchableOpacity 
        style={styles.optionButton} 
        onPress={onPress}
        activeOpacity={0.8}
      >
        <Text style={styles.optionText}>{label}</Text>
      </TouchableOpacity>
    </Animated.View>
  );
};

export default function OnboardingScreen({ navigation }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const fadeAnim = useRef(new Animated.Value(1)).current;
  
  const totalSteps = 4; // Reduced from 8 to 4
  
  const handleOptionSelect = (answer) => {
    // Fade out animation
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      // Update state
      setAnswers(prev => ({ ...prev, [currentStep]: answer }));
      
      // Move to next question or finish
      if (currentStep < totalSteps - 1) {
        setCurrentStep(currentStep + 1);
        
        // Fade in animation for next question
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }).start();
      } else {
        // Navigate to Finalization screen
        navigation.navigate('Finalization', { answers: { ...answers, [currentStep]: answer } });
      }
    });
  };
  
  // Questions content based on current step
  const renderQuestion = () => {
    switch (currentStep) {
      case 0:
        return (
          <Animated.View style={[styles.questionContainer, { opacity: fadeAnim }]}>
            <Text style={styles.questionTitle}>What's your gender?</Text>
            <Text style={styles.questionSubtitle}>This helps us personalize your skincare routine</Text>
            
            <View style={styles.optionsContainer}>
              <AnimatedOption 
                label="Female" 
                onPress={() => handleOptionSelect('female')} 
                delay={100}
              />
              <AnimatedOption 
                label="Male" 
                onPress={() => handleOptionSelect('male')} 
                delay={200}
              />
              <AnimatedOption 
                label="Other" 
                onPress={() => handleOptionSelect('other')} 
                delay={300}
              />
            </View>
          </Animated.View>
        );
      
      case 1:
        return (
          <Animated.View style={[styles.questionContainer, { opacity: fadeAnim }]}>
            <Text style={styles.questionTitle}>What's your age group?</Text>
            <Text style={styles.questionSubtitle}>Age helps us recommend suitable skincare products</Text>
            
            <View style={styles.optionsContainer}>
              <AnimatedOption 
                label="Under 25" 
                onPress={() => handleOptionSelect('under-25')} 
                delay={100}
              />
              <AnimatedOption 
                label="25-40" 
                onPress={() => handleOptionSelect('25-40')} 
                delay={200}
              />
              <AnimatedOption 
                label="Over 40" 
                onPress={() => handleOptionSelect('over-40')} 
                delay={300}
              />
            </View>
          </Animated.View>
        );

      case 2:
        return (
          <Animated.View style={[styles.questionContainer, { opacity: fadeAnim }]}>
            <Text style={styles.questionTitle}>What are your main skin concerns?</Text>
            <Text style={styles.questionSubtitle}>Select your primary concern</Text>
            
            <View style={styles.optionsContainer}>
              <AnimatedOption 
                label="Acne & Breakouts" 
                onPress={() => handleOptionSelect('acne')} 
                delay={100}
              />
              <AnimatedOption 
                label="Aging & Fine Lines" 
                onPress={() => handleOptionSelect('aging')} 
                delay={200}
              />
              <AnimatedOption 
                label="Dryness & Dullness" 
                onPress={() => handleOptionSelect('dryness')} 
                delay={300}
              />
              <AnimatedOption 
                label="Oiliness & Pores" 
                onPress={() => handleOptionSelect('oiliness')} 
                delay={400}
              />
              <AnimatedOption 
                label="Sensitivity & Redness" 
                onPress={() => handleOptionSelect('sensitivity')} 
                delay={500}
              />
            </View>
          </Animated.View>
        );

      case 3:
        return (
          <Animated.View style={[styles.questionContainer, { opacity: fadeAnim }]}>  
            <Text style={styles.questionTitle}>How much time can you dedicate?</Text>
            <Text style={styles.questionSubtitle}>We'll create a routine that fits your lifestyle</Text>
            
            <View style={styles.optionsContainer}>
              <AnimatedOption 
                label="Minimal (1-2 steps)" 
                onPress={() => handleOptionSelect('minimal')} 
                delay={100} 
              />
              <AnimatedOption 
                label="Basic (3-4 steps)" 
                onPress={() => handleOptionSelect('basic')} 
                delay={200} 
              />
              <AnimatedOption 
                label="Comprehensive (5+ steps)" 
                onPress={() => handleOptionSelect('comprehensive')} 
                delay={300} 
              />
            </View>
          </Animated.View>
        );

      default:
        return (
          <View style={styles.questionContainer}>
            <Text style={styles.questionTitle}>Question {currentStep + 1}</Text>
            <Text style={styles.questionSubtitle}>Coming soon...</Text>
          </View>
        );
    }
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
            {/* Header with progress */}
            <View style={styles.header}>
              <TouchableOpacity 
                style={styles.backButton}
                onPress={() => {
                  if (currentStep > 0) {
                    setCurrentStep(currentStep - 1);
                  } else {
                    navigation.goBack();
                  }
                }}
              >
                <Text style={styles.backButtonText}>Back</Text>
              </TouchableOpacity>
              
              <ProgressBar currentStep={currentStep} totalSteps={totalSteps} />
              
              <TouchableOpacity 
                style={styles.skipButton}
                onPress={() => navigation.reset({ index: 0, routes: [{ name: 'MainApp' }] })}
              >
                <Text style={styles.skipButtonText}>Skip</Text>
              </TouchableOpacity>
            </View>
            
            {/* Question content */}
            {renderQuestion()}
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
    backgroundColor: 'rgba(0, 0, 0, 0.65)', // Darker overlay for more elegance
    paddingHorizontal: 24,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 16,
    marginBottom: 40,
  },
  backButton: {
    padding: 8,
  },
  backButtonText: {
    color: '#FFF3E0',
    fontSize: 16,
    fontWeight: '500',
  },
  skipButton: {
    padding: 8,
  },
  skipButtonText: {
    color: '#FFF3E0',
    fontSize: 16,
    fontWeight: '500',
    opacity: 0.8,
  },
  progressContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 243, 224, 0.3)',
    marginHorizontal: 6, // Increased spacing between dots
  },
  progressDotActive: {
    backgroundColor: '#FFF3E0',
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  questionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 40, // Added bottom padding for better layout
  },
  questionTitle: {
    fontSize: 34, // Increased font size
    fontWeight: '700', // Bolder text
    color: '#FFF3E0',
    marginBottom: 16,
    textAlign: 'center',
    letterSpacing: 0.5, // Added letter spacing for elegance
  },
  questionSubtitle: {
    fontSize: 17, // Increased font size
    color: '#FFF3E0',
    opacity: 0.8,
    marginBottom: 50, // Increased spacing before options
    textAlign: 'center',
    maxWidth: '80%', // Limit width for better readability
  },
  optionsContainer: {
    width: '100%',
    alignItems: 'center',
  },
  optionButton: {
    backgroundColor: 'rgba(168, 106, 72, 0.85)', // More transparent for elegance
    paddingVertical: 18, // Taller buttons
    paddingHorizontal: 32,
    borderRadius: 30,
    marginBottom: 18, // More space between options
    width: width * 0.85, // Wider buttons
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.5,
    elevation: 6,
    borderWidth: 1,
    borderColor: 'rgba(255, 243, 224, 0.2)', // Subtle border for elegance
  },
  optionText: {
    color: '#FFF3E0',
    fontSize: 18,
    fontWeight: '600', // Bolder text
    letterSpacing: 0.3, // Added letter spacing
  },
});