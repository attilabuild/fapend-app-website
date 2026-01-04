# 💳 Implementing Database Subscriptions - Quick Guide

## Why This Is Critical

Currently, subscriptions are only stored in AsyncStorage (client-side). This means:
- ❌ If user clears app data, subscription is lost
- ❌ No way to verify subscription server-side
- ❌ Can't implement proper billing
- ❌ Can't track subscription analytics

## Step 1: Add Subscriptions Table

Run this SQL in Supabase Dashboard → SQL Editor:

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

-- Indexes
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON public.subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON public.subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_subscriptions_expires_at ON public.subscriptions(expires_at);

-- Enable RLS
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own subscription" ON public.subscriptions 
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own subscription" ON public.subscriptions 
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own subscription" ON public.subscriptions 
  FOR UPDATE USING (auth.uid() = user_id);
```

## Step 2: Create Subscriptions API

Create `src/api/subscriptions.ts`:

```typescript
import { supabase, DEMO_MODE } from '../services/supabase';

export interface Subscription {
  id: string;
  user_id: string;
  status: 'active' | 'canceled' | 'expired' | 'trial';
  plan: string;
  price: number;
  currency: string;
  started_at: string;
  expires_at: string | null;
  canceled_at: string | null;
  created_at: string;
}

export const subscriptionsAPI = {
  /**
   * Get current user's subscription
   */
  getSubscription: async (): Promise<{ subscription: Subscription | null; error: any }> => {
    if (DEMO_MODE) {
      return { subscription: null, error: null };
    }

    if (!supabase) throw new Error('Supabase not configured');

    const { data, error } = await supabase
      .from('subscriptions')
      .select('*')
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
      return { subscription: null, error };
    }

    return { subscription: data || null, error: null };
  },

  /**
   * Check if user has active subscription
   */
  hasActiveSubscription: async (): Promise<boolean> => {
    const { subscription, error } = await subscriptionsAPI.getSubscription();
    
    if (error || !subscription) return false;
    
    // Check if subscription is active and not expired
    if (subscription.status !== 'active' && subscription.status !== 'trial') {
      return false;
    }
    
    // Check expiration date
    if (subscription.expires_at) {
      const expiresAt = new Date(subscription.expires_at);
      const now = new Date();
      if (expiresAt < now) {
        // Subscription expired, update status
        await subscriptionsAPI.updateSubscriptionStatus(subscription.id, 'expired');
        return false;
      }
    }
    
    return true;
  },

  /**
   * Create a new subscription (7-day trial)
   */
  createSubscription: async (): Promise<{ subscription: Subscription | null; error: any }> => {
    if (DEMO_MODE) {
      return { subscription: null, error: null };
    }

    if (!supabase) throw new Error('Supabase not configured');

    // Calculate trial expiration (7 days from now)
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    const { data, error } = await supabase
      .from('subscriptions')
      .insert({
        status: 'trial',
        plan: 'monthly',
        price: 9.99,
        currency: 'USD',
        expires_at: expiresAt.toISOString(),
      })
      .select()
      .single();

    return { subscription: data || null, error };
  },

  /**
   * Activate subscription (after payment)
   */
  activateSubscription: async (subscriptionId: string, months: number = 1): Promise<{ error: any }> => {
    if (DEMO_MODE) {
      return { error: null };
    }

    if (!supabase) throw new Error('Supabase not configured');

    // Calculate expiration (months from now)
    const expiresAt = new Date();
    expiresAt.setMonth(expiresAt.getMonth() + months);

    const { error } = await supabase
      .from('subscriptions')
      .update({
        status: 'active',
        expires_at: expiresAt.toISOString(),
      })
      .eq('id', subscriptionId);

    return { error };
  },

  /**
   * Cancel subscription
   */
  cancelSubscription: async (subscriptionId: string): Promise<{ error: any }> => {
    if (DEMO_MODE) {
      return { error: null };
    }

    if (!supabase) throw new Error('Supabase not configured');

    const { error } = await supabase
      .from('subscriptions')
      .update({
        status: 'canceled',
        canceled_at: new Date().toISOString(),
      })
      .eq('id', subscriptionId);

    return { error };
  },

  /**
   * Update subscription status (internal)
   */
  updateSubscriptionStatus: async (
    subscriptionId: string,
    status: 'active' | 'canceled' | 'expired' | 'trial'
  ): Promise<{ error: any }> => {
    if (DEMO_MODE) {
      return { error: null };
    }

    if (!supabase) throw new Error('Supabase not configured');

    const { error } = await supabase
      .from('subscriptions')
      .update({ status })
      .eq('id', subscriptionId);

    return { error };
  },
};
```

## Step 3: Export from API Index

Update `src/api/index.ts`:

```typescript
export { subscriptionsAPI } from './subscriptions';
export type { Subscription } from './subscriptions';
```

## Step 4: Update App.tsx

Update `handleSubscribe` in `App.tsx`:

```typescript
import { subscriptionsAPI } from './src/api';

const handleSubscribe = async () => {
  try {
    if (!DEMO_MODE) {
      // Check if subscription already exists
      const { subscription: existing } = await subscriptionsAPI.getSubscription();
      
      if (existing) {
        // Update existing subscription
        await subscriptionsAPI.activateSubscription(existing.id, 1);
      } else {
        // Create new subscription (trial)
        const { subscription, error } = await subscriptionsAPI.createSubscription();
        if (error) {
          console.error('Error creating subscription:', error);
          alert('Failed to create subscription. Please try again.');
          return;
        }
      }
      
      // Also save to AsyncStorage for backward compatibility
      const { user } = await authAPI.getCurrentUser();
      const userId = user?.id || await AsyncStorage.getItem('pendingSignupUserId');
      if (userId) {
        await AsyncStorage.setItem(`hasSubscription_${userId}`, 'true');
      }
    } else {
      await AsyncStorage.setItem('hasSubscription', 'true');
    }
    
    setHasSubscription(true);
    console.log('✅ Subscription activated');
  } catch (error) {
    console.error('Error saving subscription:', error);
    setHasSubscription(true); // Still allow access
  }
};
```

Update `checkAuthStatus` to check database:

```typescript
// In checkAuthStatus function, after loading user:
const { subscription, error: subError } = await subscriptionsAPI.getSubscription();
if (!subError && subscription) {
  const hasActive = await subscriptionsAPI.hasActiveSubscription();
  setHasSubscription(hasActive);
  
  // Also update AsyncStorage for backward compatibility
  if (hasActive) {
        await AsyncStorage.setItem(`hasSubscription_${userId}`, 'true');
      }
} else {
  // No subscription in database, check AsyncStorage
  const subscriptionStatus = await AsyncStorage.getItem(subscriptionKey);
  setHasSubscription(subscriptionStatus === 'true');
}
```

## Step 5: Add Type to Database Types

Update `src/types/database.types.ts`:

```typescript
export interface Subscription {
  id: string;
  user_id: string;
  status: 'active' | 'canceled' | 'expired' | 'trial';
  plan: string;
  price: number;
  currency: string;
  started_at: string;
  expires_at: string | null;
  canceled_at: string | null;
  created_at: string;
}
```

## Testing

1. **Create Subscription**:
   - Complete paywall
   - Check Supabase Dashboard → Table Editor → `subscriptions`
   - Should see new subscription with `status: 'trial'`

2. **Check Subscription**:
   - Refresh app
   - Should skip paywall (subscription active)
   - Check console logs for subscription status

3. **Expired Subscription**:
   - Manually set `expires_at` to past date in database
   - Refresh app
   - Should show paywall again

## Next Steps

After implementing this:
1. Integrate with payment provider (Stripe, RevenueCat, etc.)
2. Add subscription renewal logic
3. Add subscription management UI
4. Track subscription analytics

---

**Estimated Time**: 1-2 hours
**Priority**: ⚠️ HIGH - Critical for production

