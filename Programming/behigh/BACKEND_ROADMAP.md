# 🚀 Backend Roadmap - What's Next

## ✅ What's Already Implemented

### Database & Schema
- ✅ Complete database schema (users, posts, reactions, friendships, chat_messages, journal_entries)
- ✅ Row Level Security (RLS) policies for all tables
- ✅ Database indexes for performance
- ✅ Auto-create user profile trigger on signup
- ✅ Storage buckets configured (posts, profiles, reactions, journal)

### API Services
- ✅ Authentication API (sign up, sign in, sign out, session management)
- ✅ Posts API (create, read, delete posts)
- ✅ Friends API (search, send/accept/decline requests, get friends)
- ✅ Chat API (send messages, get messages)
- ✅ Journal API (create, read, delete entries)
- ✅ Reactions API (add, remove reactions)

### Current Features
- ✅ Image upload to Supabase Storage
- ✅ Per-user data isolation with RLS
- ✅ Session persistence
- ✅ Profile picture upload

---

## 🎯 Priority 1: Critical Backend Features

### 1. RevenueCat Integration ⚠️ **HIGH PRIORITY** ✅ **USING REVENUECAT**

**Current State**: Subscriptions are stored in AsyncStorage only (client-side)

**What's Needed**:
- ✅ Install RevenueCat SDK (`react-native-purchases`)
- ✅ Set up RevenueCat project and products
- ✅ Add `subscriptions` table to sync status from RevenueCat
- ✅ Create RevenueCat service wrapper
- ✅ Integrate with paywall flow
- ✅ Set up webhooks (optional but recommended)

**See**: `REVENUECAT_INTEGRATION.md` for complete guide

**SQL Schema to Add** (updated for RevenueCat):
```sql
-- Subscriptions table
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.users ON DELETE CASCADE NOT NULL,
  status TEXT CHECK (status IN ('active', 'canceled', 'expired', 'trial')) DEFAULT 'trial',
  plan TEXT DEFAULT 'monthly',
  price DECIMAL(10, 2) DEFAULT 9.99,
  currency TEXT DEFAULT 'USD',
  started_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ,
  canceled_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Index
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON public.subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON public.subscriptions(status);

-- RLS Policies
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own subscription" ON public.subscriptions 
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own subscription" ON public.subscriptions 
  FOR UPDATE USING (auth.uid() = user_id);
```

**API to Create**: `src/api/subscriptions.ts`
```typescript
export const subscriptionsAPI = {
  getSubscription: async () => { /* Get from Supabase */ },
  hasActiveSubscription: async () => { /* Check RevenueCat status */ },
  syncSubscriptionFromRevenueCat: async () => { /* Sync RC → Supabase */ },
  purchaseSubscription: async () => { /* Purchase via RevenueCat */ },
  restorePurchases: async () => { /* Restore via RevenueCat */ },
};
```

**Why RevenueCat**: 
- ✅ Handles all App Store/Play Store complexity
- ✅ Cross-platform subscription management
- ✅ Automatic receipt validation
- ✅ Subscription analytics built-in
- ✅ Webhook support for server-side sync
- ✅ Free tier available

---

### 2. Server-Side Daily Notification Scheduling ⚠️ **HIGH PRIORITY**

**Current State**: Notifications are scheduled client-side only

**What's Needed**:
- Supabase Edge Function or cron job to schedule daily notifications
- Store notification times in database
- Send push notifications via Expo Push Notification service
- Handle notification delivery tracking

**Implementation Options**:

**Option A: Supabase Edge Function + pg_cron**
```sql
-- Add pg_cron extension
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Function to schedule daily notifications
CREATE OR REPLACE FUNCTION schedule_daily_notifications()
RETURNS void AS $$
DECLARE
  random_hour INT;
  random_minute INT;
  notification_time TIMESTAMPTZ;
BEGIN
  -- Generate random time between 9 AM and 11 PM
  random_hour := floor(random() * 14 + 9)::INT; -- 9-22
  random_minute := floor(random() * 60)::INT;
  
  notification_time := (CURRENT_DATE + make_interval(hours => random_hour, mins => random_minute));
  
  -- Store in daily_moments table
  INSERT INTO public.daily_moments (date, notification_time)
  VALUES (CURRENT_DATE, notification_time)
  ON CONFLICT (date) DO UPDATE SET notification_time = EXCLUDED.notification_time;
END;
$$ LANGUAGE plpgsql;

-- Schedule to run daily at midnight
SELECT cron.schedule(
  'daily-notification-scheduler',
  '0 0 * * *', -- Every day at midnight
  $$SELECT schedule_daily_notifications()$$
);
```

**Option B: Supabase Edge Function (Recommended)**
- Create Edge Function that runs daily
- Uses Expo Push Notification API
- More flexible and easier to debug

**Why This Matters**:
- Client-side scheduling is unreliable (app might be closed)
- Need server-side scheduling for production
- Can track notification delivery
- Better user experience

---

### 3. Push Notification Token Management

**Current State**: Push tokens might not be stored in database

**What's Needed**:
- Store push tokens in `users` table (already has `push_token` column)
- Update token when user logs in
- Handle token refresh
- Send notifications to all active users

**API to Update**: `src/api/auth.ts`
```typescript
updatePushToken: async (token: string) => {
  // Update user's push_token in database
}
```

---

## 🎯 Priority 2: Enhanced Backend Features

### 4. Real-Time Subscriptions

**What's Needed**:
- Real-time updates for new posts
- Real-time friend request notifications
- Real-time chat messages
- Real-time reaction updates

**Implementation**:
```typescript
// In src/api/posts.ts
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

**Why This Matters**:
- Better user experience (instant updates)
- More engaging app
- Reduces need for manual refresh

---

### 5. Post Analytics

**What's Needed**:
- Track post views
- Track reaction counts
- Track engagement metrics

**SQL Schema to Add**:
```sql
-- Post views table
CREATE TABLE IF NOT EXISTS public.post_views (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  post_id UUID REFERENCES public.posts ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.users ON DELETE CASCADE NOT NULL,
  viewed_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(post_id, user_id)
);
```

---

### 6. Content Moderation

**What's Needed**:
- Report posts/users functionality
- Admin moderation tools
- Auto-flag inappropriate content

**SQL Schema to Add**:
```sql
-- Reports table
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

## 🎯 Priority 3: Production Readiness

### 7. Error Tracking & Logging

**What's Needed**:
- Integrate Sentry or similar
- Log errors to Supabase
- Track API errors
- Monitor performance

**Implementation**:
- Add Sentry SDK
- Create `errors` table in database
- Log critical errors server-side

---

### 8. Analytics & Metrics

**What's Needed**:
- User analytics (DAU, MAU)
- Post creation metrics
- Engagement metrics
- Revenue tracking

**Implementation**:
- Create analytics events table
- Track key user actions
- Build dashboard queries

---

### 9. Backup & Recovery

**What's Needed**:
- Automated database backups
- Point-in-time recovery
- Data export functionality

**Implementation**:
- Supabase handles this automatically
- Add manual backup triggers
- Export user data functionality

---

### 10. Rate Limiting

**What's Needed**:
- API rate limiting
- Prevent abuse
- Protect against spam

**Implementation**:
- Use Supabase rate limiting
- Add custom rate limits per endpoint
- Track and block abusive users

---

## 📋 Implementation Checklist

### Immediate (This Week)
- [ ] **Set up RevenueCat project** (dashboard setup)
- [ ] **Install RevenueCat SDK** (`npm install react-native-purchases`)
- [ ] **Add subscriptions table** to database (see REVENUECAT_INTEGRATION.md)
- [ ] **Create RevenueCat service** (`src/services/revenuecat.ts`)
- [ ] **Create subscriptions API** (`src/api/subscriptions.ts`)
- [ ] **Update paywall flow** to use RevenueCat
- [ ] **Store push tokens** in database
- [ ] **Update push token** on login

### Short Term (This Month)
- [ ] **Set up server-side notification scheduling** (Edge Function or pg_cron)
- [ ] **Implement real-time subscriptions** for posts and messages
- [ ] **Add post analytics** (views, engagement)
- [ ] **Set up error tracking** (Sentry)

### Medium Term (Next Month)
- [ ] **Content moderation** system
- [ ] **Analytics dashboard** queries
- [ ] **Rate limiting** implementation
- [ ] **Performance optimization**

---

## 🔧 Quick Wins (Easy to Implement)

### 1. Update Subscription to Use Database
**Time**: 1-2 hours
**Impact**: High
- Add subscriptions table
- Update `handleSubscribe` to save to database
- Check subscription from database on app load

### 2. Store Push Tokens
**Time**: 30 minutes
**Impact**: Medium
- Update `users.push_token` on login
- Create API endpoint to update token

### 3. Real-Time Posts
**Time**: 1 hour
**Impact**: High
- Add Supabase real-time subscription
- Update feed when new posts arrive

---

## 📚 Resources

### Supabase Documentation
- [Edge Functions](https://supabase.com/docs/guides/functions)
- [Real-time Subscriptions](https://supabase.com/docs/guides/realtime)
- [Database Functions](https://supabase.com/docs/guides/database/functions)
- [pg_cron](https://supabase.com/docs/guides/database/extensions/pg_cron)

### Expo Push Notifications
- [Expo Push Notification API](https://docs.expo.dev/push-notifications/sending-notifications/)
- [Push Notification Service](https://expo.dev/notifications)

---

## 🎯 Recommended Next Steps

1. **Start with Subscriptions** (Highest Priority)
   - Most critical missing feature
   - Affects revenue and user experience
   - Relatively quick to implement

2. **Then Add Server-Side Notifications**
   - Improves reliability
   - Better user experience
   - Required for production

3. **Then Real-Time Features**
   - Enhances user engagement
   - Makes app feel more alive
   - Good user experience improvement

---

**Current Backend Status**: ✅ Core features complete, ⚠️ Production features needed

**Estimated Time to Production-Ready**: 1-2 weeks of focused development

