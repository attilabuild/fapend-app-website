import React, { useState } from "react";
import { Alert, View } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  useAuthStore,
  useStreakStore,
  useAchievementStore,
} from "../hooks/useStore";
import { Button } from "../components/ui/Button";

// Import types from a local types file to avoid ESM/CommonJS conflicts
type NativeStackNavigationProp<T> = {
  reset: (options: { index: number; routes: { name: string }[] }) => void;
};

type RootStackParamList = {
  Main: undefined;
};

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList>;
};

const CheckInScreen: React.FC<Props> = ({ navigation }) => {
  const [isSaving, setIsSaving] = useState(false);
  const [wasClean, setWasClean] = useState<boolean | null>(null);
  const [isRelapse, setIsRelapse] = useState(false);
  const [notes, setNotes] = useState("");
  const { user } = useAuthStore();
  const { checkIn, logRelapse } = useStreakStore();
  const { refreshAchievements } = useAchievementStore();

  const handleCheckIn = async () => {
    if (wasClean === null && !isRelapse) {
      Alert.alert(
        "No selection made",
        "Please select whether you stayed clean or relapsed.",
      );
      return;
    }

    // If it's a relapse (either from direct relapse reporting or selecting "No" in check-in)
    if (isRelapse || wasClean === false) {
      Alert.alert(
        "Are you sure?",
        "Logging a relapse will reset your current streak. This action cannot be undone.",
        [
          {
            text: "Cancel",
            style: "cancel",
          },
          {
            text: "Yes, Log Relapse",
            style: "destructive",
            onPress: async () => {
              if (isSaving) return; // Prevent double submission
              setIsSaving(true);

              try {
                if (!user) {
                  throw new Error("User not authenticated");
                }

                // Create a lock in AsyncStorage to prevent concurrent submissions
                const lockKey = `check_in_lock_${user._id}`;
                const existingLock = await AsyncStorage.getItem(lockKey);
                if (existingLock) {
                  throw new Error("Another check-in is in progress");
                }
                await AsyncStorage.setItem(lockKey, new Date().toISOString());

                try {
                  // First, log the relapse
                  const result = await logRelapse(
                    user._id,
                    [],
                    "neutral",
                    notes,
                  );

                  if (!result) {
                    throw new Error("Failed to submit relapse report");
                  }

                  // Then update achievements
                  await refreshAchievements(user._id);

                  // Finally reload user data and check-ins
                  const { loadCheckIns, loadUserData } =
                    useStreakStore.getState();
                  await Promise.all([
                    loadUserData(user._id),
                    loadCheckIns(user._id),
                  ]);

                  // Navigate back to main screen
                  navigation.reset({
                    index: 0,
                    routes: [{ name: "Main" }],
                  });
                } finally {
                  // Always remove the lock when done
                  await AsyncStorage.removeItem(lockKey);
                }
              } catch (error: unknown) {
                console.error("Error during check-in:", error);
                Alert.alert(
                  "Error",
                  error instanceof Error &&
                    error.message === "Another check-in is in progress"
                    ? "Please wait, another check-in is being processed"
                    : "Failed to submit your relapse report. Please try again.",
                );
              } finally {
                setIsSaving(false);
              }
            },
          },
        ],
      );
    } else {
      // Handle successful check-in
      if (isSaving) return; // Prevent double submission
      setIsSaving(true);

      try {
        if (!user) {
          throw new Error("User not authenticated");
        }

        // Create a lock in AsyncStorage to prevent concurrent submissions
        const lockKey = `check_in_lock_${user._id}`;
        const existingLock = await AsyncStorage.getItem(lockKey);
        if (existingLock) {
          throw new Error("Another check-in is in progress");
        }
        await AsyncStorage.setItem(lockKey, new Date().toISOString());

        try {
          // Submit the check-in
          const result = await checkIn(user._id, true);

          if (!result) {
            throw new Error("Failed to submit check-in");
          }

          // Update achievements
          await refreshAchievements(user._id);

          // Reload user data and check-ins
          const { loadCheckIns, loadUserData } = useStreakStore.getState();
          await Promise.all([loadUserData(user._id), loadCheckIns(user._id)]);

          // Navigate back to main screen
          navigation.reset({
            index: 0,
            routes: [{ name: "Main" }],
          });
        } finally {
          // Always remove the lock when done
          await AsyncStorage.removeItem(lockKey);
        }
      } catch (error: unknown) {
        console.error("Error during check-in:", error);
        Alert.alert(
          "Error",
          error instanceof Error &&
            error.message === "Another check-in is in progress"
            ? "Please wait, another check-in is being processed"
            : "Failed to submit your check-in. Please try again.",
        );
      } finally {
        setIsSaving(false);
      }
    }
  };

  return (
    <View>
      <Button title="Go back" onPress={() => navigation.goBack()} />
    </View>
  );
};

export default CheckInScreen;
