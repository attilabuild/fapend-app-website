import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Modal, 
  TouchableOpacity,
  Animated,
  Easing
} from 'react-native';
import { COLORS, SPACING, RADIUS } from '../utils/theme';
import { Ionicons } from '@expo/vector-icons';
import LottieIcon from './ui/LottieIcon';
import { Title, Body } from './ui/Typography';

interface AchievementModalProps {
  visible: boolean;
  onClose: () => void;
  achievement: {
    title: string;
    description: string;
    category: 'streak' | 'journal' | 'learning' | 'time';
  } | null;
}

const AchievementModal: React.FC<AchievementModalProps> = ({
  visible,
  onClose,
  achievement
}) => {

  const [scaleAnim] = React.useState(new Animated.Value(0));
  
  React.useEffect(() => {

    if (visible) {
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
        tension: 50,
        friction: 7
      }).start();
    } else {
      scaleAnim.setValue(0);
    }
  }, [visible]);

  if (!achievement) {

    return null;
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        {/* Confetti animation in the background */}
        <View style={styles.confettiContainer}>
          <LottieIcon
            source={require('../assets/celebration.json')}
            size={400}
          />
        </View>

        <Animated.View 
          style={[
            styles.modalContent,
            {
              transform: [{ scale: scaleAnim }]
            }
          ]}
        >
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Ionicons name="close" size={24} color={COLORS.textSecondary} />
          </TouchableOpacity>

          <View style={styles.iconContainer}>
            <View style={styles.achievementIconWrapper}>
              <LottieIcon
                source={require('../assets/celebration.json')}
                size={160}
              />
            </View>
          </View>

          <Title style={styles.title}>Achievement Unlocked!</Title>
          <Title style={styles.achievementTitle}>{achievement.title}</Title>
          <Body style={styles.description}>{achievement.description}</Body>

          <TouchableOpacity 
            style={styles.continueButton} 
            onPress={onClose}
          >
            <Text style={styles.continueButtonText}>Continue</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  confettiContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    pointerEvents: 'none',
  },
  modalContent: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.lg,
    padding: SPACING.xl,
    width: '85%',
    alignItems: 'center',
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  closeButton: {
    position: 'absolute',
    right: SPACING.md,
    top: SPACING.md,
    zIndex: 1,
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.xl,
    marginTop: SPACING.xl,
  },
  achievementIconWrapper: {
    position: 'relative',
    width: 160,
    height: 160,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.background,
    borderRadius: RADIUS.round,
    overflow: 'hidden',
  },
  title: {
    color: COLORS.accent,
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: SPACING.sm,
    textAlign: 'center',
  },
  achievementTitle: {
    color: COLORS.textPrimary,
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: SPACING.sm,
    textAlign: 'center',
  },
  description: {
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: SPACING.xl,
  },
  continueButton: {
    backgroundColor: COLORS.accent,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.xl,
    borderRadius: RADIUS.round,
    minWidth: 150,
    alignItems: 'center',
  },
  continueButtonText: {
    color: COLORS.primary,
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default AchievementModal; 