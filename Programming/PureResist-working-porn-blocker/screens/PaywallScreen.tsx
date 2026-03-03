import { View, ActivityIndicator } from "react-native";
import RevenueCatUI from "react-native-purchases-ui";
import React, { useEffect, useState } from "react";
import useRevenueCat from "hooks/useRevenueCat";

const PaywallScreen = () => {
  const { updateCustomerInfo, refreshPackages } = useRevenueCat();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    refreshPackages().finally(() => setReady(true));
  }, [refreshPackages]);

  if (!ready) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <RevenueCatUI.Paywall
        onPurchaseCompleted={async ({ customerInfo }) => {
          await updateCustomerInfo(customerInfo);
        }}
      />
    </View>
  );
};

export default PaywallScreen;