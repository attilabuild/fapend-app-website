// @ts-ignore
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import TabBar from "components/navigation/TabBar";
import { Text, TouchableOpacity } from "react-native";
import { COLORS, SPACING } from "utils/theme";
import { Ionicons } from "@expo/vector-icons";
import HomeScreen from "screens/HomeScreen";
import AnalyticsScreen from "screens/AnalyticsScreen";
import LibraryScreen from "screens/LibraryScreen";
import CommunityScreen from "screens/CommunityScreen";
import JournalScreen from "screens/JournalScreen";

type MainTabParamList = {
  Home: undefined;
  History: undefined;
  Library: undefined;
  Community: undefined;
  Journal: undefined;
};

const Tab = createBottomTabNavigator<MainTabParamList>();

const TabNavigator = () => {
  return (
    <Tab.Navigator
      tabBar={(props: any) => <TabBar {...props} />}
      screenOptions={({ route, navigation }: any) => ({
        tabBarShowLabel: false,
        headerStyle: {
          backgroundColor: COLORS.background,
        },
        sceneStyle: { backgroundColor: COLORS.background },
        headerTitle: "",
        headerLeft: () => (
          <Text
            style={{
              color: COLORS.textPrimary,
              fontSize: 24,
              fontWeight: "bold",
              letterSpacing: 1,
              marginLeft: SPACING.lg,
            }}
          >
            {route.name}
          </Text>
        ),
        headerRight: () => (
          <TouchableOpacity
            style={{ padding: SPACING.xs, marginRight: SPACING.lg }}
            onPress={() => navigation.navigate("Profile")}
          >
            <Ionicons
              name="person-circle"
              size={32}
              color={COLORS.textPrimary}
            />
          </TouchableOpacity>
        ),
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="History" component={AnalyticsScreen} />
      <Tab.Screen name="Library" component={LibraryScreen} />
      <Tab.Screen name="Community" component={CommunityScreen} />
      <Tab.Screen name="Journal" component={JournalScreen} />
    </Tab.Navigator>
  );
};

export default TabNavigator;
