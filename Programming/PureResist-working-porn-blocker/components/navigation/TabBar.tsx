import React from "react";
import { View, TouchableOpacity, StyleSheet } from "react-native";
// @ts-expect-error navigation import
import { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import { COLORS, SPACING } from "../../utils/theme";
import { Button } from "../ui/Button";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const TabBar: React.FC<BottomTabBarProps> = ({
  state,
  descriptors,
  navigation,
}) => {
  const { bottom } = useSafeAreaInsets();
  // Map route names to icons
  const getIconName = (
    routeName: string,
    isFocused: boolean,
  ): keyof typeof Ionicons.glyphMap => {
    switch (routeName) {
      case "Home":
        return isFocused ? "home" : "home-outline";
      case "History":
        return isFocused ? "stats-chart" : "stats-chart-outline";
      case "Library":
        return isFocused ? "book" : "book-outline";
      case "Community":
        return isFocused ? "people" : "people-outline";
      case "Journal":
        return isFocused ? "create" : "create-outline";
      default:
        return "help-circle-outline";
    }
  };

  // Handle panic button press
  const handlePanicPress = () => {
    navigation.navigate("PanicScreen");
  };

  return (
    <View style={[styles.container, { paddingBottom: bottom }]}>
      {/* `Panic Button` - Sits above the tab bar */}
      <View style={styles.panicButtonContainer}>
        <Button
          title="Panic Button"
          variant="danger"
          leftIcon={"alert-circle" as keyof typeof Ionicons.glyphMap}
          onPress={handlePanicPress}
          fullWidth
          style={styles.panicButton}
        />
      </View>

      {/* Tab Bar */}
      <View style={styles.tabBar}>
        {state.routes.map(
          (route: { key: string; name: string }, index: number) => {
            const { options } = descriptors[route.key];
            const isFocused = state.index === index;

            const onPress = () => {
              const event = navigation.emit({
                type: "tabPress",
                target: route.key,
                canPreventDefault: true,
              });

              if (!isFocused && !event.defaultPrevented) {
                navigation.navigate(route.name);
              }
            };

            const iconName = getIconName(route.name, isFocused);

            return (
              <TouchableOpacity
                key={route.key}
                accessibilityRole="button"
                accessibilityState={isFocused ? { selected: true } : {}}
                accessibilityLabel={options.tabBarAccessibilityLabel}
                testID={options.tabBarTestID}
                onPress={onPress}
                style={[styles.tabItem]}
              >
                <Ionicons
                  name={iconName}
                  size={24}
                  color={isFocused ? "#FFFFFF" : COLORS.textSecondary}
                />
              </TouchableOpacity>
            );
          },
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.background,
  },
  panicButtonContainer: {
    paddingHorizontal: SPACING.md,
    paddingBottom: SPACING.md,
  },
  panicButton: {
    width: "100%",
    height: 40,
    borderRadius: 30,
  },
  tabBar: {
    flexDirection: "row",
    backgroundColor: COLORS.background,
    borderTopWidth: 0,
    justifyContent: "space-between",
    paddingHorizontal: 32,
  },
  tabItem: {
    width: 32,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 4,
    paddingVertical: 4,
  },
});

export default TabBar;
