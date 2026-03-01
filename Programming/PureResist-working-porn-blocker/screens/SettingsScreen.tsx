import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Switch,
  Alert,
  Platform,
  Linking,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useAuthStore, useSettingsStore } from "../hooks/useStore";
import { COLORS, SPACING, RADIUS } from "../utils/theme";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as api from "../services/api";
import Constants from "expo-constants";
import { captureEvent, POST_HOG_EVENTS } from "lib/posthog";
import Purchases from "react-native-purchases";

// Check if running in Expo Go
const isExpoGo = Constants.appOwnership === "expo";

const SettingsScreen = () => {
  const navigation = useNavigation();
  const { user, logout } = useAuthStore();
  const { pushNotifications, togglePushNotifications } = useSettingsStore();

  const handleLogout = async () => {
    try {
      await logout();
      navigation.reset({
        index: 0,
        routes: [{ name: "Login" }],
      });
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  const handleRestorePurchases = async () => {
    if (isExpoGo) {
      Alert.alert(
        "Restore Purchases",
        "This feature is not available in Expo Go. Please use the development build to restore purchases.",
      );
      return;
    }

    try {
      const customerInfo = await Purchases.getCustomerInfo();

      if (customerInfo.entitlements.active["pro"]) {
        Alert.alert("Success", "Your purchases have been restored!");
      } else {
        Alert.alert(
          "No Purchases Found",
          "No active subscriptions were found.",
        );
      }
    } catch (error) {
      console.error("Error restoring purchases:", error);
      Alert.alert(
        "Error",
        "Failed to restore purchases. Please try again later.",
      );
    }
  };

  const handleDeleteAccount = async () => {
    Alert.alert(
      "Delete Account",
      "Are you sure you want to delete your account? This action cannot be undone.",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              if (!user?._id) return;

              const response = await api.deleteUser(user._id);
              if (response.success) {
                await handleLogout();
                Alert.alert("Success", "Your account has been deleted.");
              } else {
                Alert.alert(
                  "Error",
                  "Failed to delete account. Please try again.",
                );
              }
            } catch (error) {
              console.error("Error deleting account:", error);
              Alert.alert(
                "Error",
                "An error occurred while deleting your account.",
              );
            }
          },
        },
      ],
    );
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Account</Text>
        <View style={styles.row}>
          <Text style={styles.label}>Email</Text>
          <Text style={styles.value}>{user?.email}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Username</Text>
          <Text style={styles.value}>{user?.username}</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Notifications</Text>
        <View style={styles.row}>
          <Text style={styles.label}>Push Notifications</Text>
          <Switch
            value={pushNotifications}
            onValueChange={togglePushNotifications}
            trackColor={{ false: "#767577", true: COLORS.accent }}
            thumbColor={pushNotifications ? "#fff" : "#f4f3f4"}
          />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Subscription</Text>
        <TouchableOpacity
          style={styles.button}
          onPress={handleRestorePurchases}
        >
          <Text style={styles.buttonText}>Restore Purchases</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Support</Text>
        <TouchableOpacity
          style={styles.button}
          onPress={() => {
            Linking.openURL("mailto:support@pureresist.com");
          }}
        >
          <Text style={styles.buttonText}>Contact Support</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Account Actions</Text>
        <TouchableOpacity
          style={[styles.button, styles.logoutButton]}
          onPress={handleLogout}
        >
          <Text style={[styles.buttonText, styles.logoutText]}>Log Out</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button, styles.deleteButton]}
          onPress={handleDeleteAccount}
        >
          <Text style={[styles.buttonText, styles.deleteText]}>
            Delete Account
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>App Info</Text>
        <View style={styles.row}>
          <Text style={styles.label}>Version</Text>
          <Text style={styles.value}>
            {Constants.expoConfig?.version || "1.0.0"}
          </Text>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  section: {
    padding: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.1)",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLORS.textPrimary,
    marginBottom: SPACING.md,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: SPACING.sm,
  },
  label: {
    fontSize: 16,
    color: COLORS.textSecondary,
  },
  value: {
    fontSize: 16,
    color: COLORS.textPrimary,
  },
  button: {
    backgroundColor: "rgba(255,255,255,0.1)",
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    marginVertical: SPACING.xs,
  },
  buttonText: {
    color: COLORS.textPrimary,
    fontSize: 16,
    textAlign: "center",
  },
  logoutButton: {
    backgroundColor: "rgba(255,59,48,0.1)",
  },
  logoutText: {
    color: "#FF3B30",
  },
  deleteButton: {
    backgroundColor: "rgba(255,59,48,0.1)",
    marginTop: SPACING.sm,
  },
  deleteText: {
    color: "#FF3B30",
  },
});

export default SettingsScreen;
