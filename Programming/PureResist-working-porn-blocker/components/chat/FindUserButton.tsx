import React, { useState, useEffect } from 'react';
import { View, TouchableOpacity, Modal, FlatList, StyleSheet, TextInput, ActivityIndicator, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { COLORS, SPACING, RADIUS, FONTS } from '../../utils/theme';
import { Body, Caption } from '../ui/Typography';
import Card from '../ui/Card';
import { searchUsers as apiSearchUsers } from '../../utils/api';
import { checkDatabaseConnection } from '../../services/api';

type User = {
  _id: string;
  email: string;
  username?: string;
};

type FindUserButtonProps = {
  showModal?: boolean;
  setShowModal?: (show: boolean) => void;
  onSelectUser?: (userId: string) => void;
};

const FindUserButton: React.FC<FindUserButtonProps> = ({ 
  showModal: externalShowModal, 
  setShowModal: externalSetShowModal,
  onSelectUser
}) => {
  const navigation = useNavigation();
  const [internalModalVisible, setInternalModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [serverStatus, setServerStatus] = useState<'checking' | 'connected' | 'error'>('checking');

  // Check server connectivity on component mount
  useEffect(() => {
    const checkServerConnectivity = async () => {
      try {
        const response = await checkDatabaseConnection();
        if (response.success) {
          setServerStatus('connected');

        } else {
          setServerStatus('error');
          console.error('Server connectivity check failed:', response.message);
        }
      } catch (err) {
        setServerStatus('error');
        console.error('Server connectivity check error:', err);
      }
    };

    checkServerConnectivity();
  }, []);

  // Use either external or internal modal state
  const modalVisible = externalShowModal !== undefined ? externalShowModal : internalModalVisible;
  const setModalVisible = externalSetShowModal || setInternalModalVisible;

  const searchUsers = async () => {
    if (!searchQuery.trim()) return;
    
    setLoading(true);
    setError('');
    
    try {

      // Use the API search function
      const response = await apiSearchUsers(searchQuery);

      if (response.success) {
        // Always set users from the response data (it might be an empty array)
        setUsers(response.data || []);
        
        // Only show error if we have a message and no users
        if (response.message && (!response.data || response.data.length === 0)) {
          setError(response.message);
        }
      } else {
        setError(response.message || 'No users found');
        setUsers([]);
      }
    } catch (err) {
      console.error('Error searching users:', err);
      setError('Error searching users. Please try again later.');
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const navigateToUserProfile = (userId: string) => {
    setModalVisible(false);
    // @ts-ignore - Navigation typing issue
    navigation.navigate('UserProfile', { userId });
  };

  const handleUserSelect = (userId: string) => {
    setModalVisible(false);
    if (onSelectUser) {
      onSelectUser(userId);
    } else {
      // Default to navigating to user profile if no select handler
      navigateToUserProfile(userId);
    }
  };

  const renderUserItem = ({ item }: { item: User }) => (
    <TouchableOpacity 
      style={styles.userItem}
      onPress={() => handleUserSelect(item._id)}
    >
      <View style={styles.userAvatar}>
        <Caption style={{ color: COLORS.textPrimary, fontWeight: 'bold' }}>
          {item.username?.[0] || item.email[0]}
        </Caption>
      </View>
      <View style={styles.userInfo}>
        <Body>{item.username || 'User'}</Body>
        <Caption style={styles.userEmail}>{item.email}</Caption>
      </View>
      <View style={styles.userActions}>
        <TouchableOpacity 
          style={styles.chatButton}
          onPress={() => handleUserSelect(item._id)}
        >
          <Ionicons name="chatbubble" size={20} color={COLORS.accent} />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  return (
    <>
      {/* Only show button if using internal state management */}
      {externalShowModal === undefined && (
        <TouchableOpacity
          style={styles.findButton}
          onPress={() => setModalVisible(true)}
        >
          <Ionicons name="search" size={22} color={COLORS.accent} />
          <Body style={styles.findButtonText}>Find Users</Body>
        </TouchableOpacity>
      )}

      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <Card style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Body bold style={styles.modalTitle}>Find Users</Body>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color={COLORS.textPrimary} />
              </TouchableOpacity>
            </View>

            <View style={styles.searchContainer}>
              <TextInput
                style={styles.searchInput}
                placeholder="Search by username or email"
                placeholderTextColor={COLORS.textTertiary}
                value={searchQuery}
                onChangeText={setSearchQuery}
                autoCapitalize="none"
                onSubmitEditing={searchUsers}
              />
              <TouchableOpacity style={styles.searchButton} onPress={searchUsers}>
                <Ionicons name="search" size={20} color={COLORS.background} />
              </TouchableOpacity>
            </View>

            {error ? (
              <Caption style={styles.errorText}>{error}</Caption>
            ) : null}

            {loading ? (
              <ActivityIndicator style={styles.loader} size="large" color={COLORS.accent} />
            ) : (
              users.length > 0 ? (
                <FlatList
                  data={users}
                  renderItem={renderUserItem}
                  keyExtractor={(item) => item._id}
                  contentContainerStyle={styles.userList}
                />
              ) : (
                <Caption style={styles.emptyText}>
                  Search for users by username or email to start a conversation
                </Caption>
              )
            )}
          </Card>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  findButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.accent + '15',
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderRadius: RADIUS.md,
    alignSelf: 'center',
    marginVertical: SPACING.md,
  },
  findButtonText: {
    color: COLORS.accent,
    marginLeft: SPACING.xs,
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.lg,
  },
  modalContent: {
    width: '100%',
    maxHeight: '80%',
    padding: SPACING.md,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  modalTitle: {
    fontSize: FONTS.sizes.lg,
  },
  searchContainer: {
    flexDirection: 'row',
    marginBottom: SPACING.md,
  },
  searchInput: {
    flex: 1,
    backgroundColor: COLORS.cardLight,
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    color: COLORS.textPrimary,
    marginRight: SPACING.xs,
    fontSize: FONTS.sizes.md,
  },
  searchButton: {
    backgroundColor: COLORS.accent,
    borderRadius: RADIUS.md,
    padding: SPACING.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },
  userList: {
    marginTop: SPACING.sm,
  },
  userItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.xs,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.cardLight,
  },
  userAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.accent,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.sm,
  },
  userInfo: {
    flex: 1,
  },
  userEmail: {
    color: COLORS.textTertiary,
    fontSize: FONTS.sizes.sm,
  },
  userActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  chatButton: {
    padding: SPACING.xs,
    marginRight: SPACING.xs,
  },
  profileButton: {
    padding: SPACING.xs,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: SPACING.xl,
    color: COLORS.textSecondary,
  },
  errorText: {
    color: COLORS.danger,
    textAlign: 'center',
    marginBottom: SPACING.sm,
  },
  loader: {
    marginTop: SPACING.xl,
  },
  serverStatusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.warning + '20',
    padding: SPACING.sm,
    borderRadius: RADIUS.sm,
    marginBottom: SPACING.sm,
  },
  serverStatusText: {
    color: COLORS.warning,
    marginLeft: SPACING.xs,
    flex: 1,
  },
});

export default FindUserButton; 