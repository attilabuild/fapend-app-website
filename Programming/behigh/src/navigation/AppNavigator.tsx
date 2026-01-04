import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { useStore } from '../store/useStore';
import { getCurrentUser } from '../api/auth';
import { AuthStack } from './AuthStack';
import { MainTabs } from './MainTabs';
import { CameraScreen } from '../screens/CameraScreen';
import { RealmojiCameraScreen } from '../screens/RealmojiCameraScreen';
import { LoadingScreen } from '../components/LoadingScreen';
import { registerForPushNotifications, setupNotificationListeners, scheduleDailyNotification } from '../services/notifications';
import { updatePushToken } from '../api/auth';
import { DEMO_MODE, DEMO_USER, DEMO_POSTS, DEMO_FRIENDS, DEMO_POST_HISTORY } from '../services/demo';

const Stack = createStackNavigator();

export const AppNavigator: React.FC = () => {
  const [initializing, setInitializing] = useState(true);
  const user = useStore((state) => state.user);
  const setUser = useStore((state) => state.setUser);
  const setTodaysMomentTime = useStore((state) => state.setTodaysMomentTime);
  const setHasPostedToday = useStore((state) => state.setHasPostedToday);
  const setFeedPosts = useStore((state) => state.setFeedPosts);
  const setFriends = useStore((state) => state.setFriends);
  const setMyPostHistory = useStore((state) => state.setMyPostHistory);
  
  // DEMO MODE: Skip Supabase and use mock data
  if (DEMO_MODE) {
    useEffect(() => {
      // Auto-login with demo user
      setUser(DEMO_USER);
      setHasPostedToday(true); // Show feed directly
      setFeedPosts(DEMO_POSTS);
      setFriends(DEMO_FRIENDS);
      setMyPostHistory(DEMO_POST_HISTORY);
      setTodaysMomentTime(new Date());
      setInitializing(false);
    }, []);
    
    if (initializing) {
      return <LoadingScreen />;
    }
    
    return (
      <NavigationContainer>
        <Stack.Navigator
          screenOptions={{
            headerShown: false,
          }}
        >
          <Stack.Screen name="Main" component={MainTabs} />
          <Stack.Screen 
            name="Camera" 
            component={CameraScreen}
            options={{
              presentation: 'modal',
            }}
          />
          <Stack.Screen 
            name="RealmojCamera" 
            component={RealmojiCameraScreen}
            options={{
              presentation: 'modal',
            }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    );
  }
  
  useEffect(() => {
    initializeApp();
  }, []);
  
  useEffect(() => {
    if (user) {
      setupNotifications();
    }
  }, [user]);
  
  const initializeApp = async () => {
    // Check for existing session
    const currentUser = await getCurrentUser();
    
    if (currentUser) {
      setUser(currentUser);
    }
    
    setInitializing(false);
  };
  
  const setupNotifications = async () => {
    if (!user) return;
    
    // Register for push notifications
    const pushToken = await registerForPushNotifications();
    
    if (pushToken) {
      await updatePushToken(user.id, pushToken);
    }
    
    // Schedule daily notification
    await scheduleDailyNotification(user.id);
    
    // Set up notification listeners
    const cleanup = setupNotificationListeners(
      (notification) => {
        console.log('Notification received:', notification);
        // Set moment time when notification is received
        setTodaysMomentTime(new Date());
      },
      (response) => {
        console.log('Notification tapped:', response);
        // Could navigate to camera when notification is tapped
      }
    );
    
    return cleanup;
  };
  
  if (initializing) {
    return <LoadingScreen />;
  }
  
  return (
    <NavigationContainer>
      {user ? (
        <Stack.Navigator
          screenOptions={{
            headerShown: false,
          }}
        >
          <Stack.Screen name="Main" component={MainTabs} />
          <Stack.Screen 
            name="Camera" 
            component={CameraScreen}
            options={{
              presentation: 'modal',
            }}
          />
          <Stack.Screen 
            name="RealmojCamera" 
            component={RealmojiCameraScreen}
            options={{
              presentation: 'modal',
            }}
          />
        </Stack.Navigator>
      ) : (
        <AuthStack />
      )}
    </NavigationContainer>
  );
};

