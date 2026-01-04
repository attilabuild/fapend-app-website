import React, { useState, useEffect } from 'react';
import { View, Text, SafeAreaView, ScrollView, TouchableOpacity, Image, Alert } from 'react-native';
import { useStore } from '../store/useStore';
import { getUserPostHistory } from '../api/posts';
import { signOut } from '../api/auth';
import { LoadingScreen } from '../components/LoadingScreen';
import { Post } from '../types';
import { format } from 'date-fns';

interface ProfileScreenProps {
  navigation: any;
}

export const ProfileScreen: React.FC<ProfileScreenProps> = ({ navigation }) => {
  const [postHistory, setPostHistory] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  
  const user = useStore((state) => state.user);
  const setUser = useStore((state) => state.setUser);
  
  useEffect(() => {
    loadPostHistory();
  }, []);
  
  const loadPostHistory = async () => {
    if (!user) return;
    
    setLoading(true);
    const history = await getUserPostHistory(user.id, 14);
    setPostHistory(history);
    setLoading(false);
  };
  
  const handleSignOut = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            await signOut();
            setUser(null);
          },
        },
      ]
    );
  };
  
  if (loading) {
    return <LoadingScreen />;
  }
  
  if (!user) return null;
  
  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-white px-6 py-4 border-b border-gray-200">
        <View className="flex-row items-center justify-between">
          <Text className="text-2xl font-bold text-black">Profile</Text>
          <TouchableOpacity onPress={handleSignOut}>
            <Text className="text-red-600 font-semibold">Sign Out</Text>
          </TouchableOpacity>
        </View>
      </View>
      
      <ScrollView className="flex-1">
        {/* Profile Info */}
        <View className="bg-white p-6 mb-4 items-center">
          {user.profile_picture_url ? (
            <Image
              source={{ uri: user.profile_picture_url }}
              className="w-24 h-24 rounded-full mb-4"
            />
          ) : (
            <View className="w-24 h-24 rounded-full bg-gray-300 items-center justify-center mb-4">
              <Text className="text-white font-bold text-4xl">
                {user.username[0].toUpperCase()}
              </Text>
            </View>
          )}
          
          <Text className="text-2xl font-bold text-black mb-1">
            {user.username}
          </Text>
          <Text className="text-gray-600 text-base">
            {user.full_name}
          </Text>
        </View>
        
        {/* Stats */}
        <View className="bg-white p-6 mb-4">
          <View className="flex-row justify-around">
            <View className="items-center">
              <Text className="text-3xl font-bold text-black mb-1">
                {postHistory.length}
              </Text>
              <Text className="text-gray-600">Moments</Text>
            </View>
            
            <View className="items-center">
              <Text className="text-3xl font-bold text-black mb-1">
                {postHistory.filter(p => !p.posted_late).length}
              </Text>
              <Text className="text-gray-600">On Time</Text>
            </View>
            
            <View className="items-center">
              <Text className="text-3xl font-bold text-black mb-1">
                {postHistory.filter(p => p.posted_late).length}
              </Text>
              <Text className="text-gray-600">Late</Text>
            </View>
          </View>
        </View>
        
        {/* Post History (Last 14 Days) */}
        <View className="bg-white p-6">
          <Text className="text-xl font-bold text-black mb-4">
            Your Moments (Last 14 Days)
          </Text>
          
          {postHistory.length === 0 ? (
            <View className="items-center py-10">
              <Text className="text-6xl mb-4">📸</Text>
              <Text className="text-gray-500 text-center">
                No moments yet.{'\n'}Start capturing your daily moments!
              </Text>
            </View>
          ) : (
            <View className="flex-row flex-wrap -m-1">
              {postHistory.map((post) => (
                <TouchableOpacity
                  key={post.id}
                  className="w-1/3 p-1"
                  onPress={() => {
                    // Could navigate to post detail
                  }}
                >
                  <View className="relative">
                    <Image
                      source={{ uri: post.back_camera_url }}
                      className="w-full aspect-[3/4] rounded-lg bg-gray-200"
                      resizeMode="cover"
                    />
                    
                    {/* Front camera thumbnail overlay */}
                    <View className="absolute top-1 left-1 border border-white rounded overflow-hidden">
                      <Image
                        source={{ uri: post.front_camera_url }}
                        className="w-8 h-10"
                        resizeMode="cover"
                      />
                    </View>
                    
                    {/* Date badge */}
                    <View className="absolute bottom-1 left-1 right-1 bg-black/70 py-1 px-2 rounded">
                      <Text className="text-white text-xs font-semibold text-center">
                        {format(new Date(post.created_at), 'MMM d')}
                      </Text>
                    </View>
                    
                    {/* Late indicator */}
                    {post.posted_late && (
                      <View className="absolute top-1 right-1 bg-red-600 px-2 py-1 rounded">
                        <Text className="text-white text-xs font-bold">L</Text>
                      </View>
                    )}
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
        
        {/* Settings Section */}
        <View className="bg-white p-6 mt-4 mb-8">
          <Text className="text-xl font-bold text-black mb-4">Settings</Text>
          
          <TouchableOpacity className="py-3 border-b border-gray-200">
            <Text className="text-base text-black">Notifications</Text>
          </TouchableOpacity>
          
          <TouchableOpacity className="py-3 border-b border-gray-200">
            <Text className="text-base text-black">Privacy</Text>
          </TouchableOpacity>
          
          <TouchableOpacity className="py-3 border-b border-gray-200">
            <Text className="text-base text-black">Account</Text>
          </TouchableOpacity>
          
          <TouchableOpacity className="py-3">
            <Text className="text-base text-black">About</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

