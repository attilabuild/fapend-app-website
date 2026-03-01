import React, { useEffect, useState } from "react";
// @ts-ignore
import { NavigationContainer } from "@react-navigation/native";
// @ts-ignore
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useAuthStore, useAchievementStore } from "../hooks/useStore";
import { COLORS } from "../utils/theme";

// Screens
import OnboardingScreen from "../screens/OnboardingScreen";
import PaywallScreen from "../screens/PaywallScreen";
import CheckInScreen from "../screens/CheckInScreen";
import RelapseScreen from "../screens/RelapseScreen";
import SettingsScreen from "../screens/SettingsScreen";
import ArticleDetailScreen from "../screens/ArticleDetailScreen";
import NewPostScreen from "../screens/NewPostScreen";
import PostDetailScreen from "../screens/PostDetailScreen";
import UserProfileScreen from "../screens/UserProfileScreen";
import AnalyticsScreen from "../screens/AnalyticsScreen";
import AchievementsScreen from "../screens/AchievementsScreen";
import LearnScreen from "../screens/LearnScreen";
import CongratulationsScreen from "screens/CongratulationsScreen";
import LoginScreen from "screens/LoginScreen";
import RegisterScreen from "screens/RegisterScreen";
import EmailLoginScreen from "screens/EmailLoginScreen";
import GuideScreen from "screens/GuideScreen";
import BreathingExerciseScreen from "screens/BreathingExerciseScreen";
import BreathingCountdownScreen from "screens/BreathingCountdownScreen";
import PanicScreen from "screens/PanicScreen";
import ProfileScreen from "screens/ProfileScreen";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as api from "../services/api";
import TabNavigator from "./TabNavigator";
import AchievementModal from "../components/AchievementModal";

// Create stack navigator
const Stack = createNativeStackNavigator();

const AppNavigator = () => {
  const [authLoaded, setAuthLoaded] = useState(false);
  const [needsOnboarding, setNeedsOnboarding] = useState(false);
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false);

  const { isAuthenticated, user, restoreAuth } = useAuthStore();
  const { modalVisible, modalAchievement, hideAchievementModal } = useAchievementStore();

  // Add effect to log modal state changes
  useEffect(() => {

  }, [modalVisible, modalAchievement]);

  useEffect(() => {
    const checkAuthState = async () => {
      try {
        // Check if user is already logged in from AsyncStorage
        const authState = await AsyncStorage.getItem("auth_state");
        const authUser = await AsyncStorage.getItem("auth_user");

        if (authState === "true" && authUser) {
          // Restore authentication state from AsyncStorage
          const user = JSON.parse(authUser);

          // Always check subscription status from the database when restoring auth
          try {
            // Get fresh user data from the database
            const response = await api.getUserProfile(user._id);
            if (response.success && "data" in response && response.data) {
              // Update the user object with the latest data from DB, particularly isSubscribed
              user.isSubscribed = response.data.isSubscribed ?? false;

              // Update the stored user data with fresh data
              await AsyncStorage.setItem("auth_user", JSON.stringify(user));
            }
          } catch (dbError) {
            console.error("Error fetching fresh user data:", dbError);
            // Continue with stored data if we can't fetch fresh data
          }

          restoreAuth(user);

          // Check if the user has completed the survey
          const surveyData = await AsyncStorage.getItem("survey_answers");
          const userSpecificSurveyData = await AsyncStorage.getItem(
            `survey_answers_${user._id}`,
          );
          const hasSurveyData = !!surveyData || !!userSpecificSurveyData;

          // If no survey data, user needs onboarding
          setNeedsOnboarding(!hasSurveyData);
        }

        setAuthLoaded(true);
      } catch (error) {
        console.error("Error checking auth state:", error);
        setAuthLoaded(true);
      }
    };

    checkAuthState();
  }, [restoreAuth]);

  useEffect(() => {
    const checkOnboardingStatus = async () => {
      try {
        const status = await AsyncStorage.getItem("onboarding_completed");
        setHasCompletedOnboarding(status === "true");
      } catch (error) {
        console.error("Error checking onboarding status:", error);
      }
    };

    checkOnboardingStatus();
  }, []);

  if (!authLoaded) {
    return null;
  }

  return (
    <>
      {isAuthenticated ? (
        <Stack.Navigator
          initialRouteName={
            hasCompletedOnboarding ? "Main" : "Onboarding"
          }
          screenOptions={() => ({
            contentStyle: { backgroundColor: COLORS.background },
            headerStyle: { backgroundColor: COLORS.background },
            headerBackTitleVisible: false,
            headerBackTitle: "",
            headerTintColor: COLORS.textPrimary,
            headerTitle: "",
          })}
        >
          <Stack.Screen
            name="Onboarding"
            component={OnboardingScreen}
            options={{
              headerShown: false,
            }}
          />
          <Stack.Screen
            name="PaywallScreen"
            component={PaywallScreen}
            options={{
              headerShown: false,
            }}
          />
          <Stack.Screen
            name="Main"
            options={{ headerShown: false }}
            component={TabNavigator}
          />
          <Stack.Screen
            name="CheckIn"
            component={CheckInScreen}
            options={{ presentation: "fullScreenModal" }}
          />
          <Stack.Screen name="Relapse" component={RelapseScreen} />
          <Stack.Screen name="Profile" component={ProfileScreen} />
          <Stack.Screen name="Settings" component={SettingsScreen} />
          <Stack.Screen name="PanicScreen" component={PanicScreen} />
          <Stack.Screen
            name="BreathingCountdown"
            component={BreathingCountdownScreen}
          />
          <Stack.Screen
            name="BreathingExercise"
            component={BreathingExerciseScreen}
          />
          <Stack.Screen name="Guide" component={GuideScreen} />
          <Stack.Screen name="Learn" component={LearnScreen} />
          <Stack.Screen name="ArticleDetail" component={ArticleDetailScreen} />
          <Stack.Screen name="PostDetail" component={PostDetailScreen} />
          <Stack.Screen name="History" component={AnalyticsScreen} />
          <Stack.Screen name="NewPost" component={NewPostScreen} />
          <Stack.Screen name="UserProfile" component={UserProfileScreen} />
          <Stack.Screen
            name="AchievementsScreen"
            component={AchievementsScreen}
          />
        </Stack.Navigator>
      ) : (
        <Stack.Navigator
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: COLORS.background },
          }}
        >
          <Stack.Screen
            name="Congratulations"
            component={CongratulationsScreen}
          />
          <Stack.Screen name="Onboarding" component={OnboardingScreen} />
          <Stack.Screen
            name="PaywallScreen"
            component={PaywallScreen}
            options={{
              headerShown: false,
            }}
          />
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Register" component={RegisterScreen} />
          <Stack.Screen name="EmailLogin" component={EmailLoginScreen} />
        </Stack.Navigator>
      )}

      <AchievementModal
        visible={modalVisible}
        achievement={modalAchievement}
        onClose={hideAchievementModal}
      />
    </>
  );
};

export default AppNavigator;
