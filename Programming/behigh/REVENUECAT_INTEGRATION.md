# 💳 RevenueCat Integration Guide

## Overview

RevenueCat handles all subscription management, so we'll:
1. Use RevenueCat SDK in the app
2. Store subscription status in Supabase (synced from RevenueCat)
3. Use RevenueCat webhooks to keep Supabase in sync

## Step 1: Install RevenueCat SDK

```bash
npm install react-native-purchases
```

For Expo:
```bash
npx expo install react-native-purchases
```

## Step 2: Set Up RevenueCat Dashboard

1. **Create Account**: Go to [app.revenuecat.com](https://app.revenuecat.com)
2. **Create Project**: Create a new project for BeHigh
3. **Add App**: Add iOS and/or Android app
4. **Configure Products**: 
   - Create product: `behigh_monthly` ($9.99/month)
   - Set up subscription in App Store Connect / Google Play Console
5. **Get API Keys**: Copy your RevenueCat API keys

## Step 3: Update Database Schema

We still need a subscriptions table to track status in Supabase:

```sql
-- Subscriptions table (synced from RevenueCat)
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.users ON DELETE CASCADE NOT NULL,
  revenuecat_customer_id TEXT UNIQUE, -- RevenueCat customer ID
  status TEXT CHECK (status IN ('active', 'canceled', 'expired', 'trial', 'grace_period')) DEFAULT 'trial',
  plan TEXT DEFAULT 'monthly',
  product_id TEXT, -- RevenueCat product ID (e.g., 'behigh_monthly')
  original_transaction_id TEXT, -- App Store/Play Store transaction ID
  expires_at TIMESTAMPTZ,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  canceled_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON public.subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_revenuecat_customer_id ON public.subscriptions(revenuecat_customer_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON public.subscriptions(status);

-- Enable RLS
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own subscription" ON public.subscriptions 
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own subscription" ON public.subscriptions 
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own subscription" ON public.subscriptions 
  FOR UPDATE USING (auth.uid() = user_id);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_subscriptions_updated_at
  BEFORE UPDATE ON public.subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

## Step 4: Create RevenueCat Service

Create `src/services/revenuecat.ts`:

```typescript
import Purchases, { CustomerInfo, PurchasesOffering } from 'react-native-purchases';
import { Platform } from 'react-native';

// RevenueCat API Keys (get from RevenueCat dashboard)
const REVENUECAT_API_KEY_IOS = 'your_ios_api_key';
const REVENUECAT_API_KEY_ANDROID = 'your_android_api_key';

let isInitialized = false;

/**
 * Initialize RevenueCat SDK
 */
export const initializeRevenueCat = async (userId: string) => {
  try {
    if (isInitialized) {
      console.log('RevenueCat already initialized');
      return;
    }

    const apiKey = Platform.OS === 'ios' ? REVENUECAT_API_KEY_IOS : REVENUECAT_API_KEY_ANDROID;
    
    await Purchases.configure({ apiKey });
    
    // Identify user with Supabase user ID
    await Purchases.logIn(userId);
    
    isInitialized = true;
    console.log('✅ RevenueCat initialized for user:', userId);
  } catch (error) {
    console.error('Error initializing RevenueCat:', error);
    throw error;
  }
};

/**
 * Get current subscription status
 */
export const getSubscriptionStatus = async (): Promise<{
  isActive: boolean;
  customerInfo: CustomerInfo | null;
  error: any;
}> => {
  try {
    const customerInfo = await Purchases.getCustomerInfo();
    
    // Check if user has active entitlement
    const isActive = customerInfo.entitlements.active['premium'] !== undefined;
    
    return {
      isActive,
      customerInfo,
      error: null,
    };
  } catch (error) {
    console.error('Error getting subscription status:', error);
    return {
      isActive: false,
      customerInfo: null,
      error,
    };
  }
};

/**
 * Get available offerings (subscription plans)
 */
export const getOfferings = async (): Promise<{
  offerings: PurchasesOffering | null;
  error: any;
}> => {
  try {
    const offerings = await Purchases.getOfferings();
    return {
      offerings: offerings.current,
      error: null,
    };
  } catch (error) {
    console.error('Error getting offerings:', error);
    return {
      offerings: null,
      error,
    };
  }
};

/**
 * Purchase subscription
 */
export const purchaseSubscription = async (packageToPurchase: any): Promise<{
  customerInfo: CustomerInfo | null;
  error: any;
}> => {
  try {
    const { customerInfo } = await Purchases.purchasePackage(packageToPurchase);
    return {
      customerInfo,
      error: null,
    };
  } catch (error: any) {
    // User cancelled
    if (error.userCancelled) {
      return {
        customerInfo: null,
        error: { message: 'Purchase cancelled', cancelled: true },
      };
    }
    
    console.error('Error purchasing subscription:', error);
    return {
      customerInfo: null,
      error,
    };
  }
};

/**
 * Restore purchases
 */
export const restorePurchases = async (): Promise<{
  customerInfo: CustomerInfo | null;
  error: any;
}> => {
  try {
    const customerInfo = await Purchases.restorePurchases();
    return {
      customerInfo,
      error: null,
    };
  } catch (error) {
    console.error('Error restoring purchases:', error);
    return {
      customerInfo: null,
      error,
    };
  }
};

/**
 * Log out user (when user logs out of app)
 */
export const logoutRevenueCat = async () => {
  try {
    await Purchases.logOut();
    isInitialized = false;
    console.log('✅ RevenueCat logged out');
  } catch (error) {
    console.error('Error logging out RevenueCat:', error);
  }
};
```

## Step 5: Create Subscriptions API

Create `src/api/subscriptions.ts`:

```typescript
import { supabase, DEMO_MODE } from '../services/supabase';
import { getSubscriptionStatus, purchaseSubscription, getOfferings, restorePurchases } from '../services/revenuecat';
import type { CustomerInfo } from 'react-native-purchases';

export interface Subscription {
  id: string;
  user_id: string;
  revenuecat_customer_id: string | null;
  status: 'active' | 'canceled' | 'expired' | 'trial' | 'grace_period';
  plan: string;
  product_id: string | null;
  original_transaction_id: string | null;
  expires_at: string | null;
  started_at: string;
  canceled_at: string | null;
  updated_at: string;
  created_at: string;
}

export const subscriptionsAPI = {
  /**
   * Get current user's subscription from Supabase
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

    if (error && error.code !== 'PGRST116') {
      return { subscription: null, error };
    }

    return { subscription: data || null, error: null };
  },

  /**
   * Check if user has active subscription (from RevenueCat)
   */
  hasActiveSubscription: async (): Promise<boolean> => {
    if (DEMO_MODE) {
      // Check AsyncStorage for demo mode
      const { user } = await authAPI.getCurrentUser();
      if (!user) return false;
      const status = await AsyncStorage.getItem(`hasSubscription_${user.id}`);
      return status === 'true';
    }

    const { isActive } = await getSubscriptionStatus();
    return isActive;
  },

  /**
   * Sync subscription status from RevenueCat to Supabase
   */
  syncSubscriptionFromRevenueCat: async (): Promise<{ subscription: Subscription | null; error: any }> => {
    if (DEMO_MODE) {
      return { subscription: null, error: null };
    }

    if (!supabase) throw new Error('Supabase not configured');

    try {
      // Get subscription status from RevenueCat
      const { isActive, customerInfo, error: rcError } = await getSubscriptionStatus();
      
      if (rcError || !customerInfo) {
        return { subscription: null, error: rcError };
      }

      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return { subscription: null, error: new Error('Not authenticated') };
      }

      // Extract subscription info from RevenueCat
      const entitlement = customerInfo.entitlements.active['premium'];
      const latestTransaction = customerInfo.latestExpirationDate;
      const productIdentifier = entitlement?.productIdentifier;
      const originalTransactionId = entitlement?.originalTransactionId;

      // Determine status
      let status: Subscription['status'] = 'expired';
      if (isActive && entitlement) {
        if (entitlement.willRenew) {
          status = 'active';
        } else if (entitlement.isActive && !entitlement.willRenew) {
          status = 'grace_period';
        }
      }

      // Upsert subscription in Supabase
      const subscriptionData = {
        user_id: user.id,
        revenuecat_customer_id: customerInfo.originalAppUserId,
        status,
        plan: 'monthly',
        product_id: productIdentifier || null,
        original_transaction_id: originalTransactionId || null,
        expires_at: latestTransaction || null,
        started_at: entitlement?.latestPurchaseDate || new Date().toISOString(),
        canceled_at: status === 'canceled' ? new Date().toISOString() : null,
      };

      const { data, error } = await supabase
        .from('subscriptions')
        .upsert(subscriptionData, {
          onConflict: 'user_id',
        })
        .select()
        .single();

      if (error) {
        console.error('Error syncing subscription:', error);
        return { subscription: null, error };
      }

      return { subscription: data, error: null };
    } catch (error) {
      console.error('Error syncing subscription from RevenueCat:', error);
      return { subscription: null, error };
    }
  },

  /**
   * Get available subscription offerings
   */
  getAvailableOfferings: async () => {
    return await getOfferings();
  },

  /**
   * Purchase subscription via RevenueCat
   */
  purchaseSubscription: async (packageToPurchase: any) => {
    const result = await purchaseSubscription(packageToPurchase);
    
    if (result.customerInfo && !result.error) {
      // Sync to Supabase after successful purchase
      await subscriptionsAPI.syncSubscriptionFromRevenueCat();
    }
    
    return result;
  },

  /**
   * Restore purchases
   */
  restorePurchases: async () => {
    const result = await restorePurchases();
    
    if (result.customerInfo && !result.error) {
      // Sync to Supabase after restore
      await subscriptionsAPI.syncSubscriptionFromRevenueCat();
    }
    
    return result;
  },
};
```

## Step 6: Update App.tsx

### Initialize RevenueCat on Login

```typescript
import { initializeRevenueCat, logoutRevenueCat } from './src/services/revenuecat';
import { subscriptionsAPI } from './src/api';

// In handleLogin or after successful authentication:
const { user } = await authAPI.getCurrentUser();
if (user) {
  // Initialize RevenueCat with user ID
  await initializeRevenueCat(user.id);
  
  // Sync subscription status
  await subscriptionsAPI.syncSubscriptionFromRevenueCat();
}
```

### Update Paywall Screen

```typescript
const [offerings, setOfferings] = useState<any>(null);
const [loading, setLoading] = useState(false);

useEffect(() => {
  loadOfferings();
}, []);

const loadOfferings = async () => {
  const { offerings: availableOfferings } = await subscriptionsAPI.getAvailableOfferings();
  setOfferings(availableOfferings);
};

const handleSubscribe = async () => {
  if (!offerings) {
    alert('Loading subscription options...');
    return;
  }

  setLoading(true);
  try {
    // Get the monthly package
    const monthlyPackage = offerings.availablePackages.find(
      (pkg: any) => pkg.identifier === 'monthly' || pkg.packageType === 'MONTHLY'
    );

    if (!monthlyPackage) {
      alert('Subscription package not found');
      setLoading(false);
      return;
    }

    const { customerInfo, error } = await subscriptionsAPI.purchaseSubscription(monthlyPackage);
    
    if (error) {
      if (error.cancelled) {
        // User cancelled, don't show error
        setLoading(false);
        return;
      }
      alert(`Purchase failed: ${error.message || 'Unknown error'}`);
      setLoading(false);
      return;
    }

    if (customerInfo) {
      // Check if subscription is active
      const isActive = customerInfo.entitlements.active['premium'] !== undefined;
      setHasSubscription(isActive);
      
      if (isActive) {
        console.log('✅ Subscription activated');
      }
    }
  } catch (error) {
    console.error('Error purchasing subscription:', error);
    alert('Failed to purchase subscription. Please try again.');
  } finally {
    setLoading(false);
  }
};
```

### Update Paywall UI

```typescript
// In PaywallScreen component:
{offerings && offerings.availablePackages.map((pkg: any) => (
  <TouchableOpacity
    key={pkg.identifier}
    style={styles.paywallPriceCard}
    onPress={() => handleSubscribe(pkg)}
    disabled={loading}
  >
    <Text style={styles.paywallPrice}>
      {pkg.product.priceString}
    </Text>
    <Text style={styles.paywallPricePeriod}>
      {pkg.product.subscriptionPeriod}
    </Text>
  </TouchableOpacity>
))}
```

### Check Subscription on App Load

```typescript
// In checkAuthStatus, after user is loaded:
const { subscription, error } = await subscriptionsAPI.syncSubscriptionFromRevenueCat();
if (!error && subscription) {
  const isActive = await subscriptionsAPI.hasActiveSubscription();
  setHasSubscription(isActive);
} else {
  // Fallback to AsyncStorage check
  const subscriptionStatus = await AsyncStorage.getItem(`hasSubscription_${userId}`);
  setHasSubscription(subscriptionStatus === 'true');
}
```

### Logout RevenueCat on Logout

```typescript
// In handleLogout:
await logoutRevenueCat();
```

## Step 7: Set Up RevenueCat Webhooks (Optional but Recommended)

RevenueCat can send webhooks to your backend when subscription status changes.

### Create Supabase Edge Function

Create `supabase/functions/revenuecat-webhook/index.ts`:

```typescript
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

serve(async (req) => {
  try {
    const event = await req.json();
    
    // Verify webhook signature (add your RevenueCat webhook secret)
    // const signature = req.headers.get('authorization');
    // Verify signature here...
    
    const { event: eventType, customer_info } = event;
    
    // Find user by RevenueCat customer ID
    const { data: subscription } = await supabase
      .from('subscriptions')
      .select('user_id')
      .eq('revenuecat_customer_id', customer_info.original_app_user_id)
      .single();
    
    if (!subscription) {
      return new Response(JSON.stringify({ error: 'User not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    
    // Update subscription status
    const entitlement = customer_info.entitlements.active['premium'];
    const status = entitlement ? 'active' : 'expired';
    
    await supabase
      .from('subscriptions')
      .update({
        status,
        expires_at: customer_info.latest_expiration_date,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', subscription.user_id);
    
    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
});
```

### Configure Webhook in RevenueCat

1. Go to RevenueCat Dashboard → Project Settings → Webhooks
2. Add webhook URL: `https://your-project.supabase.co/functions/v1/revenuecat-webhook`
3. Select events: `INITIAL_PURCHASE`, `RENEWAL`, `CANCELLATION`, `EXPIRATION`

## Step 8: Add Environment Variables

Update `app.json`:

```json
{
  "expo": {
    "extra": {
      "revenuecatApiKeyIos": "your_ios_api_key",
      "revenuecatApiKeyAndroid": "your_android_api_key"
    }
  }
}
```

Update `src/services/revenuecat.ts` to use env vars:

```typescript
import Constants from 'expo-constants';

const REVENUECAT_API_KEY_IOS = Constants.expoConfig?.extra?.revenuecatApiKeyIos || 'your_ios_api_key';
const REVENUECAT_API_KEY_ANDROID = Constants.expoConfig?.extra?.revenuecatApiKeyAndroid || 'your_android_api_key';
```

## Testing

1. **Test Purchase Flow**:
   - Use RevenueCat sandbox environment
   - Test with sandbox Apple/Google accounts
   - Verify subscription syncs to Supabase

2. **Test Restore**:
   - Log out and log back in
   - Call `restorePurchases()`
   - Verify subscription is restored

3. **Test Webhook**:
   - Use RevenueCat webhook testing tool
   - Verify Supabase updates correctly

## Next Steps

1. Set up products in App Store Connect / Google Play Console
2. Configure RevenueCat products
3. Test with sandbox accounts
4. Set up webhooks for production
5. Add subscription management UI (cancel, restore)

---

**RevenueCat handles all the complexity of subscriptions!** 🎉

You just need to:
- Initialize SDK on login
- Check subscription status
- Handle purchase flow
- Sync to Supabase (optional, but recommended)

