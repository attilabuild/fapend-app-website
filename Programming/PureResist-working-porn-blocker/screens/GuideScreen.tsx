import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { COLORS, SPACING, FONT_SIZE, RADIUS } from '../utils/theme';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuthStore } from '../hooks/useStore';

// Categories data
const GUIDE_CATEGORIES = [
  {
    id: 'basics',
    title: 'Basics',
    articles: [
      { id: '1', title: 'Understanding Urges' },
      { id: '2', title: 'The Science of Dopamine' },
      { id: '3', title: 'How Habit Loops Work' }
    ]
  },
  {
    id: 'mindset',
    title: 'Mindset',
    articles: [
      { id: '4', title: 'Developing a Growth Mindset' },
      { id: '5', title: 'Overcoming Limiting Beliefs' },
      { id: '6', title: 'Finding Your Why' }
    ]
  },
  {
    id: 'tools',
    title: 'Tools',
    articles: [
      { id: '7', title: 'Meditation Techniques' },
      { id: '8', title: 'Breathing Exercises' },
      { id: '9', title: 'Urge Surfing' },
      { id: '10', title: 'Cold Showers' }
    ]
  },
  {
    id: 'relapse',
    title: 'Relapse Prevention',
    articles: [
      { id: '11', title: 'Creating an Emergency Plan' },
      { id: '12', title: 'Identifying Your Triggers' },
      { id: '13', title: 'Bouncing Back After a Relapse' }
    ]
  },
  {
    id: 'advanced',
    title: 'Advanced',
    articles: [
      { id: '14', title: 'Neuroplasticity and Recovery' },
      { id: '15', title: 'Building Healthy Relationships' },
      { id: '16', title: 'Long-term Strategies' }
    ]
  }
];

const GuideScreen: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState('basics');
  const [readArticles, setReadArticles] = useState<string[]>([]);
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { user } = useAuthStore();
  
  // Load read articles
  useEffect(() => {
    const loadReadArticles = async () => {
      if (user && user._id) {
        try {
          const storedArticles = await AsyncStorage.getItem(`readArticles_${user._id}`);
          if (storedArticles) {
            setReadArticles(JSON.parse(storedArticles));
          }
        } catch (error) {
          console.error('Error loading read articles:', error);
        }
      }
    };
    
    loadReadArticles();
    
    // Set up a listener for when user comes back to this screen
    const unsubscribe = navigation.addListener('focus', loadReadArticles);
    return unsubscribe;
  }, [user, navigation]);

  const renderCategories = () => {
    return (
      <View style={styles.categoriesWrapper}>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesContainer}
          decelerationRate="fast"
          snapToAlignment="center"
        >
          {GUIDE_CATEGORIES.map(category => (
            <TouchableOpacity
              key={category.id}
              style={[
                styles.categoryButton,
                activeCategory === category.id ? styles.activeCategory : null
              ]}
              onPress={() => setActiveCategory(category.id)}
            >
              <Text 
                style={[
                  styles.categoryText,
                  activeCategory === category.id ? styles.activeCategoryText : null
                ]}
              >
                {category.title}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    );
  };

  const renderArticles = () => {
    const category = GUIDE_CATEGORIES.find(cat => cat.id === activeCategory);
    if (!category) return null;

    return (
      <View style={styles.articlesContainer}>
        {category.articles.map(article => {
          const isRead = readArticles.includes(article.id);
          
          return (
            <TouchableOpacity 
              key={article.id}
              style={styles.articleCard}
              onPress={() => navigation.navigate('ArticleDetail', { 
                articleId: article.id, 
                title: article.title,
                categoryId: activeCategory 
              })}
            >
              <View style={styles.articleContent}>
                <Text style={styles.articleTitle}>{article.title}</Text>
                <View style={styles.articleMeta}>
                  {isRead ? (
                    <View style={styles.readBadgeContainer}>
                      <Ionicons name="checkmark-circle" size={14} color={COLORS.success} />
                      <Text style={styles.readBadge}> Read</Text>
                    </View>
                  ) : (
                    <View style={styles.unreadBadgeContainer}>
                      <Ionicons name="ellipse-outline" size={14} color={COLORS.textSecondary} />
                      <Text style={styles.unreadBadge}> Unread</Text>
                    </View>
                  )}
                </View>
              </View>
              <View style={styles.articleArrow}>
                <Ionicons name="chevron-forward" size={20} color={COLORS.textSecondary} />
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>📘 Learn</Text>
        <Text style={styles.headerSubtitle}>Understand & grow stronger</Text>
      </View>

      {/* Categories tabs */}
      {renderCategories()}

      {/* Article list */}
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollViewContent}
      >
        {renderArticles()}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.lg,
  },
  headerTitle: {
    fontSize: FONT_SIZE.xxl,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
  },
  headerSubtitle: {
    fontSize: FONT_SIZE.md,
    color: COLORS.textSecondary,
  },
  categoriesWrapper: {
    paddingHorizontal: SPACING.md,
    marginBottom: SPACING.sm,
  },
  categoriesContainer: {
    paddingRight: SPACING.sm,
    paddingVertical: SPACING.xs,
  },
  categoryButton: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs / 2,
    height: 32,
    justifyContent: 'center',
    marginRight: SPACING.xs,
    borderRadius: RADIUS.sm,
    backgroundColor: COLORS.card,
  },
  activeCategory: {
    backgroundColor: COLORS.accent,
  },
  categoryText: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  activeCategoryText: {
    color: COLORS.primary,
    fontWeight: 'bold',
  },
  scrollView: {
    flex: 1,
  },
  scrollViewContent: {
    paddingHorizontal: SPACING.md,
    paddingBottom: SPACING.xl,
  },
  articlesContainer: {
    marginTop: SPACING.sm,
  },
  articleCard: {
    marginBottom: SPACING.md,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.card,
    overflow: 'hidden',
    flexDirection: 'row',
    alignItems: 'center',
  },
  articleContent: {
    padding: SPACING.md,
    flex: 1,
  },
  articleTitle: {
    fontSize: FONT_SIZE.lg,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
  },
  articleMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  readBadgeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  unreadBadgeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  readBadge: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.success,
  },
  unreadBadge: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textSecondary,
  },
  articleArrow: {
    paddingRight: SPACING.md,
  },
});

export default GuideScreen; 