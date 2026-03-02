
// @ts-nocheck
import { StatusBar } from "expo-status-bar";
import React, { useEffect, useState, useCallback, memo } from "react";
import {
  View,
  Text,
  ActivityIndicator,
  TouchableOpacity,
  Platform,
} from "react-native";
import {
  createNavigationContainerRef,
  NavigationContainer,
} from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { SafeAreaProvider } from "react-native-safe-area-context";
import {
  useAuthStore,
  useSettingsStore,
  useStreakStore,
  useAchievementStore,
} from "./hooks/useStore";
import { COLORS, SPACING } from "./utils/theme";
import { initializeDatabase } from "./utils/databaseSync";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as api from "./services/api";
import Constants from "expo-constants";
import { Ionicons } from "@expo/vector-icons";

// Tab Bar
import TabBar from "./components/navigation/TabBar";
// Network Status
import NetworkStatus from "./components/NetworkStatus";

// Auth Screens
import LoginScreen from "./screens/LoginScreen";
import RegisterScreen from "./screens/RegisterScreen";
import OnboardingScreen from "./screens/OnboardingScreen";
import CongratulationsScreen from "./screens/CongratulationsScreen";
import EmailLoginScreen from "./screens/EmailLoginScreen";

// Main Screens
import HomeScreen from "./screens/HomeScreen";
import GuideScreen from "./screens/GuideScreen";
import JournalScreen from "./screens/JournalScreen";
import CommunityScreen from "./screens/CommunityScreen";
import AchievementsScreen from "./screens/AchievementsScreen";
import CheckInScreen from "./screens/CheckInScreen";
import RelapseScreen from "./screens/RelapseScreen";
import ProfileScreen from "./screens/ProfileScreen";
import SettingsScreen from "./screens/SettingsScreen";
import ArticleDetailScreen from "./screens/ArticleDetailScreen";
import PostDetailScreen from "./screens/PostDetailScreen";
import NewPostScreen from "./screens/NewPostScreen";
import LearnScreen from "./screens/LearnScreen";
import UserProfileScreen from "./screens/UserProfileScreen";
import AnalyticsScreen from "./screens/AnalyticsScreen";
import LibraryScreen from "./screens/LibraryScreen";

// Panic Flow Screens
import PanicScreen from "./screens/PanicScreen";
import BreathingCountdownScreen from "./screens/BreathingCountdownScreen";
import BreathingExerciseScreen from "./screens/BreathingExerciseScreen";

// Import the PaywallScreen
import PaywallScreen from "./screens/PaywallScreen";

// Error Boundary
class ErrorBoundary extends React.Component {
  state = { hasError: false, error: null };

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: COLORS.background,
            padding: 20,
          }}
        >
          <Text
            style={{
              color: COLORS.danger,
              fontSize: 24,
              marginBottom: 20,
              fontWeight: "bold",
              textAlign: "center",
            }}
          >
            Something went wrong
          </Text>
          <Text
            style={{
              color: COLORS.textPrimary,
              textAlign: "center",
              marginBottom: 30,
            }}
          >
            We're sorry, but the app has encountered an error.
          </Text>
          <TouchableOpacity
            onPress={() => this.setState({ hasError: false })}
            style={{
              backgroundColor: COLORS.primary,
              padding: 15,
              borderRadius: 8,
            }}
          >
            <Text style={{ color: "white", textAlign: "center" }}>
              Try Again
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={async () => {
              // Only reset essential data, not the entire app
              await AsyncStorage.multiRemove(["temp_data", "cache_data"]);
              this.setState({ hasError: false });
            }}
            style={{
              marginTop: 15,
              padding: 15,
              borderRadius: 8,
              borderWidth: 1,
              borderColor: COLORS.textSecondary,
            }}
          >
            <Text style={{ color: COLORS.textPrimary, textAlign: "center" }}>
              Clear Cache & Retry
            </Text>
          </TouchableOpacity>
        </View>
      );
    }

    return this.props.children;
  }
}

// Define the stack navigator types
type RootStackParamList = {
  Login: undefined;
  Register: undefined;
  Onboarding: undefined;
  Main: undefined;
  PaywallScreen: undefined;
  CheckIn: { isRelapse?: boolean };
  Relapse: undefined;
  Profile: undefined;
  Settings: undefined;
  PanicScreen: undefined;
  BreathingCountdown: undefined;
  BreathingExercise: undefined;
  Journal: undefined;
  Guide: undefined;
  Learn: undefined;
  ArticleDetail: { articleId: string; title: string; categoryId: string };
  PostDetail: { postId: string };
  NewPost: undefined;
  Achievements: undefined;
  Progress: undefined;
  UserProfile: { userId: string };
  EmailLogin: undefined;
  History: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

// Loading screen component - Extracted for reuse and memoization
const LoadingScreen = memo(
  ({
    storageStatus,
    onReset,
  }: {
    storageStatus: { connected: boolean; message: string };
    onReset: () => void;
  }) => (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: COLORS.background,
      }}
    >
      <ActivityIndicator size="large" color={COLORS.accent} />
      <Text style={{ marginTop: 20, color: COLORS.textPrimary }}>
        Initializing app...
      </Text>
      <Text
        style={{
          marginTop: 10,
          color: storageStatus.connected
            ? COLORS.success
            : COLORS.textSecondary,
        }}
      >
        {storageStatus.message}
      </Text>

      {/* Debug reset button - remove in production */}
      <TouchableOpacity
        onPress={onReset}
        style={{
          marginTop: 40,
          padding: 10,
          backgroundColor: COLORS.danger,
          borderRadius: 8,
        }}
      >
        <Text style={{ color: "white" }}>Reset App Data</Text>
      </TouchableOpacity>
    </View>
  ),
);

import SplashScreen from "./components/SplashScreen";
import { RevenueCatProvider } from "hooks/useRevenueCat";
import { NotificationProvider } from "hooks/useNotifications";
import Header from "components/navigation/Header";
import { POSTHOG_API_KEY, POSTHOG_HOST } from "config";
import AppNavigator from "navigation/AppNavigator";

export default function App() {
  const { isAuthenticated, user, restoreAuth } = useAuthStore();
  const { loadSettings, pushNotifications } = useSettingsStore();
  const { loadUserData } = useStreakStore();
  const { loadAchievements, checkMissedAchievements } = useAchievementStore();
  const [isInitializing, setIsInitializing] = useState(true);
  const [authLoaded, setAuthLoaded] = useState(false);
  const [storageStatus, setStorageStatus] = useState({
    connected: false,
    message: "Initializing...",
  });
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false);
  const [appReady, setAppReady] = useState(false);

  useEffect(() => {
    const initializeApp = async () => {
      try {
        // Defer first I/O to avoid native file-system race at launch (iOS 26+ crash in FileSystemModule.getPathPermissions)
        await new Promise((resolve) => setTimeout(resolve, 200));

        // Initialize local storage silently
        await AsyncStorage.getItem("auth_state");

        // Check for stored auth state
        const authState = await AsyncStorage.getItem("auth_state");
        const storedUser = await AsyncStorage.getItem("auth_user");

        if (authState === "true" && storedUser) {
          const user = JSON.parse(storedUser);
          
          // First restore auth and wait for it to complete
          await new Promise<void>((resolve) => {
            useAuthStore.getState().restoreAuth(user);
            // Give a small delay to ensure state is updated
            setTimeout(resolve, 100);
          });

          // Then check subscription status
          try {
            const response = await api.getUserProfile(user._id);
            if (response.success && response.data) {
              const updatedUser = {
                ...user,
                isSubscribed: response.data.isSubscribed ?? false,
              };
              useAuthStore.getState().restoreAuth(updatedUser);
              await AsyncStorage.setItem("auth_user", JSON.stringify(updatedUser));
            }
          } catch (error) {
            console.error("Error fetching subscription status:", error);
          }

          // Only after auth is restored, check for achievements
          await checkMissedAchievements(user._id);
        }
      } catch (error) {
        console.error("Error initializing app:", error);
      } finally {
        setAppReady(true);
      }
    };

    initializeApp();
  }, []);

  // Handler for reset button - memoized to prevent recreation
  const handleReset = useCallback(async () => {
    await AsyncStorage.clear();
    // Force reload by triggering state update
    setIsInitializing(false);
    setTimeout(() => setIsInitializing(true), 100);
  }, []);

  // Show loading state while initializing
  if (!appReady) {
    return <SplashScreen />;
  }

  // Main app UI with routing
  return (
    <ErrorBoundary>
      <SafeAreaProvider>
        <NetworkStatus />
        <StatusBar style="light" />
        <NavigationContainer>
          <RevenueCatProvider>
            <NotificationProvider>
              <AppNavigator />
            </NotificationProvider>
          </RevenueCatProvider>
        </NavigationContainer>
      </SafeAreaProvider>
    </ErrorBoundary>
  );
}
