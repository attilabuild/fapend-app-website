// User type - Primary user interface used throughout the app
export interface IUser {
  _id: string;
  username: string;
  email: string;
  password?: string; // Optional for security - not stored in frontend state
  currentStreak: number;
  longestStreak: number;
  startDate: Date;
  lastCheckIn?: Date;
  lastRelapse?: Date;
  goals?: string[];
  achievements?: string[];
  accountabilityPartners?: {
    _id: string;
    name: string;
    currentStreak: number;
  }[];
  createdAt?: Date;
  updatedAt?: Date;
  isSubscribed?: boolean;
  subscriptionStartDate?: Date | null;
  subscriptionEndDate?: Date | null;
}

// Backward compatibility alias
export type User = IUser;

// Daily Check-in type - matches backend CheckIn model
export interface DailyCheckIn {
  _id: string;
  userId: string;
  date: Date;
  succeeded: boolean; // Whether the user stayed clean
  mood: 'great' | 'good' | 'neutral' | 'bad' | 'terrible';
  urgeLevel: number; // 1-10 scale
  notes?: string;
  triggers?: string[];
  activities?: string[];
  dayNumber: number;
  createdAt: Date;
  updatedAt: Date;
}

// Relapse type - consistent with backend and frontend usage
export interface IRelapse {
  _id: string;
  userId: string; // Changed from 'user' to match DailyCheckIn pattern
  date: Date;
  timestamp?: string; // For backward compatibility
  streakLength?: number;
  triggers?: string[];
  mood?: string;
  notes?: string;
  location?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

// Backward compatibility alias
export type Relapse = IRelapse;

// Settings type
export interface ISettings {
  _id: string;
  userId: string;
  hapticFeedback: boolean;
  pushNotifications: boolean;
  theme?: string;
  dailyReminderTime?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

// Auth state
export interface AuthState {
  isAuthenticated: boolean;
  user: IUser | null;
  loading: boolean;
  error: string | null;
}

// Streak state
export interface StreakState {
  currentStreak: number;
  longestStreak: number;
  lastCheckIn: Date | null;
  lastRelapse: Date | null;
  streakStarted: Date | null;
  checkIns: DailyCheckIn[];
  relapses: IRelapse[];
  loading: boolean;
  error: string | null;
}

// Journal Entry Interface
export interface JournalEntry {
  id?: string; // Optional for backward compatibility
  _id?: string; // MongoDB style ID
  userId: string;
  date: string;
  content: string;
  mood: 'great' | 'good' | 'okay' | 'bad' | 'awful';
  triggers: string[];
  isPrivate: boolean;
  createdAt: string;
  updatedAt: string;
  day: number;
}

// Achievement Interface
export interface Achievement {
  id?: string; // Optional for backward compatibility
  _id?: string; // MongoDB style ID
  title: string;
  description: string;
  requirement: number | string;
  icon: string;
  unlockedAt?: Date;
  unlocked: boolean;
  progress?: number;
  category: 'streak' | 'journal' | 'time';
  points?: number; // Optional points system
}

// API Response types for better error handling
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

// Achievement-specific API response
export interface AchievementResponse {
  success: boolean;
  message?: string;
  newlyUnlocked?: Achievement[];
  data?: Achievement[];
  error?: any;
}

// Settings state for the store
export interface SettingsState {
  hapticFeedback: boolean;
  pushNotifications: boolean;
  loading: boolean;
  error: string | null;
}

// Achievement state for the store
export interface AchievementState {
  achievements: Achievement[];
  loading: boolean;
  error: string | null;
  modalVisible: boolean;
  modalAchievement: Achievement | null;
} 