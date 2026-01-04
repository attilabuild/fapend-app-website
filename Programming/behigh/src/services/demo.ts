// Demo mode - disable Supabase and use mock data
export const DEMO_MODE = true;

// Mock user data
export const DEMO_USER = {
  id: 'demo-user-1',
  username: 'demouser',
  full_name: 'Demo User',
  profile_picture_url: undefined,
  created_at: new Date().toISOString(),
};

// Mock friend data
export const DEMO_FRIENDS = [
  {
    id: 'friend-1',
    username: 'johndoe',
    full_name: 'John Doe',
    profile_picture_url: undefined,
    created_at: new Date().toISOString(),
  },
  {
    id: 'friend-2',
    username: 'janedoe',
    full_name: 'Jane Doe',
    profile_picture_url: undefined,
    created_at: new Date().toISOString(),
  },
];

// Mock posts data
export const DEMO_POSTS = [
  {
    id: 'post-1',
    user_id: 'friend-1',
    front_camera_url: 'https://picsum.photos/400/600?random=1',
    back_camera_url: 'https://picsum.photos/1080/1440?random=2',
    created_at: new Date().toISOString(),
    posted_late: false,
    moment_time: new Date().toISOString(),
    user: DEMO_FRIENDS[0],
    reactions: [],
  },
  {
    id: 'post-2',
    user_id: 'friend-2',
    front_camera_url: 'https://picsum.photos/400/600?random=3',
    back_camera_url: 'https://picsum.photos/1080/1440?random=4',
    created_at: new Date().toISOString(),
    posted_late: true,
    moment_time: new Date(Date.now() - 10 * 60 * 1000).toISOString(), // 10 mins ago
    user: DEMO_FRIENDS[1],
    reactions: [],
  },
];

// Mock post history
export const DEMO_POST_HISTORY = Array.from({ length: 7 }, (_, i) => ({
  id: `history-${i}`,
  user_id: 'demo-user-1',
  front_camera_url: `https://picsum.photos/400/600?random=${i + 10}`,
  back_camera_url: `https://picsum.photos/1080/1440?random=${i + 20}`,
  created_at: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString(),
  posted_late: i % 3 === 0,
  moment_time: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString(),
}));

