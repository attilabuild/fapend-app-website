import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { Platform } from 'react-native';
import Constants from 'expo-constants';
import Purchases, {
  LOG_LEVEL,
  PURCHASES_ERROR_CODE,
  type CustomerInfo,
  type PurchasesError,
  type PurchasesPackage,
} from 'react-native-purchases';

export const PRO_ENTITLEMENT = 'pro';

// App Store / Play Store product identifiers configured in RevenueCat.
// These must match the identifiers attached to the offering's packages
// (and the App Store Connect subscription product IDs).
export const MONTHLY_PRODUCT_ID = 'tonekid_month';
export const YEARLY_PRODUCT_ID = 'tonekid_premium';

export type Plan = 'monthly' | 'yearly';
export type PurchaseResult = 'success' | 'cancelled' | 'error';

type RevenueCatContextValue = {
  ready: boolean;
  isPro: boolean;
  monthlyPackage: PurchasesPackage | null;
  yearlyPackage: PurchasesPackage | null;
  monthlyPriceString: string | null;
  yearlyPriceString: string | null;
  refreshOfferings: () => Promise<void>;
  purchase: (plan: Plan) => Promise<PurchaseResult>;
  restore: () => Promise<boolean>;
  identify: (appUserID: string) => Promise<void>;
  logOut: () => Promise<void>;
};

const RevenueCatContext = createContext<RevenueCatContextValue | null>(null);

function readApiKey(): string | null {
  const extra = Constants.expoConfig?.extra as
    | { revenuecatIosKey?: string; revenuecatAndroidKey?: string }
    | undefined;
  if (!extra) return null;
  const key = Platform.OS === 'ios' ? extra.revenuecatIosKey : extra.revenuecatAndroidKey;
  return key && key.length > 0 ? key : null;
}

function entitlementActive(info: CustomerInfo | null | undefined): boolean {
  if (!info) return false;
  return Boolean(info.entitlements.active[PRO_ENTITLEMENT]);
}

export function RevenueCatProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const [isPro, setIsPro] = useState(false);
  const [monthlyPackage, setMonthlyPackage] = useState<PurchasesPackage | null>(null);
  const [yearlyPackage, setYearlyPackage] = useState<PurchasesPackage | null>(null);
  const configuredRef = useRef(false);
  const configPromiseRef = useRef<Promise<void> | null>(null);

  const ensureConfigured = useCallback(async () => {
    if (Platform.OS === 'web') return;
    if (configuredRef.current) return;
    if (configPromiseRef.current) {
      await configPromiseRef.current;
      return;
    }
    const apiKey = readApiKey();
    if (!apiKey) {
      // No key set yet — leave provider in a usable but disabled state.
      return;
    }
    configPromiseRef.current = (async () => {
      Purchases.setLogLevel(__DEV__ ? LOG_LEVEL.DEBUG : LOG_LEVEL.WARN);
      await Purchases.configure({ apiKey });
      Purchases.addCustomerInfoUpdateListener((info) => {
        setIsPro(entitlementActive(info));
      });
      configuredRef.current = true;
    })();
    try {
      await configPromiseRef.current;
    } finally {
      configPromiseRef.current = null;
    }
  }, []);

  const loadOfferings = useCallback(async () => {
    if (Platform.OS === 'web' || !configuredRef.current) return;
    const offerings = await Purchases.getOfferings();
    const current = offerings.current;
    if (!current) {
      setMonthlyPackage(null);
      setYearlyPackage(null);
      return;
    }
    // Prefer matching by product identifier so we always pull the exact
    // tonekid_monthly / tonekid_premium SKUs even if the offering shape changes.
    const all = current.availablePackages ?? [];
    const byId = (id: string) => all.find((p) => p.product.identifier === id) ?? null;
    setMonthlyPackage(byId(MONTHLY_PRODUCT_ID) ?? current.monthly ?? null);
    setYearlyPackage(byId(YEARLY_PRODUCT_ID) ?? current.annual ?? null);
  }, []);

  const refreshOfferings = useCallback(async () => {
    try {
      await ensureConfigured();
      await loadOfferings();
    } catch (e) {
      if (__DEV__) console.log('[RevenueCat] refreshOfferings failed', e);
    }
  }, [ensureConfigured, loadOfferings]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        await ensureConfigured();
        if (cancelled) return;
        if (configuredRef.current) {
          const info = await Purchases.getCustomerInfo();
          if (!cancelled) setIsPro(entitlementActive(info));
          await loadOfferings();
        }
      } catch (e) {
        if (__DEV__) console.log('[RevenueCat] init failed', e);
      } finally {
        if (!cancelled) setReady(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [ensureConfigured, loadOfferings]);

  const purchase = useCallback(
    async (plan: Plan): Promise<PurchaseResult> => {
      try {
        await ensureConfigured();
        if (!configuredRef.current) return 'error';
        const pack = plan === 'yearly' ? yearlyPackage : monthlyPackage;
        if (!pack) {
          await loadOfferings();
        }
        const target = plan === 'yearly' ? yearlyPackage : monthlyPackage;
        if (!target) return 'error';
        const { customerInfo } = await Purchases.purchasePackage(target);
        const active = entitlementActive(customerInfo);
        setIsPro(active);
        return active ? 'success' : 'error';
      } catch (raw) {
        const err = raw as PurchasesError;
        if (err?.userCancelled || err?.code === PURCHASES_ERROR_CODE.PURCHASE_CANCELLED_ERROR) {
          return 'cancelled';
        }
        if (__DEV__) console.log('[RevenueCat] purchase failed', err);
        return 'error';
      }
    },
    [ensureConfigured, loadOfferings, monthlyPackage, yearlyPackage]
  );

  const restore = useCallback(async (): Promise<boolean> => {
    try {
      await ensureConfigured();
      if (!configuredRef.current) return false;
      const info = await Purchases.restorePurchases();
      const active = entitlementActive(info);
      setIsPro(active);
      return active;
    } catch (e) {
      if (__DEV__) console.log('[RevenueCat] restore failed', e);
      return false;
    }
  }, [ensureConfigured]);

  const identify = useCallback(
    async (appUserID: string) => {
      try {
        await ensureConfigured();
        if (!configuredRef.current) return;
        const { customerInfo } = await Purchases.logIn(appUserID);
        setIsPro(entitlementActive(customerInfo));
        await loadOfferings();
      } catch (e) {
        if (__DEV__) console.log('[RevenueCat] identify failed', e);
      }
    },
    [ensureConfigured, loadOfferings]
  );

  const logOut = useCallback(async () => {
    try {
      if (!configuredRef.current) return;
      const info = await Purchases.logOut();
      setIsPro(entitlementActive(info));
    } catch (e) {
      if (__DEV__) console.log('[RevenueCat] logOut failed', e);
    }
  }, []);

  const monthlyPriceString = monthlyPackage?.product.priceString ?? null;
  const yearlyPriceString = yearlyPackage?.product.priceString ?? null;

  const value = useMemo<RevenueCatContextValue>(
    () => ({
      ready,
      isPro,
      monthlyPackage,
      yearlyPackage,
      monthlyPriceString,
      yearlyPriceString,
      refreshOfferings,
      purchase,
      restore,
      identify,
      logOut,
    }),
    [
      ready,
      isPro,
      monthlyPackage,
      yearlyPackage,
      monthlyPriceString,
      yearlyPriceString,
      refreshOfferings,
      purchase,
      restore,
      identify,
      logOut,
    ]
  );

  return <RevenueCatContext.Provider value={value}>{children}</RevenueCatContext.Provider>;
}

export function useRevenueCat(): RevenueCatContextValue {
  const ctx = useContext(RevenueCatContext);
  if (!ctx) throw new Error('useRevenueCat must be used within a RevenueCatProvider');
  return ctx;
}
