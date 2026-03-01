# NoFap App

A React Native application to help users overcome porn addiction by providing tools for tracking progress, accessing educational resources, and connecting with a supportive community.

## Features

- Track your progress with streak counter
- Daily check-ins to maintain accountability
- Journal feature for self-reflection
- Educational resources about addiction recovery
- Community support system
- Achievement system to celebrate milestones
- Panic button with breathing exercises

## Recent Updates and Optimizations

### 1. Improved Offline Check-in Functionality
The app now properly handles check-ins while offline:
- Network status detection shows an indicator when offline
- All check-in data is saved locally first before API sync attempts
- Robust error handling ensures user progress is never lost
- Local-first approach prioritizes user data integrity

### 2. Performance Optimizations
Several performance improvements have been implemented:
- Component memoization to reduce unnecessary re-renders
- Parallel data loading with Promise.all
- Error boundaries to prevent app crashes
- Extracted and memoized components
- Optimized state management
- Improved AsyncStorage handling

### 3. UI/UX Enhancements
- Added visual feedback for interactions (haptic feedback)
- Improved button states and transitions
- Enhanced error messages with clearer action steps
- Offline mode indicators
- Shadow effects for improved visual hierarchy

## Installation

### Prerequisites
- Node.js (14.x or newer)
- npm or yarn
- Expo CLI
- iOS Simulator (Mac) or Android Emulator

### Setup Instructions
1. Clone the repository
```
git clone https://github.com/yourusername/nofapapp.git
cd nofapapp
```

2. Install dependencies
```
npm install
```

3. Install additional dependencies for offline functionality
```
npm install @react-native-community/netinfo
```

4. Start the development server
```
npx expo start
```

## Offline Mode Setup
To fully enable offline functionality, ensure you've installed the NetInfo package:

```bash
npm install @react-native-community/netinfo
```

After installation, rebuild your app:
```bash
npx expo start --clear
```

## Environment Setup

To use RevenueCat for in-app purchases, you need to set up the following environment variables:

1. Create a `.env` file in the root of the project
2. Add your RevenueCat API keys to the file:

```
REVENUECAT_API_KEY_IOS=your_ios_api_key_here
REVENUECAT_API_KEY_ANDROID=your_android_api_key_here
```

3. Replace `your_ios_api_key_here` and `your_android_api_key_here` with your actual RevenueCat API keys

## Code Structure

- `assets/` - Images, fonts and other static resources
- `components/` - Reusable UI components
- `contexts/` - React context providers
- `hooks/` - Custom React hooks
- `navigation/` - Navigation configuration
- `screens/` - App screens
- `services/` - API and service functions
- `types/` - TypeScript type definitions
- `utils/` - Utility functions
- `App.tsx` - Main app component

## Development Best Practices

1. **Data Persistence:**
   - Always save data locally first before API calls
   - Implement robust error handling
   - Use AsyncStorage for persistent data

2. **Performance:**
   - Memoize components with React.memo for complex components
   - Use useCallback for functions passed as props
   - Implement virtualized lists for long scrolling content
   - Split code into smaller components

3. **Offline Support:**
   - Check network status before API calls
   - Provide clear feedback when offline
   - Implement sync mechanisms for when connection returns

4. **UI/UX:**
   - Maintain consistent spacing using the theme utility
   - Include loading states for all async operations
   - Provide clear error messages
   - Use haptic feedback for important interactions

## Troubleshooting

### Offline Check-in Not Working
1. Verify NetInfo is properly installed
2. Check for any console errors related to AsyncStorage
3. Ensure you're properly handling error boundaries

### Performance Issues
1. Use the Expo DevTools performance monitor to identify bottlenecks
2. Look for unnecessary re-renders with React DevTools
3. Check for unintentional re-creation of reference values (objects, arrays, functions)

## License
MIT 