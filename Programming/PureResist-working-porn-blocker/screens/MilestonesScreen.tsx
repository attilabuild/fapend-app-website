import React, { useEffect, useState } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Animated,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Title, Subtitle, Body, Caption } from "../components/ui/Typography";
import Card from "../components/ui/Card";
import { COLORS, SPACING, RADIUS, FONTS } from "../utils/theme";
import { Ionicons } from "@expo/vector-icons";
import { useStreakStore } from "../hooks/useStore";

// Define milestone types
interface Milestone {
  id: string;
  title: string;
  description: string;
  daysRequired: number;
  icon: keyof typeof Ionicons.glyphMap;
  unlockedMessage: string;
  color: string;
  achieved: boolean;
}

// Define available milestones
const MILESTONES: Milestone[] = [
  {
    id: "1",
    title: "First Step",
    description: "Complete 1 day without relapsing",
    daysRequired: 1,
    icon: "rocket",
    unlockedMessage:
      "Great start! The journey of a thousand miles begins with a single step.",
    color: "#4285F4",
    achieved: false,
  },
  {
    id: "2",
    title: "Three Day Triumph",
    description: "Complete 3 days without relapsing",
    daysRequired: 3,
    icon: "trophy",
    unlockedMessage:
      "Your willpower is growing! The hardest part is getting started.",
    color: "#EA4335",
    achieved: false,
  },
  {
    id: "3",
    title: "One Week Warrior",
    description: "Complete 7 days without relapsing",
    daysRequired: 7,
    icon: "star",
    unlockedMessage:
      "Incredible! You've proven you can make it through the toughest first week!",
    color: "#FBBC05",
    achieved: false,
  },
  {
    id: "4",
    title: "Double Digit Hero",
    description: "Complete 10 days without relapsing",
    daysRequired: 10,
    icon: "shield",
    unlockedMessage:
      "Double digits! Your brain is starting its healing process.",
    color: "#34A853",
    achieved: false,
  },
  {
    id: "5",
    title: "Two Week Triumph",
    description: "Complete 14 days without relapsing",
    daysRequired: 14,
    icon: "medal",
    unlockedMessage:
      "Two weeks strong! Your willpower muscles are getting stronger every day.",
    color: "#9C27B0",
    achieved: false,
  },
  {
    id: "6",
    title: "Three Week Warrior",
    description: "Complete 21 days without relapsing",
    daysRequired: 21,
    icon: "flame",
    unlockedMessage:
      "21 days - you're forming a solid habit now! This is when real change begins.",
    color: "#FF9800",
    achieved: false,
  },
  {
    id: "7",
    title: "Monthly Master",
    description: "Complete 30 days without relapsing",
    daysRequired: 30,
    icon: "planet",
    unlockedMessage:
      "One month! Your brain chemistry is changing in amazing ways.",
    color: "#00BCD4",
    achieved: false,
  },
  {
    id: "8",
    title: "Six Week Sensation",
    description: "Complete 45 days without relapsing",
    daysRequired: 45,
    icon: "flash",
    unlockedMessage: "Six weeks! Incredible discipline and commitment.",
    color: "#3F51B5",
    achieved: false,
  },
  {
    id: "9",
    title: "Milestone Sixty",
    description: "Complete 60 days without relapsing",
    daysRequired: 60,
    icon: "diamond",
    unlockedMessage:
      "Two months! You're experiencing the full benefits of rewiring your brain.",
    color: "#607D8B",
    achieved: false,
  },
  {
    id: "10",
    title: "Ninety Day Knockout",
    description: "Complete 90 days without relapsing",
    daysRequired: 90,
    icon: "ribbon",
    unlockedMessage:
      "90 days! Scientists agree this is when your brain has significantly rewired.",
    color: "#8BC34A",
    achieved: false,
  },
  {
    id: "11",
    title: "Century Club",
    description: "Complete 100 days without relapsing",
    daysRequired: 100,
    icon: "trophy",
    unlockedMessage:
      "100 days! An extraordinary achievement few people reach. You are exceptional!",
    color: "#FF5722",
    achieved: false,
  },
  {
    id: "12",
    title: "Half Year Hero",
    description: "Complete 180 days without relapsing",
    daysRequired: 180,
    icon: "planet",
    unlockedMessage:
      "Half a year! You've transformed your life in profound ways.",
    color: "#795548",
    achieved: false,
  },
  {
    id: "13",
    title: "One Year Legend",
    description: "Complete 365 days without relapsing",
    daysRequired: 365,
    icon: "planet",
    unlockedMessage:
      "A FULL YEAR! You've achieved what many thought impossible. You're an inspiration!",
    color: "#9E9E9E",
    achieved: false,
  },
];

const MilestonesScreen = () => {
  const { currentStreak, longestStreak } = useStreakStore();
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [selectedMilestone, setSelectedMilestone] = useState<Milestone | null>(
    null,
  );
  const [confettiAnimation] = useState(new Animated.Value(0));

  // Update milestones based on current streak
  useEffect(() => {
    // Look at both current and longest streak to determine achievements
    const streakToUse = Math.max(currentStreak, longestStreak);

    // Mark milestones as achieved based on streak
    const updatedMilestones = MILESTONES.map((milestone) => ({
      ...milestone,
      achieved: streakToUse >= milestone.daysRequired,
    }));

    setMilestones(updatedMilestones);
  }, [currentStreak, longestStreak]);

  // Handle milestone selection
  const handleMilestonePress = (milestone: Milestone) => {
    setSelectedMilestone(milestone);

    // Trigger confetti animation if milestone is achieved
    if (milestone.achieved) {
      Animated.sequence([
        Animated.timing(confettiAnimation, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(confettiAnimation, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
          delay: 2000,
        }),
      ]).start();
    }
  };

  // Calculate progress to next milestone
  const getNextMilestone = () => {
    const nextMilestone = milestones.find((milestone) => !milestone.achieved);
    return nextMilestone;
  };

  // Render milestone details view
  const renderMilestoneDetails = () => {
    if (!selectedMilestone) return null;

    return (
      <View style={styles.detailsContainer}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => setSelectedMilestone(null)}
        >
          <Ionicons name="arrow-back" size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>

        <View style={styles.detailsContent}>
          {/* Milestone icon */}
          <View
            style={[
              styles.detailsIconContainer,
              { backgroundColor: selectedMilestone.color + "20" },
            ]}
          >
            <Ionicons
              name={selectedMilestone.icon}
              size={64}
              color={
                selectedMilestone.achieved
                  ? selectedMilestone.color
                  : COLORS.textTertiary
              }
            />

            {/* Confetti animation for achieved milestones */}
            {selectedMilestone.achieved && (
              <Animated.View
                style={[
                  styles.confetti,
                  {
                    opacity: confettiAnimation,
                    transform: [
                      {
                        scale: confettiAnimation.interpolate({
                          inputRange: [0, 1],
                          outputRange: [0.3, 1.2],
                        }),
                      },
                    ],
                  },
                ]}
              >
                <Ionicons
                  name="sparkles"
                  size={120}
                  color={selectedMilestone.color}
                />
              </Animated.View>
            )}
          </View>

          {/* Milestone info */}
          <Title style={styles.detailsTitle}>{selectedMilestone.title}</Title>

          <View style={styles.detailsBadge}>
            <Caption style={styles.daysBadgeText}>
              {selectedMilestone.daysRequired}{" "}
              {selectedMilestone.daysRequired === 1 ? "day" : "days"}
            </Caption>
          </View>

          <Body style={styles.detailsDescription}>
            {selectedMilestone.description}
          </Body>

          {/* Achievement state */}
          <Card
            style={[
              styles.achievementCard,
              {
                backgroundColor: selectedMilestone.achieved
                  ? selectedMilestone.color + "20"
                  : COLORS.cardLight,
              },
            ]}
          >
            <View style={styles.achievementContent}>
              <Ionicons
                name={
                  selectedMilestone.achieved
                    ? "checkmark-circle"
                    : "time-outline"
                }
                size={32}
                color={
                  selectedMilestone.achieved
                    ? selectedMilestone.color
                    : COLORS.textSecondary
                }
              />
              <View style={styles.achievementTextContainer}>
                <Subtitle style={styles.achievementTitle}>
                  {selectedMilestone.achieved
                    ? "Achievement Unlocked!"
                    : "Keep Going!"}
                </Subtitle>
                <Body style={styles.achievementDescription}>
                  {selectedMilestone.achieved
                    ? selectedMilestone.unlockedMessage
                    : `You need ${selectedMilestone.daysRequired - currentStreak} more days to unlock this milestone.`}
                </Body>
              </View>
            </View>
          </Card>
        </View>
      </View>
    );
  };

  // Render next milestone card for home screen
  const renderNextMilestoneCard = () => {
    const nextMilestone = getNextMilestone();

    if (!nextMilestone) {
      return (
        <Card style={styles.nextMilestoneCard}>
          <View style={styles.nextMilestoneContent}>
            <Title style={styles.congratsTitle}>Congratulations!</Title>
            <Body style={styles.congratsText}>
              You've completed all available milestones! What an incredible
              achievement!
            </Body>
          </View>
        </Card>
      );
    }

    const progress = (currentStreak / nextMilestone.daysRequired) * 100;
    const clampedProgress = Math.max(0, Math.min(progress, 100));

    return (
      <Card
        style={styles.nextMilestoneCard}
        onPress={() => handleMilestonePress(nextMilestone)}
      >
        <View style={styles.nextMilestoneContent}>
          <View style={styles.nextMilestoneHeader}>
            <Subtitle style={styles.nextMilestoneTitle}>
              Next Milestone
            </Subtitle>
            <Caption style={styles.nextMilestoneDays}>
              {nextMilestone.daysRequired} days
            </Caption>
          </View>

          <View style={styles.milestoneInfo}>
            <View
              style={[
                styles.milestoneIconContainer,
                { backgroundColor: nextMilestone.color + "20" },
              ]}
            >
              <Ionicons
                name={nextMilestone.icon}
                size={36}
                color={nextMilestone.color}
              />
            </View>

            <View style={styles.milestoneDetails}>
              <Title style={styles.milestoneTitle}>{nextMilestone.title}</Title>
              <Body style={styles.milestoneDescription} numberOfLines={2}>
                {nextMilestone.description}
              </Body>

              {/* Progress bar */}
              <View style={styles.progressBarContainer}>
                <View style={styles.progressBarBackground}>
                  <View
                    style={[
                      styles.progressBarFill,
                      {
                        width: `${clampedProgress}%`,
                        backgroundColor: nextMilestone.color,
                      },
                    ]}
                  />
                </View>
                <Caption style={styles.progressText}>
                  {currentStreak} / {nextMilestone.daysRequired} days
                </Caption>
              </View>
            </View>
          </View>
        </View>
      </Card>
    );
  };

  // Main render
  return (
    <SafeAreaView style={styles.container}>
      {selectedMilestone ? (
        renderMilestoneDetails()
      ) : (
        <>
          <View style={styles.header}>
            <Title>Milestones</Title>
            <Subtitle style={styles.subtitle}>Track your achievements</Subtitle>
          </View>

          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {renderNextMilestoneCard()}

            <Title style={styles.sectionTitle}>All Milestones</Title>

            <View style={styles.milestonesGrid}>
              {milestones.map((milestone) => (
                <TouchableOpacity
                  key={milestone.id}
                  style={[
                    styles.milestoneCard,
                    milestone.achieved && { borderColor: milestone.color },
                  ]}
                  onPress={() => handleMilestonePress(milestone)}
                >
                  <View
                    style={[
                      styles.milestoneCardIconContainer,
                      { backgroundColor: milestone.color + "20" },
                    ]}
                  >
                    <Ionicons
                      name={milestone.icon}
                      size={32}
                      color={
                        milestone.achieved
                          ? milestone.color
                          : COLORS.textTertiary
                      }
                    />
                    {milestone.achieved && (
                      <View style={styles.achievedBadge}>
                        <Ionicons
                          name="checkmark-circle"
                          size={18}
                          color={COLORS.success}
                        />
                      </View>
                    )}
                  </View>

                  <View style={styles.milestoneCardContent}>
                    <Caption style={styles.milestoneDays}>
                      {milestone.daysRequired}{" "}
                      {milestone.daysRequired === 1 ? "day" : "days"}
                    </Caption>
                    <Body
                      style={[
                        styles.milestoneCardTitle,
                        milestone.achieved && { color: COLORS.textPrimary },
                      ]}
                      numberOfLines={2}
                    >
                      {milestone.title}
                    </Body>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    paddingTop: SPACING.lg,
    paddingBottom: SPACING.md,
    paddingHorizontal: SPACING.md,
    alignItems: "center",
  },
  subtitle: {
    marginTop: SPACING.xs,
    color: COLORS.textSecondary,
  },
  scrollContent: {
    padding: SPACING.md,
    paddingBottom: SPACING.xl,
  },
  sectionTitle: {
    marginVertical: SPACING.md,
  },
  nextMilestoneCard: {
    marginBottom: SPACING.lg,
  },
  nextMilestoneContent: {
    padding: SPACING.md,
  },
  nextMilestoneHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: SPACING.sm,
  },
  nextMilestoneTitle: {
    color: COLORS.textSecondary,
  },
  nextMilestoneDays: {
    color: COLORS.textTertiary,
  },
  milestoneInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  milestoneIconContainer: {
    width: 60,
    height: 60,
    borderRadius: RADIUS.md,
    justifyContent: "center",
    alignItems: "center",
    marginRight: SPACING.md,
  },
  milestoneDetails: {
    flex: 1,
  },
  milestoneTitle: {
    fontSize: FONTS.sizes.lg,
    marginBottom: SPACING.xs,
  },
  milestoneDescription: {
    color: COLORS.textSecondary,
    fontSize: FONTS.sizes.sm,
    marginBottom: SPACING.sm,
  },
  progressBarContainer: {
    marginTop: SPACING.xs,
  },
  progressBarBackground: {
    height: 8,
    backgroundColor: COLORS.cardLight,
    borderRadius: 4,
    overflow: "hidden",
    marginBottom: SPACING.xs,
  },
  progressBarFill: {
    height: "100%",
    borderRadius: 4,
  },
  progressText: {
    color: COLORS.textTertiary,
    fontSize: FONTS.sizes.xs,
    textAlign: "right",
  },
  milestonesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  milestoneCard: {
    width: "48%",
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.md,
    padding: SPACING.sm,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.card,
  },
  milestoneCardIconContainer: {
    width: 48,
    height: 48,
    borderRadius: RADIUS.md,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: SPACING.sm,
    position: "relative",
  },
  achievedBadge: {
    position: "absolute",
    top: -6,
    right: -6,
    backgroundColor: COLORS.background,
    borderRadius: 12,
    padding: 2,
  },
  milestoneCardContent: {},
  milestoneDays: {
    color: COLORS.textTertiary,
    fontSize: FONTS.sizes.xs,
    marginBottom: SPACING.xs,
  },
  milestoneCardTitle: {
    fontSize: FONTS.sizes.md,
    color: COLORS.textSecondary,
  },
  detailsContainer: {
    flex: 1,
    padding: SPACING.md,
  },
  backButton: {
    alignSelf: "flex-start",
    marginBottom: SPACING.md,
  },
  detailsContent: {
    flex: 1,
    alignItems: "center",
  },
  detailsIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: SPACING.lg,
    position: "relative",
  },
  confetti: {
    position: "absolute",
    justifyContent: "center",
    alignItems: "center",
  },
  detailsTitle: {
    fontSize: FONTS.sizes.xl,
    textAlign: "center",
    marginBottom: SPACING.sm,
  },
  detailsBadge: {
    backgroundColor: COLORS.cardLight,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: RADIUS.md,
    marginBottom: SPACING.md,
  },
  daysBadgeText: {
    color: COLORS.textSecondary,
  },
  detailsDescription: {
    textAlign: "center",
    marginBottom: SPACING.xl,
    color: COLORS.textSecondary,
  },
  achievementCard: {
    width: "100%",
    marginTop: SPACING.md,
  },
  achievementContent: {
    flexDirection: "row",
    padding: SPACING.md,
    alignItems: "center",
  },
  achievementTextContainer: {
    flex: 1,
    marginLeft: SPACING.md,
  },
  achievementTitle: {
    marginBottom: SPACING.xs,
  },
  achievementDescription: {
    color: COLORS.textSecondary,
    fontSize: FONTS.sizes.sm,
  },
  congratsTitle: {
    textAlign: "center",
    marginBottom: SPACING.md,
  },
  congratsText: {
    textAlign: "center",
    color: COLORS.textSecondary,
  },
});

export default MilestonesScreen;
