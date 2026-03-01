import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface PerformanceMetrics {
  renderTime: number;
  componentCount: number;
  memoryUsage?: number;
}

const PerformanceMonitor: React.FC = () => {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    renderTime: 0,
    componentCount: 0,
  });

  useEffect(() => {
    if (__DEV__) {
      const startTime = performance.now();
      
      // Monitor render performance
      const measureRenderTime = () => {
        const endTime = performance.now();
        setMetrics(prev => ({
          ...prev,
          renderTime: endTime - startTime,
        }));
      };

      // Measure after component mount
      setTimeout(measureRenderTime, 0);

      // Memory monitoring (if available)
      if ((performance as any).memory) {
        const memory = (performance as any).memory;
        setMetrics(prev => ({
          ...prev,
          memoryUsage: Math.round(memory.usedJSHeapSize / 1024 / 1024), // MB
        }));
      }
    }
  }, []);

  // Only show in development
  if (!__DEV__) {
    return null;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🔍 Performance</Text>
      <Text style={styles.metric}>
        Render: {metrics.renderTime.toFixed(2)}ms
      </Text>
      {metrics.memoryUsage && (
        <Text style={styles.metric}>
          Memory: {metrics.memoryUsage}MB
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 50,
    right: 10,
    backgroundColor: 'rgba(0,0,0,0.8)',
    padding: 8,
    borderRadius: 4,
    zIndex: 9999,
    minWidth: 120,
  },
  title: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  metric: {
    color: '#00ff00',
    fontSize: 10,
    fontFamily: 'monospace',
  },
});

export default PerformanceMonitor; 