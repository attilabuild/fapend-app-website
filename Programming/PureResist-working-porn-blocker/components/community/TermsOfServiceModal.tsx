import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Modal, 
  ScrollView, 
  TouchableOpacity,
  Alert
} from 'react-native';
import { COLORS, SPACING, RADIUS, FONTS } from '../../utils/theme';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface TermsOfServiceModalProps {
  visible: boolean;
  onAccept: () => void;
  onDecline: () => void;
}

const TOS_KEY = 'community_tos_accepted';

export const checkTOSAccepted = async (): Promise<boolean> => {
  try {
    const value = await AsyncStorage.getItem(TOS_KEY);
    return value === 'true';
  } catch (error) {
    console.error('Error checking TOS acceptance:', error);
    return false;
  }
};

export const setTOSAccepted = async (): Promise<void> => {
  try {
    await AsyncStorage.setItem(TOS_KEY, 'true');
  } catch (error) {
    console.error('Error saving TOS acceptance:', error);
  }
};

const TermsOfServiceModal: React.FC<TermsOfServiceModalProps> = ({
  visible,
  onAccept,
  onDecline
}) => {
  const handleAccept = async () => {
    await setTOSAccepted();
    onAccept();
  };

  const handleDecline = () => {
    Alert.alert(
      "Community Access Denied",
      "You must accept the Terms of Service to access the community features.",
      [{ text: "OK", onPress: onDecline }]
    );
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={handleDecline}
    >
      <View style={styles.centeredView}>
        <View style={styles.modalView}>
          <View style={styles.header}>
            <Text style={styles.title}>Community Guidelines</Text>
          </View>

          <ScrollView style={styles.scrollView}>
            <Text style={styles.sectionTitle}>Terms of Service</Text>
            
            <Text style={styles.paragraph}>
              Welcome to our community. By using this feature, you agree to abide by these guidelines designed to keep our community safe and supportive.
            </Text>

            <Text style={styles.sectionTitle}>Zero Tolerance Policy</Text>
            <Text style={styles.paragraph}>
              We have a zero-tolerance policy for objectionable content or abusive behavior. This includes but is not limited to:
            </Text>
            <View style={styles.bulletList}>
              <Text style={styles.bulletItem}>• Harassment or bullying</Text>
              <Text style={styles.bulletItem}>• Hate speech or discrimination</Text>
              <Text style={styles.bulletItem}>• Sexually explicit content</Text>
              <Text style={styles.bulletItem}>• Violence or threats</Text>
              <Text style={styles.bulletItem}>• Illegal activities</Text>
              <Text style={styles.bulletItem}>• Spam or misleading content</Text>
            </View>

            <Text style={styles.sectionTitle}>Content Moderation</Text>
            <Text style={styles.paragraph}>
              All content is subject to moderation. Our system automatically filters objectionable content, but we also rely on community reporting.
            </Text>
            
            <Text style={styles.paragraph}>
              You can report any inappropriate content by using the flag button on posts or comments. Our team commits to reviewing and acting on reports within 24 hours.
            </Text>

            <Text style={styles.sectionTitle}>Blocking Users</Text>
            <Text style={styles.paragraph}>
              If you encounter an abusive user, you can block them from your profile page. This will prevent them from interacting with your content and messaging you.
            </Text>

            <Text style={styles.sectionTitle}>Enforcement</Text>
            <Text style={styles.paragraph}>
              Users who violate these guidelines will be subject to:
            </Text>
            <View style={styles.bulletList}>
              <Text style={styles.bulletItem}>• Content removal</Text>
              <Text style={styles.bulletItem}>• Temporary suspension</Text>
              <Text style={styles.bulletItem}>• Permanent ban for serious violations</Text>
            </View>

            <Text style={styles.paragraph}>
              By accepting these terms, you acknowledge that you have read and understand our Community Guidelines, and you agree to abide by them while using the community features.
            </Text>
          </ScrollView>

          <View style={styles.buttonsContainer}>
            <TouchableOpacity 
              style={[styles.button, styles.declineButton]} 
              onPress={handleDecline}
            >
              <Text style={styles.declineButtonText}>Decline</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.button, styles.acceptButton]} 
              onPress={handleAccept}
            >
              <Text style={styles.acceptButtonText}>I Accept</Text>
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
    maxHeight: '80%',
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
    padding: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.cardDark,
    backgroundColor: COLORS.accent,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.primary,
    textAlign: 'center',
  },
  scrollView: {
    padding: SPACING.md,
    maxHeight: 400,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginTop: SPACING.md,
    marginBottom: SPACING.sm,
  },
  paragraph: {
    fontSize: 16,
    color: COLORS.textSecondary,
    marginBottom: SPACING.md,
    lineHeight: 22,
  },
  bulletList: {
    marginLeft: SPACING.sm,
    marginBottom: SPACING.md,
  },
  bulletItem: {
    fontSize: 16,
    color: COLORS.textSecondary,
    marginBottom: 8,
    lineHeight: 22,
  },
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.cardDark,
  },
  button: {
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    borderRadius: RADIUS.md,
    elevation: 2,
    flex: 1,
    marginHorizontal: 5,
    alignItems: 'center',
  },
  acceptButton: {
    backgroundColor: COLORS.accent,
  },
  declineButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: COLORS.cardDark,
  },
  acceptButtonText: {
    color: COLORS.primary,
    fontWeight: 'bold',
    fontSize: 16,
  },
  declineButtonText: {
    color: COLORS.textSecondary,
    fontSize: 16,
  },
});

export default TermsOfServiceModal; 