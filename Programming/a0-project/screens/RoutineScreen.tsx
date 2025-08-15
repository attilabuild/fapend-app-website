import React, { useEffect, useRef, useState, useCallback } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  ScrollView, 
  TouchableOpacity,
  Image,
  Animated,
  Dimensions,
  Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width } = Dimensions.get('window');
const isIOS = Platform.OS === 'ios';

// Mock data for routines - MOVED HERE
const morningRoutine = [
  { 
    id: '1', 
    uri: 'https://i.postimg.cc/3J9gN8rQ/ordinary.jpg',
    name: 'The Ordinary',
    type: 'Cleanser',
    completed: true
  },
  { 
    id: '2', 
    uri: 'https://i.postimg.cc/jdkz7MDb/ordinary-2.jpg',
    name: 'The Ordinary',
    type: 'Niacinamide 10%',
    completed: true
  },
  { 
    id: '3', 
    uri: 'https://i.postimg.cc/grX3sF7T/cerave.jpg',
    name: 'CeraVe',
    type: 'Moisturizing Cream',
    completed: true
  },
  { 
    id: '4', 
    uri: 'https://i.postimg.cc/3J9gN8rQ/ordinary.jpg',
    name: 'The Ordinary',
    type: 'Hyaluronic Acid',
    completed: true
  },
  { 
    id: '5', 
    uri: 'https://i.postimg.cc/jdkz7MDb/ordinary-2.jpg',
    name: 'Neutrogena',
    type: 'Sunscreen SPF 50',
    completed: true
  }
];

const eveningRoutine = [
  { 
    id: '1', 
    uri: 'https://i.postimg.cc/3J9gN8rQ/ordinary.jpg',
    name: 'The Ordinary',
    type: 'Makeup Remover',
    completed: true
  },
  { 
    id: '2', 
    uri: 'https://i.postimg.cc/jdkz7MDb/ordinary-2.jpg',
    name: 'The Ordinary',
    type: 'Cleanser',
    completed: true
  },
  { 
    id: '3', 
    uri: 'https://i.postimg.cc/grX3sF7T/cerave.jpg',
    name: 'CeraVe',
    type: 'Retinol Serum',
    completed: true
  },
  { 
    id: '4', 
    uri: 'https://i.postimg.cc/3J9gN8rQ/ordinary.jpg',
    name: 'The Ordinary',
    type: 'Night Cream',
    completed: true
  }
];

export default function RoutineScreen() {
  const navigation = useNavigation();
  // Date state for day navigation
  const [selectedDate, setSelectedDate] = useState(new Date());
  const dateKey = selectedDate.toISOString().split('T')[0];
  
  // Completion state arrays
  const [morningCompletion, setMorningCompletion] = useState<boolean[]>([]);
  const [eveningCompletion, setEveningCompletion] = useState<boolean[]>([]);

  // Load saved routine state
  useEffect(() => {
    (async () => {
      const stored = await AsyncStorage.getItem(`routine-${dateKey}`);
      if (stored) {
        const parsed = JSON.parse(stored);
        setMorningCompletion(parsed.morning);
        setEveningCompletion(parsed.evening);
      } else {
        // Ensure these arrays are initialized even if no data for the day
        setMorningCompletion(new Array(morningRoutine.length).fill(false));
        setEveningCompletion(new Array(eveningRoutine.length).fill(false));
      }
    })();
  }, [dateKey, morningRoutine.length, eveningRoutine.length]);

  // Save state on changes
  useEffect(() => {
    (async () => {
      await AsyncStorage.setItem(
        `routine-${dateKey}`,
        JSON.stringify({ morning: morningCompletion, evening: eveningCompletion })
      );
    })();
  }, [morningCompletion, eveningCompletion, dateKey]);

  // Toggle handlers
  const toggleMorning = useCallback((index: number) => {
    setMorningCompletion(prev => {
      const next = [...prev]; next[index] = !next[index]; return next;
    });
  }, []);

  const toggleEvening = useCallback((index: number) => {
    setEveningCompletion(prev => {
      const next = [...prev]; next[index] = !next[index]; return next;
    });
  }, []);

  // Date navigation
  const changeDate = useCallback((offset: number) => {
    setSelectedDate(prev => {
      const d = new Date(prev);
      d.setDate(prev.getDate() + offset);
      // prevent future dates
      return d > new Date() ? prev : d;
    });
  }, []);

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
  }, [fadeAnim, translateY]);

  // Compute dynamic completion
  const completedRoutines = [
    morningCompletion.every(Boolean),
    eveningCompletion.every(Boolean)
  ].filter(Boolean).length;
  const completionPercent = Math.round((completedRoutines / 2) * 100);
  const currentStreak = 14; // keep existing logic or load from storage

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header with Date */}
        <Animated.View 
          style={[
            styles.header, 
            { opacity: fadeAnim, transform: [{ translateY: translateY }] }
          ]}
        >
          <TouchableOpacity onPress={() => changeDate(-1)}>
            <Ionicons name="chevron-back" size={24} color="#A86A48" />
          </TouchableOpacity>
          
          <View style={styles.dateContainer}>
            <Text style={styles.dateText}>{selectedDate.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}</Text>
          </View>
          
          <TouchableOpacity onPress={() => changeDate(1)}>
            <Ionicons name="chevron-forward" size={24} color="#A86A48" />
          </TouchableOpacity>
        </Animated.View>

        {/* Routine Completion Overview */}
        <Animated.View 
          style={[
            styles.completionContainer, 
            { opacity: fadeAnim, transform: [{ translateY: translateY }] }
          ]}
        >
          <View style={styles.completionCircle}>
            <Text style={styles.completionPercent}>{completionPercent}%</Text>
          </View>
          <Text style={styles.completionText}>{completedRoutines} of 2 routines completed</Text>
        </Animated.View>

        {/* Morning Routine Section */}
        <Animated.View 
          style={[
            styles.routineSection, 
            { opacity: fadeAnim, transform: [{ translateY: translateY }] }
          ]}
        >
          <LinearGradient
            colors={['#C68B59', '#A86A48']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.routineHeader}
          >
            <View style={styles.routineHeaderLeft}>
              <View style={styles.routineIconContainer}>
                <Ionicons name="sunny" size={24} color="#FFF3E0" />
              </View>
              <View>
                <Text style={styles.routineHeaderTitle}>Morning Routine</Text>
                <Text style={styles.routineHeaderTime}>7:00 AM</Text>
              </View>
            </View>
            <View style={styles.routineHeaderRight}>
              <View style={styles.completedBadge}>
                <Text style={styles.completedText}>Completed</Text>
              </View>
            </View>
          </LinearGradient>

          <View style={styles.routineSteps}>
            {morningRoutine.map((product, index) => (
              <View key={product.id} style={styles.routineStep}>
                <View style={styles.stepNumberContainer}>
                  <Text style={styles.stepNumber}>{index + 1}</Text>
                </View>
                <Image source={{ uri: product.uri }} style={styles.productImage} />
                <View style={styles.productDetails}>
                  <Text style={styles.productName}>{product.name}</Text>
                  <Text style={styles.productType}>{product.type}</Text>
                </View>
                <View style={styles.checkContainer}>
                  <TouchableOpacity onPress={() => toggleMorning(index)}>
                    <Ionicons 
                      name={morningCompletion[index] ? "checkmark-circle" : "ellipse-outline"} 
                      size={24} 
                      color={morningCompletion[index] ? "#A86A48" : "#CCBDAD"} 
                    />
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        </Animated.View>

        {/* Evening Routine Section */}
        <Animated.View 
          style={[
            styles.routineSection, 
            { opacity: fadeAnim, transform: [{ translateY: translateY }], marginTop: 24 }
          ]}
        >
          <LinearGradient
            colors={['#8D4E2A', '#A86A48']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.routineHeader}
          >
            <View style={styles.routineHeaderLeft}>
              <View style={styles.routineIconContainer}>
                <Ionicons name="moon" size={20} color="#FFF3E0" />
              </View>
              <View>
                <Text style={styles.routineHeaderTitle}>Evening Routine</Text>
                <Text style={styles.routineHeaderTime}>9:30 PM</Text>
              </View>
            </View>
            <View style={styles.routineHeaderRight}>
              <View style={styles.completedBadge}>
                <Text style={styles.completedText}>Completed</Text>
              </View>
            </View>
          </LinearGradient>

          <View style={styles.routineSteps}>
            {eveningRoutine.map((product, index) => (
              <View key={product.id} style={styles.routineStep}>
                <View style={styles.stepNumberContainer}>
                  <Text style={styles.stepNumber}>{index + 1}</Text>
                </View>
                <Image source={{ uri: product.uri }} style={styles.productImage} />
                <View style={styles.productDetails}>
                  <Text style={styles.productName}>{product.name}</Text>
                  <Text style={styles.productType}>{product.type}</Text>
                </View>
                <View style={styles.checkContainer}>
                  <TouchableOpacity onPress={() => toggleEvening(index)}>
                    <Ionicons 
                      name={eveningCompletion[index] ? "checkmark-circle" : "ellipse-outline"} 
                      size={24} 
                      color={eveningCompletion[index] ? "#A86A48" : "#CCBDAD"} 
                    />
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        </Animated.View>

        {/* Streak Card */}
        <Animated.View 
          style={[
            styles.streakContainer, 
            { opacity: fadeAnim, transform: [{ translateY: translateY }] }
          ]}
        >
          <LinearGradient
            colors={['#C68B59', '#A86A48']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.streakCard}
          >
            <View style={styles.streakIconContainer}>
              <Ionicons name="flame" size={24} color="#FFF3E0" />
            </View>
            <View style={styles.streakTextContainer}>
              <Text style={styles.streakTitle}>Current Streak</Text>
              <Text style={styles.streakValue}>{currentStreak} days</Text>
              <Text style={styles.streakSubtext}>Keep it up!</Text>
            </View>
          </LinearGradient>
        </Animated.View>

        {/* Bottom padding for navigation bar */}
        <View style={styles.bottomPadding} />
      </ScrollView>

      {/* Bottom Navigation */}
      {isIOS ? (
        <View style={styles.bottomNavBlur}>
          <View style={styles.bottomNav}>
            <TouchableOpacity 
              style={styles.navItem}
              onPress={() => navigation.navigate('MainApp')}
            >
              <Ionicons name="home-outline" size={24} color="#A86A48" />
              <Text style={styles.navText}>Home</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.navItem}
              onPress={() => navigation.navigate('Progress')}
            >
              <Ionicons name="analytics-outline" size={24} color="#A86A48" />
              <Text style={styles.navText}>Progress</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.navItem}
              onPress={() => navigation.navigate('Routine')}
            >
              <Ionicons name="calendar" size={24} color="#A86A48" />
              <Text style={[styles.navText, styles.activeNavText]}>Routine</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.navItem}
            >
              <Ionicons name="settings-outline" size={24} color="#A86A48" />
              <Text style={styles.navText}>Settings</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <View style={styles.bottomNavAndroid}>
          <TouchableOpacity 
            style={styles.navItem}
            onPress={() => navigation.navigate('MainApp')}
          >
            <Ionicons name="home-outline" size={24} color="#A86A48" />
            <Text style={styles.navText}>Home</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.navItem}
            onPress={() => navigation.navigate('Progress')}
          >
            <Ionicons name="analytics-outline" size={24} color="#A86A48" />
            <Text style={styles.navText}>Progress</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.navItem}
            onPress={() => navigation.navigate('Routine')}
          >
            <Ionicons name="calendar" size={24} color="#A86A48" />
            <Text style={[styles.navText, styles.activeNavText]}>Routine</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.navItem}
          >
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
    paddingBottom: 16,
  },
  dateContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: 'rgba(168, 106, 72, 0.1)',
    borderRadius: 20,
  },
  dateText: {
    fontSize: 16,
    color: '#A86A48',
    fontWeight: '600',
  },
  completionContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  completionCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(168, 106, 72, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#A86A48',
    marginBottom: 8,
  },
  completionPercent: {
    fontSize: 20,
    fontWeight: '700',
    color: '#A86A48',
  },
  completionText: {
    fontSize: 16,
    color: '#A86A48',
    fontWeight: '500',
  },
  routineSection: {
    marginHorizontal: 16,
    borderRadius: 16,
    backgroundColor: '#F7EDE2',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  routineHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  routineHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  routineIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 243, 224, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  routineHeaderTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFF3E0',
  },
  routineHeaderTime: {
    fontSize: 14,
    color: '#FFF3E0',
    opacity: 0.8,
    marginTop: 2,
  },
  routineHeaderRight: {},
  completedBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: 'rgba(255, 243, 224, 0.2)',
    borderRadius: 12,
  },
  completedText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFF3E0',
  },
  routineSteps: {
    padding: 16,
  },
  routineStep: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(168, 106, 72, 0.1)',
  },
  stepNumberContainer: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(168, 106, 72, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  stepNumber: {
    fontSize: 12,
    fontWeight: '600',
    color: '#A86A48',
  },
  productImage: {
    width: 40,
    height: 40,
    borderRadius: 8,
    marginRight: 12,
  },
  productDetails: {
    flex: 1,
  },
  productName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#A86A48',
  },
  productType: {
    fontSize: 12,
    color: '#A86A48',
    opacity: 0.7,
    marginTop: 2,
  },
  checkContainer: {
    width: 30,
    alignItems: 'center',
  },
  streakContainer: {
    marginTop: 24,
    marginHorizontal: 16,
    marginBottom: 16,
  },
  streakCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  streakIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 243, 224, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  streakTextContainer: {},
  streakTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#FFF3E0',
    opacity: 0.9,
  },
  streakValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFF3E0',
    marginVertical: 2,
  },
  streakSubtext: {
    fontSize: 14,
    color: '#FFF3E0',
    opacity: 0.8,
  },
  bottomPadding: {
    height: 80,
  },
  bottomNavBlur: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(247, 237, 226, 0.9)',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: 'hidden',
  },
  bottomNav: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 12,
    paddingBottom: isIOS ? 24 : 12,
  },
  bottomNavAndroid: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
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
  activeNavText: {
    fontWeight: '700',
  },
});