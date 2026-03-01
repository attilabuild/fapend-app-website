import AsyncStorage from '@react-native-async-storage/async-storage';
import { clearAllData } from './asyncStorage';

// Function to initialize the local storage database
export const initializeDatabase = async () => {
  try {

    // Check if storage is available
    const testKey = 'test_connection';
    await AsyncStorage.setItem(testKey, 'test');
    const testValue = await AsyncStorage.getItem(testKey);
    await AsyncStorage.removeItem(testKey);
    
    if (testValue !== 'test') {
      console.error('AsyncStorage test failed');
      return {
        connected: false,
        message: 'AsyncStorage not available',
      };
    }

    return {
      connected: true,
      message: 'Local storage initialized successfully',
    };
  } catch (error) {
    console.error('Error initializing local storage:', error);
    return {
      connected: false,
      message: 'Error initializing local storage',
    };
  }
};

// Reset all data in AsyncStorage (for development/testing)
export const resetDatabase = async () => {
  try {
    await clearAllData();
    return {
      success: true,
      message: 'Database reset successful',
    };
  } catch (error) {
    console.error('Error resetting database:', error);
    return {
      success: false,
      message: 'Error resetting database',
    };
  }
}; 