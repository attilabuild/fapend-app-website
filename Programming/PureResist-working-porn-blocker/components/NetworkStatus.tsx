import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import { COLORS } from '../utils/theme';

const NetworkStatus: React.FC = () => {
  const [isConnected, setIsConnected] = useState<boolean | null>(true);

  useEffect(() => {
    // Subscribe to network state updates
    const unsubscribe = NetInfo.addEventListener(state => {
      setIsConnected(state.isConnected);
    });

    // Check initial connection state
    NetInfo.fetch().then(state => {
      setIsConnected(state.isConnected);
    });

    // Cleanup subscription on unmount
    return () => {
      unsubscribe();
    };
  }, []);

  // Don't render anything if connected
  if (isConnected) {
    return null;
  }

  // Show warning when offline
  return (
    <View style={styles.container}>
      <Text style={styles.text}>
        No internet connection. Some features may be unavailable.
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.danger,
    padding: 10,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  text: {
    color: 'white',
    fontWeight: 'bold',
  },
});

export default NetworkStatus; 