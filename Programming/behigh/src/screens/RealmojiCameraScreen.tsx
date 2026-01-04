import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, SafeAreaView, Alert, Image } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useStore } from '../store/useStore';
import { addReaction } from '../api/reactions';
import { Button } from '../components/Button';

interface RealmojiCameraScreenProps {
  navigation: any;
  route: any;
}

export const RealmojiCameraScreen: React.FC<RealmojiCameraScreenProps> = ({ navigation, route }) => {
  const { post } = route.params || {};
  const [permission, requestPermission] = useCameraPermissions();
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const cameraRef = useRef<CameraView>(null);
  
  const user = useStore((state) => state.user);
  
  useEffect(() => {
    if (!permission) {
      requestPermission();
    }
  }, []);
  
  if (!post) {
    navigation.goBack();
    return null;
  }
  
  if (!permission) {
    return (
      <View className="flex-1 bg-black items-center justify-center">
        <Text className="text-white">Requesting camera permission...</Text>
      </View>
    );
  }
  
  if (!permission.granted) {
    return (
      <SafeAreaView className="flex-1 bg-black items-center justify-center px-6">
        <Text className="text-white text-center text-lg mb-6">
          Camera permission is required for RealMojis
        </Text>
        <Button title="Grant Permission" onPress={requestPermission} />
      </SafeAreaView>
    );
  }
  
  const takePicture = async () => {
    if (!cameraRef.current) return;
    
    try {
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.7,
        skipProcessing: true,
      });
      
      if (photo) {
        setCapturedPhoto(photo.uri);
      }
    } catch (error) {
      console.error('Error taking picture:', error);
      Alert.alert('Error', 'Failed to capture photo');
    }
  };
  
  const retake = () => {
    setCapturedPhoto(null);
  };
  
  const uploadReaction = async () => {
    if (!user || !capturedPhoto) return;
    
    setUploading(true);
    
    const { reaction, error } = await addReaction(post.id, user.id, capturedPhoto);
    
    setUploading(false);
    
    if (error) {
      Alert.alert('Error', 'Failed to add reaction. Please try again.');
      return;
    }
    
    if (reaction) {
      Alert.alert('Success', 'RealMoji added!', [
        {
          text: 'OK',
          onPress: () => navigation.goBack(),
        },
      ]);
    }
  };
  
  // Preview mode
  if (capturedPhoto) {
    return (
      <SafeAreaView className="flex-1 bg-black">
        <View className="flex-1">
          {/* Preview */}
          <View className="flex-1 items-center justify-center">
            <Image
              source={{ uri: capturedPhoto }}
              className="w-64 h-64 rounded-full bg-gray-800"
              resizeMode="cover"
            />
            
            <Text className="text-white text-lg font-semibold mt-6">
              Your RealMoji
            </Text>
            <Text className="text-gray-400 text-sm mt-2 text-center px-6">
              This is how you'll react to {post.user?.username}'s post
            </Text>
          </View>
          
          {/* Controls */}
          <View className="px-6 pb-8 pt-4">
            <Button
              title="Send RealMoji"
              onPress={uploadReaction}
              loading={uploading}
              className="mb-3"
            />
            <Button
              title="Retake"
              onPress={retake}
              variant="outline"
            />
          </View>
        </View>
      </SafeAreaView>
    );
  }
  
  // Camera mode
  return (
    <SafeAreaView className="flex-1 bg-black">
      <View className="flex-1">
        {/* Header */}
        <View className="absolute top-0 left-0 right-0 z-10 px-6 pt-4 flex-row items-center justify-between">
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            className="p-2"
          >
            <Text className="text-white text-lg">✕</Text>
          </TouchableOpacity>
          
          <Text className="text-white font-bold text-base">RealMoji</Text>
          
          <View className="w-8" />
        </View>
        
        {/* Camera (Front-facing for selfie emoji) */}
        <CameraView
          ref={cameraRef}
          style={{ flex: 1 }}
          facing="front"
        >
          {/* Circular Frame Overlay */}
          <View className="flex-1 items-center justify-center">
            <View className="w-80 h-80 rounded-full border-4 border-white/50" />
          </View>
          
          {/* Instruction */}
          <View className="absolute top-28 left-0 right-0 items-center">
            <View className="bg-black/70 px-6 py-3 rounded-full">
              <Text className="text-white font-semibold text-base text-center">
                Capture your reaction!
              </Text>
            </View>
          </View>
        </CameraView>
        
        {/* Capture Button */}
        <View className="absolute bottom-8 left-0 right-0 items-center">
          <TouchableOpacity
            onPress={takePicture}
            className="w-20 h-20 rounded-full bg-white border-4 border-gray-300"
            activeOpacity={0.7}
          >
            <View className="flex-1 m-1 rounded-full bg-white" />
          </TouchableOpacity>
        </View>
        
        {/* Post Preview (who you're reacting to) */}
        <View className="absolute bottom-32 left-0 right-0 items-center">
          <View className="bg-black/80 px-6 py-3 rounded-full flex-row items-center">
            {post.user?.profile_picture_url ? (
              <Image
                source={{ uri: post.user.profile_picture_url }}
                className="w-8 h-8 rounded-full mr-2"
              />
            ) : (
              <View className="w-8 h-8 rounded-full bg-gray-600 items-center justify-center mr-2">
                <Text className="text-white font-bold text-sm">
                  {post.user?.username?.[0]?.toUpperCase()}
                </Text>
              </View>
            )}
            <Text className="text-white font-semibold">
              Reacting to {post.user?.username}
            </Text>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
};

