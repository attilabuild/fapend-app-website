// @ts-nocheck
import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  FlatList,
  useWindowDimensions,
  Animated,
  KeyboardAvoidingView,
  Platform,
  Image,
  ImageBackground,
  Text,
  Alert,
  Dimensions,
  Easing,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Title, Subtitle, Body, Caption } from "../components/ui/Typography";
import { Button } from "../components/ui/Button";
import { COLORS, SPACING, RADIUS, FONTS } from "../utils/theme";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation, NavigationProp } from "@react-navigation/native";
import { useAuthStore } from "../hooks/useStore";
import * as AppleAuthentication from "expo-apple-authentication";
import { saveSurveyAnswers, SurveyAnswers } from "../services/api";
import LottieView from "lottie-react-native";
import LottieIcon from "../components/ui/LottieIcon";
import * as StoreReview from "expo-store-review";
import {
  captureEvent,
  captureScreen,
  POST_HOG_EVENTS,
  POST_HOG_SCREENS,
  posthog,
} from "lib/posthog";

// Define the navigation types
type RootStackParamList = {
  PaywallScreen: undefined;
  Register: undefined;
  Main: undefined;
  Login: undefined;
};

interface OnboardingOption {
  id: string;
  text: string;
  icon: keyof typeof Ionicons.glyphMap;
}

// Options for "Why are you here?"
const WHY_OPTIONS: OnboardingOption[] = [
  { id: "addicted", text: "I feel addicted", icon: "bandage" },
  { id: "energy", text: "I want more energy/focus", icon: "flash" },
  { id: "relationships", text: "I want better relationships", icon: "heart" },
  { id: "freedom", text: "I want to be free", icon: "airplane" },
  { id: "custom", text: "Other reason (custom)", icon: "create" },
];

// Options for "What kind of man are you becoming?"
const IDENTITY_OPTIONS: OnboardingOption[] = [
  { id: "creator", text: "A focused creator", icon: "brush" },
  { id: "discipline", text: "A man of discipline", icon: "shield-checkmark" },
  { id: "performer", text: "A high performer", icon: "trending-up" },
  { id: "partner", text: "A present and loving partner", icon: "people" },
];

// Options for "Choose your plan"
const PLAN_OPTIONS: OnboardingOption[] = [
  { id: "7day", text: "7-day clean start", icon: "calendar-outline" },
  { id: "30day", text: "30-day challenge", icon: "calendar" },
  { id: "90day", text: "90-day reboot", icon: "refresh-circle" },
];

// Plan names
const PLAN_NAMES: Record<string, string> = {
  "7day": "Clean Slate",
  "30day": "Iron Will",
  "90day": "Unbreakable 90",
  custom: "Custom Journey",
};

// Testimonials
const TESTIMONIALS = [
  {
    id: "1",
    name: "Michael, 28",
    days: 76,
    quote:
      "After 76 days, my relationships improved and I finally feel present in my own life again. The daily check-ins kept me accountable.",
    improvement: "Productivity & Relationships",
  },
  {
    id: "2",
    name: "James, 34",
    days: 120,
    quote:
      "The first 30 days were the hardest, but now I feel like a completely different person. My energy levels are through the roof!",
    improvement: "Energy & Confidence",
  },
  {
    id: "3",
    name: "David, 25",
    days: 45,
    quote:
      "I failed 5 times before using this app. The personalized approach and community support made all the difference.",
    improvement: "Mental Clarity & Focus",
  },
];

// Success stats
const SUCCESS_STATS = [
  { stat: "87%", description: "Users report increased focus after 30 days" },
  { stat: "92%", description: "Users experience increase in Testosterone" },
  { stat: "3.5x", description: "More likely to success with pureresist" },
];

// Add streak achievements based on the ones in the backend
const STREAK_ACHIEVEMENTS = [
  {
    title: "First Day",
    description:
      "Begin noticing increased energy levels and mental clarity as your body adjusts.",
    days: 1,
    icon: "🌱",
  },
  {
    title: "One Week Strong",
    description:
      "Experience improved focus, reduced brain fog, and better emotional regulation.",
    days: 7,
    icon: "🌟",
  },
  {
    title: "Two Week Warrior",
    description: "New habits begin to solidify, focusing becomes easier.",
    days: 14,
    icon: "⚔️",
  },
  {
    title: "Bronze Medal",
    description:
      "Confidence builds, relationships improve, and your identity begins to transform.",
    days: 30,
    icon: "🥉",
  },
  {
    title: "Silver Medal",
    description:
      "New habits solidify, confidence builds, and relationships improve dramatically.",
    days: 60,
    icon: "🥈",
  },
  {
    title: "Gold Medal",
    description:
      "Complete transformation into the man you're becoming. Your goal achieved.",
    days: 90,
    icon: "🥇",
  },
];

// Use this to represent page numbers for both screen sets
const FEATURE_SCREENS_COUNT = 4; // Updated to include only the first 4 feature screens

// Add the survey questions constants
const PROBLEM_RECOGNITION = [
  "I want to stop watching porn",
  "I want to regain control over my urges",
  "I feel like this habit is ruining parts of my life",
  "I'm just curious, not sure yet",
];

const HABIT_DURATION = [
  "Less than 3 months",
  "3–12 months",
  "1–3 years",
  "Over 3 years",
  "I'm not sure",
];

const EMOTIONAL_CONSEQUENCES = [
  "Low motivation or energy",
  "Brain fog or difficulty focusing",
  "Anxiety or depression",
  "Erectile dysfunction or partner disinterest",
  "Shame or guilt after watching",
  "Lack of purpose or drive in life",
];

const IDENTITY_CONFLICT = [
  "Yes, it makes me feel like a different person",
  "Sometimes I struggle with the conflict",
  "Not really",
];

const LOSS_OF_CONTROL = [
  "Yes, I often binge for hours",
  "Sometimes, it spirals",
  "I usually stop quickly",
  "I don't watch that often",
];

const TRIGGERS = [
  "Stress or boredom",
  "Social media or explicit content",
  "Loneliness",
  "Late nights",
  "Fatigue",
  "I don't know",
];

const FAILED_ATTEMPTS = [
  "Never seriously tried",
  "I tried but relapsed quickly",
  "I've had short streaks but always fall back",
  "I've had long streaks, I want to go even further",
];

const TIME_SPENT = [
  "Less than 1 hour",
  "1–3 hours",
  "3–7 hours",
  "7–14 hours",
  "More than 14 hours",
];

const SUCCESS_VISION = [
  "More energy and clarity",
  "Stronger discipline and confidence",
  "A healthier sex life and real intimacy",
  "Feeling in control and proud of myself",
  "All of the above",
];

const READY_FOR_CHALLENGE = ["Yes, I'm all in", "I'll give it a try"];

const { width: SCREEN_WIDTH } = Dimensions.get("window");

const OnboardingScreen = () => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const { width } = useWindowDimensions();
  const scrollRef = useRef<ScrollView>(null);
  const scrollX = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const { login: authLogin } = useAuthStore();
  const testimonialScrollRef = useRef<ScrollView>(null);
  const [activeTestimonial, setActiveTestimonial] = useState(0);

  // Animation timing configuration
  const ANIMATION_DURATION = 400; // Reduced from 400
  const ANIMATION_DELAY = 200; // Removed delay

  // Trigger fade in animation
  const triggerFadeIn = useCallback(() => {
    fadeAnim.setValue(0);
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: ANIMATION_DURATION,
      easing: Easing.linear, // Changed to linear for smoother fade
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  // Trigger animations when page or survey screen changes
  useEffect(() => {
    triggerFadeIn();
  }, [currentPage, currentSurveyScreen, triggerFadeIn]);

  // Onboarding state
  const [currentPage, setCurrentPage] = useState(0);
  const [selectedWhyOptions, setSelectedWhyOptions] = useState<string[]>([]);
  const [customWhy, setCustomWhy] = useState("");
  const [selectedIdentityOptions, setSelectedIdentityOptions] = useState<
    string[]
  >([]);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [customPlanDays, setCustomPlanDays] = useState("");
  const [checkInTime, setCheckInTime] = useState<"morning" | "evening">(
    "evening",
  );

  // Add testimonials state
  const [activeTestimonialIndex, setActiveTestimonialIndex] = useState(0);

  // Testimonials data
  const testimonials = [
    {
      name: "Michael Johnson",
      avatarColor: "#3D3851",
      isWoman: false,
      quote:
        "Before PureResist, I was trapped in a cycle of addiction for 5 years. After 90 days with the beta, my energy levels increased by 70% and I finally landed my dream job.",
    },
    {
      name: "Richard Chen",
      avatarColor: "#383D5F",
      isWoman: false,
      quote:
        "The beta analytics transformed my approach to recovery. I can actually see how my productivity doubled after 45 days. My relationships improved, and for the first time in years, I feel in control.",
    },
    {
      name: "Emma Davis",
      avatarColor: "#5F386E",
      isWoman: true,
      quote:
        "Testing this app changed my perspective on addiction recovery. With the community support, I maintained a 60-day streak. I've slept better, gained 3 hours of productive time daily.",
    },
    {
      name: "Carlos Ruiz",
      avatarColor: "#386E5F",
      isWoman: false,
      quote:
        "As someone who relapsed 15+ times before, this beta is revolutionary. The accountability features reduced my anxiety by 80% and gave me tools to identify my exact triggers.",
    },
  ];

  // Add survey state
  const [surveyStarted, setSurveyStarted] = useState(false);
  const [selectedProblemRecognition, setSelectedProblemRecognition] = useState<
    string | null
  >(null);
  const [selectedHabitDuration, setSelectedHabitDuration] = useState<
    string | null
  >(null);
  const [selectedEmotionalConsequences, setSelectedEmotionalConsequences] =
    useState<string[]>([]);
  const [selectedIdentityConflict, setSelectedIdentityConflict] = useState<
    string | null
  >(null);
  const [selectedLossOfControl, setSelectedLossOfControl] = useState<
    string | null
  >(null);
  const [selectedTriggers, setSelectedTriggers] = useState<string[]>([]);
  const [selectedFailedAttempts, setSelectedFailedAttempts] = useState<
    string | null
  >(null);
  const [selectedTimeSpent, setSelectedTimeSpent] = useState<string | null>(
    null,
  );
  const [selectedSuccessVision, setSelectedSuccessVision] = useState<
    string | null
  >(null);
  const [selectedReadyForChallenge, setSelectedReadyForChallenge] = useState<
    string | null
  >(null);

  // Survey progress tracking
  const [currentSurveyScreen, setCurrentSurveyScreen] = useState(0);
  const TOTAL_SURVEY_SCREENS = 11; // Intro + 10 question screens

  // Add a new state for tracking if congratulations should be shown
  const [showCongrats, setShowCongrats] = useState(false);

  // Add state for validation error messages
  const [validationError, setValidationError] = useState<string | null>(null);

  // Add testimonials for the paywall
  const paywallTestimonials = [
    {
      text: "After 76 days, my relationships improved and I finally feel present again.",
      author: "Michael, 28",
    },
    {
      text: "This app saved me during my hardest moments.",
      author: "Marcus, 23",
    },
    {
      text: "The first 30 days were hard, but now my energy levels are through the roof!",
      author: "James, 34",
    },
  ];

  // Functions for testimonial navigation
  const goToNextTestimonial = () => {
    setActiveTestimonialIndex((prev) =>
      prev === testimonials.length - 1 ? 0 : prev + 1,
    );
  };

  const goToPrevTestimonial = () => {
    setActiveTestimonialIndex((prev) =>
      prev === 0 ? testimonials.length - 1 : prev - 1,
    );
  };

  // Function to handle navigation to Login screen
  const handleLogin = async () => {
    try {
      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
      });

      // Store the Apple credentials temporarily
      await AsyncStorage.setItem(
        "apple_credentials",
        JSON.stringify(credential),
      );

      // For development, proceed directly with login
      const success = await authLogin(credential.user, credential.user);
      if (success) {
        navigation.navigate("Main", { screen: "Home" });
      } else {
        Alert.alert(
          "Error",
          "Failed to sign in with Apple. Please try again.",
          [
            {
              text: "OK",
              onPress: () => {
                // Go back to onboarding
                setCurrentPage(0);
                scrollRef.current?.scrollTo({ x: 0, animated: true });
              },
            },
          ],
        );
      }
    } catch (e: any) {
      if (e.code === "ERR_REQUEST_CANCELED") {
        // User canceled the sign-in flow

      } else {
        // Handle other errors
        console.error("Apple sign in error:", e);
        Alert.alert(
          "Error",
          "There was a problem signing in with Apple. Please try again.",
          [
            {
              text: "OK",
              onPress: () => {
                // Go back to onboarding
                setCurrentPage(0);
                scrollRef.current?.scrollTo({ x: 0, animated: true });
              },
            },
          ],
        );
      }
    }
  };

  // Function to handle page changes
  const goToNextPage = () => {
    // For the first 4 screens (feature showcase), just move to next screen without validation
    if (currentPage < FEATURE_SCREENS_COUNT - 1) {
      const nextPage = currentPage + 1;
      setCurrentPage(nextPage);
      scrollRef.current?.scrollTo({ x: nextPage * width, animated: true });
      return;
    }

    // For the last feature screen, proceed to the survey
    if (currentPage === FEATURE_SCREENS_COUNT - 1) {
      setSurveyStarted(true);
      return;
    }

    // After the feature screens, validate current page before proceeding
    if (!canProceedFromCurrentPage()) {
      // Show appropriate validation error
      switch (currentPage) {
        case FEATURE_SCREENS_COUNT + 0: // Why screen
          setValidationError(
            "Please select at least one reason why you're here",
          );
          if (selectedWhyOptions.includes("custom") && !customWhy.trim()) {
            setValidationError("Please enter your custom reason");
          }
          break;
        case FEATURE_SCREENS_COUNT + 1: // Identity screen
          setValidationError("Please select at least one identity option");
          break;
        case FEATURE_SCREENS_COUNT + 2: // Plan screen
          setValidationError("Please select a plan");
          if (
            selectedPlan === "custom" &&
            (!customPlanDays || parseInt(customPlanDays, 10) < 1)
          ) {
            setValidationError(
              "Please enter a valid number of days for your custom plan",
            );
          }
          break;
        default:
          setValidationError("Please complete this step before continuing");
      }
      return;
    }

    // Clear any validation errors when successfully proceeding
    setValidationError(null);

    const nextPage = currentPage + 1;
    setCurrentPage(nextPage);
    scrollRef.current?.scrollTo({ x: nextPage * width, animated: true });
  };

  const goToPrevPage = () => {
    // Clear any validation errors when going back
    setValidationError(null);

    if (currentPage === 0) return;
    const prevPage = currentPage - 1;
    setCurrentPage(prevPage);
    scrollRef.current?.scrollTo({ x: prevPage * width, animated: true });
  };

  // New function to validate if user can proceed from current page
  const canProceedFromCurrentPage = () => {
    switch (currentPage) {
      case FEATURE_SCREENS_COUNT + 0: // Why screen
        return (
          selectedWhyOptions.length > 0 &&
          (!selectedWhyOptions.includes("custom") ||
            (selectedWhyOptions.includes("custom") && customWhy.trim() !== ""))
        );
      case FEATURE_SCREENS_COUNT + 1: // Identity screen
        return selectedIdentityOptions.length > 0;
      case FEATURE_SCREENS_COUNT + 2: // Plan screen
        return (
          !!selectedPlan &&
          (selectedPlan !== "custom" ||
            (selectedPlan === "custom" &&
              customPlanDays &&
              parseInt(customPlanDays, 10) > 0))
        );
      case FEATURE_SCREENS_COUNT + 3: // Visualization screen
      case FEATURE_SCREENS_COUNT + 4: // Testimonials screen
        return true; // These are informational screens
      default:
        return true;
    }
  };

  // Handle completion of onboarding
  const completeOnboarding = async () => {
    try {
      // Save onboarding data to AsyncStorage
      const onboardingData = {
        whyOptions: selectedWhyOptions.includes("custom")
          ? [
              ...selectedWhyOptions
                .filter((id) => id !== "custom")
                .map((id) => WHY_OPTIONS.find((o) => o.id === id)?.text),
              customWhy,
            ]
          : selectedWhyOptions.map(
              (id) => WHY_OPTIONS.find((o) => o.id === id)?.text,
            ),
        identityOptions: selectedIdentityOptions.map(
          (id) => IDENTITY_OPTIONS.find((o) => o.id === id)?.text,
        ),
        planOption:
          selectedPlan === "custom"
            ? parseInt(customPlanDays, 10)
            : selectedPlan === "7day"
              ? 7
              : selectedPlan === "30day"
                ? 30
                : 90,
        planName: PLAN_NAMES[selectedPlan || "30day"],
        checkInTime,
        onboardingCompleted: true,
        onboardingTimestamp: new Date().toISOString(),
      };

      await AsyncStorage.setItem(
        "onboarding_data",
        JSON.stringify(onboardingData),
      );

      // Just navigate directly to Register instead of Login
      navigation.navigate("Register");
    } catch (error) {
      console.error("Error saving onboarding data:", error);
    }
  };

  // Handle toggling multiple selections
  const toggleWhyOption = (optionId: string) => {
    setSelectedWhyOptions((prev) => {
      if (prev.includes(optionId)) {
        return prev.filter((id) => id !== optionId);
      } else {
        return [...prev, optionId];
      }
    });
  };

  const toggleIdentityOption = (optionId: string) => {
    setSelectedIdentityOptions((prev) => {
      if (prev.includes(optionId)) {
        return prev.filter((id) => id !== optionId);
      } else {
        return [...prev, optionId];
      }
    });
  };

  // Update the startTrial function to use navigation instead of showing congratulations
  const startTrial = async () => {
    try {
      // Save onboarding data
      const onboardingData = {
        whyOptions: selectedWhyOptions.includes("custom")
          ? [
              ...selectedWhyOptions
                .filter((id) => id !== "custom")
                .map((id) => WHY_OPTIONS.find((o) => o.id === id)?.text),
              customWhy,
            ]
          : selectedWhyOptions.map(
              (id) => WHY_OPTIONS.find((o) => o.id === id)?.text,
            ),
        identityOptions: selectedIdentityOptions.map(
          (id) => IDENTITY_OPTIONS.find((o) => o.id === id)?.text,
        ),
        planOption:
          selectedPlan === "custom"
            ? parseInt(customPlanDays, 10)
            : selectedPlan === "7day"
              ? 7
              : selectedPlan === "30day"
                ? 30
                : 90,
        planName: PLAN_NAMES[selectedPlan || "30day"],
        checkInTime,
        onboardingCompleted: true,
        onboardingTimestamp: new Date().toISOString(),
      };

      await AsyncStorage.setItem(
        "onboarding_data",
        JSON.stringify(onboardingData),
      );

      // Navigate to paywall instead of main app
      navigation.replace("PaywallScreen");
    } catch (error) {
      console.error("Error saving onboarding data:", error);
    }
  };

  // Add functions to handle survey navigation
  const startSurvey = () => {
    setSurveyStarted(true);
    setCurrentSurveyScreen(1); // Move to the first question
  };

  const nextSurveyScreen = () => {
    if (currentSurveyScreen < TOTAL_SURVEY_SCREENS - 1) {
      setCurrentSurveyScreen(currentSurveyScreen + 1);
    } else {
      // When survey is complete
      (async () => {
        try {
          // Save survey data first
          await saveSurveyData();

          // Then exit survey mode and navigate based on subscription status
          setSurveyStarted(false);
          
          // Check if user is subscribed
          const { user } = useAuthStore.getState();
          if (user?.isSubscribed) {
            navigation.navigate("Main"); // Go to main if subscribed
          } else {
            navigation.replace("PaywallScreen"); // Go to paywall if not subscribed
          }
        } catch (error) {
          console.error("Error saving survey data at completion:", error);

          // Navigate anyway in case of error - check subscription status
          setSurveyStarted(false);
          const { user } = useAuthStore.getState();
          if (user?.isSubscribed) {
            navigation.navigate("Main"); // Go to main if subscribed
          } else {
            navigation.replace("PaywallScreen"); // Go to paywall if not subscribed
          }
        }
      })();
    }
  };

  const prevSurveyScreen = () => {
    if (currentSurveyScreen > 1) {
      setCurrentSurveyScreen(currentSurveyScreen - 1);
    } else {
      setSurveyStarted(false);
    }
  };

  // Function to save survey answers to database
  const saveSurveyData = async () => {
    try {
      // Get user ID from auth store or generate a temporary ID
      const { user } = useAuthStore.getState();
      const userId = user?._id || `temp_${new Date().getTime()}`;

      // Collect all survey answers
      const surveyData: SurveyAnswers = {
        problemRecognition: selectedProblemRecognition,
        habitDuration: selectedHabitDuration,
        emotionalConsequences: selectedEmotionalConsequences,
        identityConflict: selectedIdentityConflict,
        lossOfControl: selectedLossOfControl,
        triggers: selectedTriggers,
        failedAttempts: selectedFailedAttempts,
        timeSpent: selectedTimeSpent,
        successVision: selectedSuccessVision,
        readyForChallenge: selectedReadyForChallenge,
        completedAt: new Date().toISOString(),
      };

      // Save to database (or AsyncStorage if API not available)
      const result = await saveSurveyAnswers(userId, surveyData);

      // Also save locally to ensure we have a copy
      await AsyncStorage.setItem("survey_answers", JSON.stringify(surveyData));

      return true;
    } catch (error) {
      console.error("Error saving survey data:", error);

      // Try to save to AsyncStorage as a fallback
      try {
        const surveyData = {
          problemRecognition: selectedProblemRecognition,
          habitDuration: selectedHabitDuration,
          emotionalConsequences: selectedEmotionalConsequences,
          identityConflict: selectedIdentityConflict,
          lossOfControl: selectedLossOfControl,
          triggers: selectedTriggers,
          failedAttempts: selectedFailedAttempts,
          timeSpent: selectedTimeSpent,
          successVision: selectedSuccessVision,
          readyForChallenge: selectedReadyForChallenge,
          savedAt: new Date().toISOString(),
          savedLocally: true,
        };
        await AsyncStorage.setItem(
          "survey_answers_local",
          JSON.stringify(surveyData),
        );
        return true;
      } catch (storageError) {
        console.error("Failed to save survey data locally:", storageError);
        return false;
      }
    }
  };

  // Toggle functions for multi-select survey options
  const toggleEmotionalConsequence = (option: string) => {
    setSelectedEmotionalConsequences((prev) => {
      if (prev.includes(option)) {
        return prev.filter((item) => item !== option);
      } else {
        return [...prev, option];
      }
    });
  };

  const toggleTrigger = (option: string) => {
    setSelectedTriggers((prev) => {
      if (prev.includes(option)) {
        return prev.filter((item) => item !== option);
      } else {
        return [...prev, option];
      }
    });
  };

  // Add animation values for survey elements
  const fadeInDelay = 200;

  // Function to trigger fade in animation
  const triggerFadeInSurvey = useCallback(() => {
    if (surveyStarted) {
      triggerFadeIn();
    }
  }, [surveyStarted, triggerFadeIn]);

  // Trigger fade in when survey screen changes
  useEffect(() => {
    triggerFadeInSurvey();
  }, [currentSurveyScreen, triggerFadeInSurvey]);

  // Update the AnimatedSurveyContent component to use only fade
  const AnimatedSurveyContent = ({ children, nextButton = null }) => (
    <Animated.View
      style={[
        styles.surveyContent,
        {
          opacity: fadeAnim
        },
      ]}
    >
      <View style={styles.surveyQuestionsContainer}>{children}</View>
      {nextButton && (
        <View style={styles.nextButtonContainer}>{nextButton}</View>
      )}
    </Animated.View>
  );

  // Survey Question 1: Problem Recognition
  const renderProblemRecognition = () => {
    return (
      <View style={styles.surveyContainer}>
        <View style={styles.surveyHeader}>
          <TouchableOpacity
            style={styles.surveyBackButton}
            onPress={prevSurveyScreen}
          >
            <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>

          <View style={styles.surveyProgress}>
            <View
              style={[
                styles.surveyProgressBar,
                {
                  width: `${(currentSurveyScreen / (TOTAL_SURVEY_SCREENS - 1)) * 100}%`,
                },
              ]}
            />
          </View>
        </View>

        <AnimatedSurveyContent nextButton={null}>
          <Text style={styles.surveyQuestionTitle}>
            What brings you to the app?
          </Text>

          {PROBLEM_RECOGNITION.map((option, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.surveyOptionButton,
                selectedProblemRecognition === option &&
                  styles.surveyOptionButtonSelected,
              ]}
              onPress={() => {
                captureEvent(POST_HOG_EVENTS.SURVEY_PROBLEM_RECOGNITION, {
                  answer: option,
                });
                setSelectedProblemRecognition(option);
                setTimeout(nextSurveyScreen, 500);
              }}
            >
              <Text
                style={[
                  styles.surveyOptionText,
                  selectedProblemRecognition === option &&
                    styles.surveyOptionTextSelected,
                ]}
              >
                {option}
              </Text>
            </TouchableOpacity>
          ))}
        </AnimatedSurveyContent>
      </View>
    );
  };

  // Survey Question 2: Habit Duration
  const renderHabitDuration = () => {
    return (
      <View style={styles.surveyContainer}>
        <View style={styles.surveyHeader}>
          <TouchableOpacity
            style={styles.surveyBackButton}
            onPress={prevSurveyScreen}
          >
            <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>

          <View style={styles.surveyProgress}>
            <View
              style={[
                styles.surveyProgressBar,
                {
                  width: `${(currentSurveyScreen / (TOTAL_SURVEY_SCREENS - 1)) * 100}%`,
                },
              ]}
            />
          </View>
        </View>

        <AnimatedSurveyContent nextButton={null}>
          <Text style={styles.surveyQuestionTitle}>
            How long have you struggled with porn or compulsive masturbation?
          </Text>

          {HABIT_DURATION.map((option, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.surveyOptionButton,
                selectedHabitDuration === option &&
                  styles.surveyOptionButtonSelected,
              ]}
              onPress={() => {
                captureEvent(POST_HOG_EVENTS.SURVEY_HABIT_DURATION, {
                  answer: option,
                });
                setSelectedHabitDuration(option);
                setTimeout(nextSurveyScreen, 500);
              }}
            >
              <Text
                style={[
                  styles.surveyOptionText,
                  selectedHabitDuration === option &&
                    styles.surveyOptionTextSelected,
                ]}
              >
                {option}
              </Text>
            </TouchableOpacity>
          ))}
        </AnimatedSurveyContent>
      </View>
    );
  };

  // Survey Question 3: Emotional Consequences
  const renderEmotionalConsequences = () => {
    const nextButton = (
      <TouchableOpacity
        style={[
          styles.surveyNextButton,
          selectedEmotionalConsequences.length === 0 &&
            styles.surveyNextButtonDisabled,
        ]}
        onPress={() => {
          if (selectedEmotionalConsequences.length > 0) {
            captureEvent(POST_HOG_EVENTS.SURVEY_EMOTIONAL_CONSEQUENCES, {
              answer: selectedEmotionalConsequences,
            });
            setTimeout(nextSurveyScreen, 500);
          }
        }}
        disabled={selectedEmotionalConsequences.length === 0}
      >
        <Text style={styles.surveyNextButtonText}>Continue</Text>
      </TouchableOpacity>
    );

    return (
      <View style={styles.surveyContainer}>
        <View style={styles.surveyHeader}>
          <TouchableOpacity
            style={styles.surveyBackButton}
            onPress={prevSurveyScreen}
          >
            <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>

          <View style={styles.surveyProgress}>
            <View
              style={[
                styles.surveyProgressBar,
                {
                  width: `${(currentSurveyScreen / (TOTAL_SURVEY_SCREENS - 1)) * 100}%`,
                },
              ]}
            />
          </View>
        </View>

        <AnimatedSurveyContent nextButton={nextButton}>
          <Text style={styles.surveyQuestionTitle}>
            Which of these have you experienced because of this habit?
          </Text>
          <Text style={styles.surveySubtitle}>(Select all that apply)</Text>

          {EMOTIONAL_CONSEQUENCES.map((option, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.surveyOptionButton,
                selectedEmotionalConsequences.includes(option) &&
                  styles.surveyOptionButtonSelected,
              ]}
              onPress={() => {
                toggleEmotionalConsequence(option);
              }}
            >
              <Text
                style={[
                  styles.surveyOptionText,
                  selectedEmotionalConsequences.includes(option) &&
                    styles.surveyOptionTextSelected,
                ]}
              >
                {option}
              </Text>
            </TouchableOpacity>
          ))}
        </AnimatedSurveyContent>
      </View>
    );
  };

  // Survey Question 4: Identity Conflict
  const renderIdentityConflict = () => {
    return (
      <View style={styles.surveyContainer}>
        <View style={styles.surveyHeader}>
          <TouchableOpacity
            style={styles.surveyBackButton}
            onPress={prevSurveyScreen}
          >
            <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>

          <View style={styles.surveyProgress}>
            <View
              style={[
                styles.surveyProgressBar,
                {
                  width: `${(currentSurveyScreen / (TOTAL_SURVEY_SCREENS - 1)) * 100}%`,
                },
              ]}
            />
          </View>
        </View>

        <AnimatedSurveyContent nextButton={null}>
          <Text style={styles.surveyQuestionTitle}>
            Do you ever feel like this habit doesn't align with the kind of
            person you want to be?
          </Text>

          {IDENTITY_CONFLICT.map((option, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.surveyOptionButton,
                selectedIdentityConflict === option &&
                  styles.surveyOptionButtonSelected,
              ]}
              onPress={() => {
                captureEvent(POST_HOG_EVENTS.SURVEY_IDENTITY_CONFLICT, {
                  answer: option,
                });
                setSelectedIdentityConflict(option);
                setTimeout(nextSurveyScreen, 500);
              }}
            >
              <Text
                style={[
                  styles.surveyOptionText,
                  selectedIdentityConflict === option &&
                    styles.surveyOptionTextSelected,
                ]}
              >
                {option}
              </Text>
            </TouchableOpacity>
          ))}
        </AnimatedSurveyContent>
      </View>
    );
  };

  // Survey Question 5: Loss of Control
  const renderActualLossOfControl = () => {
    return (
      <View style={styles.surveyContainer}>
        <View style={styles.surveyHeader}>
          <TouchableOpacity
            style={styles.surveyBackButton}
            onPress={prevSurveyScreen}
          >
            <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>

          <View style={styles.surveyProgress}>
            <View
              style={[
                styles.surveyProgressBar,
                {
                  width: `${(currentSurveyScreen / (TOTAL_SURVEY_SCREENS - 1)) * 100}%`,
                },
              ]}
            />
          </View>
        </View>

        <AnimatedSurveyContent nextButton={null}>
          <Text style={styles.surveyQuestionTitle}>
            Do you find it hard to stop once you start watching?
          </Text>

          {LOSS_OF_CONTROL.map((option, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.surveyOptionButton,
                selectedLossOfControl === option &&
                  styles.surveyOptionButtonSelected,
              ]}
              onPress={() => {
                captureEvent(POST_HOG_EVENTS.SURVEY_ACTUAL_LOSS_OF_CONTROL, {
                  answer: option,
                });
                setSelectedLossOfControl(option);
                setTimeout(nextSurveyScreen, 500);
              }}
            >
              <Text
                style={[
                  styles.surveyOptionText,
                  selectedLossOfControl === option &&
                    styles.surveyOptionTextSelected,
                ]}
              >
                {option}
              </Text>
            </TouchableOpacity>
          ))}
        </AnimatedSurveyContent>
      </View>
    );
  };

  // Survey Question 6: Triggers
  const renderTriggers = () => {
    const nextButton = (
      <TouchableOpacity
        style={[
          styles.surveyNextButton,
          selectedTriggers.length === 0 && styles.surveyNextButtonDisabled,
        ]}
        onPress={() => {
          if (selectedTriggers.length > 0) {
            captureEvent(POST_HOG_EVENTS.SURVEY_TRIGGERS, {
              answer: selectedTriggers,
            });
            setTimeout(nextSurveyScreen, 500);
          }
        }}
        disabled={selectedTriggers.length === 0}
      >
        <Text style={styles.surveyNextButtonText}>Continue</Text>
      </TouchableOpacity>
    );

    return (
      <View style={styles.surveyContainer}>
        <View style={styles.surveyHeader}>
          <TouchableOpacity
            style={styles.surveyBackButton}
            onPress={prevSurveyScreen}
          >
            <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>

          <View style={styles.surveyProgress}>
            <View
              style={[
                styles.surveyProgressBar,
                {
                  width: `${(currentSurveyScreen / (TOTAL_SURVEY_SCREENS - 1)) * 100}%`,
                },
              ]}
            />
          </View>
        </View>

        <Animated.View
          style={[
            styles.triggersSurveyContent,
            {
              opacity: fadeAnim
            },
          ]}
        >
          <Text style={styles.surveyQuestionTitle}>
            What usually triggers your urges?
          </Text>
          <Text style={styles.surveySubtitle}>(Select all that apply)</Text>

          <View style={styles.triggersOptionsContainer}>
            {TRIGGERS.map((option, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.surveyOptionButton,
                  selectedTriggers.includes(option) &&
                    styles.surveyOptionButtonSelected,
                ]}
                onPress={() => toggleTrigger(option)}
              >
                <Text
                  style={[
                    styles.surveyOptionText,
                    selectedTriggers.includes(option) &&
                      styles.surveyOptionTextSelected,
                  ]}
                >
                  {option}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.triggersContinueButtonContainer}>
            {nextButton}
          </View>
        </Animated.View>
      </View>
    );
  };

  // Survey Question 7: Failed Attempts
  const renderFailedAttempts = () => {
    return (
      <View style={styles.surveyContainer}>
        <View style={styles.surveyHeader}>
          <TouchableOpacity
            style={styles.surveyBackButton}
            onPress={prevSurveyScreen}
          >
            <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>

          <View style={styles.surveyProgress}>
            <View
              style={[
                styles.surveyProgressBar,
                {
                  width: `${(currentSurveyScreen / (TOTAL_SURVEY_SCREENS - 1)) * 100}%`,
                },
              ]}
            />
          </View>
        </View>

        <AnimatedSurveyContent nextButton={null}>
          <Text style={styles.surveyQuestionTitle}>
            Have you ever tried to quit before?
          </Text>

          {FAILED_ATTEMPTS.map((option, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.surveyOptionButton,
                selectedFailedAttempts === option &&
                  styles.surveyOptionButtonSelected,
              ]}
              onPress={() => {
                captureEvent(POST_HOG_EVENTS.SURVEY_FAILED_ATTEMPTS, {
                  answer: option,
                });
                setSelectedFailedAttempts(option);
                setTimeout(nextSurveyScreen, 500);
              }}
            >
              <Text
                style={[
                  styles.surveyOptionText,
                  selectedFailedAttempts === option &&
                    styles.surveyOptionTextSelected,
                ]}
              >
                {option}
              </Text>
            </TouchableOpacity>
          ))}
        </AnimatedSurveyContent>
      </View>
    );
  };

  // Survey Question 8: Time Spent
  const renderTimeSpent = () => {
    return (
      <View style={styles.surveyContainer}>
        <View style={styles.surveyHeader}>
          <TouchableOpacity
            style={styles.surveyBackButton}
            onPress={prevSurveyScreen}
          >
            <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>

          <View style={styles.surveyProgress}>
            <View
              style={[
                styles.surveyProgressBar,
                {
                  width: `${(currentSurveyScreen / (TOTAL_SURVEY_SCREENS - 1)) * 100}%`,
                },
              ]}
            />
          </View>
        </View>

        <AnimatedSurveyContent nextButton={null}>
          <Text style={styles.surveyQuestionTitle}>
            On average, how much time do you spend each week on this habit?
          </Text>

          {TIME_SPENT.map((option, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.surveyOptionButton,
                selectedTimeSpent === option &&
                  styles.surveyOptionButtonSelected,
              ]}
              onPress={() => {
                captureEvent(POST_HOG_EVENTS.SURVEY_TIME_SPENT, {
                  answer: option,
                });
                setSelectedTimeSpent(option);
                setTimeout(nextSurveyScreen, 500);
              }}
            >
              <Text
                style={[
                  styles.surveyOptionText,
                  selectedTimeSpent === option &&
                    styles.surveyOptionTextSelected,
                ]}
              >
                {option}
              </Text>
            </TouchableOpacity>
          ))}
        </AnimatedSurveyContent>
      </View>
    );
  };

  // Survey Question 9: Success Vision
  const renderSuccessVision = () => {
    return (
      <View style={styles.surveyContainer}>
        <View style={styles.surveyHeader}>
          <TouchableOpacity
            style={styles.surveyBackButton}
            onPress={prevSurveyScreen}
          >
            <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>

          <View style={styles.surveyProgress}>
            <View
              style={[
                styles.surveyProgressBar,
                {
                  width: `${(currentSurveyScreen / (TOTAL_SURVEY_SCREENS - 1)) * 100}%`,
                },
              ]}
            />
          </View>
        </View>

        <AnimatedSurveyContent nextButton={null}>
          <Text style={styles.surveyQuestionTitle}>
            Imagine your life 90 days from now. What would success look like?
          </Text>

          {SUCCESS_VISION.map((option, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.surveyOptionButton,
                selectedSuccessVision === option &&
                  styles.surveyOptionButtonSelected,
              ]}
              onPress={() => {
                captureEvent(POST_HOG_EVENTS.SURVEY_SUCCESS_VISION, {
                  answer: option,
                });
                setSelectedSuccessVision(option);
                setTimeout(nextSurveyScreen, 500);
              }}
            >
              <Text
                style={[
                  styles.surveyOptionText,
                  selectedSuccessVision === option &&
                    styles.surveyOptionTextSelected,
                ]}
              >
                {option}
              </Text>
            </TouchableOpacity>
          ))}
        </AnimatedSurveyContent>
      </View>
    );
  };

  // Survey Question 10: Ready for Challenge
  const renderReadyForChallenge = () => {
    return (
      <View style={styles.surveyContainer}>
        <View style={styles.surveyHeader}>
          <TouchableOpacity
            style={styles.surveyBackButton}
            onPress={prevSurveyScreen}
          >
            <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>

          <View style={styles.surveyProgress}>
            <View
              style={[
                styles.surveyProgressBar,
                {
                  width: `${(currentSurveyScreen / (TOTAL_SURVEY_SCREENS - 1)) * 100}%`,
                },
              ]}
            />
          </View>
        </View>

        <AnimatedSurveyContent nextButton={null}>
          <Text style={styles.surveyQuestionTitle}>
            Are you ready to take on the challenge and become the strongest
            version of yourself?
          </Text>

          {READY_FOR_CHALLENGE.map((option, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.surveyOptionButton,
                selectedReadyForChallenge === option &&
                  styles.surveyOptionButtonSelected,
              ]}
              onPress={() => {
                setSelectedReadyForChallenge(option);
                setTimeout(async () => {
                  try {
                    captureEvent(POST_HOG_EVENTS.SURVEY_READY_FOR_CHALLENGE, {
                      answer: option,
                    });
                    await saveSurveyData();
                    setSurveyStarted(false);
                    
                    // Check if user is subscribed
                    const { user } = useAuthStore.getState();
                    if (user?.isSubscribed) {
                      navigation.navigate("Main"); // Go to main if subscribed
                    } else {
                      navigation.replace("PaywallScreen"); // Go to paywall if not subscribed
                    }
                  } catch (error) {
                    console.error("Error saving survey data:", error);
                    setSurveyStarted(false);
                    
                    // Check subscription status even on error
                    const { user } = useAuthStore.getState();
                    if (user?.isSubscribed) {
                      navigation.navigate("Main"); // Go to main if subscribed
                    } else {
                      navigation.replace("PaywallScreen"); // Go to paywall if not subscribed
                    }
                  }
                }, 500);
              }}
            >
              <Text
                style={[
                  styles.surveyOptionText,
                  selectedReadyForChallenge === option &&
                    styles.surveyOptionTextSelected,
                ]}
              >
                {option}
              </Text>
            </TouchableOpacity>
          ))}
        </AnimatedSurveyContent>
      </View>
    );
  };

  // Survey introduction screen
  const renderLossOfControl = () => {
    return (
      <View style={styles.surveyContainer}>
        <View style={styles.surveyHeader}>
          <TouchableOpacity
            style={styles.surveyBackButton}
            onPress={() => {
              setSurveyStarted(false);
              setCurrentPage(currentPage);
            }}
          >
            <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>

          <View style={styles.surveyProgress}>
            <View
              style={[
                styles.surveyProgressBar,
                {
                  width: "0%",
                },
              ]}
            />
          </View>
        </View>

        <View style={styles.surveyIntroContent}>
          <View style={styles.surveyIconContainer}>
            <View style={styles.surveyCircleBackground}>
              <Ionicons
                name="document-text-outline"
                size={40}
                color="#2979FF"
              />
            </View>
          </View>

          <Text style={styles.surveyTitle}>Take the Survey</Text>
          <Text style={styles.surveyDescription}>
            Help us understand your journey better. This quick survey will help
            us personalize your experience and provide the most relevant
            support.
          </Text>

          <View style={styles.surveyBenefits}>
            <View style={styles.benefitItem}>
              <Ionicons name="checkmark-circle" size={24} color="#2979FF" />
              <Text style={styles.benefitText}>Personalized recovery plan</Text>
            </View>
            <View style={styles.benefitItem}>
              <Ionicons name="checkmark-circle" size={24} color="#2979FF" />
              <Text style={styles.benefitText}>
                Tailored content and exercises
              </Text>
            </View>
            <View style={styles.benefitItem}>
              <Ionicons name="checkmark-circle" size={24} color="#2979FF" />
              <Text style={styles.benefitText}>Better progress tracking</Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.startSurveyButton}
            onPress={() => setCurrentSurveyScreen(1)}
          >
            <Text style={styles.startSurveyButtonText}>Start Survey</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  // Render methods for feature showcase screens
  const renderStreakTrackerScreen = () => {
    return (
      <View style={{ width }}>
        <Animated.View
          style={[
            styles.featureContent,
            {
              opacity: fadeAnim
            },
          ]}
        >
          <View style={styles.featureImageContainer}>
            <LottieIcon
              source={require("../assets/calendar.json")}
              size={200}
            />
          </View>

          <View>
            <Text style={styles.featureTitleText}>Streak Tracker</Text>
            <Text style={styles.featureDescriptionText}>
              Track your progress with our advanced streak counter. Set goals,
              earn badges, and visualize your journey to freedom.
            </Text>
          </View>

          <View>
            <View style={styles.dotContainer}>
              {[0, 1, 2, 3].map((dot) => (
                <View
                  key={dot}
                  style={[styles.dot, currentPage === dot && styles.activeDot]}
                />
              ))}
            </View>

            <TouchableOpacity
              style={styles.blueNextButton}
              onPress={goToNextPage}
            >
              <Text style={styles.blueNextButtonText}>Next</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </View>
    );
  };

  const renderCommunityScreen = () => {
    return (
      <View style={{ width }}>
        <Animated.View
          style={[
            styles.featureContent,
            {
              opacity: fadeAnim
            },
          ]}
        >
          <View style={styles.featureImageContainer}>
            <LottieIcon
              source={require("../assets/community.json")}
              size={200}
            />
          </View>

          <View>
            <Text style={styles.featureTitleText}>Online Community</Text>
            <Text style={styles.featureDescriptionText}>
              Connect with like-minded individuals on the same journey. Share
              experiences, get support, and help others along the way.
            </Text>
          </View>

          <View>
            <View style={styles.dotContainer}>
              {[0, 1, 2, 3].map((dot) => (
                <View
                  key={dot}
                  style={[styles.dot, currentPage === dot && styles.activeDot]}
                />
              ))}
            </View>

            <TouchableOpacity
              style={styles.blueNextButton}
              onPress={goToNextPage}
            >
              <Text style={styles.blueNextButtonText}>Next</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </View>
    );
  };

  const renderMeditationScreen = () => {
    return (
      <View style={{ width }}>
        <Animated.View
          style={[
            styles.featureContent,
            {
              opacity: fadeAnim
            },
          ]}
        >
          <View style={styles.featureImageContainer}>
            <LottieIcon
              source={require("../assets/meditation.json")}
              size={200}
            />
          </View>

          <View>
            <Text style={styles.featureTitleText}>Meditation Exercise</Text>
            <Text style={styles.featureDescriptionText}>
              Calm your mind and regain control with guided meditation exercises
              designed to help you overcome urges and build mental strength.
            </Text>
          </View>

          <View>
            <View style={styles.dotContainer}>
              {[0, 1, 2, 3].map((dot) => (
                <View
                  key={dot}
                  style={[styles.dot, currentPage === dot && styles.activeDot]}
                />
              ))}
            </View>

            <TouchableOpacity
              style={styles.blueNextButton}
              onPress={goToNextPage}
            >
              <Text style={styles.blueNextButtonText}>Next</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </View>
    );
  };

  const renderReviewScreen = () => {
    const handleReviewAndNext = async () => {
      // Request store review
      if (await StoreReview.isAvailableAsync()) {
        await StoreReview.requestReview();
      }
      // Continue to next screen regardless of review
      goToNextPage();
    };

    return (
      <View style={{ width }}>
        <View style={styles.featureContent}>
          <View style={styles.featureImageContainer}>
            <LottieIcon source={require("../assets/healthy.json")} size={240} />
          </View>

          <View>
            <Text style={styles.featureTitleText}>
              Help Us Make the World Healthier
            </Text>
            <Text style={styles.featureDescriptionText}>
              Your app store review helps spread the word and grow the
              PureResist community!
            </Text>
          </View>

          <View>
            <View style={styles.dotContainer}>
              {[0, 1, 2, 3].map((dot) => (
                <View
                  key={dot}
                  style={[styles.dot, currentPage === dot && styles.activeDot]}
                />
              ))}
            </View>

            <TouchableOpacity
              style={styles.blueNextButton}
              onPress={handleReviewAndNext}
            >
              <Text style={styles.blueNextButtonText}>Next</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  const renderCommunityCares = () => {
    return (
      <View style={{ width }}>
        <View style={styles.featureContent}>
          <View style={styles.featureImageContainer}>
            <LottieIcon
              source={require("../assets/community.json")}
              size={240}
            />
          </View>

          <View style={styles.testimonialsMainContent}>
            <Text style={styles.featureTitleText}>Success Stories</Text>
            <View style={styles.testimonialMinimalContainer}>
              <TouchableOpacity
                style={styles.testimonialNavArrow}
                onPress={goToPrevTestimonial}
              >
                <Ionicons name="chevron-back" size={28} color="#2979FF" />
              </TouchableOpacity>

              <View style={styles.testimonialMinimalContent}>
                <View style={styles.testimonialTextBox}>
                  <Text style={styles.testimonialText}>
                    "{testimonials[activeTestimonialIndex].quote}"
                  </Text>
                </View>
                <Text style={styles.testimonialMinimalAuthor}>
                  - {testimonials[activeTestimonialIndex].name}
                </Text>
              </View>

              <TouchableOpacity
                style={styles.testimonialNavArrow}
                onPress={goToNextTestimonial}
              >
                <Ionicons name="chevron-forward" size={28} color="#2979FF" />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.bottomButtonContainer}>
            <TouchableOpacity
              style={styles.blueNextButton}
              onPress={() => {
                // Navigate to paywall instead of skipping it
                navigation.replace("PaywallScreen");
              }}
            >
              <Text style={styles.blueNextButtonText}>Get Started</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  const renderWhyScreen = () => {
    return (
      <View style={{ width, flex: 1 }}>
        <View
          style={[
            styles.pageContent,
            { justifyContent: "center", alignItems: "center" },
          ]}
        >
          <View style={styles.congratsIconContainer}>
            <Ionicons name="checkmark-circle" size={80} color={COLORS.accent} />
          </View>

          <Text style={styles.congratsTitle}>Welcome Aboard!</Text>
          <Text style={styles.congratsText}>
            Your journey to a healthier lifestyle begins now. We're excited to
            have you join our community.
          </Text>

          <Text style={styles.congratsHighlight}>
            Setting up your account...
          </Text>

          <View style={styles.loadingContainer}>
            <Animated.View style={[styles.loadingDot, { opacity: 0.4 }]} />
            <Animated.View style={[styles.loadingDot, { opacity: 0.7 }]} />
            <Animated.View style={[styles.loadingDot, { opacity: 1.0 }]} />
          </View>
        </View>
      </View>
    );
  };

  const renderCurrentSurveyScreen = () => {
    switch (currentSurveyScreen) {
      case 0:
        return renderLossOfControl();
      case 1:
        return renderProblemRecognition();
      case 2:
        return renderHabitDuration();
      case 3:
        return renderEmotionalConsequences();
      case 4:
        return renderIdentityConflict();
      case 5:
        return renderActualLossOfControl();
      case 6:
        return renderTriggers();
      case 7:
        return renderFailedAttempts();
      case 8:
        return renderTimeSpent();
      case 9:
        return renderSuccessVision();
      case 10:
        return renderReadyForChallenge();
      default:
        return renderLossOfControl();
    }
  };

  // Add identity screen implementation
  const renderIdentityScreen = () => {
    return (
      <View style={{ width }}>
        <View style={styles.featureContent}>
          <View style={styles.featureImageContainer}>
            <View style={styles.featureCircleBackground}>
              <Ionicons name="person" size={90} color="#2979FF" />
            </View>
          </View>

          <View>
            <Text style={styles.featureTitleText}>Build Your Identity</Text>
            <Text style={styles.featureDescriptionText}>
              Become the person you truly want to be. Our tools help you build
              habits that align with your values and goals.
            </Text>
          </View>

          <View>
            <View style={styles.dotContainer}>
              {[0, 1, 2, 3, 4].map((dot) => (
                <View
                  key={dot}
                  style={[styles.dot, currentPage === dot && styles.activeDot]}
                />
              ))}
            </View>

            <TouchableOpacity
              style={styles.blueNextButton}
              onPress={goToNextPage}
            >
              <Text style={styles.blueNextButtonText}>Next</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  // Add plan screen implementation
  const renderPlanScreen = () => {
    return (
      <View style={{ width }}>
        <View style={styles.featureContent}>
          <View style={styles.featureImageContainer}>
            <View style={styles.featureCircleBackground}>
              <Ionicons name="calendar" size={90} color="#2979FF" />
            </View>
          </View>

          <View>
            <Text style={styles.featureTitleText}>Your Personal Plan</Text>
            <Text style={styles.featureDescriptionText}>
              We'll create a personalized plan to help you reach your goals. Our
              proven methods will guide you every step of the way.
            </Text>
          </View>

          <View>
            <View style={styles.dotContainer}>
              {[0, 1, 2, 3, 4].map((dot) => (
                <View
                  key={dot}
                  style={[styles.dot, currentPage === dot && styles.activeDot]}
                />
              ))}
            </View>

            <TouchableOpacity
              style={styles.blueNextButton}
              onPress={goToNextPage}
            >
              <Text style={styles.blueNextButtonText}>Next</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  // Add visualization screen implementation
  const renderVisualizationScreen = () => {
    return (
      <View style={{ width }}>
        <View style={styles.featureContent}>
          <View style={styles.featureImageContainer}>
            <View style={styles.featureCircleBackground}>
              <Ionicons name="trending-up" size={90} color="#2979FF" />
            </View>
          </View>

          <View>
            <Text style={styles.featureTitleText}>Visualize Your Progress</Text>
            <Text style={styles.featureDescriptionText}>
              See your growth with detailed analytics and visualizations. Track
              your journey and celebrate your wins.
            </Text>
          </View>

          <View>
            <View style={styles.dotContainer}>
              {[0, 1, 2, 3, 4].map((dot) => (
                <View
                  key={dot}
                  style={[styles.dot, currentPage === dot && styles.activeDot]}
                />
              ))}
            </View>

            <TouchableOpacity
              style={styles.blueNextButton}
              onPress={goToNextPage}
            >
              <Text style={styles.blueNextButtonText}>Next</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  // Add congratsScreen implementation if it's mgiing
  const renderCongratsScreen = () => {
    return (
      <View style={{ width, flex: 1 }}>
        <View
          style={[
            styles.pageContent,
            { justifyContent: "center", alignItems: "center" },
          ]}
        >
          <View style={styles.congratsIconContainer}>
            <Ionicons name="checkmark-circle" size={80} color={COLORS.accent} />
          </View>

          <Text style={styles.congratsTitle}>Congratulations!</Text>
          <Text style={styles.congratsText}>
            You're all set to begin your journey. We're excited to have you join
            our community.
          </Text>

          <TouchableOpacity
            style={styles.continueButton}
            onPress={() => navigation.navigate("Main")}
          >
            <Text style={styles.continueButtonText}>Get Started</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  // Add function to calculate quit date (100 days from now)
  const calculateQuitDate = () => {
    const date = new Date();
    date.setDate(date.getDate() + 60);
    return date.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  useEffect(() => {
    captureScreen(POST_HOG_SCREENS.ONBOARDING);
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.innerContainer}>
        {showCongrats ? (
          renderCongratsScreen()
        ) : surveyStarted ? (
          renderCurrentSurveyScreen()
        ) : (
          <View style={{ flex: 1, backgroundColor: COLORS.background }}>
            <View style={styles.fullContentContainer}>
              <Animated.ScrollView
                ref={scrollRef}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                scrollEnabled={false}
                onScroll={Animated.event(
                  [{ nativeEvent: { contentOffset: { x: scrollX } } }],
                  { useNativeDriver: false },
                )}
                contentContainerStyle={styles.horizontalScrollContainer}
              >
                {renderStreakTrackerScreen()}
                {renderCommunityScreen()}
                {renderMeditationScreen()}
                {renderReviewScreen()}
                {renderCommunityCares()}
                {renderWhyScreen()}
                {renderIdentityScreen()}
                {renderPlanScreen()}
                {renderVisualizationScreen()}
              </Animated.ScrollView>
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  innerContainer: {
    flex: 1,
    justifyContent: "space-between",
  },
  backgroundImage: {
    flex: 1,
    width: "100%",
    height: "100%",
  },
  fullContentContainer: {
    height: "100%",
  },
  horizontalScrollContainer: {
    flexGrow: 0,
    alignItems: "center",
  },
  scrollContainer: {
    flex: 1,
    width: "100%",
  },
  page: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    maxHeight: "100%",
    alignSelf: "center",
  },
  pageContent: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.xl,
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
    maxHeight: "90%",
    alignSelf: "center",
  },
  pageContentWithOptions: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.lg,
    paddingBottom: SPACING.xxl,
    width: "100%",
    justifyContent: "center",
    maxHeight: "90%",
    alignSelf: "center",
  },
  welcomeIconContainer: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: "rgba(35, 39, 60, 0.6)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: SPACING.xl,
  },
  welcomeTitle: {
    textAlign: "center",
    marginBottom: SPACING.md,
    fontSize: FONTS.sizes.xl,
    color: "#FFFFFF",
    textShadowColor: "rgba(0, 0, 0, 0.5)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  welcomeText: {
    textAlign: "center",
    color: "#E0E0E0",
    marginBottom: SPACING.xl,
    maxWidth: "80%",
    textShadowColor: "rgba(0, 0, 0, 0.5)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 16,
    width: "100%",
    marginBottom: SPACING.xl,
    paddingHorizontal: SPACING.sm,
  },
  statItem: {
    alignItems: "center",
    backgroundColor: "rgba(35, 39, 60, 0.6)",
    padding: SPACING.sm,
    borderRadius: RADIUS.md,
    minWidth: 90,
  },
  statNumber: {
    color: COLORS.accent,
    fontSize: FONTS.sizes.lg,
  },
  statLabel: {
    color: COLORS.textSecondary,
    fontSize: FONTS.sizes.xs,
  },
  // Timeline styles
  timelineContainer: {
    marginVertical: SPACING.lg,
  },
  timeline: {
    position: "relative",
    marginLeft: SPACING.md,
  },
  timelineBar: {
    position: "absolute",
    left: 5,
    top: 10,
    bottom: 10,
    width: 2,
    backgroundColor: "rgba(255, 255, 255, 0.3)",
  },
  timelinePoint: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: SPACING.lg,
  },
  timelineDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: COLORS.accent,
    marginRight: SPACING.sm,
    marginTop: SPACING.xs,
  },
  timelineDotAccent: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: COLORS.primary,
  },
  timelineContent: {
    flex: 1,
    backgroundColor: "rgba(35, 39, 60, 0.6)",
    padding: SPACING.md,
    borderRadius: RADIUS.md,
  },
  timelineDay: {
    marginBottom: SPACING.xs,
    color: COLORS.accent,
  },
  timelineDayAccent: {
    color: COLORS.primary,
    fontSize: FONTS.sizes.lg,
  },
  timelineDescription: {
    color: COLORS.textSecondary,
    fontSize: FONTS.sizes.sm,
  },
  // Testimonial styles
  testimonialPageContent: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.lg,
    width: "100%",
    height: "100%",
    maxHeight: "90%",
    justifyContent: "space-between",
  },
  compactTestimonialContainer: {
    height: 180,
    marginBottom: SPACING.sm,
  },
  compactTestimonialCard: {
    backgroundColor: COLORS.card,
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    marginRight: SPACING.md,
    height: 170,
    justifyContent: "space-between",
  },
  testimonialHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: SPACING.md,
  },
  testimonialAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.cardLight,
    justifyContent: "center",
    alignItems: "center",
    marginRight: SPACING.sm,
  },
  testimonialMeta: {
    flex: 1,
  },
  testimonialName: {
    color: COLORS.textPrimary,
  },
  testimonialStreak: {
    color: COLORS.accent,
  },
  testimonialQuote: {
    color: COLORS.textSecondary,
    fontStyle: "italic",
    marginBottom: SPACING.md,
    lineHeight: 22,
    fontSize: FONTS.sizes.sm,
    flexShrink: 1,
  },
  testimonialBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.accent,
    alignSelf: "flex-start",
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: RADIUS.round,
  },
  testimonialImprovement: {
    color: "#FFFFFF",
    marginLeft: SPACING.xs,
    fontSize: FONTS.sizes.xs,
  },
  testimonialPagination: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: SPACING.lg,
  },
  testimonialPaginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.cardLight,
    marginHorizontal: 4,
  },
  testimonialPaginationDotActive: {
    backgroundColor: COLORS.accent,
  },
  compactStatsList: {
    maxHeight: 200,
    marginBottom: SPACING.md,
  },
  compactStatItem: {
    backgroundColor: COLORS.card,
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    marginBottom: SPACING.sm,
    flexDirection: "row",
    alignItems: "center",
    height: 55,
  },
  // Guarantee styles
  guaranteeContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.card,
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    marginBottom: SPACING.lg,
  },
  guaranteeText: {
    marginLeft: SPACING.sm,
    color: COLORS.textSecondary,
    flex: 1,
    fontSize: FONTS.sizes.sm,
  },
  guaranteeBold: {
    fontWeight: "bold",
    color: COLORS.textPrimary,
  },
  // Existing styles
  pageTitle: {
    marginBottom: SPACING.sm,
    fontSize: FONTS.sizes.lg,
    color: "#FFFFFF",
    textShadowColor: "rgba(0, 0, 0, 0.5)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  pageSubtitle: {
    color: "#E0E0E0",
    marginBottom: SPACING.lg,
    textShadowColor: "rgba(0, 0, 0, 0.5)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  optionsContainer: {
    marginBottom: SPACING.lg,
  },
  optionCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: SPACING.md,
    backgroundColor: "rgba(35, 39, 60, 0.6)",
    borderRadius: RADIUS.md,
    marginBottom: SPACING.sm,
    borderWidth: 2,
    borderColor: "transparent",
  },
  selectedOptionCard: {
    borderColor: COLORS.accent,
    backgroundColor: "rgba(45, 55, 90, 0.7)",
  },
  optionIconContainer: {
    width: 44,
    height: 44,
    borderRadius: RADIUS.sm,
    backgroundColor: "rgba(45, 55, 90, 0.7)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: SPACING.md,
  },
  selectedOptionIconContainer: {
    backgroundColor: COLORS.accent,
  },
  optionText: {
    flex: 1,
    color: "#FFFFFF",
  },
  selectedOptionText: {
    fontWeight: "bold",
    color: COLORS.primary,
  },
  checkmarkIcon: {
    marginLeft: SPACING.sm,
  },
  customInputContainer: {
    marginBottom: SPACING.lg,
  },
  customInputLabel: {
    marginBottom: SPACING.xs,
    color: "#E0E0E0",
  },
  customTextInput: {
    backgroundColor: "rgba(35, 39, 60, 0.6)",
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    color: COLORS.textPrimary,
    fontSize: FONTS.sizes.md,
    minHeight: 80,
    textAlignVertical: "top",
  },
  numberInput: {
    backgroundColor: "rgba(35, 39, 60, 0.6)",
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    color: COLORS.textPrimary,
    fontSize: FONTS.sizes.md,
    textAlign: "center",
    width: 100,
  },
  planName: {
    color: COLORS.accent,
    marginTop: SPACING.xs,
    marginLeft: 44 + SPACING.md,
  },
  checkInContainer: {
    marginBottom: SPACING.lg,
  },
  checkInTitle: {
    marginBottom: SPACING.sm,
    color: "#FFFFFF",
    textShadowColor: "rgba(0, 0, 0, 0.5)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  checkInButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  checkInOption: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: SPACING.md,
    backgroundColor: "rgba(35, 39, 60, 0.6)",
    borderRadius: RADIUS.md,
    marginHorizontal: SPACING.xs,
    borderWidth: 2,
    borderColor: "transparent",
  },
  selectedCheckInOption: {
    borderColor: COLORS.accent,
    backgroundColor: "rgba(45, 55, 90, 0.7)",
  },
  checkInText: {
    marginLeft: SPACING.sm,
    color: "#E0E0E0",
  },
  selectedCheckInText: {
    color: COLORS.accent,
    fontWeight: "bold",
  },
  navigationButtons: {
    width: "100%",
    alignItems: "center",
    marginTop: SPACING.xl,
    gap: SPACING.md,
  },
  largeButton: {
    width: "90%",
    height: 56,
    borderRadius: 28,
  },
  buttonPrimary: {
    backgroundColor: COLORS.accent,
  },
  buttonSecondary: {
    backgroundColor: "#FFFFFF",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  appleButton: {
    width: "90%",
    height: 56,
    marginTop: SPACING.md,
  },
  // Paywall specific styles
  paywallBackground: {
    flex: 1,
    width: "100%",
  },
  paywallContent: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: 0,
    justifyContent: "center",
    width: "100%",
  },
  paywallTitle: {
    textAlign: "center",
    marginBottom: SPACING.md,
    marginTop: SPACING.lg,
    fontSize: 28,
    fontWeight: "bold",
    color: "#FFFFFF",
    textShadowColor: "rgba(0, 0, 0, 0.5)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  paywallSubtitle: {
    textAlign: "center",
    color: "#FFFFFF",
    marginBottom: SPACING.lg,
    maxWidth: "90%",
    textShadowColor: "rgba(0, 0, 0, 0.5)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  paywallCard: {
    position: "relative",
    width: "100%",
    backgroundColor: "rgba(35,39, 60, 0.1)",
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.15)",
    overflow: "hidden",
  },
  cardBlurLayer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(40, 45, 75, 0.85)",
    borderRadius: RADIUS.lg,
  },
  featuresContainer: {
    width: "100%",
    position: "relative",
    zIndex: 1,
  },
  featureItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: SPACING.md,
  },
  featureText: {
    fontSize: 16,
    color: "#FFFFFF",
    fontWeight: "500",
    marginLeft: SPACING.sm,
  },
  testimonialsContainer: {
    marginVertical: SPACING.md,
    paddingTop: SPACING.sm,
    paddingBottom: SPACING.sm,
    overflow: "hidden",
  },
  testimonialItem: {
    padding: SPACING.xs,
  },
  testimonialText: {
    color: "#E0E0E0",
    fontStyle: "italic",
    marginBottom: SPACING.xs,
    lineHeight: 20,
    textAlign: "center",
  },
  testimonialAuthor: {
    color: "#A0A0A0",
    textAlign: "center",
    fontSize: 12,
  },
  paginationContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: SPACING.xs,
  },
  paginationDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    marginHorizontal: 3,
  },
  paginationActiveDot: {
    backgroundColor: "#2979FF",
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  unlockRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: SPACING.md,
    paddingTop: SPACING.md,
    borderTopColor: "rgba(255, 255, 255, 0.1)",
  },
  unlockText: {
    fontWeight: "bold",
    marginLeft: SPACING.xs,
    flex: 1,
    color: "#FFFFFF",
  },
  priceText: {
    color: "#2979FF",
    fontSize: FONTS.sizes.lg,
  },
  ctaButton: {
    width: "100%",
    paddingVertical: SPACING.md,
    marginBottom: SPACING.md,
    borderRadius: 50,
    backgroundColor: "#2979FF",
  },
  termsText: {
    color: "#888888",
    marginBottom: SPACING.xl,
    textAlign: "center",
  },
  congratsIconContainer: {
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: COLORS.cardLight,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: SPACING.xl,
  },
  congratsTitle: {
    textAlign: "center",
    marginBottom: SPACING.md,
    fontSize: FONTS.sizes.xl,
    color: COLORS.accent,
  },
  congratsText: {
    textAlign: "center",
    color: COLORS.textSecondary,
    marginBottom: SPACING.md,
    maxWidth: "80%",
    fontSize: FONTS.sizes.md,
  },
  congratsHighlight: {
    color: COLORS.textPrimary,
    marginTop: SPACING.lg,
  },
  loadingContainer: {
    flexDirection: "row",
    marginTop: SPACING.xl,
  },
  loadingDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: COLORS.accent,
    marginHorizontal: 4,
    opacity: 0.6,
  },
  fixedHeightPageContent: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.lg,
    width: "100%",
    height: "90%",
    justifyContent: "space-between",
  },
  testimonialWrapper: {
    maxHeight: 240,
  },
  testimonialScroll: {
    maxHeight: 200,
  },
  testimonialCard: {
    backgroundColor: COLORS.card,
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    marginRight: SPACING.md,
    height: 180,
    justifyContent: "space-between",
  },
  compactTestimonialQuote: {
    color: COLORS.textSecondary,
    fontStyle: "italic",
    marginBottom: SPACING.sm,
    lineHeight: 20,
    fontSize: FONTS.sizes.sm,
    flexShrink: 1,
    maxHeight: 80,
  },
  statNumberStyle: {
    color: COLORS.accent,
    marginRight: SPACING.md,
    fontSize: FONTS.sizes.lg,
    minWidth: 60,
    textAlign: "center",
  },
  statDescriptionStyle: {
    color: COLORS.textSecondary,
    flex: 1,
  },
  validationError: {
    color: "#FF6B6B",
    textAlign: "center",
    marginTop: SPACING.md,
    marginBottom: 0,
    fontSize: FONTS.sizes.sm,
    textShadowColor: "rgba(0, 0, 0, 0.7)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  featureContent: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.lg,
    width: "100%",
    height: "100%",
    maxHeight: "90%",
    justifyContent: "space-between",
    alignItems: "center",
  },
  featureImageContainer: {
    marginTop: 60,
    marginBottom: SPACING.xl,
    alignItems: "center",
  },
  featureCircleBackground: {
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: "rgba(41, 121, 255, 0.1)",
    justifyContent: "center",
    alignItems: "center",
  },
  featureImage: {
    width: 110,
    height: 110,
  },
  featureTitleText: {
    textAlign: "center",
    marginBottom: SPACING.md,
    fontSize: 22,
    fontWeight: "bold",
    color: "#2979FF",
  },
  featureDescriptionText: {
    textAlign: "center",
    color: "rgba(255, 255, 255, 0.8)",
    marginBottom: SPACING.xl,
    marginHorizontal: 20,
    lineHeight: 22,
  },
  dotContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: SPACING.lg,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    marginHorizontal: 4,
  },
  activeDot: {
    backgroundColor: "#2979FF",
  },
  blueNextButton: {
    backgroundColor: "#2979FF",
    paddingVertical: 15,
    width: SCREEN_WIDTH - 32,
    borderRadius: 50,
    alignItems: "center",
    marginBottom: 30,
  },
  blueNextButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },
  communityCaresContainer: {
    flex: 1,
    padding: SPACING.lg,
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    height: "100%",
  },
  communityLogoContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 60,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 8,
  },
  communityLogoText: {
    fontSize: 40,
    fontWeight: "bold",
    color: "#ffffff",
  },
  userCountContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 30,
  },
  leafDecoration: {
    marginHorizontal: 10,
  },
  userCountText: {
    color: "#FFFFFF",
    fontSize: 26,
    fontWeight: "bold",
  },
  usersText: {
    fontWeight: "normal",
  },
  communityHeading: {
    color: "#FFFFFF",
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 16,
  },
  communityDescription: {
    color: "#FFFFFF",
    fontSize: 18,
    textAlign: "center",
    marginBottom: 60,
    maxWidth: "80%",
    lineHeight: 24,
  },
  continueButton: {
    backgroundColor: "#FFFFFF",
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 50,
    width: "90%",
    alignItems: "center",
  },
  continueButtonText: {
    color: "#000000",
    fontSize: 18,
    fontWeight: "bold",
  },
  surveyContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
    width: "100%",
  },
  surveyHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.sm,
    marginBottom: SPACING.md,
  },
  surveyBackButton: {
    padding: SPACING.sm,
    borderRadius: 30,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
  },
  surveyProgress: {
    flex: 1,
    height: 4,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 2,
    marginLeft: SPACING.md,
  },
  surveyProgressBar: {
    height: "100%",
    backgroundColor: COLORS.accent,
    borderRadius: 2,
  },
  surveySkipText: {
    color: "#2979FF",
    fontSize: 16,
    fontWeight: "500",
    marginLeft: 10,
  },
  surveyContent: {
    flex: 1,
    paddingHorizontal: 20,
    justifyContent: "space-between", // This will help space content and button
  },
  surveyQuestionsContainer: {
    paddingTop: 40,
    alignItems: "center",
  },
  nextButtonContainer: {
    width: "100%",
    paddingVertical: 20,
    paddingBottom: 40, // Add extra padding at the bottom
  },
  surveyNextButton: {
    backgroundColor: "#2979FF",
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 30,
    width: "100%",
    alignItems: "center",
  },
  surveyNextButtonDisabled: {
    backgroundColor: "#333333",
  },
  surveyNextButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },
  surveyIconContainer: {
    marginBottom: SPACING.xl,
  },
  surveyCircleBackground: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(41, 121, 255, 0.1)",
    justifyContent: "center",
    alignItems: "center",
  },
  surveyTitle: {
    fontSize: FONTS.sizes.xl,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: SPACING.md,
    textAlign: "center",
  },
  surveyDescription: {
    fontSize: FONTS.sizes.md,
    color: "rgba(255, 255, 255, 0.8)",
    textAlign: "center",
    marginBottom: SPACING.xl,
    lineHeight: 24,
  },
  surveyBenefits: {
    width: "100%",
    marginBottom: SPACING.xl,
  },
  benefitItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(35, 39, 60, 0.6)",
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    marginBottom: SPACING.sm,
    width: "100%",
  },
  benefitText: {
    color: "#FFFFFF",
    marginLeft: SPACING.md,
    fontSize: FONTS.sizes.md,
    flex: 1,
  },
  startSurveyButton: {
    backgroundColor: COLORS.accent,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.xl,
    borderRadius: RADIUS.full,
    width: "100%",
    alignItems: "center",
    marginTop: "auto",
    marginBottom: SPACING.xl,
    borderRadius: 30,
  },
  startSurveyButtonText: {
    color: "#FFFFFF",
    fontSize: FONTS.sizes.md,
    fontWeight: "bold",
  },
  surveyQuestionTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 30,
    textAlign: "center",
    paddingHorizontal: 10, // Add padding to help with text wrapping
  },
  surveyOptionButton: {
    padding: 15,
    backgroundColor: "#121212",
    borderRadius: 30,
    marginBottom: 12,
    width: "100%",
    minHeight: 54, // Ensure consistent minimum height for option buttons
    alignItems: "center",
    justifyContent: "center", // Center text vertically
    borderWidth: 1,
    borderColor: "#333333",
  },
  surveyOptionButtonSelected: {
    backgroundColor: "#121212",
    borderColor: "#2979FF",
  },
  surveyOptionText: {
    color: "#FFFFFF",
    fontSize: 16,
  },
  surveyOptionTextSelected: {
    color: "#2979FF",
    fontWeight: "bold",
  },
  surveyScrollView: {
    flex: 1,
  },
  surveySubtitle: {
    fontSize: 16,
    color: "#AAAAAA",
    marginBottom: 20,
    textAlign: "center",
  },
  communityCaresScrollContainer: {
    padding: SPACING.lg,
    alignItems: "center",
    paddingBottom: 80,
  },
  communityCaresSingleContainer: {
    alignItems: "center",
    justifyContent: "space-between",
    height: "100%",
    padding: SPACING.lg,
    backgroundColor: COLORS.background,
    paddingVertical: 60,
  },
  communityCaresHeader: {
    alignItems: "center",
    width: "100%",
    marginBottom: 40,
  },
  communityLogoCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 30,
  },
  communityLogoTextP: {
    fontSize: 40,
    fontWeight: "bold",
    color: "#ffffff",
  },
  communityHeading: {
    color: "#FFFFFF",
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 12,
    textAlign: "center",
  },
  communityDescription: {
    color: "rgba(255, 255, 255, 0.7)",
    fontSize: 16,
    textAlign: "center",
    maxWidth: "85%",
  },
  testimonialContainer: {
    flex: 1,
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: SPACING.md,
  },
  testimonialText: {
    color: "#FFFFFF",
    fontSize: 18,
    lineHeight: 26,
    fontStyle: "italic",
    textAlign: "center",
    marginBottom: SPACING.lg,
  },
  testimonialAuthorContainer: {
    marginBottom: SPACING.md,
  },
  testimonialAuthorName: {
    color: "#2979FF",
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
  },
  testimonialPaginationContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: SPACING.md,
  },
  testimonialPaginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    marginHorizontal: 4,
  },
  testimonialPaginationDotActive: {
    backgroundColor: "#2979FF",
  },
  continueButtonMinimal: {
    backgroundColor: "#FFFFFF",
    paddingVertical: 15,
    borderRadius: 30,
    width: "100%",
    alignItems: "center",
  },
  continueButtonText: {
    color: COLORS.background,
    fontSize: 16,
    fontWeight: "bold",
  },
  testimonialMinimalContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: SPACING.lg,
    marginTop: SPACING.md,
    width: "100%",
  },
  testimonialNavArrow: {
    padding: SPACING.sm,
    height: "100%",
    justifyContent: "center",
    width: 50,
    alignItems: "center",
  },
  testimonialMinimalContent: {
    flex: 1,
    alignItems: "center",
    paddingHorizontal: SPACING.xs,
  },
  testimonialTextBox: {
    backgroundColor: "rgba(10, 10, 10, 0.3)",
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.md,
    width: "100%",
    alignItems: "center",
  },
  testimonialText: {
    color: "#FFFFFF",
    fontSize: 16,
    lineHeight: 24,
    fontStyle: "italic",
    textAlign: "center",
    opacity: 0.9,
  },
  testimonialMinimalAuthor: {
    color: COLORS.accent,
    fontWeight: "bold",
    marginTop: SPACING.sm,
    fontSize: 14,
  },
  testimonialsMainContent: {
    width: "100%",
    alignItems: "center",
    marginVertical: SPACING.lg,
    paddingHorizontal: SPACING.sm,
  },
  bottomButtonContainer: {
    width: "100%",
    alignItems: "center",
    marginTop: "auto",
    marginBottom: 20,
  },
  surveyIntroContent: {
    flex: 1,
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.xl,
    alignItems: "center",
  },
  planReadyContent: {
    flex: 1,
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.xl,
    alignItems: "center",
    justifyContent: "center",
  },
  planReadyIconContainer: {
    marginBottom: SPACING.xl,
  },
  planReadyTitle: {
    fontSize: FONTS.sizes.xl,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: SPACING.md,
    textAlign: "center",
  },
  planReadyDescription: {
    fontSize: FONTS.sizes.md,
    color: "rgba(255, 255, 255, 0.8)",
    textAlign: "center",
    marginBottom: SPACING.xl,
    lineHeight: 24,
  },
  quitDateContainer: {
    backgroundColor: "rgba(41, 121, 255, 0.1)",
    padding: SPACING.lg,
    borderRadius: RADIUS.lg,
    alignItems: "center",
    marginBottom: SPACING.xl,
    width: "100%",
  },
  quitDateLabel: {
    fontSize: FONTS.sizes.md,
    color: "rgba(255, 255, 255, 0.8)",
    marginBottom: SPACING.sm,
  },
  quitDate: {
    fontSize: FONTS.sizes.xl,
    fontWeight: "bold",
    color: "#2979FF",
  },
  planHighlights: {
    width: "100%",
    marginBottom: SPACING.xl,
  },
  highlightItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(35, 39, 60, 0.6)",
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    marginBottom: SPACING.sm,
  },
  highlightText: {
    color: "#FFFFFF",
    marginLeft: SPACING.md,
    fontSize: FONTS.sizes.md,
  },
  continueButton: {
    backgroundColor: "#2979FF",
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.xl,
    borderRadius: 30,
    width: "100%",
    alignItems: "center",
    marginTop: "auto",
    marginBottom: SPACING.xl,
  },
  continueButtonText: {
    color: "#FFFFFF",
    fontSize: FONTS.sizes.md,
    fontWeight: "bold",
  },
  triggersSurveyContent: {
    flex: 1,
    width: "100%",
    paddingHorizontal: SPACING.lg,
  },
  triggersOptionsContainer: {
    flex: 1,
    width: "100%",
  },
  triggersContinueButtonContainer: {
    width: "100%",
    paddingBottom: SPACING.xl,
  },
});

export default OnboardingScreen;
