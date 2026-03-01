import "dotenv/config";
const { getDefaultConfig } = require("expo/metro-config");
const path = require("path");
const withRevenueCat = require("./plugins/revenuecat-plugin");

module.exports = ({ config }) => {
  const baseConfig = {
    owner: "designaxe",
    name: "PureResist",
    slug: "pureresist",
    version: "1.0.39",
    orientation: "portrait",
    icon: "./assets/icon.png",
    userInterfaceStyle: "light",
    newArchEnabled: true,
    splash: {
      image: "./assets/splash-icon.png",
      resizeMode: "contain",
      backgroundColor: "#ffffff",
    },
    ios: {
      supportsTablet: true,
      bundleIdentifier: "com.pureresist.nofapapp",
      infoPlist: {
        ITSAppUsesNonExemptEncryption: false,
        CFBundleAllowMixedLocalizations: true,
        NSFamilyControlsUsageDescription:
          "This app uses Screen Time API to help you block inappropriate content and maintain your recovery goals.",
      },
      buildNumber: "100",
      deploymentTarget: "16.0",
      entitlements: {
        "com.apple.developer.family-controls": true,
      },
      config: {
        usesNonExemptEncryption: false,
      },
    },
    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/adaptive-icon.png",
        backgroundColor: "#ffffff",
      },
      package: "com.pureresist.nofapapp",
      permissions: ["NOTIFICATIONS"],
      versionCode: 6,
      // Performance optimizations
      enableProguardInReleaseBuilds: true,
      enableSeparateBuildPerCPUArchitecture: true,
    },
    web: {
      favicon: "./assets/favicon.png",
    },
    notification: {
      icon: "./assets/notification-icon.png",
      color: "#5D5FEF",
      iosDisplayInForeground: true,
      androidMode: "default",
      androidCollapsedTitle: "NoFap App",
    },
    plugins: [
      [
        "expo-notifications",
        {
          icon: "./assets/notification-icon.png",
          color: "#5D5FEF",
        },
      ],
      "expo-apple-authentication",
      [
        "expo-build-properties",
        {
          ios: {
            deploymentTarget: "16.0",
            useFrameworks: "static",
          },
        },
      ],
      "expo-dev-client",
    ],
    extra: {
      eas: {
        projectId: "cc20cd6a-0aa8-40f1-b501-d7e5cc8dd4be",
      },
    },
  };

  // Apply the RevenueCat plugin
  return withRevenueCat(baseConfig);
};
