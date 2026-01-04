import React, { useState, useEffect } from 'react';
import { View, Text, SafeAreaView, ScrollView, TouchableOpacity, TextInput, Image, Alert } from 'react-native';
import { useStore } from '../store/useStore';
import { getFriends, getFriendRequests, searchUsers, sendFriendRequest, checkFriendshipStatus } from '../api/friends';
import { FriendRequestCard } from '../components/FriendRequestCard';
import { LoadingScreen } from '../components/LoadingScreen';
import { User, Friendship } from '../types';

interface FriendsScreenProps {
  navigation: any;
}

export const FriendsScreen: React.FC<FriendsScreenProps> = ({ navigation }) => {
  const [activeTab, setActiveTab] = useState<'friends' | 'requests' | 'search'>('friends');
  const [friends, setFriends] = useState<User[]>([]);
  const [requests, setRequests] = useState<Friendship[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  
  const user = useStore((state) => state.user);
  
  useEffect(() => {
    loadData();
  }, []);
  
  const loadData = async () => {
    if (!user) return;
    
    setLoading(true);
    const [friendsData, requestsData] = await Promise.all([
      getFriends(user.id),
      getFriendRequests(user.id),
    ]);
    
    setFriends(friendsData);
    setRequests(requestsData);
    setLoading(false);
  };
  
  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }
    
    setSearching(true);
    const results = await searchUsers(searchQuery);
    // Filter out current user
    const filtered = results.filter((u) => u.id !== user?.id);
    setSearchResults(filtered);
    setSearching(false);
  };
  
  useEffect(() => {
    const delaySearch = setTimeout(() => {
      if (activeTab === 'search') {
        handleSearch();
      }
    }, 500);
    
    return () => clearTimeout(delaySearch);
  }, [searchQuery, activeTab]);
  
  const handleAddFriend = async (friendId: string) => {
    if (!user) return;
    
    // Check friendship status first
    const status = await checkFriendshipStatus(user.id, friendId);
    
    if (status === 'accepted') {
      Alert.alert('Already Friends', 'You are already friends with this user');
      return;
    }
    
    if (status === 'pending') {
      Alert.alert('Request Pending', 'Friend request already sent');
      return;
    }
    
    const { error } = await sendFriendRequest(user.id, friendId);
    
    if (error) {
      Alert.alert('Error', 'Failed to send friend request');
      return;
    }
    
    Alert.alert('Success', 'Friend request sent!');
  };
  
  if (loading) {
    return <LoadingScreen />;
  }
  
  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-white px-6 py-4 border-b border-gray-200">
        <Text className="text-2xl font-bold text-black">Friends</Text>
      </View>
      
      {/* Tabs */}
      <View className="bg-white flex-row border-b border-gray-200">
        <TouchableOpacity
          onPress={() => setActiveTab('friends')}
          className={`flex-1 py-4 items-center border-b-2 ${
            activeTab === 'friends' ? 'border-black' : 'border-transparent'
          }`}
        >
          <Text className={`font-semibold ${activeTab === 'friends' ? 'text-black' : 'text-gray-500'}`}>
            Friends ({friends.length})
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          onPress={() => setActiveTab('requests')}
          className={`flex-1 py-4 items-center border-b-2 ${
            activeTab === 'requests' ? 'border-black' : 'border-transparent'
          }`}
        >
          <Text className={`font-semibold ${activeTab === 'requests' ? 'text-black' : 'text-gray-500'}`}>
            Requests ({requests.length})
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          onPress={() => setActiveTab('search')}
          className={`flex-1 py-4 items-center border-b-2 ${
            activeTab === 'search' ? 'border-black' : 'border-transparent'
          }`}
        >
          <Text className={`font-semibold ${activeTab === 'search' ? 'text-black' : 'text-gray-500'}`}>
            Search
          </Text>
        </TouchableOpacity>
      </View>
      
      {/* Content */}
      <ScrollView className="flex-1">
        {/* Friends Tab */}
        {activeTab === 'friends' && (
          <View className="p-4">
            {friends.length === 0 ? (
              <View className="items-center justify-center py-20">
                <Text className="text-6xl mb-4">👥</Text>
                <Text className="text-gray-500 text-lg text-center">
                  No friends yet.{'\n'}Search to add some!
                </Text>
              </View>
            ) : (
              friends.map((friend) => (
                <TouchableOpacity
                  key={friend.id}
                  className="bg-white rounded-xl p-4 mb-3 flex-row items-center shadow-sm"
                >
                  {friend.profile_picture_url ? (
                    <Image
                      source={{ uri: friend.profile_picture_url }}
                      className="w-14 h-14 rounded-full"
                    />
                  ) : (
                    <View className="w-14 h-14 rounded-full bg-gray-300 items-center justify-center">
                      <Text className="text-white font-bold text-xl">
                        {friend.username[0].toUpperCase()}
                      </Text>
                    </View>
                  )}
                  <View className="ml-4 flex-1">
                    <Text className="font-bold text-base text-black">
                      {friend.username}
                    </Text>
                    <Text className="text-gray-500 text-sm">
                      {friend.full_name}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))
            )}
          </View>
        )}
        
        {/* Requests Tab */}
        {activeTab === 'requests' && (
          <View className="p-4">
            {requests.length === 0 ? (
              <View className="items-center justify-center py-20">
                <Text className="text-6xl mb-4">📬</Text>
                <Text className="text-gray-500 text-lg text-center">
                  No pending requests
                </Text>
              </View>
            ) : (
              requests.map((request) => (
                <FriendRequestCard
                  key={request.id}
                  request={request}
                  onUpdate={loadData}
                />
              ))
            )}
          </View>
        )}
        
        {/* Search Tab */}
        {activeTab === 'search' && (
          <View className="p-4">
            {/* Search Input */}
            <View className="mb-4">
              <TextInput
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholder="Search by username..."
                placeholderTextColor="#9CA3AF"
                className="bg-white border border-gray-300 rounded-xl px-4 py-3 text-base"
                autoCapitalize="none"
              />
            </View>
            
            {/* Search Results */}
            {searching ? (
              <View className="items-center py-10">
                <Text className="text-gray-500">Searching...</Text>
              </View>
            ) : searchResults.length === 0 ? (
              <View className="items-center justify-center py-20">
                <Text className="text-6xl mb-4">🔍</Text>
                <Text className="text-gray-500 text-lg text-center">
                  {searchQuery ? 'No users found' : 'Search for friends by username'}
                </Text>
              </View>
            ) : (
              searchResults.map((result) => (
                <View
                  key={result.id}
                  className="bg-white rounded-xl p-4 mb-3 flex-row items-center justify-between shadow-sm"
                >
                  <View className="flex-row items-center flex-1">
                    {result.profile_picture_url ? (
                      <Image
                        source={{ uri: result.profile_picture_url }}
                        className="w-14 h-14 rounded-full"
                      />
                    ) : (
                      <View className="w-14 h-14 rounded-full bg-gray-300 items-center justify-center">
                        <Text className="text-white font-bold text-xl">
                          {result.username[0].toUpperCase()}
                        </Text>
                      </View>
                    )}
                    <View className="ml-4 flex-1">
                      <Text className="font-bold text-base text-black">
                        {result.username}
                      </Text>
                      <Text className="text-gray-500 text-sm">
                        {result.full_name}
                      </Text>
                    </View>
                  </View>
                  
                  <TouchableOpacity
                    onPress={() => handleAddFriend(result.id)}
                    className="bg-black px-4 py-2 rounded-lg"
                  >
                    <Text className="text-white font-semibold">Add</Text>
                  </TouchableOpacity>
                </View>
              ))
            )}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

