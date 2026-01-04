# BeReal Clone - Feature Documentation

## Complete Feature List

### ✅ Authentication System
- **Sign Up**: Create account with email, password, username, and full name
- **Login**: Email/password authentication
- **Sign Out**: Secure logout with confirmation
- **Session Management**: Persistent sessions using AsyncStorage
- **User Profiles**: Each user has username, full name, and optional profile picture

### ✅ Daily Moment System

#### Notification Flow
- **Random Time Scheduling**: Notifications sent at random time between 9 AM - 11 PM
- **Daily Uniqueness**: Each day gets a new random notification time
- **Push Notifications**: iOS push notifications with Expo Notifications
- **Local Scheduling**: Notifications scheduled locally (production would use server-side)

#### 2-Minute Timer
- **Visual Countdown**: Live timer showing minutes:seconds remaining
- **Color Coding**: 
  - Black: Normal (>30 seconds)
  - Orange: Warning (<30 seconds)
  - Red: Expired (0 seconds)
- **Late Post Detection**: Automatic marking if posted after 2 minutes

### ✅ Camera & Photo Capture

#### Dual Camera Flow
1. **Back Camera First**: Capture main environment photo
2. **Auto Switch**: Automatically switches to front camera
3. **Front Camera Second**: Capture selfie
4. **Preview Mode**: Review both photos before posting
5. **Retake Option**: Can retake both photos

#### Camera Features
- **Permission Handling**: Graceful permission requests
- **Step Indicators**: Visual dots showing capture progress
- **Instructions**: Clear on-screen guidance
- **High Quality**: 0.8 quality JPEG compression
- **Image Upload**: Automatic upload to Supabase Storage

### ✅ Post-Before-View Enforcement

#### The Core BeReal Feature
- **Forced Camera Prompt**: Users see camera prompt instead of feed
- **No Feed Access**: Cannot view friends' posts until they post
- **Daily Reset**: Enforcement resets each day
- **Visual Messaging**: Clear explanation of why they need to post

#### Feed Access
- **Automatic Unlock**: Feed becomes accessible immediately after posting
- **Same-Day Posts**: Only shows posts from current day
- **Friends Only**: No global explore, only accepted friends

### ✅ Feed System

#### Post Display
- **Card Layout**: Clean card-based design
- **Dual Photo Display**: 
  - Main photo (back camera) full size
  - Selfie overlay (front camera) in top-left corner
- **User Info**: Username and profile picture header
- **Time Display**: "On time" or relative time
- **Late Badge**: Visual indicator for late posts

#### Interactions
- **Tap to Expand**: Full-screen post detail view
- **Long Press**: Trigger RealMoji reaction camera
- **Pull to Refresh**: Reload feed
- **Reaction Preview**: Show first 3 RealMojis on card

#### Post Detail Modal
- **Full Screen View**: Immersive black background
- **Photo Display**: Large photo with selfie overlay
- **All Reactions**: Grid view of all RealMojis
- **User Info**: Who reacted with their usernames

### ✅ Friend System

#### Three-Tab Interface
1. **Friends Tab**: List of accepted friends
2. **Requests Tab**: Pending friend requests
3. **Search Tab**: Find new friends

#### Friend Management
- **Search by Username**: Real-time search with debouncing
- **Send Request**: One-tap friend request
- **Accept/Decline**: Manage incoming requests
- **Status Checking**: Prevents duplicate requests
- **Remove Friends**: (Backend supported, UI can be added)

#### Friend Request Flow
1. User A searches for User B
2. User A sends friend request
3. User B sees request in "Requests" tab
4. User B accepts or declines
5. If accepted, both users see each other's posts

### ✅ RealMoji Reaction System

#### Selfie Emoji Reactions
- **Long Press Trigger**: Hold on post for 0.5 seconds
- **Dedicated Camera**: Special selfie-only camera
- **Circular Frame**: Visual guide for composition
- **Preview**: Review reaction before sending
- **One Per Post**: Replace existing reaction (upsert)

#### Reaction Display
- **On Post Card**: Show up to 3 reaction avatars
- **Counter**: "+" indicator for additional reactions
- **In Detail View**: Full grid of all reactions
- **User Attribution**: Shows who reacted

### ✅ Profile System

#### User Profile Display
- **Profile Picture**: Large circular avatar
- **Username & Full Name**: Identity display
- **Statistics**:
  - Total moments posted
  - On-time posts count
  - Late posts count

#### 14-Day Post History
- **Grid Layout**: 3 columns of thumbnails
- **Date Badges**: Day posted on each thumbnail
- **Late Indicators**: "L" badge on late posts
- **Mini Preview**: Front camera thumbnail overlay
- **Tap to View**: (Can expand to detail view)

#### Settings Section
- **Notifications**: (Placeholder for settings)
- **Privacy**: (Placeholder for settings)
- **Account**: (Placeholder for settings)
- **About**: (Placeholder for settings)
- **Sign Out**: Secure logout with confirmation

### ✅ State Management (Zustand)

#### Global State
- **User**: Current logged-in user
- **hasPostedToday**: Boolean flag for post status
- **todaysMomentTime**: Time notification was sent
- **feedPosts**: Array of today's posts
- **friends**: User's friends list
- **friendRequests**: Pending requests
- **frontPhoto/backPhoto**: Temporary photo storage
- **myPostHistory**: Last 14 days of posts

### ✅ Backend Integration (Supabase)

#### Database Tables
- **users**: User profiles and metadata
- **posts**: All moment posts with photos
- **reactions**: RealMoji reactions
- **friendships**: Friend relationships
- **daily_moments**: Notification scheduling

#### Storage Buckets
- **posts**: Front and back camera photos
- **reactions**: RealMoji selfies
- **profiles**: Profile pictures

#### Row Level Security
- **View Protection**: Users only see friends' data
- **Write Protection**: Users only modify own data
- **Friend Validation**: Post visibility based on friendship status

### ✅ Navigation

#### Auth Stack
- Login Screen
- Signup Screen

#### Main App Stack
- **Bottom Tabs**:
  - Feed Tab
  - Friends Tab
  - Profile Tab
- **Modal Screens**:
  - Camera Screen (fullScreenModal)
  - RealMoji Camera Screen (fullScreenModal)

### ✅ UI/UX Design

#### Design System
- **Color Scheme**: 
  - Black (#000000) for primary actions
  - White (#FFFFFF) for backgrounds
  - Gray scales for secondary elements
- **Typography**: Bold for headings, regular for body
- **Spacing**: Consistent padding (4, 6, 8, 12, 16, 24px)
- **Border Radius**: Rounded corners (8, 12, 16, 24px)

#### Interactions
- **Haptic Feedback**: (Can be added)
- **Loading States**: Spinners and disabled states
- **Error Handling**: Alerts for user feedback
- **Smooth Animations**: Native feeling transitions

### ✅ Utilities & Helpers

#### Date Utilities
- Format post times
- Calculate if posted late
- Get today's date range
- Timer countdown logic
- Format timer display

#### Image Utilities
- Image compression before upload
- Upload to Supabase Storage
- Generate random notification times
- Fetch image to blob for upload

### ✅ Security Features

#### Authentication Security
- **Password Hashing**: Handled by Supabase Auth
- **Session Tokens**: Secure JWT tokens
- **Auto Refresh**: Token auto-refresh
- **Secure Storage**: AsyncStorage for session

#### Data Privacy
- **Friends Only**: No public posts
- **Row Level Security**: Database-level access control
- **Secure Image URLs**: Public URLs only for authorized users

### 🚧 Future Enhancements (Not Implemented)

#### Potential Features
- **Comments**: Add comments on posts
- **Discovery**: Explore/discover new users
- **Video Support**: Record video moments
- **Location Tagging**: Add location to posts
- **Memories**: "On this day" notifications
- **Story Sharing**: Share to Instagram/Snapchat
- **Dark Mode**: Theme switching
- **Multiple Photos**: Retake limits (3x like BeReal)
- **Group RealMojis**: React with friends
- **Post Analytics**: View count, reaction analytics

## Technical Implementation Details

### Performance Optimizations
- **Image Compression**: 80% JPEG quality
- **Lazy Loading**: Posts load on demand
- **Efficient Queries**: Indexed database queries
- **Optimistic Updates**: Instant UI feedback

### Error Handling
- **Network Errors**: Graceful fallbacks
- **Camera Errors**: Permission handling
- **Upload Errors**: Retry logic
- **Auth Errors**: Clear error messages

### Code Quality
- **TypeScript**: Full type safety
- **Component Reusability**: Shared components
- **Clean Architecture**: Separation of concerns
- **Comments**: Critical behaviors documented

---

**This feature set replicates BeReal's core UX with extremely high fidelity while using original implementation and design.**

