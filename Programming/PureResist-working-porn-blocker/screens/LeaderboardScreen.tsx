import React, { useState } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Title, Subtitle, Body } from "../components/ui/Typography";
import Card from "../components/ui/Card";
import Avatar from "../components/ui/Avatar";
import { COLORS, SPACING } from "../utils/theme";
import { Ionicons } from "@expo/vector-icons";

type TabType = "month" | "global";

// Sample user interface for the leaderboard
interface LeaderboardUser {
  id: string;
  username: string;
  avatar?: string;
  initials: string;
  country?: string; // Country code for flag
  streakDays: number;
  rank: number;
  trophy?: boolean; // Top 3 get trophies
}

const LeaderboardScreen: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>("month");

  // Simulated leaderboard data
  const leaderboardUsers: LeaderboardUser[] = [
    {
      id: "1",
      username: "xahier",
      initials: "X",
      streakDays: 7,
      rank: 1,
      trophy: true,
    },
    {
      id: "2",
      username: "heartless-directive",
      initials: "H",
      streakDays: 6,
      rank: 2,
      trophy: true,
    },
    {
      id: "3",
      username: "Tim spruit",
      initials: "T",
      country: "nl",
      streakDays: 5,
      rank: 3,
      trophy: true,
    },
    {
      id: "4",
      username: "Tamino",
      initials: "T",
      avatar: "https://i.pravatar.cc/150?img=4",
      country: "at",
      streakDays: 5,
      rank: 4,
    },
    {
      id: "5",
      username: "mauve-mooring-550",
      initials: "M",
      streakDays: 4,
      rank: 5,
    },
    { id: "6", username: "darkluzio", initials: "D", streakDays: 4, rank: 6 },
    {
      id: "7",
      username: "hanging-fringe-260",
      initials: "H",
      streakDays: 4,
      rank: 7,
    },
    {
      id: "8",
      username: "mass-produced-truck",
      initials: "M",
      streakDays: 4,
      rank: 8,
    },
  ];

  // Get the flag emoji for a country code
  const getFlagEmoji = (countryCode?: string) => {
    if (!countryCode) return null;

    // Convert country code to flag emoji
    const codePoints = countryCode
      .toUpperCase()
      .split("")
      .map((char) => 127397 + char.charCodeAt(0));

    return String.fromCodePoint(...codePoints);
  };

  return (
    <>
      <View style={styles.header}>
        <Title>Leaderboard</Title>
        <Subtitle style={styles.description}>
          This leaderboard shows the <Body bold>Top 10</Body> users who've been
          the most consistent in overcoming their porn addiction.
        </Subtitle>
      </View>

      {/* Tabs */}
      <View style={styles.tabsContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === "month" && styles.activeTab]}
          onPress={() => setActiveTab("month")}
        >
          <Ionicons
            name={"calendar" as keyof typeof Ionicons.glyphMap}
            size={18}
            color={
              activeTab === "month" ? COLORS.textPrimary : COLORS.textSecondary
            }
            style={styles.tabIcon}
          />
          <Body
            color={
              activeTab === "month" ? COLORS.textPrimary : COLORS.textSecondary
            }
            bold={activeTab === "month"}
          >
            This Month
          </Body>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === "global" && styles.activeTab]}
          onPress={() => setActiveTab("global")}
        >
          <Ionicons
            name={"globe" as keyof typeof Ionicons.glyphMap}
            size={18}
            color={
              activeTab === "global" ? COLORS.textPrimary : COLORS.textSecondary
            }
            style={styles.tabIcon}
          />
          <Body
            color={
              activeTab === "global" ? COLORS.textPrimary : COLORS.textSecondary
            }
            bold={activeTab === "global"}
          >
            Global
          </Body>
        </TouchableOpacity>
      </View>

      {/* Leaderboard listing */}
      <ScrollView style={styles.scrollView}>
        {leaderboardUsers.map((user) => (
          <Card key={user.id} style={styles.userCard}>
            <View style={styles.userRow}>
              {/* Rank */}
              <View style={styles.rankContainer}>
                <Body bold>{user.rank}</Body>
              </View>

              {/* Avatar */}
              <Avatar
                size="md"
                imageUrl={user.avatar}
                initials={user.initials}
                style={styles.avatar}
              />

              {/* User info */}
              <View style={styles.userInfo}>
                <Body bold>{user.username}</Body>
                {user.country && <Body>{getFlagEmoji(user.country)}</Body>}
              </View>

              {/* Trophy for top 3 */}
              {user.trophy && (
                <Ionicons
                  name={"trophy" as keyof typeof Ionicons.glyphMap}
                  size={18}
                  color={COLORS.gold}
                  style={styles.trophyIcon}
                />
              )}

              {/* Streak days */}
              <View style={styles.streakContainer}>
                <Body bold>{user.streakDays}</Body>
                <Body color={COLORS.textSecondary}>DAYS</Body>
              </View>
            </View>
          </Card>
        ))}
      </ScrollView>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    paddingHorizontal: SPACING.md,
  },
  header: {
    paddingVertical: SPACING.lg,
  },
  description: {
    marginTop: SPACING.xs,
  },
  tabsContainer: {
    flexDirection: "row",
    marginBottom: SPACING.md,
  },
  tab: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    marginRight: SPACING.sm,
    borderRadius: 100,
    backgroundColor: COLORS.card,
  },
  activeTab: {
    backgroundColor: COLORS.cardDark,
  },
  tabIcon: {
    marginRight: SPACING.xs,
  },
  scrollView: {
    flex: 1,
  },
  userCard: {
    marginBottom: SPACING.md,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
  },
  userRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  rankContainer: {
    width: 24,
    alignItems: "center",
  },
  avatar: {
    marginLeft: SPACING.sm,
  },
  userInfo: {
    flex: 1,
    marginLeft: SPACING.md,
    flexDirection: "row",
    alignItems: "center",
  },
  trophyIcon: {
    marginRight: SPACING.sm,
  },
  streakContainer: {
    alignItems: "flex-end",
  },
});

export default LeaderboardScreen;
