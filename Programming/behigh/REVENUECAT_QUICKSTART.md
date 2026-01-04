# 🚀 RevenueCat Quick Start

## Step-by-Step Setup (30 minutes)

### 1. Install SDK (2 minutes)

```bash
npx expo install react-native-purchases
```

### 2. Set Up RevenueCat Dashboard (10 minutes)

1. Go to [app.revenuecat.com](https://app.revenuecat.com) and create account
2. Create new project: "BeHigh"
3. Add your app (iOS/Android)
4. Create product: `behigh_monthly` ($9.99/month)
5. Copy your API keys (iOS and Android)

### 3. Add Database Table (5 minutes)

Run this SQL in Supabase Dashboard → SQL Editor:

```sql
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.users ON DELETE CASCADE NOT NULL,
  revenuecat_customer_id TEXT UNIQUE,
  status TEXT CHECK (status IN ('active', 'canceled', 'expired', 'trial', 'grace_period')) DEFAULT 'trial',
  plan TEXT DEFAULT 'monthly',
  product_id TEXT,
  original_transaction_id TEXT,
  expires_at TIMESTAMPTZ,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  canceled_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON public.subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_revenuecat_customer_id ON public.subscriptions(revenuecat_customer_id);

ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own subscription" ON public.subscriptions 
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own subscription" ON public.subscriptions 
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own subscription" ON public.subscriptions 
  FOR UPDATE USING (auth.uid() = user_id);
```

### 4. Create Files (10 minutes)

Follow the complete guide in `REVENUECAT_INTEGRATION.md` to create:
- `src/services/revenuecat.ts`
- `src/api/subscriptions.ts`

### 5. Update App.tsx (3 minutes)

Add to `handleLogin`:
```typescript
import { initializeRevenueCat } from './src/services/revenuecat';
import { subscriptionsAPI } from './src/api';

// After user logs in:
await initializeRevenueCat(user.id);
await subscriptionsAPI.syncSubscriptionFromRevenueCat();
```

Update `handleSubscribe` in paywall:
```typescript
const { customerInfo, error } = await subscriptionsAPI.purchaseSubscription(monthlyPackage);
if (customerInfo && !error) {
  setHasSubscription(true);
}
```

### 6. Test (5 minutes)

1. Use RevenueCat sandbox
2. Test purchase flow
3. Verify subscription syncs to Supabase

---

**That's it!** RevenueCat handles everything else.

See `REVENUECAT_INTEGRATION.md` for complete implementation details.

