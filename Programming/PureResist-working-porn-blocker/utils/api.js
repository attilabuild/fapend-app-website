// API utility functions
import { API_BASE_URL } from '../config';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Constants for better request handling
const REQUEST_TIMEOUT = 30000; // 30 seconds
const DEFAULT_FETCH_OPTIONS = {
  timeout: REQUEST_TIMEOUT
};

// Add timeout to fetch
const fetchWithTimeout = async (url, options = {}) => {
  const controller = new AbortController();
  const { timeout = REQUEST_TIMEOUT } = options;
  
  const id = setTimeout(() => controller.abort(), timeout);
  
  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal
    });
    clearTimeout(id);
    return response;
  } catch (error) {
    clearTimeout(id);
    if (error.name === 'AbortError') {
      throw new Error('Request timed out - server may be unavailable');
    }
    throw error;
  }
};

// Helper to get the authentication token
const getAuthToken = async () => {
  try {
    const token = await AsyncStorage.getItem('auth_token');
    return token;
  } catch (error) {
    console.error('Error getting auth token:', error);
    return null;
  }
};

// Common headers for API requests
const getHeaders = async () => {
  const token = await getAuthToken();
  return {
    'Content-Type': 'application/json',
    'Authorization': token ? `Bearer ${token}` : '',
  };
};

// GET request
export const apiGetRequest = async (endpoint) => {
  try {

    const headers = await getHeaders();
    const response = await fetchWithTimeout(`${API_BASE_URL}${endpoint}`, {
      method: 'GET',
      headers,
      timeout: REQUEST_TIMEOUT
    });
    
    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();

    return data;
  } catch (error) {
    console.error(`Error during GET request to ${endpoint}:`, error.message || error);
    throw error;
  }
};

// POST request
export const apiPostRequest = async (endpoint, data = {}) => {
  try {

    const headers = await getHeaders();
    const response = await fetchWithTimeout(`${API_BASE_URL}${endpoint}`, {
      method: 'POST',
      headers,
      body: JSON.stringify(data),
      timeout: REQUEST_TIMEOUT
    });
    
    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }
    
    const responseData = await response.json();

    return responseData;
  } catch (error) {
    console.error(`Error during POST request to ${endpoint}:`, error.message || error);
    throw error;
  }
};

// PUT request
export const apiPutRequest = async (endpoint, data = {}) => {
  try {
    const headers = await getHeaders();
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error(`Error during PUT request to ${endpoint}:`, error);
    throw error;
  }
};

// DELETE request
export const apiDeleteRequest = async (endpoint) => {
  try {
    const headers = await getHeaders();
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'DELETE',
      headers,
    });
    
    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error(`Error during DELETE request to ${endpoint}:`, error);
    throw error;
  }
};

// User-related API calls
export const searchUsers = async (query) => {
  try {
    const response = await apiGetRequest(`/users/search?query=${encodeURIComponent(query)}`);
    return response;
  } catch (error) {
    console.error('Error searching users:', error);
    return {
      success: false,
      message: 'Failed to search users',
      error: error.toString()
    };
  }
};

export const deleteUserAccount = async (userId) => {
  try {
    const headers = await getHeaders();
    const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
      method: 'DELETE',
      headers,
    });
    
    // Handle 404 as a successful deletion, since it means the user doesn't exist
    if (response.status === 404) {
      return {
        success: true,
        message: 'Account successfully deleted'
      };
    }
    
    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error deleting user account:', error);
    return {
      success: false,
      message: 'Failed to delete user account',
      error: error.toString()
    };
  }
};

export const getUserProfile = async (userId) => {
  try {
    const headers = await getHeaders();
    const response = await fetchWithTimeout(`${API_BASE_URL}/users/${userId}`, {
      method: 'GET',
      headers,
      timeout: REQUEST_TIMEOUT
    });
    
    // Handle common errors
    if (response.status === 404) {
      return {
        success: false,
        message: 'User not found'
      };
    }
    
    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error(`Error getting user profile:`, error.message || error);
    return {
      success: false,
      message: 'Failed to load user profile',
      error: error.toString()
    };
  }
};

export const startChat = async (userId) => {
  return await apiPostRequest('/chats', { userId });
};

// Export all API functions
export default {
  apiGetRequest,
  apiPostRequest,
  apiPutRequest,
  apiDeleteRequest,
  searchUsers,
  deleteUserAccount,
  getUserProfile,
  startChat,
}; 