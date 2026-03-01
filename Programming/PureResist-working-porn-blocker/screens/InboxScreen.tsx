import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Title, Subtitle, Body } from '../components/ui/Typography';
import Card from '../components/ui/Card';
import { COLORS, SPACING } from '../utils/theme';
import { Ionicons } from '@expo/vector-icons';

type TabType = 'inbox' | 'unlockments';
type FilterType = 'all' | 'unread' | 'read';

// Define notification type
interface Notification {
  id: string;
  content: string;
  isRead: boolean;
  createdAt: Date;
}

const InboxScreen: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('inbox');
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  
  // Placeholder - would be fetched from an API or local storage
  const notifications: Notification[] = [];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Title>Inbox</Title>
        <Subtitle style={styles.description}>
          This inbox shows all notifications such as friend requests, check-ins, and more.
        </Subtitle>
      </View>

      {/* Tabs */}
      <View style={styles.tabsContainer}>
        <TouchableOpacity 
          style={[
            styles.tab, 
            activeTab === 'inbox' && styles.activeTab
          ]}
          onPress={() => setActiveTab('inbox')}
        >
          <Ionicons 
            name={"mail" as keyof typeof Ionicons.glyphMap}
            size={18} 
            color={activeTab === 'inbox' ? COLORS.textPrimary : COLORS.textSecondary} 
            style={styles.tabIcon}
          />
          <Body 
            color={activeTab === 'inbox' ? COLORS.textPrimary : COLORS.textSecondary}
            bold={activeTab === 'inbox'}
          >
            Inbox
          </Body>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[
            styles.tab, 
            activeTab === 'unlockments' && styles.activeTab
          ]}
          onPress={() => setActiveTab('unlockments')}
        >
          <Ionicons 
            name={"trophy" as keyof typeof Ionicons.glyphMap}
            size={18} 
            color={activeTab === 'unlockments' ? COLORS.textPrimary : COLORS.textSecondary} 
            style={styles.tabIcon}
          />
          <Body 
            color={activeTab === 'unlockments' ? COLORS.textPrimary : COLORS.textSecondary}
            bold={activeTab === 'unlockments'}
          >
            User Unlockments
          </Body>
        </TouchableOpacity>
      </View>

      {/* Filters */}
      <View style={styles.filtersContainer}>
        <TouchableOpacity 
          style={[
            styles.filter, 
            activeFilter === 'all' && styles.activeFilter
          ]}
          onPress={() => setActiveFilter('all')}
        >
          <Body 
            color={activeFilter === 'all' ? COLORS.textPrimary : COLORS.textSecondary}
            bold={activeFilter === 'all'}
          >
            All
          </Body>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[
            styles.filter, 
            activeFilter === 'unread' && styles.activeFilter
          ]}
          onPress={() => setActiveFilter('unread')}
        >
          <Body 
            color={activeFilter === 'unread' ? COLORS.textPrimary : COLORS.textSecondary}
            bold={activeFilter === 'unread'}
          >
            Unread
          </Body>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[
            styles.filter, 
            activeFilter === 'read' && styles.activeFilter
          ]}
          onPress={() => setActiveFilter('read')}
        >
          <Body 
            color={activeFilter === 'read' ? COLORS.textPrimary : COLORS.textSecondary}
            bold={activeFilter === 'read'}
          >
            Read
          </Body>
        </TouchableOpacity>
      </View>

      {/* Notifications */}
      <ScrollView style={styles.scrollView}>
        {notifications.length > 0 ? (
          notifications.map((notification, index) => (
            <Card key={index} style={styles.notificationCard}>
              {/* Notification content would go here */}
            </Card>
          ))
        ) : (
          <Card style={styles.emptyStateCard}>
            <View style={styles.emptyState}>
              <Ionicons name={"mail-outline" as keyof typeof Ionicons.glyphMap} size={40} color={COLORS.textSecondary} />
              <Body style={styles.emptyStateText} color={COLORS.textSecondary}>
                There's nothing to see here right now
              </Body>
            </View>
          </Card>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    paddingHorizontal: SPACING.md,
  },
  header: {
    paddingVertical: SPACING.lg,
  },
  description: {
    marginTop: SPACING.xs,
  },
  tabsContainer: {
    flexDirection: 'row',
    marginBottom: SPACING.md,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    marginRight: SPACING.sm,
    borderRadius: 100,
    backgroundColor: COLORS.card,
  },
  activeTab: {
    backgroundColor: COLORS.cardDark,
  },
  tabIcon: {
    marginRight: SPACING.xs,
  },
  filtersContainer: {
    flexDirection: 'row',
    marginBottom: SPACING.md,
  },
  filter: {
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    marginRight: SPACING.sm,
    borderRadius: 100,
  },
  activeFilter: {
    backgroundColor: COLORS.cardDark,
  },
  scrollView: {
    flex: 1,
  },
  notificationCard: {
    marginBottom: SPACING.md,
  },
  emptyStateCard: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.xl,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyStateText: {
    marginTop: SPACING.md,
  },
});

export default InboxScreen; 