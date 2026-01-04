import { useEffect, useState } from 'react';
import { useStore } from '../store/useStore';
import { getCurrentUser } from '../api/auth';
import { checkUserPostedToday } from '../api/posts';

/**
 * Custom hook for authentication state management
 */
export const useAuth = () => {
  const [loading, setLoading] = useState(true);
  const user = useStore((state) => state.user);
  const setUser = useStore((state) => state.setUser);
  const setHasPostedToday = useStore((state) => state.setHasPostedToday);
  
  useEffect(() => {
    loadUser();
  }, []);
  
  const loadUser = async () => {
    setLoading(true);
    const currentUser = await getCurrentUser();
    
    if (currentUser) {
      setUser(currentUser);
      
      // Check if user has posted today
      const posted = await checkUserPostedToday(currentUser.id);
      setHasPostedToday(posted);
    }
    
    setLoading(false);
  };
  
  const isAuthenticated = !!user;
  
  return {
    user,
    isAuthenticated,
    loading,
    refreshUser: loadUser,
  };
};

