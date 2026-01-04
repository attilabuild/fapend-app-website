import { supabase } from '../services/supabase';
import { Reaction } from '../types';
import { uploadImage } from '../utils/imageUtils';

export const addReaction = async (
  postId: string,
  userId: string,
  emojiPhotoUri: string
): Promise<{ reaction: Reaction | null; error: any }> => {
  try {
    // Upload emoji photo
    const emojiUrl = await uploadImage(emojiPhotoUri, 'reactions', `${userId}/emoji`);
    
    if (!emojiUrl) {
      return { reaction: null, error: { message: 'Failed to upload emoji' } };
    }
    
    // Insert or update reaction
    const { data, error } = await supabase
      .from('reactions')
      .upsert({
        post_id: postId,
        user_id: userId,
        emoji_image_url: emojiUrl,
      })
      .select()
      .single();
    
    if (error) {
      return { reaction: null, error };
    }
    
    return { reaction: data, error: null };
  } catch (error) {
    return { reaction: null, error };
  }
};

export const getPostReactions = async (postId: string): Promise<Reaction[]> => {
  try {
    const { data, error } = await supabase
      .from('reactions')
      .select(`
        *,
        user:users(*)
      `)
      .eq('post_id', postId)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching reactions:', error);
      return [];
    }
    
    return data || [];
  } catch (error) {
    console.error('Error fetching reactions:', error);
    return [];
  }
};

export const deleteReaction = async (reactionId: string): Promise<{ error: any }> => {
  const { error } = await supabase
    .from('reactions')
    .delete()
    .eq('id', reactionId);
  
  return { error };
};

