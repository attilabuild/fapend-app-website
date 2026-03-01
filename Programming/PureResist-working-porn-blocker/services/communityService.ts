import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';

// Storage keys
const BLOCKED_USERS_KEY = 'blocked_users';
const REPORTED_CONTENT_KEY = 'reported_content';
const COMMUNITY_TOS_ACCEPTANCE_KEY = 'community_tos_accepted';

// Types
export interface BlockedUser {
  userId: string;
  username: string;
  blockedAt: string;
}

export interface ContentReport {
  contentId: string; // Post or comment ID
  contentType: 'post' | 'comment' | 'user';
  userId: string; // User who created the content
  username: string;
  reporterId: string; // User who reported the content
  reason: string;
  details?: string;
  status: 'pending' | 'reviewed' | 'resolved' | 'dismissed';
  reportedAt: string;
  reviewedAt?: string;
}

// Get blocked users
export const getBlockedUsers = async (userId: string): Promise<BlockedUser[]> => {
  try {
    const blockedUsersData = await AsyncStorage.getItem(`${BLOCKED_USERS_KEY}_${userId}`);
    return blockedUsersData ? JSON.parse(blockedUsersData) : [];
  } catch (error) {
    console.error('Error getting blocked users:', error);
    return [];
  }
};

// Block a user
export const blockUser = async (
  currentUserId: string,
  userToBlock: { userId: string; username: string }
): Promise<boolean> => {
  try {
    // Get existing blocked users
    const blockedUsers = await getBlockedUsers(currentUserId);
    
    // Check if already blocked
    if (blockedUsers.some(user => user.userId === userToBlock.userId)) {
      return true; // Already blocked
    }
    
    // Add to blocked users
    const updatedBlockedUsers = [
      ...blockedUsers,
      {
        userId: userToBlock.userId,
        username: userToBlock.username,
        blockedAt: new Date().toISOString()
      }
    ];
    
    // Save to storage
    await AsyncStorage.setItem(
      `${BLOCKED_USERS_KEY}_${currentUserId}`,
      JSON.stringify(updatedBlockedUsers)
    );
    
    return true;
  } catch (error) {
    console.error('Error blocking user:', error);
    return false;
  }
};

// Unblock a user
export const unblockUser = async (currentUserId: string, userIdToUnblock: string): Promise<boolean> => {
  try {
    // Get existing blocked users
    const blockedUsers = await getBlockedUsers(currentUserId);
    
    // Filter out the user to unblock
    const updatedBlockedUsers = blockedUsers.filter(user => user.userId !== userIdToUnblock);
    
    // Save to storage
    await AsyncStorage.setItem(
      `${BLOCKED_USERS_KEY}_${currentUserId}`,
      JSON.stringify(updatedBlockedUsers)
    );
    
    return true;
  } catch (error) {
    console.error('Error unblocking user:', error);
    return false;
  }
};

// Check if a user is blocked
export const isUserBlocked = async (currentUserId: string, userIdToCheck: string): Promise<boolean> => {
  try {
    const blockedUsers = await getBlockedUsers(currentUserId);
    return blockedUsers.some(user => user.userId === userIdToCheck);
  } catch (error) {
    console.error('Error checking if user is blocked:', error);
    return false;
  }
};

// Report content
export const reportContent = async (
  reportData: Omit<ContentReport, 'reportedAt' | 'status'>
): Promise<boolean> => {
  try {
    // Get existing reports
    const reportsData = await AsyncStorage.getItem(REPORTED_CONTENT_KEY);
    const existingReports: ContentReport[] = reportsData ? JSON.parse(reportsData) : [];
    
    // Check if already reported by this user
    const alreadyReported = existingReports.some(
      report => 
        report.contentId === reportData.contentId && 
        report.reporterId === reportData.reporterId
    );
    
    if (alreadyReported) {
      Alert.alert(
        'Already Reported',
        'You have already reported this content. Our team will review it soon.'
      );
      return false;
    }
    
    // Add new report
    const newReport: ContentReport = {
      ...reportData,
      reportedAt: new Date().toISOString(),
      status: 'pending'
    };
    
    const updatedReports = [...existingReports, newReport];
    
    // Save to storage
    await AsyncStorage.setItem(
      REPORTED_CONTENT_KEY,
      JSON.stringify(updatedReports)
    );
    
    return true;
  } catch (error) {
    console.error('Error reporting content:', error);
    return false;
  }
};

// Filter content based on blocked users and filter criteria
export const filterContent = async <T extends { userId: string; tag?: string; content?: string }>(
  currentUserId: string,
  content: T[]
): Promise<T[]> => {
  try {
    // Get blocked users
    const blockedUsers = await getBlockedUsers(currentUserId);
    const blockedUserIds = blockedUsers.map(user => user.userId);
    
    // Filter out content from blocked users
    const filteredContent = content.filter(item => !blockedUserIds.includes(item.userId));
    
    // Apply content filtering (basic implementation - can be expanded)
    return filteredContent.filter(item => {
      // Skip items without content
      if (!item.content) return true;
      
      const contentLower = typeof item.content === 'string' 
        ? item.content.toLowerCase() 
        : '';
      
      // List of objectionable terms to filter (example)
      const filteredTerms: string[] = [
        // Add terms to filter here
      ];
      
      // Check if content contains any filtered terms
      return !filteredTerms.some(term => contentLower.includes(term.toLowerCase()));
    });
  } catch (error) {
    console.error('Error filtering content:', error);
    return content; // Return original content on error
  }
};

// Save TOS acceptance status
export const saveTermsAcceptance = async (userId: string): Promise<boolean> => {
  try {
    await AsyncStorage.setItem(
      `${COMMUNITY_TOS_ACCEPTANCE_KEY}_${userId}`,
      JSON.stringify({
        accepted: true,
        acceptedAt: new Date().toISOString()
      })
    );
    return true;
  } catch (error) {
    console.error('Error saving terms acceptance:', error);
    return false;
  }
};

// Check if user has accepted TOS
export const hasAcceptedTerms = async (userId: string): Promise<boolean> => {
  try {
    const acceptanceData = await AsyncStorage.getItem(`${COMMUNITY_TOS_ACCEPTANCE_KEY}_${userId}`);
    if (!acceptanceData) return false;
    
    const { accepted } = JSON.parse(acceptanceData);
    return !!accepted;
  } catch (error) {
    console.error('Error checking terms acceptance:', error);
    return false;
  }
}; 