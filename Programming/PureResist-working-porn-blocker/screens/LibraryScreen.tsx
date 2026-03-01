import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Text,
  Linking,
  ImageBackground,
  StatusBar,
  ColorValue,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Audio } from "expo-av";
import { COLORS, SPACING } from "../utils/theme";
import { LinearGradient } from "expo-linear-gradient";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { AnimatedStars } from "../components/ui/AnimatedStars";

type Props = {
  navigation: any;
};

const CircleButton = ({
  icon,
  label,
  onPress,
  iconType = "Ionicons",
  color = "#FFF",
  backgroundColor = "rgba(255,255,255,0.2)",
}: {
  icon: any;
  label: string;
  onPress: () => void;
  iconType?: "Ionicons" | "MaterialCommunityIcons";
  color?: string;
  backgroundColor?: string;
}) => {
  return (
    <View style={styles.circleButtonContainer}>
      <TouchableOpacity
        style={[styles.circleButton, { backgroundColor }]}
        onPress={onPress}
      >
        {iconType === "Ionicons" ? (
          <Ionicons name={icon} size={24} color={color} />
        ) : (
          <MaterialCommunityIcons name={icon} size={24} color={color} />
        )}
      </TouchableOpacity>
      <Text style={[styles.circleButtonLabel, { color }]}>{label}</Text>
    </View>
  );
};

const RoundedButton = ({
  label,
  onPress,
  gradient = ["#FF9800", "#F57C00"] as [string, string],
}: {
  label: string;
  onPress: () => void;
  gradient?: [string, string];
}) => (
  <TouchableOpacity onPress={onPress} style={styles.roundedButtonContainer}>
    <LinearGradient
      colors={gradient}
      style={styles.roundedButtonGradient}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 0 }}
    >
      <Text style={styles.roundedButtonText}>{label}</Text>
    </LinearGradient>
  </TouchableOpacity>
);

// Create a sound player for each noise type
const soundPlayers: { [key: string]: Audio.Sound | null } = {
  rain: null,
  ocean: null,
  campfire: null,
  whiteNoise: null,
};

// const SOUND_FILES = {
//   rain: require("../assets/sounds/rain.mp3"),
//   ocean: require("../assets/animation.mp4"), // TODO: Add proper sound files
//   campfire: require("../assets/animation.mp4"),
//   whiteNoise: require("../assets/animation.mp4"),
// };

const NoiseButton = ({
  icon,
  label,
  onPress,
}: {
  icon: any;
  label: string;
  onPress: () => void;
}) => {
  return (
    <View style={styles.circleButtonContainer}>
      <TouchableOpacity
        style={[
          styles.circleButton,
          { backgroundColor: "rgba(255,255,255,0.15)" },
        ]}
        onPress={onPress}
      >
        <Ionicons name={icon} size={24} color="#FFF" />
      </TouchableOpacity>
      <Text style={[styles.circleButtonLabel, { color: "#FFF" }]}>{label}</Text>
    </View>
  );
};

interface Challenge {
  id: string;
  completedAt: number | null;
}

const STORAGE_KEY = "daily_challenges";

const ChallengeCard = ({
  title,
  description,
  icon,
  isCompleted,
  onPress,
}: {
  title: string;
  description: string;
  icon: string;
  isCompleted: boolean;
  onPress: () => void;
}) => (
  <TouchableOpacity
    onPress={onPress}
    style={[styles.challengeCard, isCompleted && styles.challengeCardCompleted]}
  >
    <View style={styles.challengeIcon}>
      <Text style={styles.challengeIconText}>{icon}</Text>
    </View>
    <View style={styles.challengeContent}>
      <Text style={styles.challengeTitle}>{title}</Text>
      <Text style={styles.challengeDescription}>{description}</Text>
    </View>
    {isCompleted && (
      <View style={styles.completedBadge}>
        <Text style={styles.completedText}>✓</Text>
      </View>
    )}
  </TouchableOpacity>
);

const FeaturedCard = ({
  title,
  description,
  gradient,
  onPress,
}: {
  title: string;
  description: string;
  gradient: [string, string];
  onPress: () => void;
}) => (
  <TouchableOpacity onPress={onPress} style={styles.featuredCard}>
    <LinearGradient
      colors={gradient}
      style={styles.featuredGradient}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <Text style={styles.featuredTitle}>{title}</Text>
      <Text style={styles.featuredDescription}>{description}</Text>
    </LinearGradient>
  </TouchableOpacity>
);

const CategoryCard = ({
  title,
  icon,
  count,
  onPress,
}: {
  title: string;
  icon: string;
  count: number;
  onPress: () => void;
}) => (
  <TouchableOpacity onPress={onPress} style={styles.categoryCard}>
    <View style={styles.categoryIcon}>
      <Text style={styles.categoryIconText}>{icon}</Text>
    </View>
    <Text style={styles.categoryTitle}>{title}</Text>
    <Text style={styles.categoryCount}>{count} items</Text>
  </TouchableOpacity>
);

const LibraryScreen = ({ navigation }: Props) => {
  const [completedChallenges, setCompletedChallenges] = useState<Challenge[]>(
    [],
  );

  useEffect(() => {
    loadChallenges();
    cleanupExpiredChallenges();
  }, []);

  const loadChallenges = async () => {
    try {
      const storedChallenges = await AsyncStorage.getItem(STORAGE_KEY);
      if (storedChallenges) {
        setCompletedChallenges(JSON.parse(storedChallenges));
      }
    } catch (error) {
      console.error("Error loading challenges:", error);
    }
  };

  const saveChallenges = async (challenges: Challenge[]) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(challenges));
    } catch (error) {
      console.error("Error saving challenges:", error);
    }
  };

  const cleanupExpiredChallenges = async () => {
    const currentTime = Date.now();
    const updatedChallenges = completedChallenges.filter((challenge) => {
      if (!challenge.completedAt) return true;
      const timeDiff = currentTime - challenge.completedAt;
      const hoursDiff = timeDiff / (1000 * 60 * 60); // Convert to hours
      return hoursDiff < 24;
    });

    if (updatedChallenges.length !== completedChallenges.length) {
      setCompletedChallenges(updatedChallenges);
      await saveChallenges(updatedChallenges);
    }
  };

  const toggleChallenge = async (challengeId: string) => {
    const currentTime = Date.now();
    let updatedChallenges: Challenge[];

    const existingChallenge = completedChallenges.find(
      (c) => c.id === challengeId,
    );
    if (existingChallenge) {
      // Remove the challenge if it exists
      updatedChallenges = completedChallenges.filter(
        (c) => c.id !== challengeId,
      );
    } else {
      // Add new challenge with completion timestamp
      updatedChallenges = [
        ...completedChallenges,
        { id: challengeId, completedAt: currentTime },
      ];
    }

    setCompletedChallenges(updatedChallenges);
    await saveChallenges(updatedChallenges);
  };

  const isChallengeCompleted = (challengeId: string) => {
    return completedChallenges.some((c) => c.id === challengeId);
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
        {/* Featured Content */}
        {/* <View style={styles.featuredSection}>
          <Text style={styles.sectionTitle}>Featured</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.featuredScrollContent}
          >
            <FeaturedCard
              title="30-Day Challenge"
              description="Join our guided program to build lasting habits"
              gradient={["#FF6B6B", "#FF8E53"]}
              onPress={() => navigation.navigate("Learn")}
            />
            <FeaturedCard
              title="Success Stories"
              description="Read inspiring stories from our community"
              gradient={["#4E65FF", "#92EFFD"]}
              onPress={() => navigation.navigate("Community")}
            />
            <FeaturedCard
              title="Mindfulness Course"
              description="Learn meditation techniques for urge control"
              gradient={["#6B4DFF", "#CD4FF7"]}
              onPress={() => navigation.navigate("Meditation")}
            />
          </ScrollView>
        </View> */}

        {/* Daily Challenges */}
        <View style={styles.challengesSection}>
          <Text style={styles.sectionTitle}>Daily Challenges</Text>
          <View style={styles.challengesList}>
            <ChallengeCard
              title="Morning Meditation"
              description="Complete a 5-minute meditation session"
              icon="🧘‍♂️"
              isCompleted={isChallengeCompleted("meditation")}
              onPress={() => toggleChallenge("meditation")}
            />
            <ChallengeCard
              title="Journal Entry"
              description="Write about your feelings and progress"
              icon="📝"
              isCompleted={isChallengeCompleted("journal")}
              onPress={() => toggleChallenge("journal")}
            />
            <ChallengeCard
              title="Exercise"
              description="Do 20 push-ups, now!"
              icon="💪"
              isCompleted={isChallengeCompleted("exercise")}
              onPress={() => toggleChallenge("exercise")}
            />
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.circleButtonsContainer}>
          <CircleButton
            icon="fitness"
            label="Breathing Exercise"
            onPress={() => navigation.navigate("BreathingExercise")}
          />
          <CircleButton
            icon="happy"
            label="NoFap Mentor"
            onPress={() =>
              Linking.openURL("https://calendly.com/hansensmith43/30min?month=2025-07")
            }
          />
          <CircleButton
            icon="leaf"
            label="Meditate"
            onPress={() => navigation.navigate("Meditation")}
          />
          <CircleButton
            icon="document-text"
            label="Blog"
            onPress={() => Linking.openURL("https://pureresist.com/blog")}
          />
        </View>

        {/* Main Actions */}
        <View style={styles.mainActionsContainer}>
          <View style={styles.buttonRow}>
            <RoundedButton
              label="Learn"
              onPress={() => navigation.navigate("Learn")}
              gradient={["#4CAF50", "#388E3C"]}
            />
            <RoundedButton
              label="Blog"
              onPress={() => Linking.openURL("https://pureresist.com/blog")}
              gradient={["#E91E63", "#C2185B"]}
            />
          </View>
          <View style={styles.buttonRow}>
            <RoundedButton
              label="Podcasts"
              onPress={() => Linking.openURL("https://pureresist.com/podcasts")}
              gradient={["#FF9800", "#F57C00"]}
            />
            <RoundedButton
              label="Videos"
              onPress={() => Linking.openURL("https://pureresist.com/videos")}
              gradient={["#2196F3", "#1976D2"]}
            />
          </View>
        </View>

        {/* Relaxation Noises */}
        <View style={styles.relaxationSection}>
          <Text style={styles.sectionTitle}>Relaxation Noises</Text>
          <Text style={styles.sectionSubtitle}>
            Helping your heart-rate regulate when urges surge.
          </Text>

          <View style={styles.noiseGrid}>
            <NoiseButton
              icon="rainy"
              label="Rain"
              onPress={() =>
                Linking.openURL("https://www.youtube.com/watch?v=mPZkdNFkNps")
              }
            />
            <NoiseButton
              icon="water"
              label="Ocean Waves"
              onPress={() =>
                Linking.openURL("https://www.youtube.com/watch?v=V1RPi2MYptM")
              }
            />
            <NoiseButton
              icon="bonfire"
              label="Campfire"
              onPress={() =>
                Linking.openURL("https://www.youtube.com/watch?v=E77jmtut1Zc")
              }
            />
            <NoiseButton
              icon="radio"
              label="White Noise"
              onPress={() =>
                Linking.openURL("https://www.youtube.com/watch?v=wzjWIxXBs_s")
              }
            />
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: SPACING.xl * 2,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
  },
  headerTime: {
    fontSize: 24,
    fontWeight: "600",
    color: "#FFF",
    opacity: 0.9,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#FFF",
    marginTop: 4,
  },
  circleButtonsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    marginTop: 20,
  },
  circleButtonContainer: {
    width: "22%",
    alignItems: "center",
    marginBottom: 20,
  },
  circleButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  circleButtonLabel: {
    fontSize: 12,
    textAlign: "center",
    color: "#FFF",
  },
  mainActionsContainer: {
    paddingHorizontal: 20,
    marginTop: 20,
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  roundedButtonContainer: {
    flex: 1,
    marginHorizontal: 6,
  },
  roundedButtonGradient: {
    borderRadius: 16,
    padding: 16,
    alignItems: "center",
  },
  roundedButtonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "600",
  },
  relaxationSection: {
    marginTop: 32,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#FFF",
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: "#FFF",
    opacity: 0.7,
    marginBottom: 20,
  },
  noiseGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  leaderboardPreview: {
    marginTop: 32,
    paddingHorizontal: 20,
  },
  leaderboardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  leaderboardTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#FFF",
  },
  leaderboardRank: {
    fontSize: 14,
    color: "#2196F3",
    fontWeight: "500",
  },
  leaderboardList: {
    backgroundColor: "rgba(0,0,0,0.3)",
    borderRadius: 16,
    padding: 16,
  },
  leaderboardItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  leaderboardLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  rank: {
    width: 24,
    fontSize: 14,
    color: "#FFF",
    opacity: 0.7,
  },
  username: {
    fontSize: 16,
    color: "#FFF",
    marginLeft: 8,
  },
  daysTag: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  daysText: {
    color: "#FFF",
    fontSize: 14,
    fontWeight: "500",
  },
  errorButton: {
    backgroundColor: "rgba(255,68,68,0.1)",
  },
  errorLabel: {
    color: "#FF4444",
  },
  featuredSection: {
    marginTop: 20,
    paddingHorizontal: 20,
  },
  featuredScrollContent: {
    paddingTop: 10,
    paddingBottom: 5,
    paddingRight: 20,
  },
  featuredCard: {
    width: 280,
    height: 160,
    marginLeft: 20,
    borderRadius: 16,
    overflow: "hidden",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  featuredGradient: {
    flex: 1,
    padding: 20,
    justifyContent: "flex-end",
  },
  featuredTitle: {
    color: "#FFF",
    fontSize: 24,
    fontWeight: "600",
    marginBottom: 8,
  },
  featuredDescription: {
    color: "rgba(255,255,255,0.9)",
    fontSize: 14,
    lineHeight: 20,
  },
  challengesSection: {
    marginTop: 30,
    paddingHorizontal: 20,
  },
  challengesList: {
    marginTop: 15,
  },
  challengeCard: {
    flexDirection: "row",
    backgroundColor: "rgba(255,255,255,0.08)",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  challengeCardCompleted: {
    backgroundColor: "rgba(39,174,96,0.15)",
    borderColor: "rgba(39,174,96,0.3)",
  },
  challengeIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.1)",
    justifyContent: "center",
    alignItems: "center",
  },
  challengeIconText: {
    fontSize: 20,
  },
  challengeContent: {
    flex: 1,
    marginLeft: 12,
  },
  challengeTitle: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  challengeDescription: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 13,
  },
  completedBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#27AE60",
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 12,
  },
  completedText: {
    color: "#FFF",
    fontSize: 14,
    fontWeight: "600",
  },
  categoriesSection: {
    marginTop: 30,
    paddingHorizontal: 20,
  },
  categoriesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginTop: 15,
  },
  categoryCard: {
    width: "48%",
    backgroundColor: "rgba(255,255,255,0.08)",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  categoryIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "rgba(255,255,255,0.1)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  categoryIconText: {
    fontSize: 24,
  },
  categoryTitle: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
    textAlign: "center",
  },
  categoryCount: {
    color: "rgba(255,255,255,0.6)",
    fontSize: 13,
  },
});

export default LibraryScreen;
