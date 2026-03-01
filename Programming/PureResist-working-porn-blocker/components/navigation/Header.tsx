import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";

import { COLORS, SPACING } from "../../utils/theme";
// @ts-expect-error import error
import { useNavigation, useRoute } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface HeaderProps {
  showProfileIcon?: boolean;
  title: string;
}

const Header: React.FC<HeaderProps> = ({ showProfileIcon = true, title }) => {
  const navigation = useNavigation();
  const { top } = useSafeAreaInsets();
  return (
    <View style={[styles.headerContainer, { paddingTop: top }]}>
      <Text style={styles.logoText}>{title}</Text>
      {showProfileIcon && (
       
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: SPACING.lg,
    backgroundColor: COLORS.background,
  },
  logoText: {
    color: COLORS.textPrimary,
    fontSize: 24,
    fontWeight: "bold",
    letterSpacing: 1,
  },
  iconButton: {
  
  },
  backButton: {
    padding: SPACING.xs,
  },
});

export default Header;
