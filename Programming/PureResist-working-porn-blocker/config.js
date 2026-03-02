// Application configuration settings

// API settings
// For physical devices, use your computer's IP address instead of localhost
export const API_BASE_URL = "https://pureresist.onrender.com/api";

// App settings
export const APP_VERSION = "1.0.0";

// Default themes
export const THEME = {
  LIGHT: "light",
  DARK: "dark",
};

// Default settings
export const DEFAULT_SETTINGS = {
  theme: THEME.DARK,
  notificationsEnabled: true,
  remindersEnabled: true,
  reminderTime: "20:00", // 8:00 PM
  privacyMode: false,
};

// Storage keys
export const STORAGE_KEYS = {
  AUTH_TOKEN: "auth_token",
  USER_DATA: "user_data",
  APP_SETTINGS: "app_settings",
  THEME: "app_theme",
};

export const REVENUECAT_API_KEYS = {
  ios: "appl_kKywePgbpuTaCsmTCpiwkcTRijl",
  android: "goog_nFgMYKrYoXvNQPdCwyhpgYlcPJK",
};

// Export all config
export default {
  API_BASE_URL,
  APP_VERSION,
  THEME,
  DEFAULT_SETTINGS,
  STORAGE_KEYS,
};
