import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StyleSheet } from 'react-native';
import { SafeAreaProvider } from "react-native-safe-area-context"
import { Toaster } from 'sonner-native';
import HomeScreen from "./screens/HomeScreen"
import OnboardingScreen from "./screens/OnboardingScreen"
import FinalizationScreen from "./screens/FinalizationScreen"
import BenefitsScreen from "./screens/BenefitsScreen"
import WomanResultsScreen from "./screens/WomanResultsScreen"
import ManResultsScreen from "./screens/ManResultsScreen"
import ReviewsScreen from "./screens/ReviewsScreen"
import ScanFaceScreen from "./screens/ScanFaceScreen"
import PaywallScreen from "./screens/PaywallScreen"
import MainAppScreen from "./screens/MainAppScreen"
import AnalysisScreen from './screens/AnalysisScreen'
import ResultsScreen from './screens/ResultsScreen'
import ProductsScreen from './screens/ProductsScreen'
import ProgressScreen from './screens/ProgressScreen'
import RoutineScreen from './screens/RoutineScreen'
import SettingsScreen from './screens/SettingsScreen'
import ScanProductsScreen from './screens/ScanProductsScreen'
import ScanAnalyzingScreen from './screens/ScanAnalyzingScreen'
import ScanResultScreen from './screens/ScanResultScreen'
import ManualProductEntryScreen from './screens/ManualProductEntryScreen'

const Stack = createNativeStackNavigator();

function RootStack() {
  return (
    <Stack.Navigator screenOptions={{
      headerShown: false
    }}>
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="Onboarding" component={OnboardingScreen} />
      <Stack.Screen name="Finalization" component={FinalizationScreen} />
      <Stack.Screen name="Benefits" component={BenefitsScreen} />
      <Stack.Screen name="WomanResults" component={WomanResultsScreen} />
      <Stack.Screen name="ManResults" component={ManResultsScreen} />
      <Stack.Screen name="Reviews" component={ReviewsScreen} />
      <Stack.Screen name="ScanFace" component={ScanFaceScreen} />
      <Stack.Screen name="Analysis" component={AnalysisScreen} />
      <Stack.Screen name="Results" component={ResultsScreen} />
      <Stack.Screen name="Products" component={ProductsScreen} />
      <Stack.Screen name="ScanProducts" component={ScanProductsScreen} />
      <Stack.Screen name="ScanAnalyzing" component={ScanAnalyzingScreen} />
      <Stack.Screen name="ScanResult" component={ScanResultScreen} />
      <Stack.Screen name="ManualProductEntry" component={ManualProductEntryScreen} />
      <Stack.Screen name="Paywall" component={PaywallScreen} />
      <Stack.Screen name="MainApp" component={MainAppScreen} />
      <Stack.Screen name="Progress" component={ProgressScreen} />
      <Stack.Screen name="Routine" component={RoutineScreen} />
      <Stack.Screen name="Settings" component={SettingsScreen} />
    </Stack.Navigator>
  );
}

export default function App() {
  return (
    <SafeAreaProvider style={styles.container}>
      <Toaster />
      <NavigationContainer>
        <RootStack />
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    userSelect: "none"
  }
});