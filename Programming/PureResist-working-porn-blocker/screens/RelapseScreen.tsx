import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, TextInput, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useAuthStore, useStreakStore } from '../hooks/useStore';
import { Title, Subtitle, Body, Caption } from '../components/ui/Typography';
import Card from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { COLORS, SPACING, RADIUS, FONTS } from '../utils/theme';

type RootStackParamList = {
  Home: undefined;
  Relapse: undefined;
};

type Props = NativeStackScreenProps<RootStackParamList, 'Relapse'>;
const RelapseScreen: React.FC<Props> = ({ navigation }) => {
  const [reason, setReason] = useState('');
  const [notes, setNotes] = useState('');
  
  const { user } = useAuthStore();
  const { logRelapse, loading } = useStreakStore();
  
  const handleRelapse = async () => {
    if (!user) return;
    
    // Confirm the action
    Alert.alert(
      "Are you sure?",
      "Logging a relapse will reset your current streak. This action cannot be undone.",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        { 
          text: "Yes, Log Relapse", 
          style: "destructive",
          onPress: async () => {
            const success = await logRelapse(user._id, reason.split(',').map(t => t.trim()), undefined, notes);
            if (success) {
              // First go back to previous screen
              navigation.goBack();
              
              // Then navigate to Home screen after a short delay using reset to clear the stack
              setTimeout(() => {
                navigation.reset({
                  index: 0,
                  routes: [{ name: 'Main' }],
                });
              }, 1000);
            }
          }
        }
      ]
    );
  };
  
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Title>Log a Relapse</Title>
        <Subtitle style={styles.subtitle}>
          Remember, every setback is a setup for a comeback
        </Subtitle>
      </View>
      
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <Card style={styles.contentCard}>
            <Body style={styles.sectionTitle}>
              What triggered the relapse?
            </Body>
            
            <TextInput
              style={styles.reasonInput}
              value={reason}
              onChangeText={setReason}
              placeholder="e.g., stress, boredom, trigger, etc."
              placeholderTextColor={COLORS.textTertiary}
            />
            
            <Body style={styles.sectionTitle}>
              Lessons learned (optional)
            </Body>
            
            <TextInput
              style={styles.notesInput}
              value={notes}
              onChangeText={setNotes}
              placeholder="What did you learn from this experience?"
              placeholderTextColor={COLORS.textTertiary}
              multiline
              textAlignVertical="top"
            />
            
            <Caption style={styles.disclaimer}>
              Logging this relapse will reset your current streak, but it's an important part of the growth process. Stay strong!
            </Caption>
            
            <Button
              title="Log Relapse"
              onPress={handleRelapse}
              variant="danger"
              loading={loading}
              style={styles.submitButton}
              fullWidth
            />
            
            <Button
              title="Cancel"
              onPress={() => navigation.goBack()}
              variant="outline"
              style={styles.cancelButton}
              fullWidth
            />
          </Card>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    paddingTop: SPACING.lg,
    paddingBottom: SPACING.md,
    paddingHorizontal: SPACING.md,
    alignItems: 'center',
  },
  subtitle: {
    marginTop: SPACING.xs,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    padding: SPACING.md,
    paddingBottom: SPACING.xl,
  },
  contentCard: {
    padding: SPACING.lg,
  },
  sectionTitle: {
    fontWeight: 'bold',
    marginBottom: SPACING.sm,
  },
  reasonInput: {
    backgroundColor: COLORS.cardLight,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    height: 50,
    fontSize: FONTS.sizes.md,
    color: COLORS.textPrimary,
    marginBottom: SPACING.lg,
  },
  notesInput: {
    backgroundColor: COLORS.cardLight,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    height: 120,
    fontSize: FONTS.sizes.md,
    color: COLORS.textPrimary,
    marginBottom: SPACING.lg,
  },
  disclaimer: {
    color: COLORS.textSecondary,
    fontStyle: 'italic',
    marginBottom: SPACING.lg,
    lineHeight: 20,
  },
  submitButton: {
    marginBottom: SPACING.md,
  },
  cancelButton: {
  },
});

export default RelapseScreen; 