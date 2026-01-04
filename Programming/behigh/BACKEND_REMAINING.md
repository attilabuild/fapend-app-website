# 🔧 Remaining Backend Tasks (Excluding RevenueCat)

## ✅ What's Already Done

- ✅ Complete database schema
- ✅ All API services (auth, posts, friends, chat, journal, reactions)
- ✅ Row Level Security (RLS) policies
- ✅ Storage buckets configured
- ✅ Image upload working
- ✅ Session persistence

---

## 🎯 Priority 1: Critical for MVP

### 1. Push Notification Token Management ⚠️ **HIGH PRIORITY**

**Current State**: Push tokens may not be stored in database

**What's Needed**:
- Store push tokens in `users.push_token` column (already exists)
- Update token when user logs in
- Update token when it refreshes
- API endpoint to update token

**Time**: 30 minutes  
**Impact**: Required for notifications to work

**Implementation**:
```typescript
// Add to src/api/auth.ts
updatePushToken: async (token: string) => {
  const { user } = await authAPI.getCurrentUser();
  if (!user) return { error: new Error('Not authenticated') };
  
  const { error } = await supabase
    .from('users')
    .update({ push_token: token })
    .eq('id', user.id);
  
  return { error };
}
```

**Update App.tsx**:
```typescript
// After getting notification token:
import * as Notifications from 'expo-notifications';
import { authAPI } from './src/api';

const token = await Notifications.getExpoPushTokenAsync();
await authAPI.updatePushToken(token.data);
```

---

### 2. Server-Side Daily Notification Scheduling ⚠️ **HIGH PRIORITY**

**Current State**: Notifications scheduled client-side only (unreliable)

**What's Needed**:
- Supabase Edge Function or pg_cron to schedule daily notifications
- Generate random time (9 AM - 11 PM) for each day
- Send push notifications to all active users
- Store notification times in `daily_moments` table

**Time**: 2-3 hours  
**Impact**: Critical for BeReal-style daily notifications

**Options**:

**Option A: Supabase Edge Function (Recommended)**
- More flexible
- Easier to debug
- Can use Expo Push Notification API directly

**Option B: pg_cron (Database-level)**
- Runs directly in database
- Simpler setup
- Less flexible

**See**: `BACKEND_ROADMAP.md` for full implementation details

---

## 🎯 Priority 2: Enhanced Features

### 3. Real-Time Subscriptions

**Current State**: Users must manually refresh to see new content

**What's Needed**:
- Real-time updates for new posts
- Real-time friend request notifications
- Real-time chat messages
- Real-time reaction updates

**Time**: 1-2 hours  
**Impact**: Better UX, more engaging

**Implementation**:
```typescript
// Add to src/api/posts.ts
subscribeToNewPosts: (callback: (post: Post) => void) => {
  const channel = supabase
    .channel('posts')
    .on('postgres_changes', {
      event: 'INSERT',
      schema: 'public',
      table: 'posts',
    }, (payload) => {
      callback(payload.new as Post);
    })
    .subscribe();
  
  return () => channel.unsubscribe();
}
```

---

### 4. Post Analytics (Views)

**Current State**: No view tracking

**What's Needed**:
- Track when users view posts
- Store in `post_views` table
- Count views per post

**Time**: 1 hour  
**Impact**: Analytics for engagement

**SQL to Add**:
```sql
CREATE TABLE IF NOT EXISTS public.post_views (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  post_id UUID REFERENCES public.posts ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.users ON DELETE CASCADE NOT NULL,
  viewed_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(post_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_post_views_post_id ON public.post_views(post_id);

ALTER TABLE public.post_views ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own views" ON public.post_views 
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own views" ON public.post_views 
  FOR INSERT WITH CHECK (auth.uid() = user_id);
```

---

## 🎯 Priority 3: Production Readiness

### 5. Error Tracking

**Current State**: Errors only logged to console

**What's Needed**:
- Integrate Sentry or similar
- Log errors to database
- Track API errors
- Monitor performance

**Time**: 1-2 hours  
**Impact**: Better debugging and monitoring

**Implementation**:
- Install Sentry SDK
- Create `errors` table (optional)
- Wrap API calls with error tracking

---

### 6. Rate Limiting

**Current State**: No rate limiting

**What's Needed**:
- API rate limiting
- Prevent abuse
- Protect against spam

**Time**: 1 hour  
**Impact**: Security and stability

**Implementation**:
- Use Supabase built-in rate limiting
- Add custom rate limits per endpoint
- Track and block abusive users

---

### 7. Content Moderation

**Current State**: No reporting system

**What's Needed**:
- Report posts/users functionality
- Admin moderation tools
- Auto-flag inappropriate content

**Time**: 2-3 hours  
**Impact**: User safety

**SQL to Add**:
```sql
CREATE TABLE IF NOT EXISTS public.reports (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  reporter_id UUID REFERENCES public.users ON DELETE CASCADE NOT NULL,
  reported_user_id UUID REFERENCES public.users ON DELETE CASCADE,
  reported_post_id UUID REFERENCES public.posts ON DELETE CASCADE,
  reason TEXT NOT NULL,
  status TEXT CHECK (status IN ('pending', 'reviewed', 'resolved')) DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## 📋 Quick Implementation Checklist

### This Week (Critical)
- [ ] **Push token management** (30 min)
  - Add `updatePushToken` to auth API
  - Update token on login
  - Update token when refreshed

- [ ] **Server-side notifications** (2-3 hours)
  - Set up Edge Function or pg_cron
  - Schedule daily random notifications
  - Send to all active users

### This Month (Enhanced)
- [ ] **Real-time subscriptions** (1-2 hours)
  - Add real-time for posts
  - Add real-time for messages
  - Add real-time for reactions

- [ ] **Post analytics** (1 hour)
  - Add `post_views` table
  - Track views
  - Count views per post

### Next Month (Production)
- [ ] **Error tracking** (1-2 hours)
  - Set up Sentry
  - Log errors to database

- [ ] **Rate limiting** (1 hour)
  - Configure rate limits
  - Add abuse detection

- [ ] **Content moderation** (2-3 hours)
  - Add reports table
  - Create reporting API
  - Build admin tools

---

## 🚀 Recommended Order

1. **Push Token Management** (30 min) - Required for notifications
2. **Server-Side Notifications** (2-3 hours) - Critical feature
3. **Real-Time Subscriptions** (1-2 hours) - Better UX
4. **Post Analytics** (1 hour) - Nice to have
5. **Error Tracking** (1-2 hours) - Production readiness
6. **Rate Limiting** (1 hour) - Security
7. **Content Moderation** (2-3 hours) - User safety

---

## 📊 Summary

**Total Estimated Time**: ~10-15 hours

**Critical (Must Have)**:
- Push token management
- Server-side notifications

**Important (Should Have)**:
- Real-time subscriptions
- Post analytics

**Nice to Have**:
- Error tracking
- Rate limiting
- Content moderation

---

**Current Backend Status**: ✅ Core features complete, ⚠️ Production features needed

**MVP Ready After**: Push tokens + Server-side notifications (~3-4 hours)

