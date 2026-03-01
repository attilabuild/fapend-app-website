import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Modal, 
  TouchableOpacity,
  TextInput,
  Alert
} from 'react-native';
import { COLORS, SPACING, RADIUS } from '../../utils/theme';
import { Ionicons } from '@expo/vector-icons';

interface ReportContentModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (reason: string, details: string) => void;
  contentType: 'post' | 'comment' | 'user';
}

const ReportContentModal: React.FC<ReportContentModalProps> = ({
  visible,
  onClose,
  onSubmit,
  contentType
}) => {
  const [selectedReason, setSelectedReason] = useState<string>('');
  const [details, setDetails] = useState<string>('');

  const getReasons = () => {
    const commonReasons = [
      'Harassment or bullying',
      'Hate speech',
      'Sexually explicit content',
      'Violence or threats',
      'Spam or misleading',
      'Other'
    ];

    // Add user-specific reasons if reporting a user
    if (contentType === 'user') {
      return [...commonReasons, 'Fake profile', 'Impersonation'];
    }

    return commonReasons;
  };

  const handleSubmit = () => {
    if (!selectedReason) {
      Alert.alert('Error', 'Please select a reason for reporting');
      return;
    }

    onSubmit(selectedReason, details);
    setSelectedReason('');
    setDetails('');
    onClose();

    // Show confirmation
    Alert.alert(
      'Report Submitted',
      'Thank you for helping keep our community safe. We will review this report within 24 hours.',
      [{ text: 'OK' }]
    );
  };

  const getTitle = () => {
    switch (contentType) {
      case 'post':
        return 'Report Post';
      case 'comment':
        return 'Report Comment';
      case 'user':
        return 'Report User';
      default:
        return 'Report Content';
    }
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
            <Text style={styles.title}>{getTitle()}</Text>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Ionicons name="close" size={24} color={COLORS.textSecondary} />
            </TouchableOpacity>
          </View>

          <View style={styles.content}>
            <Text style={styles.sectionTitle}>Why are you reporting this {contentType}?</Text>
            
            {getReasons().map((reason) => (
              <TouchableOpacity
                key={reason}
                style={[
                  styles.reasonItem,
                  selectedReason === reason && styles.selectedReasonItem
                ]}
                onPress={() => setSelectedReason(reason)}
              >
                <Text style={[
                  styles.reasonText,
                  selectedReason === reason && styles.selectedReasonText
                ]}>
                  {reason}
                </Text>
                {selectedReason === reason && (
                  <Ionicons name="checkmark-circle" size={20} color={COLORS.accent} />
                )}
              </TouchableOpacity>
            ))}

            <Text style={styles.sectionTitle}>Additional details (optional)</Text>
            <TextInput
              style={styles.detailsInput}
              placeholder="Please provide any additional information..."
              placeholderTextColor={COLORS.textTertiary}
              multiline
              numberOfLines={4}
              value={details}
              onChangeText={setDetails}
            />
          </View>

          <View style={styles.footer}>
            <TouchableOpacity 
              style={styles.cancelButton} 
              onPress={onClose}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[
                styles.submitButton,
                !selectedReason && styles.disabledButton
              ]} 
              onPress={handleSubmit}
              disabled={!selectedReason}
            >
              <Text style={styles.submitButtonText}>Submit Report</Text>
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
    padding: SPACING.md,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: SPACING.sm,
    marginTop: SPACING.md,
  },
  reasonItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.cardDark,
    marginBottom: SPACING.xs,
  },
  selectedReasonItem: {
    borderColor: COLORS.accent,
    backgroundColor: `${COLORS.accent}20`, // Semi-transparent accent color
  },
  reasonText: {
    fontSize: 16,
    color: COLORS.textSecondary,
  },
  selectedReasonText: {
    color: COLORS.accent,
    fontWeight: '500',
  },
  detailsInput: {
    borderWidth: 1,
    borderColor: COLORS.cardDark,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    color: COLORS.textPrimary,
    backgroundColor: COLORS.cardLight,
    textAlignVertical: 'top',
    minHeight: 120,
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
  submitButton: {
    backgroundColor: COLORS.accent,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    borderRadius: RADIUS.md,
    minWidth: 150,
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: COLORS.cardLight,
    opacity: 0.6,
  },
  submitButtonText: {
    color: COLORS.primary,
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default ReportContentModal; 