import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
  Alert,
  ActivityIndicator,
  Text,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useFocusEffect } from "@react-navigation/native";
import {
  useAuthStore,
  useStreakStore,
  useAchievementStore,
} from "../hooks/useStore";
import { Title, Subtitle, Body, Caption } from "../components/ui/Typography";
import Card from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { COLORS, SPACING, RADIUS, FONTS } from "../utils/theme";
import { Ionicons } from "@expo/vector-icons";

type RootStackParamList = {
  Home: undefined;
  Profile: undefined;
  Settings: undefined;
  History: undefined;
};

type Props = NativeStackScreenProps<RootStackParamList, "Profile">;

const ProfileScreen: React.FC<Props> = ({ navigation }) => {
  const { user, logout } = useAuthStore();
  const { loadUserData } = useStreakStore();

  const {
    achievements,
    loadAchievements,
    loading: achievementsLoading,
  } = useAchievementStore();

  const [isRefreshing, setIsRefreshing] = useState(false);

  // Load user data when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      loadProfileData();
      return () => {}; // Cleanup function
    }, []),
  );

  // Function to load all profile data
  const loadProfileData = async () => {
    if (!user?._id) {
      console.warn("Cannot load profile data: user or user._id is undefined");
      return;
    }

    setIsRefreshing(true);
    try {
      await loadUserData(user._id);
      await loadAchievements(user._id);
    } catch (err) {
      console.error("Failed to load profile data:", err);
    } finally {
      setIsRefreshing(false);
    }
  };

  // Get formatted registration date
  const getMemberSince = () => {
    if (!user || !user.createdAt) return "Unknown";
    const date = new Date(user.createdAt);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // Handle logout
  const handleLogout = () => {
    Alert.alert("Logout", "Are you sure you want to log out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Logout",
        style: "destructive",
        onPress: () => {
          logout();
          // Reset navigation to onboarding
          navigation.reset({
            index: 0,
            routes: [{ name: "Onboarding" }],
          });
        },
      },
    ]);
  };

  // Handle settings navigation
  const handleSettingsPress = () => {
    navigation.navigate("Settings");
  };

  // Achievements section
  const renderAchievementsList = () => {
    // Filter streak achievements and take only first 4
    const displayAchievements = achievements
      .filter((a) => a.category === "streak")
      .slice(0, 4);

    if (displayAchievements.length === 0) {
      return (
        <View style={styles.emptyContainer} key="empty-achievements">
          <Caption style={styles.emptyText}>Loading achievements...</Caption>
        </View>
      );
    }

    return (
      <View key="achievements-list">
        {displayAchievements.map((achievement, index) => (
          <View
            key={achievement.id || `achievement-${index}`}
            style={[
              styles.achievement,
              achievement.unlocked
                ? styles.achievedItem
                : styles.unachievedItem,
            ]}
          >
            <View
              style={[
                styles.achievementIcon,
                {
                  backgroundColor: achievement.unlocked
                    ? getCategoryColor(achievement.category, true) + "30"
                    : COLORS.cardLight,
                  borderColor: getCategoryColor(
                    achievement.category,
                    achievement.unlocked,
                  ),
                },
              ]}
            >
              <Text
                style={[
                  styles.iconText,
                  {
                    color: achievement.unlocked
                      ? getCategoryColor(achievement.category, true)
                      : COLORS.textTertiary,
                  },
                ]}
              >
                {achievement.icon}
              </Text>
            </View>
            <View style={styles.achievementContent}>
              <Body
                bold={achievement.unlocked}
                style={[
                  achievement.unlocked
                    ? styles.achievedText
                    : styles.unachievedText,
                  achievement.unlocked ? { color: COLORS.textPrimary } : {},
                ]}
              >
                {achievement.title}
              </Body>
              <Caption
                style={
                  achievement.unlocked
                    ? styles.achievedSubtext
                    : styles.unachievedSubtext
                }
              >
                {achievement.description}
              </Caption>
            </View>
            {achievement.unlocked && (
              <Ionicons
                name="checkmark-circle"
                size={24}
                color={getCategoryColor(achievement.category, true)}
              />
            )}
          </View>
        ))}
      </View>
    );
  };

  const getCategoryColor = (category: string, isUnlocked: boolean) => {
    if (!isUnlocked) return COLORS.textTertiary;

    switch (category) {
      case "streak":
        return "#FF9500"; // Orange
      case "journal":
        return "#5AC8FA"; // Blue
      default:
        return COLORS.accent;
    }
  };

  const loading = achievementsLoading || isRefreshing;
  const error = null; // No error handling for now since we removed streak error

  return (
    <>
      {(loading || isRefreshing) && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color={COLORS.accent} />
        </View>
      )}

      {error && (
        <View style={styles.errorContainer}>
          <Body style={styles.errorText}>{error}</Body>
          <Button
            title="Retry"
            onPress={loadProfileData}
            variant="secondary"
            style={styles.retryButton}
          />
        </View>
      )}

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* User Profile Section */}
        <Card style={styles.profileCard}>
          <View style={styles.profileHeader}>
            <View style={styles.profileImageContainer}>
              <View style={styles.profileImage}>
                <Ionicons
                  name="person"
                  size={40}
                  color={COLORS.textSecondary}
                />
              </View>
            </View>

            <View style={styles.profileInfo}>
              <Title style={styles.username}>{user?.username || "User"}</Title>
              <Caption style={styles.memberSince}>
                Member since: {getMemberSince()}
              </Caption>
            </View>
          </View>

          <TouchableOpacity
            style={styles.settingsButton}
            onPress={handleSettingsPress}
          >
            <Caption style={styles.settingsText}>Settings</Caption>
            <Ionicons
              name="settings-outline"
              size={18}
              color={COLORS.textPrimary}
            />
          </TouchableOpacity>
        </Card>

        {/* Achievements Section */}
        <Title style={styles.sectionTitle}>Achievements</Title>

        <Card style={styles.achievementsContainer}>
          {renderAchievementsList()}

          <TouchableOpacity
            style={styles.viewAllButton}
            onPress={() => navigation.navigate("AchievementsScreen")}
          >
            <Caption style={styles.viewAllText}>View All Achievements</Caption>
            <Ionicons name="chevron-forward" size={16} color={COLORS.accent} />
          </TouchableOpacity>
        </Card>
      </ScrollView>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: SPACING.md,
    paddingBottom: SPACING.xl * 2,
  },
  sectionTitle: {
    marginTop: SPACING.lg,
    marginBottom: SPACING.sm,
    paddingHorizontal: SPACING.xs,
  },
  profileCard: {
    marginTop: SPACING.sm,
    padding: SPACING.md,
  },
  profileHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: SPACING.md,
  },
  profileImageContainer: {
    marginRight: SPACING.lg,
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.cardLight,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: COLORS.accent,
  },
  profileInfo: {
    flex: 1,
  },
  username: {
    fontSize: FONTS.sizes.xl,
    marginBottom: SPACING.xs / 2,
  },
  memberSince: {
    color: COLORS.textSecondary,
    marginBottom: SPACING.sm,
  },
  settingsButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.textPrimary + "10",
    padding: SPACING.sm,
    borderRadius: RADIUS.md,
    marginTop: SPACING.sm,
  },
  settingsText: {
    color: COLORS.textPrimary,
    marginRight: SPACING.xs,
    fontWeight: "bold",
  },
  achievementsContainer: {
    padding: SPACING.md,
  },
  achievement: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.cardLight,
  },
  achievedItem: {
    opacity: 1,
  },
  unachievedItem: {
    opacity: 0.6,
  },
  achievementIcon: {
    width: 40,
    height: 40,
    borderRadius: RADIUS.round,
    alignItems: "center",
    justifyContent: "center",
    marginRight: SPACING.sm,
  },
  achievementContent: {
    flex: 1,
  },
  achievedText: {
    color: COLORS.textPrimary,
  },
  unachievedText: {
    color: COLORS.textSecondary,
  },
  achievedSubtext: {
    color: COLORS.textSecondary,
  },
  unachievedSubtext: {
    color: COLORS.textTertiary,
  },
  viewAllButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: SPACING.md,
    paddingVertical: SPACING.sm,
  },
  viewAllText: {
    color: COLORS.accent,
    fontWeight: "bold",
    marginRight: SPACING.xs,
  },
  backButton: {
    marginTop: SPACING.xl,
  },
  loadingOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.3)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
  },
  errorContainer: {
    backgroundColor: COLORS.danger + "20",
    padding: SPACING.md,
    margin: SPACING.md,
    borderRadius: RADIUS.md,
    alignItems: "center",
  },
  errorText: {
    color: COLORS.danger,
    textAlign: "center",
    marginBottom: SPACING.sm,
  },
  retryButton: {
    marginTop: SPACING.sm,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyText: {
    color: COLORS.textSecondary,
  },
  iconText: {
    fontSize: FONTS.sizes.lg,
    textAlign: "center",
  },
});

export default ProfileScreen;
