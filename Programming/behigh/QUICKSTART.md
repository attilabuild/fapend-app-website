# Quick Start Guide - BeReal Clone

Get the app running in 5 minutes!

## Prerequisites

- Node.js 18+ installed
- Xcode (for iOS Simulator)
- A Supabase account (free tier is fine)

## Step 1: Install Dependencies (30 seconds)

```bash
cd behigh
npm install
```

## Step 2: Set Up Supabase (2 minutes)

### 2.1 Create Project
1. Go to [supabase.com](https://supabase.com)
2. Click "New Project"
3. Name it `bereal-clone`
4. Save the password!

### 2.2 Run Database Schema
1. In Supabase dashboard, go to SQL Editor
2. Copy entire SQL from `src/services/supabase.ts` (lines 11-120)
3. Paste and click "Run"

### 2.3 Create Storage Buckets
1. Go to Storage
2. Create 3 public buckets:
   - `posts`
   - `reactions`
   - `profiles`

### 2.4 Get API Keys
1. Go to Settings → API
2. Copy:
   - Project URL
   - `anon` `public` key

## Step 3: Configure App (30 seconds)

Edit `src/services/supabase.ts`:

```typescript
const SUPABASE_URL = 'paste-your-url-here';
const SUPABASE_ANON_KEY = 'paste-your-key-here';
```

## Step 4: Run the App (30 seconds)

```bash
npm start
```

Press `i` for iOS simulator

## Step 5: Test It Out! (1 minute)

1. App opens → Click "Sign Up"
2. Create account:
   - Full Name: Test User
   - Username: testuser
   - Email: test@example.com
   - Password: test123
3. Grant camera & notification permissions
4. You'll see "Time to BeReal" screen
5. Click "Capture Now"
6. Take back photo (tap white circle)
7. Take front photo (selfie)
8. Click "Post"
9. Feed shows your post!

## Create Multiple Test Users

To test friends features:

1. Sign out (Profile → Sign Out)
2. Sign up again with different email
3. Go to Friends → Search
4. Search for first user
5. Send friend request
6. Sign out, log back in as first user
7. Friends → Requests → Accept
8. Now both users see each other's posts!

## Common Issues

### "Camera permission denied"
- Go to Settings → Privacy → Camera
- Enable for Expo Go

### "Can't see friend's posts"
- Make sure you're friends (accepted request)
- Make sure friend posted today
- Pull down to refresh

### "Upload failed"
- Check Supabase credentials
- Verify storage buckets are public
- Check network connection

## Project Structure

```
src/
├── api/          # Backend calls
├── components/   # UI components
├── hooks/        # Custom hooks
├── navigation/   # Navigation setup
├── screens/      # App screens
├── services/     # External services
├── store/        # State management
├── types/        # TypeScript types
└── utils/        # Helper functions
```

## Key Files

- `App.tsx` - App entry point
- `src/navigation/AppNavigator.tsx` - Navigation root
- `src/store/useStore.ts` - Global state
- `src/services/supabase.ts` - Database config

## Next Steps

- Read `README.md` for full documentation
- Check `FEATURES.md` for feature details
- Review `ARCHITECTURE.md` for system design
- Follow `SETUP_GUIDE.md` for production setup

## Development Commands

```bash
# Start dev server
npm start

# Run on iOS
npm run ios

# Run on Android
npm run android

# Clear cache
npm start -c
```

## Need Help?

1. Check existing docs (README, SETUP_GUIDE, etc.)
2. Review Supabase dashboard for errors
3. Check Expo logs in terminal
4. Verify all dependencies installed

---

**That's it! You're ready to build! 🚀**

