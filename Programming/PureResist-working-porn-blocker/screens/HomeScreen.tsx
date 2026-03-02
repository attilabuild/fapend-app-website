import React, { useEffect, useState, useRef, useCallback, memo } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Animated,
  Easing,
  ImageBackground,
  Platform,
  Text,
  StatusBar,
  Image,
  RefreshControl,
  Linking,
  Switch,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import {
  useAuthStore,
  useStreakStore,
  useAchievementStore,
} from "../hooks/useStore";
import { Title, Subtitle, Body, Caption } from "../components/ui/Typography";
import Card from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { COLORS, SPACING, RADIUS } from "../utils/theme";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from "expo-linear-gradient";
import {
  getUserStreakStarted,
  updateUserStreakStarted,
  updateUserLastRelapse,
} from "../services/api";
import { Video, ResizeMode } from "expo-av";
import WeeklyCheckinView from "../components/WeeklyCheckinView";
import {
  isFirstDayAutoCheckin,
  clearFirstDayAutoCheckin,
} from "../utils/asyncStorage";
import { useNavigation } from "@react-navigation/native";
import * as achievementModule from "../services/achievementService";
import PledgeModal from "../components/PledgeModal";
import moment from "moment";
import TodoSection from "components/home/TodoSection";
import { AnimatedStars } from "../components/ui/AnimatedStars";
import {
  checkWebContentBlockerAvailability,
  requestWebContentBlockerAuthorization,
  getWebContentBlockerAuthorizationStatus,
  isWebContentBlockerBlockingActive,
  setWebContentBlockerBlockedDomains,
  disableWebContentBlockerBlocking,
} from "../modules/web-content-blocker/src/WebContentBlockerModule";

type RootStackParamList = {
  Main: undefined;
  Relapse: undefined;
  Profile: undefined;
  Login: undefined;
  Milestones: undefined;
  RelapsePrevention: undefined;
  Education: undefined;
  Journal: undefined;
  Achievements: undefined;
  Guide: undefined;
  Community: undefined;
  Chat: { partnerId?: string };
  PanicScreen: undefined;
  BreathingCountdown: undefined;
  CheckIn: { isRelapse?: boolean };
};

interface AccountabilityPartner {
  _id: string;
  name: string;
  currentStreak: number;
}

interface IUser {
  _id: string;
  goals?: string;
  accountabilityPartners?: AccountabilityPartner[];
  isSubscribed: boolean;
}

// Domains to block with the Porn Blocker
// format domain.com
const BLOCKED_LIST = ["pornhub.com"];

type Props = NativeStackScreenProps<RootStackParamList, "Home">;

const HomeScreen: React.FC<Props> = ({ navigation }) => {
  const { user, logout } = useAuthStore();
  const {
    longestStreak,
    loadUserData,
    loadCheckIns,
    loading,
    error,
    lastRelapse,
    lastCheckIn,
    reportRelapse,
  } = useStreakStore();
  const {
    refreshAchievements,
    checkAndUpdateAchievements,
    achievements,
    loadAchievements,
  } = useAchievementStore();

  const [isRefreshing, setIsRefreshing] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const [timeElapsed, setTimeElapsed] = useState<{
    top: string;
    bottom: string;
  }>({ top: "", bottom: "" });
  const [seconds, setSeconds] = useState(0);
  const [streakStarted, setStreakStarted] = useState<Date | null>(null);
  const [hasShownPermissionDialog, setHasShownPermissionDialog] =
    useState(false);
  const [hasCheckedToday, setHasCheckedToday] = useState<boolean | null>(null);
  const [pledgeModalVisible, setPledgeModalVisible] = useState(false);
  const [isPledged, setIsPledged] = useState(false);
  const [blockerEnabled, setBlockerEnabled] = useState(false);
  const [blockerLoading, setBlockerLoading] = useState(false);

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;
  const rotationAnim = useRef(new Animated.Value(0)).current;

  // Initialize streakStarted from database when component mounts
  useEffect(() => {
    const initStreakStarted = async () => {
      if (user) {
        try {
          // Get streak started date from the server through the API
          const response = await getUserStreakStarted(user._id);

          if (response.success && response.data) {
            // Set the streak started date from the API
            setStreakStarted(new Date(response.data));
          } else if (lastRelapse) {
            // If we have a lastRelapse but no streakStarted, use lastRelapse as start date
            const startDate = new Date(lastRelapse);
            setStreakStarted(startDate);
            // Update the database with this date
            await updateUserStreakStarted(user._id, startDate.toISOString());
          } else {
            // If no data exists, set streakStarted to now
            const now = new Date();
            setStreakStarted(now);
            // Save this date to the database
            await updateUserStreakStarted(user._id, now.toISOString());
          }
        } catch (err) {
          console.error("Failed to load streak start date:", err);
          // If we can't load the streak started date, use a fallback
          if (lastRelapse) {
            setStreakStarted(new Date(lastRelapse));
          } else {
            setStreakStarted(new Date());
          }
        }
      }
    };

    initStreakStarted();
  }, [user, lastRelapse]);

  // Calculate time elapsed since streak started
  useEffect(() => {
    const formatTop = (totalSeconds: number) => {
      const days = Math.floor(totalSeconds / 86400);
      const hours = Math.floor((totalSeconds % 86400) / 3600);
      const minutes = Math.floor((totalSeconds % 3600) / 60);
      const seconds = totalSeconds % 60;
      if (days > 0) return `${days} days`;
      if (hours > 0) return `${hours} hours`;
      if (minutes > 0) return `${minutes} minutes`;
      return `${seconds} seconds`;
    };
    const formatBottom = (totalSeconds: number) => {
      const days = Math.floor(totalSeconds / 86400);
      const hours = Math.floor((totalSeconds % 86400) / 3600);
      const minutes = Math.floor((totalSeconds % 3600) / 60);
      const seconds = totalSeconds % 60;
      if (days > 0) return `${hours}hr ${minutes}m ${seconds}s`;
      if (hours > 0) return `${minutes}m ${seconds}s`;
      if (minutes > 0) return `${seconds}s`;
      return "";
    };
    const calculateTimeElapsed = () => {
      if (!streakStarted) return;
      const now = new Date();
      const startDate =
        streakStarted instanceof Date ? streakStarted : new Date(streakStarted);
      const diffInMs = now.getTime() - startDate.getTime();
      const totalSeconds = Math.floor(diffInMs / 1000);
      setSeconds(totalSeconds);
      setTimeElapsed({
        top: formatTop(totalSeconds),
        bottom: formatBottom(totalSeconds),
      });
    };
    calculateTimeElapsed();
    const timer = setInterval(calculateTimeElapsed, 1000);
    return () => clearInterval(timer);
  }, [streakStarted]);

  // Load user data when the component mounts
  useEffect(() => {
    if (user) {
      loadData();
    }

    // Start animations
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
        easing: Easing.out(Easing.cubic),
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
        easing: Easing.out(Easing.cubic),
      }),
    ]).start();
  }, [user]);

  // Function to load user data with error handling
  const loadData = async () => {
    if (user?._id) {
      setIsRefreshing(true);
      setLocalError(null);
      try {
        await loadUserData(user._id);
        await loadCheckIns(user._id);

        // After loading data, get the streak start date
        const response = await getUserStreakStarted(user._id);

        if (response.success && response.data) {
          // Set the streak started date from the API
          setStreakStarted(new Date(response.data));
        } else if (lastRelapse) {
          // If we have a lastRelapse but no streakStarted, use lastRelapse as start date
          const startDate = new Date(lastRelapse);
          setStreakStarted(startDate);
          // Update the database with this date
          await updateUserStreakStarted(user._id, startDate.toISOString());
        } else {
          // If no data exists, set streakStarted to now
          const now = new Date();
          setStreakStarted(now);
          // Save this date to the database
          await updateUserStreakStarted(user._id, now.toISOString());
        }

        // If there was an error loading from the store, check if we have local data
        if (error) {
          // Check for data in AsyncStorage directly
          const streakDataString = await AsyncStorage.getItem(
            `streak_data_${user._id}`,
          );
          if (streakDataString) {
            // We have local data, so no need to show an error
            setLocalError(null);
          } else {
            // No local data, show the error
            setLocalError(error);
          }
        }

        // Update achievements based on current streak
        try {
          // Calculate current streak in days
          const currentStreak = Math.floor(seconds / 86400);

          // Update achievement progress
          await achievementModule.updateAchievementProgress(user._id, {
            streakDays: currentStreak,
            streakStarted: streakStarted?.toISOString(),
          });
        } catch (achievementError) {
          console.error("Failed to update achievements:", achievementError);
          // Don't let achievement errors interrupt the main flow
        }
      } catch (err) {
        console.error("Failed to load data:", err);
        setLocalError("Failed to load your streak data. Please try again.");
      } finally {
        setIsRefreshing(false);
      }
    }
  };

  // Handle reporting a relapse
  const handleReportRelapse = async () => {
    Alert.alert(
      "Reset Streak",
      "Are you sure you want to reset your streak?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Reset",
          onPress: async () => {
            try {
              if (!user) return;

              const now = new Date();
              const nowIso = now.toISOString();

              // Update the database with new relapse timestamp
              const relapseResult = await reportRelapse(user._id, nowIso);

              // Reset streakStarted to now and save to database via API
              setStreakStarted(now);
              await updateUserStreakStarted(user._id, nowIso);

              // Reload data to update the UI
              await loadData();
            } catch (error) {
              console.error("Error reporting relapse:", error);
            }
          },
        },
      ],
      { cancelable: true },
    );
  };

  // Brainpower calculation (simplified for display purposes)
  const brainPower = Math.min(
    Math.floor((seconds / (24 * 60 * 60 * 30)) * 100),
    100,
  ); // Assumes 100% after 30 days

  // Find next achievement milestone
  const getNextMilestone = () => {
    // Common milestone days from the app's achievement system
    const milestoneDays = [1, 3, 7, 10, 14, 21, 30, 45, 60, 90, 100, 180, 365];

    // Current streak in days
    const currentDays = Math.floor(seconds / 86400);

    // Find the next milestone
    const nextMilestone = milestoneDays.find((days) => days > currentDays);

    return {
      days: nextMilestone || 365, // Default to a year if all completed
      progress: nextMilestone ? (currentDays / nextMilestone) * 100 : 100,
      current: currentDays,
    };
  };

  const nextMilestone = getNextMilestone();

  // Add rotation animation
  useEffect(() => {
    Animated.loop(
      Animated.timing(rotationAnim, {
        toValue: 1,
        duration: 25000, // very slow rotation (25 seconds per rotation)
        useNativeDriver: true,
        easing: Easing.linear,
      }),
    ).start();
  }, []);

  // Rotation interpolation
  const spin = rotationAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  // Check if user has checked in today
  useEffect(() => {
    const checkIfCheckedInToday = async () => {
      if (!user?._id) {
        return;
      }

      // Restore subscription check
      if (!user.isSubscribed) {
        return;
      }

      // Check if this is the user's first day and they were automatically checked in
      try {
        const isAutoCheckedIn = await isFirstDayAutoCheckin(user._id);

        if (isAutoCheckedIn) {
          setHasCheckedToday(true);
          return;
        } else {
          // It's not the first day anymore, clear the flag
          await clearFirstDayAutoCheckin(user._id);
        }
      } catch (error) {
        console.error(
          "DEBUG: HomeScreen - Error checking auto check-in flag:",
          error,
        );
      }

      // Check if user has already taken an action today (either check-in or relapse)
      const now = new Date();
      let hasActionToday = false;

      // Check if there's a check-in from today
      if (lastCheckIn) {
        const checkInDate = new Date(lastCheckIn);
        const isCheckInToday =
          checkInDate.getFullYear() === now.getFullYear() &&
          checkInDate.getMonth() === now.getMonth() &&
          checkInDate.getDate() === now.getDate();

        if (isCheckInToday) {
          hasActionToday = true;
        }
      }

      // Check if there's a relapse from today
      if (lastRelapse && !hasActionToday) {
        const relapseDate = new Date(lastRelapse);
        const isRelapseToday =
          relapseDate.getFullYear() === now.getFullYear() &&
          relapseDate.getMonth() === now.getMonth() &&
          relapseDate.getDate() === now.getDate();

        if (isRelapseToday) {
          hasActionToday = true;
        }
      }

      setHasCheckedToday(hasActionToday);

      // Only navigate to check-in if user hasn't taken any action today
      if (!hasActionToday) {
        navigation.navigate("CheckIn");
      }

      // No previous check-in or relapse, user needs to check in
      setHasCheckedToday(false);
      navigation.navigate("CheckIn");
    };

    // Only run the check if we're not loading and have user data
    if (!loading && user?._id) {
      checkIfCheckedInToday();
    } else {
    }
  }, [lastCheckIn, lastRelapse, navigation, loading, user]);

  const handleMeditate = () => {
    navigation.navigate("BreathingCountdown");
  };

  const handleAnalytics = () => {
    navigation.navigate("History");
  };

  const handleAchievementsPress = () => {
    navigation.navigate("AchievementsScreen");
  };

  const handlePledge = () => {
    setPledgeModalVisible(true);
  };

  const handlePledgeNow = () => {
    Alert.alert(
      "Confirm Pledge",
      "Are you sure you want to pledge for today?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Yes",
          onPress: () => {
            setIsPledged(true);
            setPledgeModalVisible(false);
          },
        },
      ],
    );
  };

  const handleTestAchievement = async () => {
    if (!user) {
      return;
    }

    try {
      await loadAchievements(user._id);

      // Find an unlocked streak achievement with the lowest requirement
      const nextStreakAchievement = achievements
        .filter(
          (a) =>
            a.category === "streak" &&
            !a.unlocked &&
            typeof a.requirement === "number",
        )
        .sort(
          (a, b) => (a.requirement as number) - (b.requirement as number),
        )[0];

      if (!nextStreakAchievement) {
        return;
      }

      // Update achievements with the required streak days
      const requiredDays = nextStreakAchievement.requirement as number;

      await checkAndUpdateAchievements(user._id, requiredDays);
    } catch (error) {
      console.error("Failed to test achievement:", error);
    }
  };

  // Define styles outside component to avoid re-creation
  const quittrStyles = StyleSheet.create({
    featureCard: {
      backgroundColor: "#1E1F2E",
      borderRadius: 20,
      marginBottom: 16,
      marginHorizontal: 16,
      overflow: "hidden",
      shadowColor: "#000",
      shadowOffset: {
        width: 0,
        height: 4,
      },
      shadowOpacity: 0.15,
      shadowRadius: 8,
      elevation: 4,
    },
    featureCardContent: {
      padding: 20,
    },
    featureHeader: {
      flexDirection: "row" as const,
      alignItems: "center",
      marginBottom: 16,
    },
    featureIconContainer: {
      width: 36,
      height: 36,
      borderRadius: 12,
      backgroundColor: "rgba(255,255,255,0.08)",
      alignItems: "center",
      justifyContent: "center",
      marginRight: 12,
    },
    featureTitle: {
      color: "#FFF",
      fontSize: 18,
      fontWeight: "600",
      letterSpacing: 0.2,
    },
    featureSubtitle: {
      color: "rgba(255,255,255,0.6)",
      fontSize: 14,
      marginBottom: 16,
      lineHeight: 20,
    },
    gradientCard: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      height: "100%",
      opacity: 0.3,
    },
    newSessionButton: {
      flexDirection: "row" as const,
      alignItems: "center",
      backgroundColor: "rgba(255,255,255,0.06)",
      padding: 14,
      borderRadius: 12,
      marginTop: 8,
    },
    newSessionText: {
      color: "#FFF",
      marginLeft: 10,
      fontSize: 15,
      fontWeight: "500",
    },
    blockButton: {
      flexDirection: "row" as const,
      alignItems: "center",
      justifyContent: "space-between",
      backgroundColor: "rgba(255,255,255,0.06)",
      padding: 14,
      borderRadius: 12,
      marginTop: 8,
    },
    blockButtonText: {
      color: "#FFF",
      fontSize: 15,
      fontWeight: "500",
    },
    quoteContainer: {
      width: 320,
      alignSelf: "center",
      flexDirection: "row" as const,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: COLORS.dark,
      padding: 20,
      borderRadius: 12,
      marginTop: 34,
    },
    quoteText: {
      color: "#FFF",
      fontSize: 15,
      marginLeft: 10,
      fontWeight: "400",
      letterSpacing: 0.2,
      textAlign: "center",
    },
    todoSection: {
      marginVertical: 24,
      marginHorizontal: 16,
    },
    sectionHeader: {
      flexDirection: "row" as const,
      alignItems: "center",
      marginBottom: 16,
      paddingHorizontal: 4,
    },
    sectionTitle: {
      marginLeft: 8,
      color: "rgba(255,255,255,0.9)",
      fontSize: 16,
      fontWeight: "600",
      letterSpacing: 0.5,
      textTransform: "uppercase" as const,
    },
    todoItem: {
      flexDirection: "row" as const,
      alignItems: "center",
      justifyContent: "space-between",
      backgroundColor: COLORS.dark,
      padding: 16,
      borderRadius: 12,
      marginBottom: 8,
    },
    todoLeft: {
      flexDirection: "row" as const,
      alignItems: "center",
      flex: 1,
    },
    todoTextContainer: {
      marginLeft: 12,
      flex: 1,
    },
    todoTitle: {
      color: "#FFF",
      fontSize: 15,
      fontWeight: "500",
      marginBottom: 2,
    },
    todoSubtitle: {
      color: "rgba(255,255,255,0.5)",
      fontSize: 13,
      lineHeight: 18,
    },
    todoCheckbox: {
      width: 20,
      height: 20,
      borderRadius: 6,
      borderWidth: 1.5,
      borderColor: "rgba(255,255,255,0.3)",
      marginLeft: 12,
    },
    menuItem: {
      flexDirection: "row" as const,
      alignItems: "center",
      justifyContent: "space-between",
      backgroundColor: COLORS.dark,
      padding: 16,
      borderRadius: 12,
      marginBottom: 8,
    },
    menuItemLeft: {
      flexDirection: "row" as const,
      alignItems: "center",
      flex: 1,
    },
    menuTextContainer: {
      marginLeft: 12,
      flex: 1,
    },
    menuTitle: {
      color: "#FFF",
      fontSize: 15,
      fontWeight: "500",
      marginBottom: 2,
    },
    menuSubtitle: {
      color: "rgba(255,255,255,0.5)",
      fontSize: 13,
      lineHeight: 18,
    },
    panicButton: {
      flexDirection: "row" as const,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: "#D32F2F",
      padding: 16,
      borderRadius: 12,
      marginHorizontal: 16,
      marginVertical: 24,
      opacity: 0.9,
    },
    panicButtonText: {
      color: "#FFF",
      fontSize: 15,
      fontWeight: "600",
      marginLeft: 10,
      letterSpacing: 0.5,
    },
    scrollView: {
      flex: 1,
      backgroundColor: "#13141F",
    },
    container: {
      flex: 1,
      backgroundColor: "#13141F",
    },
    quoteSection: {
      marginVertical: 24,
      marginHorizontal: 16,
    },
    quoteCard: {
      backgroundColor: "rgba(255,255,255,0.06)",
      padding: 20,
      borderRadius: 12,
      marginTop: 0,
    },
    quoteText: {
      color: "#FFF",
      fontSize: 16,
      fontWeight: "500",
      fontStyle: "italic",
      textAlign: "center",
      lineHeight: 24,
    },
  });

  // Update the card components with more subtle gradients
  const AITherapistCard = () => (
    <TouchableOpacity style={quittrStyles.featureCard}>
      <LinearGradient
        colors={["#2D2F45", "#1E1F2E"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={quittrStyles.gradientCard}
      />
      <View style={quittrStyles.featureCardContent}>
        <View style={quittrStyles.featureHeader}>
          <View style={quittrStyles.featureIconContainer}>
            <Ionicons name="cloud" size={20} color="rgba(255,255,255,0.9)" />
          </View>
          <Text style={quittrStyles.featureTitle}>Speak to Melius</Text>
        </View>
        <Text style={quittrStyles.featureSubtitle}>
          Our 24/7 therapist who specialized in porn addiction
        </Text>
        <View style={quittrStyles.newSessionButton}>
          <Ionicons name="add" size={18} color="rgba(255,255,255,0.9)" />
          <Text style={quittrStyles.newSessionText}>New Session</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  // const ContentBlockerCard = () => (
  //   <TouchableOpacity style={quittrStyles.featureCard}>
  //     <LinearGradient
  //       colors={["#2D2F45", "#1E1F2E"]}
  //       start={{ x: 0, y: 0 }}
  //       end={{ x: 1, y: 1 }}
  //       style={quittrStyles.gradientCard}
  //     />
  //     <View style={quittrStyles.featureCardContent}>
  //       <View style={quittrStyles.featureHeader}>
  //         <View style={quittrStyles.featureIconContainer}>
  //           <Ionicons name="shield" size={20} color="rgba(255,255,255,0.9)" />
  //         </View>
  //         <Text style={quittrStyles.featureTitle}>NSFW Content Blocker</Text>
  //       </View>
  //       <Text style={quittrStyles.featureSubtitle}>
  //         Block 1M+ porn websites from your browser.
  //       </Text>
  //       <View style={quittrStyles.blockButton}>
  //         <Text style={quittrStyles.blockButtonText}>
  //           Visit Content Blocker
  //         </Text>
  //         <Ionicons
  //           name="chevron-forward"
  //           size={18}
  //           color="rgba(255,255,255,0.9)"
  //         />
  //       </View>
  //     </View>
  //   </TouchableOpacity>
  // );

  const DailyQuoteCard = () => (
    <TouchableOpacity style={quittrStyles.featureCard}>
      <LinearGradient
        colors={["#2D2F45", "#1E1F2E"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={quittrStyles.gradientCard}
      />
      <View style={quittrStyles.featureCardContent}>
        <View style={quittrStyles.featureHeader}>
          <View style={quittrStyles.featureIconContainer}>
            <Ionicons name="flower" size={20} color="rgba(255,255,255,0.9)" />
          </View>
          <Text style={quittrStyles.featureTitle}>
            Daily Motivational Quote
          </Text>
        </View>
        <View style={quittrStyles.quoteContainer}>
          <Ionicons
            name="flower-outline"
            size={18}
            color="rgba(255,255,255,0.9)"
          />
          <Text style={quittrStyles.quoteText}>
            Dream it. Believe it. Build it.
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const MainSection = () => {
    const navigation = useNavigation();

    const handleBlogPress = () => {
      Linking.openURL("https://pureresist.com/blog");
    };

    return (
      <View style={quittrStyles.todoSection}>
        <View style={quittrStyles.sectionHeader}>
          <Ionicons name="apps" size={24} color="#FFF" />
          <Text style={quittrStyles.sectionTitle}>Main</Text>
        </View>

        <TouchableOpacity
          style={quittrStyles.menuItem}
          onPress={() => navigation.navigate("Journal")}
        >
          <View style={quittrStyles.menuItemLeft}>
            <Ionicons name="journal" size={24} color="#9C27B0" />
            <View style={quittrStyles.menuTextContainer}>
              <Text style={quittrStyles.menuTitle}>Journaling</Text>
              <Text style={quittrStyles.menuSubtitle}>
                Document your journey and track your progress
              </Text>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={24} color="#FFF" />
        </TouchableOpacity>

        <TouchableOpacity
          style={quittrStyles.menuItem}
          onPress={() => navigation.navigate("Learn")}
        >
          <View style={quittrStyles.menuItemLeft}>
            <Ionicons name="book" size={24} color="#2196F3" />
            <View style={quittrStyles.menuTextContainer}>
              <Text style={quittrStyles.menuTitle}>Learn</Text>
              <Text style={quittrStyles.menuSubtitle}>
                Educational content to support your recovery
              </Text>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={24} color="#FFF" />
        </TouchableOpacity>

        <TouchableOpacity
          style={quittrStyles.menuItem}
          onPress={() => navigation.navigate("Library")}
        >
          <View style={quittrStyles.menuItemLeft}>
            <Ionicons name="library" size={24} color="#FF9800" />
            <View style={quittrStyles.menuTextContainer}>
              <Text style={quittrStyles.menuTitle}>Library</Text>
              <Text style={quittrStyles.menuSubtitle}>
                Access our collection of recovery resources
              </Text>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={24} color="#FFF" />
        </TouchableOpacity>

        <TouchableOpacity
          style={quittrStyles.menuItem}
          onPress={() => navigation.navigate("BreathingCountdown")}
        >
          <View style={quittrStyles.menuItemLeft}>
            <MaterialCommunityIcons name="meditation" size={32} color="#fff" />
            <View style={quittrStyles.menuTextContainer}>
              <Text style={quittrStyles.menuTitle}>Meditation</Text>
              <Text style={quittrStyles.menuSubtitle}>
                Guided breathing and meditation exercises
              </Text>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={24} color="#FFF" />
        </TouchableOpacity>

        <TouchableOpacity
          style={quittrStyles.menuItem}
          onPress={() => navigation.navigate("AchievementsScreen")}
        >
          <View style={quittrStyles.menuItemLeft}>
            <Ionicons name="trophy" size={24} color="#FFC107" />
            <View style={quittrStyles.menuTextContainer}>
              <Text style={quittrStyles.menuTitle}>Achievements</Text>
              <Text style={quittrStyles.menuSubtitle}>
                Track your milestones and earned badges
              </Text>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={24} color="#FFF" />
        </TouchableOpacity>

        <TouchableOpacity
          style={quittrStyles.menuItem}
          onPress={handleBlogPress}
        >
          <View style={quittrStyles.menuItemLeft}>
            <Ionicons name="document-text" size={24} color="#6BE4FF" />
            <View style={quittrStyles.menuTextContainer}>
              <Text style={quittrStyles.menuTitle}>Blog</Text>
              <Text style={quittrStyles.menuSubtitle}>
                Read our blog posts and get motivated
              </Text>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={24} color="#FFF" />
        </TouchableOpacity>
      </View>
    );
  };

  const QuoteSection = () => (
    <View style={quittrStyles.quoteSection}>
      <View style={quittrStyles.quoteCard}>
        <Text style={quittrStyles.quoteText}>
          "Discipline is choosing what you want most over what you want now."
        </Text>
      </View>
    </View>
  );

  const StatusCards = () => {
    const { streakStarted } = useStreakStore();
    const quitDate = streakStarted
      ? moment(streakStarted).add(60, "days").format("MMM D, YYYY")
      : moment().add(60, "days").format("MMM D, YYYY");

    return (
      <View style={styles.statusCardsContainer}>
        <View style={styles.statusCardsRow}>
          <View style={[styles.statusCard, { flex: 1 }]}>
            <View style={styles.statusCardContent}>
              <View style={styles.statusCardIconContainer}>
                <Ionicons name="calendar" size={24} color={COLORS.accent} />
              </View>
              <Text style={styles.statusCardTitle}>Projected Quit Date</Text>
              <Text style={styles.statusCardValue}>{quitDate}</Text>
            </View>
          </View>

          <View style={[styles.statusCard, { flex: 1 }]}>
            <View style={styles.statusCardContent}>
              <View style={styles.statusCardIconContainer}>
                <Ionicons name="heart" size={24} color="#FF4081" />
              </View>
              <Text style={styles.statusCardTitle}>Mental Health</Text>
              <Text style={styles.statusCardValue}>Improving</Text>
            </View>
          </View>
        </View>
      </View>
    );
  };

  const handleToggleBlocker = async (value: boolean) => {
    setBlockerLoading(true);
    try {
      if (!value) {
        // User is trying to disable the blocker
        const blockerFlag = await AsyncStorage.getItem("porn_blocker_enabled");
        if (blockerFlag === "true") {
          Alert.alert(
            "Action Not Allowed",
            "You cannot disable the porn blocker.",
          );
          setBlockerLoading(false);
          return;
        }
      }
      const avail = await checkWebContentBlockerAvailability();
      console.log("Is available", avail);
      if (!avail.available) {
        Alert.alert(
          "Not Supported",
          avail.error || "Family Controls not available on this device.",
        );
        setBlockerLoading(false);
        return;
      }

      const permissions = await requestWebContentBlockerAuthorization();
      console.warn(permissions, "permissions");
      if (value) {
        const res = await setWebContentBlockerBlockedDomains(BLOCKED_LIST);
        if (res.enabled) {
          setBlockerEnabled(true);
          // Persist blocker state in AsyncStorage
          await AsyncStorage.setItem("porn_blocker_enabled", "true");
          Alert.alert("Success", "Porn blocker enabled.");
        } else {
          Alert.alert("Error", res.error || "Failed to enable blocking");
          setBlockerEnabled(false);
        }
      } else {
        const res = await disableWebContentBlockerBlocking();
        if (res.disabled) {
          setBlockerEnabled(false);
          Alert.alert("Success", "Porn blocker disabled.");
        } else {
          Alert.alert("Error", res.error || "Failed to disable blocking");
        }
      }
    } catch (e: any) {
      Alert.alert("Error", e?.message || "Blocker error");
    } finally {
      setBlockerLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <AnimatedStars />
      <StatusBar barStyle="light-content" />
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {loading && !isRefreshing && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={COLORS.textPrimary} />
          </View>
        )}

        {localError && (
          <Card style={styles.errorCard}>
            <Body style={styles.errorText}>{localError}</Body>
            <Button
              title="Retry"
              onPress={loadData}
              variant="secondary"
              style={styles.retryButton}
            />
          </Card>
        )}

        <Animated.View
          style={{
            flex: 1,
            justifyContent: "space-between",
            alignItems: "center",
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
            width: "100%",
            marginTop: 0,
            paddingBottom: SPACING.sm,
          }}
        >
          <View style={styles.timerCardCentered}>
            <WeeklyCheckinView />
            <TouchableOpacity
              style={styles.lottieContainerCenteredLarge}
              onPress={handleAchievementsPress}
              activeOpacity={0.8}
            >
              <Video
                source={require("../assets/animation.mp4")}
                style={styles.timerLottieAnimation}
                resizeMode={ResizeMode.COVER}
                isLooping
                shouldPlay
              />
            </TouchableOpacity>

            <Text style={styles.pornFreeLabelCentered}>
              You've been porn-free for
            </Text>

            <Text style={styles.pornFreeTimer}>{timeElapsed.top}</Text>
            {timeElapsed.bottom ? (
              <View style={styles.timerPill}>
                <Text style={styles.timerPillText}>{timeElapsed.bottom}</Text>
              </View>
            ) : null}
          </View>
        </Animated.View>

        <View style={styles.bottomActionRow}>
          <TouchableOpacity
            style={styles.bottomActionButton}
            onPress={handlePledge}
            disabled={isPledged}
          >
            {isPledged ? (
              <Ionicons
                name="checkmark-circle"
                size={32}
                color={COLORS.textPrimary}
              />
            ) : (
              <Ionicons name="hand-left-outline" size={32} color="#fff" />
            )}
            <Text style={styles.bottomActionLabel}>
              {isPledged ? "Pledged" : "Pledge"}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.bottomActionButton}
            onPress={handleMeditate}
          >
            <MaterialCommunityIcons name="meditation" size={32} color="#fff" />
            <Text style={styles.bottomActionLabel}>Meditate</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.bottomActionButton}
            onPress={handleReportRelapse}
          >
            <Ionicons name="refresh" size={32} color="#fff" />
            <Text style={styles.bottomActionLabel}>Reset</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.bottomActionButton}
            onPress={handleAnalytics}
          >
            <Ionicons name="stats-chart" size={24} color={COLORS.textPrimary} />
            <Text style={styles.bottomActionLabel}>Analytics</Text>
          </TouchableOpacity>
        </View>

        {/* Add new QUITTR components */}
        <View style={quittrStyles.quoteContainer}>
          <Text style={quittrStyles.quoteText}>
            💪 You are stronger than you think{" "}
          </Text>
        </View>
        <TodoSection />
        <StatusCards />
        <MainSection />
        <QuoteSection />

        <View
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          <Text style={{ fontSize: 18, marginBottom: 16, color: "white" }}>
            Porn Blocker
          </Text>
          <Switch
            value={blockerEnabled}
            onValueChange={handleToggleBlocker}
            disabled={blockerLoading}
          />
        </View>
      </ScrollView>
      <PledgeModal
        visible={pledgeModalVisible}
        onClose={() => setPledgeModalVisible(false)}
        onPledge={handlePledgeNow}
      />
      {/* <TouchableOpacity
        style={[styles.button, { position: 'absolute', bottom: 20, right: 20, zIndex: 999 }]}
        onPress={handleTestAchievement}
      >
        <Text style={styles.buttonText}>Test Achievement</Text>
      </TouchableOpacity> */}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.sm,
    height: 60,
  },
  logoText: {
    color: COLORS.textPrimary,
    fontSize: 24,
    fontWeight: "bold",
    letterSpacing: 1,
  },
  headerSpacer: {
    flex: 1,
  },
  profileButton: {
    padding: SPACING.xs,
    marginLeft: SPACING.lg,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: SPACING.xl,
  },
  loadingContainer: {
    padding: SPACING.sm,
    alignItems: "center",
    width: "100%",
  },
  errorCard: {
    margin: SPACING.sm,
    padding: SPACING.sm,
    backgroundColor: COLORS.danger + "20",
    borderColor: COLORS.danger,
    borderWidth: 1,
  },
  errorText: {
    color: COLORS.danger,
    marginBottom: SPACING.sm,
  },
  retryButton: {
    marginTop: SPACING.sm,
  },
  timerContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginBottom: SPACING.lg,
    marginTop: SPACING.xxl,
    width: 200,
    height: 200,
    alignSelf: "center",
    position: "relative",
  },
  staticRing: {
    position: "absolute",
    width: 200,
    height: 200,
    borderRadius: 100,
    borderWidth: 1,
    borderColor: COLORS.accent + "30",
    top: 0,
    left: 0,
  },
  circularTimer: {
    width: 200,
    height: 200,
    borderRadius: 100,
    alignItems: "center",
    justifyContent: "center",
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    backgroundColor: "transparent",
  },
  circularTimerInner: {
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: "#000000",
    alignItems: "center",
    justifyContent: "center",
  },
  timerTextContainer: {
    alignItems: "center",
    marginTop: SPACING.md,
    marginBottom: SPACING.sm,
  },
  timerLabel: {
    color: COLORS.textSecondary,
    fontSize: 20,
    marginBottom: SPACING.md,
    fontWeight: "500",
    textAlign: "center",
  },
  timeDisplay: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
    maxWidth: 320,
    gap: 8,
  },
  timeUnitContainer: {
    alignItems: "center",
    backgroundColor: COLORS.background,
    borderRadius: RADIUS.md,
    padding: SPACING.sm,
    minWidth: 64,
    minHeight: 85,
    justifyContent: "center",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  timeUnitValue: {
    color: COLORS.textPrimary,
    fontSize: 28,
    fontWeight: "bold",
  },
  timeUnitLabel: {
    color: COLORS.textSecondary,
    fontSize: 16,
    marginTop: 2,
  },
  timerValue: {
    color: COLORS.textPrimary,
    fontSize: 32,
    fontWeight: "bold",
    textAlign: "center",
  },
  actionsRow: {
    flexDirection: "row",
    justifyContent: "space-evenly",
    width: "100%",
    paddingHorizontal: SPACING.xs,
    marginBottom: SPACING.lg,
    marginTop: SPACING.lg,
  },
  actionButton: {
    alignItems: "center",
    width: 80,
    maxWidth: 80,
  },
  actionIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: COLORS.cardLight,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: SPACING.sm,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  actionButtonText: {
    color: COLORS.textPrimary,
    fontSize: 14,
    fontWeight: "500",
    marginTop: SPACING.xs,
    textAlign: "center",
  },
  brainRewiringContainer: {
    width: "100%",
    marginBottom: SPACING.lg,
    backgroundColor: COLORS.background,
    padding: SPACING.md,
    borderRadius: RADIUS.lg,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    paddingHorizontal: SPACING.xs,
    maxWidth: 320,
    alignSelf: "center",
  },
  brainRewiringHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: SPACING.md,
  },
  brainRewiringText: {
    color: COLORS.textPrimary,
    fontSize: 18,
    fontWeight: "bold",
  },
  brainRewiringPercentage: {
    color: COLORS.accent,
    fontSize: 18,
    fontWeight: "bold",
  },
  progressBarContainer: {
    height: 10,
    width: "100%",
    backgroundColor: COLORS.cardLight,
    borderRadius: RADIUS.sm,
    overflow: "hidden",
    marginBottom: SPACING.md,
  },
  progressBarFill: {
    height: "100%",
    backgroundColor: COLORS.accent,
    borderRadius: RADIUS.sm,
  },
  featuresContainer: {
    width: "100%",
    marginBottom: SPACING.md,
    gap: SPACING.sm,
    paddingHorizontal: SPACING.xs,
    maxWidth: 320,
    alignSelf: "center",
  },
  featuresHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: SPACING.md,
  },
  featuresHeaderText: {
    color: COLORS.textPrimary,
    fontSize: 18,
    fontWeight: "bold",
    marginLeft: SPACING.sm,
  },
  featureItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: COLORS.cardDark,
    padding: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.md,
    marginBottom: SPACING.xs,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  featureContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  featureIcon: {
    marginRight: SPACING.md,
  },
  featureTitle: {
    color: COLORS.textPrimary,
    fontSize: 16,
    fontWeight: "bold",
  },
  panicButton: {
    width: "100%",
    marginTop: SPACING.xl,
    marginBottom: SPACING.xl,
    borderRadius: RADIUS.md,
    elevation: 8,
    shadowColor: COLORS.danger,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    overflow: "hidden",
  },
  panicButtonGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    width: "100%",
    height: 60,
  },
  panicButtonIcon: {
    marginRight: SPACING.md,
  },
  panicButtonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "bold",
    letterSpacing: 1,
  },
  achievementInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: SPACING.xs,
  },
  achievementInfoText: {
    color: COLORS.textSecondary,
    fontSize: 14,
  },
  viewAllText: {
    color: COLORS.accent,
    fontSize: 14,
    fontWeight: "600",
  },
  lottieContainer: {
    width: 220,
    height: 220,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: SPACING.sm,
    marginTop: -SPACING.xl,
  },
  lottieAnimation: {
    width: "100%",
    height: "100%",
  },
  sosButton: {
    width: "100%",
    marginTop: SPACING.xl,
    marginBottom: SPACING.lg,
    borderRadius: RADIUS.md,
    elevation: 8,
    shadowColor: COLORS.danger,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    overflow: "hidden",
  },
  sosButtonGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    width: "100%",
    height: 60,
  },
  sosButtonIcon: {
    marginRight: SPACING.md,
  },
  sosButtonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "bold",
    letterSpacing: 1,
  },
  goalsContainer: {
    width: "100%",
    marginBottom: SPACING.xl,
  },
  goalsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: SPACING.md,
  },
  goalsCard: {
    padding: SPACING.lg,
    backgroundColor: COLORS.cardDark,
  },
  goalsText: {
    color: COLORS.textPrimary,
    fontSize: 16,
    lineHeight: 24,
    marginBottom: SPACING.md,
  },
  goalsProgress: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: SPACING.md,
    paddingTop: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.cardLight,
  },
  goalsProgressText: {
    color: COLORS.textSecondary,
    fontSize: 14,
  },
  reviewButton: {
    backgroundColor: COLORS.accent + "20",
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.sm,
  },
  reviewButtonText: {
    color: COLORS.accent,
    fontSize: 14,
    fontWeight: "500",
  },
  motivationContainer: {
    width: "100%",
    marginBottom: SPACING.xl,
  },
  motivationCard: {
    padding: SPACING.lg,
    backgroundColor: COLORS.cardDark,
  },
  motivationHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: SPACING.md,
  },
  motivationTitle: {
    color: COLORS.textPrimary,
    fontSize: 18,
    fontWeight: "bold",
    marginLeft: SPACING.sm,
  },
  motivationQuote: {
    color: COLORS.textPrimary,
    fontSize: 16,
    lineHeight: 24,
    fontStyle: "italic",
    marginBottom: SPACING.sm,
  },
  motivationAuthor: {
    color: COLORS.textSecondary,
    fontSize: 14,
    textAlign: "right",
    marginBottom: SPACING.lg,
  },
  motivationDivider: {
    height: 1,
    backgroundColor: COLORS.cardLight,
    marginVertical: SPACING.lg,
  },
  motivationScience: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: SPACING.lg,
  },
  motivationScienceContent: {
    flex: 1,
    marginLeft: SPACING.md,
  },
  motivationScienceTitle: {
    color: COLORS.textPrimary,
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: SPACING.xs,
  },
  motivationScienceText: {
    color: COLORS.textSecondary,
    fontSize: 14,
    lineHeight: 20,
  },
  motivationButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.accent + "20",
    padding: SPACING.md,
    borderRadius: RADIUS.md,
  },
  motivationButtonText: {
    color: COLORS.accent,
    fontSize: 16,
    fontWeight: "500",
    marginRight: SPACING.sm,
  },
  sectionTitle: {
    color: COLORS.textPrimary,
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: SPACING.md,
  },
  lottieTimerContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginTop: 0,
    marginBottom: SPACING.lg,
  },
  pornFreeLabel: {
    color: COLORS.textSecondary,
    fontSize: 16,
    fontWeight: "500",
    marginTop: -SPACING.md,
    marginBottom: 2,
    textAlign: "center",
  },
  pornFreeTimer: {
    color: COLORS.textPrimary,
    fontSize: 44,
    fontWeight: "bold",
    textAlign: "center",
    marginVertical: 4,
    letterSpacing: 1,
  },
  resetButtonCentered: {
    marginTop: 12,
    backgroundColor: COLORS.cardLight,
    borderRadius: RADIUS.md,
    paddingHorizontal: 32,
    paddingVertical: 10,
    alignItems: "center",
    justifyContent: "center",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.12,
    shadowRadius: 2,
  },
  resetButtonTextCentered: {
    color: COLORS.accent,
    fontSize: 18,
    fontWeight: "bold",
    letterSpacing: 1,
  },
  timeDisplayCentered: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
    maxWidth: 320,
    gap: 8,
    marginTop: 8,
    marginBottom: 8,
  },
  timeUnitContainerCentered: {
    alignItems: "center",
    backgroundColor: COLORS.cardDark,
    borderRadius: RADIUS.md,
    padding: SPACING.sm,
    minWidth: 64,
    minHeight: 85,
    justifyContent: "center",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  timeUnitValueCentered: {
    color: COLORS.textPrimary,
    fontSize: 28,
    fontWeight: "bold",
  },
  timeUnitLabelCentered: {
    color: COLORS.textSecondary,
    fontSize: 16,
    marginTop: 2,
  },
  timerCardCentered: {
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.xl,
    marginBottom: SPACING.lg,
  },
  centeredQuote: {
    color: COLORS.textSecondary,
    fontSize: 16,
    textAlign: "center",
    marginBottom: SPACING.lg,
    fontStyle: "italic",
  },
  lottieContainerCenteredLarge: {
    width: 240,
    height: 240,
    alignItems: "center",
    justifyContent: "center",
    marginVertical: SPACING.lg,
    overflow: "hidden",
    borderRadius: 100,
  },
  pornFreeLabelCentered: {
    color: COLORS.textSecondary,
    fontSize: 16,
    fontWeight: "500",
    marginTop: SPACING.md,
    textAlign: "center",
  },
  timeDisplayCenteredV2: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
    maxWidth: 340,
    gap: 16,
    marginTop: 0,
    marginBottom: 0,
  },
  timeUnitContainerCenteredV2: {
    alignItems: "center",
    backgroundColor: COLORS.background,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    minWidth: 72,
    minHeight: 90,
    justifyContent: "center",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.13,
    shadowRadius: 3,
  },
  timeUnitValueCenteredV2: {
    color: COLORS.textPrimary,
    fontSize: 32,
    fontWeight: "bold",
  },
  timeUnitLabelCenteredV2: {
    color: COLORS.textSecondary,
    fontSize: 16,
    marginTop: 4,
  },
  resetTextLink: {
    color: COLORS.accent,
    fontSize: 16,
    fontWeight: "500",
    textAlign: "center",
    marginTop: 10,
    textDecorationLine: "underline",
    opacity: 0.85,
    letterSpacing: 0.5,
  },
  resetRow: {
    backgroundColor: COLORS.cardDark,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.md,
    alignSelf: "center",
    minWidth: 120,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  resetTextWhite: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "500",
    textAlign: "center",
    letterSpacing: 0.5,
  },
  timerLottieAnimation: {
    width: "100%",
    height: "100%",
    borderRadius: 100,
  },
  button: {
    backgroundColor: COLORS.accent,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    borderRadius: RADIUS.md,
    alignItems: "center",
    justifyContent: "center",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "center",
    width: "100%",
    paddingHorizontal: SPACING.sm,
    marginTop: 10,
  },
  checkInButton: {
    backgroundColor: COLORS.accent + "20",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.md,
    flex: 1,
    marginRight: SPACING.sm,
  },
  checkInButtonText: {
    color: COLORS.accent,
    fontSize: 16,
    fontWeight: "500",
    letterSpacing: 0.5,
  },
  timerPill: {
    backgroundColor: COLORS.cardDark,
    borderRadius: RADIUS.lg,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    marginTop: SPACING.sm,
  },
  timerPillText: {
    color: COLORS.textSecondary,
    fontSize: 14,
    fontWeight: "500",
  },
  bottomActionRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    width: "100%",
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.xl,
  },
  bottomActionButton: {
    alignItems: "center",
    justifyContent: "center",
    padding: SPACING.md,
  },
  bottomActionLabel: {
    color: COLORS.textSecondary,
    fontSize: 12,
    marginTop: SPACING.xs,
    textAlign: "center",
  },
  mainSection: {
    width: "100%",
    padding: SPACING.md,
    marginBottom: SPACING.xl,
  },
  mainButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.cardLight,
    borderRadius: RADIUS.md,
    marginBottom: SPACING.sm,
  },
  mainButtonIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.cardLight,
    alignItems: "center",
    justifyContent: "center",
    marginRight: SPACING.md,
  },
  mainButtonContent: {
    flex: 1,
  },
  mainButtonTitle: {
    color: COLORS.textPrimary,
    fontSize: 16,
    fontWeight: "bold",
  },
  mainButtonSubtitle: {
    color: COLORS.textSecondary,
    fontSize: 14,
  },
  featureCardStyle: {
    backgroundColor: "#1A1B2E",
    borderRadius: 20,
    padding: 20,
    marginBottom: 15,
    marginHorizontal: 15,
  },
  featureHeaderStyle: {
    flexDirection: "row" as const,
    alignItems: "center",
    marginBottom: 10,
  },
  featureTitleStyle: {
    color: "#FFF",
    fontSize: 20,
    fontWeight: "bold",
    marginLeft: 10,
  },
  featureSubtitleStyle: {
    color: "#8E8E93",
    fontSize: 14,
    marginBottom: 15,
  },
  newSessionButton: {
    flexDirection: "row" as const,
    alignItems: "center",
    backgroundColor: "#2C2D3E",
    padding: 15,
    borderRadius: 25,
  },
  newSessionText: {
    color: "#FFF",
    marginLeft: 10,
    fontSize: 16,
  },
  blockButton: {
    flexDirection: "row" as const,
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#2C2D3E",
    padding: 15,
    borderRadius: 25,
  },
  blockButtonText: {
    color: "#FFF",
    fontSize: 16,
  },
  quoteContainer: {
    flexDirection: "row" as const,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#2C2D3E",
    padding: 20,
    borderRadius: 15,
  },
  quoteText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "500",
    fontStyle: "italic",
  },
  todoSection: {
    marginVertical: 15,
    marginHorizontal: 15,
  },
  sectionHeader: {
    flexDirection: "row" as const,
    alignItems: "center",
    marginBottom: 15,
  },
  sectionTitle: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "600",
    letterSpacing: 0.5,
    textTransform: "uppercase" as const,
    marginLeft: 10,
  },
  todoItem: {
    flexDirection: "row" as const,
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#1A1B2E",
    padding: 15,
    borderRadius: 15,
    marginBottom: 10,
  },
  todoLeft: {
    flexDirection: "row" as const,
    alignItems: "center",
    flex: 1,
  },
  todoTextContainer: {
    marginLeft: 15,
    flex: 1,
  },
  todoTitle: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "500",
  },
  todoSubtitle: {
    color: "#8E8E93",
    fontSize: 14,
    marginTop: 5,
  },
  todoCheckbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#FFF",
  },
  menuItem: {
    flexDirection: "row" as const,
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#1A1B2E",
    padding: 15,
    borderRadius: 15,
    marginBottom: 10,
  },
  menuItemLeft: {
    flexDirection: "row" as const,
    alignItems: "center",
    flex: 1,
  },
  menuTextContainer: {
    marginLeft: 15,
    flex: 1,
  },
  menuTitle: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "500",
  },
  menuSubtitle: {
    color: "#8E8E93",
    fontSize: 14,
    marginTop: 5,
  },
  mindfulnessSection: {
    marginVertical: 15,
    marginHorizontal: 15,
  },
  statusCardsContainer: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  statusCardsRow: {
    flexDirection: "row",
    gap: 12,
  },
  statusCard: {
    backgroundColor: COLORS.dark,
    borderRadius: 16,
    padding: 16,
  },
  statusCardIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "rgba(255,255,255,0.1)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
    alignSelf: "center",
  },
  statusCardContent: {
    alignItems: "center",
  },
  statusCardTitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 4,
    textAlign: "center",
  },
  statusCardValue: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.textPrimary,
    textAlign: "center",
  },
} as const);

export default HomeScreen;
