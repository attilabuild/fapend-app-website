# 🔌 Backend Integration Guide

Your BeHigh app now has a complete Supabase backend implementation! This guide explains how everything works.

## 📁 Project Structure

```
behigh/
├── src/
│   ├── api/              # API service layer
│   │   ├── index.ts      # Central exports
│   │   ├── auth.ts       # Authentication API
│   │   ├── posts.ts      # Posts CRUD
│   │   ├── friends.ts    # Friends system
│   │   ├── chat.ts       # Messaging
│   │   └── journal.ts    # Journal entries
│   ├── services/
│   │   └── supabase.ts   # Supabase client config
│   └── types/
│       └── database.types.ts  # TypeScript types
├── supabase-schema.sql   # Complete database schema
├── SUPABASE_SETUP.md     # Setup instructions
└── app.json              # Supabase credentials
```

## 🎯 Current State: DEMO MODE

Your app currently runs in **DEMO MODE** with mock data because Supabase credentials aren't configured yet.

### To Enable Supabase:

1. Follow `SUPABASE_SETUP.md`
2. Add your credentials to `app.json`
3. Restart the app

The app will automatically switch from DEMO MODE to LIVE MODE! ✨

## 🔄 How It Works

### Dual Mode System

```typescript
import { DEMO_MODE, authAPI } from "./src/api";

// All APIs automatically handle both modes
const { user, error } = await authAPI.signUp(email, password, username, name);

// In DEMO MODE: Returns mock data
// In LIVE MODE: Makes real Supabase calls
```

### API Usage Examples

#### Authentication

```typescript
import { authAPI } from "./src/api";

// Sign up
const { user, error } = await authAPI.signUp(
  "user@example.com",
  "password123",
  "cooluser",
  "Cool User"
);

// Sign in
const { user, error } = await authAPI.signIn("user@example.com", "password123");

// Get current user
const { user, error } = await authAPI.getCurrentUser();

// Sign out
await authAPI.signOut();
```

#### Posts

```typescript
import { postsAPI } from "./src/api";

// Get feed posts
const { posts, error } = await postsAPI.getFeedPosts();

// Create post (with photo upload)
const frontUrl = await postsAPI.uploadPhoto(
  frontPhotoUri,
  "posts",
  `${userId}_front_${Date.now()}.jpg`
);
const backUrl = await postsAPI.uploadPhoto(
  backPhotoUri,
  "posts",
  `${userId}_back_${Date.now()}.jpg`
);
const { post, error } = await postsAPI.createPost(
  frontUrl,
  backUrl,
  isLate,
  location
);

// Add reaction
await postsAPI.addReaction(postId, "🔥");
```

#### Friends

```typescript
import { friendsAPI } from "./src/api";

// Get friends
const { friends, error } = await friendsAPI.getFriends();

// Search users
const { users, error } = await friendsAPI.searchUsers("john");

// Send friend request
await friendsAPI.sendFriendRequest(userId);

// Accept request
await friendsAPI.acceptFriendRequest(friendshipId);

// Get friend requests
const { requests, error } = await friendsAPI.getFriendRequests();
```

#### Chat

```typescript
import { chatAPI } from "./src/api";

// Get messages with a friend
const { messages, error } = await chatAPI.getMessages(friendId);

// Send message
await chatAPI.sendMessage(friendId, "Hey! What's up?");

// Real-time messages
const subscription = chatAPI.subscribeToMessages(friendId, (newMessage) => {
  console.log("New message:", newMessage);
});

// Cleanup
subscription.unsubscribe();
```

#### Journal

```typescript
import { journalAPI } from "./src/api";

// Get entries
const { entries, error } = await journalAPI.getEntries();

// Create entry
await journalAPI.createEntry(
  "Today was awesome! Went hiking...",
  "2:34",
  audioUrl
);

// Delete entry
await journalAPI.deleteEntry(entryId);
```

## 🔐 Security Features

### Row Level Security (RLS)

All tables have RLS policies that ensure:

- ✅ Users can only see friends' posts
- ✅ Users can only edit their own content
- ✅ Messages are private between sender/receiver
- ✅ Journal entries are completely private

### Authentication

- ✅ Email/password auth
- ✅ Apple Sign In (optional)
- ✅ Secure session management
- ✅ Automatic token refresh

### Data Privacy

- ✅ Encrypted connections (HTTPS)
- ✅ Secure password hashing
- ✅ JWT-based authentication
- ✅ Private storage buckets for sensitive data

## 📊 Database Schema

### Tables

| Table             | Purpose                   |
| ----------------- | ------------------------- |
| `users`           | User profiles             |
| `posts`           | Daily moment posts        |
| `reactions`       | Emoji reactions on posts  |
| `friendships`     | Friend relationships      |
| `chat_messages`   | Direct messages           |
| `journal_entries` | Voice journal entries     |
| `daily_moments`   | Notification tracking     |

### Storage Buckets

| Bucket      | Access  | Purpose              |
| ----------- | ------- | -------------------- |
| `posts`     | Public  | Post photos          |
| `reactions` | Public  | Reaction selfies     |
| `profiles`  | Public  | Profile pictures     |
| `journal`   | Private | Voice recordings     |

## 🔄 Real-time Features

Supabase provides real-time subscriptions out of the box!

### Example: Live Chat

```typescript
// Subscribe to new messages
const channel = supabase
  .channel("chat-room")
  .on(
    "postgres_changes",
    {
      event: "INSERT",
      schema: "public",
      table: "chat_messages",
    },
    (payload) => {
      console.log("New message:", payload.new);
      // Update UI with new message
    }
  )
  .subscribe();

// Cleanup
channel.unsubscribe();
```

## 🚀 Migration from DEMO to LIVE

### Step 1: Setup Supabase

Follow `SUPABASE_SETUP.md` completely

### Step 2: Update Credentials

Edit `app.json`:

```json
{
  "expo": {
    "extra": {
      "supabaseUrl": "https://your-project.supabase.co",
      "supabaseAnonKey": "your-actual-anon-key"
    }
  }
}
```

### Step 3: Test Authentication

```bash
npx expo start --clear
```

Create a test account and verify:

- ✅ User appears in Supabase dashboard
- ✅ Console shows "✅ Supabase client initialized"
- ✅ No DEMO MODE warnings

### Step 4: Test Each Feature

1. **Posts**: Upload a photo
2. **Friends**: Send/accept friend request
3. **Chat**: Send a message
4. **Journal**: Create an entry

Check Supabase dashboard to verify data is saved!

## 🎨 Customization

### Adding New Features

1. **Create Type** in `src/types/database.types.ts`
2. **Add Table** in `supabase-schema.sql`
3. **Create API** in `src/api/your-feature.ts`
4. **Export** in `src/api/index.ts`

### Example: Adding Comments

```typescript
// 1. Add type
export interface Comment {
  id: string;
  post_id: string;
  user_id: string;
  text: string;
  created_at: string;
}

// 2. Create API
export const commentsAPI = {
  getComments: async (postId: string) => {
    // ... implementation
  },
  addComment: async (postId: string, text: string) => {
    // ... implementation
  },
};

// 3. Run SQL to create table
CREATE TABLE comments (
  id UUID PRIMARY KEY,
  post_id UUID REFERENCES posts,
  user_id UUID REFERENCES users,
  text TEXT NOT NULL
);
```

## 📈 Performance Tips

### Optimize Queries

```typescript
// ❌ Bad: Loads all posts
const { data } = await supabase.from("posts").select("*");

// ✅ Good: Only today's posts with pagination
const { data } = await supabase
  .from("posts")
  .select("*, user(*)")
  .gte("created_at", today)
  .order("created_at", { ascending: false })
  .limit(20);
```

### Image Optimization

```typescript
// Compress images before upload
import { manipulateAsync, SaveFormat } from "expo-image-manipulator";

const compressed = await manipulateAsync(uri, [{ resize: { width: 1080 } }], {
  compress: 0.7,
  format: SaveFormat.JPEG,
});

await postsAPI.uploadPhoto(compressed.uri, "posts", filename);
```

## 🐛 Debugging

### Check DEMO MODE

```typescript
import { DEMO_MODE } from "./src/api";

console.log("Running in:", DEMO_MODE ? "DEMO MODE" : "LIVE MODE");
```

### Enable Supabase Logging

```typescript
// In src/services/supabase.ts
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    // ... config
  },
  global: {
    headers: {
      "X-Client-Info": "behigh-app",
    },
  },
});
```

Then check logs in Supabase Dashboard → Logs

## 📚 Resources

- [Supabase Docs](https://supabase.com/docs)
- [React Native Guide](https://supabase.com/docs/guides/getting-started/tutorials/with-expo-react-native)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
- [Realtime](https://supabase.com/docs/guides/realtime)

## 🆘 Support

Having issues? Check:

1. **SUPABASE_SETUP.md** - Step-by-step setup guide
2. **Console logs** - Look for error messages
3. **Supabase Dashboard** - Check logs and database
4. **GitHub Issues** - Search for similar problems

---

**🎉 Your app is production-ready!**

With Supabase, you get:

- ✅ Scalable infrastructure
- ✅ Real-time capabilities
- ✅ Built-in authentication
- ✅ Automatic backups
- ✅ Free tier (generous limits)
- ✅ Easy deployment

**Happy building! 🚀**

