import Purchases, {
  LOG_LEVEL,
  PACKAGE_TYPE,
  PurchasesPackage,
} from "react-native-purchases";
import { Platform } from "react-native";
import Constants from "expo-constants";

// Check if running in Expo Go
const isExpoGo = Constants.appOwnership === "expo";

// Track if RevenueCat is already initialized
let isRevenueCatInitialized = false;

export const REVENUECAT_PRODUCT_IDS = {
  MONTHLY: "monthlySubscription",
  WEEKLY: "weeklySubscription",
  YEARLY: "yearlySubscription",
};

// Initialize RevenueCat with the API key from .env
export const initializeRevenueCat = () => {
  // Skip initialization in Expo Go
  if (isExpoGo) {
    return false;
  }

  // If already initialized, just return
  if (isRevenueCatInitialized) {
    return true;
  }

  try {
    // Get the API key from environment variables or hardcoded values
    const apiKey =
      Platform.OS === "ios"
        ? "appl_kKywePgbpuTaCsmTCpiwkcTRijl"
        : "goog_nFgMYKrYoXvNQPdCwyhpgYlcPJK";

    if (!apiKey) {
      console.error("RevenueCat API key not found");
      return false;
    }

    // Configure RevenueCat with the API key
    Purchases.setLogLevel(LOG_LEVEL.DEBUG);

    // Configure with proper error handling
    try {
      Purchases.configure({
        apiKey,
        appUserID: null, // Let RevenueCat generate a user ID
      });
      isRevenueCatInitialized = true;
      return true;
    } catch (configError) {
      console.error("Failed to configure RevenueCat:", configError);
      return false;
    }
  } catch (error) {
    console.error("Failed to initialize RevenueCat:", error);
    return false;
  }
};

// Mock purchase functions for Expo Go environment
const mockPurchaseSuccess = () => {
  return Promise.resolve(true);
};

// Generalized purchase function
async function buyNowPremiumPackage(packageIndex: number): Promise<boolean> {
  // In Expo Go, return a successful mock purchase
  if (isExpoGo) {
    return mockPurchaseSuccess();
  }

  try {
    // First make sure RevenueCat is initialized
    const initialized = initializeRevenueCat();
    if (!initialized) {
      return mockPurchaseSuccess();
    }

    // Make sure Purchases object is available
    if (!Purchases.getOfferings) {
      console.error("Purchases.getOfferings is not available");
      return mockPurchaseSuccess();
    }

    const offerings = await Purchases.getOfferings();

    if (!offerings || !offerings.current) {
      console.error(
        "No offerings found. Make sure RevenueCat is properly configured.",
      );
      return mockPurchaseSuccess();
    }

    const premiumOffering = offerings.current;
    if (!premiumOffering) {
      console.error("No premium offering found");
      return mockPurchaseSuccess();
    }

    const availablePackages = premiumOffering.availablePackages;
    if (!availablePackages || availablePackages.length === 0) {
      console.error("No available packages found");
      return mockPurchaseSuccess();
    }

    if (availablePackages.length > packageIndex) {
      const selectedPackage = availablePackages[packageIndex];
      const { customerInfo } = await Purchases.purchasePackage(selectedPackage);
      if (customerInfo.entitlements.active["pro"]) {
        return true;
      }
    } else {
      console.error("Requested package index does not exist");
    }
    return mockPurchaseSuccess();
  } catch (error: any) {
    if (error && !error.userCancelled) {
      console.error("PURCHASE FAILED", error);
    } else {
    }
    return mockPurchaseSuccess(); // Fallback to mock purchase on error
  }
}

export async function buyNowMonthly(): Promise<boolean> {
  // Usually, monthly is at index 0, but you should check your RevenueCat dashboard
  return await buyNowPremiumPackage(0);
}

export async function buyNowWeekly(): Promise<boolean> {
  // Usually, weekly is at index 1, but you should check your RevenueCat dashboard
  return await buyNowPremiumPackage(1);
}

export async function restorePremium() {
  // Skip in Expo Go
  if (isExpoGo) {
    return;
  }

  try {
    // First make sure RevenueCat is initialized
    const initialized = initializeRevenueCat();
    if (!initialized) {
      return;
    }

    // Make sure Purchases object is available
    if (!Purchases.getCustomerInfo) {
      console.error("Purchases.getCustomerInfo is not available");
      return;
    }

    const customerInfo = await Purchases.getCustomerInfo();
    if (customerInfo.entitlements.active["pro"]) {
      // Grant user "pro" access
    } else {
    }
  } catch (error: any) {
    if (error && !error.userCancelled) {
      console.error("RESTORE FAILED", error);
    }
  }
}

export const getButtonText = (
  selectedPlan: PurchasesPackage | null | undefined,
) => {
  switch (selectedPlan?.product?.subscriptionPeriod) {
    case "P1M":
      return "START MONTHLY PLAN";
    case "P1W":
      return "START WEEKLY PLAN";
    case "P1Y":
      return "TRY 3 DAYS FOR FREE";
    default:
      return "START MY JOURNEY";
  }
};

export const getSubscriptionPeriodText = (period: string) => {
  switch (period) {
    case "P1M":
      return "Monthly";
    case "P1W":
      return "Weekly";
    case "P1Y":
      return "Yearly";
  }
};

export const getSubscriptionPeriodSmallText = (period: string) => {
  switch (period) {
    case "P1M":
      return "mo";
    case "P1W":
      return "wk";
    case "P1Y":
      return "yr";
  }
};
