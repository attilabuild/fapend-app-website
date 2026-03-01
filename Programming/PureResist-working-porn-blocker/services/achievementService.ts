import AsyncStorage from '@react-native-async-storage/async-storage';
import { Achievement } from '../types';
import { api } from './api';

// Error handling helper
const handleApiError = (error: any) => {
  console.error('Achievement API Error:', error.response?.data || error.message || error);
  
  if (error.code === 'ECONNABORTED') {
    return {
      success: false,
      message: 'Connection timeout - server may be unavailable',
      error: 'Request timed out'
    };
  }
  
  if (!error.response) {
    return {
      success: false,
      message: 'Network error - please check your connection',
      error: error.message || 'Network error'
    };
  }
  
  return {
    success: false,
    message: error.response?.data?.message || 'An error occurred',
    error: error.response?.data?.error || error.message
  };
};

// Initialize default achievements
export const initializeAchievements = async () => {
  try {
    const response = await api.post('/achievements/init');
    
    if (response.data && response.data.success) {
      return {
        success: true,
        message: response.data.message
      };
    }
    
    return {
      success: false,
      message: response.data.message || 'Failed to initialize achievements'
    };
    
  } catch (error) {
    return handleApiError(error);
  }
};

// Get all achievements for a user
export const getUserAchievements = async (userId: string) => {
  try {
    // Try to get from API first
    try {
      const response = await api.get(`/achievements/user/${userId}`);
      
      if (response.data && response.data.success) {
        return {
          success: true,
          data: response.data.data
        };
      }
    } catch (apiError) {
      // If API fails, fall back to local storage (for backward compatibility)
      const achievementsJson = await AsyncStorage.getItem(`achievements_${userId}`);
      if (achievementsJson) {
        const achievements = JSON.parse(achievementsJson);
        return {
          success: true,
          data: achievements,
          source: 'local'
        };
      }
    }
    
    // If we get here, both API and local storage failed
    return {
      success: false,
      message: 'No achievements found'
    };
    
  } catch (error) {
    return handleApiError(error);
  }
};

// Update achievement progress
export const updateAchievementProgress = async (
  userId: string, 
  stats: {
    streakDays?: number;
    journalCount?: number;
    lessonsRead?: number;
    streakStarted?: string | Date;
  }
) => {
  try {
    const { streakDays, journalCount, lessonsRead, streakStarted } = stats;
    
    const response = await api.post('/achievements/progress', {
      userId,
      streakDays,
      journalCount,
      lessonsRead,
      streakStarted
    });
    
    if (response.data && response.data.success) {
      const newlyUnlocked = response.data.newlyUnlocked || [];
      
      return {
        success: true,
        message: response.data.message,
        newlyUnlocked
      };
    }
    
    return {
      success: false,
      message: response.data.message || 'Failed to update achievement progress'
    };
    
  } catch (error) {
    return handleApiError(error);
  }
};

// Manually unlock an achievement
export const unlockAchievement = async (userId: string, achievementId: string) => {
  try {
    const response = await api.post('/achievements/unlock', {
      userId,
      achievementId
    });
    
    if (response.data && response.data.success) {
      return {
        success: true,
        data: response.data.data
      };
    }
    
    return {
      success: false,
      message: response.data.message || 'Failed to unlock achievement'
    };
    
  } catch (error) {
    return handleApiError(error);
  }
}; 