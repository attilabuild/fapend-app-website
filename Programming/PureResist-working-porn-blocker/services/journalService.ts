import AsyncStorage from '@react-native-async-storage/async-storage';
import { JournalEntry } from '../types';
import { api } from './api';

// Journal Storage Key (for backward compatibility)
const JOURNAL_STORAGE_KEY = 'nofap_journal_entries';

// Error handling helper
const handleApiError = (error: any) => {
  console.error('Journal API Error:', error.response?.data || error.message || error);
  
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

// Get all journals for a user
export const getUserJournals = async (userId: string) => {
  try {

    // Try to get from API first
    try {
      const response = await api.get(`/journals/user/${userId}`);
      
      if (response.data && response.data.success) {

        return {
          success: true,
          data: response.data.data
        };
      }
    } catch (apiError) {

      // If API fails, fall back to local storage (for backward compatibility)
      const entriesJson = await AsyncStorage.getItem(JOURNAL_STORAGE_KEY);
      if (entriesJson) {
        const allEntries: JournalEntry[] = JSON.parse(entriesJson);
        const userEntries = allEntries.filter(entry => entry.userId === userId);
        
        // Migrate local entries to API if possible
        try {
          for (const entry of userEntries) {
            await createJournalEntry({
              userId,
              content: entry.content,
              mood: entry.mood,
              triggers: entry.triggers,
              isPrivate: entry.isPrivate,
              day: entry.day
            });
          }

        } catch (migrationError) {
          console.error('Failed to migrate entries:', migrationError);
        }
        
        return {
          success: true,
          data: userEntries,
          source: 'local'
        };
      }
    }
    
    // If we get here, both API and local storage failed
    return {
      success: false,
      message: 'No journal entries found'
    };
    
  } catch (error) {
    return handleApiError(error);
  }
};

// Create a new journal entry
export const createJournalEntry = async (journalData: {
  userId: string;
  content: string;
  mood: string;
  triggers?: string[];
  isPrivate?: boolean;
  day?: number;
}) => {
  try {

    const response = await api.post('/journals', journalData);
    
    if (response.data && response.data.success) {

      return {
        success: true,
        data: response.data.data
      };
    }
    
    return {
      success: false,
      message: response.data.message || 'Failed to create journal entry'
    };
    
  } catch (error) {
    return handleApiError(error);
  }
};

// Update a journal entry
export const updateJournalEntry = async (
  entryId: string,
  updates: {
    content?: string;
    mood?: string;
    triggers?: string[];
    isPrivate?: boolean;
  }
) => {
  try {

    const response = await api.put(`/journals/${entryId}`, updates);
    
    if (response.data && response.data.success) {

      return {
        success: true,
        data: response.data.data
      };
    }
    
    return {
      success: false,
      message: response.data.message || 'Failed to update journal entry'
    };
    
  } catch (error) {
    return handleApiError(error);
  }
};

// Delete a journal entry
export const deleteJournalEntry = async (entryId: string) => {
  try {

    const response = await api.delete(`/journals/${entryId}`);
    
    if (response.data && response.data.success) {

      return {
        success: true,
        message: response.data.message
      };
    }
    
    return {
      success: false,
      message: response.data.message || 'Failed to delete journal entry'
    };
    
  } catch (error) {
    return handleApiError(error);
  }
}; 