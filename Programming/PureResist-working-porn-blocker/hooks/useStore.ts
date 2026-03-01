import { create } from "zustand";
import { 
  AuthState, 
  StreakState, 
  User, 
  IUser,
  DailyCheckIn, 
  IRelapse,
  Achievement,
  ApiResponse,
  AchievementResponse,
  SettingsState,
  AchievementState
} from "../types";
import * as api from "../services/api";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as achievementService from "../services/achievementService";
import { updateUserLastRelapse, getUserLastRelapse } from "../services/api";
import { Platform } from 'react-native';
import Constants from "expo-constants";

// Check if running in Expo Go
const isExpoGo = Constants.appOwnership === "expo";

// Helper function to generate temporary IDs
const generateTemporaryId = () => {
  return Date.now().toString() + Math.random().toString(36).substring(2, 15);
};

// Achievement store with actions
interface AchievementStateWithActions extends AchievementState {
  loadAchievements: (userId: string) => Promise<void>;
  checkAndUpdateAchievements: (
    userId: string,
    streakDays?: number,
    journalCount?: number,
    lessonsRead?: number,
    streakStarted?: string | Date,
  ) => Promise<void>;
  unlockAchievement: (
    userId: string,
    achievementId: string,
  ) => Promise<boolean>;
  refreshAchievements: (userId: string) => Promise<void>;
  showAchievementModal: (achievement: Achievement) => void;
  hideAchievementModal: () => void;
  checkMissedAchievements: (userId: string) => Promise<void>;
}

// Auth store
interface AuthStateWithActions extends AuthState {
  login: (
    identifier: string,
    password: string,
  ) => Promise<"home" | "onboarding" | false>;
  register: (
    username: string,
    email: string,
    password: string,
  ) => Promise<"onboarding" | false>;
  logout: () => void;
  restoreAuth: (user: User) => void;
}

// Streak store
interface StreakStateWithActions extends StreakState {
  loadUserData: (userId: string) => Promise<void>;
  loadCheckIns: (userId: string) => Promise<void>;
  reportRelapse: (userId: string, timestamp: string) => Promise<boolean>;
  checkIn: (
    userId: string,
    succeeded: boolean,
    notes?: string,
    mood?: number,
  ) => Promise<boolean>;
  logRelapse: (
    userId: string,
    triggers: string[],
    mood: string,
    notes?: string,
  ) => Promise<boolean>;
}

// Settings store with actions
interface SettingsStateWithActions extends SettingsState {
  toggleHapticFeedback: () => Promise<void>;
  togglePushNotifications: (value?: boolean) => Promise<void>;
  loadSettings: () => Promise<void>;
}

// Achievement store
export const useAchievementStore = create<AchievementStateWithActions>((set, get) => ({
  achievements: [],
  loading: false,
  error: null,
  modalVisible: false,
  modalAchievement: null,

  showAchievementModal: (achievement: Achievement) => {

    set({ modalVisible: true, modalAchievement: achievement });
  },

  hideAchievementModal: () => {

    set({ modalVisible: false, modalAchievement: null });
  },

  loadAchievements: async (userId: string) => {
    set({ loading: true, error: null });
    try {

      // Use achievement service to get achievements from the MongoDB backend
      const response: AchievementResponse = await achievementService.getUserAchievements(userId);

      if (response.success && response.data) {

        // Successfully got achievements from the backend
        set({
          achievements: response.data,
          loading: false,
        });
      } else {

        // Fall back to legacy local storage method
        const storedAchievements = await AsyncStorage.getItem(
          `achievements_${userId}`,
        );

        if (storedAchievements) {
          const parsedAchievements = JSON.parse(storedAchievements);

          set({
            achievements: parsedAchievements,
            loading: false,
          });

          // Try to sync local achievements to backend
          try {
            for (const achievement of parsedAchievements) {
              if (achievement.unlocked) {
                await achievementService.unlockAchievement(
                  userId,
                  achievement._id || achievement.id,
                );
              }
            }
          } catch (syncError) {
            console.error(
              "Failed to sync local achievements to backend:",
              syncError,
            );
          }
        } else {

          // If no stored achievements, initialize with defaults
          await achievementService.initializeAchievements();

          // Try to get again after initialization
          const initResponse: AchievementResponse =
            await achievementService.getUserAchievements(userId);

          if (initResponse.success && initResponse.data) {

            set({
              achievements: initResponse.data,
              loading: false,
            });
          } else {
            console.error(
              "Failed to load achievements after initialization, using defaults",
            );

            // As a last resort, use hardcoded defaults
            set({
              achievements: defaultAchievements,
              loading: false,
              error:
                "Failed to get achievements from backend, using defaults",
            });
          }
        }
      }
    } catch (error) {
      console.error("Load achievements error:", error);
      set({ error: "Failed to load achievements", loading: false });
    }
  },

  refreshAchievements: async (userId: string) => {
    try {
      if (!userId) return;

      // Get streak data to pass to achievement update
      const streakStore = useStreakStore.getState();
      const currentStreak = streakStore.currentStreak || 0;
      const streakStarted = streakStore.streakStarted;

      // Update achievement progress in the backend
      const response: AchievementResponse = await achievementService.updateAchievementProgress(userId, {
        streakDays: currentStreak,
        streakStarted: streakStarted?.toISOString(),
      });

      // Show modal and send notification for newly unlocked achievements
      if (response.success && response.newlyUnlocked && response.newlyUnlocked.length > 0) {

        // Show modal for the first newly unlocked achievement
        const achievement = response.newlyUnlocked[0];

        set({ modalVisible: true, modalAchievement: achievement });
        
        // Send notification for each unlocked achievement
        for (const achievement of response.newlyUnlocked) {
          await sendAchievementNotification(achievement.title, achievement.description);
        }
      }

      // Reload achievements to get the updated state
      await get().loadAchievements(userId);
    } catch (error) {
      console.error("Refresh achievements error:", error);
      set({ error: "Failed to refresh achievements" });
    }
  },

  unlockAchievement: async (userId: string, achievementId: string) => {
    set({ loading: true });
    try {
      const response = await achievementService.unlockAchievement(
        userId,
        achievementId,
      );

      if (response.success) {
        // Reload achievements to get the updated state
        await get().loadAchievements(userId);
        return true;
      } else {
        set({
          error: response.message || "Failed to unlock achievement",
          loading: false,
        });
        return false;
      }
    } catch (error) {
      console.error("Unlock achievement error:", error);
      set({ error: "Failed to unlock achievement", loading: false });
      return false;
    }
  },

  checkAndUpdateAchievements: async (
    userId: string,
    streakDays?: number,
    journalCount?: number,
    lessonsRead?: number,
    streakStarted?: string | Date,
  ) => {
    try {
      if (!userId) return;

      // Update achievement progress in the backend
      const response: AchievementResponse = await achievementService.updateAchievementProgress(userId, {
        streakDays,
        journalCount,
        lessonsRead,
        streakStarted,
      });

      // Show modal and send notification for newly unlocked achievements
      if (response.success && response.newlyUnlocked && response.newlyUnlocked.length > 0) {

        // Show modal for the first newly unlocked achievement
        const achievement = response.newlyUnlocked[0];

        set({ modalVisible: true, modalAchievement: achievement });
        
        // Send notification for each unlocked achievement
        for (const achievement of response.newlyUnlocked) {
          await sendAchievementNotification(achievement.title, achievement.description);
        }
      } else {

      }

      // Reload achievements to get the updated state
      await get().loadAchievements(userId);
    } catch (error) {
      console.error("Check and update achievements error:", error);
      set({ error: "Failed to update achievements" });
    }
  },

  checkMissedAchievements: async (userId: string) => {
    try {

      const { user } = useAuthStore.getState();
      if (!user) return;

      // Get current streak and other stats
      const streakDays = user.currentStreak || 0;
      
      // Get all achievements to check which ones should be unlocked
      const response = await achievementService.getUserAchievements(userId);
      if (response.success && response.data) {
        const achievements = response.data;
        
        // Find streak achievements that should be unlocked but aren't
        const missedStreakAchievements = achievements.filter(a => 
          a.category === 'streak' && 
          !a.unlocked && 
          typeof a.requirement === 'number' && 
          streakDays >= a.requirement
        );

        if (missedStreakAchievements.length > 0) {

          // Update achievements with current streak to unlock missed ones
          await get().checkAndUpdateAchievements(userId, streakDays);
        }
      }
    } catch (error) {
      console.error("Error checking missed achievements:", error);
    }
  },
}));

// Function to send achievement notification
const sendAchievementNotification = async (title: string, description: string) => {
  // This function is no longer directly tied to RevenueCat,
  // so it will rely on Expo Notifications for now.
  // If RevenueCat is re-introduced, this will need to be updated.
  // For now, it's a placeholder.

  // Example:
  // await Notifications.scheduleNotificationAsync({
  //   content: {
  //     title: "🏆 Achievement Unlocked!",
  //     body: `${title} - ${description}`,
  //     sound: true,
  //     ...(Platform.OS === "android" && { channelId: "default" }),
  //   },
  //   trigger: null,
  // });
};

// Auth store
export const useAuthStore = create<AuthStateWithActions>((set) => ({
  isAuthenticated: false,
  user: null,
  loading: false,
  error: null,

  login: async (identifier: string, password: string) => {
    set({ loading: true, error: null });
    try {
      // Check if identifier is an email (contains @) or username
      const isEmail = identifier.includes("@");
      const loginParams = isEmail
        ? { email: identifier, password }
        : { username: identifier, password };

      const response = await api.loginUser(loginParams);

      if (response.success && "data" in response && response.data) {
        const dbUser = response.data;

        // Double-check subscription status with a fresh query
        try {
          const profileResponse = await api.getUserProfile(dbUser._id);
          if (
            profileResponse.success &&
            "data" in profileResponse &&
            profileResponse.data
          ) {
            // Override with the most recent subscription status
            dbUser.isSubscribed = profileResponse.data.isSubscribed ?? false;
          }
        } catch (profileError) {
          console.error(
            "Error fetching fresh subscription status:",
            profileError,
          );
          // Continue with the initial data if unable to get fresh data
        }

        const user: User = {
          _id: dbUser._id?.toString() || generateTemporaryId(),
          email: dbUser.email,
          username: dbUser.username || "",
          password: "", // Don't store actual password in state
          currentStreak: dbUser.currentStreak,
          longestStreak: dbUser.longestStreak,
          startDate: dbUser.startDate,
          createdAt: dbUser.createdAt,
          updatedAt: dbUser.updatedAt,
          isSubscribed: dbUser.isSubscribed ?? false,
          subscriptionStartDate: dbUser.subscriptionStartDate ?? null,
          subscriptionEndDate: dbUser.subscriptionEndDate ?? null,
        };

        // Purchases.logIn(user._id); // Removed RevenueCat logIn

        // Save authentication state to AsyncStorage
        await AsyncStorage.setItem("auth_user", JSON.stringify(user));
        await AsyncStorage.setItem("auth_state", "true");

        set({ isAuthenticated: true, user, loading: false });

        // Check for missed achievements after successful login
        await useAchievementStore.getState().checkMissedAchievements(user._id);

        // Return subscription status for navigation
        return user.isSubscribed ? "home" : "onboarding";
      } else {
        // Handle specific error cases
        const errorMessage = response.message?.toLowerCase() || "";
        if (errorMessage.includes("not found")) {
          set({
            error: "User not found. Please register first.",
            loading: false,
          });
        } else {
          set({ error: response.message || "Login failed", loading: false });
        }
        return false;
      }
    } catch (error: any) {
      // Handle network or other errors
      const errorMessage =
        error?.response?.data?.message?.toLowerCase() ||
        error?.message?.toLowerCase() ||
        "";

      if (
        errorMessage.includes("not found") ||
        errorMessage.includes("user not found")
      ) {
        set({
          error: "User not found. Please register first.",
          loading: false,
        });
      } else if (
        errorMessage.includes("invalid") ||
        errorMessage.includes("failed")
      ) {
        set({
          error:
            "Invalid credentials. Please check your email/username and password.",
          loading: false,
        });
      } else {
        set({
          error: "Unable to connect to the server. Please try again.",
          loading: false,
        });
      }
      return false;
    }
  },

  register: async (username: string, email: string, password: string) => {
    set({ loading: true, error: null });
    try {
      const response = await api.registerUser({ username, email, password });

      if (response.success && "data" in response && response.data) {
        const dbUser = response.data;
        const user: User = {
          _id: dbUser._id?.toString() || generateTemporaryId(),
          email: dbUser.email,
          username: dbUser.username || "",
          password: "", // Don't store actual password in state
          currentStreak: dbUser.currentStreak,
          longestStreak: dbUser.longestStreak,
          startDate: dbUser.startDate,
          createdAt: dbUser.createdAt,
          updatedAt: dbUser.updatedAt,
          isSubscribed: dbUser.isSubscribed ?? false,
          subscriptionStartDate: dbUser.subscriptionStartDate ?? null,
          subscriptionEndDate: dbUser.subscriptionEndDate ?? null,
        };

        // Purchases.logIn(user._id); // Removed RevenueCat logIn

        // Save authentication state to AsyncStorage
        await AsyncStorage.setItem("auth_user", JSON.stringify(user));
        await AsyncStorage.setItem("auth_state", "true");

        set({ isAuthenticated: true, user, loading: false });

        // Return 'onboarding' as newly registered users always have isSubscribed: false
        return "onboarding";
      } else {
        set({
          error: response.message || "Registration failed",
          loading: false,
        });
        return false;
      }
    } catch (error) {
      set({ error: "Registration failed", loading: false });
      return false;
    }
  },

  logout: async () => {
    // Cancel all notifications when logging out
    // await Notifications.cancelAllScheduledNotificationsAsync(); // Removed RevenueCat notification cancel

    // await Purchases.logOut(); // Removed RevenueCat logOut

    // Clear authentication state from AsyncStorage
    AsyncStorage.removeItem("auth_user");
    AsyncStorage.removeItem("auth_state");

    // Reset auth state
    set({ isAuthenticated: false, user: null });
  },

  restoreAuth: (user: User) => {
    set({ isAuthenticated: true, user, loading: false });
  },
}));

// Helper function for streak calculation
const calculateStreak = (startDate: string | Date | null, lastRelapse: string | Date | null): number => {
  if (!startDate) return 0;

  const start = new Date(startDate);
  const now = new Date();
  
  // If there's a relapse after the start date, use that instead
  if (lastRelapse) {
    const relapseDate = new Date(lastRelapse);
    if (relapseDate > start) {
      start.setTime(relapseDate.getTime());
    }
  }

  // Set both dates to start of day in user's timezone
  start.setHours(0, 0, 0, 0);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Calculate days between dates
  const diffTime = Math.abs(today.getTime() - start.getTime());
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  return diffDays;
};

// Streak store
export const useStreakStore = create<StreakStateWithActions>((set, get) => ({
  currentStreak: 0,
  longestStreak: 0,
  lastCheckIn: null,
  lastRelapse: null,
  streakStarted: null,
  checkIns: [],
  relapses: [],
  loading: false,
  error: null,

  loadCheckIns: async (userId: string) => {
    set({ loading: true });
    try {
      const response = await api.getUserCheckIns(userId);
      if (response.success && response.data) {
        set({ checkIns: response.data, loading: false });
      } else {
        set({
          error: response.message || "Failed to load check-ins",
          loading: false,
        });
      }
    } catch (error: any) {
      set({
        error: error.message || "Failed to load check-ins",
        loading: false,
      });
    }
  },

  loadUserData: async (userId: string) => {
    set({ loading: true, error: null });
    try {
      // Get user profile from API
      const userResponse: ApiResponse<any> = await api.getUserProfile(userId);

      if (userResponse.success && userResponse.data) {
        const userData = userResponse.data;

        // Get user relapses from API
        const relapsesResponse: ApiResponse<any[]> = await api.getUserRelapses(userId);
        let relapses = relapsesResponse.success && relapsesResponse.data ? relapsesResponse.data : [];

        // Get the streak started date from the API
        const streakStartedResponse: ApiResponse<string> = await api.getUserStreakStarted(userId);
        const streakStarted = streakStartedResponse.success && streakStartedResponse.data
          ? new Date(streakStartedResponse.data)
          : null;

        // Get the last relapse date
        const lastRelapseResponse: ApiResponse<string | null> = await getUserLastRelapse(userId);
        const lastRelapse = lastRelapseResponse.success && lastRelapseResponse.data
          ? lastRelapseResponse.data
          : null;

        // Calculate current streak using the helper function
        const currentStreak = calculateStreak(streakStarted, lastRelapse);

        // Update state with the calculated values
        set({
          currentStreak,
          longestStreak: Math.max(userData.longestStreak || 0, currentStreak),
          lastRelapse,
          lastCheckIn: userData.lastCheckIn || null,
          streakStarted,
          relapses,
          loading: false,
          error: null,
        });

        // Save to local storage as backup
        try {
          const streakData = {
            currentStreak,
            longestStreak: Math.max(userData.longestStreak || 0, currentStreak),
            lastCheckIn: userData.lastCheckIn,
            relapses,
            streakStarted,
          };
          await AsyncStorage.setItem(`streak_data_${userId}`, JSON.stringify(streakData));
        } catch (storageError) {
          console.error("Error saving streak data to local storage:", storageError);
        }
      } else {
        set({
          error: "Failed to load user data",
          loading: false,
        });
      }
    } catch (error) {
      console.error("Error loading user data:", error);
      set({
        error: "Failed to load user data",
        loading: false,
      });

      // Try to load from local storage as fallback
      try {
        const streakDataString = await AsyncStorage.getItem(`streak_data_${userId}`);
        if (streakDataString) {
          const streakData = JSON.parse(streakDataString);
          const currentStreak = calculateStreak(streakData.streakStarted, streakData.lastRelapse);

          set({
            currentStreak,
            longestStreak: Math.max(streakData.longestStreak || 0, currentStreak),
            lastRelapse: streakData.lastRelapse,
            lastCheckIn: streakData.lastCheckIn,
            streakStarted: streakData.streakStarted,
            relapses: streakData.relapses || [],
            loading: false,
            error: null,
          });
        }
      } catch (storageError) {
        console.error("Error loading from local storage:", storageError);
      }
    }
  },

  // Report relapse function
  reportRelapse: async (userId: string, timestamp: string) => {
    set({ loading: true, error: null });
    try {
      // Create a new relapse record
      const relapseData = {
        userId,
        timestamp,
        notes: "", // Optional notes could be added in a more detailed implementation
      };

      // Save to API
      const response = await api.reportRelapse(relapseData);

      if (response.success) {
        // Get current relapses and add the new one
        const currentRelapses = [...get().relapses];
        const newRelapse = {
          ...relapseData,
          _id: response.data?._id || generateTemporaryId(),
          date: timestamp, // Add date field for WeeklyCheckinView compatibility
        };
        currentRelapses.push(newRelapse);

        // Calculate the new current streak (should be 0 since user just relapsed)
        const currentStreak = 0;

        // Get the longest streak
        const longestStreak = get().longestStreak;

        // Update streak started date to the time of relapse
        await api.updateUserStreakStarted(userId, timestamp);

        // Update last relapse date
        await api.updateUserLastRelapse(userId, timestamp);

        // Set new state
        set({
          lastRelapse: timestamp,
          relapses: currentRelapses,
          currentStreak,
          loading: false,
        });

        // Save updated data locally
        try {
          const streakData = {
            currentStreak,
            longestStreak,
            lastRelapse: timestamp,
            relapses: currentRelapses,
            streakStarted: timestamp, // Add streakStarted to local storage data
          };
          await AsyncStorage.setItem(
            `streak_data_${userId}`,
            JSON.stringify(streakData),
          );
        } catch (storageError) {
          console.error(
            "Error saving streak data to local storage:",
            storageError,
          );
        }

        return true;
      } else {
        // API call failed
        set({
          error: response.message || "Failed to report relapse",
          loading: false,
        });
        return false;
      }
    } catch (error) {
      console.error("Error reporting relapse:", error);

      // Try to update local storage anyway
      try {
        // Get current state
        const currentRelapses = [...get().relapses];
        const longestStreak = get().longestStreak;

        // Add new relapse to local data
        currentRelapses.push({
          userId,
          timestamp,
          _id: generateTemporaryId(),
          date: timestamp, // Add date field for WeeklyCheckinView compatibility
        });

        // Try to update streak started and last relapse dates directly
        try {
          await api.updateUserStreakStarted(userId, timestamp);
          await api.updateUserLastRelapse(userId, timestamp);
        } catch (apiError) {
          console.error(
            "Failed to update user dates in API, continuing with local storage:",
            apiError,
          );
        }

        // Set new state
        set({
          lastRelapse: timestamp,
          relapses: currentRelapses,
          currentStreak: 0, // Reset streak to 0
          loading: false,
          error: "Failed to report relapse to server, but saved locally",
        });

        // Save updated data locally
        const streakData = {
          currentStreak: 0,
          longestStreak,
          lastRelapse: timestamp,
          relapses: currentRelapses,
          streakStarted: timestamp, // Add streakStarted to local storage data
        };
        await AsyncStorage.setItem(
          `streak_data_${userId}`,
          JSON.stringify(streakData),
        );

        return true;
      } catch (storageError) {
        console.error("Error saving relapse to local storage:", storageError);
        set({
          error: "Failed to report relapse",
          loading: false,
        });
        return false;
      }
    }
  },

  checkIn: async (
    userId: string,
    succeeded: boolean,
    notes?: string,
    mood?: number,
  ) => {
    set({ loading: true, error: null });

    const moodMapping: { [key: number]: string } = {
      1: "terrible",
      2: "bad",
      3: "neutral",
      4: "good",
      5: "great",
    };

    try {
      // Get current streak for day number calculation
      const currentStreak = get().currentStreak;
      const dayNumber = currentStreak + 1;

      // Create check-in data
      const checkInData = {
        userId,
        mood: mood ? moodMapping[mood] : "neutral",
        urgeLevel: 1, // Default urge level for successful check-in
        succeeded,
        notes: notes || "",
        triggers: [],
        activities: [],
        dayNumber,
      };

      // Send check-in to API
      const response = await api.createCheckIn(checkInData);

      if (response.success) {
        // Update local state using backend data
        const newStreak = succeeded ? currentStreak + 1 : 0;
        const now = new Date();

        // Get the updated user data from the backend response
        let updatedLongestStreak = get().longestStreak;
        if (response.userLongestStreak !== undefined) {
          // Use the longestStreak from the backend
          updatedLongestStreak = response.userLongestStreak;
        } else if (response.userStreak !== undefined) {
          // Fallback: If the backend provides the updated streak, use it
          updatedLongestStreak = Math.max(
            get().longestStreak,
            response.userStreak,
          );
        } else {
          // Fallback to local calculation
          updatedLongestStreak = Math.max(get().longestStreak, newStreak);
        }

        set({
          currentStreak: newStreak,
          longestStreak: updatedLongestStreak,
          lastCheckIn: now,
          loading: false,
        });

        // Save updated data locally
        try {
          const streakData = {
            currentStreak: newStreak,
            longestStreak: updatedLongestStreak,
            lastCheckIn: now.toISOString(),
            relapses: get().relapses,
            streakStarted: get().streakStarted,
          };
          await AsyncStorage.setItem(
            `streak_data_${userId}`,
            JSON.stringify(streakData),
          );
        } catch (storageError) {
          console.error(
            "Error saving streak data to local storage:",
            storageError,
          );
        }

        return true;
      } else {
        set({
          error: response.message || "Failed to check in",
          loading: false,
        });
        return false;
      }
    } catch (error) {
      console.error("Error checking in:", error);
      set({ error: "Failed to check in", loading: false });
      return false;
    }
  },

  logRelapse: async (
    userId: string,
    triggers: string[],
    mood: string,
    notes?: string,
  ) => {
    set({ loading: true, error: null });
    try {
      // Create relapse data
      const relapseData = {
        userId,
        timestamp: new Date().toISOString(),
        notes: notes || "",
      };

      // Save to API
      const response = await api.reportRelapse(relapseData);

      if (response.success) {
        // Get current relapses and add the new one
        const currentRelapses = [...get().relapses];
        currentRelapses.push({
          _id: response.data?._id || generateTemporaryId(),
          user: userId,
          date: new Date(),
          streakLength: get().currentStreak,
          triggers,
          mood,
          notes: notes || "",
          createdAt: new Date(),
          updatedAt: new Date(),
        });

        // Reset streak to 0
        const currentStreak = 0;
        const longestStreak = get().longestStreak;

        // Update streak started date to the time of relapse
        await api.updateUserStreakStarted(userId, new Date().toISOString());

        // Update last relapse date
        await api.updateUserLastRelapse(userId, new Date().toISOString());

        // Set new state
        set({
          lastRelapse: new Date().toISOString(),
          relapses: currentRelapses,
          currentStreak,
          loading: false,
        });

        // Save updated data locally
        try {
          const streakData = {
            currentStreak,
            longestStreak,
            lastRelapse: new Date().toISOString(),
            relapses: currentRelapses,
            streakStarted: new Date().toISOString(),
          };
          await AsyncStorage.setItem(
            `streak_data_${userId}`,
            JSON.stringify(streakData),
          );
        } catch (storageError) {
          console.error(
            "Error saving streak data to local storage:",
            storageError,
          );
        }

        return true;
      } else {
        set({
          error: response.message || "Failed to log relapse",
          loading: false,
        });
        return false;
      }
    } catch (error) {
      console.error("Error logging relapse:", error);
      set({ error: "Failed to log relapse", loading: false });
      return false;
    }
  },
}));

// Settings store
export const useSettingsStore = create<SettingsStateWithActions>(
  (set, get) => ({
    hapticFeedback: true,
    pushNotifications: false,
    loading: false,
    error: null,

    loadSettings: async () => {
      set({ loading: true, error: null });
      try {
        // Get settings from MongoDB through API
        const user = useAuthStore.getState().user;
        if (!user) {
          throw new Error("User not authenticated");
        }

        const response = await api.getUserSettings(user._id);

        if (response.success && response.data) {
          const settings = response.data;
          set({
            hapticFeedback: settings.hapticFeedback ?? true,
            pushNotifications: settings.pushNotifications ?? false,
            loading: false,
          });
        } else {
          // Default settings if none found
          set({
            hapticFeedback: true,
            pushNotifications: false,
            loading: false,
          });
          // Create default settings in the database
          await api.updateUserSettings(user._id, {
            hapticFeedback: true,
            pushNotifications: false,
          });
        }
      } catch (error) {
        console.error("Failed to load settings:", error);
        set({ error: "Failed to load settings", loading: false });
      }
    },

    toggleHapticFeedback: async () => {
      const currentValue = get().hapticFeedback;
      const newValue = !currentValue;

      set({ hapticFeedback: newValue, loading: true });

      try {
        const user = useAuthStore.getState().user;
        if (!user) {
          throw new Error("User not authenticated");
        }

        // Update settings in MongoDB through API
        const response = await api.updateUserSettings(user._id, {
          hapticFeedback: newValue,
          pushNotifications: get().pushNotifications,
        });

        if (!response.success) {
          throw new Error("Failed to save haptic feedback setting");
        }

        set({ loading: false });
      } catch (error) {
        console.error("Failed to save haptic feedback setting:", error);
        set({
          hapticFeedback: currentValue,
          error: "Failed to save setting",
          loading: false,
        });
      }
    },

    togglePushNotifications: async (value?: boolean) => {
      const currentValue = get().pushNotifications;
      // Use the provided value or toggle if not provided
      const newValue = value !== undefined ? value : !currentValue;

      set({ pushNotifications: newValue, loading: true });

      try {
        const user = useAuthStore.getState().user;
        if (!user) {
          throw new Error("User not authenticated");
        }

        // Update settings in MongoDB through API
        const response = await api.updateUserSettings(user._id, {
          hapticFeedback: get().hapticFeedback,
          pushNotifications: newValue,
        });

        if (!response.success) {
          throw new Error("Failed to save push notifications setting");
        }

        // Update the local storage setting too
        await AsyncStorage.setItem(
          "push_notifications_enabled",
          newValue ? "true" : "false",
        );

        set({ loading: false });
      } catch (error) {
        console.error("Failed to save push notifications setting:", error);
        set({
          pushNotifications: currentValue,
          error: "Failed to save setting",
          loading: false,
        });
      }
    },
  }),
);

// Default achievements for fallback
const defaultAchievements: Achievement[] = [
  {
    id: "1",
    title: "First Day",
    description: "Begin your journey",
    requirement: 1,
    category: "streak",
    unlocked: false,
  },
  // Add more default achievements here
  // ...
];
