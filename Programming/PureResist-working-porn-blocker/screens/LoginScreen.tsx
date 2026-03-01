// @ts-nocheck
import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Platform,
  Alert,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import * as AppleAuthentication from "expo-apple-authentication";
import { COLORS } from "../utils/theme";
import { Ionicons, FontAwesome, AntDesign } from "@expo/vector-icons";
import { useAuthStore } from "../hooks/useStore";
import { generateUsername, generateUsernameFromName } from "../utils/generateUsername";
import * as Crypto from 'expo-crypto';

const LoginScreen = () => {
  const navigation = useNavigation();
  const { login } = useAuthStore();
  const [error, setError] = useState("");

  const handleAppleLogin = async () => {
    try {

      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
      });

      // Use user identifier as a fallback for email
      const userEmail = credential.email || `${credential.user}@privaterelay.appleid.com`;

      // Generate a secure password hash using the Apple user ID and a salt
      const salt = await Crypto.getRandomBytesAsync(16);
      const saltHex = Buffer.from(salt).toString('hex');
      const passwordHash = await Crypto.digestStringAsync(
        Crypto.CryptoDigestAlgorithm.SHA256,
        `${credential.user}${saltHex}`
      );

      // Special handling for TestFlight builds which might behave differently
      const isTestFlight = Platform.OS === "ios" && __DEV__ === false;

      // Login with the received credentials and secure hash
      const result = await login(userEmail, passwordHash);

      if (result === "home") {

        navigation.replace("Main");
      } else if (result === "onboarding") {
        
        navigation.replace("Onboarding");
      } else {
        // Check if the error is "user not found" - in this case, register a new account
        const error = useAuthStore.getState().error;
        if (
          error &&
          (error.includes("not found") ||
            error.includes("complete the registration"))
        ) {

          // Generate username based on full name if available, otherwise generate a random one
          let username;
          if (credential.fullName?.givenName) {
            username = generateUsernameFromName(credential.fullName.givenName);
          } else {
            username = generateUsername();
          }

          // Auto-register with the Apple credentials and secure hash
          const registerResult = await useAuthStore.getState().register(
            username,
            userEmail,
            passwordHash, // Use the secure hash instead of raw Apple user ID
          );

          if (registerResult === "onboarding") {
            navigation.replace("Onboarding");
          } else {
            setError("Registration failed");
          }
        } else {
          setError(error || "Login failed");
        }
      }
    } catch (error) {
      console.error("Apple authentication error:", error);
      if (error.code === "ERR_CANCELED") {
        setError("Sign in was cancelled");
      } else {
        setError("An error occurred during sign in");
      }
    }
  };

  return (
    <View style={styles.container}>
      {/* Logo and App Name */}
      <View style={styles.header}>
        <Image source={require("../assets/icon.png")} style={styles.logo} />
        <Text style={styles.appName}>PureResist</Text>
      </View>
      {/* Illustration */}
      <Image
        source={require("../assets/mobilemockup.png")}
        style={styles.illustration}
      />
      <Text style={styles.subtitle}>
        Sign in to access all of PureResist's features.
      </Text>
      {/* Social Buttons */}
      <AppleAuthentication.AppleAuthenticationButton
        buttonType={AppleAuthentication.AppleAuthenticationButtonType.SIGN_IN}
        buttonStyle={AppleAuthentication.AppleAuthenticationButtonStyle.WHITE}
        cornerRadius={28}
        style={styles.appleButton}
        onPress={handleAppleLogin}
      />
      <TouchableOpacity
        style={styles.emailButton}
        onPress={() => navigation.navigate("EmailLogin")}
      >
        
        <View style={styles.buttonContent}>
          <Ionicons name="mail" size={22} color="#fff" />
          <Text style={styles.emailButtonText}>Continue with Email</Text>
        </View>
      </TouchableOpacity>
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
    alignItems: "center",
    paddingTop: 120,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  logo: {
    width: 40,
    height: 40,
    marginRight: 8,
  },
  appName: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#fff",
  },
  illustration: {
    width: 340,
    height: 450,
    marginTop:24,
    marginBottom: 24,
    resizeMode: "contain",
  },
  subtitle: {
    color: "#fff",
    fontSize: 16,
    marginBottom: 24,
    textAlign: "center",
    fontWeight: "500",
  },
  appleButton: {
    width: "85%",
    height: 48,
    marginBottom: 12,
    alignSelf: "center",
  },
  emailButton: {
    backgroundColor: COLORS.accent,
    borderRadius: 24,
    height: 48,
    width: "85%",
    marginBottom: 12,
    alignSelf: "center",
    justifyContent: "center",
    alignItems: "center",
  },
  buttonContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  emailButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
    marginLeft: 10,
  },
  error: {
    color: COLORS.danger,
    marginTop: 8,
    textAlign: "center",
  },
});

export default LoginScreen;

