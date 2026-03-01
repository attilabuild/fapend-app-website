import AsyncStorage from '@react-native-async-storage/async-storage';
import { IUser, IRelapse, ISettings } from '../types';

// Collection keys
const KEYS = {
  USERS: 'users',
  RELAPSES: 'relapses',
  SETTINGS: 'settings',
  CHECKINS: 'checkins',
  POSTS: 'posts'
};

// Helper to generate IDs
const generateId = () => {
  return Date.now().toString() + Math.random().toString(36).substring(2, 9);
};

// Get all items from a collection
const getAll = async (key: string) => {
  try {
    const jsonValue = await AsyncStorage.getItem(key);
    return jsonValue != null ? JSON.parse(jsonValue) : [];
  } catch (e) {
    console.error(`Error reading ${key} from AsyncStorage:`, e);
    return [];
  }
};

// Save all items to a collection
const saveAll = async (key: string, items: any[]) => {
  try {
    const jsonValue = JSON.stringify(items);
    await AsyncStorage.setItem(key, jsonValue);
    return true;
  } catch (e) {
    console.error(`Error saving ${key} to AsyncStorage:`, e);
    return false;
  }
};

// Generic CRUD operations
const createItem = async <T>(key: string, item: any): Promise<T> => {
  try {
    const items = await getAll(key);
    const newItem = { ...item, _id: item._id || generateId() };
    items.push(newItem);
    await saveAll(key, items);
    return newItem as T;
  } catch (e) {
    console.error(`Error creating item in ${key}:`, e);
    throw e;
  }
};

const findById = async <T>(key: string, id: string): Promise<T | null> => {
  try {
    const items = await getAll(key);
    return items.find((item: any) => item._id === id) || null;
  } catch (e) {
    console.error(`Error finding item by id in ${key}:`, e);
    return null;
  }
};

const findByField = async <T>(key: string, field: string, value: any): Promise<T | null> => {
  try {
    const items = await getAll(key);
    return items.find((item: any) => item[field] === value) || null;
  } catch (e) {
    console.error(`Error finding item by field in ${key}:`, e);
    return null;
  }
};

const findAllByField = async <T>(key: string, field: string, value: any): Promise<T[]> => {
  try {
    const items = await getAll(key);
    return items.filter((item: any) => item[field] === value);
  } catch (e) {
    console.error(`Error finding items by field in ${key}:`, e);
    return [];
  }
};

const updateItem = async <T>(key: string, id: string, updates: any): Promise<T | null> => {
  try {
    const items = await getAll(key);
    const index = items.findIndex((item: any) => item._id === id);
    
    if (index === -1) return null;
    
    items[index] = { ...items[index], ...updates, updatedAt: new Date() };
    await saveAll(key, items);
    return items[index] as T;
  } catch (e) {
    console.error(`Error updating item in ${key}:`, e);
    return null;
  }
};

const deleteItem = async (key: string, id: string): Promise<boolean> => {
  try {
    const items = await getAll(key);
    const newItems = items.filter((item: any) => item._id !== id);
    
    if (items.length === newItems.length) return false;
    
    await saveAll(key, newItems);
    return true;
  } catch (e) {
    console.error(`Error deleting item from ${key}:`, e);
    return false;
  }
};

// Specific database operations
export const db = {
  users: {
    create: (user: Omit<IUser, '_id'> & { _id?: string }): Promise<IUser> => 
      createItem<IUser>(KEYS.USERS, {
        ...user,
        createdAt: new Date(),
        updatedAt: new Date()
      }),
    
    findById: (id: string): Promise<IUser | null> => 
      findById<IUser>(KEYS.USERS, id),
    
    findByEmail: (email: string): Promise<IUser | null> => 
      findByField<IUser>(KEYS.USERS, 'email', email),
    
    update: (id: string, updates: Partial<IUser>): Promise<IUser | null> => 
      updateItem<IUser>(KEYS.USERS, id, { ...updates, updatedAt: new Date() }),
    
    delete: (id: string): Promise<boolean> => 
      deleteItem(KEYS.USERS, id)
  },
  
  relapses: {
    create: (relapse: Omit<IRelapse, '_id'> & { _id?: string }): Promise<IRelapse> => 
      createItem<IRelapse>(KEYS.RELAPSES, {
        ...relapse,
        createdAt: new Date(),
        updatedAt: new Date()
      }),
    
    findById: (id: string): Promise<IRelapse | null> => 
      findById<IRelapse>(KEYS.RELAPSES, id),
    
    findByUser: (userId: string): Promise<IRelapse[]> => 
      findAllByField<IRelapse>(KEYS.RELAPSES, 'user', userId),
    
    update: (id: string, updates: Partial<IRelapse>): Promise<IRelapse | null> => 
      updateItem<IRelapse>(KEYS.RELAPSES, id, { ...updates, updatedAt: new Date() }),
    
    delete: (id: string): Promise<boolean> => 
      deleteItem(KEYS.RELAPSES, id)
  },
  
  settings: {
    create: (settings: Omit<ISettings, '_id'> & { _id?: string }): Promise<ISettings> => 
      createItem<ISettings>(KEYS.SETTINGS, {
        ...settings,
        createdAt: new Date(),
        updatedAt: new Date()
      }),
    
    findByUser: (userId: string): Promise<ISettings | null> => 
      findByField<ISettings>(KEYS.SETTINGS, 'userId', userId),
    
    update: (id: string, updates: Partial<ISettings>): Promise<ISettings | null> => 
      updateItem<ISettings>(KEYS.SETTINGS, id, { ...updates, updatedAt: new Date() }),
  },
  
  posts: {
    create: (post: any): Promise<any> => 
      createItem<any>(KEYS.POSTS, {
        ...post,
        comments: post.comments || [],
        userLikes: post.userLikes || [],
        likes: post.likes || 0,
        createdAt: new Date(),
        updatedAt: new Date()
      }),
    
    findById: (id: string): Promise<any | null> => 
      findById<any>(KEYS.POSTS, id),
    
    findAll: (): Promise<any[]> => 
      getAll(KEYS.POSTS),
    
    findByUser: (userId: string): Promise<any[]> => 
      findAllByField<any>(KEYS.POSTS, 'userId', userId),
    
    update: (id: string, updates: any): Promise<any | null> => 
      updateItem<any>(KEYS.POSTS, id, { ...updates, updatedAt: new Date() }),
    
    delete: (id: string): Promise<boolean> => 
      deleteItem(KEYS.POSTS, id)
  }
};

// Clear all data
export const clearAllData = async (): Promise<void> => {
  try {
    await AsyncStorage.multiRemove([KEYS.USERS, KEYS.RELAPSES, KEYS.SETTINGS, KEYS.CHECKINS, KEYS.POSTS]);
  } catch (e) {
    console.error('Error clearing all data:', e);
  }
};

// Automatic check-in utilities for new users
export const setFirstDayAutoCheckin = async (userId: string) => {
  try {
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
    await AsyncStorage.setItem(`first_day_auto_checkin_${userId}`, 'true');
    await AsyncStorage.setItem(`first_checkin_date_${userId}`, today);
  } catch (error) {
    console.error('Error setting first day auto check-in:', error);
  }
};

export const isFirstDayAutoCheckin = async (userId: string): Promise<boolean> => {
  try {
    const firstDayAutoCheckin = await AsyncStorage.getItem(`first_day_auto_checkin_${userId}`);
    const firstCheckinDate = await AsyncStorage.getItem(`first_checkin_date_${userId}`);
    
    if (firstDayAutoCheckin === 'true' && firstCheckinDate) {
      const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
      return firstCheckinDate === today;
    }
    return false;
  } catch (error) {
    console.error('Error checking first day auto check-in:', error);
    return false;
  }
};

export const clearFirstDayAutoCheckin = async (userId: string) => {
  try {
    await AsyncStorage.removeItem(`first_day_auto_checkin_${userId}`);
    await AsyncStorage.removeItem(`first_checkin_date_${userId}`);
  } catch (error) {
    console.error('Error clearing first day auto check-in:', error);
  }
}; 