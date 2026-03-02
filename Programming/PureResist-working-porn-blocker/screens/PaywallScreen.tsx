import { View } from "react-native";
import RevenueCatUI from "react-native-purchases-ui";
import React from "react";
import useRevenueCat from "hooks/useRevenueCat";

const PaywallScreen = () => {
  const { updateCustomerInfo } = useRevenueCat();

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