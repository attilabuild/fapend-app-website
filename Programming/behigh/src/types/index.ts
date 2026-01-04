// Core type definitions for BeReal clone

export interface User {
  id: string;
  username: string;
  full_name: string;
  profile_picture_url?: string;
  created_at: string;
  push_token?: string;
}

export interface Post {
  id: string;
  user_id: string;
  front_camera_url: string;
  back_camera_url: string;
  created_at: string;
  posted_late: boolean;
  moment_time: string; // The time the notification was sent
  location?: string;
  user?: User;
  reactions?: Reaction[];
}

export interface Reaction {
  id: string;
  post_id: string;
  user_id: string;
  emoji_image_url: string;
  created_at: string;
  user?: User;
}

export interface Friendship {
  id: string;
  user_id: string;
  friend_id: string;
  status: 'pending' | 'accepted' | 'declined';
  created_at: string;
  friend?: User;
}

export interface MomentNotification {
  id: string;
  sent_at: string;
  expires_at: string; // 2 minutes after sent_at
}

export interface DailyMoment {
  id: string;
  date: string;
  notification_time: string;
}

