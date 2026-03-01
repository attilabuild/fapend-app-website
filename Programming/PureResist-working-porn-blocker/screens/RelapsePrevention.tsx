import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Title, Subtitle, Body, Caption } from '../components/ui/Typography';
import Card from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { COLORS, SPACING, RADIUS, FONTS } from '../utils/theme';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore, useStreakStore } from '../hooks/useStore';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Define interfaces for data types
interface DangerZone {
  id: string;
  name: string;
  description: string;
  riskLevel: 'high' | 'medium' | 'low';
  icon: keyof typeof Ionicons.glyphMap;
  tips: string[];
}

interface RelapseTrigger {
  name: string;
  count: number;
}

interface DayRelapseData {
  day: string;
  count: number;
}

interface TimeRelapseData {
  timeSlot: string;
  count: number;
}

// Useful constants
const DAYS_OF_WEEK = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const TIME_SLOTS = [
  '12am-3am', '3am-6am', '6am-9am', '9am-12pm', 
  '12pm-3pm', '3pm-6pm', '6pm-9pm', '9pm-12am'
];

// Mock data (in a real app, this would come from analyzing user journals and relapses)
const DANGER_ZONES: DangerZone[] = [
  {
    id: '1',
    name: 'Late Night Browsing',
    description: 'Most relapses happen between 9 PM and 1 AM when willpower is lower',
    riskLevel: 'high',
    icon: 'moon',
    tips: [
      'Turn on device downtime or screen time limits after 9 PM',
      'Keep your phone outside your bedroom at night',
      'Have a relaxing bedtime routine without screens',
      'Use Night Shift or similar settings to reduce blue light',
      'Try reading a physical book instead of browsing'
    ]
  },
  {
    id: '2',
    name: 'Stress and Anxiety',
    description: 'Stress is a common trigger for seeking relief through porn',
    riskLevel: 'high',
    icon: 'thunderstorm',
    tips: [
      'Practice the breathing exercises in the app when stressed',
      'Exercise for at least 20 minutes to reduce stress hormones',
      'Try journaling about whats causing your stress',
      'Call a friend or family member for support',
      'Consider meditation or mindfulness practices'
    ]
  },
  {
    id: '3',
    name: 'Boredom',
    description: 'Having nothing to do often leads to mindless browsing and triggers',
    riskLevel: 'medium',
    icon: 'cafe',
    tips: [
      'Create a list of non-screen activities you enjoy',
      'Start a new hobby that keeps your hands busy',
      'Get outside and change your environment',
      'Call a friend or family member',
      'Exercise or go for a walk'
    ]
  },
  {
    id: '4',
    name: 'Weekend Isolation',
    description: 'Being alone at home with free time can increase risk',
    riskLevel: 'medium',
    icon: 'calendar',
    tips: [
      'Plan your weekends in advance with activities',
      'Join groups or classes that meet on weekends',
      'Schedule time with friends or family',
      'Volunteer for weekend events or organizations',
      'Study or work in public places like libraries or cafes'
    ]
  },
  {
    id: '5',
    name: 'Alcohol Consumption',
    description: 'Alcohol reduces inhibitions and decision-making ability',
    riskLevel: 'medium',
    icon: 'wine',
    tips: [
      'Be mindful of how much you drink',
      'Have a trusted friend with you when drinking',
      'Set boundaries for yourself before social events',
      'Consider reducing or eliminating alcohol if it is a consistent trigger',
      'Drink water between alcoholic drinks'
    ]
  },
  {
    id: '6',
    name: 'Social Media',
    description: 'Algorithms often show triggering content that leads to relapses',
    riskLevel: 'high',
    icon: 'phone-portrait',
    tips: [
      'Use app blockers or screen time limits for social apps',
      'Unfollow accounts that post potentially triggering content',
      'Take regular breaks from social media (try a 24-hour detox)',
      'Turn off autoplay features on video platforms',
      'Consider removing social media apps from your phone'
    ]
  }
];

const RelapsePrevention = () => {
  const { user } = useAuthStore();
  const { relapses } = useStreakStore();
  const [selectedZone, setSelectedZone] = useState<DangerZone | null>(null);
  const [personalDangerZones, setPersonalDangerZones] = useState<DangerZone[]>([]);
  const [topTriggers, setTopTriggers] = useState<RelapseTrigger[]>([]);
  const [dayData, setDayData] = useState<DayRelapseData[]>([]);
  const [timeData, setTimeData] = useState<TimeRelapseData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Initialize data on component mount
  useEffect(() => {
    if (user) {
      analyzeRelapseData();
    }
  }, [user, relapses]);
  
  // Analyze relapse data to identify patterns
  const analyzeRelapseData = async () => {
    setIsLoading(true);
    
    try {
      // Get journal entries that might contain trigger information
      const journalEntriesJson = await AsyncStorage.getItem('nofap_journal_entries');
      const journalEntries = journalEntriesJson ? JSON.parse(journalEntriesJson) : [];
      
      // Filter for current user's entries
      const userEntries = journalEntries.filter((entry: any) => entry.userId === user?._id);
      
      // Count triggers from journal entries
      const triggerCounts: {[key: string]: number} = {};
      userEntries.forEach((entry: any) => {
        if (entry.triggers && Array.isArray(entry.triggers)) {
          entry.triggers.forEach((trigger: string) => {
            triggerCounts[trigger] = (triggerCounts[trigger] || 0) + 1;
          });
        }
      });
      
      // Convert to array and sort by count
      const sortedTriggers = Object.keys(triggerCounts).map(name => ({
        name,
        count: triggerCounts[name]
      })).sort((a, b) => b.count - a.count);
      
      setTopTriggers(sortedTriggers.slice(0, 3)); // Top 3 triggers
      
      // Analyze day of week patterns (using mock data for now)
      // In a real app, you would analyze the dates from relapses
      const mockDayData = DAYS_OF_WEEK.map(day => ({
        day,
        count: Math.floor(Math.random() * 5) // Random count for demonstration
      }));
      
      setDayData(mockDayData);
      
      // Analyze time of day patterns (using mock data for now)
      // In a real app, you would analyze the time from relapses
      const mockTimeData = TIME_SLOTS.map(timeSlot => ({
        timeSlot,
        count: Math.floor(Math.random() * 10) // Random count for demonstration
      }));
      
      setTimeData(mockTimeData);
      
      // Determine personal danger zones based on analysis
      // In a real app, this would use actual patterns
      // For now, just select a few from the predefined ones
      setPersonalDangerZones(DANGER_ZONES.slice(0, 3));
      
    } catch (error) {
      console.error('Failed to analyze relapse data:', error);
      Alert.alert('Error', 'Failed to analyze your data. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Get color based on risk level
  const getRiskColor = (level: DangerZone['riskLevel']) => {
    switch (level) {
      case 'high': return COLORS.danger;
      case 'medium': return COLORS.warning || '#FFA500';
      case 'low': return COLORS.success;
      default: return COLORS.accent;
    }
  };
  
  // Get day with highest relapse count
  const getMostRiskyDay = () => {
    if (dayData.length === 0) return null;
    
    return dayData.reduce((prev, current) => 
      (prev.count > current.count) ? prev : current
    );
  };
  
  // Get time slot with highest relapse count
  const getMostRiskyTime = () => {
    if (timeData.length === 0) return null;
    
    return timeData.reduce((prev, current) => 
      (prev.count > current.count) ? prev : current
    );
  };
  
  // Find highest value in array for scaling visualizations
  const getMaxValue = (data: {count: number}[]) => {
    return Math.max(...data.map(item => item.count), 1);
  };
  
  // Calculate bar height as a percentage of the container height
  const getBarHeight = (count: number, maxValue: number): number => {
    // Ensure at least a minimal height for visibility, max 100%
    return Math.max(5, Math.min(100, (count / maxValue) * 100));
  };
  
  // Render danger zone details view
  const renderZoneDetails = () => {
    if (!selectedZone) return null;
    
    return (
      <View style={styles.detailsContainer}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => setSelectedZone(null)}
        >
          <Ionicons name="arrow-back" size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>
        
        <ScrollView 
          style={styles.detailsScrollView}
          contentContainerStyle={styles.detailsScrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.detailsHeader}>
            <View style={[
              styles.iconContainer,
              { backgroundColor: getRiskColor(selectedZone.riskLevel) + '20' }
            ]}>
              <Ionicons 
                name={selectedZone.icon} 
                size={40} 
                color={getRiskColor(selectedZone.riskLevel)} 
              />
            </View>
            
            <View style={styles.riskBadge}>
              <Caption style={styles.riskText}>
                {selectedZone.riskLevel.toUpperCase()} RISK
              </Caption>
            </View>
          </View>
          
          <Title style={styles.detailsTitle}>{selectedZone.name}</Title>
          <Body style={styles.detailsDescription}>{selectedZone.description}</Body>
          
          <View style={styles.tipsContainer}>
            <Subtitle style={styles.tipsTitle}>Prevention Tips</Subtitle>
            
            {selectedZone.tips.map((tip, index) => (
              <View key={index} style={styles.tipItem}>
                <View style={styles.tipBullet}>
                  <Body style={styles.tipNumber}>{index + 1}</Body>
                </View>
                <Body style={styles.tipText}>{tip}</Body>
              </View>
            ))}
            
            <Button
              title="Add to My Prevention Plan"
              variant="primary"
              style={styles.saveButton}
              onPress={() => {
                Alert.alert(
                  'Added to Plan',
                  `${selectedZone.name} has been added to your prevention plan.`,
                  [{ text: 'OK', onPress: () => setSelectedZone(null) }]
                );
              }}
            />
          </View>
        </ScrollView>
      </View>
    );
  };
  
  // Render danger zones list
  const renderDangerZones = () => {
    return (
      <View style={styles.zonesContainer}>
        <Subtitle style={styles.sectionTitle}>Your Danger Zones</Subtitle>
        
        {personalDangerZones.map(zone => (
          <TouchableOpacity
            key={zone.id}
            style={styles.zoneCard}
            onPress={() => setSelectedZone(zone)}
          >
            <View style={styles.zoneCardContent}>
              <View style={[
                styles.zoneIconContainer,
                { backgroundColor: getRiskColor(zone.riskLevel) + '20' }
              ]}>
                <Ionicons name={zone.icon} size={28} color={getRiskColor(zone.riskLevel)} />
              </View>
              
              <View style={styles.zoneInfo}>
                <Title style={styles.zoneName}>{zone.name}</Title>
                <Body style={styles.zoneDescription} numberOfLines={2}>
                  {zone.description}
                </Body>
              </View>
              
              <View style={[
                styles.riskIndicator,
                { backgroundColor: getRiskColor(zone.riskLevel) }
              ]}>
                <Caption style={styles.riskIndicatorText}>
                  {zone.riskLevel.charAt(0).toUpperCase()}
                </Caption>
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </View>
    );
  };
  
  // Render pattern analysis with visualizations
  const renderPatternAnalysis = () => {
    const riskyDay = getMostRiskyDay();
    const riskyTime = getMostRiskyTime();
    
    return (
      <View style={styles.analysisContainer}>
        <Subtitle style={styles.sectionTitle}>Pattern Analysis</Subtitle>
        
        <Card style={styles.analysisCard}>
          <View style={styles.cardHeader}>
            <Subtitle style={styles.cardTitle}>Time Patterns</Subtitle>
            <Ionicons name="time" size={22} color={COLORS.textSecondary} />
          </View>
          
          <Body style={styles.analysisText}>
            {riskyTime ? 
              `Your highest risk time is between ${riskyTime.timeSlot}. Consider setting up blocks or activities during this time.` :
              'Not enough data to determine your risk patterns yet.'
            }
          </Body>
          
          <View style={styles.chartContainer}>
            {timeData.length > 0 && (
              <View style={styles.barChart}>
                {timeData.map((item, index) => (
                  <View key={index} style={styles.barColumn}>
                    <View 
                      style={[
                        styles.bar, 
                        {
                          height: getBarHeight(item.count, getMaxValue(timeData)),
                          backgroundColor: item === riskyTime ? COLORS.danger : COLORS.accent
                        }
                      ]}
                    />
                    <Caption style={styles.barLabel} numberOfLines={1}>
                      {item.timeSlot.split('-')[0]}
                    </Caption>
                  </View>
                ))}
              </View>
            )}
          </View>
        </Card>
        
        <Card style={styles.analysisCard}>
          <View style={styles.cardHeader}>
            <Subtitle style={styles.cardTitle}>Day Patterns</Subtitle>
            <Ionicons name="calendar" size={22} color={COLORS.textSecondary} />
          </View>
          
          <Body style={styles.analysisText}>
            {riskyDay ? 
              `${riskyDay.day} appears to be your most challenging day. Plan extra activities or accountability for this day.` :
              'Not enough data to determine your risk patterns yet.'
            }
          </Body>
          
          <View style={styles.chartContainer}>
            {dayData.length > 0 && (
              <View style={styles.barChart}>
                {dayData.map((item, index) => (
                  <View key={index} style={styles.barColumn}>
                    <View 
                      style={[
                        styles.bar, 
                        {
                          height: getBarHeight(item.count, getMaxValue(dayData)),
                          backgroundColor: item === riskyDay ? COLORS.danger : COLORS.accent
                        }
                      ]}
                    />
                    <Caption style={styles.barLabel} numberOfLines={1}>
                      {item.day.slice(0, 3)}
                    </Caption>
                  </View>
                ))}
              </View>
            )}
          </View>
        </Card>
        
        <Card style={styles.analysisCard}>
          <View style={styles.cardHeader}>
            <Subtitle style={styles.cardTitle}>Top Triggers</Subtitle>
            <Ionicons name="warning" size={22} color={COLORS.textSecondary} />
          </View>
          
          <Body style={styles.analysisText}>
            {topTriggers.length > 0 ? 
              `Your top triggers are ${topTriggers.map(t => t.name).join(', ')}. Review your journal entries to understand patterns.` :
              'Not enough journal entries to determine your triggers yet. Keep logging your experiences.'
            }
          </Body>
          
          {topTriggers.length > 0 && (
            <View style={styles.triggersList}>
              {topTriggers.map((trigger, index) => (
                <View key={index} style={styles.triggerItem}>
                  <View style={styles.triggerRank}>
                    <Body style={styles.triggerRankText}>{index + 1}</Body>
                  </View>
                  <View style={styles.triggerInfo}>
                    <Body style={styles.triggerName}>{trigger.name}</Body>
                    <Caption style={styles.triggerCount}>
                      Mentioned {trigger.count} time{trigger.count !== 1 ? 's' : ''}
                    </Caption>
                  </View>
                </View>
              ))}
            </View>
          )}
        </Card>
      </View>
    );
  };
  
  // Main render
  return (
    <SafeAreaView style={styles.container}>
      {selectedZone ? (
        renderZoneDetails()
      ) : (
        <>
          <View style={styles.header}>
            <Title>Relapse Prevention</Title>
            <Subtitle style={styles.subtitle}>Identify & prevent high-risk situations</Subtitle>
          </View>
          
          <ScrollView 
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {isLoading ? (
              <View style={styles.loadingContainer}>
                <Body>Analyzing your data...</Body>
              </View>
            ) : (
              <>
                {renderDangerZones()}
                {renderPatternAnalysis()}
              </>
            )}
          </ScrollView>
        </>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    paddingTop: SPACING.lg,
    paddingBottom: SPACING.md,
    paddingHorizontal: SPACING.md,
    alignItems: 'center',
  },
  subtitle: {
    marginTop: SPACING.xs,
    color: COLORS.textSecondary,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xl,
  },
  scrollContent: {
    padding: SPACING.md,
    paddingBottom: SPACING.xl,
  },
  sectionTitle: {
    marginBottom: SPACING.md,
  },
  // Danger Zones styles
  zonesContainer: {
    marginBottom: SPACING.lg,
  },
  zoneCard: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.md,
    marginBottom: SPACING.md,
    overflow: 'hidden',
  },
  zoneCardContent: {
    padding: SPACING.md,
    flexDirection: 'row',
    alignItems: 'center',
  },
  zoneIconContainer: {
    width: 50,
    height: 50,
    borderRadius: RADIUS.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  zoneInfo: {
    flex: 1,
    marginRight: SPACING.sm,
  },
  zoneName: {
    fontSize: FONTS.sizes.md,
    marginBottom: SPACING.xs,
  },
  zoneDescription: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.textSecondary,
  },
  riskIndicator: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  riskIndicatorText: {
    color: 'white',
    fontWeight: 'bold',
  },
  // Analysis card styles
  analysisContainer: {
    marginBottom: SPACING.lg,
  },
  analysisCard: {
    marginBottom: SPACING.md,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.cardLight,
  },
  cardTitle: {
    fontSize: FONTS.sizes.md,
  },
  analysisText: {
    padding: SPACING.md,
    color: COLORS.textSecondary,
  },
  // Chart styles
  chartContainer: {
    padding: SPACING.md,
    height: 150,
  },
  barChart: {
    flexDirection: 'row',
    height: '100%',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  barColumn: {
    flex: 1,
    height: '100%',
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingHorizontal: 2,
  },
  bar: {
    width: '80%',
    minHeight: 5,
    borderTopLeftRadius: 3,
    borderTopRightRadius: 3,
  },
  barLabel: {
    marginTop: SPACING.xs,
    fontSize: FONTS.sizes.xs,
    color: COLORS.textTertiary,
  },
  // Trigger list styles
  triggersList: {
    padding: SPACING.md,
  },
  triggerItem: {
    flexDirection: 'row',
    marginBottom: SPACING.md,
  },
  triggerRank: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.cardLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  triggerRankText: {
    fontWeight: 'bold',
  },
  triggerInfo: {
    flex: 1,
  },
  triggerName: {
    fontWeight: 'bold',
    marginBottom: SPACING.xs / 2,
  },
  triggerCount: {
    color: COLORS.textTertiary,
  },
  // Details view styles
  detailsContainer: {
    flex: 1,
  },
  backButton: {
    padding: SPACING.md,
  },
  detailsScrollView: {
    flex: 1,
  },
  detailsScrollContent: {
    padding: SPACING.md,
    paddingBottom: SPACING.xl,
  },
  detailsHeader: {
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  riskBadge: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs / 2,
    backgroundColor: COLORS.cardLight,
    borderRadius: RADIUS.md,
  },
  riskText: {
    color: COLORS.textSecondary,
    fontWeight: 'bold',
  },
  detailsTitle: {
    fontSize: FONTS.sizes.xl,
    textAlign: 'center',
    marginBottom: SPACING.sm,
  },
  detailsDescription: {
    textAlign: 'center',
    color: COLORS.textSecondary,
    marginBottom: SPACING.lg,
  },
  tipsContainer: {
    backgroundColor: COLORS.cardLight,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
  },
  tipsTitle: {
    marginBottom: SPACING.md,
  },
  tipItem: {
    flexDirection: 'row',
    marginBottom: SPACING.md,
  },
  tipBullet: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: COLORS.accent,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  tipNumber: {
    color: 'white',
    fontSize: FONTS.sizes.sm,
    fontWeight: 'bold',
  },
  tipText: {
    flex: 1,
    fontSize: FONTS.sizes.sm,
  },
  saveButton: {
    marginTop: SPACING.md,
  },
});

export default RelapsePrevention; 