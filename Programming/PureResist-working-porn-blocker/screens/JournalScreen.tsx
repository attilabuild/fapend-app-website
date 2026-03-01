import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  Text,
  FlatList,
  Platform,
  ImageBackground,
  StatusBar,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Title, Subtitle, Body, Caption } from "../components/ui/Typography";
import Card from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { COLORS, SPACING, RADIUS, FONTS } from "../utils/theme";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useAuthStore, useAchievementStore } from "../hooks/useStore";
import { useStreakStore } from "../hooks/useStore";
import * as journalService from "../services/journalService";
import { JournalEntry as JournalEntryType } from "../types";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { AnimatedStars } from '../components/ui/AnimatedStars';

type RootStackParamList = {
  Journal: undefined;
  Achievements: undefined;
  History: undefined;
  Main: undefined;
};

type NavigationProps = NativeStackNavigationProp<RootStackParamList>;

// Journal Entry Interface
interface JournalEntry {
  id?: string;
  _id?: string;
  userId: string;
  date: string;
  content: string;
  mood: "great" | "good" | "okay" | "bad" | "awful";
  triggers: string[];
  isPrivate: boolean;
  createdAt: string;
  updatedAt: string;
  day: number;
}

// Available triggers
const AVAILABLE_TRIGGERS = [
  "Boredom",
  "Stress",
  "Loneliness",
  "Fatigue",
  "Anxiety",
  "Social Media",
  "Late Night",
  "Alcohol",
  "Arguments",
  "Phone in Bed",
  "Other",
];

// Mood emoji mapping
const MOOD_EMOJIS: Record<JournalEntry["mood"], string> = {
  great: "😁",
  good: "🙂",
  okay: "😐",
  bad: "😔",
  awful: "😣",
};

// Journal prompts based on streak
const JOURNAL_PROMPTS = [
  "How are you feeling today about your journey?",
  "What's one thing that triggered you today, and how did you handle it?",
  "Describe a moment today when you felt proud of your progress.",
  "What's one habit you could replace with a healthier alternative?",
  "How has your energy level changed since starting this journey?",
  "What's something you're looking forward to as you continue your streak?",
  "Reflect on how your relationships are improving as you progress.",
  "What was the most challenging moment today, and how did you overcome it?",
  "Write about one physical improvement you've noticed since starting.",
  "What would you tell someone who is just beginning this journey?",
];

// Get a prompt based on streak
const getPrompt = (streak: number): string => {
  const index = streak % JOURNAL_PROMPTS.length;
  return JOURNAL_PROMPTS[index];
};

const JournalScreen = () => {
  const navigation = useNavigation<NavigationProps>();
  const { user } = useAuthStore();
  const { currentStreak } = useStreakStore();
  const { checkAndUpdateAchievements } = useAchievementStore();
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [newEntry, setNewEntry] = useState("");
  const [selectedMood, setSelectedMood] = useState<JournalEntry["mood"]>("okay");
  const [selectedTriggers, setSelectedTriggers] = useState<string[]>([]);
  const [isPrivate, setIsPrivate] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<JournalEntry | null>(null);
  const [showAllEntries, setShowAllEntries] = useState(false);

  // Load entries on mount
  useEffect(() => {
    loadEntries();
  }, []);

  // Load journal entries from storage
  const loadEntries = async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      // Use journal service instead of AsyncStorage directly
      const response = await journalService.getUserJournals(user._id);

      if (response.success && "data" in response) {
        setEntries(response.data);
      } else {
        console.error("Failed to load journal entries:", response.message);
        Alert.alert("Error", "Failed to load your journal entries");
      }
    } catch (error) {
      console.error("Failed to load journal entries:", error);
      Alert.alert("Error", "Failed to load your journal entries");
    } finally {
      setIsLoading(false);
    }
  };

  // Save entry function
  const saveEntry = async () => {
    if (!user || !newEntry.trim()) {
      Alert.alert("Error", "Please write something before saving");
      return;
    }

    try {
      const response = await journalService.createJournalEntry({
        userId: user._id,
        content: newEntry.trim(),
        mood: selectedMood,
        triggers: selectedTriggers,
        isPrivate: isPrivate,
        day: currentStreak,
      });

      if (response.success && "data" in response) {
        setEntries([response.data, ...entries]);
        resetForm();
        checkAndUpdateAchievements(user._id, undefined, entries.length + 1);
      } else {
        Alert.alert("Error", response.message || "Failed to save journal entry");
      }
    } catch (error) {
      console.error("Failed to save journal entry:", error);
      Alert.alert("Error", "Failed to save your journal entry");
    }
  };

  // Reset form function
  const resetForm = () => {
    setNewEntry("");
    setSelectedMood("okay");
    setSelectedTriggers([]);
    setIsPrivate(true);
    setIsCreating(false);
  };

  // Toggle trigger function
  const toggleTrigger = (trigger: string) => {
    setSelectedTriggers(prev =>
      prev.includes(trigger)
        ? prev.filter(t => t !== trigger)
        : [...prev, trigger]
    );
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
  };

  // Get shortened content for preview
  const getShortContent = (content: string, maxLength = 100) => {
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength) + "...";
  };

  // Toggle show all entries
  const toggleShowAllEntries = () => {
    setShowAllEntries(!showAllEntries);
  };

  // Handle entry selection
  const handleEntrySelect = (entry: JournalEntry) => {
     // Debug log
    setSelectedEntry(entry);
    // Ensure journal text is set to the entry's content
    setNewEntry(entry.content || "");
  };

  // Confirm delete
  const confirmDelete = (entry: JournalEntry) => {
    Alert.alert(
      "Delete Entry",
      "Are you sure you want to delete this journal entry? This cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            // Use _id first (MongoDB ID) and fallback to id (local ID)
            const entryId = entry._id || entry.id;
            if (entryId) {
              deleteEntry(entryId);
            } else {
              Alert.alert("Error", "Could not identify journal entry");
            }
          },
        },
      ],
    );
  };

  // Delete a journal entry
  const deleteEntry = async (entryId: string) => {
    try {
      // Use journal service to delete entry
      const response = await journalService.deleteJournalEntry(entryId);

      if (response.success) {
        // Update state
        setEntries(
          entries.filter(
            (entry) => entry.id !== entryId && entry._id !== entryId,
          ),
        );

        // Close detail view if open
        if (
          selectedEntry &&
          (selectedEntry.id === entryId || selectedEntry._id === entryId)
        ) {
          setSelectedEntry(null);
        }
      } else {
        Alert.alert(
          "Error",
          response.message || "Failed to delete journal entry",
        );
      }
    } catch (error) {
      console.error("Failed to delete journal entry:", error);
      Alert.alert("Error", "Failed to delete your journal entry");
    }
  };

  // Render entry form
  const renderEntryForm = () => (
    <View style={styles.formContainer}>
      <View style={styles.formHeader}>
        <TouchableOpacity style={styles.backButton} onPress={resetForm}>
          <Ionicons name="arrow-back" size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Title style={styles.formTitle}>New Journal Entry</Title>
        <View style={styles.formDaySummary}>
          <Caption style={styles.formDayLabel}>Day</Caption>
          <Body style={styles.formDayNumber}>{currentStreak}</Body>
        </View>
      </View>

      <ScrollView style={styles.formScrollView}>
        <View style={styles.moodSelector}>
          <Body bold style={styles.sectionTitle}>
            How are you feeling today?
          </Body>
          <View style={styles.moodOptions}>
            {Object.entries(MOOD_EMOJIS).map(([mood, emoji]) => (
              <TouchableOpacity
                key={mood}
                style={[
                  styles.moodOption,
                  selectedMood === mood && styles.selectedMoodOption,
                ]}
                onPress={() => setSelectedMood(mood as JournalEntry["mood"])}
              >
                <Text style={styles.moodEmoji}>{emoji}</Text>
                <Caption
                  style={[
                    styles.moodLabel,
                    selectedMood === mood && styles.selectedMoodLabel,
                  ]}
                >
                  {mood.charAt(0).toUpperCase() + mood.slice(1)}
                </Caption>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <Card style={styles.formCard}>
          <Body bold style={styles.sectionTitle}>
            Write your thoughts
          </Body>
          <TextInput
            style={styles.journalInput}
            value={newEntry}
            onChangeText={setNewEntry}
            placeholder="What's on your mind today? How's your journey going?"
            placeholderTextColor={COLORS.textTertiary}
            multiline
            textAlignVertical="top"
          />

          <Body bold style={[styles.sectionTitle, { marginTop: SPACING.lg }]}>
            What's triggering you? (optional)
          </Body>
          <View style={styles.triggersContainer}>
            {AVAILABLE_TRIGGERS.map((trigger) => (
              <TouchableOpacity
                key={trigger}
                style={[
                  styles.triggerTag,
                  selectedTriggers.includes(trigger) && styles.selectedTriggerTag,
                ]}
                onPress={() => toggleTrigger(trigger)}
              >
                <Caption
                  style={[
                    styles.triggerText,
                    selectedTriggers.includes(trigger) &&
                      styles.selectedTriggerText,
                  ]}
                >
                  {trigger}
                </Caption>
              </TouchableOpacity>
            ))}
          </View>
        </Card>
      </ScrollView>

      <View style={styles.formActions}>
        <Button
          title="Cancel"
          onPress={resetForm}
          variant="outline"
          style={styles.formActionButton}
        />
        <Button
          title="Save Entry"
          onPress={saveEntry}
          variant="primary"
          style={styles.formActionButton}
          disabled={!newEntry.trim()}
        />
      </View>
    </View>
  );

  // Render entry detail view
  const renderEntryDetail = () => {
    if (!selectedEntry) return null;

    return (
      <View style={styles.entryDetailContainer}>
        <View style={styles.entryDetailHeader}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => setSelectedEntry(null)}
          >
            <Ionicons name="arrow-back" size={24} color={COLORS.textPrimary} />
          </TouchableOpacity>
          <View style={styles.entryDetailHeaderInfo}>
            <View style={styles.entryDetailBadge}>
              <Caption style={styles.entryDetailBadgeText}>
                DAY {selectedEntry.day}
              </Caption>
            </View>
            <Caption style={styles.entryDetailDate}>
              {formatDate(selectedEntry.createdAt)}
            </Caption>
          </View>
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={() => confirmDelete(selectedEntry)}
          >
            <Ionicons name="trash-outline" size={22} color={COLORS.danger} />
          </TouchableOpacity>
        </View>

        <Card style={styles.entryDetailCard}>
          <View style={styles.entryDetailMoodContainer}>
            <View style={styles.moodEmojiCircle}>
              <Text style={styles.entryDetailMoodEmoji}>
                {MOOD_EMOJIS[selectedEntry.mood]}
              </Text>
            </View>
            <View style={styles.moodTextContainer}>
              <Caption style={styles.moodLabelText}>MOOD</Caption>
              <Body style={styles.entryDetailMoodText}>
                {selectedEntry.mood.charAt(0).toUpperCase() +
                  selectedEntry.mood.slice(1)}
              </Body>
            </View>
          </View>

          {selectedEntry.triggers && selectedEntry.triggers.length > 0 && (
            <View style={styles.triggersSection}>
              <Caption style={styles.triggersSectionTitle}>TRIGGERS</Caption>
              <View style={styles.triggersRowContainer}>
                {selectedEntry.triggers.map((trigger) => (
                  <View key={trigger} style={styles.detailTriggerTag}>
                    <Caption style={styles.detailTriggerText}>
                      {trigger}
                    </Caption>
                  </View>
                ))}
              </View>
            </View>
          )}

          <View style={styles.contentSection}>
            <Caption style={styles.contentSectionTitle}>JOURNAL ENTRY</Caption>
            <ScrollView
              style={styles.entryDetailContent}
              showsVerticalScrollIndicator={false}
            >
              <Body style={styles.entryDetailText}>
                {selectedEntry.content}
              </Body>
            </ScrollView>
          </View>
        </Card>
      </View>
    );
  };

  // Get key for FlatList
  const getEntryKey = (item: JournalEntry): string => {
    return item._id || item.id || Date.now().toString();
  };

  // Main render
  if (selectedEntry) {
    return (
      <View style={styles.container}>
        <AnimatedStars />
        <StatusBar barStyle="light-content" />
        <SafeAreaView style={styles.container}>
          {renderEntryDetail()}
        </SafeAreaView>
      </View>
    );
  }

  if (isCreating) {
    return (
      <View style={styles.container}>
        <AnimatedStars />
        <StatusBar barStyle="light-content" />
        {renderEntryForm()}
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <AnimatedStars />
      <StatusBar barStyle="light-content" />
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Today's Prompt */}
        <Card style={styles.promptCard}>
          <View style={styles.promptHeader}>
            <View style={styles.promptBadge}>
              <Text style={styles.promptBadgeText}>
                Day {currentStreak}
              </Text>
            </View>
            <Caption style={styles.promptDate}>
              {formatDate(new Date().toISOString())}
            </Caption>
          </View>

          <Text style={styles.promptTitle}>Today's Reflection</Text>
          <Text style={styles.promptText}>{getPrompt(currentStreak)}</Text>

          <Button
            title="Write Your Thoughts"
            onPress={() => setIsCreating(true)}
            variant="primary"
            leftIcon="create-outline"
            style={styles.promptButton}
            fullWidth
          />
        </Card>

        {/* Recent Entries Header */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Entries</Text>
          {entries.length > 0 && (
            <TouchableOpacity onPress={toggleShowAllEntries}>
              <Text style={styles.viewAllText}>
                {showAllEntries ? "Show Less" : "View All"}
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {entries.length === 0 && (
          <Card style={styles.emptyCard}>
            <View style={styles.emptyContent}>
              <Ionicons
                name="journal-outline"
                size={48}
                color={COLORS.accent + "50"}
              />
              <Text style={styles.emptyTitle}>Start Your Journey</Text>
              <Text style={styles.emptyText}>
                Begin documenting your progress and insights to stay motivated
              </Text>
              <Button
                title="Create First Entry"
                onPress={() => setIsCreating(true)}
                variant="secondary"
                style={styles.emptyButton}
              />
            </View>
          </Card>
        )}

        {/* Entries List */}
        {entries.length > 0 && (
          <FlatList
            data={showAllEntries ? entries : entries.slice(0, 5)}
            keyExtractor={getEntryKey}
            // Performance optimizations
            removeClippedSubviews={true}
            maxToRenderPerBatch={8}
            updateCellsBatchingPeriod={50}
            initialNumToRender={5}
            windowSize={8}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.entryCard}
                onPress={() => handleEntrySelect(item)}
              >
                <View style={styles.entryHeader}>
                  <View style={styles.entryMeta}>
                    <View style={styles.dayBadge}>
                      <Text style={styles.dayBadgeText}>Day {item.day}</Text>
                    </View>
                    <Text style={styles.entryDate}>
                      {formatDate(item.createdAt)}
                    </Text>
                  </View>
                  <View style={styles.moodContainer}>
                    <Text style={styles.moodEmoji}>
                      {MOOD_EMOJIS[item.mood]}
                    </Text>
                    <Text style={styles.moodLabel}>
                      {item.mood.charAt(0).toUpperCase() + item.mood.slice(1)}
                    </Text>
                  </View>
                </View>

                <Text style={styles.entryPreview}>
                  {getShortContent(item.content)}
                </Text>

                {item.triggers && item.triggers.length > 0 && (
                  <View style={styles.triggerContainer}>
                    {item.triggers.slice(0, 3).map((trigger, index) => (
                      <View key={index} style={styles.triggerTag}>
                        <Text style={styles.triggerText}>{trigger}</Text>
                      </View>
                    ))}
                    {item.triggers.length > 3 && (
                      <Text style={styles.moreTriggers}>
                        +{item.triggers.length - 3} more
                      </Text>
                    )}
                  </View>
                )}
              </TouchableOpacity>
            )}
            contentContainerStyle={styles.entriesList}
          />
        )}
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
    paddingTop: SPACING.sm,
    paddingBottom: SPACING.xl,
  },
  heroSection: {
    paddingTop: SPACING.xl,
    paddingBottom: SPACING.xl * 1.5,
    paddingHorizontal: SPACING.lg,
    borderBottomLeftRadius: RADIUS.xl,
    borderBottomRightRadius: RADIUS.xl,
    backgroundColor: COLORS.accent + "08", // Very subtle tint
  },
  heroContent: {
    alignItems: "flex-start",
  },
  heroTitle: {
    fontSize: 32,
    fontWeight: "bold",
    marginBottom: SPACING.xs,
    color: COLORS.textPrimary,
  },
  heroSubtitle: {
    fontSize: 16,
    color: COLORS.textSecondary,
    opacity: 0.8,
  },
  quickActions: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingHorizontal: SPACING.lg,
    marginTop: -SPACING.xl,
    marginBottom: SPACING.lg,
  },
  quickActionButton: {
    alignItems: "center",
  },
  quickActionIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.card,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: SPACING.xs,
    ...Platform.select({
      ios: {
        shadowColor: COLORS.accent,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  quickActionText: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
  },
  promptCard: {
    marginHorizontal: SPACING.lg,
    marginTop: SPACING.lg,
    marginBottom: SPACING.md,
    padding: SPACING.lg,
    borderRadius: RADIUS.lg,
    backgroundColor: COLORS.card,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  promptHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: SPACING.md,
  },
  promptBadge: {
    backgroundColor: COLORS.accent + "20",
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: RADIUS.round,
  },
  promptBadgeText: {
    color: COLORS.accent,
    fontSize: 14,
    fontWeight: "600",
  },
  promptDate: {
    color: COLORS.textSecondary,
    fontSize: 14,
  },
  promptTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: COLORS.textPrimary,
    marginBottom: SPACING.sm,
  },
  promptText: {
    fontSize: 16,
    color: COLORS.textSecondary,
    lineHeight: 24,
    marginBottom: SPACING.lg,
  },
  promptButton: {
    marginTop: SPACING.sm,
  },
  entriesSection: {
    padding: SPACING.lg,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: SPACING.md,
    marginTop: SPACING.xl,
    marginHorizontal: SPACING.lg,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: COLORS.textPrimary,
  },
  viewAllText: {
    color: COLORS.accent,
    fontSize: 14,
    fontWeight: "500",
  },
  emptyCard: {
    padding: SPACING.xl,
    alignItems: "center",
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.lg,
  },
  emptyContent: {
    alignItems: "center",
    padding: SPACING.lg,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: COLORS.textPrimary,
    marginTop: SPACING.md,
    marginBottom: SPACING.xs,
  },
  emptyText: {
    color: COLORS.textSecondary,
    textAlign: "center",
    marginBottom: SPACING.lg,
    lineHeight: 20,
  },
  emptyButton: {
    minWidth: 200,
  },
  entryCard: {
    marginBottom: SPACING.md,
    marginHorizontal: SPACING.lg,
    padding: SPACING.lg,
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.lg,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  entryHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: SPACING.md,
  },
  entryMeta: {
    alignItems: "flex-start",
  },
  dayBadge: {
    backgroundColor: COLORS.accent + "20",
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: RADIUS.round,
    marginBottom: SPACING.xs,
  },
  dayBadgeText: {
    color: COLORS.accent,
    fontSize: 14,
    fontWeight: "600",
  },
  entryDate: {
    color: COLORS.textSecondary,
    fontSize: 14,
  },
  moodContainer: {
    alignItems: "center",
  },
  moodEmoji: {
    fontSize: 24,
    marginBottom: SPACING.xs,
  },
  moodLabel: {
    color: COLORS.textSecondary,
    fontSize: 12,
  },
  entryPreview: {
    fontSize: 15,
    color: COLORS.textPrimary,
    lineHeight: 22,
    marginBottom: SPACING.md,
  },
  triggerContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: SPACING.xs,
  },
  triggerTag: {
    backgroundColor: COLORS.accent + "15",
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: RADIUS.round,
    marginRight: SPACING.xs,
    marginBottom: SPACING.xs,
  },
  triggerText: {
    color: COLORS.accent,
    fontSize: 12,
    fontWeight: "500",
  },
  moreTriggers: {
    color: COLORS.textSecondary,
    fontSize: 12,
    marginLeft: SPACING.xs,
    alignSelf: "center",
  },
  entriesList: {
    paddingTop: SPACING.sm,
    paddingBottom: SPACING.xl,
  },
  formContainer: {
    flex: 1,
    padding: SPACING.md,
  },
  formHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: SPACING.lg,
  },
  backButton: {
    padding: SPACING.sm,
  },
  formTitle: {
    fontSize: FONTS.sizes.lg,
    fontWeight: "bold",
  },
  formDaySummary: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.accent + "20",
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: RADIUS.round,
  },
  formDayLabel: {
    color: COLORS.accent,
    fontSize: FONTS.sizes.xs,
    marginRight: SPACING.xs / 2,
  },
  formDayNumber: {
    fontSize: FONTS.sizes.md,
    fontWeight: "bold",
    color: COLORS.accent,
  },
  formScrollView: {
    flex: 1,
  },
  formCard: {
    padding: SPACING.md,
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.lg,
    marginTop: SPACING.md,
    marginBottom: SPACING.md,
  },
  moodSelector: {
    marginBottom: SPACING.md,
  },
  moodOptions: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  moodOption: {
    alignItems: "center",
    justifyContent: "center",
    padding: SPACING.sm,
    borderRadius: RADIUS.round,
    backgroundColor: COLORS.cardLight,
    minWidth: 60,
    width: 70,
    height: 70,
    aspectRatio: 1,
  },
  selectedMoodOption: {
    backgroundColor: COLORS.accent + "20",
    borderWidth: 1,
    borderColor: COLORS.accent,
  },
  moodEmoji: {
    fontSize: 24,
    marginBottom: SPACING.xs,
  },
  selectedMoodLabel: {
    color: COLORS.accent,
    fontWeight: "bold",
  },
  journalInput: {
    backgroundColor: COLORS.cardLight,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    height: 150,
    marginBottom: SPACING.sm,
    color: COLORS.textPrimary,
    fontSize: FONTS.sizes.md,
  },
  triggersContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: SPACING.sm,
  },
  selectedTriggerTag: {
    backgroundColor: COLORS.secondary,
    borderColor: COLORS.accent,
  },
  selectedTriggerText: {
    color: COLORS.textPrimary,
    fontWeight: "bold",
  },
  privacyToggle: {
    marginBottom: SPACING.sm,
  },
  toggleContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  toggleTrack: {
    width: 50,
    height: 24,
    borderRadius: RADIUS.round,
    backgroundColor: COLORS.cardLight,
    justifyContent: "center",
    paddingHorizontal: 2,
  },
  toggleTrackActive: {
    backgroundColor: COLORS.success + "50",
  },
  toggleThumb: {
    width: 20,
    height: 20,
    borderRadius: RADIUS.round,
    backgroundColor: COLORS.textSecondary,
  },
  toggleThumbActive: {
    backgroundColor: COLORS.success,
    transform: [{ translateX: 20 }],
  },
  toggleLabel: {
    marginLeft: SPACING.sm,
    color: COLORS.textSecondary,
  },
  formActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    padding: SPACING.sm,
  },
  formActionButton: {
    marginLeft: SPACING.sm,
    minWidth: 100,
  },
  entryDetailContainer: {
    flex: 1,
    padding: SPACING.md,
  },
  entryDetailHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: SPACING.md,
  },
  entryDetailHeaderInfo: {
    alignItems: "center",
  },
  entryDetailBadge: {
    backgroundColor: COLORS.primary + "30",
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: RADIUS.round,
    marginBottom: SPACING.xs,
  },
  entryDetailBadgeText: {
    color: COLORS.primary,
    fontSize: FONTS.sizes.xs,
    fontWeight: "bold",
  },
  entryDetailDate: {
    color: COLORS.textSecondary,
    fontSize: FONTS.sizes.sm,
  },
  entryDetailCard: {
    padding: SPACING.lg,
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.lg,
    marginTop: SPACING.sm,
    marginBottom: SPACING.md,
    flex: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 5,
    elevation: 4,
  },
  entryDetailMoodContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: SPACING.lg,
  },
  moodEmojiCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: COLORS.accent + "15",
    justifyContent: "center",
    alignItems: "center",
    marginRight: SPACING.md,
  },
  entryDetailMoodEmoji: {
    fontSize: 30,
  },
  moodTextContainer: {
    justifyContent: "center",
  },
  moodLabelText: {
    color: COLORS.textSecondary,
    fontSize: FONTS.sizes.xs,
    marginBottom: SPACING.xs / 2,
    letterSpacing: 1,
  },
  entryDetailMoodText: {
    color: COLORS.textPrimary,
    fontSize: FONTS.sizes.md,
    fontWeight: "600",
  },
  triggersSection: {
    marginBottom: SPACING.lg,
    paddingBottom: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.cardLight,
  },
  triggersSectionTitle: {
    color: COLORS.textSecondary,
    fontSize: FONTS.sizes.xs,
    marginBottom: SPACING.sm,
    letterSpacing: 1,
  },
  triggersRowContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  detailTriggerTag: {
    backgroundColor: COLORS.secondary,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: RADIUS.round,
    marginRight: SPACING.xs,
    marginBottom: SPACING.xs,
  },
  detailTriggerText: {
    color: COLORS.textPrimary,
    fontSize: FONTS.sizes.sm,
    fontWeight: "500",
  },
  contentSection: {
    flex: 1,
  },
  contentSectionTitle: {
    color: COLORS.textSecondary,
    fontSize: FONTS.sizes.xs,
    marginBottom: SPACING.sm,
    letterSpacing: 1,
  },
  entryDetailContent: {
    flex: 1,
  },
  entryDetailText: {
    fontSize: FONTS.sizes.md,
    lineHeight: 24,
    color: COLORS.textPrimary,
  },
  deleteButton: {
    padding: SPACING.sm,
  },
});

export default JournalScreen;
