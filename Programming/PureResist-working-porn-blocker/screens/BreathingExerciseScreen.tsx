import React, { useState, useEffect, useRef } from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Alert,
  Text,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Title, Body, Caption } from "../components/ui/Typography";
import { COLORS, SPACING } from "../utils/theme";
import { Ionicons } from "@expo/vector-icons";

// Define navigation prop type
interface NavigationProp {
  navigate: (screen: string) => void;
  replace: (screen: string) => void;
  goBack: () => void;
}

const EXERCISE_DURATION = 120; // 2 minutes in seconds
const BREATH_CYCLE = 20; // 10s (5s inhale + 5s exhale)
const TOTAL_CYCLES = 500;

type BreathStateType = "inhale" | "exhale";

// Define a constant for the inhale color
const INHALE_COLOR = COLORS.accent; // Main blue
const EXHALE_COLOR = "#1F5FCC"; // Same as inhale for consistency

const BreathingExerciseScreen = ({
  navigation,
}: {
  navigation: NavigationProp;
}) => {
  // Use refs for values that shouldn't trigger re-renders when they change
  const breathStateRef = useRef<BreathStateType>("inhale");
  const [breathState, setBreathState] = useState<BreathStateType>("inhale");
  const [timer, setTimer] = useState(0);
  const [secondsLeft, setSecondsLeft] = useState(5);
  const [breathCount, setBreathCount] = useState(1);

  // Animation values
  const circleSize = useRef(new Animated.Value(1)).current;

  // Track if component is mounted to prevent state updates after unmounting
  const isMounted = useRef(true);

  // Start breathing animation
  const startBreathAnimation = (state: BreathStateType) => {
    // Reset countdown timer for this phase
    setSecondsLeft(5);

    // Update the breath state in both state and ref
    setBreathState(state);
    breathStateRef.current = state;

    if (state === "inhale") {
      // Expand circle during inhale
      Animated.timing(circleSize, {
        toValue: 1.1,
        duration: 5000, // Full 5 seconds for inhale
        useNativeDriver: true,
      }).start();
    } else {
      // Shrink circle during exhale
      Animated.timing(circleSize, {
        toValue: 1,
        duration: 5000, // Full 5 seconds for exhale
        useNativeDriver: true,
      }).start();
    }
  };

  // Main exercise timer and logic
  useEffect(() => {
    isMounted.current = true;

    // Initial animation
    startBreathAnimation("inhale");

    // Main timer that tracks overall exercise progress
    const intervalId = setInterval(() => {
      if (!isMounted.current) return;

      setTimer((prevTimer) => {
        const newTime = prevTimer + 1;

        // Update seconds left in current breath phase
        setSecondsLeft((prev) => {
          if (prev <= 1) {
            const currentBreathState = breathStateRef.current;
            const newBreathState =
              currentBreathState === "inhale" ? "exhale" : "inhale";

            // Increment breath count when completing a full cycle (exhale to inhale)
            if (
              newBreathState === "inhale" &&
              currentBreathState === "exhale"
            ) {
              setBreathCount((prevCount) => {
                const newCount = prevCount + 1;
                if (newCount > TOTAL_CYCLES) {
                  setTimeout(() => {
                    if (isMounted.current) {
                      navigation.navigate("Main");
                    }
                  }, 3000);
                }
                return newCount;
              });
            }

            // Start animation for new state
            startBreathAnimation(newBreathState);

            // Reset to 5 seconds for new phase
            return 5;
          }
          return prev - 1;
        });

        return newTime;
      });
    }, 1000);

    return () => {
      isMounted.current = false;
      clearInterval(intervalId);
    };
  }, [navigation]); // No dependencies to prevent restarting

  const formatTime = (seconds: number) => {
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };

  // Handle the leave exercise button
  const handleLeaveExercise = () => {
    Alert.alert(
      "Leave Exercise",
      "Are you sure you want to end the breathing exercise?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Leave",
          style: "destructive",
          onPress: () => {
            navigation.navigate("Main");
          },
        },
      ],
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Centered timer at the top */}
      <View style={{ alignItems: "center", marginTop: 32, marginBottom: 16 }}>
        <Title style={{ fontSize: 32 }}>{formatTime(timer)}</Title>
      </View>

      {/* Breathing circle */}
      <View style={styles.circleContainer}>
        <Animated.View
          style={[
            styles.breathCircle,
            {
              transform: [{ scale: circleSize }],
              backgroundColor:
                breathState === "inhale" ? INHALE_COLOR : EXHALE_COLOR,
            },
          ]}
        />
      </View>

      {/* Instruction text */}
      <View style={styles.instructionContainer}>
        <Title
          style={[
            styles.instructionText,
            { color: breathState === "inhale" ? INHALE_COLOR : EXHALE_COLOR },
          ]}
        >
          {breathState === "inhale" ? "INHALE" : "EXHALE"}
        </Title>
        <Body style={[styles.timerText, { color: COLORS.accent }]}>
          {formatTime(secondsLeft)}
        </Body>
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <Body style={styles.footerText}>5s inhale • 5s exhale</Body>

        <TouchableOpacity
          style={styles.leaveButton}
          onPress={handleLeaveExercise}
        >
          <Ionicons
            name="close-circle"
            size={16}
            color={COLORS.danger}
            style={styles.leaveIcon}
          />
          <Body style={{ color: COLORS.danger }}>Leave Exercise</Body>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  circleContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  breathCircle: {
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: COLORS.accent,
  },
  instructionContainer: {
    alignItems: "center",
    marginVertical: SPACING.xl,
  },
  instructionText: {
    fontSize: 32,
    marginBottom: SPACING.xs,
  },
  timerText: {
    color: COLORS.textSecondary,
    fontSize: 18,
  },
  footer: {
    alignItems: "center",
    paddingBottom: SPACING.xl * 2,
  },
  footerText: {
    color: COLORS.textSecondary,
    marginBottom: SPACING.lg,
  },
  leaveButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: SPACING.sm,
  },
  leaveIcon: {
    marginRight: SPACING.xs,
  },
});

export default BreathingExerciseScreen;
