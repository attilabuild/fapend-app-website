import { REVENUECAT_API_KEYS } from "config";
import { createContext, useContext, useEffect, useState } from "react";
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
}

const RevenueCatContext = createContext<RevenueCatContext>({
  packages: null,
  purchasePackage: async () => {},
  updateCustomerInfo: async () => {},
});

export const RevenueCatProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [packages, setPackages] = useState<PurchasesPackage[] | null>(null);
  const navigation = useNavigation();
  const { user } = useAuthStore.getState();

  const loadOfferings = async () => {
    const offerings = await Purchases.getOfferings();
    const currentOfferings = offerings.current;

    if (currentOfferings) {
      setPackages(currentOfferings.availablePackages);
    }
  };

  const purchasePackage = async (pack: PurchasesPackage) => {
    try {
      await Purchases.purchasePackage(pack);
    } catch (e) {
      console.log("Error purchasing package", e);
    }
  };

  const updateCustomerInfo = async (info: CustomerInfo) => {
    // Verify the subscription status with RevenueCat
    if (!user) {
      console.error("User not found");
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
      // If database update fails, revert the local changes
      useAuthStore.getState().restoreAuth(user);
      await AsyncStorage.setItem("auth_user", JSON.stringify(user));
    }
  };

  useEffect(() => {
    const initRevenueCat = async () => {
      try {
        const apiKey =
          Platform.OS === "ios"
            ? REVENUECAT_API_KEYS.ios
            : REVENUECAT_API_KEYS.android;

        await Purchases.configure({ apiKey, appUserID: user?._id });

        Purchases.setLogLevel(LOG_LEVEL.DEBUG);

        Purchases.addCustomerInfoUpdateListener((info) => {
          updateCustomerInfo(info);
        });

        await loadOfferings();
      } catch (e) {
        console.log("Error initializing RevenueCat", e);
      }
    };
    initRevenueCat();
  }, []);

  return (
    <RevenueCatContext.Provider
      value={{ packages, purchasePackage, updateCustomerInfo }}
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
