import React, { useState } from 'react';
import { View, Text, Image, TouchableOpacity, Modal } from 'react-native';
import { Post } from '../types';
import { formatPostTime } from '../utils/dateUtils';
import { PostDetail } from './PostDetail';

interface PostCardProps {
  post: Post;
  onLongPress?: () => void;
}

export const PostCard: React.FC<PostCardProps> = ({ post, onLongPress }) => {
  const [showDetail, setShowDetail] = useState(false);
  
  return (
    <>
      <TouchableOpacity
        onPress={() => setShowDetail(true)}
        onLongPress={onLongPress}
        delayLongPress={500}
        activeOpacity={0.9}
        className="mb-4 bg-white rounded-2xl overflow-hidden shadow-sm"
      >
        {/* Header */}
        <View className="p-4 flex-row items-center justify-between">
          <View className="flex-row items-center">
            {post.user?.profile_picture_url ? (
              <Image
                source={{ uri: post.user.profile_picture_url }}
                className="w-10 h-10 rounded-full bg-gray-200"
              />
            ) : (
              <View className="w-10 h-10 rounded-full bg-gray-300 items-center justify-center">
                <Text className="text-white font-bold text-lg">
                  {post.user?.username?.[0]?.toUpperCase() || '?'}
                </Text>
              </View>
            )}
            <View className="ml-3">
              <Text className="font-bold text-base text-black">
                {post.user?.username || 'Unknown'}
              </Text>
              <Text className="text-gray-500 text-xs">
                {formatPostTime(post.created_at)}
              </Text>
            </View>
          </View>
          
          {post.posted_late && (
            <View className="bg-gray-200 px-3 py-1 rounded-full">
              <Text className="text-xs text-gray-700 font-semibold">Late</Text>
            </View>
          )}
        </View>
        
        {/* Main Image with Selfie Overlay */}
        <View className="relative">
          <Image
            source={{ uri: post.back_camera_url }}
            className="w-full aspect-[3/4] bg-gray-200"
            resizeMode="cover"
          />
          
          {/* Front camera overlay (top-left) */}
          <View className="absolute top-4 left-4 border-2 border-white rounded-xl overflow-hidden shadow-lg">
            <Image
              source={{ uri: post.front_camera_url }}
              className="w-24 h-32 bg-gray-200"
              resizeMode="cover"
            />
          </View>
          
          {/* Reactions Preview */}
          {post.reactions && post.reactions.length > 0 && (
            <View className="absolute bottom-4 right-4 flex-row">
              {post.reactions.slice(0, 3).map((reaction, index) => (
                <Image
                  key={reaction.id}
                  source={{ uri: reaction.emoji_image_url }}
                  className="w-8 h-8 rounded-full border-2 border-white"
                  style={{ marginLeft: index > 0 ? -8 : 0 }}
                />
              ))}
              {post.reactions.length > 3 && (
                <View className="w-8 h-8 rounded-full bg-black/50 items-center justify-center border-2 border-white ml-[-8px]">
                  <Text className="text-white text-xs font-bold">
                    +{post.reactions.length - 3}
                  </Text>
                </View>
              )}
            </View>
          )}
        </View>
      </TouchableOpacity>
      
      {/* Full Screen Detail Modal */}
      <Modal
        visible={showDetail}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowDetail(false)}
      >
        <PostDetail post={post} onClose={() => setShowDetail(false)} />
      </Modal>
    </>
  );
};

