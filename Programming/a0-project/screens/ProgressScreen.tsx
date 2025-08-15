import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Animated,
  Platform
} from 'react-native';
import { Ionicons, MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { useNavigation } from '@react-navigation/native';

const { width, height } = Dimensions.get('window');
const isIOS = Platform.OS === 'ios';

// Mock data for the progress screen
const streakData = {
  currentStreak: 14,
  longestStreak: 21,
  thisMonth: 26,
  totalDays: 42
};

const progressData = [
  { week: 'Week 1', score: 52 },
  { week: 'Week 2', score: 58 },
  { week: 'Week 3', score: 63 },
  { week: 'Week 4', score: 67 },
  { week: 'Week 5', score: 72 },
  { week: 'Week 6', score: 78 }
];

const skinIssues = [
  { name: 'Acne', initial: 68, current: 32, improvement: 36 },
  { name: 'Dryness', initial: 75, current: 25, improvement: 50 },
  { name: 'Texture', initial: 60, current: 22, improvement: 38 },
  { name: 'Redness', initial: 45, current: 18, improvement: 27 }
];

const motivationalQuotes = [
  "Consistency is the key to radiant skin.",
  "Small daily improvements lead to stunning results.",
  "Your skin journey is a marathon, not a sprint.",
  "Every day of care is an investment in your future glow."
];

export default function ProgressScreen() {
  const navigation = useNavigation();
  
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      })
    ]).start();
  }, []);

  // Get a random motivational quote
  const motivationalQuote = motivationalQuotes[Math.floor(Math.random() * motivationalQuotes.length)];

  // Calculate the max score for graph scaling
  const maxScore = Math.max(...progressData.map(item => item.score));

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <Animated.View 
        style={[
          styles.header, 
          { opacity: fadeAnim, transform: [{ translateY: translateY }] }
        ]}
      >
        <View>
          <Text style={styles.headerTitle}>Your Progress</Text>
          <Text style={styles.subtext}>Track your skin improvement journey</Text>
        </View>
        <TouchableOpacity onPress={() => {}}>
          <View style={styles.iconButton}>
            <Ionicons name="calendar-outline" size={22} color="#A86A48" />
          </View>
        </TouchableOpacity>
      </Animated.View>

      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Motivational Quote Card */}
        <Animated.View 
          style={[
            styles.quoteContainer, 
            { opacity: fadeAnim, transform: [{ translateY: translateY }] }
          ]}
        >
          <LinearGradient
            colors={['#C68B59', '#A86A48']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.quoteCard}
          >
            <View style={styles.quoteIconContainer}>
              <FontAwesome5 name="quote-left" size={16} color="#FFF3E0" />
            </View>
            <Text style={styles.quoteText}>{motivationalQuote}</Text>
          </LinearGradient>
        </Animated.View>

        {/* Streak Stats */}
        <Animated.View 
          style={[
            styles.sectionContainer, 
            { opacity: fadeAnim, transform: [{ translateY: translateY }] }
          ]}
        >
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Your Streak</Text>
          </View>
          
          <View style={styles.streakCardsContainer}>
            <View style={styles.streakCard}>
              <View style={styles.streakIconContainer}>
                <Ionicons name="flame" size={24} color="#A86A48" />
              </View>
              <Text style={styles.streakValue}>{streakData.currentStreak}</Text>
              <Text style={styles.streakLabel}>Current Streak</Text>
            </View>
            
            <View style={styles.streakCard}>
              <View style={styles.streakIconContainer}>
                <Ionicons name="trophy" size={24} color="#A86A48" />
              </View>
              <Text style={styles.streakValue}>{streakData.longestStreak}</Text>
              <Text style={styles.streakLabel}>Longest Streak</Text>
            </View>
            
            <View style={styles.streakCard}>
              <View style={styles.streakIconContainer}>
                <Ionicons name="calendar" size={24} color="#A86A48" />
              </View>
              <Text style={styles.streakValue}>{streakData.thisMonth}</Text>
              <Text style={styles.streakLabel}>This Month</Text>
            </View>
            
            <View style={styles.streakCard}>
              <View style={styles.streakIconContainer}>
                <Ionicons name="checkmark-circle" size={24} color="#A86A48" />
              </View>
              <Text style={styles.streakValue}>{streakData.totalDays}</Text>
              <Text style={styles.streakLabel}>Total Days</Text>
            </View>
          </View>
        </Animated.View>

        {/* Skin Score Progress */}
        <Animated.View 
          style={[
            styles.sectionContainer, 
            { opacity: fadeAnim, transform: [{ translateY: translateY }] }
          ]}
        >
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Skin Score Progress</Text>
          </View>
          
          <View style={styles.graphCard}>
            <View style={styles.graphContainer}>
              {progressData.map((item, index) => (
                <View key={index} style={styles.graphBarContainer}>
                  <View style={styles.graphLabelContainer}>
                    <Text style={styles.graphLabel}>{item.week}</Text>
                  </View>
                  <View style={styles.graphBarBackground}>
                    <LinearGradient
                      colors={['#C68B59', '#A86A48']}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 0, y: 1 }}
                      style={[
                        styles.graphBar,
                        { height: `${(item.score / 100) * 100}%` }
                      ]}
                    />
                  </View>
                  <Text style={styles.graphValue}>{item.score}</Text>
                </View>
              ))}
            </View>
            <View style={styles.graphLegend}>
              <View style={styles.legendItem}>
                <View style={[styles.legendColor, { backgroundColor: '#A86A48' }]} />
                <Text style={styles.legendText}>Skin Score</Text>
              </View>
            </View>
          </View>
        </Animated.View>

        {/* Skin Issues Improvement */}
        <Animated.View 
          style={[
            styles.sectionContainer, 
            { opacity: fadeAnim, transform: [{ translateY: translateY }] }
          ]}
        >
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Skin Issues Improvement</Text>
          </View>
          
          <View style={styles.improvementCard}>
            {skinIssues.map((issue, index) => (
              <View key={index} style={styles.improvementItem}>
                <View style={styles.improvementHeader}>
                  <Text style={styles.improvementName}>{issue.name}</Text>
                  <View style={styles.improvementBadge}>
                    <Text style={styles.improvementBadgeText}>-{issue.improvement}%</Text>
                  </View>
                </View>
                <View style={styles.improvementBarContainer}>
                  <View style={styles.improvementBarBackground}>
                    <View style={[styles.improvementBarInitial, { width: `${issue.initial}%` }]} />
                    <View style={[styles.improvementBarCurrent, { width: `${issue.current}%` }]} />
                  </View>
                  <View style={styles.improvementLabels}>
                    <Text style={styles.improvementLabelStart}>Initial</Text>
                    <Text style={styles.improvementLabelEnd}>Current</Text>
                  </View>
                </View>
              </View>
            ))}
          </View>
        </Animated.View>

        {/* Next Milestone */}
        <Animated.View 
          style={[
            styles.sectionContainer, 
            { opacity: fadeAnim, transform: [{ translateY: translateY }] }
          ]}
        >
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Next Milestone</Text>
          </View>
          
          <TouchableOpacity style={styles.milestoneCard} activeOpacity={0.9}>
            <LinearGradient
              colors={['#C68B59', '#A86A48']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.milestoneGradient}
            >
              <View style={styles.milestoneContent}>
                <View style={styles.milestoneIconContainer}>
                  <Ionicons name="star" size={24} color="#FFF3E0" />
                </View>
                <View style={styles.milestoneTextContainer}>
                  <Text style={styles.milestoneTitle}>Reach 85 Skin Score</Text>
                  <Text style={styles.milestoneSubtext}>You're 7 points away!</Text>
                  <View style={styles.milestoneProgressContainer}>
                    <View style={styles.milestoneProgressBackground} />
                    <View style={[styles.milestoneProgressFill, { width: '78%' }]} />
                  </View>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#FFF3E0" />
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>

        {/* Add padding at bottom to account for navigation bar */}
        <View style={styles.bottomPadding} />
      </ScrollView>

      {/* Bottom Navigation */}
      {isIOS ? (
        <BlurView intensity={10} tint="light" style={styles.bottomNavBlur}>
          <View style={styles.bottomNav}>
            <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('MainApp')}>
              <Ionicons name="home-outline" size={24} color="#A86A48" />
              <Text style={styles.navText}>Home</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.navItem}>
              <MaterialCommunityIcons name="face-man" size={24} color="#A86A48" style={styles.activeIcon} />
              <Text style={styles.activeNavText}>Progress</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.navItem}>
              <Ionicons name="calendar-outline" size={24} color="#A86A48" />
              <Text style={styles.navText}>Routine</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.navItem}>
              <Ionicons name="settings-outline" size={24} color="#A86A48" />
              <Text style={styles.navText}>Settings</Text>
            </TouchableOpacity>
          </View>
        </BlurView>
      ) : (
        <View style={styles.bottomNavAndroid}>
          <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('MainApp')}>
            <Ionicons name="home-outline" size={24} color="#A86A48" />
            <Text style={styles.navText}>Home</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.navItem}>
            <MaterialCommunityIcons name="face-man" size={24} color="#A86A48" style={styles.activeIcon} />
            <Text style={styles.activeNavText}>Progress</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.navItem}>
            <Ionicons name="calendar-outline" size={24} color="#A86A48" />
            <Text style={styles.navText}>Routine</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.navItem}>
            <Ionicons name="settings-outline" size={24} color="#A86A48" />
            <Text style={styles.navText}>Settings</Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#FFF3E0',
  },
  scrollContent: {
    paddingBottom: 20,
  },
  header: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 8,
  },
  headerTitle: { 
    fontSize: 24, 
    color: '#A86A48',
    fontWeight: '600',
    letterSpacing: -0.5,
  },
  subtext: { 
    fontSize: 14, 
    color: '#A86A48', 
    opacity: 0.8,
    marginTop: 4,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(168, 106, 72, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  quoteContainer: {
    paddingHorizontal: 16,
    marginTop: 8,
  },
  quoteCard: {
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  quoteIconContainer: {
    marginBottom: 8,
  },
  quoteText: {
    fontSize: 16,
    fontWeight: '500',
    fontStyle: 'italic',
    color: '#FFF3E0',
    lineHeight: 24,
  },
  sectionContainer: {
    marginTop: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  sectionTitle: { 
    fontSize: 20, 
    color: '#A86A48', 
    fontWeight: '600',
    letterSpacing: -0.5,
  },
  streakCardsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  streakCard: {
    width: '48%',
    backgroundColor: '#F7EDE2',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  streakIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(168, 106, 72, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  streakValue: {
    fontSize: 28,
    fontWeight: '700',
    color: '#A86A48',
    marginBottom: 4,
  },
  streakLabel: {
    fontSize: 14,
    color: '#A86A48',
    opacity: 0.7,
  },
  graphCard: {
    backgroundColor: '#F7EDE2',
    marginHorizontal: 16,
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  graphContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 200,
    marginBottom: 16,
  },
  graphBarContainer: {
    alignItems: 'center',
    flex: 1,
  },
  graphLabelContainer: {
    position: 'absolute',
    bottom: -24,
    width: '100%',
    alignItems: 'center',
  },
  graphLabel: {
    fontSize: 12,
    color: '#A86A48',
    opacity: 0.7,
  },
  graphBarBackground: {
    width: 12,
    height: '100%',
    backgroundColor: 'rgba(168, 106, 72, 0.1)',
    borderRadius: 6,
    overflow: 'hidden',
    justifyContent: 'flex-end',
  },
  graphBar: {
    width: '100%',
    borderRadius: 6,
  },
  graphValue: {
    fontSize: 12,
    fontWeight: '600',
    color: '#A86A48',
    marginTop: 4,
  },
  graphLegend: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 24,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 8,
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 6,
  },
  legendText: {
    fontSize: 12,
    color: '#A86A48',
  },
  improvementCard: {
    backgroundColor: '#F7EDE2',
    marginHorizontal: 16,
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  improvementItem: {
    marginBottom: 16,
  },
  improvementHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  improvementName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#A86A48',
  },
  improvementBadge: {
    backgroundColor: 'rgba(168, 106, 72, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  improvementBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#A86A48',
  },
  improvementBarContainer: {
    marginBottom: 4,
  },
  improvementBarBackground: {
    height: 12,
    backgroundColor: 'rgba(168, 106, 72, 0.1)',
    borderRadius: 6,
    overflow: 'hidden',
    flexDirection: 'row',
  },
  improvementBarInitial: {
    height: '100%',
    backgroundColor: 'rgba(168, 106, 72, 0.3)',
    borderTopLeftRadius: 6,
    borderBottomLeftRadius: 6,
  },
  improvementBarCurrent: {
    height: '100%',
    backgroundColor: '#A86A48',
    borderTopLeftRadius: 6,
    borderBottomLeftRadius: 6,
  },
  improvementLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  improvementLabelStart: {
    fontSize: 12,
    color: '#A86A48',
    opacity: 0.7,
  },
  improvementLabelEnd: {
    fontSize: 12,
    color: '#A86A48',
    opacity: 0.7,
  },
  milestoneCard: {
    marginHorizontal: 16,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  milestoneGradient: {
    flexDirection: 'row',
    padding: 16,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  milestoneContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  milestoneIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 243, 224, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  milestoneTextContainer: {
    flex: 1,
  },
  milestoneTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFF3E0',
    marginBottom: 4,
  },
  milestoneSubtext: {
    fontSize: 14,
    color: '#FFF3E0',
    opacity: 0.8,
    marginBottom: 8,
  },
  milestoneProgressContainer: {
    height: 6,
    width: '100%',
    backgroundColor: 'rgba(255, 243, 224, 0.2)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  milestoneProgressBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 243, 224, 0.2)',
  },
  milestoneProgressFill: {
    height: '100%',
    backgroundColor: '#FFF3E0',
    borderRadius: 3,
  },
  bottomPadding: {
    height: 80, // Extra padding at bottom to account for navigation bar
  },
  bottomNavBlur: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: 'hidden',
  },
  bottomNav: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 12,
    paddingBottom: isIOS ? 24 : 12, // Extra padding for iOS home indicator
  },
  bottomNavAndroid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 12,
    backgroundColor: '#F7EDE2',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  navItem: {
    alignItems: 'center',
  },
  navText: {
    fontSize: 12,
    color: '#A86A48',
    marginTop: 4,
    fontWeight: '500',
  },
  activeIcon: {
    color: '#A86A48',
    opacity: 1,
  },
  activeNavText: {
    fontSize: 12,
    color: '#A86A48',
    marginTop: 4,
    fontWeight: '700',
  },
});