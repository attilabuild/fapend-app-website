import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Text,
  ImageBackground,
  StatusBar,
} from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useStreakStore } from "../hooks/useStore";
import { Title, Subtitle, Body, Caption } from "../components/ui/Typography";
import Card from "../components/ui/Card";
import { COLORS, SPACING, RADIUS, FONTS } from "../utils/theme";
import { Ionicons } from "@expo/vector-icons";
import moment from "moment";
import Svg, { Circle } from "react-native-svg";
import { AnimatedStars } from '../components/ui/AnimatedStars';

const APP_RELEASE_DATE = moment("2025-06-01", "YYYY-MM-DD");

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
  ArticleDetail: { articleId: string; title: string; categoryId: string };
  PostDetail: { postId: string };
  NewPost: undefined;
  Achievements: undefined;
  Progress: undefined;
  UserProfile: { userId: string };
  EmailLogin: undefined;
  History: undefined;
};

type Props = NativeStackScreenProps<RootStackParamList, "History">;

const AnalyticsScreen: React.FC<Props> = ({ navigation }) => {
  const { checkIns, relapses, streakStarted } = useStreakStore();
  const [currentMonth, setCurrentMonth] = useState(moment());
  const [selectedDate, setSelectedDate] = useState<moment.Moment | null>(null);

  // Calculate current streak in days
  const today = moment();
  let streakStart = streakStarted ? moment(streakStarted) : today;
  let streakDays = streakStarted ? today.diff(streakStart, "days") : 0;
  streakDays = Math.max(0, streakDays);
  const percent = Math.min(100, Math.round((streakDays / 100) * 100));
  const quitDate = streakStart.clone().add(60, "days").format("MMM D, YYYY");

  const isBackDisabled = currentMonth.isSame(APP_RELEASE_DATE, "month");

  // Generate calendar days for the current month
  const getCalendarDays = () => {
    const startOfMonth = currentMonth.clone().startOf("month");
    const endOfMonth = currentMonth.clone().endOf("month");
    const startDate = startOfMonth.clone().startOf("week");
    const endDate = endOfMonth.clone().endOf("week");

    const days = [];
    let day = startDate.clone();

    while (day.isSameOrBefore(endDate)) {
      days.push(day.clone());
      day.add(1, "day");
    }

    return days;
  };

  // Get status for a specific day
  const getStatusForDay = (day: moment.Moment) => {
    const today = moment();

    // Future days
    if (day.isAfter(today, "day")) {
      return "future";
    }

    const dayString = day.format("YYYY-MM-DD");

    // Get the most recent relapse before or on this day
    const mostRecentRelapse = relapses.reduce<{ date: Date } | null>((latest, current) => {
      const currentDate = moment(current.date);
      // Only consider relapses that happened before or on the day we're checking
      if (currentDate.isAfter(day)) return latest;
      if (!latest) return current;
      return moment(latest.date).isAfter(currentDate) ? latest : current;
    }, null);

    // If there's a relapse on this specific day
    const hasRelapseToday = relapses.some(r => 
      moment(r.date).format("YYYY-MM-DD") === dayString
    );
    if (hasRelapseToday) {
      return "relapse";
    }

    // If this day is after the most recent relapse
    if (mostRecentRelapse && day.isAfter(moment(mostRecentRelapse.date))) {
      // Check if there's a check-in for this day
      const checkIn = checkIns.find(c => 
        moment(c.date).format("YYYY-MM-DD") === dayString && c.succeeded
      );
      
      return checkIn ? "success" : "empty";
    }

    // If it's today and loading, show pending
    if (day.isSame(today, "day")) {
      return "empty";
    }

    // Check for successful check-ins for days before the most recent relapse
    const checkIn = checkIns.find(c => 
      moment(c.date).format("YYYY-MM-DD") === dayString && c.succeeded
    );

    if (checkIn) {
      return "success";
    }

    // For past days with no activity, show as empty
    return "empty";
  };

  // Get icon and color for status
  const getDayContent = (day: moment.Moment, status: string) => {
    const isCurrentMonth = day.month() === currentMonth.month();
    const isToday = day.isSame(moment(), "day");
    const isSelected = selectedDate && day.isSame(selectedDate, "day");
    const isFuture = day.isAfter(moment(), "day");

    let backgroundColor = "rgba(255, 255, 255, 0.05)"; // Default cell color
    let borderColor = "transparent";
    let textColor = COLORS.textPrimary;
    let symbol = "";
    let borderWidth = 0;

    if (isFuture) {
      if (isCurrentMonth) {
        symbol = day.format("D");
        textColor = COLORS.textTertiary;
      } else {
        // Future day, not in current month -> completely blank
        symbol = "";
        backgroundColor = "transparent";
      }
    } else {
      // Past or Today
      if (isCurrentMonth) {
        switch (status) {
          case "success":
            symbol = "+";
            break;
          case "relapse":
            symbol = "-";
            break;
          default: // 'empty', 'failed'
            symbol = "?";
            textColor = COLORS.textSecondary;
            break;
        }
      } else {
        // Past day, not in current month
        symbol = "?";
        textColor = COLORS.textSecondary;
      }
    }

    if (isToday) {
      borderColor = COLORS.info;
      borderWidth = 2;
    }

    if (isSelected) {
      borderColor = COLORS.accent;
      borderWidth = 2;
    }

    if (isSelected) {
      backgroundColor = COLORS.accent + "20"; // Highlight selected
    }

    return {
      backgroundColor,
      borderColor,
      textColor,
      symbol,
      isCurrentMonth,
      isToday,
      isSelected,
      borderWidth,
    };
  };

  // Get details for selected date
  const getSelectedDateDetails = () => {
    if (!selectedDate) return null;

    const dayString = selectedDate.format("YYYY-MM-DD");
    const relapse = relapses.find((r) => {
      const relapseDate = moment(r.date).format("YYYY-MM-DD");
      return relapseDate === dayString;
    });

    const checkIn = checkIns.find((c) => {
      const checkInDate = moment(c.date).format("YYYY-MM-DD");
      return checkInDate === dayString;
    });

    return { relapse, checkIn };
  };

  const calendarDays = getCalendarDays();
  const selectedDetails = getSelectedDateDetails();

  return (
    <View style={styles.container}>
      <AnimatedStars />
      <StatusBar barStyle="light-content" />
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Analytics Section */}
        <View style={styles.analyticsContainer}>
          {/* Analytics Title */}
          {/* <View style={styles.analyticsCircleWrapper}>
            <Svg width={180} height={180}>
              <Circle
                cx={90}
                cy={90}
                r={80}
                stroke="#2E3A59"
                strokeWidth={12}
                fill="none"
              />
              <Circle
                cx={90}
                cy={90}
                r={80}
                stroke={COLORS.accent}
                strokeWidth={12}
                fill="none"
                strokeDasharray={2 * Math.PI * 80}
                strokeDashoffset={2 * Math.PI * 80 * (1 - percent / 100)}
                strokeLinecap="round"
                rotation="-90"
                origin="90,90"
              />
            </Svg>
            <View style={styles.analyticsCircleTextWrapper}>
              <Text style={styles.analyticsRecoveryLabel}>RECOVERY</Text>
              <Text style={styles.analyticsPercent}>{percent}%</Text>
              <Text style={styles.analyticsStreakLabel}>{streakDays} DAY STREAK</Text>
            </View>
          </View> */}
          {/* Quit Date */}
          <Text style={styles.analyticsOnTrackLabelCentered}>
            You're on track to quit porn by:
          </Text>
          <View style={styles.analyticsDatePillSmall}>
            <Text style={styles.analyticsDatePillTextWhite}>{quitDate}</Text>
          </View>
          {/* Motivational Text */}
          <Text style={styles.analyticsMotivation}>
            Every day you're one step closer to a porn-free life. Keep it up,
            you got this!
          </Text>
        </View>
        {/* Month Navigation */}
        <Card style={styles.monthCard}>
          <View style={styles.monthHeader}>
            <TouchableOpacity
              style={[
                styles.monthButton,
                isBackDisabled && styles.disabledButton,
              ]}
              onPress={() =>
                setCurrentMonth(currentMonth.clone().subtract(1, "month"))
              }
              disabled={isBackDisabled}
            >
              <Ionicons
                name="chevron-back"
                size={24}
                color={
                  isBackDisabled ? COLORS.textTertiary : COLORS.textPrimary
                }
              />
            </TouchableOpacity>

            <Title style={styles.monthTitle}>
              {currentMonth.format("MMMM YYYY")}
            </Title>

            <TouchableOpacity
              style={styles.monthButton}
              onPress={() =>
                setCurrentMonth(currentMonth.clone().add(1, "month"))
              }
            >
              <Ionicons
                name="chevron-forward"
                size={24}
                color={COLORS.textPrimary}
              />
            </TouchableOpacity>
          </View>

          {/* Legend */}
          <View style={styles.legend}>
            <View style={styles.legendItem}>
              <View
                style={[
                  styles.legendDot,
                  {
                    backgroundColor: COLORS.background,
                    borderColor: "transparent",
                  },
                ]}
              >
                <Text
                  style={[styles.legendSymbol, { color: COLORS.textPrimary }]}
                >
                  +
                </Text>
              </View>
              <Caption style={styles.legendText}>Clean</Caption>
            </View>
            <View style={styles.legendItem}>
              <View
                style={[
                  styles.legendDot,
                  {
                    backgroundColor: COLORS.background,
                    borderColor: "transparent",
                  },
                ]}
              >
                <Text
                  style={[styles.legendSymbol, { color: COLORS.textPrimary }]}
                >
                  -
                </Text>
              </View>
              <Caption style={styles.legendText}>Relapse</Caption>
            </View>
            <View style={styles.legendItem}>
              <View
                style={[
                  styles.legendDot,
                  {
                    backgroundColor: COLORS.background,
                    borderColor: "transparent",
                  },
                ]}
              >
                <Text
                  style={[styles.legendSymbol, { color: COLORS.textSecondary }]}
                >
                  ?
                </Text>
              </View>
              <Caption style={styles.legendText}>No Activity</Caption>
            </View>
          </View>
        </Card>

        {/* Calendar */}
        <Card style={styles.calendarCard}>
          {/* Week day headers */}
          <View style={styles.weekHeader}>
            {["S", "M", "T", "W", "T", "F", "S"].map((day, index) => (
              <View key={index} style={styles.weekDayHeader}>
                <Caption style={styles.weekDayText}>{day}</Caption>
              </View>
            ))}
          </View>

          {/* Calendar grid */}
          <View style={styles.calendarGrid}>
            {(() => {
              // Group days into weeks
              const weeks = [];
              for (let i = 0; i < calendarDays.length; i += 7) {
                weeks.push(calendarDays.slice(i, i + 7));
              }
              return weeks.map((week, weekIdx) => (
                <View key={weekIdx} style={styles.weekRow}>
                  {week.map((day, dayIdx) => {
                    const status = getStatusForDay(day);
                    const content = getDayContent(day, status);
                    const isFuture = day.isAfter(moment(), "day");

                    return (
                      <TouchableOpacity
                        key={dayIdx}
                        style={[
                          styles.calendarDay,
                          {
                            backgroundColor: content.backgroundColor,
                            borderColor: content.borderColor,
                            borderWidth: content.borderWidth,
                          },
                        ]}
                        onPress={() => setSelectedDate(day)}
                        disabled={isFuture}
                      >
                        <Text
                          style={[
                            styles.dayText,
                            { color: content.textColor },
                            content.isToday && styles.todayText,
                            content.isSelected && styles.selectedText,
                          ]}
                        >
                          {content.symbol}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              ));
            })()}
          </View>
        </Card>

        {/* Selected Date Details */}
        {selectedDate && selectedDetails && (
          <Card style={styles.detailsCard}>
            <Title style={styles.detailsTitle}>
              {selectedDate.format("MMMM D, YYYY")}
            </Title>

            {selectedDetails.relapse && (
              <View style={styles.detailItem}>
                <Ionicons name="close-circle" size={20} color={COLORS.danger} />
                <Body style={styles.detailText}>
                  Relapse reported
                  {selectedDetails.relapse.notes &&
                    `: ${selectedDetails.relapse.notes}`}
                </Body>
              </View>
            )}

            {selectedDetails.checkIn && (
              <View style={styles.detailItem}>
                <Ionicons
                  name={
                    selectedDetails.checkIn.succeeded
                      ? "checkmark-circle"
                      : "close-circle"
                  }
                  size={20}
                  color={
                    selectedDetails.checkIn.succeeded
                      ? COLORS.success
                      : COLORS.warning
                  }
                />
                <View style={styles.detailTextContainer}>
                  <Body style={styles.detailText}>
                    {selectedDetails.checkIn.succeeded
                      ? "Successfully checked in"
                      : "Failed check-in"}
                  </Body>
                  {selectedDetails.checkIn.notes && (
                    <Caption style={styles.notesText}>
                      Notes: {selectedDetails.checkIn.notes}
                    </Caption>
                  )}
                  {selectedDetails.checkIn.succeeded &&
                    selectedDetails.checkIn.mood && (
                      <Caption style={styles.moodText}>
                        Mood:{" "}
                        {selectedDetails.checkIn.mood.charAt(0).toUpperCase() +
                          selectedDetails.checkIn.mood.slice(1)}
                      </Caption>
                    )}
                </View>
              </View>
            )}

            {!selectedDetails.relapse && !selectedDetails.checkIn && (
              <Body style={styles.detailText}>
                No activity recorded for this day
              </Body>
            )}
          </Card>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
  monthCard: {
    padding: SPACING.lg,
    marginBottom: SPACING.md,
  },
  monthHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: SPACING.lg,
  },
  monthButton: {
    padding: SPACING.sm,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.cardLight,
  },
  monthTitle: {
    fontSize: FONTS.sizes.xl,
  },
  legend: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  legendItem: {
    alignItems: "center",
  },
  legendDot: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: SPACING.xs,
  },
  legendSymbol: {
    fontSize: 16,
    fontWeight: "bold",
  },
  legendText: {
    fontSize: FONTS.sizes.sm,
  },
  calendarCard: {
    padding: SPACING.lg,
    marginBottom: SPACING.md,
  },
  weekHeader: {
    flexDirection: "row",
    marginBottom: SPACING.md,
  },
  weekDayHeader: {
    flex: 1,
    alignItems: "center",
  },
  weekDayText: {
    color: COLORS.textSecondary,
    fontWeight: "bold",
  },
  calendarGrid: {
    marginTop: SPACING.md,
  },
  weekRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: SPACING.sm,
  },
  calendarDay: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: RADIUS.lg,
  },
  dayText: {
    fontSize: 16,
    fontWeight: "bold",
  },
  todayText: {
    fontWeight: "bold",
  },
  selectedText: {
    fontWeight: "bold",
  },
  detailsCard: {
    padding: SPACING.lg,
  },
  detailsTitle: {
    marginBottom: SPACING.md,
  },
  detailItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: SPACING.sm,
  },
  detailTextContainer: {
    marginLeft: SPACING.sm,
    flex: 1,
  },
  detailText: {
    // No specific styles needed here now
  },
  notesText: {
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
    fontStyle: "italic",
  },
  moodText: {
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
  },
  disabledButton: {
    opacity: 0.5,
  },
  analyticsContainer: {
    padding: SPACING.lg,
    marginBottom: SPACING.md,
  },
  analyticsCircleWrapper: {
    alignItems: "center",
    marginBottom: SPACING.md,
  },
  analyticsCircleTextWrapper: {
    alignItems: "center",
  },
  analyticsRecoveryLabel: {
    fontSize: FONTS.sizes.xl,
    fontWeight: "bold",
    marginBottom: SPACING.xs,
  },
  analyticsPercent: {
    fontSize: FONTS.sizes.xl,
    fontWeight: "bold",
  },
  analyticsStreakLabel: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.textPrimary,
    fontWeight: "bold",
    textTransform: "uppercase",
    textAlign: "center",
    marginTop: 4,
  },
  analyticsOnTrackLabelCentered: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.textSecondary,
    textAlign: "center",
    marginBottom: SPACING.sm,
    marginTop: SPACING.md,
  },
  analyticsDatePillSmall: {
    backgroundColor: COLORS.accent,
    borderRadius: RADIUS.md,
    paddingVertical: 4,
    paddingHorizontal: 16,
    alignSelf: "center",
    marginBottom: SPACING.md,
    minWidth: 80,
  },
  analyticsDatePillTextWhite: {
    fontSize: FONTS.sizes.sm,
    fontWeight: "bold",
    color: COLORS.textPrimary,
    textAlign: "center",
  },
  analyticsMotivation: {
    color: COLORS.textSecondary,
    textAlign: "center",
  },
  analyticsTitle: {
    fontSize: FONTS.sizes.xl,
    fontWeight: "bold",
    color: COLORS.textPrimary,
    marginBottom: SPACING.lg,
    marginLeft: 2,
    textAlign: "left",
    alignSelf: "flex-start",
  },
});

export default AnalyticsScreen;
