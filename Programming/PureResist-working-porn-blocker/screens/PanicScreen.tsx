import React from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Text,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Title, Body, Caption } from "../components/ui/Typography";
import Card from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { COLORS, SPACING, RADIUS, FONTS } from "../utils/theme";
import { Ionicons } from "@expo/vector-icons";

// Define navigation prop type
interface NavigationProp {
  navigate: (screen: string) => void;
  replace: (screen: string) => void;
  goBack: () => void;
}

const PanicScreen = ({ navigation }: { navigation: NavigationProp }) => {
  // Current streak for the message (use a real value in production)
  const currentStreak = 2; // 48 hours = 2 days

  const fullText =
    "Remember that YOU are in control. Take a few deep breaths and focus on the present moment.";

  // Words to emphasize
  const emphasizedWords = ["YOU", "control", "deep breaths", "present moment"];

  // Function to render text with emphasized words
  const renderTextWithEmphasis = (text: string) => {
    if (!text) return null;

    let result = text;
    emphasizedWords.forEach((word) => {
      const regex = new RegExp(`(${word})`, "g");
      result = result.replace(regex, `|EMPH|$1|/EMPH|`);
    });

    const parts = result.split(/(\|EMPH\|.*?\|\/EMPH\|)/g);

    return parts.map((part, index) => {
      if (part.startsWith("|EMPH|")) {
        const emphasizedText = part
          .replace("|EMPH|", "")
          .replace("|/EMPH|", "");
        return (
          <Text key={index} style={styles.emphasizedText}>
            {emphasizedText}
          </Text>
        );
      }
      return <Text key={index}>{part}</Text>;
    });
  };

  const handleClose = () => {
    navigation.goBack();
  };

  const handleLoseControl = () => {
    navigation.navigate("BreathingCountdown");
  };

  const handleGoodForNow = () => {
    navigation.goBack();
  };

  return (
    <>
      <ScrollView style={styles.scrollView}>
        <View style={styles.motivationContainer}>
          <Text style={styles.motivationText}>
            {renderTextWithEmphasis(fullText)}
          </Text>
        </View>

        <View style={styles.cardsContainer}>
          <Card style={styles.card}>
            <View style={styles.cardContent}>
              <Ionicons
                name="sad-outline"
                size={32}
                color={COLORS.textSecondary}
                style={styles.cardIcon}
              />
              <View style={styles.cardTextContainer}>
                <Body style={styles.cardTitle} bold>
                  ERECTILE DYSFUNCTION
                </Body>
                <Caption style={styles.cardDescription}>
                  Struggling to get or maintain an erection in real-life
                  situations.
                </Caption>
              </View>
            </View>
          </Card>

          <Card style={styles.card}>
            <View style={styles.cardContent}>
              <Ionicons
                name="pulse-outline"
                size={32}
                color={COLORS.textSecondary}
                style={styles.cardIcon}
              />
              <View style={styles.cardTextContainer}>
                <Body style={styles.cardTitle} bold>
                  Desensitization
                </Body>
                <Caption style={styles.cardDescription}>
                  In need of more extreme content to feel the same level of
                  arousal.
                </Caption>
              </View>
            </View>
          </Card>

          <Card style={styles.card}>
            <View style={styles.cardContent}>
              <Ionicons
                name="eye-off-outline"
                size={32}
                color={COLORS.textSecondary}
                style={styles.cardIcon}
              />
              <View style={styles.cardTextContainer}>
                <Body style={styles.cardTitle} bold>
                  DISTORTED EXPECTATIONS
                </Body>
                <Caption style={styles.cardDescription}>
                  Unrealistic ideas about sex and relationships.
                </Caption>
              </View>
            </View>
          </Card>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Button
          title="I'm about to lose control"
          variant="danger"
          leftIcon="alert-circle"
          onPress={handleLoseControl}
          fullWidth
          style={styles.panicButton}
        />
        <TouchableOpacity
          onPress={handleGoodForNow}
          style={styles.goodForNowButton}
        >
          <Caption style={styles.goodForNowText}>I'm good for now</Caption>
        </TouchableOpacity>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollView: {
    flex: 1,
  },
  motivationContainer: {
    marginTop: SPACING.xl,
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.xl,
    alignItems: "center",
    justifyContent: "center",
  },
  motivationText: {
    fontSize: FONTS.sizes.xl,
    textAlign: "center",
    lineHeight: FONTS.sizes.xl * 1.5,
    fontWeight: "bold",
    color: COLORS.textPrimary,
    minHeight: FONTS.sizes.xl * 4.5, // Ensure height doesn't change during animation
  },
  emphasizedText: {
    fontWeight: "bold",
    color: COLORS.danger,
    textShadowColor: "rgba(41, 121, 255, 0.5)",
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
  },
  highlightText: {
    color: COLORS.danger,
    fontWeight: "bold",
  },
  cardsContainer: {
    paddingHorizontal: SPACING.md,
    paddingBottom: SPACING.xl,
  },
  card: {
    marginBottom: SPACING.md,
    backgroundColor: COLORS.cardDark,
  },
  cardContent: {
    flexDirection: "row",
    alignItems: "center",
    padding: SPACING.md,
  },
  cardIcon: {
    marginRight: SPACING.md,
  },
  cardTextContainer: {
    flex: 1,
  },
  cardTitle: {
    marginBottom: SPACING.xs,
  },
  cardDescription: {
    color: COLORS.textSecondary,
  },
  footer: {
    padding: SPACING.md,
    paddingBottom: SPACING.xl,
  },
  panicButton: {
    marginBottom: SPACING.md,
    height: 40,
    borderRadius: 30,
  },
  goodForNowButton: {
    alignItems: "center",
    padding: SPACING.sm,
  },
  goodForNowText: {
    color: COLORS.textSecondary,
  },
});

export default PanicScreen;
