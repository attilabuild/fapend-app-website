import AsyncStorage from '@react-native-async-storage/async-storage';

interface CacheItem {
  data: any;
  timestamp: number;
  expiry: number;
}

class ApiCache {
  private static instance: ApiCache;
  private cachePrefix = 'api_cache_';

  static getInstance(): ApiCache {
    if (!ApiCache.instance) {
      ApiCache.instance = new ApiCache();
    }
    return ApiCache.instance;
  }

  async get(key: string): Promise<any | null> {
    try {
      const cacheKey = this.cachePrefix + key;
      const cached = await AsyncStorage.getItem(cacheKey);
      
      if (!cached) return null;
      
      const cacheItem: CacheItem = JSON.parse(cached);
      
      // Check if cache is expired
      if (Date.now() > cacheItem.expiry) {
        await AsyncStorage.removeItem(cacheKey);
        return null;
      }
      
      return cacheItem.data;
    } catch (error) {
      console.error('Error reading from cache:', error);
      return null;
    }
  }

  async set(key: string, data: any, ttlMinutes: number = 5): Promise<void> {
    try {
      const cacheKey = this.cachePrefix + key;
      const cacheItem: CacheItem = {
        data,
        timestamp: Date.now(),
        expiry: Date.now() + (ttlMinutes * 60 * 1000),
      };
      
      await AsyncStorage.setItem(cacheKey, JSON.stringify(cacheItem));
    } catch (error) {
      console.error('Error writing to cache:', error);
    }
  }

  async clear(pattern?: string): Promise<void> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const cacheKeys = keys.filter(key => {
        if (pattern) {
          return key.startsWith(this.cachePrefix + pattern);
        }
        return key.startsWith(this.cachePrefix);
      });
      
      await AsyncStorage.multiRemove(cacheKeys);
    } catch (error) {
      console.error('Error clearing cache:', error);
    }
  }

  async invalidate(key: string): Promise<void> {
    try {
      const cacheKey = this.cachePrefix + key;
      await AsyncStorage.removeItem(cacheKey);
    } catch (error) {
      console.error('Error invalidating cache:', error);
    }
  }
}

export const apiCache = ApiCache.getInstance();

// Cache utility function for API calls
export const withCache = async <T>(
  key: string,
  apiCall: () => Promise<T>,
  ttlMinutes: number = 5,
  useCache: boolean = true
): Promise<T> => {
  if (!useCache) {
    return await apiCall();
  }

  // Try to get from cache first
  const cached = await apiCache.get(key);
  if (cached) {
    return cached;
  }

  // If not in cache, make API call
  const result = await apiCall();
  
  // Cache the result
  await apiCache.set(key, result, ttlMinutes);
  
  return result;
}; 