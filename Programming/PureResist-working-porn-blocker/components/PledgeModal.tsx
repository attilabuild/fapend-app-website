import React from 'react';
import { Modal, View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS, SPACING, RADIUS } from '../utils/theme';

const TIPS = [
  {
    icon: <Ionicons name="checkmark-circle" size={24} color={COLORS.accent} />,
    title: 'One Day at a Time',
    desc: 'Your pledge is just for today. Focus on making it through this day only.'
  },
  {
    icon: <MaterialCommunityIcons name="sparkles" size={24} color={COLORS.accent} />,
    title: 'Stay Natural',
    desc: 'Go about your day as usual. After pledging, trust yourself and keep moving forward.'
  },
  {
    icon: <MaterialCommunityIcons name="crown-outline" size={24} color={COLORS.accent} />,
    title: 'Progress is Possible',
    desc: 'Every day you pledge, you build strength. The journey gets easier with each step.'
  }
];

const PledgeModal = ({ visible, onClose, onPledge }) => (
  <Modal visible={visible} transparent animationType="fade">
    <View style={styles.overlay}>
      <View style={styles.modalContent}>
        <TouchableOpacity style={styles.closeButton} onPress={onClose}>
          <Ionicons name="close" size={28} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Ionicons name="hand-left-outline" size={96} color={COLORS.textSecondary} style={styles.handIcon} />
        <Text style={styles.title}>Pledge Sobriety Today</Text>
        <Text style={styles.desc}>Make a commitment to yourself not to goon for today.</Text>
        <View style={styles.tipsCard}>
          {TIPS.map((tip, i) => (
            <View key={i} style={styles.tipRow}>
              <View style={styles.tipIcon}>{tip.icon}</View>
              <Text style={styles.tipTitle}>{tip.title}</Text>
              <Text style={styles.tipDesc}>{tip.desc}</Text>
            </View>
          ))}
        </View>
        <TouchableOpacity style={styles.pledgeButton} onPress={onPledge}>
          <Text style={styles.pledgeButtonText}>Pledge Now</Text>
        </TouchableOpacity>
      </View>
    </View>
  </Modal>
);

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: COLORS.background,
    borderRadius: RADIUS.lg,
    padding: SPACING.xl,
    width: '90%',
    alignItems: 'center',
    position: 'relative',
  },
  closeButton: {
    position: 'absolute',
    left: 16,
    top: 16,
    zIndex: 2,
  },
  handIcon: {
    marginTop: SPACING.lg,
    marginBottom: SPACING.lg,
  },
  title: {
    color: COLORS.textPrimary,
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: SPACING.md,
  },
  desc: {
    color: COLORS.textSecondary,
    fontSize: 16,
    textAlign: 'center',
    marginBottom: SPACING.lg,
  },
  tipsCard: {
    backgroundColor: COLORS.cardDark,
    borderRadius: RADIUS.md,
    padding: SPACING.lg,
    width: '100%',
    marginBottom: SPACING.xl,
  },
  tipRow: {
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  tipIcon: {
    marginBottom: SPACING.sm,
  },
  tipTitle: {
    color: COLORS.textPrimary,
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 2,
    textAlign: 'center',
  },
  tipDesc: {
    color: COLORS.textSecondary,
    fontSize: 14,
    marginBottom: 2,
    textAlign: 'center',
  },
  pledgeButton: {
    backgroundColor: COLORS.textPrimary,
    borderRadius: 32,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.xl,
    alignItems: 'center',
    width: '100%',
  },
  pledgeButtonText: {
    color: COLORS.background,
    fontWeight: 'bold',
    fontSize: 18,
  },
});

export default PledgeModal; 