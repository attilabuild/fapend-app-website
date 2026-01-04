import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, SafeAreaView, ScrollView, RefreshControl, TouchableOpacity } from 'react-native';
import { useStore } from '../store/useStore';
import { getTodaysPosts, checkUserPostedToday } from '../api/posts';
import { PostCard } from '../components/PostCard';
import { LoadingScreen } from '../components/LoadingScreen';
import { Timer } from '../components/Timer';
import { Post } from '../types';

interface FeedScreenProps {
  navigation: any;
}

export const FeedScreen: React.FC<FeedScreenProps> = ({ navigation }) => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedPostForReaction, setSelectedPostForReaction] = useState<Post | null>(null);
  
  const user = useStore((state) => state.user);
  const hasPostedToday = useStore((state) => state.hasPostedToday);
  const setHasPostedToday = useStore((state) => state.setHasPostedToday);
  const todaysMomentTime = useStore((state) => state.todaysMomentTime);
  
  useEffect(() => {
    loadFeed();
  }, [hasPostedToday]);
  
  const loadFeed = async () => {
    if (!user) return;
    
    setLoading(true);
    
    // Check if user has posted today
    const posted = await checkUserPostedToday(user.id);
    setHasPostedToday(posted);
    
    if (posted) {
      // Load feed posts
      const feedPosts = await getTodaysPosts(user.id);
      setPosts(feedPosts);
    }
    
    setLoading(false);
  };
  
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadFeed();
    setRefreshing(false);
  }, []);
  
  const handlePostLongPress = (post: Post) => {
    setSelectedPostForReaction(post);
    // Navigate to RealMoji camera
    navigation.navigate('RealmojCamera', { post });
  };
  
  if (loading) {
    return <LoadingScreen />;
  }
  
  // Post-before-view enforcement: Show camera prompt if user hasn't posted
  if (!hasPostedToday) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <View className="flex-1 items-center justify-center px-6">
          {/* Timer */}
          {todaysMomentTime && (
            <View className="mb-8">
              <Timer momentTime={todaysMomentTime} />
            </View>
          )}
          
          {/* Icon */}
          <View className="w-32 h-32 rounded-full bg-gray-200 items-center justify-center mb-8">
            <Text className="text-6xl">📸</Text>
          </View>
          
          {/* Message */}
          <Text className="text-3xl font-bold text-black text-center mb-4">
            Time to BeReal.
          </Text>
          <Text className="text-lg text-gray-600 text-center mb-12">
            Post your moment to see what your friends are up to!
          </Text>
          
          {/* CTA Button */}
          <TouchableOpacity
            onPress={() => navigation.navigate('Camera')}
            className="bg-black px-12 py-5 rounded-2xl shadow-lg"
            activeOpacity={0.8}
          >
            <Text className="text-white font-bold text-xl">Capture Now</Text>
          </TouchableOpacity>
          
          <Text className="text-gray-500 text-sm mt-8 text-center">
            You must post before viewing your friends' feed
          </Text>
        </View>
      </SafeAreaView>
    );
  }
  
  // Show feed after user has posted
  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-white px-6 py-4 border-b border-gray-200">
        <View className="flex-row items-center justify-between">
          <Text className="text-2xl font-bold text-black">Today</Text>
          
          {todaysMomentTime && (
            <Timer momentTime={todaysMomentTime} />
          )}
        </View>
        <Text className="text-gray-500 text-sm mt-1">
          {posts.length} {posts.length === 1 ? 'moment' : 'moments'}
        </Text>
      </View>
      
      {/* Feed */}
      <ScrollView
        className="flex-1"
        contentContainerClassName="p-4"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {posts.length === 0 ? (
          <View className="flex-1 items-center justify-center py-20">
            <Text className="text-gray-500 text-lg text-center">
              No moments yet today.{'\n'}
              Add some friends to see their posts!
            </Text>
          </View>
        ) : (
          posts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              onLongPress={() => handlePostLongPress(post)}
            />
          ))
        )}
        
        {/* Instruction at bottom */}
        {posts.length > 0 && (
          <View className="mt-6 mb-4 bg-white p-4 rounded-xl">
            <Text className="text-gray-600 text-center text-sm">
              💡 Tip: Long press on a post to react with a RealMoji
            </Text>
          </View>
        )}
      </ScrollView>
      
      {/* Floating Add Friends Button (if no posts) */}
      {posts.length === 0 && (
        <TouchableOpacity
          onPress={() => navigation.navigate('Friends')}
          className="absolute bottom-8 right-6 bg-black px-6 py-4 rounded-full shadow-lg flex-row items-center"
          activeOpacity={0.8}
        >
          <Text className="text-white font-bold text-base">+ Add Friends</Text>
        </TouchableOpacity>
      )}
    </SafeAreaView>
  );
};

