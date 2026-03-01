import { View } from "react-native";
import RevenueCatUI from "react-native-purchases-ui";
import React, { useEffect } from "react";
import {
  captureEvent,
  captureScreen,
  POST_HOG_EVENTS,
  POST_HOG_SCREENS,
} from "lib/posthog";
import useRevenueCat from "hooks/useRevenueCat";

const PaywallScreen = () => {
  const { updateCustomerInfo } = useRevenueCat();

  useEffect(() => {
    captureScreen(POST_HOG_SCREENS.PAYWALL);
  }, []);

  return (
    <View style={{ flex: 1 }}>
      <RevenueCatUI.Paywall
        onPurchaseStarted={() => captureEvent(POST_HOG_EVENTS.PURCHASE_STARTED)}
        onPurchaseCompleted={async ({ customerInfo }) => {
          await updateCustomerInfo(customerInfo);
          captureEvent(POST_HOG_EVENTS.PURCHASE_COMPLETED);
        }}
        onPurchaseError={() => captureEvent(POST_HOG_EVENTS.PURCHASE_ERROR)}
        onRestoreCompleted={() =>
          captureEvent(POST_HOG_EVENTS.RESTORE_COMPLETED)
        }
        onDismiss={() => captureEvent(POST_HOG_EVENTS.PAYWALL_DISMISSED)}
      />
    </View>
  );
};

export default PaywallScreen;