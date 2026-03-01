import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { Title, Body, Caption } from './ui/Typography';
import Card from './ui/Card';
import { COLORS, SPACING, RADIUS } from '../utils/theme';
import { LinearGradient } from 'expo-linear-gradient';

interface StreakCardProps {
  lastRelapse: Date | string | null; // Accept both Date and string for compatibility
  longestStreak: number; // Still accepting this prop for compatibility but not displaying it
}

const StreakCard: React.FC<StreakCardProps> = ({ lastRelapse, longestStreak }) => {
  const [timeElapsed, setTimeElapsed] = useState<{ top: string; bottom: string | null }>({ top: '', bottom: null });
  const [currentStreak, setCurrentStreak] = useState<number>(0);
  
  // Calculate streak and time elapsed since streak started
  useEffect(() => {
    const formatTop = (totalSeconds: number) => {
      const days = Math.floor(totalSeconds / 86400);
      const hours = Math.floor((totalSeconds % 86400) / 3600);
      const minutes = Math.floor((totalSeconds % 3600) / 60);
      const seconds = totalSeconds % 60;
      if (days > 0) return `${days} days`;
      if (hours > 0) return `${hours} hours`;
      if (minutes > 0) return `${minutes} minutes`;
      return `${seconds} seconds`;
    };
    const formatBottom = (totalSeconds: number) => {
      const days = Math.floor(totalSeconds / 86400);
      const hours = Math.floor((totalSeconds % 86400) / 3600);
      const minutes = Math.floor((totalSeconds % 3600) / 60);
      const seconds = totalSeconds % 60;
      if (days > 0) return `${hours}hr ${minutes}m ${seconds}s`;
      if (hours > 0) return `${minutes}m ${seconds}s`;
      if (minutes > 0) return `${seconds}s`;
      return '';
    };
    const calculateTimeElapsed = () => {
      const now = new Date();
      let startDate: Date;
      if (!lastRelapse) {
        startDate = now;
      } else {
        startDate = lastRelapse instanceof Date ? lastRelapse : new Date(lastRelapse);
      }
      const diffInMs = now.getTime() - startDate.getTime();
      const totalSeconds = Math.floor(diffInMs / 1000);
      setCurrentStreak(Math.floor(totalSeconds / 86400));
      setTimeElapsed({
        top: formatTop(totalSeconds),
        bottom: formatBottom(totalSeconds)
      });
    };
    calculateTimeElapsed();
    const timer = setInterval(calculateTimeElapsed, 1000);
    return () => clearInterval(timer);
  }, [lastRelapse]);
  
  return (
    <Card style={styles.card}>
      <LinearGradient
        colors={['#1A1C29', '#2A2C39']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradientBackground}
      >
        <View style={styles.header}>
          <Title style={styles.title}>🔥 Streak Journey</Title>
        </View>
        
        <View style={styles.streakContainer}>
          <View style={styles.streakItem}>
            <Title style={styles.streakValue}>{timeElapsed.top}</Title>
            <Body color="#E0E0E0" style={styles.streakLabel}>Current Streak</Body>
          </View>
        </View>
        
        {/* Detailed time display */}
        <View style={styles.detailedTimeContainer}>
          <Body style={styles.detailedTimeText}>{timeElapsed.bottom ? timeElapsed.bottom : null}</Body>
        </View>
      </LinearGradient>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    marginHorizontal: SPACING.md,
    marginVertical: SPACING.sm,
    padding: 0,
    overflow: 'hidden',
    borderRadius: RADIUS.lg,
  },
  gradientBackground: {
    padding: SPACING.md,
    borderRadius: RADIUS.lg,
  },
  header: {
    marginBottom: SPACING.md,
  },
  title: {
    textAlign: 'center',
    fontSize: 22,
    fontWeight: 'bold',
  },
  streakContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: SPACING.md,
  },
  streakItem: {
    alignItems: 'center',
  },
  streakValue: {
    fontSize: 52,
    marginBottom: SPACING.xs,
    color: COLORS.accent,
    fontWeight: 'bold',
  },
  streakLabel: {
    fontSize: 16,
  },
  detailedTimeContainer: {
    alignItems: 'center',
    marginBottom: SPACING.md,
    backgroundColor: 'rgba(255,255,255,0.05)',
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.sm,
  },
  detailedTimeText: {
    color: COLORS.accent,
    fontWeight: 'bold',
    fontSize: 16,
    textAlign: 'center',
  },
});

export default StreakCard; 