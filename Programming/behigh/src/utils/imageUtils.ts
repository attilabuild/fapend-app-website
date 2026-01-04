import * as ImageManipulator from 'expo-image-manipulator';
import { supabase } from '../services/supabase';

export const compressImage = async (uri: string): Promise<string> => {
  const manipResult = await ImageManipulator.manipulateAsync(
    uri,
    [{ resize: { width: 1080 } }],
    { compress: 0.8, format: ImageManipulator.SaveFormat.JPEG }
  );
  return manipResult.uri;
};

export const uploadImage = async (
  uri: string,
  bucket: string,
  path: string
): Promise<string | null> => {
  try {
    // Compress image before upload
    const compressedUri = await compressImage(uri);
    
    // Convert to blob for upload
    const response = await fetch(compressedUri);
    const blob = await response.blob();
    
    const fileName = `${path}_${Date.now()}.jpg`;
    
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(fileName, blob, {
        contentType: 'image/jpeg',
        upsert: false,
      });
    
    if (error) {
      console.error('Upload error:', error);
      return null;
    }
    
    // Get public URL
    const { data: urlData } = supabase.storage
      .from(bucket)
      .getPublicUrl(fileName);
    
    return urlData.publicUrl;
  } catch (error) {
    console.error('Image upload error:', error);
    return null;
  }
};

export const generateRandomTime = (): Date => {
  // Generate random time between 9 AM and 11 PM
  const now = new Date();
  const hour = Math.floor(Math.random() * (23 - 9) + 9);
  const minute = Math.floor(Math.random() * 60);
  
  now.setHours(hour, minute, 0, 0);
  return now;
};

