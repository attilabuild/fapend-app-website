import React, { useState, useEffect, useRef } from "react";
import { View, StyleSheet, Animated } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Title, Body } from "../components/ui/Typography";
import { COLORS, SPACING } from "../utils/theme";

// Define navigation prop type
interface NavigationProp {
  navigate: (screen: string) => void;
  replace: (screen: string) => void;
  goBack: () => void;
}

const BreathingCountdownScreen = ({
  navigation,
}: {
  navigation: NavigationProp;
}) => {
  const [countdown, setCountdown] = useState(5);
  const pulseAnim = useRef(new Animated.Value(1)).current;

  // Pulse animation
  const pulse = () => {
    Animated.sequence([
      Animated.timing(pulseAnim, {
        toValue: 1.2,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(pulseAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();
  };

  useEffect(() => {
    // Initial pulse
    pulse();

    // Start countdown
    const intervalId = setInterval(() => {
      setCountdown((prevCount) => {
        const newCount = prevCount - 1;

        // Pulse animation
        pulse();

        // Navigate to breathing exercise when countdown ends
        if (newCount <= 0) {
          clearInterval(intervalId);
          setTimeout(() => {
            navigation.navigate("BreathingExercise");
          }, 500);
        }

        return newCount;
      });
    }, 1000);

    // Cleanup
    return () => {
      clearInterval(intervalId);
    };
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Animated.View
          style={[
            styles.countdownCircle,
            {
              transform: [{ scale: pulseAnim }],
              opacity: pulseAnim.interpolate({
                inputRange: [1, 1.2],
                outputRange: [1, 0.7],
              }),
            },
          ]}
        >
          <Title style={[styles.countdownNumber, { color: COLORS.primary }]}>
            {countdown}
          </Title>
        </Animated.View>

        <Title style={styles.startingText}>STARTING IN</Title>

        <Body style={styles.instructions}>
          Follow the circle to time your breathing
        </Body>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: SPACING.xl,
  },
  countdownCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: COLORS.accent, // Orange color from the screenshot
    justifyContent: "center",
    alignItems: "center",
    marginBottom: SPACING.xl * 2,
  },
  countdownNumber: {
    fontSize: 60,
    color: COLORS.textPrimary,
  },
  startingText: {
    marginBottom: SPACING.md,
  },
  instructions: {
    textAlign: "center",
    color: COLORS.textSecondary,
    maxWidth: "80%",
  },
});

export default BreathingCountdownScreen;
