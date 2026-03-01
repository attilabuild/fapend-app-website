import React, { useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { COLORS, SPACING, RADIUS } from "../utils/theme";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  useStreakStore,
  useAchievementStore,
  useAuthStore,
} from "../hooks/useStore";
import { Subtitle, Title } from "../components/ui/Typography";

// Achievement type definition
interface Achievement {
  id: string;
  _id?: string;
  title: string;
  description: string;
  requirement: number | string;
  icon: string;
  unlocked: boolean;
  category: "streak" | "journal" | "learning";
}

const AchievementsScreen = () => {
  const { currentStreak } = useStreakStore();
  const { achievements, loadAchievements, loading, refreshAchievements } =
    useAchievementStore();
  const { user } = useAuthStore();

  useEffect(() => {
    const loadData = async () => {
      if (user) {
        try {
          // First load achievements
          await loadAchievements(user._id);

          // Then refresh achievements (this updates progress and unlocks any new achievements)
          await refreshAchievements(user._id);
        } catch (error) {
          console.error("Failed to load achievements:", error);
        }
      }
    };

    loadData();
  }, [user, loadAchievements, refreshAchievements]);

  // Filter achievements by category
  const streakAchievements = achievements.filter(
    (a) => a.category === "streak",
  );
  const timeAchievements = achievements.filter(
    (a) => a.category === "time",
  );
  const journalAchievements = achievements.filter(
    (a) => a.category === "journal",
  );

  // Helper function to get category color
  const getCategoryColor = (category: string, isUnlocked: boolean) => {
    if (!isUnlocked) return COLORS.textTertiary;

    switch (category) {
      case "streak":
        return "#FF9500"; // Orange
      case "time":
        return "#4CAF50"; // Green
      case "journal":
        return "#5AC8FA"; // Blue
      default:
        return COLORS.accent;
    }
  };

  // Helper function to get badge background gradient colors
  const getBadgeGradient = (category: string, isUnlocked: boolean) => {
    if (!isUnlocked) return [COLORS.cardLight, COLORS.card];

    switch (category) {
      case "streak":
        return ["#FF9500", "#FF5E3A"]; // Orange to Red
      case "time":
        return ["#4CAF50", "#2E7D32"]; // Green to Dark Green
      case "journal":
        return ["#5AC8FA", "#007AFF"]; // Light Blue to Blue
      default:
        return [COLORS.accent, COLORS.accent];
    }
  };

  const renderAchievement = (achievement: Achievement) => {
    const isLocked = !achievement.unlocked;
    const categoryColor = getCategoryColor(achievement.category, !isLocked);

    return (
      <View
        key={achievement._id || achievement.id}
        style={[styles.achievementCard, isLocked ? styles.lockedCard : null]}
      >
        <View
          style={[
            styles.achievementIconContainer,
            {
              backgroundColor: isLocked ? COLORS.cardDark : COLORS.card,
              borderColor: categoryColor,
            },
          ]}
        >
          <View
            style={[
              styles.achievementIcon,
              {
                backgroundColor: isLocked
                  ? COLORS.cardLight
                  : categoryColor + "30",
              },
            ]}
          >
            <Text style={styles.iconText}>{achievement.icon}</Text>
          </View>
          {isLocked && (
            <View style={styles.lockOverlay}>
              <Text style={styles.lockIcon}>🔒</Text>
            </View>
          )}
        </View>
        <View style={styles.achievementInfo}>
          <Text
            style={[
              styles.achievementTitle,
              isLocked ? styles.lockedText : null,
            ]}
          >
            {achievement.title}
          </Text>
          <Text style={styles.achievementDescription}>
            {achievement.description}
          </Text>
          {typeof achievement.requirement === "number" &&
            achievement.category === "streak" && (
              <View style={styles.progressContainer}>
                <View
                  style={[
                    styles.progressBar,
                    {
                      width: `${Math.min(100, (currentStreak / achievement.requirement) * 100)}%`,
                      backgroundColor: isLocked
                        ? COLORS.textSecondary
                        : categoryColor,
                    },
                  ]}
                />
                <Text style={styles.progressText}>
                  {currentStreak}/{achievement.requirement} days
                </Text>
              </View>
            )}
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading achievements...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Find the next streak achievement to unlock
  const nextStreakAchievement = streakAchievements.find(
    (a) =>
      !a.unlocked &&
      typeof a.requirement === "number" &&
      a.requirement > currentStreak,
  );

  return (
    <>
      <View style={styles.header}>
        <Title>🏆 Achievements</Title>
        <Subtitle style={styles.subtitle}>
          Earn badges for your achievements
        </Subtitle>
      </View>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollViewContent}
      >
        <View style={styles.streakInfoCard}>
          <View style={styles.streakInfo}>
            <Text style={styles.currentStreakValue}>{currentStreak}</Text>
            <Text style={styles.currentStreakLabel}>Current Streak</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Streak Badges</Text>
        <View style={styles.achievementsContainer}>
          {streakAchievements.map((achievement) => (
            <React.Fragment key={achievement._id || achievement.id}>
              {renderAchievement(achievement)}
            </React.Fragment>
          ))}
        </View>

        <Text style={styles.sectionTitle}>Time Badges</Text>
        <View style={styles.achievementsContainer}>
          {timeAchievements.map((achievement) => (
            <React.Fragment key={achievement._id || achievement.id}>
              {renderAchievement(achievement)}
            </React.Fragment>
          ))}
        </View>

        <Text style={styles.sectionTitle}>Journal Badges</Text>
        <View style={styles.achievementsContainer}>
          {journalAchievements.map((achievement) => (
            <React.Fragment key={achievement._id || achievement.id}>
              {renderAchievement(achievement)}
            </React.Fragment>
          ))}
        </View>
      </ScrollView>
    </>
  );
};

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.md,
  },
  subtitle: {
    color: COLORS.textSecondary,
  },
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollView: {
    flex: 1,
  },

  scrollViewContent: {
    paddingHorizontal: SPACING.md,
    paddingBottom: SPACING.xl,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    fontSize: 16,
    color: COLORS.textSecondary,
  },
  streakInfoCard: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.md,
    padding: SPACING.lg,
    marginVertical: SPACING.md,
    justifyContent: "center",
    alignItems: "center",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    borderWidth: 1,
    borderColor: COLORS.cardLight,
  },
  streakInfo: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    width: 120,
    height: 120,
  },
  currentStreakValue: {
    fontSize: 48,
    fontWeight: "bold",
    color: COLORS.primary,
  },
  currentStreakLabel: {
    textAlign: "center",
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 8,
    fontWeight: "500",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLORS.textPrimary,
    marginTop: SPACING.lg,
    marginBottom: SPACING.sm,
  },
  achievementsContainer: {
    marginVertical: SPACING.xs,
  },
  achievementCard: {
    flexDirection: "row",
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    alignItems: "center",
    borderWidth: 1,
    borderColor: COLORS.cardLight,
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  lockedCard: {
    opacity: 0.75,
  },
  achievementIconContainer: {
    width: 60,
    height: 60,
    borderRadius: RADIUS.round,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
    marginRight: SPACING.md,
    position: "relative",
    padding: 2,
  },
  achievementIcon: {
    width: 50,
    height: 50,
    borderRadius: RADIUS.round,
    alignItems: "center",
    justifyContent: "center",
  },
  iconText: {
    fontSize: 24,
  },
  lockOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.65)",
    borderRadius: RADIUS.round,
    alignItems: "center",
    justifyContent: "center",
  },
  lockIcon: {
    fontSize: 20,
    color: COLORS.textPrimary,
  },
  achievementInfo: {
    flex: 1,
  },
  achievementTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: COLORS.textPrimary,
    marginBottom: 2,
  },
  lockedText: {
    color: COLORS.textSecondary,
  },
  achievementDescription: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 6,
  },
  progressContainer: {
    height: 8,
    backgroundColor: COLORS.background,
    borderRadius: RADIUS.round,
    marginTop: SPACING.sm,
    overflow: "hidden",
    position: "relative",
    width: "90%",
  },
  progressBar: {
    height: "100%",
    borderRadius: RADIUS.round,
  },
  progressText: {
    position: "absolute",
    right: 0,
    top: 10,
    fontSize: 12,
    fontWeight: "500",
    color: COLORS.textSecondary,
  },
});

export default AchievementsScreen;
