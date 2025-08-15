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
  ScrollView,
  Image
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Ionicons, FontAwesome } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

// Reviews data
const reviews = [
  {
    name: "Emma Johnson",
    age: 28,
    rating: 5,
    comment: "My skin has completely transformed! The personalized routine cleared my acne in just 3 weeks.",
    image: "https://i.postimg.cc/L8zxzbDz/testimonial-1.jpg",
    skinType: "Combination, Acne-Prone"
  },
  {
    name: "Michael Chen",
    age: 32,
    rating: 5,
    comment: "Finally found products that actually work for my sensitive skin. The AI analysis was spot on!",
    image: "https://i.postimg.cc/QdLLHRLY/testimonial-2.jpg",
    skinType: "Sensitive, Dry"
  },
  {
    name: "Sophia Rodriguez",
    age: 25,
    rating: 5,
    comment: "The product scanning feature saved me so much money by avoiding ingredients that trigger my rosacea.",
    image: "https://i.postimg.cc/3JXmPxBB/testimonial-3.jpg",
    skinType: "Rosacea, Sensitive"
  },
  {
    name: "James Wilson",
    age: 35,
    rating: 4,
    comment: "As someone who knew nothing about skincare, this app made it simple to start a proper routine.",
    image: "https://i.postimg.cc/qRHMVJBG/testimonial-4.jpg",
    skinType: "Normal, Aging"
  },
  {
    name: "Olivia Taylor",
    age: 29,
    rating: 5,
    comment: "The progress tracking feature keeps me motivated. My hyperpigmentation is finally fading!",
    image: "https://i.postimg.cc/Vk0Lqy1k/testimonial-5.jpg",
    skinType: "Combination, Hyperpigmentation"
  }
];

// Trust indicators
const trustIndicators = [
  { number: "98%", text: "User Satisfaction" },
  { number: "30K+", text: "Active Users" },
  { number: "4.8", text: "App Store Rating" }
];

export default function ReviewsScreen({ route }) {
  const navigation = useNavigation();
  const { answers } = route.params || {};
  
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  
  // Review card animations
  const reviewAnims = useRef(reviews.map(() => ({
    fade: new Animated.Value(0),
    slide: new Animated.Value(50)
  }))).current;
  
  // Trust indicators animations
  const trustAnims = useRef(trustIndicators.map(() => ({
    fade: new Animated.Value(0),
    scale: new Animated.Value(0.8)
  }))).current;
  
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
    
    // Trust indicators animation (new order, animate first after header)
    trustIndicators.forEach((_, index) => {
      Animated.sequence([
        Animated.delay(500 + index * 150), // Start after header
        Animated.parallel([
          Animated.timing(trustAnims[index].fade, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
          }),
          Animated.timing(trustAnims[index].scale, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
          })
        ])
      ]).start();
    });

    // Staggered animations for review cards (animate after trust indicators)
    reviews.forEach((_, index) => {
      Animated.sequence([
        Animated.delay(500 + trustIndicators.length * 150 + index * 200), // Start after trust indicators
        Animated.parallel([
          Animated.timing(reviewAnims[index].fade, {
            toValue: 1,
            duration: 600,
            useNativeDriver: true,
          }),
          Animated.timing(reviewAnims[index].slide, {
            toValue: 0,
            duration: 600,
            useNativeDriver: true,
          })
        ])
      ]).start();
    });
    
    // Button animation
    Animated.sequence([
      Animated.delay(500 + trustIndicators.length * 150 + reviews.length * 200 + 200),
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
    navigation.navigate('ScanFace', { answers });
  };

  // Function to render stars based on rating
  const renderStars = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <FontAwesome 
          key={i} 
          name={i <= rating ? "star" : "star-o"} 
          size={16} 
          color="#FFD700" 
          style={{ marginRight: 2 }}
        />
      );
    }
    return stars;
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
              <Text style={styles.title}>Real Results</Text>
              <Text style={styles.headline}>Skinmax has helped over 10K+ people get their dream skin</Text>
              <Text style={styles.subtitle}>
                See what our users are saying about Skinmax
              </Text>
            </Animated.View>
            
            <ScrollView 
              style={styles.scrollView}
              contentContainerStyle={styles.scrollContent}
              showsVerticalScrollIndicator={false}
            >
              <View style={styles.trustContainer}>
                {trustIndicators.map((indicator, index) => (
                  <Animated.View 
                    key={index}
                    style={[
                      styles.trustIndicator,
                      {
                        opacity: trustAnims[index].fade,
                        transform: [{ scale: trustAnims[index].scale }]
                      }
                    ]}
                  >
                    <Text style={styles.trustNumber}>{indicator.number}</Text>
                    <Text style={styles.trustText}>{indicator.text}</Text>
                  </Animated.View>
                ))}
              </View>

              {reviews.map((review, index) => (
                <Animated.View 
                  key={index}
                  style={[
                    styles.reviewCard,
                    {
                      opacity: reviewAnims[index].fade,
                      transform: [{ translateY: reviewAnims[index].slide }]
                    }
                  ]}
                >
                  <View style={styles.reviewHeader}>
                    <Image 
                      source={{ uri: review.image }} 
                      style={styles.reviewerImage} 
                    />
                    <View style={styles.reviewerInfo}>
                      <Text style={styles.reviewerName}>{review.name}, {review.age}</Text>
                      <Text style={styles.skinType}>{review.skinType}</Text>
                      <View style={styles.starsContainer}>
                        {renderStars(review.rating)}
                      </View>
                    </View>
                  </View>
                  <Text style={styles.reviewComment}>"{review.comment}"</Text>
                </Animated.View>
              ))}
              
            </ScrollView>
            
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
                <Ionicons name="scan-outline" size={24} color="#FFF3E0" style={{ marginRight: 8 }} />
                <Text style={styles.continueText}>Scan My Face</Text>
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
  headline: {
    fontSize: 18,
    fontWeight: '500',
    color: '#FFF3E0',
    textAlign: 'center',
    marginTop: 10,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#FFF3E0',
    opacity: 0.8,
    textAlign: 'center',
    marginTop: 8,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingVertical: 10,
  },
  reviewCard: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(168, 106, 72, 0.3)',
  },
  reviewHeader: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  reviewerImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 12,
    borderWidth: 2,
    borderColor: '#A86A48',
  },
  reviewerInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  reviewerName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFF3E0',
  },
  skinType: {
    fontSize: 12,
    color: '#FFF3E0',
    opacity: 0.7,
    marginTop: 2,
  },
  starsContainer: {
    flexDirection: 'row',
    marginTop: 4,
  },
  reviewComment: {
    fontSize: 14,
    color: '#FFF3E0',
    fontStyle: 'italic',
    lineHeight: 20,
  },
  trustContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 20,
  },
  trustIndicator: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: 'rgba(168, 106, 72, 0.2)',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 5,
    borderWidth: 1,
    borderColor: 'rgba(168, 106, 72, 0.3)',
  },
  trustNumber: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFF3E0',
  },
  trustText: {
    fontSize: 12,
    color: '#FFF3E0',
    opacity: 0.8,
    textAlign: 'center',
    marginTop: 4,
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