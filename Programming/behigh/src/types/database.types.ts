export interface User {
  id: string;
  username: string;
  full_name: string;
  profile_picture_url?: string;
  push_token?: string;
  created_at: string;
}

export interface Post {
  id: string;
  user_id: string;
  front_camera_url: string;
  back_camera_url: string;
  posted_late: boolean;
  moment_time: string;
  location?: string;
  created_at: string;
  user?: User;
  reactions?: Reaction[];
}

export interface Reaction {
  id: string;
  post_id: string;
  user_id: string;
  emoji: string;
  created_at: string;
  user?: User;
}

export interface Friendship {
  id: string;
  user_id: string;
  friend_id: string;
  status: 'pending' | 'accepted' | 'declined';
  created_at: string;
  user?: User;
  friend?: User;
}

export interface ChatMessage {
  id: string;
  sender_id: string;
  receiver_id: string;
  message: string;
  read: boolean;
  created_at: string;
  sender?: User;
}

export interface JournalEntry {
  id: string;
  user_id: string;
  text: string;
  duration: string;
  audio_url?: string;
  created_at: string;
}

export interface DailyMoment {
  id: string;
  date: string;
  notification_time: string;
}

