import React, { memo, useState, useEffect, useCallback } from "react";
import { useNavigation } from "@react-navigation/native";
import {
  View,
  Text,
  TouchableOpacity,
  Linking,
  StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAuthStore } from "../../hooks/useStore";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { COLORS } from "../../utils/theme";

const TodoSection = memo(() => {
  const navigation = useNavigation();

  const { user } = useAuthStore();
  const userId = user?._id;
  const [todoStates, setTodoStates] = useState({
    discord: false,
    reddit: false,
    community: false,
    journal: false,
  });

  // Load saved todo states
  useEffect(() => {
    const loadTodoStates = async () => {
      if (!userId) return;

      try {
        const savedStates = await AsyncStorage.getItem(`todo_states_${userId}`);
        if (savedStates) {
          const states = JSON.parse(savedStates);
          if (JSON.stringify(states) !== JSON.stringify(todoStates)) {
            setTodoStates(states);
          }
        }
      } catch (error) {
        console.error("Error loading todo states:", error);
      }
    };

    loadTodoStates();
  }, []);

  const handleToggleTodo = async (
    key: "discord" | "reddit" | "community" | "journal",
  ) => {
    if (!userId) return;

    const newStates = {
      ...todoStates,
      [key]: !todoStates[key],
    };

    try {
      await AsyncStorage.setItem(
        `todo_states_${userId}`,
        JSON.stringify(newStates),
      );
      setTodoStates(newStates);
    } catch (error) {
      console.error("Error saving todo state:", error);
    }
  };

  const handleDiscordPress = useCallback(() => {
    Linking.openURL("https://discord.gg/zWJDmqNhZz");
  }, []);

  const handleRedditPress = useCallback(() => {
    Linking.openURL("https://reddit.com/r/pureresist");
  }, []);

  const handleCommunityPress = useCallback(() => {
    navigation.navigate("Community");
  }, [navigation]);

  const handleJournalPress = useCallback(() => {
    navigation.navigate("Journal");
  }, [navigation]);

  return (
    <View style={quittrStyles.todoSection}>
      <View style={quittrStyles.sectionHeader}>
        <Ionicons name="apps" size={24} color="#FFF" />
        <Text style={quittrStyles.sectionTitle}>To-do</Text>
      </View>
      <View style={quittrStyles.todoItem}>
        <TouchableOpacity
          style={quittrStyles.todoLeft}
          onPress={handleDiscordPress}
        >
          <Ionicons name="logo-discord" size={24} color="#7289DA" />
          <View style={quittrStyles.todoTextContainer}>
            <Text style={quittrStyles.todoTitle}>Join Discord Server</Text>
            <Text style={quittrStyles.todoSubtitle}>
              Join our supportive community on Discord for daily motivation and
              accountability
            </Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => handleToggleTodo("discord")}
          style={[
            quittrStyles.todoCheckbox,
            todoStates.discord && {
              backgroundColor: "#4CAF50",
              borderColor: "#4CAF50",
            },
          ]}
        >
          {todoStates.discord && (
            <Ionicons name="checkmark" size={16} color="#FFF" />
          )}
        </TouchableOpacity>
      </View>
      <View style={quittrStyles.todoItem}>
        <TouchableOpacity
          style={quittrStyles.todoLeft}
          onPress={handleRedditPress}
        >
          <Ionicons name="logo-reddit" size={24} color="#FF4500" />
          <View style={quittrStyles.todoTextContainer}>
            <Text style={quittrStyles.todoTitle}>Join Reddit Community</Text>
            <Text style={quittrStyles.todoSubtitle}>
              Connect with fellow PureResist members on Reddit for support and
              discussions
            </Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => handleToggleTodo("reddit")}
          style={[
            quittrStyles.todoCheckbox,
            todoStates.reddit && {
              backgroundColor: "#4CAF50",
              borderColor: "#4CAF50",
            },
          ]}
        >
          {todoStates.reddit && (
            <Ionicons name="checkmark" size={16} color="#FFF" />
          )}
        </TouchableOpacity>
      </View>
      <View style={quittrStyles.todoItem}>
        <TouchableOpacity
          style={quittrStyles.todoLeft}
          onPress={handleCommunityPress}
        >
          <Ionicons name="people" size={24} color="#2196F3" />
          <View style={quittrStyles.todoTextContainer}>
            <Text style={quittrStyles.todoTitle}>Interact with Community</Text>
            <Text style={quittrStyles.todoSubtitle}>
              Share your journey and connect with others in our in-app community
            </Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => handleToggleTodo("community")}
          style={[
            quittrStyles.todoCheckbox,
            todoStates.community && {
              backgroundColor: "#4CAF50",
              borderColor: "#4CAF50",
            },
          ]}
        >
          {todoStates.community && (
            <Ionicons name="checkmark" size={16} color="#FFF" />
          )}
        </TouchableOpacity>
      </View>
      <View style={quittrStyles.todoItem}>
        <TouchableOpacity
          style={quittrStyles.todoLeft}
          onPress={handleJournalPress}
        >
          <Ionicons name="journal" size={24} color="#9C27B0" />
          <View style={quittrStyles.todoTextContainer}>
            <Text style={quittrStyles.todoTitle}>Write in Journal</Text>
            <Text style={quittrStyles.todoSubtitle}>
              Document your progress and feelings in your personal recovery
              journal
            </Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => handleToggleTodo("journal")}
          style={[
            quittrStyles.todoCheckbox,
            todoStates.journal && {
              backgroundColor: "#4CAF50",
              borderColor: "#4CAF50",
            },
          ]}
        >
          {todoStates.journal && (
            <Ionicons name="checkmark" size={16} color="#FFF" />
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
});

export default TodoSection;

const quittrStyles = StyleSheet.create({
  featureCard: {
    backgroundColor: "#1E1F2E",
    borderRadius: 20,
    marginBottom: 16,
    marginHorizontal: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  featureCardContent: {
    padding: 20,
  },
  featureHeader: {
    flexDirection: "row" as const,
    alignItems: "center",
    marginBottom: 16,
  },
  featureIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.08)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  featureTitle: {
    color: "#FFF",
    fontSize: 18,
    fontWeight: "600",
    letterSpacing: 0.2,
  },
  featureSubtitle: {
    color: "rgba(255,255,255,0.6)",
    fontSize: 14,
    marginBottom: 16,
    lineHeight: 20,
  },
  gradientCard: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: "100%",
    opacity: 0.3,
  },
  newSessionButton: {
    flexDirection: "row" as const,
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.06)",
    padding: 14,
    borderRadius: 12,
    marginTop: 8,
  },
  newSessionText: {
    color: "#FFF",
    marginLeft: 10,
    fontSize: 15,
    fontWeight: "500",
  },
  blockButton: {
    flexDirection: "row" as const,
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "rgba(255,255,255,0.06)",
    padding: 14,
    borderRadius: 12,
    marginTop: 8,
  },
  blockButtonText: {
    color: "#FFF",
    fontSize: 15,
    fontWeight: "500",
  },
  quoteContainer: {
    flexDirection: "row" as const,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.06)",
    padding: 20,
    borderRadius: 12,
    marginTop: 8,
  },
  quoteText: {
    color: "#FFF",
    fontSize: 15,
    marginLeft: 10,
    fontWeight: "400",
    letterSpacing: 0.2,
    textAlign: "center",
  },
  todoSection: {
    marginVertical: 24,
    marginHorizontal: 16,
  },
  sectionHeader: {
    flexDirection: "row" as const,
    alignItems: "center",
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  sectionTitle: {
    marginLeft: 8,
    color: "rgba(255,255,255,0.9)",
    fontSize: 16,
    fontWeight: "600",
    letterSpacing: 0.5,
    textTransform: "uppercase" as const,
  },
  todoItem: {
    flexDirection: "row" as const,
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: COLORS.dark,
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  todoLeft: {
    flexDirection: "row" as const,
    alignItems: "center",
    flex: 1,
  },
  todoTextContainer: {
    marginLeft: 12,
    flex: 1,
  },
  todoTitle: {
    color: "#FFF",
    fontSize: 15,
    fontWeight: "500",
    marginBottom: 2,
  },
  todoSubtitle: {
    color: "rgba(255,255,255,0.5)",
    fontSize: 13,
    lineHeight: 18,
  },
  todoCheckbox: {
    width: 20,
    height: 20,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: "rgba(255,255,255,0.3)",
    marginLeft: 12,
  },
  menuItem: {
    flexDirection: "row" as const,
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: COLORS.dark,
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  menuItemLeft: {
    flexDirection: "row" as const,
    alignItems: "center",
    flex: 1,
  },
  menuTextContainer: {
    marginLeft: 12,
    flex: 1,
  },
  menuTitle: {
    color: "#FFF",
    fontSize: 15,
    fontWeight: "500",
    marginBottom: 2,
  },
  menuSubtitle: {
    color: "rgba(255,255,255,0.5)",
    fontSize: 13,
    lineHeight: 18,
  },
  panicButton: {
    flexDirection: "row" as const,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#D32F2F",
    padding: 16,
    borderRadius: 12,
    marginHorizontal: 16,
    marginVertical: 24,
    opacity: 0.9,
  },
  panicButtonText: {
    color: "#FFF",
    fontSize: 15,
    fontWeight: "600",
    marginLeft: 10,
    letterSpacing: 0.5,
  },
  scrollView: {
    flex: 1,
    backgroundColor: "#13141F",
  },
  container: {
    flex: 1,
    backgroundColor: "#13141F",
  },
  quoteSection: {
    marginVertical: 24,
    marginHorizontal: 16,
  },
  quoteCard: {
    backgroundColor: "rgba(255,255,255,0.06)",
    padding: 20,
    borderRadius: 12,
    marginTop: 0,
  },
  quoteTextItalic: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "500",
    fontStyle: "italic",
    textAlign: "center",
    lineHeight: 24,
  },
});
