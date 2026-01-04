import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, SafeAreaView, Alert, Image } from 'react-native';
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import { useStore } from '../store/useStore';
import { Timer } from '../components/Timer';
import { createPost } from '../api/posts';
import { Button } from '../components/Button';

interface CameraScreenProps {
  navigation: any;
}

export const CameraScreen: React.FC<CameraScreenProps> = ({ navigation }) => {
  const [permission, requestPermission] = useCameraPermissions();
  const [facing, setFacing] = useState<CameraType>('back');
  const [captureStep, setCaptureStep] = useState<'back' | 'front' | 'preview'>('back');
  const [uploading, setUploading] = useState(false);
  const cameraRef = useRef<CameraView>(null);
  
  const user = useStore((state) => state.user);
  const todaysMomentTime = useStore((state) => state.todaysMomentTime);
  const frontPhoto = useStore((state) => state.frontPhoto);
  const backPhoto = useStore((state) => state.backPhoto);
  const setFrontPhoto = useStore((state) => state.setFrontPhoto);
  const setBackPhoto = useStore((state) => state.setBackPhoto);
  const clearPhotos = useStore((state) => state.clearPhotos);
  const setHasPostedToday = useStore((state) => state.setHasPostedToday);
  
  useEffect(() => {
    if (!permission) {
      requestPermission();
    }
  }, []);
  
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
          Camera permission is required to post your moment
        </Text>
        <Button title="Grant Permission" onPress={requestPermission} />
      </SafeAreaView>
    );
  }
  
  const takePicture = async () => {
    if (!cameraRef.current) return;
    
    try {
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.8,
        skipProcessing: true,
      });
      
      if (!photo) return;
      
      if (captureStep === 'back') {
        setBackPhoto(photo.uri);
        setCaptureStep('front');
        setFacing('front');
      } else if (captureStep === 'front') {
        setFrontPhoto(photo.uri);
        setCaptureStep('preview');
      }
    } catch (error) {
      console.error('Error taking picture:', error);
      Alert.alert('Error', 'Failed to capture photo');
    }
  };
  
  const retake = () => {
    clearPhotos();
    setCaptureStep('back');
    setFacing('back');
  };
  
  const uploadPost = async () => {
    if (!user || !backPhoto || !frontPhoto || !todaysMomentTime) {
      Alert.alert('Error', 'Missing required data');
      return;
    }
    
    setUploading(true);
    
    const { post, error } = await createPost(
      user.id,
      frontPhoto,
      backPhoto,
      todaysMomentTime
    );
    
    setUploading(false);
    
    if (error) {
      Alert.alert('Upload Failed', 'Could not upload your post. Please try again.');
      return;
    }
    
    if (post) {
      Alert.alert('Success', 'Your moment has been posted!', [
        {
          text: 'OK',
          onPress: () => {
            setHasPostedToday(true);
            clearPhotos();
            navigation.navigate('Feed');
          },
        },
      ]);
    }
  };
  
  // Preview mode
  if (captureStep === 'preview' && backPhoto && frontPhoto) {
    return (
      <SafeAreaView className="flex-1 bg-black">
        <View className="flex-1">
          {/* Preview */}
          <View className="flex-1 relative">
            <Image
              source={{ uri: backPhoto }}
              className="w-full h-full"
              resizeMode="cover"
            />
            
            {/* Front camera overlay */}
            <View className="absolute top-20 left-6 border-2 border-white rounded-xl overflow-hidden">
              <Image
                source={{ uri: frontPhoto }}
                className="w-24 h-32"
                resizeMode="cover"
              />
            </View>
            
            {/* Timer */}
            {todaysMomentTime && (
              <View className="absolute top-12 right-6">
                <Timer momentTime={todaysMomentTime} />
              </View>
            )}
          </View>
          
          {/* Controls */}
          <View className="px-6 pb-8 pt-4 bg-black">
            <Button
              title="Post"
              onPress={uploadPost}
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
          
          {todaysMomentTime && (
            <Timer momentTime={todaysMomentTime} />
          )}
          
          <View className="w-8" />
        </View>
        
        {/* Camera */}
        <CameraView
          ref={cameraRef}
          style={{ flex: 1 }}
          facing={facing}
        >
          {/* Instruction */}
          <View className="absolute bottom-40 left-0 right-0 items-center">
            <View className="bg-black/70 px-6 py-3 rounded-full">
              <Text className="text-white font-bold text-base">
                {captureStep === 'back' ? 'Take Back Camera Photo' : 'Take Front Camera Photo (Selfie)'}
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
        
        {/* Step indicator */}
        <View className="absolute bottom-32 left-0 right-0 flex-row justify-center gap-2">
          <View className={`w-3 h-3 rounded-full ${captureStep === 'back' ? 'bg-white' : 'bg-gray-600'}`} />
          <View className={`w-3 h-3 rounded-full ${captureStep === 'front' ? 'bg-white' : 'bg-gray-600'}`} />
        </View>
      </View>
    </SafeAreaView>
  );
};

