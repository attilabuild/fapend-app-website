# BeReal Clone - React Native iOS App

A full-featured BeReal clone built with React Native (Expo) for iOS, replicating the core functionality and UX flow of the BeReal app with extremely high fidelity.

## 🎯 Features

### Core Functionality
- ✅ **Daily Moment Notifications** - Random time each day (9 AM - 11 PM)
- ✅ **Post-Before-View Enforcement** - Must post before seeing friends' feed
- ✅ **Dual Camera Capture** - Front and back camera photos in one flow
- ✅ **2-Minute Timer** - Visual countdown for posting window
- ✅ **Late Post Detection** - Automatically marks posts made after timer
- ✅ **Friends-Only Feed** - No global explore, only friends' posts
- ✅ **Friend System** - Add, accept/decline requests, search users
- ✅ **RealMoji Reactions** - React to posts with selfie emojis (long press)
- ✅ **14-Day Post History** - View your last 14 days of moments
- ✅ **Profile & Stats** - User profile with on-time/late stats

## 🛠 Tech Stack

- **Frontend**: React Native (Expo)
- **Backend**: Supabase (Auth, Database, Storage)
- **State Management**: Zustand
- **Navigation**: React Navigation
- **Camera**: Expo Camera
- **Notifications**: Expo Notifications
- **Styling**: Tailwind CSS (NativeWind)
- **Language**: TypeScript

## 📁 Project Structure

```
behigh/
├── src/
│   ├── api/              # API layer for all backend calls
│   │   ├── auth.ts       # Authentication functions
│   │   ├── posts.ts      # Post CRUD operations
│   │   ├── friends.ts    # Friend management
│   │   └── reactions.ts  # RealMoji reactions
│   ├── components/       # Reusable UI components
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   ├── PostCard.tsx
│   │   ├── PostDetail.tsx
│   │   ├── Timer.tsx
│   │   ├── FriendRequestCard.tsx
│   │   └── LoadingScreen.tsx
│   ├── navigation/       # Navigation structure
│   │   ├── AppNavigator.tsx
│   │   ├── AuthStack.tsx
│   │   └── MainTabs.tsx
│   ├── screens/          # App screens
│   │   ├── LoginScreen.tsx
│   │   ├── SignupScreen.tsx
│   │   ├── FeedScreen.tsx
│   │   ├── CameraScreen.tsx
│   │   ├── FriendsScreen.tsx
│   │   ├── ProfileScreen.tsx
│   │   └── RealmojiCameraScreen.tsx
│   ├── services/         # External services
│   │   ├── supabase.ts
│   │   └── notifications.ts
│   ├── store/            # Zustand state management
│   │   └── useStore.ts
│   ├── types/            # TypeScript type definitions
│   │   └── index.ts
│   └── utils/            # Utility functions
│       ├── dateUtils.ts
│       └── imageUtils.ts
├── App.tsx              # Main app entry
├── app.json             # Expo configuration
├── package.json         # Dependencies
└── README.md
```

## 🚀 Getting Started

### Prerequisites

- Node.js (v18+)
- npm or yarn
- Expo CLI: `npm install -g expo-cli`
- iOS Simulator (Xcode) or physical iOS device
- Supabase account

### Installation

1. **Clone and install dependencies**
   ```bash
   cd behigh
   npm install
   ```

2. **Set up Supabase**

   a. Create a new project at [supabase.com](https://supabase.com)
   
   b. Run the SQL schema from `src/services/supabase.ts` in your Supabase SQL editor
   
   c. Create storage buckets:
      - `posts` (public)
      - `reactions` (public)
      - `profiles` (public)
   
   d. Update Supabase credentials in `src/services/supabase.ts`:
      ```typescript
      const SUPABASE_URL = 'your-project-url';
      const SUPABASE_ANON_KEY = 'your-anon-key';
      ```

3. **Configure Push Notifications**
   
   Update `app.json` with your EAS project ID:
   ```json
   "extra": {
     "eas": {
       "projectId": "your-eas-project-id"
     }
   }
   ```

4. **Run the app**
   ```bash
   npm start
   ```
   
   Then press `i` for iOS simulator

## 🔑 Key Features Explained

### Post-Before-View Logic

The app enforces BeReal's signature feature: users MUST post their moment before they can view their friends' feed. This is implemented in `FeedScreen.tsx`:

```typescript
if (!hasPostedToday) {
  // Show camera prompt instead of feed
  return <CameraPrompt />;
}
```

### Dual Camera Capture

The camera flow captures both cameras sequentially:
1. Take back camera photo
2. Automatically switch to front camera
3. Take selfie
4. Preview both photos with front photo overlaid
5. Post or retake

### 2-Minute Timer

A visual countdown timer starts when the notification is sent. Posts made after 2 minutes are marked as "late":

```typescript
const isPostedLate = differenceInMinutes(postTime, momentTime) > 2;
```

### RealMoji Reactions

Long press on any post to react with a selfie emoji. Opens a dedicated camera for capturing your reaction.

### Daily Notifications

Notifications are scheduled at random times between 9 AM and 11 PM. Each user gets their notification at the same time.

## 📱 Screens Overview

### Auth Flow
- **Login** - Email/password authentication
- **Signup** - Create account with username, full name, email, password

### Main App
- **Feed** - View friends' posts (after posting your own)
- **Camera** - Capture dual camera photos with timer
- **Friends** - Manage friends, requests, search users
- **Profile** - View your stats and 14-day history
- **RealMoji Camera** - Capture selfie reactions

## 🎨 Design Philosophy

The app follows BeReal's minimalistic black-and-white design:
- Clean, uncluttered interfaces
- Black buttons and accents
- White backgrounds
- Minimal colors except for photos
- Simple, bold typography

## 🔐 Security & Privacy

- Row Level Security (RLS) enabled on all Supabase tables
- Users can only see posts from accepted friends
- Authentication required for all actions
- Secure image storage with Supabase Storage

## 🐛 Known Limitations

- Daily notifications currently scheduled locally (production would use server-side scheduling)
- No video support (photos only)
- No comments feature (BeReal added this later)
- No discovery/explore page (friends-only by design)
- Location tagging not implemented

## 📦 Database Schema

### Tables
- `users` - User profiles
- `posts` - Daily moment posts
- `reactions` - RealMoji reactions
- `friendships` - Friend relationships
- `daily_moments` - Tracks notification times

See `src/services/supabase.ts` for complete schema with RLS policies.

## 🚀 Building for Production

### iOS

1. Configure EAS Build:
   ```bash
   npm install -g eas-cli
   eas build:configure
   ```

2. Build for iOS:
   ```bash
   eas build --platform ios
   ```

3. Submit to App Store:
   ```bash
   eas submit --platform ios
   ```

## 🤝 Contributing

This is a portfolio project demonstrating full-stack mobile development skills. Feel free to fork and customize!

## 📄 License

MIT License - feel free to use this code for learning purposes.

## ⚠️ Disclaimer

This is a clone project for educational purposes. BeReal is a trademark of BeReal. This project is not affiliated with or endorsed by BeReal.

---

**Built with ❤️ using React Native, Expo, and Supabase**
