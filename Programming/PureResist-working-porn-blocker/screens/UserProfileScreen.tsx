import React, { useEffect, useState } from "react";
import {
  View,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Ionicons } from "@expo/vector-icons";
import { Title, Subtitle, Body, Caption } from "../components/ui/Typography";
import Card from "../components/ui/Card";
import { COLORS, SPACING, RADIUS, FONTS } from "../utils/theme";
import { useAuthStore } from "../hooks/useStore";
import { apiGetRequest, getUserProfile } from "../utils/api";
import { RootStackParamList } from "../navigation/types";

// Define a type for UserProfile data
type UserProfile = {
  _id: string;
  email: string;
  username?: string;
  createdAt: string;
  streak?: number;
  longestStreak?: number;
  lastCheckIn?: string;
  lastRelapse?: string;
};

type Props = NativeStackScreenProps<RootStackParamList, "UserProfile">;

const UserProfileScreen: React.FC<Props> = ({ route, navigation }) => {
  const { userId } = route.params;
  const { user } = useAuthStore();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchedUsername, setSearchedUsername] = useState("");

  useEffect(() => {
    // Extract username from userId if it starts with 'user_'
    if (userId.startsWith("user_")) {
      const extractedUsername = userId.replace("user_", "");
      setSearchedUsername(extractedUsername);
    }

    const loadUserProfile = async () => {
      try {
        setLoading(true);

        // Check if userId is a valid MongoDB ObjectId
        const isValidObjectId = /^[0-9a-fA-F]{24}$/.test(userId);

        if (!isValidObjectId) {
          setError("Invalid user ID format");
          setUserProfile(null);
          setLoading(false);
          return;
        }

        // First check if this is the current user
        if (user?._id === userId) {
          setUserProfile({
            _id: user._id,
            email: user.email,
            username: user.username,
            createdAt: user.createdAt?.toString() || new Date().toISOString(),
            streak: user.currentStreak,
            longestStreak: user.longestStreak,
            lastRelapse: user.lastRelapse?.toString(),
            lastCheckIn: user.lastCheckIn?.toString(),
          });
          setError("");
          setLoading(false);
          return;
        }

        // Use the getUserProfile function which has better error handling
        try {
          const response = await getUserProfile(userId);
          if (response.success && response.data) {
            setUserProfile(response.data);
            setError("");
          } else {
            // Show not found UI
            setError(response.message || "User not found");
            setUserProfile(null);
          }
        } catch (apiError: any) {
          console.error("API Error:", apiError);

          // If it's a 404, provide a clearer message
          if (apiError.message && apiError.message.includes("404")) {
            setError("User not found");
          } else {
            setError("Failed to load user profile");
          }
          setUserProfile(null);
        }
      } catch (err) {
        console.error("Error loading user profile:", err);
        setError("Failed to load user profile");
        setUserProfile(null);
      } finally {
        setLoading(false);
      }
    };

    loadUserProfile();
  }, [userId, user]);

  const startChat = () => {
    // Check if we have a valid user profile first
    if (!userProfile || !userProfile._id) {
      Alert.alert("Error", "Cannot start chat with this user");
      return;
    }

    // Navigate to Chat with this user's ID and username
    navigation.navigate("Chat", {
      userId: userProfile._id,
      userName: userProfile.username || "User",
    });
  };

  return (
    <>
      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={COLORS.accent} />
        </View>
      ) : error ? (
        <View style={styles.centerContainer}>
          <Card style={styles.notFoundCard}>
            <Ionicons
              name="person-outline"
              size={48}
              color={COLORS.textSecondary}
            />
            <Body style={styles.notFoundText}>{error}</Body>
            {searchedUsername && (
              <Caption style={styles.searchedText}>
                No user found with username "{searchedUsername}"
              </Caption>
            )}
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <Body style={styles.backButtonText}>Go Back</Body>
            </TouchableOpacity>
          </Card>
        </View>
      ) : userProfile ? (
        <View style={styles.content}>
          <Card style={styles.profileCard}>
            <View style={styles.profileImageContainer}>
              <View style={styles.profileImage}>
                <Ionicons
                  name="person"
                  size={40}
                  color={COLORS.textSecondary}
                />
              </View>
            </View>

            <Title style={styles.username}>
              {userProfile.username || userProfile.email.split("@")[0]}
            </Title>

            <Caption style={styles.memberSince}>
              Member since:{" "}
              {new Date(userProfile.createdAt).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </Caption>

            <View style={styles.statsContainer}>
              <View style={styles.statsRow}>
                <View style={styles.statItem}>
                  <Title style={styles.statValue}>
                    {userProfile.streak || 0}
                  </Title>
                  <Caption color={COLORS.textSecondary}>Current Streak</Caption>
                </View>
                <View style={styles.statItem}>
                  <Title style={styles.statValue}>
                    {userProfile.longestStreak || 0}
                  </Title>
                  <Caption color={COLORS.textSecondary}>Longest Streak</Caption>
                </View>
                <View style={styles.statItem}>
                  <Title style={styles.statValue}>
                    {calculateDaysSince(userProfile.lastRelapse)}
                  </Title>
                  <Caption color={COLORS.textSecondary}>
                    Days Since Last Relapse
                  </Caption>
                </View>
              </View>
            </View>

            {userId !== user?._id && (
              <TouchableOpacity style={styles.chatButton} onPress={startChat}>
                <Ionicons name="chatbubble-outline" size={20} color="#FFFFFF" />
                <Body style={styles.chatButtonText}>Message</Body>
              </TouchableOpacity>
            )}
          </Card>
        </View>
      ) : (
        <View style={styles.centerContainer}>
          <Card style={styles.notFoundCard}>
            <Ionicons
              name="person-outline"
              size={48}
              color={COLORS.textSecondary}
            />
            <Body style={styles.notFoundText}>No user found</Body>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <Body style={styles.backButtonText}>Go Back</Body>
            </TouchableOpacity>
          </Card>
        </View>
      )}
    </>
  );
};

// Helper function to calculate days since date
const calculateDaysSince = (dateString?: string) => {
  if (!dateString) return 0;

  const date = new Date(dateString);
  const now = new Date();

  // Calculate difference in days
  const diffTime = Math.abs(now.getTime() - date.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  return diffDays;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: SPACING.md,
  },
  content: {
    padding: SPACING.md,
  },
  profileCard: {
    padding: SPACING.lg,
    alignItems: "center",
  },
  profileImageContainer: {
    marginBottom: SPACING.md,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: COLORS.cardLight,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: COLORS.accent,
  },
  username: {
    fontSize: FONTS.sizes.xl,
    marginBottom: SPACING.xs,
    textAlign: "center",
  },
  memberSince: {
    color: COLORS.textSecondary,
    marginBottom: SPACING.md,
    textAlign: "center",
  },
  statsContainer: {
    width: "100%",
    marginTop: SPACING.md,
    marginBottom: SPACING.md,
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
    paddingVertical: SPACING.md,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: COLORS.cardLight,
  },
  statItem: {
    alignItems: "center",
  },
  statValue: {
    color: COLORS.accent,
    fontSize: FONTS.sizes.xl,
    marginBottom: SPACING.xs / 2,
  },
  chatButton: {
    flexDirection: "row",
    backgroundColor: COLORS.accent,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderRadius: RADIUS.md,
    alignItems: "center",
    marginTop: SPACING.md,
  },
  chatButtonText: {
    color: "#FFFFFF",
    marginLeft: SPACING.xs,
    fontWeight: "bold",
  },
  errorText: {
    color: COLORS.danger,
    textAlign: "center",
  },
  notFoundCard: {
    padding: SPACING.lg,
    alignItems: "center",
    width: "90%",
  },
  notFoundText: {
    textAlign: "center",
    marginVertical: SPACING.md,
    color: COLORS.textSecondary,
  },
  searchedText: {
    textAlign: "center",
    marginBottom: SPACING.md,
    color: COLORS.textTertiary,
  },
  backButton: {
    backgroundColor: COLORS.accent,
    padding: SPACING.sm,
    borderRadius: RADIUS.md,
    marginTop: SPACING.md,
  },
  backButtonText: {
    color: "#FFFFFF",
    fontWeight: "bold",
  },
});

export default UserProfileScreen;
