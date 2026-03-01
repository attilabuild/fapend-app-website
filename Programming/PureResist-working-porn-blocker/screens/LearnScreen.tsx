import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Title, Subtitle, Body, Caption } from "../components/ui/Typography";
import Card from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { COLORS, SPACING, RADIUS, FONTS } from "../utils/theme";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Define the lesson type
interface Lesson {
  id: string;
  title: string;
  summary: string;
  content: string;
  category: "science" | "motivation" | "habits" | "psychology";
  readTime: number; // in minutes
  completed: boolean;
}

// Sample lessons data
const LESSONS: Lesson[] = [
  {
    id: "1",
    title: "How Dopamine Affects Your Brain",
    summary:
      "Learn about the science of dopamine and how porn affects your reward system",
    content:
      'Dopamine is a neurotransmitter that plays a role in how we feel pleasure. Porn creates an artificial dopamine spike that can lead to desensitization over time. This explains why people need increasingly extreme content to feel the same level of arousal.\n\nWhen you abstain from porn, your brain begins a process called "dopamine receptor upregulation," where sensitivity to normal levels of dopamine increases. This is why many people report feeling more pleasure from everyday activities after quitting porn.',
    category: "science",
    readTime: 4,
    completed: false,
  },
  {
    id: "2",
    title: "Building New Neural Pathways",
    summary: "How to rewire your brain for healthier habits",
    content:
      "Your brain creates neural pathways based on repeated behaviors. When you consistently use porn, your brain creates strong neural pathways that associate arousal with screens rather than real human connection.\n\nThe good news is that the brain is plastic - it can change! When you stop using porn and engage in healthier activities, your brain begins to form new neural pathways. This process takes time, typically 90+ days for significant changes, which is why many NoFap challenges recommend this timeframe.",
    category: "science",
    readTime: 5,
    completed: false,
  },
  {
    id: "3",
    title: "Creating Healthy Habits",
    summary: "Replace bad habits with positive alternatives",
    content:
      "Habits have three components: cue, routine, and reward. To break the porn habit, identify your triggers (cues) such as boredom, stress, or loneliness. Then, create a new routine to replace porn use, such as exercise, meditation, or calling a friend.\n\nConsistently practice these new routines until they become automatic. Remember, it takes about 66 days on average to form a new habit, so be patient with yourself during this process.",
    category: "habits",
    readTime: 3,
    completed: false,
  },
  {
    id: "4",
    title: "Benefits of NoFap",
    summary: "What changes can you expect during your journey",
    content:
      "Many people report significant benefits from abstaining from porn:Increased energy and motivation Better focus and concentration Reduced anxiety and depression\n- More confidence in social situations\n- Stronger connections with partners\n- Greater appreciation for real-life experiences\n\nThese benefits typically begin to appear within 2-4 weeks and continue to develop over time. Remember that everyone's journey is different, and your experience may vary.",
    category: "motivation",
    readTime: 4,
    completed: false,
  },
  {
    id: "5",
    title: "Understanding Urges",
    summary: "The psychology behind urges and how to manage them",
    content:
      "Urges are temporary neurological events. When you experience an urge, your brain is essentially requesting the dopamine hit it's accustomed to. The key insight is that urges always pass, typically within 15-20 minutes.Instead of fighting urges (which gives them more power), practice \"urge surfing\" - observe the urge like a wave that rises, peaks, and eventually subsides. This mindfulness technique reduces the urge's control over your behavior and strengthens your ability to let urges pass without acting on them.",
    category: "psychology",
    readTime: 5,
    completed: false,
  },
  {
    id: "6",
    title: "The Importance of Sleep",
    summary: "How quality sleep impacts recovery and willpower",
    content:
      "Sleep is crucial for NoFap success. Poor sleep increases stress hormones, reduces willpower, and makes you more vulnerable to relapse. During sleep, your brain processes emotions and consolidates new habits.nAim for 7-9 hours of quality sleep each night. Establish a regular sleep schedule and create a bedtime routine without screens at least 30 minutes before bed. Many relapses occur late at night when willpower is depleted, so prioritizing sleep is an essential recovery strategy.",
    category: "habits",
    readTime: 3,
    completed: false,
  },
  {
    id: "7",
    title: "Developing Emotional Intelligence",
    summary: "Learn to recognize and manage emotions without escaping",
    content:
      'Many people use porn to escape uncomfortable emotions. Developing emotional intelligence means learning to identify, understand, and manage your emotions in healthy ways.\n\nPractice labeling your emotions specifically (instead of just "bad" or "good"). Ask yourself what you\'re feeling and why. This simple practice reduces the emotion\'s intensity and helps you respond rather than react. When you feel triggered, try the HALT technique - ask if you\'re Hungry, Angry, Lonely, or Tired, and address the underlying need directly.',
    category: "psychology",
    readTime: 4,
    completed: false,
  },
];

// Function to get the current day's lesson
const getCurrentDayLesson = (completedLessons: string[]) => {
  const uncompleted = LESSONS.filter(
    (lesson) => !completedLessons.includes(lesson.id),
  );
  return uncompleted.length > 0 ? uncompleted[0] : LESSONS[0];
};

const LearnScreen = ({ navigation }) => {
  const [completedLessons, setCompletedLessons] = useState<string[]>([]);
  const [currentLesson, setCurrentLesson] = useState<Lesson | null>(null);
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const [showLessonContent, setShowLessonContent] = useState(false);

  // Load completed lessons from storage
  useEffect(() => {
    const loadCompletedLessons = async () => {
      try {
        const storedLessons = await AsyncStorage.getItem("completed_lessons");
        const completed = storedLessons ? JSON.parse(storedLessons) : [];
        setCompletedLessons(completed);

        // Set the current day's lesson
        const lesson = getCurrentDayLesson(completed);
        setCurrentLesson(lesson);
      } catch (error) {
        console.error("Failed to load completed lessons:", error);
      }
    };

    loadCompletedLessons();
  }, []);

  // Mark a lesson as completed
  const markLessonCompleted = async (lessonId: string) => {
    try {
      const newCompleted = [...completedLessons, lessonId];
      setCompletedLessons(newCompleted);
      await AsyncStorage.setItem(
        "completed_lessons",
        JSON.stringify(newCompleted),
      );

      // Update current lesson
      setCurrentLesson(getCurrentDayLesson(newCompleted));
      setShowLessonContent(false);
    } catch (error) {
      console.error("Failed to save completed lesson:", error);
    }
  };

  // Show a lesson's content
  const openLesson = (lesson: Lesson) => {
    setSelectedLesson(lesson);
    setShowLessonContent(true);
  };

  // Get the category icon
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "science":
        return "brain" as keyof typeof Ionicons.glyphMap;
      case "motivation":
        return "flame" as keyof typeof Ionicons.glyphMap;
      case "habits":
        return "repeat" as keyof typeof Ionicons.glyphMap;
      case "psychology":
        return "heart" as keyof typeof Ionicons.glyphMap;
      default:
        return "document-text" as keyof typeof Ionicons.glyphMap;
    }
  };

  // Get the category color
  const getCategoryColor = (category: string) => {
    switch (category) {
      case "science":
        return "#4d90fe";
      case "motivation":
        return "#ff6b6b";
      case "habits":
        return "#5ec576";
      case "psychology":
        return "#cc66ff";
      default:
        return COLORS.accent;
    }
  };

  // Render the lesson content view
  const renderLessonContent = () => {
    if (!selectedLesson) return null;

    return (
      <View style={styles.lessonContentContainer}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => setShowLessonContent(false)}
        >
          <Ionicons name="arrow-back" size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>

        <View style={styles.lessonHeader}>
          <View
            style={[
              styles.categoryBadge,
              { backgroundColor: getCategoryColor(selectedLesson.category) },
            ]}
          >
            <Ionicons
              name={getCategoryIcon(selectedLesson.category)}
              size={16}
              color="white"
            />
            <Caption style={styles.categoryText}>
              {selectedLesson.category.charAt(0).toUpperCase() +
                selectedLesson.category.slice(1)}
            </Caption>
          </View>

          <Caption style={styles.readTime}>
            {selectedLesson.readTime} min read
          </Caption>
        </View>

        <Title style={styles.lessonTitle}>{selectedLesson.title}</Title>
        <Subtitle style={styles.lessonSummary}>
          {selectedLesson.summary}
        </Subtitle>

        <ScrollView style={styles.contentScroll}>
          <Body style={styles.lessonContent}>{selectedLesson.content}</Body>
        </ScrollView>

        {!completedLessons.includes(selectedLesson.id) && (
          <Button
            title="Mark as Completed"
            onPress={() => markLessonCompleted(selectedLesson.id)}
            variant="primary"
            style={styles.completeButton}
          />
        )}
      </View>
    );
  };

  // Render the lessons list
  const renderLessonsList = () => {
    return (
      <>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {currentLesson && (
            <View style={styles.todayLessonSection}>
              <Title style={styles.sectionTitle}>Today's Lesson</Title>
              <Card
                style={styles.featuredLessonCard}
                onPress={() => openLesson(currentLesson)}
              >
                <View style={styles.featuredCardContent}>
                  <View
                    style={[
                      styles.categoryBadge,
                      {
                        backgroundColor: getCategoryColor(
                          currentLesson.category,
                        ),
                      },
                    ]}
                  >
                    <Ionicons
                      name={getCategoryIcon(currentLesson.category)}
                      size={16}
                      color="white"
                    />
                    <Caption style={styles.categoryText}>
                      {currentLesson.category.charAt(0).toUpperCase() +
                        currentLesson.category.slice(1)}
                    </Caption>
                  </View>

                  <Title style={styles.cardTitle}>{currentLesson.title}</Title>
                  <Body style={styles.cardSummary}>
                    {currentLesson.summary}
                  </Body>

                  <View style={styles.cardFooter}>
                    <Caption style={styles.readTime}>
                      {currentLesson.readTime} min read
                    </Caption>
                    <Ionicons
                      name="arrow-forward"
                      size={18}
                      color={COLORS.accent}
                    />
                  </View>
                </View>
              </Card>
            </View>
          )}

          <Title style={styles.sectionTitle}>All Lessons</Title>

          {LESSONS.map((lesson) => (
            <Card
              key={lesson.id}
              style={[
                styles.lessonCard,
                completedLessons.includes(lesson.id) &&
                  styles.completedLessonCard,
              ]}
              onPress={() => openLesson(lesson)}
            >
              <View style={styles.lessonCardContent}>
                <View style={styles.lessonCardHeader}>
                  <View
                    style={[
                      styles.categoryBadge,
                      { backgroundColor: getCategoryColor(lesson.category) },
                    ]}
                  >
                    <Ionicons
                      name={getCategoryIcon(lesson.category)}
                      size={16}
                      color="white"
                    />
                  </View>

                  {completedLessons.includes(lesson.id) && (
                    <View style={styles.completedBadge}>
                      <Ionicons
                        name="checkmark-circle"
                        size={20}
                        color={COLORS.success}
                      />
                      <Caption style={styles.completedText}>Completed</Caption>
                    </View>
                  )}
                </View>

                <Title style={styles.lessonCardTitle}>{lesson.title}</Title>
                <Body numberOfLines={2} style={styles.lessonCardSummary}>
                  {lesson.summary}
                </Body>

                <View style={styles.cardFooter}>
                  <Caption style={styles.readTime}>
                    {lesson.readTime} min read
                  </Caption>
                  <Ionicons
                    name="arrow-forward"
                    size={18}
                    color={COLORS.accent}
                  />
                </View>
              </View>
            </Card>
          ))}
        </ScrollView>
      </>
    );
  };

  return <>{showLessonContent ? renderLessonContent() : renderLessonsList()}</>;
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
    alignItems: "flex-start",
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
  todayLessonSection: {
    marginBottom: SPACING.lg,
  },
  featuredLessonCard: {
    marginBottom: SPACING.md,
  },
  featuredCardContent: {
    padding: SPACING.md,
  },
  categoryBadge: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs / 2,
    borderRadius: RADIUS.round,
    marginBottom: SPACING.sm,
  },
  categoryText: {
    color: "white",
    marginLeft: SPACING.xs,
    fontSize: FONTS.sizes.sm,
  },
  cardTitle: {
    fontSize: FONTS.sizes.lg,
    marginBottom: SPACING.xs,
  },
  cardSummary: {
    color: COLORS.textSecondary,
    marginBottom: SPACING.md,
  },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: SPACING.sm,
  },
  readTime: {
    color: COLORS.textTertiary,
    fontSize: FONTS.sizes.sm,
  },
  lessonCard: {
    marginBottom: SPACING.md,
  },
  completedLessonCard: {
    borderLeftColor: COLORS.success,
    borderLeftWidth: 4,
  },
  lessonCardContent: {
    padding: SPACING.md,
  },
  lessonCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: SPACING.sm,
  },
  lessonCardTitle: {
    fontSize: FONTS.sizes.md,
    marginBottom: SPACING.xs,
  },
  lessonCardSummary: {
    color: COLORS.textSecondary,
    fontSize: FONTS.sizes.sm,
    marginBottom: SPACING.md,
  },
  completedBadge: {
    flexDirection: "row",
    alignItems: "center",
  },
  completedText: {
    color: COLORS.success,
    marginLeft: SPACING.xs,
    fontSize: FONTS.sizes.sm,
  },
  lessonContentContainer: {
    flex: 1,
    padding: SPACING.md,
  },
  backButton: {
    alignSelf: "flex-start",
    marginBottom: SPACING.md,
  },
  lessonHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: SPACING.sm,
  },
  lessonTitle: {
    fontSize: FONTS.sizes.xl,
    marginBottom: SPACING.sm,
  },
  lessonSummary: {
    color: COLORS.textSecondary,
    marginBottom: SPACING.lg,
  },
  contentScroll: {
    flex: 1,
  },
  lessonContent: {
    lineHeight: 24,
    marginBottom: SPACING.xl,
  },
  completeButton: {
    marginTop: SPACING.md,
  },
  headerTop: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: SPACING.xs,
  },
  headerTitle: {
    flex: 1,
  },
});

export default LearnScreen;
