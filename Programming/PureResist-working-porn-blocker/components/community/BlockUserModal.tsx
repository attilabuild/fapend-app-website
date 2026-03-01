import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Modal, 
  TouchableOpacity,
  Alert
} from 'react-native';
import { COLORS, SPACING, RADIUS } from '../../utils/theme';
import { Ionicons } from '@expo/vector-icons';

interface BlockUserModalProps {
  visible: boolean;
  onClose: () => void;
  onBlock: () => void;
  username: string;
}

const BlockUserModal: React.FC<BlockUserModalProps> = ({
  visible,
  onClose,
  onBlock,
  username
}) => {
  const handleBlock = () => {
    onBlock();
    onClose();

    // Show confirmation
    Alert.alert(
      'User Blocked',
      `You have successfully blocked ${username}. They will no longer be able to interact with you or see your content.`,
      [{ text: 'OK' }]
    );
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.centeredView}>
        <View style={styles.modalView}>
          <View style={styles.header}>
            <Text style={styles.title}>Block User</Text>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Ionicons name="close" size={24} color={COLORS.textSecondary} />
            </TouchableOpacity>
          </View>

          <View style={styles.content}>
            <Ionicons name="person-remove" size={48} color={COLORS.danger} style={styles.icon} />
            
            <Text style={styles.message}>
              Are you sure you want to block <Text style={styles.username}>{username}</Text>?
            </Text>
            
            <Text style={styles.description}>
              When you block someone:
            </Text>
            
            <View style={styles.bulletList}>
              <View style={styles.bulletItem}>
                <Ionicons name="remove-circle" size={16} color={COLORS.danger} style={styles.bulletIcon} />
                <Text style={styles.bulletText}>They won't be able to see your posts or comments</Text>
              </View>
              
              <View style={styles.bulletItem}>
                <Ionicons name="remove-circle" size={16} color={COLORS.danger} style={styles.bulletIcon} />
                <Text style={styles.bulletText}>They won't be able to message you</Text>
              </View>
              
              <View style={styles.bulletItem}>
                <Ionicons name="remove-circle" size={16} color={COLORS.danger} style={styles.bulletIcon} />
                <Text style={styles.bulletText}>You won't see their content or messages</Text>
              </View>
            </View>
          </View>

          <View style={styles.footer}>
            <TouchableOpacity 
              style={styles.cancelButton} 
              onPress={onClose}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.blockButton} 
              onPress={handleBlock}
            >
              <Text style={styles.blockButtonText}>Block User</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  modalView: {
    width: '90%',
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.lg,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.cardDark,
    backgroundColor: COLORS.card,
  },
  closeButton: {
    padding: SPACING.xs,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
  },
  content: {
    padding: SPACING.lg,
    alignItems: 'center',
  },
  icon: {
    marginBottom: SPACING.md,
  },
  message: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.textPrimary,
    textAlign: 'center',
    marginBottom: SPACING.md,
  },
  username: {
    color: COLORS.accent,
    fontWeight: 'bold',
  },
  description: {
    fontSize: 16,
    color: COLORS.textSecondary,
    marginBottom: SPACING.sm,
    textAlign: 'left',
    alignSelf: 'flex-start',
  },
  bulletList: {
    width: '100%',
    marginBottom: SPACING.md,
  },
  bulletItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: SPACING.sm,
  },
  bulletIcon: {
    marginRight: SPACING.sm,
    marginTop: 2,
  },
  bulletText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    flex: 1,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.cardDark,
  },
  cancelButton: {
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.cardDark,
    minWidth: 100,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: COLORS.textSecondary,
    fontSize: 16,
  },
  blockButton: {
    backgroundColor: COLORS.danger,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    borderRadius: RADIUS.md,
    minWidth: 150,
    alignItems: 'center',
  },
  blockButtonText: {
    color: COLORS.textPrimary,
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default BlockUserModal; 