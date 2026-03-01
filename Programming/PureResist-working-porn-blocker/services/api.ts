// kindly just replace the api.ts with
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { IUser } from "../types";
import { Platform } from "react-native";
import { AxiosError, AxiosResponse, InternalAxiosRequestConfig } from "axios";

// API configuration - DYNAMIC APPROACH FOR ALL SCENARIOS
export let API_URL = "https://pureresist.onrender.com/api";

// Log environment information for debugging
const isProduction = !__DEV__;
const isTestFlight = Platform.OS === "ios" && isProduction;

// Configure axios instance
export const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
    "User-Agent": `PureResist-App/${Platform.OS}/${isProduction ? "prod" : "dev"}`,
  },
  timeout: 15000, // Reduced from 30s to 15s for better user experience
  timeoutErrorMessage: "Request timed out - server may be unavailable",
});

// Configure authentication-specific API instance with shorter timeout
export const authApi = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
    "User-Agent": `PureResist-App/${Platform.OS}/${isProduction ? "prod" : "dev"}`,
  },
  timeout: 30000, // Increased timeout for auth requests (30s)
  timeoutErrorMessage: "Authentication request timed out",
});

// Add request interceptor for debugging network issues
const requestInterceptor = (config: InternalAxiosRequestConfig) => {

  return config;
};

const requestErrorInterceptor = (error: AxiosError) => {
  console.error("Request error:", error);
  return Promise.reject(error);
};

// Add response interceptor for debugging responses
const responseInterceptor = (response: AxiosResponse) => {
  
  return response;
};

const responseErrorInterceptor = (error: AxiosError) => {
  console.error(`API Error response: ${error.message}`);
  if (error.code === "ECONNABORTED") {
    console.error("Connection timeout - check if server is running");
  } else if (error.code === "ERR_NETWORK") {
    console.error("Network error - check your API URL and connection");
  }
  return Promise.reject(error);
};

// Apply interceptors to both API instances
api.interceptors.request.use(requestInterceptor, requestErrorInterceptor);
api.interceptors.response.use(responseInterceptor, responseErrorInterceptor);

authApi.interceptors.request.use(requestInterceptor, requestErrorInterceptor);
authApi.interceptors.response.use(
  responseInterceptor,
  responseErrorInterceptor,
);

// Types
interface LoginCredentials {
  username?: string;
  email?: string;
  password: string;
}

interface RegisterCredentials {
  username: string;
  email: string;
  password: string;
}

interface CheckInData {
  userId: string;
  mood: string;
  urgeLevel: number;
  succeeded: boolean;
  notes: string;
  triggers?: string[];
  activities?: string[];
  dayNumber: number;
}

interface SettingsData {
  notifications?: {
    enabled?: boolean;
    time?: string;
  };
  theme?: string;
  goalDays?: number;
}

interface LoginResponse {
  success: boolean;
  data?: any;
  message?: string;
  error?: string;
}

// Helper for storing the current user in AsyncStorage
const storeUser = async (user: IUser) => {
  try {
    await AsyncStorage.setItem("current_user", JSON.stringify(user));
  } catch (error) {
    console.error("Error storing user:", error);
  }
};

// Error handling helper
export const handleApiError = (error: any) => {
  console.error("API Error:", error.response?.data || error.message || error);

  // Different error handling based on error type
  if (error.code === "ECONNABORTED") {
    return {
      success: false,
      message: "Connection timeout - server may be unavailable",
      error: "Request timed out",
    };
  }

  if (!error.response) {
    return {
      success: false,
      message: "Network error - please check your connection",
      error: error.message || "Network error",
    };
  }

  return {
    success: false,
    message: error.response?.data?.message || "An error occurred",
    error: error.response?.data?.error || error.message,
  };
};

// Auth functions
export const loginUser = async (
  credentials: LoginCredentials,
  retryCount = 0,
): Promise<LoginResponse> => {
  try {
    const loginIdentifier = credentials.email
      ? `email ${credentials.email}`
      : `username ${credentials.username}`;

    // Use the auth-specific API instance with shorter timeout
    const response = await authApi.post("/users/login", credentials);

    if (response.data && response.data.success) {
      // Store the user data locally
      await storeUser(response.data.data);

      return {
        success: true,
        data: response.data.data,
        message: response.data.message,
      };
    }

    console.warn("Login response without success flag", response.data);
    return {
      success: false,
      message: response.data.message || "Invalid credentials",
    };
  } catch (error: any) {
    console.error(
      "Login error details:",
      JSON.stringify({
        message: error.message,
        code: error.code,
        status: error.response?.status,
        statusText: error.response?.statusText,
        responseData: error.response?.data,
      }),
    );

    // Special handling for timeout issues with retry logic
    if (error.code === "ECONNABORTED") {
      if (retryCount < 2) {
        // Try up to 3 times total

        // Wait for 2 seconds before retrying
        await new Promise((resolve) => setTimeout(resolve, 2000));
        return loginUser(credentials, retryCount + 1);
      }
      return {
        success: false,
        message:
          "Connection timed out after multiple attempts. Please check your internet connection and try again.",
        error: "Request timed out",
      };
    }

    // Handle network errors
    if (!error.response) {
      return {
        success: false,
        message:
          "Network error. Please check your internet connection and try again.",
        error: "Network error",
      };
    }

    return handleApiError(error);
  }
};

export const registerUser = async (userData: RegisterCredentials) => {
  try {

    const response = await api.post("/users/register", userData);

    if (response.data && response.data.success) {
      // Store the user data locally
      await storeUser(response.data.data);

      return {
        success: true,
        data: response.data.data,
        message: response.data.message,
      };
    }

    return {
      success: false,
      message: response.data.message || "Registration failed",
    };
  } catch (error) {
    return handleApiError(error);
  }
};

// User data functions
export const getUserProfile = async (userId: string) => {
  try {

    const response = await api.get(`/users/${userId}`);

    return {
      success: true,
      data: response.data.data,
    };
  } catch (error) {
    return handleApiError(error);
  }
};

// Update user subscription status
export const updateUserSubscription = async (
  userId: string,
  subscriptionData: {
    isSubscribed: boolean;
    subscriptionStartDate: Date | null;
    subscriptionEndDate: Date | null;
  },
) => {
  try {

    // Use the dedicated subscription endpoint
    const response = await api.put(
      `/users/${userId}/subscription`,
      subscriptionData,
    );

    return {
      success: true,
      data: response.data.data,
      message: response.data.message || "Subscription updated successfully",
    };
  } catch (error) {
    // If the API fails, still return success so the app continues working
    // We'll sync with the server later
    console.error(
      "Error updating subscription in API, continuing with local update:",
      error,
    );
    return {
      success: true,
      data: subscriptionData,
      message: "Subscription updated locally. Will sync with server later.",
      syncPending: true,
    };
  }
};

// Get user relapses
export const getUserRelapses = async (userId: string) => {
  try {
    console.log(`Getting relapses for user ${userId}...`);

    // For now, return empty array since backend endpoint might not be ready
    // This prevents the 404/timeout errors while maintaining functionality
    return {
      success: true,
      data: [], // Empty array as placeholder until backend is updated
      message: "Using local data - backend endpoint pending deployment",
    };

    // TODO: Uncomment when backend is updated on Render
    // const response = await api.get(`/users/${userId}/relapses`);
    // if (response.data && response.data.success) {
    //   return {
    //     success: true,
    //     data: response.data.data,
    //     message: response.data.message,
    //   };
    // }
  } catch (error) {
    console.error("Error getting user relapses:", error);
    
    // Return empty array for any error to prevent app crashes
    return {
      success: true,
      data: [],
      message: "Using offline mode",
    };
  }
};

// Report a relapse
export const reportRelapse = async (relapseData: {
  userId: string;
  timestamp: string;
  notes?: string;
}) => {
  try {

    // For now, simulate successful API response since endpoint might not be ready
    // When backend is ready, uncomment the API call below
    // const response = await api.post('/relapses', relapseData);

    // Update the user's streak started date
    await updateUserStreakStarted(relapseData.userId, relapseData.timestamp);

    // Update the user's last relapse date
    await updateUserLastRelapse(relapseData.userId, relapseData.timestamp);

    return {
      success: true,
      data: {
        _id: Date.now().toString(), // Generate temporary ID
        ...relapseData,
        createdAt: new Date().toISOString(),
      },
      message: "Relapse recorded successfully",
    };
  } catch (error) {
    return handleApiError(error);
  }
};

// Get user's streak started date
export const getUserStreakStarted = async (userId: string) => {
  try {

    // Make API call to get streak started date from the database
    const response = await api.get(`/users/${userId}/streak-started`);

    // If the API request succeeds, return the response
    if (response.data && response.data.success) {
      return {
        success: true,
        data: response.data.data,
        message: response.data.message,
      };
    }

    // As a fallback, try to get from AsyncStorage
    const streakStarted = await AsyncStorage.getItem(
      `streak_started_${userId}`,
    );

    // If found in AsyncStorage, return it
    if (streakStarted) {
      return {
        success: true,
        data: streakStarted,
      };
    }

    // If no data found anywhere, return current date
    return {
      success: true,
      data: new Date().toISOString(),
    };
  } catch (error) {
    // On error, try falling back to AsyncStorage
    try {
      const streakStarted = await AsyncStorage.getItem(
        `streak_started_${userId}`,
      );
      if (streakStarted) {
        return {
          success: true,
          data: streakStarted,
        };
      }
    } catch (asyncError) {
      console.error("Error accessing AsyncStorage:", asyncError);
    }

    return handleApiError(error);
  }
};

// Update user's streak started date
export const updateUserStreakStarted = async (
  userId: string,
  startDate: string,
) => {
  try {

    // Make an API call to the server to update the streak start date in the database
    const response = await api.put(`/users/${userId}/streak-started`, {
      streakStarted: startDate,
    });

    // As a backup, also store in AsyncStorage
    await AsyncStorage.setItem(`streak_started_${userId}`, startDate);

    return {
      success: true,
      data: response.data || { streakStarted: startDate },
      message:
        response.data?.message || "Streak started date updated successfully",
    };
  } catch (error) {
    return handleApiError(error);
  }
};

// Get user's last relapse date
export const getUserLastRelapse = async (userId: string) => {
  try {

    // Make API call to get last relapse date from the database
    const response = await api.get(`/users/${userId}/last-relapse`);

    // If the API request succeeds, return the response
    if (response.data && response.data.success) {
      return {
        success: true,
        data: response.data.data,
        message: response.data.message,
      };
    }

    // As a fallback, try to get from AsyncStorage
    const lastRelapse = await AsyncStorage.getItem(`last_relapse_${userId}`);

    // If found in AsyncStorage, return it
    if (lastRelapse) {
      return {
        success: true,
        data: lastRelapse,
      };
    }

    // If no data found anywhere, return null
    return {
      success: true,
      data: null,
    };
  } catch (error) {
    // On error, try falling back to AsyncStorage
    try {
      const lastRelapse = await AsyncStorage.getItem(`last_relapse_${userId}`);
      if (lastRelapse) {
        return {
          success: true,
          data: lastRelapse,
        };
      }
    } catch (asyncError) {
      console.error("Error accessing AsyncStorage:", asyncError);
    }

    return handleApiError(error);
  }
};

// Update user's last relapse date
export const updateUserLastRelapse = async (
  userId: string,
  relapseDate: string,
) => {
  try {

    // Make an API call to the server to update the last relapse date in the database
    const response = await api.put(`/users/${userId}/last-relapse`, {
      lastRelapse: relapseDate,
    });

    // As a backup, also store in AsyncStorage
    await AsyncStorage.setItem(`last_relapse_${userId}`, relapseDate);

    return {
      success: true,
      data: response.data || { lastRelapse: relapseDate },
      message:
        response.data?.message || "Last relapse date updated successfully",
    };
  } catch (error) {
    return handleApiError(error);
  }
};

// CheckIn functions
export const getUserCheckIns = async (userId: string) => {
  try {

    const response = await api.get(`/checkins/user/${userId}`);

    return {
      success: true,
      data: response.data.data,
    };
  } catch (error) {
    return handleApiError(error);
  }
};

export const createCheckIn = async (checkInData: CheckInData) => {
  try {

    const response = await api.post("/checkins", checkInData);

    return {
      success: true,
      data: response.data.data,
      userStreak: response.data.userStreak,
    };
  } catch (error) {
    return handleApiError(error);
  }
};

export const getUserStats = async (userId: string) => {
  try {

    const response = await api.get(`/checkins/stats/${userId}`);

    return {
      success: true,
      data: response.data.data,
    };
  } catch (error) {
    return handleApiError(error);
  }
};

// Settings functions
export const getUserSettings = async (userId: string) => {
  try {

    const response = await api.get(`/users/${userId}/settings`);

    return {
      success: true,
      data: response.data.data,
    };
  } catch (error) {
    return handleApiError(error);
  }
};

export const updateUserSettings = async (
  userId: string,
  settingsData: SettingsData,
) => {
  try {

    const response = await api.put(`/users/${userId}/settings`, {
      settings: settingsData,
    });

    return {
      success: true,
      data: response.data.data,
    };
  } catch (error) {
    return handleApiError(error);
  }
};

// Database connection check
export const checkDatabaseConnection = async () => {
  try {

    const response = await api.get("/health");

    return {
      success: true,
      data: response.data,
      message: "Connected to database",
    };
  } catch (error) {
    return {
      success: false,
      message: "Could not connect to database",
      error: error,
    };
  }
};

// Community Post functions
export interface PostData {
  title: string;
  content: string;
  tag: string;
}

// Get all posts
export const getAllPosts = async (
  tag?: string,
  page: number = 1,
  limit: number = 20,
) => {
  try {

    const queryParams = new URLSearchParams();
    if (tag && tag !== "all") {
      queryParams.append("tag", tag);
    }
    queryParams.append("page", page.toString());
    queryParams.append("limit", limit.toString());

    const response = await api.get(`/posts?${queryParams.toString()}`);

    return {
      success: true,
      data: response.data.data,
      pagination: response.data.pagination,
    };
  } catch (error) {
    return handleApiError(error);
  }
};

// Get posts by user
export const getUserPosts = async (
  userId: string,
  page: number = 1,
  limit: number = 20,
) => {
  try {

    const queryParams = new URLSearchParams();
    queryParams.append("userId", userId);
    queryParams.append("page", page.toString());
    queryParams.append("limit", limit.toString());

    const response = await api.get(`/posts?${queryParams.toString()}`);

    return {
      success: true,
      data: response.data.data,
      pagination: response.data.pagination,
    };
  } catch (error) {
    return handleApiError(error);
  }
};

// Get a single post
export const getPost = async (postId: string) => {
  try {

    const response = await api.get(`/posts/${postId}`);

    return {
      success: true,
      data: response.data.data,
    };
  } catch (error) {
    return handleApiError(error);
  }
};

// Create a new post
export const createPost = async (userId: string, postData: PostData) => {
  try {

    const response = await api.post("/posts", {
      userId,
      ...postData,
    });

    return {
      success: true,
      data: response.data.data,
      message: response.data.message,
    };
  } catch (error) {
    return handleApiError(error);
  }
};

// Update a post
export const updatePost = async (
  postId: string,
  userId: string,
  postData: Partial<PostData>,
) => {
  try {

    const response = await api.put(`/posts/${postId}`, {
      userId,
      ...postData,
    });

    return {
      success: true,
      data: response.data.data,
      message: response.data.message,
    };
  } catch (error) {
    return handleApiError(error);
  }
};

// Delete a post
export const deletePost = async (postId: string, userId: string) => {
  try {

    const response = await api.delete(`/posts/${postId}`, {
      data: { userId },
    });

    return {
      success: true,
      message: response.data.message,
    };
  } catch (error) {
    return handleApiError(error);
  }
};

// Like/unlike a post
export const likePost = async (postId: string, userId: string) => {
  try {

    const response = await api.post(`/posts/${postId}/like`, { userId });

    return {
      success: true,
      data: response.data.data,
      message: response.data.message,
    };
  } catch (error) {
    return handleApiError(error);
  }
};

// Add a comment to a post
export const addComment = async (
  postId: string,
  userId: string,
  content: string,
  parentId?: string,
) => {
  try {

    const requestBody: any = {
      userId,
      content,
    };

    if (parentId) {
      requestBody.parentId = parentId;
    }

    const response = await api.post(`/posts/${postId}/comment`, requestBody);

    return {
      success: true,
      data: response.data.data,
      message: response.data.message,
    };
  } catch (error) {
    return handleApiError(error);
  }
};

// Like a comment
export const likeComment = async (
  postId: string,
  commentId: string,
  userId: string,
) => {
  try {

    const response = await api.post(`/posts/${postId}/comment/${commentId}/like`, {
      userId,
    });

    return {
      success: true,
      data: response.data.data,
      message: response.data.message,
    };
  } catch (error) {
    return handleApiError(error);
  }
};

// Get achievements for a specific user
export const getUserAchievements = async (userId: string) => {
  try {
    const response = await api.get(`/achievements/user/${userId}`);

    return {
      success: true,
      data: response.data.data,
    };
  } catch (error) {
    return handleApiError(error);
  }
};

// Get a user's friends
export const getUserFriends = async (userId: string) => {
  try {
    const response = await api.get(`/users/${userId}/friends`);

    return {
      success: true,
      data: response.data.data,
    };
  } catch (error) {
    return handleApiError(error);
  }
};

// Get pending friend requests
export const getPendingFriendRequests = async (userId: string) => {
  try {
    const response = await api.get(`/users/${userId}/friend-requests`);

    return {
      success: true,
      data: response.data.data,
    };
  } catch (error) {
    return handleApiError(error);
  }
};

// Send a friend request
export const sendFriendRequest = async (
  senderId: string,
  receiverId: string,
) => {
  try {
    const response = await api.post("/users/friend-request", {
      senderId,
      receiverId,
    });

    return {
      success: true,
      message: response.data.message,
    };
  } catch (error) {
    return handleApiError(error);
  }
};

// Chat functions
export const getUserChats = async (userId: string) => {
  try {

    const response = await api.get(`/chats/user/${userId}`);

    return {
      success: true,
      data: response.data.data,
    };
  } catch (error) {
    return handleApiError(error);
  }
};

export const getChatWithMessages = async (chatId: string, userId: string) => {
  try {

    const response = await api.get(`/chats/${chatId}?userId=${userId}`);

    return {
      success: true,
      data: response.data.data,
    };
  } catch (error) {
    return handleApiError(error);
  }
};

export const createGroupChat = async (
  name: string,
  participantIds: string[],
  createdById: string,
) => {
  try {

    const response = await api.post("/chats/group", {
      name,
      participantIds,
      createdById,
    });

    return {
      success: true,
      data: response.data.data,
    };
  } catch (error) {
    return handleApiError(error);
  }
};

export const createOrGetDirectChat = async (
  userId: string,
  otherUserId: string,
) => {
  try {

    const response = await api.post("/chats/direct", {
      userId,
      otherUserId,
    });

    return {
      success: true,
      data: response.data.data,
    };
  } catch (error) {
    return handleApiError(error);
  }
};

export const sendChatMessage = async (
  chatId: string,
  senderId: string,
  content: string,
) => {
  try {

    const response = await api.post(`/chats/${chatId}/messages`, {
      senderId,
      content,
      chatId,
    });

    return {
      success: true,
      data: response.data.data,
    };
  } catch (error) {
    return handleApiError(error);
  }
};

// Survey answers interface
export interface SurveyAnswers {
  problemRecognition?: string;
  habitDuration?: string;
  emotionalConsequences?: string[];
  identityConflict?: string;
  lossOfControl?: string;
  triggers?: string[];
  failedAttempts?: string;
  timeSpent?: string;
  successVision?: string;
  readyForChallenge?: string;
  completedAt?: string;
}

// Save user survey answers
export const saveSurveyAnswers = async (
  userId: string,
  surveyData: SurveyAnswers,
) => {
  try {

    // Add completed timestamp if not provided
    if (!surveyData.completedAt) {
      surveyData.completedAt = new Date().toISOString();
    }

    // Check if userId is a temporary ID
    if (userId.startsWith("temp_")) {

      // For temporary IDs, only store in AsyncStorage
      await AsyncStorage.setItem(
        `survey_answers_${userId}`,
        JSON.stringify({
          ...surveyData,
          savedAt: new Date().toISOString(),
          isTempId: true,
        }),
      );

      return {
        success: true,
        data: surveyData,
        message: "Survey answers saved locally (using temporary ID)",
      };
    }

    // Otherwise, try the API first
    try {
      // Make API call to save survey data
      const response = await api.post(
        `/users/${userId}/survey-answers`,
        surveyData,
      );

      // If the API request succeeds, return the response
      if (response.data && response.data.success) {

        return {
          success: true,
          data: response.data.data,
          message: "Survey answers saved successfully",
        };
      }
    } catch (apiError: any) {
      console.error("Error saving to API:", apiError.message);
      // Continue to local storage fallback
    }

    // Fallback: store the survey answers in AsyncStorage
    await AsyncStorage.setItem(
      `survey_answers_${userId}`,
      JSON.stringify({
        ...surveyData,
        savedAt: new Date().toISOString(),
      }),
    );

    return {
      success: true,
      data: surveyData,
      message: "Survey answers saved locally",
    };
  } catch (error) {
    console.error("Error saving survey answers:", error);

    // Fallback to AsyncStorage if API fails
    try {
      await AsyncStorage.setItem(
        `survey_answers_${userId}`,
        JSON.stringify({
          ...surveyData,
          savedAt: new Date().toISOString(),
          savedLocally: true,
        }),
      );

      return {
        success: true,
        data: surveyData,
        message: "Survey answers saved locally (API unavailable)",
      };
    } catch (storageError) {
      console.error(
        "Error saving survey answers to AsyncStorage:",
        storageError,
      );
      return handleApiError(error);
    }
  }
};

// Get all available group chats
export const getGroupChats = async () => {
  try {

    const response = await api.get("/chats/groups");

    return {
      success: true,
      data: response.data.data,
    };
  } catch (error) {
    return handleApiError(error);
  }
};

// Join a group chat
export const joinGroupChat = async (chatId: string, userId: string) => {
  try {

    const response = await api.post(`/chats/${chatId}/join`, { userId });

    return {
      success: true,
      data: response.data.data,
      message: response.data.message,
    };
  } catch (error) {
    return handleApiError(error);
  }
};
