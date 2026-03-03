import { REVENUECAT_API_KEYS } from "config";
import { createContext, useContext, useRef, useState } from "react";
import { Platform } from "react-native";
import Purchases, {
  CustomerInfo,
  LOG_LEVEL,
  PurchasesPackage,
} from "react-native-purchases";
import { useAuthStore, useStreakStore } from "./useStore";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { IUser } from "types";
import * as api from "../services/api";
import { setFirstDayAutoCheckin } from "../utils/asyncStorage";
// @ts-ignore
import { useNavigation } from "@react-navigation/native";

interface RevenueCatContext {
  packages: PurchasesPackage[] | null;
  purchasePackage: (pack: PurchasesPackage) => Promise<void>;
  updateCustomerInfo: (info: CustomerInfo) => Promise<void>;
  refreshPackages: () => Promise<void>;
  getCustomerInfo: () => Promise<CustomerInfo | null>;
}

const RevenueCatContext = createContext<RevenueCatContext>({
  packages: null,
  purchasePackage: async () => {},
  updateCustomerInfo: async () => {},
  refreshPackages: async () => {},
  getCustomerInfo: async () => null,
});

export const RevenueCatProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [packages, setPackages] = useState<PurchasesPackage[] | null>(null);
  const navigation = useNavigation();
  const { user } = useAuthStore.getState();
  const isConfiguredRef = useRef(false);
  const configPromiseRef = useRef<Promise<void> | null>(null);

  const ensureConfigured = async () => {
    if (isConfiguredRef.current) return;
    if (configPromiseRef.current) {
      await configPromiseRef.current;
      return;
    }
    configPromiseRef.current = (async () => {
      await new Promise((r) => setTimeout(r, 600));
      const apiKey =
        Platform.OS === "ios"
          ? REVENUECAT_API_KEYS.ios
          : REVENUECAT_API_KEYS.android;
      await Purchases.configure({ apiKey, appUserID: user?._id });
      Purchases.setLogLevel(LOG_LEVEL.DEBUG);
      Purchases.addCustomerInfoUpdateListener((info) => {
        updateCustomerInfo(info);
      });
      isConfiguredRef.current = true;
    })();
    await configPromiseRef.current;
  };

  const loadOfferings = async () => {
    await ensureConfigured();
    const offerings = await Purchases.getOfferings();
    const currentOfferings = offerings.current;
    if (currentOfferings) {
      setPackages(currentOfferings.availablePackages);
    }
  };

  const refreshPackages = async () => {
    try {
      await loadOfferings();
    } catch (e) {
      console.log("Error loading offerings", e);
    }
  };

  const purchasePackage = async (pack: PurchasesPackage) => {
    try {
      await ensureConfigured();
      await Purchases.purchasePackage(pack);
    } catch (e) {
      console.log("Error purchasing package", e);
    }
  };

  const getCustomerInfo = async (): Promise<CustomerInfo | null> => {
    try {
      await ensureConfigured();
      return await Purchases.getCustomerInfo();
    } catch (e) {
      console.log("Error getting customer info", e);
      return null;
    }
  };

  const updateCustomerInfo = async (info: CustomerInfo) => {
    if (!user) {
      console.error("User not found");
      return;
    }
    try {
      await ensureConfigured();
    } catch (e) {
      console.log("Error ensuring RevenueCat configured", e);
      return;
    }
    const customerInfo = await Purchases.getCustomerInfo();

    let updatedUser: IUser = {
      ...user,
      isSubscribed: false,
      subscriptionStartDate: null,
      subscriptionEndDate: null,
    };

    if (customerInfo.entitlements.active["pro"]) {
      updatedUser = {
        ...updatedUser,
        isSubscribed: true,
        subscriptionStartDate: new Date(
          customerInfo.entitlements.active["pro"].latestPurchaseDate,
        ),
        subscriptionEndDate: new Date(
          customerInfo.entitlements.active["pro"].expirationDate || "",
        ),
      };
      console.log(
        "Purchase and verification successful, updating subscription...",
      );
    }

    // If no changes to user, don't update
    if (JSON.stringify(updatedUser) === JSON.stringify(user)) {
      console.log("No changes to user");
      return;
    }

    // Check if this is the user's first subscription (they weren't subscribed before)
    const isFirstTimeSubscription =
      !user.isSubscribed && updatedUser.isSubscribed;

    // Update auth store
    useAuthStore.getState().restoreAuth(updatedUser);
    console.log("Updated user in auth store");

    // Save to AsyncStorage
    await AsyncStorage.setItem("auth_user", JSON.stringify(updatedUser));
    console.log("Updated user in AsyncStorage");

    // Update the database
    try {
      console.log("Attempting to update user subscription in database...");
      const response = await api.updateUserSubscription(user._id, {
        isSubscribed: true,
        subscriptionStartDate: updatedUser.subscriptionStartDate || null,
        subscriptionEndDate: updatedUser.subscriptionEndDate || null,
      });

      console.log("API Response:", response);

      if (response.success) {
        console.log("User subscription successfully updated in database");

        // If this is the user's first subscription, automatically check them in
        if (isFirstTimeSubscription) {
          console.log(
            "First time subscription detected, performing automatic check-in...",
          );

          try {
            // Import the streak store to perform automatic check-in
            // const { useStreakStore } = await import("./useStore.js");
            const { checkIn } = useStreakStore.getState();

            // Perform automatic check-in with default values
            const checkInResult = await checkIn(
              user._id,
              true,
              "Welcome to your journey! Your first check-in has been completed automatically.",
              4,
            );

            if (checkInResult) {
              console.log("Automatic check-in successful for new subscriber");

              // Mark that this user has been automatically checked in for their first day
              await setFirstDayAutoCheckin(user._id);
            } else {
              console.error("Automatic check-in failed for new subscriber");
            }
          } catch (checkInError) {
            console.error("Error performing automatic check-in:", checkInError);
          }
        }

        // Only navigate to Main if everything was successful
        console.log("Navigating to Main screen...");
        navigation.reset({
          index: 0,
          routes: [{ name: "Main" }],
        });
      } else {
        console.error("API returned success:false when updating subscription");
        // If database update fails, revert the local changes
        useAuthStore.getState().restoreAuth(user);
        await AsyncStorage.setItem("auth_user", JSON.stringify(user));
      }
    } catch (dbError) {
      console.error("Error updating user subscription in database:", dbError);
      useAuthStore.getState().restoreAuth(user);
      await AsyncStorage.setItem("auth_user", JSON.stringify(user));
    }
  };

  return (
    <RevenueCatContext.Provider
      value={{ packages, purchasePackage, updateCustomerInfo, refreshPackages, getCustomerInfo }}
    >
      {children}
    </RevenueCatContext.Provider>
  );
};

const useRevenueCat = () => {
  const context = useContext(RevenueCatContext);
  if (!context) {
    throw new Error("useRevenueCat must be used within a RevenueCatProvider");
  }
  return context;
};

export default useRevenueCat;
