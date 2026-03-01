import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  Keyboard,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { COLORS, SPACING, RADIUS } from "../utils/theme";
import { Ionicons } from "@expo/vector-icons";
import { createPost, getUserProfile } from "../services/api";
import { useAuthStore } from "../hooks/useStore";

type RootStackParamList = {
  NewPost: undefined;
};

type Props = NativeStackScreenProps<RootStackParamList, "NewPost">;

// Available tags for posts
const TAGS = [
  { id: "win", label: "Win", color: COLORS.success },
  { id: "day1", label: "Day 1", color: COLORS.info },
  { id: "advice", label: "Advice", color: COLORS.accent },
  { id: "support", label: "Support", color: COLORS.warning },
  { id: "tips", label: "Tips", color: COLORS.accent },
  { id: "motivation", label: "Motivation", color: COLORS.success },
  { id: "vent", label: "Vent", color: COLORS.danger },
];

const NewPostScreen: React.FC<Props> = ({ navigation }) => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [selectedTag, setSelectedTag] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validUserConfirmed, setValidUserConfirmed] = useState(false);
  const { user } = useAuthStore();

  // Check user validity when the screen loads
  useEffect(() => {
    if (user?._id) {
      checkUserValidity();
    }
  }, [user?._id]);

  // Check if the user exists in the database
  const checkUserValidity = async () => {
    if (!user?._id) return;

    try {
      const response = await getUserProfile(user._id);

      if (response.success && response.data) {
        setValidUserConfirmed(true);
      } else {
        console.error("User profile validation failed:", response.message);
        // Don't show an alert immediately, wait until they try to post
      }
    } catch (error) {
      console.error("Error validating user:", error);
    }
  };

  const handleSubmit = async () => {
    // Validate form
    if (!title.trim()) {
      Alert.alert("Missing Information", "Please enter a title for your post.");
      return;
    }

    if (!content.trim()) {
      Alert.alert("Missing Information", "Please enter content for your post.");
      return;
    }

    if (!selectedTag) {
      Alert.alert("Missing Information", "Please select a tag for your post.");
      return;
    }

    if (!user || !user._id) {
      Alert.alert("Error", "You must be logged in to create a post.");
      return;
    }

    // Check if user exists in database first if not already confirmed
    if (!validUserConfirmed) {
      const userCheckResponse = await getUserProfile(user._id);

      if (!userCheckResponse.success || !userCheckResponse.data) {
        Alert.alert(
          "Account Error",
          "Your account information could not be verified. You may need to log out and log in again.",
          [{ text: "OK" }],
        );
        return;
      }

      setValidUserConfirmed(true);
    }

    try {
      setIsSubmitting(true);
      // Dismiss keyboard
      Keyboard.dismiss();

      // Call API to create post
      const response = await createPost(user._id, {
        title: title.trim(),
        content: content.trim(),
        tag: selectedTag,
      });

      if (response.success) {
        // Navigate back immediately so the post shows up in the list
        navigation.goBack();

        // Show success message after navigation
        setTimeout(() => {
          Alert.alert(
            "Success!",
            "Your post has been published to the community.",
          );
        }, 300);
      } else {
        // Check for specific error messages
        if (response.message?.includes("User not found")) {
          Alert.alert(
            "Account Error",
            "Your account information could not be found. Please log out and log in again.",
            [{ text: "OK" }],
          );
        } else {
          Alert.alert(
            "Error",
            response.message || "Failed to create post. Please try again.",
          );
        }
      }
    } catch (error) {
      console.error("Error creating post:", error);
      Alert.alert("Error", "An unexpected error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderTagPicker = () => {
    return (
      <View style={styles.tagsContainer}>
        <Text style={styles.tagsLabel}>Select a tag:</Text>
        <View style={styles.tagsList}>
          {TAGS.map((tag) => (
            <TouchableOpacity
              key={tag.id}
              style={[
                styles.tagButton,
                selectedTag === tag.id && { backgroundColor: tag.color },
              ]}
              onPress={() => setSelectedTag(tag.id)}
            >
              <Text
                style={[
                  styles.tagButtonText,
                  selectedTag === tag.id && styles.selectedTagText,
                ]}
              >
                {tag.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    );
  };

  return (
    <>
      <ScrollView style={styles.scrollView}>
        <View style={styles.contentContainer}>
          <Text style={styles.screenTitle}>Create New Post</Text>

          <View style={styles.formContainer}>
            <TextInput
              style={styles.titleInput}
              placeholder="Title of your post"
              placeholderTextColor={COLORS.textTertiary}
              value={title}
              onChangeText={setTitle}
              maxLength={100}
              editable={!isSubmitting}
            />

            {renderTagPicker()}

            <TextInput
              style={styles.contentInput}
              placeholder="Share your thoughts, questions, or experiences..."
              placeholderTextColor={COLORS.textTertiary}
              value={content}
              onChangeText={setContent}
              multiline
              textAlignVertical="top"
              editable={!isSubmitting}
            />

            <View style={styles.postButtonContainer}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => navigation.goBack()}
                disabled={isSubmitting}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>

              {isSubmitting ? (
                <View style={styles.loadingButton}>
                  <ActivityIndicator size="small" color={COLORS.primary} />
                </View>
              ) : (
                <TouchableOpacity
                  style={[
                    styles.postButton,
                    (!title.trim() || !content.trim() || !selectedTag) &&
                      styles.disabledButton,
                  ]}
                  onPress={handleSubmit}
                  disabled={!title.trim() || !content.trim() || !selectedTag}
                >
                  <Text style={styles.postButtonText}>Post</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>
      </ScrollView>
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
  contentContainer: {
    padding: SPACING.md,
    paddingBottom: SPACING.xl * 2,
  },
  screenTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: COLORS.textPrimary,
    marginBottom: SPACING.lg,
  },
  formContainer: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
  },
  titleInput: {
    backgroundColor: COLORS.cardLight,
    borderRadius: RADIUS.sm,
    padding: SPACING.md,
    fontSize: 16,
    color: COLORS.textPrimary,
    marginBottom: SPACING.md,
  },
  tagsContainer: {
    marginBottom: SPACING.md,
  },
  tagsLabel: {
    fontSize: 16,
    color: COLORS.textSecondary,
    marginBottom: SPACING.sm,
  },
  tagsList: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  tagButton: {
    backgroundColor: COLORS.cardLight,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: RADIUS.xs,
    marginRight: SPACING.xs,
    marginBottom: SPACING.xs,
  },
  tagButtonText: {
    color: COLORS.textSecondary,
    fontSize: 14,
  },
  selectedTagText: {
    color: COLORS.textPrimary,
    fontWeight: "bold",
  },
  contentInput: {
    backgroundColor: COLORS.cardLight,
    borderRadius: RADIUS.sm,
    padding: SPACING.md,
    fontSize: 16,
    color: COLORS.textPrimary,
    height: 200,
    marginBottom: SPACING.md,
  },
  postButtonContainer: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
  },
  cancelButton: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.sm,
    marginRight: SPACING.md,
  },
  cancelButtonText: {
    color: COLORS.textSecondary,
    fontSize: 16,
    fontWeight: "500",
  },
  postButton: {
    backgroundColor: COLORS.accent,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.sm,
  },
  postButtonText: {
    color: COLORS.textPrimary,
    fontSize: 16,
    fontWeight: "bold",
  },
  disabledButton: {
    backgroundColor: COLORS.cardDark,
    opacity: 0.7,
  },
  loadingButton: {
    backgroundColor: COLORS.accent,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.sm,
    minWidth: 70,
    alignItems: "center",
  },
});

export default NewPostScreen;
