import React, { useState } from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';
import { Friendship } from '../types';
import { acceptFriendRequest, declineFriendRequest } from '../api/friends';

interface FriendRequestCardProps {
  request: Friendship;
  onUpdate: () => void;
}

export const FriendRequestCard: React.FC<FriendRequestCardProps> = ({ request, onUpdate }) => {
  const [loading, setLoading] = useState(false);
  
  const handleAccept = async () => {
    setLoading(true);
    await acceptFriendRequest(request.id);
    setLoading(false);
    onUpdate();
  };
  
  const handleDecline = async () => {
    setLoading(true);
    await declineFriendRequest(request.id);
    setLoading(false);
    onUpdate();
  };
  
  return (
    <View className="bg-white rounded-xl p-4 mb-3 flex-row items-center justify-between shadow-sm">
      <View className="flex-row items-center flex-1">
        {request.friend?.profile_picture_url ? (
          <Image
            source={{ uri: request.friend.profile_picture_url }}
            className="w-12 h-12 rounded-full"
          />
        ) : (
          <View className="w-12 h-12 rounded-full bg-gray-300 items-center justify-center">
            <Text className="text-white font-bold text-lg">
              {request.friend?.username?.[0]?.toUpperCase()}
            </Text>
          </View>
        )}
        <View className="ml-3 flex-1">
          <Text className="font-bold text-base text-black">
            {request.friend?.username}
          </Text>
          <Text className="text-gray-500 text-sm">
            {request.friend?.full_name}
          </Text>
        </View>
      </View>
      
      <View className="flex-row gap-2">
        <TouchableOpacity
          onPress={handleAccept}
          disabled={loading}
          className="bg-black px-4 py-2 rounded-lg"
        >
          <Text className="text-white font-semibold">Accept</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          onPress={handleDecline}
          disabled={loading}
          className="bg-gray-200 px-4 py-2 rounded-lg"
        >
          <Text className="text-black font-semibold">Decline</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

