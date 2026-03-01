import React, { useEffect } from "react";
import { View, Text, Image, StyleSheet, TouchableOpacity } from "react-native";
import { COLORS } from "../utils/theme";
// @ts-ignore
import { useNavigation } from "@react-navigation/native";
import { Video, ResizeMode } from "expo-av";
import { captureScreen, POST_HOG_EVENTS, POST_HOG_SCREENS } from "lib/posthog";

const CongratulationsScreen = () => {
  const navigation = useNavigation();

  const handleGetStarted = () => {
    captureScreen(POST_HOG_EVENTS.SIGN_IN);
    navigation.replace("Login");
  };

  useEffect(() => {
    captureScreen(POST_HOG_SCREENS.WELCOME);
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.videoContainer}>
        <Video
          source={require("../assets/animation.mp4")}
          style={styles.lottieAnimation}
          resizeMode={ResizeMode.CONTAIN}
          isLooping
          shouldPlay
          isMuted
        />
      </View>
      <Text style={styles.title}>Congratulations!</Text>
      <Text style={styles.subtitle}>
        You're on the way to a healthier lifestyle!
      </Text>
      <TouchableOpacity style={styles.button} onPress={handleGetStarted}>
        <Text style={styles.buttonText}>Get Started</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  videoContainer: {
    width: 200,
    height: 200,
    marginBottom: 32,
    overflow: "hidden",
    borderRadius: 100,
  },
  lottieAnimation: {
    width: "100%",
    height: "100%",
  },
  container: {
    flex: 1,
    backgroundColor: "#000",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
  },
  logo: {
    width: 160,
    height: 160,
    marginBottom: 16,
  },
  appName: {
    fontSize: 32,
    fontWeight: "bold",
    marginBottom: 32,
  },
  title: {
    color: "#fff",
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 12,
    textAlign: "center",
  },
  subtitle: {
    color: "#fff",
    fontSize: 16,
    marginBottom: 40,
    textAlign: "center",
    opacity: 0.8,
  },
  button: {
    backgroundColor: "#fff",
    borderRadius: 30,
    paddingVertical: 14,
    paddingHorizontal: 40,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonText: {
    color: "#000",
    fontSize: 18,
    fontWeight: "600",
  },
});

export default CongratulationsScreen;
