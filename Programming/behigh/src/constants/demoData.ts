// Demo Users
export const DEMO_USERS = [
  { id: 1, name: 'John Doe', username: '@johndoe', avatar: 'https://i.pravatar.cc/150?img=1', isFollowing: true },
  { id: 2, name: 'Jane Smith', username: '@janesmith', avatar: 'https://i.pravatar.cc/150?img=2', isFollowing: false },
  { id: 3, name: 'Mike Johnson', username: '@mikej', avatar: 'https://i.pravatar.cc/150?img=3', isFollowing: true },
  { id: 4, name: 'Sarah Wilson', username: '@sarahw', avatar: 'https://i.pravatar.cc/150?img=4', isFollowing: false },
  { id: 5, name: 'David Brown', username: '@davidb', avatar: 'https://i.pravatar.cc/150?img=5', isFollowing: true },
];

// Demo Posts
export const DEMO_POSTS = [
  {
    id: 1,
    user: DEMO_USERS[0],
    mainPhoto: 'https://picsum.photos/400/600?random=1',
    selfiePhoto: 'https://i.pravatar.cc/100?img=1',
    postedAt: '2h ago',
    location: 'San Francisco, CA',
    isLate: false,
    reactions: [
      { userId: 2, emoji: '🔥', username: '@janesmith' },
      { userId: 3, emoji: '❤️', username: '@mikej' },
    ],
  },
  {
    id: 2,
    user: DEMO_USERS[2],
    mainPhoto: 'https://picsum.photos/400/600?random=2',
    selfiePhoto: 'https://i.pravatar.cc/100?img=3',
    postedAt: '4h ago',
    location: 'New York, NY',
    isLate: true,
    reactions: [
      { userId: 1, emoji: '👍', username: '@johndoe' },
    ],
  },
  {
    id: 3,
    user: DEMO_USERS[4],
    mainPhoto: 'https://picsum.photos/400/600?random=3',
    selfiePhoto: 'https://i.pravatar.cc/100?img=5',
    postedAt: '6h ago',
    location: 'Los Angeles, CA',
    isLate: false,
    reactions: [],
  },
];

// Demo Products
export const DEMO_PRODUCTS = [
  {
    id: 1,
    name: 'Premium Water Bottle',
    image: require('../../assets/bongs.jpg'),
    price: '$29.99',
  },
  {
    id: 2,
    name: 'Deluxe Set',
    image: require('../../assets/bongs.jpg'),
    price: '$49.99',
  },
  {
    id: 3,
    name: 'Starter Pack',
    image: require('../../assets/bongs.jpg'),
    price: '$19.99',
  },
];

// Demo Friends (My Friends)
export const MY_FRIENDS = [
  DEMO_USERS[0],
  DEMO_USERS[2],
  DEMO_USERS[4],
];

// Demo Popular Users
export const POPULAR_USERS = [
  DEMO_USERS[1],
  DEMO_USERS[3],
];

// Journal Entries
export const DEMO_JOURNAL_ENTRIES = [
  { 
    id: 1, 
    title: 'Morning Thoughts', 
    date: '2025-11-20', 
    duration: '2:34', 
    preview: 'Had a great morning session...', 
    transcript: 'This morning I woke up feeling refreshed and ready to take on the day. The weather was perfect, and I took some time to meditate and plan my goals.' 
  },
  { 
    id: 2, 
    title: 'Evening Reflection', 
    date: '2025-11-19', 
    duration: '1:45', 
    preview: 'Reflecting on today...', 
    transcript: 'Today was productive. I accomplished most of my tasks and spent quality time with friends. Feeling grateful for the small wins.' 
  },
  { 
    id: 3, 
    title: 'Weekend Plans', 
    date: '2025-11-18', 
    duration: '3:12', 
    preview: 'Planning for the weekend...', 
    transcript: 'Excited about this weekend. Planning to visit the new art gallery downtown and catch up with old friends over brunch.' 
  },
];

// Onboarding Options
export const INTERESTS_OPTIONS = [
  { id: 'art', label: '🎨 Art & Design', icon: 'palette-outline' },
  { id: 'music', label: '🎵 Music', icon: 'musical-notes-outline' },
  { id: 'fitness', label: '💪 Fitness & Health', icon: 'fitness-outline' },
  { id: 'travel', label: '✈️ Travel', icon: 'airplane-outline' },
  { id: 'food', label: '🍔 Food & Cooking', icon: 'restaurant-outline' },
  { id: 'tech', label: '💻 Technology', icon: 'laptop-outline' },
  { id: 'photography', label: '📷 Photography', icon: 'camera-outline' },
  { id: 'reading', label: '📚 Reading', icon: 'book-outline' },
];

export const EXPERIENCE_OPTIONS = [
  { id: 'beginner', label: 'Just Started', description: 'New to the community' },
  { id: 'intermediate', label: 'Regular User', description: 'Using for a few months' },
  { id: 'advanced', label: 'Expert', description: 'Long-time community member' },
];

export const NOTIFICATION_OPTIONS = [
  { id: 'friends', label: 'Friend Requests', description: 'When someone wants to connect' },
  { id: 'moments', label: 'New Moments', description: 'When friends post' },
  { id: 'journal', label: 'Journal Reminders', description: 'Daily reflection prompts' },
  { id: 'shop', label: 'Shop Updates', description: 'New products and deals' },
];
