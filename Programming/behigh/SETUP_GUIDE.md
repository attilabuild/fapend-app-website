# BeReal Clone - Complete Setup Guide

This guide will walk you through setting up the BeReal clone from scratch.

## Step 1: Supabase Setup

### 1.1 Create Supabase Project

1. Go to [supabase.com](https://supabase.com) and create an account
2. Click "New Project"
3. Fill in project details:
   - Name: `bereal-clone`
   - Database Password: (save this securely)
   - Region: Choose closest to you

### 1.2 Set Up Database Schema

1. In your Supabase project, go to SQL Editor
2. Copy and paste the following SQL:

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (extends Supabase auth.users)
CREATE TABLE public.users (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  profile_picture_url TEXT,
  push_token TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Posts table
CREATE TABLE public.posts (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.users ON DELETE CASCADE NOT NULL,
  front_camera_url TEXT NOT NULL,
  back_camera_url TEXT NOT NULL,
  posted_late BOOLEAN DEFAULT false,
  moment_time TIMESTAMPTZ NOT NULL,
  location TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Reactions table (RealMoji)
CREATE TABLE public.reactions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  post_id UUID REFERENCES public.posts ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.users ON DELETE CASCADE NOT NULL,
  emoji_image_url TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(post_id, user_id)
);

-- Friendships table
CREATE TABLE public.friendships (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.users ON DELETE CASCADE NOT NULL,
  friend_id UUID REFERENCES public.users ON DELETE CASCADE NOT NULL,
  status TEXT CHECK (status IN ('pending', 'accepted', 'declined')) DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, friend_id)
);

-- Daily moments table (tracks notification times)
CREATE TABLE public.daily_moments (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  date DATE UNIQUE NOT NULL,
  notification_time TIMESTAMPTZ NOT NULL
);

-- Indexes for performance
CREATE INDEX idx_posts_user_id ON public.posts(user_id);
CREATE INDEX idx_posts_created_at ON public.posts(created_at);
CREATE INDEX idx_reactions_post_id ON public.reactions(post_id);
CREATE INDEX idx_friendships_user_id ON public.friendships(user_id);
CREATE INDEX idx_friendships_friend_id ON public.friendships(friend_id);

-- Row Level Security (RLS) Policies
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.friendships ENABLE ROW LEVEL SECURITY;

-- Users policies
CREATE POLICY "Users can view all users" ON public.users FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON public.users FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON public.users FOR INSERT WITH CHECK (auth.uid() = id);

-- Posts policies
CREATE POLICY "Users can view friends' posts" ON public.posts FOR SELECT USING (
  user_id = auth.uid() OR 
  EXISTS (
    SELECT 1 FROM public.friendships 
    WHERE (user_id = auth.uid() AND friend_id = public.posts.user_id AND status = 'accepted')
    OR (friend_id = auth.uid() AND user_id = public.posts.user_id AND status = 'accepted')
  )
);
CREATE POLICY "Users can insert own posts" ON public.posts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own posts" ON public.posts FOR DELETE USING (auth.uid() = user_id);

-- Reactions policies
CREATE POLICY "Users can view reactions on visible posts" ON public.reactions FOR SELECT USING (true);
CREATE POLICY "Users can add reactions" ON public.reactions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own reactions" ON public.reactions FOR DELETE USING (auth.uid() = user_id);

-- Friendships policies
CREATE POLICY "Users can view own friendships" ON public.friendships FOR SELECT USING (
  user_id = auth.uid() OR friend_id = auth.uid()
);
CREATE POLICY "Users can create friendships" ON public.friendships FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update friendships they're part of" ON public.friendships FOR UPDATE USING (
  user_id = auth.uid() OR friend_id = auth.uid()
);
```

3. Click "Run" to execute

### 1.3 Set Up Storage Buckets

1. Go to Storage in your Supabase dashboard
2. Create three public buckets:
   - `posts`
   - `reactions`
   - `profiles`

For each bucket:
- Click "New Bucket"
- Enter bucket name
- Set as "Public bucket"
- Click "Create bucket"

### 1.4 Get API Credentials

1. Go to Project Settings > API
2. Copy:
   - Project URL (e.g., `https://xxx.supabase.co`)
   - `anon` `public` key

## Step 2: Configure the App

### 2.1 Update Supabase Credentials

Edit `src/services/supabase.ts`:

```typescript
const SUPABASE_URL = 'your-project-url-here';
const SUPABASE_ANON_KEY = 'your-anon-key-here';
```

### 2.2 Set Up EAS (for Push Notifications)

1. Install EAS CLI:
   ```bash
   npm install -g eas-cli
   ```

2. Login to Expo:
   ```bash
   eas login
   ```

3. Configure EAS:
   ```bash
   eas build:configure
   ```

4. Get your project ID from `app.json` and update it if needed

## Step 3: Run the App

### Development Mode

```bash
npm start
```

Then press `i` to open iOS simulator

### First Time Setup

1. Create an account (Signup screen)
2. The app will request camera and notification permissions
3. Grant all permissions for full functionality

## Step 4: Testing the App

### Create Test Users

1. Create 2-3 test accounts
2. Use different email addresses for each

### Test Friend System

1. Login as User A
2. Go to Friends tab > Search
3. Search for User B's username
4. Send friend request
5. Login as User B
6. Go to Friends tab > Requests
7. Accept the friend request

### Test Daily Moment Flow

1. The app will show "Time to BeReal" prompt
2. Click "Capture Now"
3. Take back camera photo (capture button)
4. Take front camera photo (selfie)
5. Review and post
6. Feed will now be visible

### Test RealMoji Reactions

1. View a friend's post in feed
2. Long press on the post (hold for 0.5s)
3. RealMoji camera will open
4. Capture your reaction selfie
5. Send RealMoji

## Troubleshooting

### Camera Not Working

- Make sure you granted camera permissions
- Try restarting the app
- Check `app.json` has camera plugin configured

### Can't See Friends' Posts

- Make sure you're friends (accepted request)
- Make sure your friend has posted today
- Try pulling down to refresh the feed

### Supabase Errors

- Double check your API credentials
- Verify RLS policies are set up correctly
- Check network connection

### Push Notifications Not Working

- Push notifications only work on physical devices
- Make sure you granted notification permissions
- EAS project ID must be configured in `app.json`

## Production Deployment

### Build for iOS

```bash
eas build --platform ios
```

### Submit to App Store

```bash
eas submit --platform ios
```

Note: You'll need an Apple Developer account ($99/year)

## Environment Variables (Optional)

For production, consider using environment variables:

1. Create `.env` file:
   ```
   SUPABASE_URL=your-url
   SUPABASE_ANON_KEY=your-key
   ```

2. Use `react-native-dotenv` or similar

## Next Steps

- Customize the UI/branding
- Add more features (comments, discovery, etc.)
- Implement server-side notification scheduling
- Add analytics
- Set up crash reporting (Sentry)

## Support

For issues, check:
- Expo documentation: https://docs.expo.dev
- Supabase documentation: https://supabase.com/docs
- React Navigation: https://reactnavigation.org

---

**You're all set! Enjoy your BeReal clone! 📸**

