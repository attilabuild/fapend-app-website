import React, { useEffect, useState } from 'react';
import { View, Text, Image, ScrollView, TouchableOpacity, SafeAreaView } from 'react-native';
import { Post, Reaction } from '../types';
import { formatPostTime } from '../utils/dateUtils';
import { getPostReactions } from '../api/reactions';

interface PostDetailProps {
  post: Post;
  onClose: () => void;
}

export const PostDetail: React.FC<PostDetailProps> = ({ post, onClose }) => {
  const [reactions, setReactions] = useState<Reaction[]>([]);
  
  useEffect(() => {
    loadReactions();
  }, []);
  
  const loadReactions = async () => {
    const data = await getPostReactions(post.id);
    setReactions(data);
  };
  
  return (
    <SafeAreaView className="flex-1 bg-black">
      {/* Header */}
      <View className="px-4 py-3 flex-row items-center justify-between border-b border-gray-800">
        <View className="flex-row items-center">
          {post.user?.profile_picture_url ? (
            <Image
              source={{ uri: post.user.profile_picture_url }}
              className="w-8 h-8 rounded-full"
            />
          ) : (
            <View className="w-8 h-8 rounded-full bg-gray-700 items-center justify-center">
              <Text className="text-white font-bold">
                {post.user?.username?.[0]?.toUpperCase()}
              </Text>
            </View>
          )}
          <Text className="text-white font-bold ml-2">{post.user?.username}</Text>
        </View>
        
        <TouchableOpacity onPress={onClose} className="px-4 py-2">
          <Text className="text-white text-base">Close</Text>
        </TouchableOpacity>
      </View>
      
      <ScrollView className="flex-1">
        {/* Main Image */}
        <View className="relative">
          <Image
            source={{ uri: post.back_camera_url }}
            className="w-full aspect-[3/4]"
            resizeMode="cover"
          />
          
          {/* Front camera overlay */}
          <View className="absolute top-4 left-4 border-2 border-white rounded-xl overflow-hidden">
            <Image
              source={{ uri: post.front_camera_url }}
              className="w-28 h-36"
              resizeMode="cover"
            />
          </View>
          
          {post.posted_late && (
            <View className="absolute top-4 right-4 bg-white/90 px-3 py-2 rounded-full">
              <Text className="text-xs text-black font-bold">Posted Late</Text>
            </View>
          )}
        </View>
        
        {/* Post Info */}
        <View className="p-4">
          <Text className="text-gray-400 text-sm mb-4">
            {formatPostTime(post.created_at)}
          </Text>
          
          {/* Reactions */}
          {reactions.length > 0 && (
            <View className="mt-2">
              <Text className="text-white font-bold text-base mb-3">
                RealMojis ({reactions.length})
              </Text>
              <View className="flex-row flex-wrap">
                {reactions.map((reaction) => (
                  <View key={reaction.id} className="mr-4 mb-4 items-center">
                    <Image
                      source={{ uri: reaction.emoji_image_url }}
                      className="w-16 h-16 rounded-full border-2 border-gray-700"
                    />
                    <Text className="text-white text-xs mt-1">
                      {reaction.user?.username}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

